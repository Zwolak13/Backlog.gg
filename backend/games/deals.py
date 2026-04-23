import re
from typing import Any

import requests
from django.conf import settings

from . import steam

GG_PRICES_URL = "https://api.gg.deals/v1/prices/by-steam-app-id/"
DEFAULT_LIMIT = 8


def _format_price(cents: int | None, currency: str = "USD") -> str | None:
    if cents is None:
        return None
    if cents == 0:
        return "Free"

    symbols = {"USD": "$", "EUR": "€", "GBP": "£", "PLN": "zł"}
    prefix = symbols.get(currency, f"{currency} ")
    return f"{prefix}{cents / 100:.2f}"


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


def _steam_deals(limit: int) -> list[dict]:
    sections = steam.get_featured_sections(safe=True)
    specials = next((section for section in sections if section["id"] == "specials"), None)
    if not specials:
        return []

    deals = []
    for game in specials["games"]:
        discount_percent = game.get("discount_percent")
        if not discount_percent:
            continue

        app_id = game["id"]
        currency = game.get("currency") or "USD"
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


def _best_gg_price(entry: dict) -> tuple[str | None, str | None]:
    prices = entry.get("prices") or {}
    retail = prices.get("currentRetail")
    keyshop = prices.get("currentKeyshops")

    retail_number = _parse_price(retail)
    keyshop_number = _parse_price(keyshop)

    if retail_number is not None and (keyshop_number is None or retail_number <= keyshop_number):
        return str(retail), "GG.deals official stores"
    if keyshop_number is not None:
        return str(keyshop), "GG.deals keyshops"
    return None, None


def _enrich_with_gg_deals(deals: list[dict]) -> list[dict]:
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
                "region": getattr(settings, "GG_DEALS_REGION", "us"),
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

        current_price, source = _best_gg_price(entry)
        enriched.append({
            **deal,
            "current_price": current_price or deal["current_price"],
            "source": source or "GG.deals",
            "deal_url": entry.get("url") or f"https://gg.deals/steam/app/{deal['app_id']}/",
        })

    return enriched


def get_dashboard_deals(limit: int = DEFAULT_LIMIT) -> list[dict]:
    return _enrich_with_gg_deals(_steam_deals(limit))
