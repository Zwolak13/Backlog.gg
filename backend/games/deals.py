import re
from typing import Any

import requests
from django.conf import settings

from . import steam

GG_PRICES_URL = "https://api.gg.deals/v1/prices/by-steam-app-id/"
DEFAULT_LIMIT = 8
GG_REGIONS = {
    "USD": "us",
    "EUR": "de",
    "PLN": "pl",
}


def _format_price(cents: int | None, currency: str = "USD") -> str | None:
    if cents is None:
        return None
    if cents == 0:
        return "Free"

    prefixes  = {"USD": "$", "EUR": "€", "GBP": "£"}
    suffixes  = {"PLN": " zł"}
    amount = f"{cents / 100:.2f}"
    if currency in prefixes:
        return f"{prefixes[currency]}{amount}"
    if currency in suffixes:
        return f"{amount}{suffixes[currency]}"
    return f"{currency} {amount}"


def _parse_price(value: Any) -> float | None:
    if value is None:
        return None
    if isinstance(value, int | float):
        return float(value)
    if not isinstance(value, str):
        return None

    cleaned = re.sub(r"[^0-9,.]", "", value).replace(",", ".")
    try:
        return float(cleaned)
    except ValueError:
        return None


def _region_for_currency(currency: str) -> str:
    return GG_REGIONS.get(steam.normalize_currency(currency), "us")


def _steam_deals(limit: int, currency: str) -> list[dict]:
    sections = steam.get_featured_sections(safe=True, currency=currency)
    specials = next((section for section in sections if section["id"] == "specials"), None)
    if not specials:
        return []

    deals = []
    for game in specials["games"]:
        discount_percent = game.get("discount_percent")
        if not discount_percent:
            continue

        app_id = game["id"]
        deals.append({
            "id": f"steam-{app_id}",
            "app_id": app_id,
            "title": game["name"],
            "cover_image": game.get("background_image"),
            "current_price": _format_price(game.get("final_price"), currency),
            "original_price": _format_price(game.get("original_price"), currency),
            "discount_percent": discount_percent,
            "source": "Steam",
            "deal_url": f"https://gg.deals/steam/app/{app_id}/",
        })

    deals.sort(key=lambda deal: deal.get("discount_percent") or 0, reverse=True)
    return deals[:limit]


def _extract_gg_entry(data: Any, app_id: int) -> dict | None:
    if isinstance(data, dict):
        if str(app_id) in data and isinstance(data[str(app_id)], dict):
            return data[str(app_id)]
        if app_id in data and isinstance(data[app_id], dict):
            return data[app_id]
        if "prices" in data:
            return data
    if isinstance(data, list):
        for item in data:
            if isinstance(item, dict) and str(item.get("steamAppId") or item.get("steam_app_id") or item.get("id")) == str(app_id):
                return item
    return None


def _best_gg_price(entry: dict) -> tuple[float | None, str | None]:
    prices = entry.get("prices") or {}
    retail_num = _parse_price(prices.get("currentRetail"))
    keyshop_num = _parse_price(prices.get("currentKeyshops"))

    if retail_num is not None and (keyshop_num is None or retail_num <= keyshop_num):
        return retail_num, "GG.deals"
    if keyshop_num is not None:
        return keyshop_num, "GG.deals"
    return None, None


def _enrich_with_gg_deals(deals: list[dict], currency: str) -> list[dict]:
    api_key = getattr(settings, "GG_DEALS_API_KEY", "")
    if not api_key or not deals:
        return deals

    ids = [str(deal["app_id"]) for deal in deals]
    try:
        response = requests.get(
            GG_PRICES_URL,
            params={
                "ids": ",".join(ids),
                "key": api_key,
                "region": _region_for_currency(currency),
            },
            headers={"User-Agent": "Backlog.gg/1.0"},
            timeout=10,
        )
        response.raise_for_status()
        payload = response.json()
    except Exception:
        return deals

    data = payload.get("data") if isinstance(payload, dict) else None
    if data is None:
        return deals

    enriched = []
    for deal in deals:
        entry = _extract_gg_entry(data, deal["app_id"])
        if not entry:
            enriched.append(deal)
            continue

        price_num, source = _best_gg_price(entry)
        current_price = _format_price(int(price_num * 100), currency) if price_num is not None else None
        enriched.append({
            **deal,
            "current_price": current_price or deal["current_price"],
            "source": source or "GG.deals",
            "deal_url": entry.get("url") or f"https://gg.deals/steam/app/{deal['app_id']}/",
        })

    return enriched


def get_dashboard_deals(limit: int = DEFAULT_LIMIT, currency: str = "USD") -> list[dict]:
    normalized_currency = steam.normalize_currency(currency)
    return _enrich_with_gg_deals(_steam_deals(limit, normalized_currency), normalized_currency)


def get_game_deal(app_id: int, currency: str = "USD") -> dict | None:
    api_key = getattr(settings, "GG_DEALS_API_KEY", "")
    if not api_key:
        return None

    normalized = steam.normalize_currency(currency)
    try:
        response = requests.get(
            GG_PRICES_URL,
            params={
                "ids": str(app_id),
                "key": api_key,
                "region": _region_for_currency(normalized),
            },
            headers={"User-Agent": "Backlog.gg/1.0"},
            timeout=8,
        )
        response.raise_for_status()
        payload = response.json()
    except Exception:
        return None

    data = payload.get("data") if isinstance(payload, dict) else None
    if not data:
        return None

    entry = _extract_gg_entry(data, app_id)
    if not entry:
        return None

    prices = entry.get("prices") or {}
    retail_raw = prices.get("currentRetail")
    keyshop_raw = prices.get("currentKeyshops")
    retail_num = _parse_price(retail_raw)
    keyshop_num = _parse_price(keyshop_raw)

    official_price = _format_price(int(retail_num * 100), normalized) if retail_num is not None else None
    keyshop_price = _format_price(int(keyshop_num * 100), normalized) if keyshop_num is not None else None
    base_url = entry.get("url") or f"https://gg.deals/steam/app/{app_id}/"

    return {
        "official_price": official_price,
        "keyshop_price": keyshop_price,
        "official_url": f"{base_url}#official-stores" if official_price else None,
        "keyshop_url": f"{base_url}#keyshops" if keyshop_price else None,
    }
