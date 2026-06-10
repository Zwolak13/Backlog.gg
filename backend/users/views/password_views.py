from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.password_validation import validate_password, ValidationError

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user

    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not old_password or not new_password:
        return Response({"error": "Both old and new password are required"}, status=400)

    if not user.check_password(old_password):
        return Response({"error": "Old password is incorrect"}, status=400)

    try:
        validate_password(new_password, user=user)
    except ValidationError as e:
        return Response({"error": e.messages}, status=400)

    user.set_password(new_password)
    user.save()
    update_session_auth_hash(request, user)

    return Response({"message": "Password updated"})
