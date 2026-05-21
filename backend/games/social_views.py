from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import UserGame


@api_view(["GET"])
def social_reviews_view(request):
    from users.friendships import get_friend_ids

    qs = (
        UserGame.objects
        .filter(review_text__isnull=False)
        .exclude(review_text="")
        .select_related("user", "game")
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

    qs = qs.order_by("-updated_at")[:30]

    return Response({
        "reviews": [
            {
                "username": ug.user.username,
                "avatar_url": ug.user.avatar_url,
                "rating": ug.rating,
                "review_text": ug.review_text,
                "review_visibility": ug.review_visibility,
                "status": ug.status,
                "updated_at": ug.updated_at,
                "game": {
                    "id": ug.game.id,
                    "name": ug.game.name,
                    "slug": ug.game.slug,
                    "background_image": ug.game.background_image,
                },
            }
            for ug in qs
        ]
    })


@api_view(["GET"])
def social_users_view(request):
    from django.contrib.auth import get_user_model
    User = get_user_model()

    q = request.GET.get("q", "").strip()

    if q:
        users = User.objects.filter(username__icontains=q).order_by("username")[:20]
    else:
        users = User.objects.order_by("-date_joined")[:20]

    return Response({
        "users": [
            {
                "username": u.username,
                "avatar_url": u.avatar_url,
                "bio": u.bio,
                "created_at": u.created_at,
            }
            for u in users
        ]
    })
