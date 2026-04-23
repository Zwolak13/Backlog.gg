import re
from typing import Any

import requests
from django.conf import settings
from django.utils.text import slugify

from . import steam

GG_BUNDLES_URL = "https://api.gg.deals/v1/bundles/by-steam-app-id/"
GG_BUNDLES_FALLBACK_URL = "https://api.gg.deals/v1/bundles/"
DEFAULT_BUNDLE_LIMIT = 8


def _featured_app_ids(limit: int) -> list[int]:
    sections = steam.get_featured_sections(safe=True)
    by_id = {section["id"]: section for section in sections}
    ordered_sections = [
        by_id[key]
        for key in ("specials", "top_sellers", "new_releases", "coming_soon")
        if key in by_id
    ]

    seen: set[int] = set()
    app_ids: list[int] = []
    for section in ordered_sections:
        for game in section["games"]:
            app_id = game.get("id")
            if not app_id or app_id in seen:
                continue
            seen.add(app_id)
            app_ids.append(app_id)
            if len(app_ids) >= limit:
                return app_ids
    return app_ids


def _first_text(*values: Any) -> str | None:
    for value in values:
        if value is None:
            continue
        if isinstance(value, str):
            text = value.strip()
            if text:
                return text
        elif isinstance(value, (int, float)):
            return str(value)
    return None


def _first_number(*values: Any) -> float | None:
    for value in values:
        if value is None:
            continue
        if isinstance(value, (int, float)):
            return float(value)
        if isinstance(value, str):
            cleaned = re.sub(r"[^0-9.,-]", "", value).replace(",", ".")
            if not cleaned:
                continue
            try:
                return float(cleaned)
            except ValueError:
                continue
    return None


def _format_money(value: Any, currency: str = "USD", *, cents: bool = False) -> str | None:
    if value is None:
        return None

    if isinstance(value, dict):
        formatted = _first_text(value.get("formatted"), value.get("text"), value.get("display"))
        if formatted:
            return formatted
        currency = _first_text(value.get("currency"), value.get("currencyCode")) or currency
        return _format_money(
            value.get("amount") or value.get("value") or value.get("price") or value.get("cents"),
            currency,
            cents=value.get("cents") is not None,
        )

    if isinstance(value, str):
        text = value.strip()
        if not text:
            return None
        if re.search(r"[A-Za-z$]", text):
            return text
        number = _first_number(text)
    elif isinstance(value, (int, float)):
        number = float(value)
    else:
        return None

    if number is None:
        return None
    if cents or (isinstance(value, int) and number >= 100):
        number = number / 100
    if number == 0:
        return "Free"

    symbols = {"USD": "$"}
    prefix = symbols.get(currency.upper(), f"{currency.upper()} ")
    return f"{prefix}{number:.2f}"


def _absolute_gg_url(url: str | None) -> str | None:
    if not url:
        return None
    if url.startswith("http://") or url.startswith("https://"):
        return url
    if url.startswith("/"):
        return f"https://gg.deals{url}"
    return f"https://gg.deals/{url}"


def _games_count(entry: dict, nested: dict) -> int | None:
    explicit = _first_number(
        entry.get("gamesCount"),
        entry.get("games_count"),
        entry.get("itemsCount"),
        entry.get("contentsCount"),
        nested.get("gamesCount"),
        nested.get("games_count"),
    )
    if explicit is not None:
        return int(explicit)

    for key in ("games", "items", "contents", "products", "apps"):
        values = entry.get(key) or nested.get(key)
        if isinstance(values, list):
            return len(values)
    return None


