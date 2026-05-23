import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight, Sparkles, ShieldCheck, Calendar } from "lucide-react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import SearchBar from "@/components/site/SearchBar";
import RestaurantCard from "@/components/site/RestaurantCard";
import { categories } from "@/data/restaurants";
import hero from "@/assets/hero-taiwan-food.jpg";
import { supabase } from "@/integrations/supabase/client";
import type { DBRestaurant } from "@/lib/restaurant-types";

const featuredCities = ["台北", "新北", "台中", "台南", "高雄", "桃園"];

const Index = () => {
  const [featured, setFeatured] = useState<DBRestaurant[]>([]);
  const [cityCounts, setCityCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      // Featured: high-rated restaurants with meaningful review counts
      // Sort by review_count DESC (so popular ones show first), min rating filter
      // This avoids showing 5.0 restaurants with only 1-2 reviews
      const { data } = await supabase
        .from("restaurants")
        .select("*")
        .gte("rating", 4.0)
        .gte("review_count", 100)
        .order("review_count", { ascending: false })
        .limit(6);
      setFeatured((data ?? []) as DBRestaurant[]);

      // Use per-city COUNT queries — avoids client-side pagination issues
      const cityCountResults = await Promise.all(
        featuredCities.map(async (city) => {
          const { count } = await supabase
            .from("restaurants")
            .select("*", { count: "exact", head: true })
            .eq("city", city);
          return [city, count ?? 0] as [string, number];
        })
      );
      setCityCounts(Object.fromEntries(cityCountResults));
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative">
        <div className="relative h-[640px] md:h-[720px] w-full overflow-hidden">
          <img
            src={hero}
            alt="台灣美食"
            width={1920}
            height={1280}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="relative container h-full flex flex-col justify-end pb-16 md:pb-24">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper/15 text-paper text-xs backdrop-blur border border-paper/20">
                <Sparkles className="h-3.5 w-3.5" /> 台灣首屈一指的餐廳評鑑與訂位平台
              </span>
              <h1 className="mt-4 font-display font-black text-paper text-5xl md:text-7xl leading-[1.05] tracking-tight">
                從一碗熱湯<br />
                <span className="text-accent">開始探索台灣。</span>
              </h1>
              <p className="mt-5 text-paper/85 text-lg max-w-xl">
                精選全台在地名店，真實評論、線上訂位，一站搞定你的下一餐。
              </p>
            </div>
            <div className="mt-8 max-w-4xl">
              <SearchBar />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-paper/80">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-accent" /> 真實用戶評鑑</span>
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4 text-accent" /> 線上即時訂位</span>
              <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 text-accent" /> 在地小吃完整收錄</span>
            </div>
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section id="cities" className="container py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.2em] text-primary font-bold mb-2">BROWSE BY CITY</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">依縣市瀏覽</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {featuredCities.map((name) => (
            <Link
              key={name}
              to={`/search?city=${encodeURIComponent(name)}`}
              className="group flex items-center justify-between rounded-xl border border-border bg-paper px-5 py-4 hover:border-primary hover:shadow-card transition-all"
            >
              <div>
                <div className="font-display font-bold text-lg text-ink group-hover:text-primary transition-colors">{name}</div>
                <div className="text-xs text-muted-foreground">{cityCounts[name] ?? 0} 家餐廳</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="container pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.2em] text-primary font-bold mb-2">EXPLORE BY CUISINE</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">依分類瀏覽</h2>
          </div>
          <Link to="/search" className="text-sm font-medium text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
            查看全部 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c) => (
            <Link
              key={c.name}
              to={`/search?category=${encodeURIComponent(c.name)}`}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-muted shadow-card hover:shadow-stamp transition-all"
            >
              <img src={c.image} alt={c.name} loading="lazy" width={1024} height={768} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="text-2xl mb-1">{c.emoji}</div>
                <h3 className="font-display font-bold text-paper text-lg">{c.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="bg-gradient-paper border-y border-border">
        <div className="container py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs tracking-[0.2em] text-primary font-bold mb-2">EDITOR'S PICKS</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold">本週精選餐廳</h2>
              <p className="text-muted-foreground mt-2">編輯團隊與在地饕客一致推薦</p>
            </div>
            <Link to="/search" className="text-sm font-medium text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
              查看全部 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {featured.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">載入中…</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((r) => <RestaurantCard key={r.id} r={r} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-24">
        <div className="relative overflow-hidden rounded-3xl bg-secondary text-secondary-foreground p-10 md:p-16">
          <div className="absolute -top-10 -right-10 stamp h-48 w-48 rotate-12 text-6xl opacity-90">食</div>
          <div className="relative max-w-xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
              你是餐廳業者？<br />讓更多饕客找到你。
            </h2>
            <p className="mt-3 text-secondary-foreground/80">
              免費上架店家資訊、管理線上訂位、回覆顧客評論。
            </p>
            <button className="mt-6 inline-flex items-center gap-2 rounded-lg bg-paper text-ink px-6 py-3 font-semibold hover:bg-accent transition-colors">
              申請業者後台 <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
