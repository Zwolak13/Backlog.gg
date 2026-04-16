from django.urls import path
from .views import list_games_view, game_details_view
from .library_views import (
    library_view,
    library_item_view,
    library_recent_view,
    library_favourites_view,
    library_stats_view,
    library_check_view,
    friends_ratings_view,
)

urlpatterns = [
    path("", list_games_view),
    path("library/", library_view),
    path("library/recent/", library_recent_view),
    path("library/favourites/", library_favourites_view),
    path("library/stats/", library_stats_view),
    path("library/check/<int:game_id>/", library_check_view),
    path("library/friends-ratings/<int:game_id>/", friends_ratings_view),
    path("library/<int:pk>/", library_item_view),
    path("<int:appid>/", game_details_view),
]
