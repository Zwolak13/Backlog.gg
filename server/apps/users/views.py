from django.contrib.auth import authenticate, login, logout, get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.middleware.csrf import get_token
from .serializers import UserSerializer

User = get_user_model()

# Endpoint CSRF
@api_view(["GET"])
@permission_classes([AllowAny])
def get_csrf(request):
    return Response({"csrfToken": get_token(request)})

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email")
    avatar_url = request.data.get("avatar_url")
    bio = request.data.get("bio")

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        avatar_url=avatar_url,
        bio=bio
    )

    login(request, user)

    return Response(UserSerializer(user).data)

@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response(UserSerializer(user).data)

    return Response({"error": "Invalid credentials"}, status=401)

@api_view(["POST"])
def logout_view(request):
    logout(request)
    return Response({"success": True})

@api_view(["GET"])
def me(request):
    if request.user.is_authenticated:
        return Response(UserSerializer(request.user).data)
    return Response({"user": None})