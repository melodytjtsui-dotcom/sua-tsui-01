import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Star, MapPin, Phone, Clock, Wallet, Calendar, Check, ArrowLeft, Pencil, Trash2, X,
} from "lucide-react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { DBRestaurant, DBReview } from "@/lib/restaurant-types";
import { dayLabels, priceLabel } from "@/lib/restaurant-types";

const buildTimeSlots = () => {
  const slots: string[] = [];
  for (let h = 11; h <= 21; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h !== 21) slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
};
const timeSlots = buildTimeSlots();

const RestaurantDetail = () => {
  const { id } = useParams();
  const rid = Number(id);
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [r, setR] = useState<DBRestaurant | null>(null);
  const [reviews, setReviews] = useState<DBReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    if (!rid) return;
    (async () => {
      setLoading(true);
      const [{ data: rest }, { data: rvs }] = await Promise.all([
        supabase.from("restaurants").select("*").eq("id", rid).maybeSingle(),
        supabase.from("reviews").select("*").eq("restaurant_id", rid).order("created_at", { ascending: false }),
      ]);
      setR(rest as DBRestaurant | null);
      setReviews((rvs ?? []) as DBReview[]);
      setLoading(false);
    })();
  }, [rid]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
      setUserEmail(session?.user?.email ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
      setUserEmail(data.session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [people, setPeople] = useState(2);
  const [slot, setSlot] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "form" | "done">("select");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [revName, setRevName] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revContent, setRevContent] = useState("");
  const [revSubmitting, setRevSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState("");

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("請先登入後再發表評論");
      navigate("/auth");
      return;
    }
    if (!revContent.trim() || !revName.trim()) return;
    setRevSubmitting(true);
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        restaurant_id: rid,
        user_id: userId,
        author_name: revName.trim(),
        rating: revRating,
        content: revContent.trim(),
      })
      .select("*")
      .single();
    setRevSubmitting(false);
    if (error) {
      toast.error("評論送出失敗：" + error.message);
      return;
    }
    setReviews((prev) => [data as DBReview, ...prev]);
    setRevName("");
    setRevContent("");
    setRevRating(5);
    toast.success("評論已送出，感謝分享！");
  };

  const startEdit = (rv: DBReview) => {
    setEditingId(rv.id);
    setEditRating(rv.rating);
    setEditContent(rv.content ?? "");
  };

  const saveEdit = async (rvId: number) => {
    if (!editContent.trim()) return;
    const { data, error } = await supabase
      .from("reviews")
      .update({ rating: editRating, content: editContent.trim() })
      .eq("id", rvId)
      .select("*")
      .single();
    if (error) return toast.error("更新失敗：" + error.message);
    setReviews((prev) => prev.map((r) => (r.id === rvId ? (data as DBReview) : r)));
    setEditingId(null);
    toast.success("評論已更新");
  };

  const deleteReview = async (rvId: number) => {
    if (!confirm("確定要刪除這則評論嗎？")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", rvId);
    if (error) return toast.error("刪除失敗：" + error.message);
    setReviews((prev) => prev.filter((r) => r.id !== rvId));
    toast.success("評論已刪除");
  };

  const ratingDist = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach((rv) => {
      if (rv.rating >= 1 && rv.rating <= 5) dist[rv.rating - 1]++;
    });
    const total = reviews.length || 1;
    return dist.map((c) => Math.round((c / total) * 100));
  }, [reviews]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-32 text-center text-muted-foreground">載入中…</div>
        <Footer />
      </div>
    );
  }

  if (!r) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-32 text-center">
          <p className="text-muted-foreground">找不到此餐廳。</p>
          <Link to="/search" className="text-primary mt-4 inline-block">回搜尋頁</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const cover = r.cover_image || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600";
  const avgRating = r.rating ?? 0;
  const hours = (r.open_hours ?? {}) as Record<string, string>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        restaurant_id: r.id,
        date,
        time_slot: slot,
        party_size: people,
        guest_name: name,
        guest_phone: phone,
        guest_email: email || null,
        note: note || null,
        status: "pending",
      })
      .select("id")
      .single();
    setSubmitting(false);
    if (error) {
      toast.error("訂位失敗:" + error.message);
      return;
    }
    setBookingId(data.id);
    setStep("done");
    toast.success("訂位成功！");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Banner */}
      <div className="relative h-[420px] w-full overflow-hidden">
        <img src={cover} alt={r.name} width={1920} height={1280} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container relative h-full flex flex-col justify-end pb-8">
          <Link to="/search" className="inline-flex items-center gap-1 text-paper/80 hover:text-paper text-sm mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" /> 返回搜尋
          </Link>
          <span className="text-xs px-2 py-0.5 rounded-full bg-paper/15 text-paper border border-paper/20 backdrop-blur w-fit">{r.category}</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold text-paper">{r.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-paper/90 text-sm">
            <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-accent text-accent" />{avgRating.toFixed(1)} ({(r.review_count ?? 0).toLocaleString()} 則評論)</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{r.city} {r.district ?? ""}</span>
            <span className="inline-flex items-center gap-1.5"><Wallet className="h-4 w-4" />NT${r.avg_price ?? "—"} / 人</span>
          </div>
        </div>
      </div>

      <div className="container py-12 grid lg:grid-cols-[1fr_380px] gap-10">
        <main>
          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">概覽</TabsTrigger>
              <TabsTrigger value="reviews">評論</TabsTrigger>
              <TabsTrigger value="map">地圖</TabsTrigger>
              <TabsTrigger value="info">詳細資訊</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <section>
                <h2 className="font-display text-2xl font-bold mb-3">關於這間店</h2>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{r.description}</p>
              </section>
              <dl className="rounded-2xl border border-border bg-paper divide-y divide-border">
                {[
                  { icon: Phone, label: "電話", value: r.phone ?? "—" },
                  { icon: MapPin, label: "地址", value: r.address ?? "—" },
                  { icon: Wallet, label: "平均消費", value: `NT$${r.avg_price ?? "—"} / 人 · ${priceLabel(r.avg_price)}` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4 p-4">
                    <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="text-sm font-medium mt-0.5">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="rounded-2xl border border-border bg-paper p-6 mb-6 flex items-center gap-8">
                <div>
                  <div className="font-display text-5xl font-bold text-ink">{avgRating.toFixed(1)}</div>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className={`h-4 w-4 ${i <= Math.round(avgRating) ? "fill-accent text-accent" : "text-muted"}`} />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{(r.review_count ?? 0).toLocaleString()} 則評論</div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3 text-xs">
                      <span className="w-4 text-muted-foreground">{star}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${ratingDist[star - 1]}%` }} />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{ratingDist[star - 1]}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                    目前尚無評論，成為第一個評論的人！
                  </div>
                ) : (
                  reviews.slice(0, visibleCount).map((rv) => (
                    <article key={rv.id} className="rounded-2xl border border-border bg-paper p-5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground inline-flex items-center justify-center font-display font-bold">
                            {(rv.author_name ?? "匿").slice(0, 1)}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{rv.author_name ?? "匿名用戶"}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(rv.created_at).toLocaleDateString("zh-TW")} ·{" "}
                              <span className="text-secondary">{rv.is_tourist ? "旅客" : "在地"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star key={i} className={`h-3.5 w-3.5 ${i <= rv.rating ? "fill-accent text-accent" : "text-muted"}`} />
                            ))}
                          </div>
                          {userId && rv.user_id === userId && editingId !== rv.id && (
                            <div className="flex gap-1 ml-1">
                              <button onClick={() => startEdit(rv)} aria-label="編輯" className="p-1 text-muted-foreground hover:text-ink">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => deleteReview(rv.id)} aria-label="刪除" className="p-1 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {editingId === rv.id ? (
                        <div className="mt-3 space-y-2">
                          <div className="inline-flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <button key={i} type="button" onClick={() => setEditRating(i)} aria-label={`${i} 星`}>
                                <Star className={`h-5 w-5 ${i <= editRating ? "fill-accent text-accent" : "text-muted"}`} />
                              </button>
                            ))}
                          </div>
                          <textarea
                            rows={3}
                            maxLength={1000}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(rv.id)} className="rounded-lg bg-gradient-warm text-primary-foreground font-semibold px-4 py-1.5 text-sm shadow-stamp hover:opacity-95">
                              儲存
                            </button>
                            <button onClick={() => setEditingId(null)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
                              <X className="h-3.5 w-3.5" /> 取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        rv.content && <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{rv.content}</p>
                      )}
                    </article>
                  ))
                )}
                {reviews.length > visibleCount && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((c) => c + 10)}
                      className="rounded-lg border border-border bg-background px-5 py-2 text-sm font-medium hover:bg-muted"
                    >
                      載入更多評論（剩餘 {reviews.length - visibleCount}）
                    </button>
                  </div>
                )}
              </div>

              {userId ? (
              <form onSubmit={submitReview} className="mt-6 rounded-2xl border border-border bg-paper p-5 space-y-3">
                <h3 className="font-display text-lg font-bold">寫下你的評論</h3>
                <input
                  required
                  maxLength={40}
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                  placeholder="您的稱呼"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <div>
                  <span className="text-xs text-muted-foreground mr-2">評分</span>
                  <div className="inline-flex gap-1 align-middle">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRevRating(i)}
                        aria-label={`${i} 星`}
                      >
                        <Star className={`h-5 w-5 ${i <= revRating ? "fill-accent text-accent" : "text-muted"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  required
                  maxLength={1000}
                  rows={3}
                  value={revContent}
                  onChange={(e) => setRevContent(e.target.value)}
                  placeholder="分享你的用餐感想…"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none"
                />
                <button
                  type="submit"
                  disabled={revSubmitting}
                  className="rounded-lg bg-gradient-warm text-primary-foreground font-semibold px-5 py-2 text-sm shadow-stamp hover:opacity-95 disabled:opacity-50"
                >
                  {revSubmitting ? "送出中…" : "送出評論"}
                </button>
                <p className="text-xs text-muted-foreground">以 {userEmail} 身份發表</p>
              </form>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center">
                  <p className="text-sm text-muted-foreground mb-3">請先登入才能發表評論</p>
                  <Link to="/auth" className="inline-block rounded-lg bg-gradient-warm text-primary-foreground font-semibold px-5 py-2 text-sm shadow-stamp hover:opacity-95">
                    前往登入
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="map">
              <div className="rounded-2xl overflow-hidden border border-border bg-paper">
                {r.lat && r.lng ? (
                  <iframe
                    title={`${r.name} 地圖`}
                    src={`https://maps.google.com/maps?q=${r.lat},${r.lng}&z=16&output=embed`}
                    className="w-full h-[480px]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="p-12 text-center text-muted-foreground">未提供地圖座標。</div>
                )}
                <div className="p-4 text-sm border-t border-border flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary mt-0.5" />
                  <span>{r.address}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="info">
              <dl className="rounded-2xl border border-border bg-paper divide-y divide-border">
                {[
                  { label: "店名", value: r.name },
                  { label: "分類", value: r.category },
                  { label: "電話", value: r.phone ?? "—" },
                  { label: "地址", value: `${r.city} ${r.district ?? ""}　${r.address ?? ""}` },
                  { label: "平均消費", value: `NT$${r.avg_price ?? "—"} / 人` },
                  { label: "評分", value: `${avgRating.toFixed(1)} · ${(r.review_count ?? 0).toLocaleString()} 則評論` },
                ].map(({ label, value }) => (
                  <div key={label} className="grid grid-cols-[120px_1fr] gap-4 p-4">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-sm font-medium">{value}</dd>
                  </div>
                ))}
                <div className="p-4">
                  <dt className="text-xs text-muted-foreground mb-2 inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> 營業時間</dt>
                  <dd className="text-sm">
                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-y-1.5 gap-x-6">
                      {Object.entries(dayLabels).map(([k, label]) => (
                        <li key={k} className="flex justify-between border-b border-dashed border-border pb-1">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium">{hours[k] ?? "—"}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            </TabsContent>
          </Tabs>
        </main>

        {/* Booking widget */}
        <aside className="lg:sticky lg:top-20 self-start">
          <div className="rounded-2xl border border-border bg-paper shadow-card overflow-hidden">
            <div className="bg-gradient-warm text-primary-foreground p-5">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <h3 className="font-display text-lg font-bold">線上訂位</h3>
              </div>
              <p className="text-primary-foreground/85 text-sm mt-1">免費 · 即時確認</p>
            </div>
            <div className="p-5">
              {step === "select" && (
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-bold tracking-wider text-muted-foreground">日期</span>
                    <input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold tracking-wider text-muted-foreground">人數</span>
                    <select value={people} onChange={(e) => setPeople(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} 人</option>)}
                    </select>
                  </label>
                  <div>
                    <span className="text-xs font-bold tracking-wider text-muted-foreground">可預約時段</span>
                    <div className="mt-2 grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                      {timeSlots.map((t) => (
                        <button
                          key={t}
                          onClick={() => setSlot(t)}
                          className={`text-sm py-2 rounded-md border transition-colors ${slot === t ? "bg-ink text-paper border-ink" : "border-border hover:border-ink"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    disabled={!slot}
                    onClick={() => setStep("form")}
                    className="w-full rounded-lg bg-gradient-warm text-primary-foreground font-semibold py-3 shadow-stamp disabled:opacity-40 disabled:shadow-none hover:opacity-95 transition-opacity"
                  >
                    下一步
                  </button>
                </div>
              )}

              {step === "form" && (
                <form onSubmit={submit} className="space-y-3">
                  <div className="rounded-lg bg-muted px-3 py-2 text-sm">
                    <span className="text-muted-foreground">訂位資訊：</span>
                    {date} {slot} · {people} 人
                  </div>
                  <input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="姓名" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                  <input required maxLength={30} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="電話" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                  <input type="email" maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email（選填）" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                  <textarea maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="特殊需求（選填）" rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none" />
                  <button disabled={submitting} type="submit" className="w-full rounded-lg bg-gradient-warm text-primary-foreground font-semibold py-3 shadow-stamp hover:opacity-95 disabled:opacity-50">
                    {submitting ? "送出中…" : "確認訂位"}
                  </button>
                  <button type="button" onClick={() => setStep("select")} className="w-full text-xs text-muted-foreground hover:text-ink">返回上一步</button>
                </form>
              )}

              {step === "done" && (
                <div className="text-center py-4">
                  <div className="mx-auto h-14 w-14 rounded-full bg-secondary text-secondary-foreground inline-flex items-center justify-center">
                    <Check className="h-7 w-7" />
                  </div>
                  <h4 className="mt-4 font-display text-xl font-bold">訂位成功！</h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    訂位編號 <span className="font-mono font-bold text-ink">#{bookingId}</span><br />
                    {date} {slot} · {people} 人
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    餐廳將盡快確認您的訂位。
                  </p>
                  <button onClick={() => { setStep("select"); setSlot(null); setName(""); setPhone(""); setEmail(""); setNote(""); }} className="mt-5 text-sm text-primary font-medium">再訂一次</button>
                </div>
              )}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground text-center">送出即同意 Sua-Tshui 食喙 訂位條款</p>
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default RestaurantDetail;
