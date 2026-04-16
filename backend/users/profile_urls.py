from django.urls import path
from .views.profile_views import delete_account, get_profile, update_profile
from .views.password_views import change_password
from .views.friends_views import (
    friends_list_view,
    add_friend_view,
    remove_friend_view,
    public_profile_view,
    search_users_view,
    send_friend_request_view,
    pending_requests_view,
    accept_request_view,
    decline_request_view,
)

urlpatterns = [
    path("delete/", delete_account),
    path("change-password/", change_password),
    path("me/", get_profile),
    path("update/", update_profile),
    path("search/", search_users_view),
    path("friends/", friends_list_view),
    path("friends/add/", add_friend_view),
    path("friends/remove/<str:username>/", remove_friend_view),
    path("friends/requests/", pending_requests_view),
    path("friends/request/send/", send_friend_request_view),
    path("friends/request/<int:pk>/accept/", accept_request_view),
    path("friends/request/<int:pk>/decline/", decline_request_view),
    path("profile/<str:username>/", public_profile_view),
]
