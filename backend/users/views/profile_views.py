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

