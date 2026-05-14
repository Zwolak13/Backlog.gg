from django.http import JsonResponse
from django.views.decorators.http import require_GET
from .models import Game
from . import steam

PAGE_SIZE = 40


@require_GET
def list_games_view(request):
    q = request.GET.get("q", "").strip()
    page = max(1, int(request.GET.get("page", 1)))
    start = (page - 1) * PAGE_SIZE

    safe = request.GET.get("safe", "1") != "0"
    currency = steam.normalize_currency(request.GET.get("currency"))

    if q:
        games, has_more = steam.search_games(q, start=start, limit=PAGE_SIZE, safe=safe, currency=currency)
        return JsonResponse({"mode": "search", "results": games, "has_more": has_more, "page": page})
    else:
        sections = steam.get_featured_sections(safe=safe, currency=currency)
        return JsonResponse({"mode": "browse", "sections": sections})


@require_GET
def game_details_view(request, appid):
    currency = steam.normalize_currency(request.GET.get("currency"))
    data = steam.get_game_details(appid, currency=currency)

    if data is None:
        game = Game.objects.filter(pk=appid).first()
        if not game:
            return JsonResponse({"error": "Game not found"}, status=404)
        data = {
            "id": game.id,
            "slug": game.slug,
            "name": game.name,
            "background_image": game.background_image,
            "metacritic": game.metacritic,
            "description_raw": "",
            "platforms": [],
            "genres": [],
        }

    return JsonResponse(data)
