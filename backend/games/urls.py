from django.urls import path
from .views import list_games_view, game_details_view
from .dashboard_views import bundles_view, deals_view, friends_activity_view, game_price_view, own_activity_view, public_user_activity_view, spotlight_view
from .library_views import (
    library_view,
    library_item_view,
    library_recent_view,
    library_favourites_view,
    library_stats_view,
    library_check_view,
    friends_ratings_view,
    game_reviews_view,
    public_library_view,
    public_library_stats_view,
    public_library_recent_view,
    public_library_favourites_view,
)
from .social_views import social_reviews_view, social_users_view
from .recommendations_views import recommendations_view, chat_view, chat_stream_view, sessions_view, session_detail_view

urlpatterns = [
    path("recommendations/", recommendations_view),
    path("recommendations/chat/", chat_view),
    path("recommendations/chat/stream/", chat_stream_view),
    path("recommendations/sessions/", sessions_view),
    path("recommendations/sessions/<int:session_id>/", session_detail_view),
    path("", list_games_view),
    path("spotlight/", spotlight_view),
    path("deals/", deals_view),
    path("price/<int:app_id>/", game_price_view),
    path("bundles/", bundles_view),
    path("activity/friends/", friends_activity_view),
    path("activity/me/", own_activity_view),
    path("activity/user/<str:username>/", public_user_activity_view),
    path("library/", library_view),
    path("library/recent/", library_recent_view),
    path("library/favourites/", library_favourites_view),
    path("library/stats/", library_stats_view),
    path("library/check/<int:game_id>/", library_check_view),
    path("library/friends-ratings/<int:game_id>/", friends_ratings_view),
    path("library/public/<str:username>/stats/", public_library_stats_view),
    path("library/public/<str:username>/recent/", public_library_recent_view),
    path("library/public/<str:username>/favourites/", public_library_favourites_view),
    path("library/public/<str:username>/", public_library_view),
    path("library/<int:pk>/", library_item_view),
    path("reviews/<int:game_id>/", game_reviews_view),
    path("social/reviews/", social_reviews_view),
    path("social/users/", social_users_view),
    path("<int:appid>/", game_details_view),
]
