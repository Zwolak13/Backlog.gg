from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/auth/", include("users.auth_urls")),
    path("api/user/", include("users.profile_urls")),
    path("api/games/", include("games.urls")),
]
