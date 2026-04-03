from django.http import JsonResponse
from django.views.decorators.http import require_GET
from .models import Game

@require_GET
def list_games_view(request):
    q = request.GET.get("q", "").strip()

    games = Game.objects.all()

    if q:
        games = games.filter(name__icontains=q)

    return JsonResponse({
        "results": [
            {
                "id": g.id,
                "slug": g.slug,
                "name": g.name,
                "background_image": g.background_image,
                "metacritic": g.metacritic,
            }
            for g in games
        ]
    })


from django.shortcuts import get_object_or_404
from .models import GameDetailsCache

@require_GET
def game_details_view(request, slug):
    game = get_object_or_404(Game, slug=slug)

    try:
        cache = game.details  # OneToOneField
        data = cache.raw_json
    except GameDetailsCache.DoesNotExist:
        # fallback: zwróć podstawowe dane
        data = {
            "id": game.id,
            "slug": game.slug,
            "name": game.name,
            "background_image": game.background_image,
            "released": game.released,
            "metacritic": game.metacritic,
            "description_raw": "No description available.",
            "platforms": [],
            "genres": [],
        }

    return JsonResponse(data)
