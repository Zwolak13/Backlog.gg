from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    user.delete()
    return Response({"message": "Account deleted"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "bio": user.bio,
        "avatar_url": user.avatar_url,
        "created_at": user.created_at,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user

    bio = request.data.get("bio")
    avatar_url = request.data.get("avatar_url")
    username = request.data.get("username")

    if bio is not None:
        user.bio = bio

    if avatar_url is not None:
        user.avatar_url = avatar_url

    if username is not None:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if User.objects.filter(username=username).exclude(id=user.id).exists():
            return Response({"error": "Username already taken"}, status=400)
        user.username = username

    user.save()

    return Response({"message": "Profile updated"})

