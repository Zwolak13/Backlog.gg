import json
import re
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from django.http import JsonResponse, StreamingHttpResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .models import UserGame, ChatSession, ChatMessage
from .steam import search_games, portrait_image


def _build_library_context(user_games):
    completed, playing, backlog, wishlist, favourites = [], [], [], [], []

    for ug in user_games:
        entry = ug.game.name
        if ug.rating:
            entry += f" ({ug.rating}/10)"
        if ug.is_favourite:
            favourites.append(ug.game.name)
        if ug.status == "completed":
            completed.append(entry)
        elif ug.status == "playing":
            playing.append(entry)
        elif ug.status == "backlog":
            backlog.append(entry)
        elif ug.status == "wishlist":
            wishlist.append(entry)

    parts = []
    if completed:
        parts.append(f"Completed: {', '.join(completed)}")
    if playing:
        parts.append(f"Currently playing: {', '.join(playing)}")
    if backlog:
        parts.append(f"In backlog: {', '.join(backlog[:10])}")
    if wishlist:
        parts.append(f"On wishlist: {', '.join(wishlist[:5])}")
    if favourites:
        parts.append(f"Favourites: {', '.join(favourites)}")

    return "\n".join(parts) if parts else "No games in library yet."


def _enrich_with_steam(recommendations: list[dict]) -> list[dict]:
    for rec in recommendations:
        results, _ = search_games(rec.get("name", ""), limit=1, safe=False)
        if results:
            game = results[0]
            rec["steam_appid"] = game["id"]
            rec["background_image"] = portrait_image(game["id"])
            rec["slug"] = game["slug"]
        else:
            rec["background_image"] = None
            rec["slug"] = None
    return recommendations


def _build_system_prompt(library_context: str) -> str:
    return f"""You are GameMatch AI, a game recommendation assistant for Backlog.gg.

The user's game library:
{library_context}

Your role: help users discover new games they'll love. Be conversational and specific — reference their actual games when relevant. Keep responses concise (2-4 sentences). Suggest specific titles when appropriate. Don't use bullet lists unless asked.

IMPORTANT: You only discuss topics related to video games — recommendations, genres, mechanics, comparisons, gaming news, or the user's library. If the user asks about anything unrelated to games (e.g. homework, cooking, politics, coding help, general trivia), politely decline and steer the conversation back to games. Example: "I'm only here to talk games! Ask me what you should play next."."""


def _get_groq_client():
    try:
        from groq import Groq
    except ImportError:
        return None
    api_key = getattr(settings, "GROQ_API_KEY", "")
    if not api_key:
        return None
    return Groq(api_key=api_key)


