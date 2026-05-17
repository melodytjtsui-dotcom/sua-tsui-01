import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import SearchBar from "@/components/site/SearchBar";
import RestaurantCard from "@/components/site/RestaurantCard";
import { categories, cities } from "@/data/restaurants";
import { SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { DBRestaurant } from "@/lib/restaurant-types";
import { priceTierOf } from "@/lib/restaurant-types";

const priceTiers = [
  { v: 1, label: "NT$ 100 以下" },
  { v: 2, label: "NT$ 100 – 500" },
  { v: 3, label: "NT$ 500 – 1000" },
  { v: 4, label: "NT$ 1000 以上" },
];

const sorts = [
  { v: "rating", label: "評分最高" },
  { v: "reviews", label: "最多評論" },
];

const Search = () => {
  const [params] = useSearchParams();
  const initCity = params.get("city") || "";
  const initCategory = params.get("category") || "";
  const initQ = params.get("q") || "";

  const [city, setCity] = useState(initCity);
  const [category, setCategory] = useState(initCategory);
  const [tiers, setTiers] = useState<number[]>([]);
  const [sort, setSort] = useState("rating");
  const [all, setAll] = useState<DBRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("restaurants").select("*");
      setAll((data ?? []) as DBRestaurant[]);
      setLoading(false);
    })();
  }, []);

  const results = useMemo(() => {
    let r = [...all];
    if (initQ) {
      const q = initQ.toLowerCase();
      r = r.filter((x) =>
        [x.name, x.category, x.city, x.district ?? "", x.description ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    if (city) r = r.filter((x) => x.city === city);
    if (category) r = r.filter((x) => x.category === category);
    if (tiers.length) r = r.filter((x) => tiers.includes(priceTierOf(x.avg_price)));
    if (sort === "rating") r.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === "reviews") r.sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0));
    return r;
  }, [all, initQ, city, category, tiers, sort]);

  const toggleTier = (v: number) =>
    setTiers((t) => (t.includes(v) ? t.filter((x) => x !== v) : [...t, v]));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="bg-paper border-b border-border">
        <div className="container py-6">
          <SearchBar variant="compact" />
        </div>
      </div>

      <div className="container py-8 grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="space-y-6 lg:sticky lg:top-20 self-start">
          <div className="flex items-center gap-2 text-sm font-display font-bold text-ink">
            <SlidersHorizontal className="h-4 w-4" /> 篩選條件
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-[0.15em] text-muted-foreground mb-3">縣市</h4>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setCity("")} className={`text-xs px-2.5 py-1 rounded-full border ${!city ? "bg-ink text-paper border-ink" : "border-border hover:border-ink"}`}>全部</button>
              {cities.slice(0, 9).map((c) => (
                <button key={c.name} onClick={() => setCity(city === c.name ? "" : c.name)} className={`text-xs px-2.5 py-1 rounded-full border ${city === c.name ? "bg-ink text-paper border-ink" : "border-border hover:border-ink"}`}>{c.name}</button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-[0.15em] text-muted-foreground mb-3">分類</h4>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setCategory("")} className={`text-xs px-2.5 py-1 rounded-full border ${!category ? "bg-ink text-paper border-ink" : "border-border hover:border-ink"}`}>全部</button>
              {categories.map((c) => (
                <button key={c.name} onClick={() => setCategory(category === c.name ? "" : c.name)} className={`text-xs px-2.5 py-1 rounded-full border ${category === c.name ? "bg-ink text-paper border-ink" : "border-border hover:border-ink"}`}>{c.name}</button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-[0.15em] text-muted-foreground mb-3">平均消費</h4>
            <div className="space-y-2">
              {priceTiers.map((p) => (
                <label key={p.v} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={tiers.includes(p.v)} onChange={() => toggleTier(p.v)} className="accent-primary" />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <main>
          <div className="flex items-end justify-between mb-5">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                {city || "全台"}{category && ` · ${category}`}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">共 {results.length} 家符合條件的餐廳</p>
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm px-3 py-2 rounded-lg border border-border bg-paper">
              {sorts.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-12">載入中…</div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              找不到符合條件的餐廳，試試放寬篩選條件。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((r) => <RestaurantCard key={r.id} r={r} />)}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Search;
