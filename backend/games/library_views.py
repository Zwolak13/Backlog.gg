from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Game, UserGame


def serialize_user_game(ug):
    return {
        "id": ug.id,
        "status": ug.status,
        "rating": ug.rating,
        "is_favourite": ug.is_favourite,
        "hours_played": ug.hours_played,
        "created_at": ug.created_at,
        "updated_at": ug.updated_at,
        "game": {
            "id": ug.game.id,
            "slug": ug.game.slug,
            "name": ug.game.name,
            "background_image": ug.game.background_image,
            "metacritic": ug.game.metacritic,
            "released": ug.game.released,
        },
    }


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def library_view(request):
    if request.method == "GET":
        status_filter = request.GET.get("status")
        qs = UserGame.objects.filter(user=request.user).select_related("game").order_by("-updated_at")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response({"games": [serialize_user_game(ug) for ug in qs]})

    game_id = request.data.get("game_id")
    status = request.data.get("status")

    if not game_id or not status:
        return Response({"error": "game_id and status are required"}, status=400)

    game = get_object_or_404(Game, pk=game_id)

    ug, created = UserGame.objects.update_or_create(
        user=request.user,
        game=game,
        defaults={
            "status": status,
            "rating": request.data.get("rating"),
            "is_favourite": request.data.get("is_favourite", False),
            "hours_played": request.data.get("hours_played"),
        },
    )
    return Response(serialize_user_game(ug), status=201 if created else 200)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def library_item_view(request, pk):
    ug = get_object_or_404(UserGame, pk=pk, user=request.user)

    if request.method == "DELETE":
        ug.delete()
        return Response({"message": "Removed from library"})

    for field in ("status", "rating", "is_favourite", "hours_played"):
        if field in request.data:
            setattr(ug, field, request.data[field])
    ug.save()
    return Response(serialize_user_game(ug))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def library_recent_view(request):
    qs = (
        UserGame.objects.filter(user=request.user)
        .select_related("game")
        .order_by("-updated_at")[:10]
    )
    return Response({"games": [serialize_user_game(ug) for ug in qs]})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def library_favourites_view(request):
    qs = (
        UserGame.objects.filter(user=request.user, is_favourite=True)
        .select_related("game")
        .order_by("-updated_at")
    )
    return Response({"games": [serialize_user_game(ug) for ug in qs]})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def library_stats_view(request):
    qs = UserGame.objects.filter(user=request.user)
    stats = {
        "backlog": qs.filter(status="backlog").count(),
        "playing": qs.filter(status="playing").count(),
        "completed": qs.filter(status="completed").count(),
        "wishlist": qs.filter(status="wishlist").count(),
    }
    stats["total"] = sum(stats.values())
    return Response(stats)
