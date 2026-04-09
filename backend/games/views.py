from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.shortcuts import get_object_or_404
from .models import Game, GameDetailsCache
from . import steam

PAGE_SIZE = 40


@require_GET
def list_games_view(request):
    q = request.GET.get("q", "").strip()
    page = max(1, int(request.GET.get("page", 1)))
    start = (page - 1) * PAGE_SIZE

    if q:
        games, has_more = steam.search_games(q, start=start, limit=PAGE_SIZE)
    else:
        total = Game.objects.count()
        games = list(Game.objects.all().order_by("-updated_at")[start : start + PAGE_SIZE])
        has_more = (start + PAGE_SIZE) < total

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
        ],
        "has_more": has_more,
        "page": page,
    })


@require_GET
def game_details_view(request, appid):
    data = steam.get_game_details(appid)

    if data is None:
        game = Game.objects.filter(pk=appid).first()
        if not game:
            return JsonResponse({"error": "Game not found"}, status=404)
        try:
            data = game.details.raw_json
        except GameDetailsCache.DoesNotExist:
            data = {
                "id": game.id,
                "name": game.name,
                "background_image": game.background_image,
                "description_raw": "",
                "platforms": [],
                "genres": [],
            }

    return JsonResponse(data)
