#!/usr/bin/env python3
"""
Sua-Tshui 食喙 — ETL Data Pipeline
====================================
Extract  → OpenStreetMap Overpass API (real Taiwan restaurant POI data)
Transform → normalise category, infer city, generate synthetic ratings
Load      → upsert into Supabase `restaurants` table

Usage:
    pip install -r requirements.txt
    export SUPABASE_URL=https://xxxx.supabase.co
    export SUPABASE_SERVICE_ROLE_KEY=eyJ...
    python etl_pipeline.py [--limit 400]
"""

import argparse
import hashlib
import json
import math
import os
import sys
import time
from datetime import datetime, timezone

import requests
from supabase import create_client, Client

# ── Overpass API ─────────────────────────────────────────────────────────────
OVERPASS_URL = "https://overpass.kumi.systems/api/interpreter"
OVERPASS_QUERY = """
[out:json][timeout:60];
(
  node["amenity"="restaurant"](21.9,119.9,25.4,122.1);
  node["amenity"="cafe"](21.9,119.9,25.4,122.1);
  node["amenity"="fast_food"](21.9,119.9,25.4,122.1);
);
out body {limit};
""".strip()

# ── Category mapping ─────────────────────────────────────────────────────────
AMENITY_TO_CAT = {
    "restaurant": "台灣料理",
    "fast_food":  "台灣小吃",
    "cafe":       "咖啡廳",
}
CUISINE_TO_CAT = {
    "taiwanese":  "台灣料理",
    "chinese":    "台灣料理",
    "noodles":    "台灣小吃",
    "dumpling":   "點心",
    "bubble_tea": "台灣小吃",
    "coffee":     "咖啡廳",
    "brunch":     "早午餐",
    "breakfast":  "早午餐",
    "hotpot":     "台式熱炒",
    "stir_fry":   "台式熱炒",
}
VALID_CATS = {"台灣料理", "台式熱炒", "台灣小吃", "點心", "咖啡廳", "早午餐"}

# ── City centres (lat, lng, radius-deg) ─────────────────────────────────────
CITY_CENTRES = [
    ("台北",  25.045, 121.53, 0.20),
    ("新北",  25.012, 121.47, 0.35),
    ("桃園",  24.993, 121.30, 0.25),
    ("新竹",  24.803, 120.97, 0.20),
    ("台中",  24.147, 120.67, 0.30),
    ("台南",  22.994, 120.20, 0.30),
    ("高雄",  22.625, 120.31, 0.35),
    ("宜蘭",  24.757, 121.75, 0.25),
    ("花蓮",  23.971, 121.60, 0.30),
]


def infer_city(lat: float, lng: float) -> str:
    best, best_dist = "其他", math.inf
    for city, clat, clng, radius in CITY_CENTRES:
        d = math.sqrt((lat - clat) ** 2 + (lng - clng) ** 2)
        if d < best_dist and d < radius:
            best, best_dist = city, d
    return best


def _seeded(seed: int) -> float:
    x = math.sin(seed) * 43758.5453123
    return x - math.floor(x)


def synthetic_metrics(osm_id: int) -> dict:
    """Deterministic metrics derived from OSM node id (reproducible across runs)."""
    return {
        "rating":       round(3.2 + _seeded(osm_id) * 1.8, 1),
        "review_count": int(20 + _seeded(osm_id + 1) * 3000),
        "avg_price":    int(80 + _seeded(osm_id + 2) * 920),
    }


# ── Extract ──────────────────────────────────────────────────────────────────
def extract(limit: int) -> list[dict]:
    print(f"[Extract] Querying Overpass API for up to {limit} Taiwan restaurants…")
    query = OVERPASS_QUERY.format(limit=limit)
    headers = {"Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded"}
    resp = requests.post(OVERPASS_URL, data={"data": query}, headers=headers, timeout=90)
    resp.raise_for_status()
    elements = resp.json().get("elements", [])
    nodes = [e for e in elements if e.get("lat") and e.get("lon") and e.get("tags", {}).get("name")]
    print(f"[Extract] Fetched {len(nodes)} nodes with names.")
    return nodes


