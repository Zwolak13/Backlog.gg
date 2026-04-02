from django.db import models
from django.conf import settings


class Game(models.Model):
    """
    Podstawowe dane gry — cache RAWG (lightweight).
    """
    id = models.IntegerField(primary_key=True)  # RAWG ID
    slug = models.SlugField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    background_image = models.URLField(blank=True, null=True)
    released = models.DateField(blank=True, null=True)
    metacritic = models.IntegerField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)  # do TTL

    def __str__(self):
        return self.name


class GameDetailsCache(models.Model):
    """
    Pełne dane RAWG — JSON cache.
    """
    game = models.OneToOneField(Game, on_delete=models.CASCADE, related_name="details")
    raw_json = models.JSONField()
    updated_at = models.DateTimeField(auto_now=True)  # TTL 24h

    def __str__(self):
        return f"Cache: {self.game.name}"


class UserGame(models.Model):
    """
    Relacja user ↔ game (backlog, playing, completed, wishlist).
    """
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
    hours_played = models.FloatField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "game")  # jedna gra per user

    def __str__(self):
        return f"{self.user.username} → {self.game.name} ({self.status})"
