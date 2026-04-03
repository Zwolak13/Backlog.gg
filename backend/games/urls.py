from django.urls import path
from .views import list_games_view, game_details_view

urlpatterns = [
    path("", list_games_view),
    path("<slug:slug>", game_details_view),
]
