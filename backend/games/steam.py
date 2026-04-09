import requests
from django.utils.text import slugify
from django.utils import timezone
from datetime import timedelta
from .models import Game, GameDetailsCache

SEARCH_URL = "https://store.steampowered.com/api/storesearch/"
DETAILS_URL = "https://store.steampowered.com/api/appdetails"
CDN = "https://cdn.akamai.steamstatic.com/steam/apps"

CACHE_TTL = timedelta(hours=24)


def header_image(appid: int) -> str:
    return f"{CDN}/{appid}/header.jpg"


def portrait_image(appid: int) -> str:
    return f"{CDN}/{appid}/library_600x900.jpg"


def _make_slug(name: str, appid: int) -> str:
    base = slugify(name)[:240]
    return base or str(appid)


def search_games(query: str, start: int = 0, limit: int = 40) -> tuple[list, bool]:
    try:
        res = requests.get(
            SEARCH_URL,
            params={"term": query, "l": "english", "cc": "US", "start": start, "count": limit + 1},
            timeout=6,
        )
        res.raise_for_status()
        payload = res.json()
        items = payload.get("items", [])
        total = payload.get("total", 0)
    except Exception:
        return [], False

    results = []
    for item in items[:limit]:
        if item.get("type") != "app":
            continue
        appid = item["id"]
        name = item["name"]
        game, _ = Game.objects.update_or_create(
            id=appid,
            defaults={
                "name": name,
                "slug": _make_slug(name, appid),
                "background_image": header_image(appid),
            },
        )
        results.append(game)

    has_more = (start + limit) < total
    return results, has_more


def get_game_details(appid: int) -> dict | None:
    game = Game.objects.filter(id=appid).first()

    if game:
        try:
            cache = game.details
            if timezone.now() - cache.updated_at < CACHE_TTL:
                return cache.raw_json
        except GameDetailsCache.DoesNotExist:
            pass

    try:
        res = requests.get(
            DETAILS_URL,
            params={"appids": appid, "l": "english"},
            timeout=8,
        )
        res.raise_for_status()
        payload = res.json()
    except Exception:
        return None

    entry = payload.get(str(appid), {})
    if not entry.get("success"):
        return None

    d = entry["data"]

    metacritic = None
    if d.get("metacritic"):
        metacritic = d["metacritic"].get("score")

    game, _ = Game.objects.update_or_create(
        id=appid,
        defaults={
            "name": d["name"],
            "slug": _make_slug(d["name"], appid),
            "background_image": d.get("header_image") or header_image(appid),
            "metacritic": metacritic,
        },
    )

    normalized = {
        "id": appid,
        "name": d["name"],
        "background_image": d.get("header_image") or header_image(appid),
        "portrait_image": portrait_image(appid),
        "metacritic": metacritic,
        "description_raw": d.get("short_description", ""),
        "detailed_description": d.get("detailed_description", ""),
        "genres": [
            {"id": g["id"], "name": g["description"]}
            for g in d.get("genres", [])
        ],
        "platforms": [
            {"platform": {"name": name.capitalize()}}
            for name, supported in d.get("platforms", {}).items()
            if supported
        ],
        "screenshots": [s["path_full"] for s in d.get("screenshots", [])[:8]],
        "released": d.get("release_date", {}).get("date", ""),
        "developers": d.get("developers", []),
        "publishers": d.get("publishers", []),
        "is_free": d.get("is_free", False),
        "price": d.get("price_overview", {}).get("final_formatted", "Free"),
        "website": d.get("website", ""),
    }

    GameDetailsCache.objects.update_or_create(
        game=game,
        defaults={"raw_json": normalized},
    )

    return normalized
