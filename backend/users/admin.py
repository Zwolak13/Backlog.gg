from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    list_display = ("username", "email", "avatar_url", "created_at", "is_staff")

    fieldsets = UserAdmin.fieldsets + (
        ("Profile info", {"fields": ("avatar_url", "bio")}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Profile info", {"fields": ("avatar_url", "bio")}),
    )