# ── Transform ─────────────────────────────────────────────────────────────────
def transform(nodes: list[dict]) -> list[dict]:
    rows = []
    for node in nodes:
        tags = node.get("tags", {})
        name = tags.get("name:zh") or tags.get("name") or "未命名"
        amenity = tags.get("amenity", "restaurant")
        cuisine = tags.get("cuisine", "").lower().split(";")[0].strip()
        raw_cat = CUISINE_TO_CAT.get(cuisine) or AMENITY_TO_CAT.get(amenity) or "台灣料理"
        category = raw_cat if raw_cat in VALID_CATS else "台灣料理"

        lat, lng = node["lat"], node["lon"]
        city     = tags.get("addr:city") or tags.get("addr:district") or infer_city(lat, lng)
        district = tags.get("addr:suburb") or tags.get("addr:quarter")
        address  = "".join(filter(None, [
            tags.get("addr:city"), tags.get("addr:street"), tags.get("addr:housenumber")
        ])) or None
        phone = tags.get("phone") or tags.get("contact:phone")

        metrics = synthetic_metrics(node["id"])
        rows.append({
            "gmap_place_id": f"osm:{node['id']}",
            "name":          name,
            "category":      category,
            "city":          city,
            "district":      district,
            "address":       address,
            "phone":         phone,
            "lat":           lat,
            "lng":           lng,
            **metrics,
        })
    print(f"[Transform] Transformed {len(rows)} rows.")
    return rows


# ── Load ──────────────────────────────────────────────────────────────────────
def load(supabase: Client, rows: list[dict], batch_size: int = 50) -> int:
    upserted = 0
    for i in range(0, len(rows), batch_size):
        batch = rows[i : i + batch_size]
        res = supabase.table("restaurants").upsert(batch, on_conflict="gmap_place_id").execute()
        upserted += len(res.data or [])
        print(f"  batch {i//batch_size + 1}: {len(res.data or [])} rows upserted")
        time.sleep(0.1)
    return upserted


# ── Pipeline log ──────────────────────────────────────────────────────────────
def log_run(supabase: Client, *, source: str, fetched: int, upserted: int,
            status: str, error, duration_ms: int):
    supabase.table("pipeline_logs").insert({
        "source":           source,
        "records_fetched":  fetched,
        "records_upserted": upserted,
        "status":           status,
        "error_message":    error,
        "duration_ms":      duration_ms,
    }).execute()


# ── Entry point ───────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Sua-Tshui ETL Pipeline")
    parser.add_argument("--limit", type=int, default=400, help="Max OSM nodes to fetch (default: 400)")
    args = parser.parse_args()

    supabase_url = os.environ.get("SUPABASE_URL")
    service_key  = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not service_key:
        print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.", file=sys.stderr)
        sys.exit(1)

    client: Client = create_client(supabase_url, service_key)
    t0 = time.monotonic()
    fetched = upserted = 0
    status = "success"
    error_msg = None

    try:
        nodes   = extract(args.limit)
        fetched = len(nodes)
        rows    = transform(nodes)
        upserted = load(client, rows)
        print(f"\n[Load] Done — {upserted} rows upserted into Supabase.")
    except Exception as exc:
        status = "error"
        error_msg = str(exc)
        print(f"[ERROR] {exc}", file=sys.stderr)

    duration_ms = int((time.monotonic() - t0) * 1000)
    log_run(
        client,
        source="OpenStreetMap Overpass API",
        fetched=fetched,
        upserted=upserted,
        status=status,
        error=error_msg,
        duration_ms=duration_ms,
    )
    print(f"[Done] status={status}, duration={duration_ms}ms")
    if status != "success":
        sys.exit(1)


if __name__ == "__main__":
    main()
