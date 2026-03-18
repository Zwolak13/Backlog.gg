from django.urls import path
from .views.profile_views import delete_account, change_password

urlpatterns = [
    path("delete/", delete_account),
    path("change-password/", change_password),
]
