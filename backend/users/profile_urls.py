from django.urls import path
from .views.profile_views import delete_account, change_password, get_profile, update_profile
from .views.password_views import change_password

urlpatterns = [
    path("delete/", delete_account),
    path("change-password/", change_password),
    path("me/", get_profile),
    path("update/", update_profile),
    path("change-password/", change_password),
]
