from django.contrib import admin
from .models import Game, GameDetailsCache, UserGame

admin.site.register(Game)
admin.site.register(GameDetailsCache)
admin.site.register(UserGame)
