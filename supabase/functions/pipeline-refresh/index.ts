/**
 * pipeline-refresh — Supabase Edge Function
 *
 * ETL Pipeline:
 *   Extract  → OpenStreetMap Overpass API (real Taiwan restaurant data)
 *   Transform → normalize category, city, price, synthetic ratings
 *   Load      → upsert into public.restaurants
 *   Log       → insert into public.pipeline_logs
 *
 * Deploy:  supabase functions deploy pipeline-refresh
 * Schedule: Supabase Dashboard → Edge Functions → pipeline-refresh → Add cron
 *           e.g. "0 2 * * *"  (daily at 02:00 UTC)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── category mapping ────────────────────────────────────────────────────────
const AMENITY_TO_CAT: Record<string, string> = {
  restaurant: "台灣料理",
  fast_food:  "台灣小吃",
  cafe:       "咖啡廳",
};
const CUISINE_TO_CAT: Record<string, string> = {
  taiwanese:  "台灣料理",
  chinese:    "台灣料理",
  noodles:    "台灣小吃",
  dumpling:   "點心",
  bubble_tea: "台灣小吃",
  coffee:     "咖啡廳",
  brunch:     "早午餐",
  breakfast:  "早午餐",
  hotpot:     "台式熱炒",
  stir_fry:   "台式熱炒",
};
const VALID_CATS = new Set(["台灣料理","台式熱炒","台灣小吃","點心","咖啡廳","早午餐"]);

// Taiwan city bounding-box centers → used to infer city from lat/lng
const CITY_CENTERS: { city: string; lat: number; lng: number; r: number }[] = [
  { city: "台北", lat: 25.045, lng: 121.53, r: 0.20 },
  { city: "新北", lat: 25.012, lng: 121.47, r: 0.35 },
  { city: "桃園", lat: 24.993, lng: 121.30, r: 0.25 },
  { city: "新竹", lat: 24.803, lng: 120.97, r: 0.20 },
  { city: "台中", lat: 24.147, lng: 120.67, r: 0.30 },
  { city: "台南", lat: 22.994, lng: 120.20, r: 0.30 },
  { city: "高雄", lat: 22.625, lng: 120.31, r: 0.35 },
  { city: "宜蘭", lat: 24.757, lng: 121.75, r: 0.25 },
  { city: "花蓮", lat: 23.971, lng: 121.60, r: 0.30 },
];

function inferCity(lat: number, lng: number): string {
  let best = { city: "其他", dist: Infinity };
  for (const c of CITY_CENTERS) {
    const d = Math.sqrt((lat - c.lat) ** 2 + (lng - c.lng) ** 2);
    if (d < best.dist && d < c.r) best = { city: c.city, dist: d };
  }
  return best.city;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 43758.5453123;
  return x - Math.floor(x);
}

// Generate deterministic but realistic rating from OSM node id
function syntheticRating(osmId: number): { rating: number; review_count: number; avg_price: number } {
  const r1 = seededRandom(osmId);
  const r2 = seededRandom(osmId + 1);
  const r3 = seededRandom(osmId + 2);
  return {
    rating:       +(3.2 + r1 * 1.8).toFixed(1),
    review_count: Math.floor(20 + r2 * 3000),
    avg_price:    Math.floor(80 + r3 * 920),
  };
}

type OsmNode = {
  id: number; lat: number; lon: number;
  tags?: Record<string, string>;
};

// ── Overpass query ──────────────────────────────────────────────────────────
const OVERPASS_QUERY = `
[out:json][timeout:60];
area["ISO3166-1"="TW"][admin_level=2]->.taiwan;
(
  node["amenity"="restaurant"](area.taiwan);
  node["amenity"="cafe"](area.taiwan);
  node["amenity"="fast_food"](area.taiwan);
);
out body 400;
`.trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const startMs = Date.now();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let recordsFetched = 0;
  let recordsUpserted = 0;
  let status = "success";
  let errorMsg: string | null = null;

  try {
    // ── Extract ─────────────────────────────────────────────────────────────
    const overpassRes = await fetch(
      "https://overpass-api.de/api/interpreter",
      { method: "POST", body: OVERPASS_QUERY,
        headers: { "Content-Type": "text/plain" }, signal: AbortSignal.timeout(55_000) },
    );
    if (!overpassRes.ok) throw new Error(`Overpass HTTP ${overpassRes.status}`);
    const json = await overpassRes.json() as { elements: OsmNode[] };
    const nodes = json.elements.filter((e) => e.lat && e.lon && e.tags?.name);
    recordsFetched = nodes.length;

    // ── Transform ────────────────────────────────────────────────────────────
    const rows = nodes.map((node) => {
      const tags = node.tags ?? {};
      const name = tags["name:zh"] || tags["name"] || "未命名";
      const amenity = tags["amenity"] ?? "restaurant";
      const cuisine = (tags["cuisine"] ?? "").toLowerCase().split(";")[0].trim();
      const rawCat = CUISINE_TO_CAT[cuisine] ?? AMENITY_TO_CAT[amenity] ?? "台灣料理";
      const category = VALID_CATS.has(rawCat) ? rawCat : "台灣料理";
      const city = tags["addr:city"] || tags["addr:district"] || inferCity(node.lat, node.lon);
      const district = tags["addr:suburb"] || tags["addr:quarter"] || null;
      const address = [tags["addr:city"], tags["addr:street"], tags["addr:housenumber"]]
        .filter(Boolean).join("") || null;
      const phone = tags["phone"] || tags["contact:phone"] || null;
      const synthetic = syntheticRating(node.id);

      return {
        gmap_place_id: `osm:${node.id}`,
        name,
        category,
        city,
        district,
        address,
        phone,
        lat: node.lat,
        lng: node.lon,
        rating: synthetic.rating,
        review_count: synthetic.review_count,
        avg_price: synthetic.avg_price,
      };
    });

    // ── Load (upsert) ─────────────────────────────────────────────────────────
    const BATCH = 50;
    let upserted = 0;
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      const { error, count } = await supabase
        .from("restaurants")
        .upsert(batch, { onConflict: "gmap_place_id", count: "exact" });
      if (error) throw error;
      upserted += count ?? batch.length;
    }
    recordsUpserted = upserted;

  } catch (err) {
    status = "error";
    errorMsg = err instanceof Error ? err.message : String(err);
  }

  // ── Log ──────────────────────────────────────────────────────────────────
  await supabase.from("pipeline_logs").insert({
    source:           "OpenStreetMap Overpass API",
    records_fetched:  recordsFetched,
    records_upserted: recordsUpserted,
    status,
    error_message:    errorMsg,
    duration_ms:      Date.now() - startMs,
  });

  const body = JSON.stringify({ status, recordsFetched, recordsUpserted, errorMsg });
  return new Response(body, {
    status: status === "success" ? 200 : 500,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
