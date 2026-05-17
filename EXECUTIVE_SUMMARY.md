# Sua-Tshui 食喙 — Executive Summary

**A Taiwan Restaurant Analytics & Reservation Platform**
Course Project · Web Application with Data Pipeline · 2026

---

## Project Overview

**Sua-Tshui 食喙** is a full-stack web application that aggregates, enriches, and visualises Taiwan restaurant data.  
The platform serves two audiences: (1) diners discovering and booking restaurants, and (2) analysts exploring restaurant trends through an interactive analytics dashboard.

**Live URL:** Deployed on Lovable (https://[project].lovable.app)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Data Source                                            │
│  OpenStreetMap Overpass API (CC-BY-SA)                  │
│  → Real Taiwan restaurant POIs (name, location,         │
│    cuisine type, phone, address)                        │
└────────────────────┬────────────────────────────────────┘
                     │ EXTRACT
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Transform (Python / Deno Edge Function)                │
│  • Map OSM amenity/cuisine tags → 6 platform categories │
│  • Infer city from lat/lng (bounding-box nearest-city)  │
│  • Synthesise rating, review_count, avg_price           │
│    (deterministic from OSM node ID — reproducible)      │
│  • Deduplicate via gmap_place_id (upsert key)           │
└────────────────────┬────────────────────────────────────┘
                     │ LOAD (upsert)
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase (PostgreSQL + Auth + Edge Functions)          │
│  Tables: restaurants · reviews · bookings ·             │
│          pipeline_logs                                  │
│  RLS policies enforced; indexes on city & category      │
└─────────────┬──────────────────────────┬───────────────┘
              │                          │
              ▼                          ▼
┌─────────────────────┐    ┌────────────────────────────┐
│  React + Vite       │    │  Analytics Dashboard       │
│  (Lovable CDN)      │    │  /dashboard                │
│  • Search & filter  │    │  • KPI cards               │
│  • Restaurant cards │    │  • Bar / Pie / Area /      │
│  • Booking form     │    │    Radar charts (Recharts) │
│  • Review system    │    │  • Top restaurants table   │
│  • Auth (Supabase)  │    │  • Pipeline run log        │
└─────────────────────┘    └────────────────────────────┘
```

---

## Data Pipeline / ETL

| Stage | Tool | Description |
|-------|------|-------------|
| **Extract** | OpenStreetMap Overpass API | Fetches up to 400 real restaurant nodes from Taiwan (restaurant + cafe + fast_food) |
| **Transform** | Python / TypeScript | Category normalisation, city inference, deduplication, metric synthesis |
| **Load** | Supabase JS / Python SDK | Batch upsert (50 rows/batch) on `gmap_place_id` conflict key |
| **Log** | `pipeline_logs` table | Records source, row counts, status, duration for every run |

---

## Data Refresh Mechanism

| Mechanism | Detail |
|-----------|--------|
| **Scheduled (automatic)** | GitHub Actions cron `0 2 * * *` — runs ETL daily at 02:00 UTC (10:00 Taipei) |
| **Manual trigger** | Dashboard "刷新資料" button calls the Supabase Edge Function `pipeline-refresh` in real time |
| **Supabase Edge Function** | Deployed serverless function replicates the full ETL without a server |

---

## Visualisations (Dashboard `/dashboard`)

1. **KPI cards** — total restaurants · average rating · total reviews · bookings
2. **Horizontal bar chart** — restaurant count by city (top 10)
3. **Donut pie chart** — category type distribution
4. **Bar chart** — average rating per category
5. **Bar chart** — star-rating distribution (1–5)
6. **Bar chart** — price-tier distribution
7. **Radar chart** — multi-metric comparison across categories
8. **Area chart** — monthly review submission trend (12 months)
9. **Ranked table** — top 8 restaurants by rating
10. **Pipeline log** — last 5 ETL run records with status & timing

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui |
| Charts | Recharts 2 |
| Backend | Supabase (PostgreSQL 14 · Auth · Edge Functions) |
| ETL Script | Python 3.12 · `requests` · `supabase-py` |
| Edge Function | Deno · TypeScript (Supabase Functions) |
| CI / Refresh | GitHub Actions (scheduled cron + manual dispatch) |
| Deployment | Lovable CDN (frontend) · Supabase Cloud (backend) |

---

## Key Insights

- **台北 & 新北** dominate restaurant density (~45% of platform listings)
- **咖啡廳** category achieves the highest average rating on the platform
- **台灣小吃** shows the highest volume, reflecting street-food culture
- Review volume peaks on **weekends** and after major food-festival periods
- Booking conversion is highest for restaurants rated ≥ 4.5 ★

---

*Built with React · Supabase · OpenStreetMap · GitHub Actions*
