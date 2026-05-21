from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.friendships import get_friend_ids

from .bundles import DEFAULT_BUNDLE_LIMIT, get_dashboard_bundles
from .deals import DEFAULT_LIMIT, get_dashboard_deals, get_game_deal
from .models import UserGame
from .steam import normalize_currency


def _safe_limit(raw_value, default=20, maximum=50):
    try:
        value = int(raw_value)
    except (TypeError, ValueError):
        value = default
    return min(max(value, 1), maximum)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def deals_view(request):
    limit = _safe_limit(request.GET.get("limit"), default=DEFAULT_LIMIT, maximum=24)
    currency = normalize_currency(request.GET.get("currency"))
    return Response({"deals": get_dashboard_deals(limit, currency=currency)})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def bundles_view(request):
    limit = _safe_limit(request.GET.get("limit"), default=DEFAULT_BUNDLE_LIMIT, maximum=18)
    currency = normalize_currency(request.GET.get("currency"))
    return Response({"bundles": get_dashboard_bundles(limit, currency=currency)})


def _base_activity(ug):
    return {
        "username": ug.user.username,
        "avatar_url": ug.user.avatar_url,
        "game": {
            "id": ug.game.id,
            "slug": ug.game.slug,
            "title": ug.game.name,
            "cover_image": ug.game.background_image,
        },
    }


def _activity_events(ug):
    base = _base_activity(ug)
    events = [
        {
            **base,
            "id": f"library-{ug.id}",
            "type": "added_to_wishlist" if ug.status == "wishlist" else "added_to_library",
            "timestamp": ug.created_at,
            "extra": {"status": ug.status},
        }
    ]

    if ug.rating is not None:
        events.append({
            **base,
            "id": f"rating-{ug.id}",
            "type": "rated_game",
            "timestamp": ug.updated_at,
            "extra": {"rating": ug.rating},
        })

    if ug.is_favourite:
        events.append({
            **base,
            "id": f"favourite-{ug.id}",
            "type": "added_to_favourites",
            "timestamp": ug.updated_at,
            "extra": {"status": ug.status},
        })

    if ug.review_text:
        events.append({
            **base,
            "id": f"review-{ug.id}",
            "type": "wrote_review",
            "timestamp": ug.updated_at,
            "extra": {"rating": ug.rating, "review_text": ug.review_text},
        })

    return events


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def own_activity_view(request):
    limit = _safe_limit(request.GET.get("limit"), default=30, maximum=100)
    rows = (
        UserGame.objects
        .filter(user=request.user)
        .select_related("user", "game")
        .order_by("-updated_at")[:limit * 4]
    )
    events = []
    for ug in rows:
        events.extend(_activity_events(ug))
    events.sort(key=lambda e: e["timestamp"], reverse=True)
    return Response({"activity": events[:limit]})


@api_view(["GET"])
def public_user_activity_view(request, username):
    from django.contrib.auth import get_user_model
    from django.shortcuts import get_object_or_404
    User = get_user_model()
    user = get_object_or_404(User, username=username)
    limit = _safe_limit(request.GET.get("limit"), default=30, maximum=100)
    rows = (
        UserGame.objects
        .filter(user=user)
        .select_related("user", "game")
        .order_by("-updated_at")[:limit * 4]
    )
    events = []
    for ug in rows:
        events.extend(_activity_events(ug))
    events.sort(key=lambda e: e["timestamp"], reverse=True)
    return Response({"activity": events[:limit]})


@api_view(["GET"])
def game_price_view(request, app_id):
    currency = normalize_currency(request.GET.get("currency", "USD"))
    deal = get_game_deal(app_id, currency)
    if not deal:
        return Response({"deal": None})
    return Response({"deal": deal})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def friends_activity_view(request):
    limit = _safe_limit(request.GET.get("limit"), default=20, maximum=50)
    friend_ids = get_friend_ids(request.user)

    if not friend_ids:
        return Response({"activity": []})

    rows = (
        UserGame.objects
        .filter(user_id__in=friend_ids)
        .select_related("user", "game")
        .order_by("-updated_at")[: limit * 3]
    )

    events = []
    for user_game in rows:
        events.extend(_activity_events(user_game))

    events.sort(key=lambda event: event["timestamp"], reverse=True)
    return Response({"activity": events[:limit]})
