from datetime import timedelta

from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_GET

from .models import Game, GameDetailsCache
from . import steam

PAGE_SIZE = 40
CACHE_TTL_HOURS = 6


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
    fresh_cutoff = timezone.now() - timedelta(hours=CACHE_TTL_HOURS)

    # 1. Serve from cache if it's fresh enough
    cache_entry = (
        GameDetailsCache.objects
        .filter(game_id=appid)
        .select_related("game")
        .first()
    )
    if cache_entry and cache_entry.updated_at >= fresh_cutoff:
        return JsonResponse(cache_entry.raw_json)

    # 2. Fetch from Steam
    data = steam.get_game_details(appid, currency=currency)

    if data is None:
        # Return stale cache rather than 404 if we have anything cached
        if cache_entry:
            return JsonResponse(cache_entry.raw_json)

        # Last resort: bare Game record (only exists if user added it to library)
        game = Game.objects.filter(pk=appid).first()
        if not game:
            return JsonResponse({"error": "Game not found"}, status=404)
        return JsonResponse({
            "id": game.id,
            "slug": game.slug,
            "name": game.name,
            "background_image": game.background_image,
            "metacritic": game.metacritic,
            "description_raw": "",
            "platforms": [],
            "genres": [],
            "screenshots": [],
            "developers": [],
            "publishers": [],
        })

    # 3. Persist to DB and update cache
    game, _ = Game.objects.update_or_create(
        pk=appid,
        defaults={
            "slug": data["slug"],
            "name": data["name"],
            "background_image": data.get("background_image"),
            "metacritic": data.get("metacritic"),
        },
    )
    GameDetailsCache.objects.update_or_create(
        game=game,
        defaults={"raw_json": data},
    )

    return JsonResponse(data)