@api_view(["GET"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def recommendations_view(request):
    user_games = UserGame.objects.filter(user=request.user).select_related("game")

    if not user_games.exists():
        return Response({
            "recommendations": [],
            "message": "Add games to your library to get personalised recommendations.",
        })

    client = _get_groq_client()
    if client is None:
        return Response({
            "recommendations": [],
            "message": "AI recommendations not configured. Add GROQ_API_KEY to backend/.env.",
        })

    library_context = _build_library_context(user_games)
    all_game_names = [ug.game.name for ug in user_games]

    prompt = f"""You are a game recommendation expert. Based on the user's game library, recommend exactly 3 games they haven't played yet.

User's library:
{library_context}

Do NOT recommend any of these games (already in library): {', '.join(all_game_names)}

Respond ONLY with a valid JSON array, no other text, no markdown:
[
  {{
    "name": "Exact Game Title",
    "steam_appid": 123456,
    "reason_tag": "3-4 word hook",
    "reason": "One sentence why, referencing specific games in their library.",
    "description": "One sentence describing what the game is."
  }}
]

Use the actual Steam App ID if you know it with certainty, otherwise use 0."""

    try:
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.6,
        )
        content = completion.choices[0].message.content or ""
        match = re.search(r"\[[\s\S]*\]", content)
        if not match:
            raise ValueError("No JSON array in response")
        recommendations = json.loads(match.group())
        recommendations = _enrich_with_steam(recommendations)
        return Response({"recommendations": recommendations})
    except Exception as exc:
        return Response({"recommendations": [], "error": str(exc)}, status=500)


@api_view(["GET", "POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def sessions_view(request):
    if request.method == "GET":
        sessions = ChatSession.objects.filter(user=request.user)
        data = []
        for s in sessions:
            last = s.messages.last()
            data.append({
                "id": s.id,
                "title": s.title,
                "updated_at": s.updated_at.isoformat(),
                "last_message": last.content[:80] if last else None,
            })
        return Response({"sessions": data})

    session = ChatSession.objects.create(user=request.user)
    return Response({
        "id": session.id,
        "title": session.title,
        "updated_at": session.updated_at.isoformat(),
    }, status=201)


@api_view(["GET", "PATCH", "DELETE"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def session_detail_view(request, session_id):
    session = get_object_or_404(ChatSession, id=session_id, user=request.user)

    if request.method == "GET":
        messages = [
            {"role": m.role, "content": m.content}
            for m in session.messages.all()
        ]
        return Response({"id": session.id, "title": session.title, "messages": messages})

    if request.method == "PATCH":
        title = request.data.get("title", "").strip()
        if title:
            session.title = title[:200]
            session.save(update_fields=["title"])
        return Response({"id": session.id, "title": session.title})

    session.delete()
    return Response(status=204)


@api_view(["POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def chat_view(request):
    message = request.data.get("message", "").strip()
    session_id = request.data.get("session_id")

    if not message:
        return Response({"error": "Message is required."}, status=400)

    client = _get_groq_client()
    if client is None:
        return Response(
            {"error": "AI not configured. Add GROQ_API_KEY to backend/.env."},
            status=503,
        )

    # Get or create session
    if session_id:
        session = get_object_or_404(ChatSession, id=session_id, user=request.user)
    else:
        session = ChatSession.objects.create(user=request.user)

    existing_messages = list(session.messages.all())

    # Auto-title from first user message
    if not existing_messages:
        session.title = message[:60].strip()
        session.save(update_fields=["title"])

    # Save user message
    ChatMessage.objects.create(session=session, role="user", content=message)

    # Build Groq messages
    user_games = UserGame.objects.filter(user=request.user).select_related("game")
    library_context = _build_library_context(user_games)
    system_prompt = _build_system_prompt(library_context)

    groq_messages = [{"role": "system", "content": system_prompt}]
    for m in existing_messages[-10:]:
        groq_messages.append({"role": m.role, "content": m.content})
    groq_messages.append({"role": "user", "content": message})

    try:
        completion = client.chat.completions.create(
            messages=groq_messages,
            model="llama-3.3-70b-versatile",
            temperature=0.75,
            max_tokens=512,
        )
        reply = completion.choices[0].message.content or ""
        ChatMessage.objects.create(session=session, role="assistant", content=reply)
        session.save()  # bumps updated_at
        return Response({"reply": reply, "session_id": session.id, "title": session.title})
    except Exception as exc:
        return Response({"error": str(exc)}, status=500)


@csrf_exempt
@require_POST
def chat_stream_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    message = data.get("message", "").strip()
    session_id = data.get("session_id")

    if not message:
        return JsonResponse({"error": "Message is required."}, status=400)

    client = _get_groq_client()
    if client is None:
        return JsonResponse({"error": "AI not configured."}, status=503)

    if session_id:
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            return JsonResponse({"error": "Session not found"}, status=404)
    else:
        session = ChatSession.objects.create(user=request.user)

    existing_messages = list(session.messages.all())

    if not existing_messages:
        session.title = message[:60].strip()
        session.save(update_fields=["title"])

    ChatMessage.objects.create(session=session, role="user", content=message)

    user_games = UserGame.objects.filter(user=request.user).select_related("game")
    library_context = _build_library_context(user_games)
    system_prompt = _build_system_prompt(library_context)

    groq_messages = [{"role": "system", "content": system_prompt}]
    for m in existing_messages[-10:]:
        groq_messages.append({"role": m.role, "content": m.content})
    groq_messages.append({"role": "user", "content": message})

    def generate():
        full_reply = []
        meta = json.dumps({"type": "meta", "session_id": session.id, "title": session.title})
        yield f"data: {meta}\n\n"
        try:
            stream = client.chat.completions.create(
                messages=groq_messages,
                model="llama-3.3-70b-versatile",
                temperature=0.75,
                max_tokens=512,
                stream=True,
            )
            for chunk in stream:
                token = chunk.choices[0].delta.content
                if token:
                    full_reply.append(token)
                    payload = json.dumps({"type": "token", "text": token})
                    yield f"data: {payload}\n\n"
            complete_reply = "".join(full_reply)
            ChatMessage.objects.create(session=session, role="assistant", content=complete_reply)
            session.save()
        except Exception as exc:
            yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"
        yield "data: [DONE]\n\n"

    response = StreamingHttpResponse(generate(), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response
