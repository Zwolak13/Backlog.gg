from django.db import models
from django.conf import settings


class Game(models.Model):
    id = models.IntegerField(primary_key=True)
    slug = models.SlugField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    background_image = models.URLField(blank=True, null=True)
    released = models.DateField(blank=True, null=True)
    metacritic = models.IntegerField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class GameDetailsCache(models.Model):
    game = models.OneToOneField(Game, on_delete=models.CASCADE, related_name="details")
    raw_json = models.JSONField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cache: {self.game.name}"


class UserGame(models.Model):
    STATUS_CHOICES = [
        ("backlog", "Backlog"),
        ("playing", "Playing"),
        ("completed", "Completed"),
        ("wishlist", "Wishlist"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    rating = models.IntegerField(blank=True, null=True)
    is_favourite = models.BooleanField(default=False)
    hours_played = models.FloatField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "game")

    def __str__(self):
        return f"{self.user.username} → {self.game.name} ({self.status})"
