from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    user.delete()
    return Response({"message": "Account deleted"})


from django.contrib.auth import update_session_auth_hash

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not user.check_password(old_password):
        return Response({"error": "Incorrect current password"}, status=400)

    user.set_password(new_password)
    user.save()

    # ważne: nie wylogowuje użytkownika
    update_session_auth_hash(request, user)

    return Response({"message": "Password updated"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    return Response({
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

    if bio is not None:
        user.bio = bio

    if avatar_url is not None:
        user.avatar_url = avatar_url

    user.save()

    return Response({"message": "Profile updated"})
