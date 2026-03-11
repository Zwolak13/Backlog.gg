# LOGIN
from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_protect

@api_view(["POST"])
@csrf_protect
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user is not None:
        login(request, user)
        return Response({
            "user": {
                "username": user.username,
                "email": user.email,
                "avatar_url": user.avatar_url,
                "bio": user.bio,
                "created_at": user.created_at,
            }
        })

    return Response({"error": "Invalid credentials"}, status=400)


# REGISTER
from ..serializers import RegisterSerializer

@api_view(["POST"])
@csrf_protect
def register_view(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        return Response({
            "user": {
                "username": user.username,
                "email": user.email,
                "avatar_url": user.avatar_url,
                "bio": user.bio,
                "created_at": user.created_at,
            }
        }, status=201)

    return Response({"error": serializer.errors}, status=400)


# CURRENT USER/ME
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    user = request.user
    return Response({
        "user": {
            "username": user.username,
            "email": user.email,
            "avatar_url": user.avatar_url,
            "bio": user.bio,
            "created_at": user.created_at,
        }
    })


# LOGOUT
@api_view(["POST"])
def logout_view(request):
    logout(request)
    return Response({"message": "Logged out"})


# CSRF
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def csrf_view(request):
    return Response({"csrfToken": get_token(request)})
