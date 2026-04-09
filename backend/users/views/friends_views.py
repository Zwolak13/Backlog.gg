from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..models import User, Friendship


def serialize_friend(user):
    return {
        "username": user.username,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def friends_list_view(request):
    friendships = Friendship.objects.filter(from_user=request.user).select_related("to_user")
    return Response({"friends": [serialize_friend(f.to_user) for f in friendships]})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_friend_view(request):
    username = request.data.get("username")
    if not username:
        return Response({"error": "username is required"}, status=400)

    target = get_object_or_404(User, username=username)
    if target == request.user:
        return Response({"error": "Cannot add yourself"}, status=400)

    _, created = Friendship.objects.get_or_create(from_user=request.user, to_user=target)
    if not created:
        return Response({"error": "Already friends"}, status=400)

    return Response({"message": f"Added {username}"}, status=201)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_friend_view(request, username):
    target = get_object_or_404(User, username=username)
    Friendship.objects.filter(from_user=request.user, to_user=target).delete()
    return Response({"message": f"Removed {username}"})


@api_view(["GET"])
def public_profile_view(request, username):
    user = get_object_or_404(User, username=username)
    return Response({
        "username": user.username,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
        "created_at": user.created_at,
    })
