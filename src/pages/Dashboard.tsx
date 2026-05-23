import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  Store, Star, MessageSquare, CalendarCheck, RefreshCw, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";
import { fetchAll } from "@/lib/supabase-fetch-all";
import type { DBRestaurant, DBReview } from "@/lib/restaurant-types";

// ── palette ──────────────────────────────────────────────────────────────────
const COLORS = ["#c0392b", "#e67e22", "#27ae60", "#2980b9", "#8e44ad", "#16a085"];
const CAT_COLORS: Record<string, string> = {
  "台灣料理": "#c0392b", "台式熱炒": "#e67e22", "台灣小吃": "#27ae60",
  "點心": "#2980b9", "咖啡廳": "#8e44ad", "早午餐": "#16a085",
};

// ── tiny helpers ──────────────────────────────────────────────────────────────
const groupBy = <T,>(arr: T[], key: (x: T) => string) =>
  arr.reduce<Record<string, T[]>>((acc, x) => {
    const k = key(x); acc[k] = [...(acc[k] ?? []), x]; return acc;
  }, {});

const avg = (nums: number[]) =>
  nums.length ? +(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : 0;

// ── types ─────────────────────────────────────────────────────────────────────
type PipelineLog = {
  id: number; ran_at: string; source: string;
  records_fetched: number; records_upserted: number;
  status: string; error_message: string | null; duration_ms: number | null;
};

type KPI = { label: string; value: string | number; icon: React.ElementType; color: string };

// ── KPI card ──────────────────────────────────────────────────────────────────
const KPICard = ({ label, value, icon: Icon, color }: KPI) => (
  <div className="rounded-2xl border border-border bg-paper p-5 flex items-center gap-4 shadow-sm">
    <div className={`rounded-xl p-3 ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-display font-bold text-ink">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  </div>
);

// ── section wrapper ───────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-paper p-5 shadow-sm">
    <h3 className="text-sm font-bold tracking-[0.15em] text-muted-foreground mb-4">{title}</h3>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [restaurants, setRestaurants] = useState<DBRestaurant[]>([]);
  const [reviews, setReviews]         = useState<Pick<DBReview, "created_at" | "rating">[]>([]);
  const [bookingCount, setBookingCount] = useState(0);
  const [logs, setLogs]               = useState<PipelineLog[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    const [
      rests,
      revs,
      { count: bCount },
      { data: pLogs },
    ] = await Promise.all([
      fetchAll<DBRestaurant>("restaurants"),
      fetchAll<Pick<DBReview, "created_at" | "rating">>("reviews", { select: "created_at, rating" }),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("pipeline_logs")
        .select("*")
        .order("ran_at", { ascending: false })
        .limit(5),
    ]);
    setRestaurants(rests);
    setReviews(revs);
    setBookingCount(bCount ?? 0);
    setLogs((pLogs ?? []) as PipelineLog[]);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    (async () => { setLoading(true); await fetchAll(); setLoading(false); })();
  }, [fetchAll]);

  // ── derived data ────────────────────────────────────────────────────────────
  const avgRating = avg(restaurants.map((r) => r.rating ?? 0).filter(Boolean));

  const byCity = Object.entries(groupBy(restaurants, (r) => r.city ?? "其他"))
    .map(([city, rs]) => ({ city, count: rs.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const byCategory = Object.entries(groupBy(restaurants, (r) => r.category))
    .map(([name, rs]) => ({ name, value: rs.length }));

  const ratingByCategory = Object.entries(groupBy(restaurants, (r) => r.category))
    .map(([name, rs]) => ({ name, avg: avg(rs.map((r) => r.rating ?? 0).filter(Boolean)) }))
    .filter((x) => x.avg > 0);

  const priceDist = [
    { label: "NT$100↓", count: restaurants.filter((r) => (r.avg_price ?? 0) < 100).length },
    { label: "100–500", count: restaurants.filter((r) => { const p = r.avg_price ?? 0; return p >= 100 && p < 500; }).length },
    { label: "500–1000", count: restaurants.filter((r) => { const p = r.avg_price ?? 0; return p >= 500 && p < 1000; }).length },
    { label: "1000↑", count: restaurants.filter((r) => (r.avg_price ?? 0) >= 1000).length },
  ];

  const ratingDist = [1, 2, 3, 4, 5].map((s) => ({
    stars: `${s}★`,
    count: restaurants.filter((r) => Math.round(r.rating ?? 0) === s).length,
  }));

  // monthly reviews
  const reviewsByMonth = Object.entries(
    reviews.reduce<Record<string, number>>((acc, r) => {
      const m = r.created_at.slice(0, 7);
      acc[m] = (acc[m] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, count]) => ({ month: month.replace("-", "/"), count }));

  // radar: multi-metric by category
  const radarData = Object.entries(groupBy(restaurants, (r) => r.category)).map(([cat, rs]) => ({
    category: cat,
    avgRating: avg(rs.map((r) => r.rating ?? 0).filter(Boolean)),
    count: rs.length,
    avgPrice: Math.round(avg(rs.map((r) => r.avg_price ?? 0).filter(Boolean)) / 100),
  }));

  // top 8 restaurants
  const topRestaurants = [...restaurants]
    .filter((r) => r.rating)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 8);

  // ── manual refresh pipeline ──────────────────────────────────────────────────
  const triggerRefresh = async () => {
    setRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke("pipeline-refresh");
      if (error) throw error;
      await fetchAll();
    } catch {
      // Edge Function not deployed yet — just re-fetch local data
      await fetchAll();
    } finally {
      setRefreshing(false);
    }
  };

  // ── render ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh] text-muted-foreground">載入中…</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-10 space-y-8">
        {/* ── page title ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.2em] text-primary font-bold mb-1">ANALYTICS</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold">數據儀表板</h1>
            <p className="text-muted-foreground text-sm mt-1">
              台灣餐廳評鑑平台 — 即時數據總覽
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                最後更新 {lastRefresh.toLocaleTimeString("zh-TW")}
              </span>
            )}
            <button
              onClick={triggerRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60 transition"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "更新中…" : "刷新資料"}
            </button>
          </div>
        </div>

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="收錄餐廳" value={restaurants.length.toLocaleString()} icon={Store} color="bg-red-500" />
          <KPICard label="平均評分" value={avgRating > 0 ? avgRating.toFixed(2) : "—"} icon={Star} color="bg-amber-500" />
          <KPICard label="用戶評論數" value={reviews.length.toLocaleString()} icon={MessageSquare} color="bg-blue-500" />
          <KPICard label="訂位紀錄" value={bookingCount.toLocaleString()} icon={CalendarCheck} color="bg-green-500" />
        </div>

        {/* ── row 1: city bar + category pie ── */}
        <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
          <Section title="各縣市餐廳數量">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byCity} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="city" width={40} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`${v} 家`, "餐廳數"]} />
                <Bar dataKey="count" fill="#c0392b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Section>

          <Section title="餐廳類型分布">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={byCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {byCategory.map((entry) => (
                    <Cell key={entry.name} fill={CAT_COLORS[entry.name] ?? "#999"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} 家`, "數量"]} />
              </PieChart>
            </ResponsiveContainer>
          </Section>
        </div>

        {/* ── row 2: avg rating by category + price dist ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Section title="各類型平均評分">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ratingByCategory} margin={{ left: 0, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[3.5, 5]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [v.toFixed(2), "平均評分"]} />
                <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                  {ratingByCategory.map((entry) => (
                    <Cell key={entry.name} fill={CAT_COLORS[entry.name] ?? "#c0392b"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Section>

          <Section title="評分星級分布">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ratingDist} margin={{ left: 0, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stars" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip formatter={(v: number) => [`${v} 家`, "餐廳數"]} />
                <Bar dataKey="count" fill="#e67e22" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Section>
        </div>

        {/* ── row 3: price tier + radar ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Section title="價位分布">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={priceDist} margin={{ left: 0, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip formatter={(v: number) => [`${v} 家`, "餐廳數"]} />
                <Bar dataKey="count" fill="#27ae60" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Section>

          <Section title="類型多維比較（評分 / 數量 / 均價×100）">
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={85}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fontSize: 10 }} />
                <Radar name="平均評分" dataKey="avgRating" stroke="#c0392b" fill="#c0392b" fillOpacity={0.3} />
                <Radar name="數量(÷10)" dataKey="count" stroke="#2980b9" fill="#2980b9" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Section>
        </div>

        {/* ── row 4: reviews timeline ── */}
        {reviewsByMonth.length > 0 && (
          <Section title="評論數量趨勢（近 12 個月）">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={reviewsByMonth} margin={{ left: 0, right: 16 }}>
                <defs>
                  <linearGradient id="reviewGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c0392b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c0392b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip formatter={(v: number) => [`${v} 則`, "評論數"]} />
                <Area type="monotone" dataKey="count" stroke="#c0392b" fill="url(#reviewGrad)" strokeWidth={2} dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Section>
        )}

        {/* ── row 5: top restaurants table ── */}
        {topRestaurants.length > 0 && (
          <Section title="評分最高餐廳 TOP 8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4">#</th>
                    <th className="pb-2 pr-4">餐廳名稱</th>
                    <th className="pb-2 pr-4">類型</th>
                    <th className="pb-2 pr-4">城市</th>
                    <th className="pb-2 pr-4 text-right">評分</th>
                    <th className="pb-2 text-right">評論數</th>
                  </tr>
                </thead>
                <tbody>
                  {topRestaurants.map((r, i) => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2.5 pr-4 text-muted-foreground font-mono">{i + 1}</td>
                      <td className="py-2.5 pr-4 font-medium">{r.name}</td>
                      <td className="py-2.5 pr-4">
                        <span className="px-2 py-0.5 rounded-full text-xs border border-border">{r.category}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{r.city}</td>
                      <td className="py-2.5 pr-4 text-right">
                        <span className="font-bold text-amber-600">★ {r.rating?.toFixed(1)}</span>
                      </td>
                      <td className="py-2.5 text-right text-muted-foreground">
                        {(r.review_count ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* ── row 6: pipeline log ── */}
        <Section title="資料管道執行紀錄">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              尚無執行紀錄。點擊「刷新資料」以觸發資料管道。
            </p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-4 py-2.5 text-sm">
                  {log.status === "success"
                    ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    : <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                  }
                  <span className="text-muted-foreground text-xs">{new Date(log.ran_at).toLocaleString("zh-TW")}</span>
                  <span className="font-medium">{log.source}</span>
                  <span className="text-muted-foreground">抓取 {log.records_fetched} 筆 → 寫入 {log.records_upserted} 筆</span>
                  {log.duration_ms && (
                    <span className="ml-auto text-xs text-muted-foreground">{(log.duration_ms / 1000).toFixed(1)}s</span>
                  )}
                  {log.error_message && (
                    <span className="text-xs text-red-500">{log.error_message}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
