import re
import requests
from django.utils.text import slugify

_DLC_RE = re.compile(
    r'\b('
    r'Soundtrack|Original Soundtrack|\bOST\b|'
    r'Season Pass|Art\s?[Bb]ook|'
    r'Supporter Pack|Content Pack|Upgrade Pack|Accessories Pack|'
    r'Skin Pack|Character Pack|Weapons? Pack|Cosmetic Pack|'
    r'Deluxe Upgrade|Premium Upgrade|Expansion Pack|'
    r'Prologue Demo|Bonus Content'
    r')\b'
    r'|\s[-–]\s.{0,50}(?:Pack|DLC|Content|Bonus|Cosmetic|Skin|Bundle)\s*$',
    re.IGNORECASE,
)

_EDITION_RE = re.compile(
    r'\s*[:\-–]?\s*('
    r'Deluxe|Standard|Gold|Ultimate|Premium|Complete|Enhanced|'
    r'Definitive|Legendary|Anniversary|Remastered|GOTY|'
    r'Game of the Year|Extended|Director\'?s Cut|Collector\'?s'
    r')(\s+Edition)?\s*$',
    re.IGNORECASE,
)


def _normalize_name(name: str) -> str:
    return _EDITION_RE.sub("", name).strip().lower()


_ADULT_RE = re.compile(
    r'\b('
    r'hentai|eroge|18\+|adult only|ecchi|lewd|nude|uncensored|erotic|nsfw|XXX|'
    r'waifu|oppai|yuri|yaoi|nukige|bishoujo|dating sim|visual novel.*18|'
    r'strip poker|sexy|seductive|lust|virgin|naughty|kinky|fetish|'
    r'negligee|huniepop|mirror|sakura\s+(beach|christmas|fantasy|dungeon|gamer|swim|'
    r'space|spirit|succubus|santa|agent|shrine|knight|cupid|angels|amazon)'
    r')\b',
    re.IGNORECASE,
)


def _is_junk(name: str) -> bool:
    return bool(_DLC_RE.search(name))


def _is_adult(name: str) -> bool:
    return bool(_ADULT_RE.search(name))

SEARCH_URL = "https://store.steampowered.com/api/storesearch/"
DETAILS_URL = "https://store.steampowered.com/api/appdetails"
FEATURED_URL = "https://store.steampowered.com/api/featuredcategories/"
CDN = "https://cdn.akamai.steamstatic.com/steam/apps"

SECTIONS_META = [
    ("top_sellers",  "Top Sellers",  "🔥"),
    ("new_releases", "New Releases", "✨"),
    ("specials",     "On Sale",      "💸"),
    ("coming_soon",  "Coming Soon",  "🚀"),
]


def header_image(appid: int) -> str:
    return f"{CDN}/{appid}/header.jpg"


def portrait_image(appid: int) -> str:
    return f"{CDN}/{appid}/library_600x900.jpg"


def make_slug(name: str, appid: int) -> str:
    base = slugify(name)[:240]
    return base or str(appid)


def get_featured_sections(safe: bool = True) -> list[dict]:
    try:
        res = requests.get(
            FEATURED_URL,
            params={"l": "english", "cc": "US"},
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=10,
        )
        res.raise_for_status()
        payload = res.json()
    except Exception:
        return []

    seen_names: set[str] = set()
    seen_ids: set[int] = set()

    sections = []
    for key, title, emoji in SECTIONS_META:
        items = payload.get(key, {}).get("items", [])
        games = []
        for item in items:
            appid = item.get("id")
            name = item.get("name", "")
            if not appid or not name:
                continue
            if _is_junk(name):
                continue
            if safe and _is_adult(name):
                continue
            norm = _normalize_name(name)
            if appid in seen_ids or norm in seen_names:
                continue
            seen_ids.add(appid)
            seen_names.add(norm)
            games.append({
                "id": appid,
                "slug": make_slug(name, appid),
                "name": name,
                "background_image": item.get("large_capsule_image") or header_image(appid),
                "portrait_image": portrait_image(appid),
                "metacritic": None,
            })
        if games:
            sections.append({"id": key, "title": title, "games": games})

    return sections


def search_games(query: str, start: int = 0, limit: int = 40, safe: bool = True) -> tuple[list[dict], bool]:
    try:
        fetch_count = limit * 3
        res = requests.get(
            SEARCH_URL,
            params={"term": query, "l": "english", "cc": "US", "start": start, "count": fetch_count},
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=10,
        )
        res.raise_for_status()
        payload = res.json()
        items = payload.get("items", [])
        total = payload.get("total", 0)
    except Exception:
        return [], False

    results = []
    for item in items:
        if len(results) >= limit:
            break
        if item.get("type") != "app":
            continue
        name = item["name"]
        if _is_junk(name):
            continue
        if safe and _is_adult(name):
            continue
        appid = item["id"]
        results.append({
            "id": appid,
            "slug": make_slug(name, appid),
            "name": name,
            "background_image": header_image(appid),
            "metacritic": None,
        })

    has_more = (start + limit) < total
    return results, has_more


def get_game_details(appid: int) -> dict | None:
    try:
        res = requests.get(
            DETAILS_URL,
            params={"appids": appid, "l": "english", "cc": "US"},
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=10,
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

    return {
        "id": appid,
        "slug": make_slug(d["name"], appid),
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