def _normalize_bundle(entry: dict) -> dict | None:
    nested = entry.get("bundle") if isinstance(entry.get("bundle"), dict) else {}
    price_info = entry.get("price") if isinstance(entry.get("price"), dict) else {}
    currency = _first_text(
        entry.get("currency"),
        entry.get("currencyCode"),
        price_info.get("currency"),
        nested.get("currency"),
    ) or "USD"

    title = _first_text(
        entry.get("title"),
        entry.get("name"),
        entry.get("bundleTitle"),
        entry.get("bundleName"),
        nested.get("title"),
        nested.get("name"),
    )
    if not title:
        return None

    slug = _first_text(entry.get("slug"), nested.get("slug"))
    url = _absolute_gg_url(_first_text(
        entry.get("url"),
        entry.get("link"),
        entry.get("bundleUrl"),
        entry.get("bundle_url"),
        nested.get("url"),
        nested.get("link"),
    ))
    if not url and slug:
        url = f"https://gg.deals/pack/{slug}/"
    if not url:
        url = "https://gg.deals/bundles/"

    image = _absolute_gg_url(_first_text(
        entry.get("image"),
        entry.get("imageUrl"),
        entry.get("cover"),
        entry.get("coverImage"),
        nested.get("image"),
        nested.get("imageUrl"),
        nested.get("cover"),
    ))

    current_price = _format_money(
        entry.get("currentPrice")
        or entry.get("current_price")
        or entry.get("lowestPrice")
        or entry.get("price")
        or nested.get("price"),
        currency,
    )
    retail_price = _format_money(
        entry.get("originalPrice")
        or entry.get("original_price")
        or entry.get("retailPrice")
        or entry.get("retail_price")
        or entry.get("msrp")
        or nested.get("originalPrice"),
        currency,
    )
    discount = _first_number(
        entry.get("discount"),
        entry.get("discountPercent"),
        entry.get("discount_percent"),
        entry.get("savingsPercent"),
        nested.get("discount"),
    )

    return {
        "id": _first_text(entry.get("id"), nested.get("id"), slug, slugify(title)) or title,
        "title": title,
        "image": image,
        "price": current_price,
        "retail_price": retail_price,
        "discount_percent": int(discount) if discount is not None else None,
        "source": _first_text(
            entry.get("store"),
            entry.get("shop"),
            entry.get("source"),
            entry.get("vendor"),
            nested.get("store"),
        ) or "GG.deals",
        "games_count": _games_count(entry, nested),
        "bundle_url": url,
    }


def _looks_like_bundle(entry: dict) -> bool:
    fields = set(entry.keys())
    return bool(
        fields.intersection({
            "bundle",
            "bundleName",
            "bundleTitle",
            "bundleUrl",
            "contents",
            "games",
            "items",
            "products",
        })
        or (
            fields.intersection({"title", "name"})
            and fields.intersection({"price", "currentPrice", "url", "link", "discount", "image"})
        )
    )


def _collect_bundle_entries(value: Any, entries: list[dict]) -> None:
    if isinstance(value, list):
        for item in value:
            _collect_bundle_entries(item, entries)
        return

    if not isinstance(value, dict):
        return

    if _looks_like_bundle(value):
        entries.append(value)

    for key in ("data", "bundles", "results", "items", "history"):
        if key in value:
            _collect_bundle_entries(value[key], entries)

    if "data" not in value and all(isinstance(item, dict) for item in value.values()):
        for item in value.values():
            _collect_bundle_entries(item, entries)


def _request_bundle_payload(app_ids: list[int]) -> Any | None:
    api_key = getattr(settings, "GG_DEALS_API_KEY", "")
    if not api_key or not app_ids:
        return None

    ids = ",".join(str(app_id) for app_id in app_ids)
    region = getattr(settings, "GG_DEALS_REGION", "us")
    attempts = (
        (GG_BUNDLES_URL, {"ids": ids, "key": api_key, "region": region}),
        (GG_BUNDLES_FALLBACK_URL, {"ids": ids, "key": api_key, "region": region}),
        (GG_BUNDLES_FALLBACK_URL, {"steam_app_ids": ids, "key": api_key, "region": region}),
    )

    for url, params in attempts:
        try:
            response = requests.get(
                url,
                params=params,
                headers={"User-Agent": "Backlog.gg/1.0"},
                timeout=10,
            )
            if response.status_code in {400, 404, 405}:
                continue
            response.raise_for_status()
            return response.json()
        except Exception:
            continue

    return None


def get_dashboard_bundles(limit: int = DEFAULT_BUNDLE_LIMIT) -> list[dict]:
    lookup_limit = max(limit * 4, 24)
    payload = _request_bundle_payload(_featured_app_ids(lookup_limit))
    if payload is None:
        return []

    entries: list[dict] = []
    _collect_bundle_entries(payload.get("data") if isinstance(payload, dict) and "data" in payload else payload, entries)

    bundles: list[dict] = []
    seen: set[str] = set()
    for entry in entries:
        bundle = _normalize_bundle(entry)
        if not bundle:
            continue
        key = bundle["bundle_url"] or bundle["id"]
        if key in seen:
            continue
        seen.add(key)
        bundles.append(bundle)

    bundles.sort(
        key=lambda bundle: (
            bundle.get("discount_percent") or 0,
            bundle.get("games_count") or 0,
            1 if bundle.get("price") else 0,
        ),
        reverse=True,
    )
    return bundles[:limit]
