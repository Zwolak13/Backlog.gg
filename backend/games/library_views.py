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
        "review_text": ug.review_text,
        "review_visibility": ug.review_visibility,
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

    valid_statuses = {c[0] for c in UserGame.STATUS_CHOICES}
    if status not in valid_statuses:
        return Response({"error": f"status must be one of: {', '.join(valid_statuses)}"}, status=400)

    rating = request.data.get("rating")
    if rating is not None:
        try:
            rating = int(rating)
        except (TypeError, ValueError):
            return Response({"error": "rating must be an integer"}, status=400)
        if not (1 <= rating <= 10):
            return Response({"error": "rating must be between 1 and 10"}, status=400)

    visibility = request.data.get("review_visibility", "global")
    valid_visibilities = {c[0] for c in UserGame.VISIBILITY_CHOICES}
    if visibility not in valid_visibilities:
        return Response({"error": f"review_visibility must be one of: {', '.join(valid_visibilities)}"}, status=400)

    game, _ = Game.objects.get_or_create(
        id=game_id,
        defaults={
            "name": request.data.get("game_name", ""),
            "slug": request.data.get("game_slug", str(game_id)),
            "background_image": request.data.get("game_image", ""),
            "metacritic": request.data.get("game_metacritic"),
        },
    )

    ug, created = UserGame.objects.update_or_create(
        user=request.user,
        game=game,
        defaults={
            "status": status,
            "rating": rating,
            "is_favourite": request.data.get("is_favourite", False),
            "hours_played": request.data.get("hours_played"),
            "review_text": request.data.get("review_text"),
            "review_visibility": visibility,
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

    patch = dict(request.data)

    if "status" in patch:
        valid_statuses = {c[0] for c in UserGame.STATUS_CHOICES}
        if patch["status"] not in valid_statuses:
            return Response({"error": f"status must be one of: {', '.join(valid_statuses)}"}, status=400)

    if "rating" in patch and patch["rating"] is not None:
        try:
            patch["rating"] = int(patch["rating"])
        except (TypeError, ValueError):
            return Response({"error": "rating must be an integer"}, status=400)
        if not (1 <= patch["rating"] <= 10):
            return Response({"error": "rating must be between 1 and 10"}, status=400)

    if "review_visibility" in patch:
        valid_visibilities = {c[0] for c in UserGame.VISIBILITY_CHOICES}
        if patch["review_visibility"] not in valid_visibilities:
            return Response({"error": f"review_visibility must be one of: {', '.join(valid_visibilities)}"}, status=400)

    for field in ("status", "rating", "is_favourite", "hours_played", "review_text", "review_visibility"):
        if field in patch:
            setattr(ug, field, patch[field])
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
def library_check_view(request, game_id):
    try:
        ug = UserGame.objects.select_related("game").get(user=request.user, game_id=game_id)
        return Response({"in_library": True, "entry": serialize_user_game(ug)})
    except UserGame.DoesNotExist:
        return Response({"in_library": False, "entry": None})


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


@api_view(["GET"])
def public_library_view(request, username):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    user = get_object_or_404(User, username=username)
    status_filter = request.GET.get("status")
    qs = UserGame.objects.filter(user=user).select_related("game").order_by("-updated_at")
    if status_filter:
        qs = qs.filter(status=status_filter)
    return Response({"games": [serialize_user_game(ug) for ug in qs]})


@api_view(["GET"])
def public_library_stats_view(request, username):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    user = get_object_or_404(User, username=username)
    qs = UserGame.objects.filter(user=user)
    stats = {
        "backlog": qs.filter(status="backlog").count(),
        "playing": qs.filter(status="playing").count(),
        "completed": qs.filter(status="completed").count(),
        "wishlist": qs.filter(status="wishlist").count(),
    }
    stats["total"] = sum(stats.values())
    return Response(stats)


@api_view(["GET"])
def public_library_recent_view(request, username):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    user = get_object_or_404(User, username=username)
    qs = UserGame.objects.filter(user=user).select_related("game").order_by("-updated_at")[:10]
    return Response({"games": [serialize_user_game(ug) for ug in qs]})


@api_view(["GET"])
def public_library_favourites_view(request, username):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    user = get_object_or_404(User, username=username)
    qs = UserGame.objects.filter(user=user, is_favourite=True).select_related("game").order_by("-updated_at")
    return Response({"games": [serialize_user_game(ug) for ug in qs]})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def friends_ratings_view(request, game_id):
    from users.friendships import get_friend_ids
    friend_ids = get_friend_ids(request.user)
    qs = (
        UserGame.objects
        .filter(user_id__in=friend_ids, game_id=game_id)
        .select_related("user")
    )
    data = [
        {
            "username": ug.user.username,
            "avatar_url": ug.user.avatar_url,
            "rating": ug.rating,
            "status": ug.status,
        }
        for ug in qs
    ]
    return Response({"ratings": data})


@api_view(["GET"])
def game_reviews_view(request, game_id):
    from django.db.models import Avg, Count, Q
    from users.friendships import get_friend_ids

    game = get_object_or_404(Game, id=game_id)

    score_data = (
        UserGame.objects
        .filter(game=game, rating__isnull=False)
        .aggregate(avg=Avg("rating"), count=Count("id"))
    )

    qs = (
        UserGame.objects
        .filter(game=game, review_text__isnull=False)
        .exclude(review_text="")
        .select_related("user")
    )

    if request.user.is_authenticated:
        friend_ids = get_friend_ids(request.user)
        qs = qs.filter(
            Q(review_visibility="global") |
            Q(user_id__in=friend_ids) |
            Q(user=request.user)
        )
    else:
        qs = qs.filter(review_visibility="global")

    reviews = [
        {
            "username": ug.user.username,
            "avatar_url": ug.user.avatar_url,
            "rating": ug.rating,
            "review_text": ug.review_text,
            "review_visibility": ug.review_visibility,
            "status": ug.status,
            "updated_at": ug.updated_at,
        }
        for ug in qs.order_by("-updated_at")
    ]

    avg = score_data["avg"]
    return Response({
        "reviews": reviews,
        "community_score": {
            "avg": round(avg, 1) if avg is not None else None,
            "count": score_data["count"],
        },
    })
