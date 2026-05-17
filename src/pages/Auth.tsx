import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/", { replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("註冊成功！請查看信箱完成驗證。");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("登入成功！");
      navigate("/", { replace: true });
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) return toast.error("Google 登入失敗");
    if (result.redirected) return;
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-16 max-w-md">
        <h1 className="font-display text-3xl font-bold mb-6 text-center">
          {mode === "login" ? "登入" : "註冊"}
        </h1>
        <form onSubmit={submit} className="rounded-2xl border border-border bg-paper p-6 space-y-3">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密碼（至少 6 字元）"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-warm text-primary-foreground font-semibold py-2.5 shadow-stamp hover:opacity-95 disabled:opacity-50"
          >
            {loading ? "處理中…" : mode === "login" ? "登入" : "註冊"}
          </button>
          <div className="relative my-2 text-center text-xs text-muted-foreground">
            <span className="bg-paper px-2 relative z-10">或</span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
          </div>
          <button
            type="button"
            onClick={google}
            className="w-full rounded-lg border border-border bg-background py-2.5 text-sm font-medium hover:bg-muted"
          >
            使用 Google 繼續
          </button>
          <p className="text-center text-xs text-muted-foreground pt-2">
            {mode === "login" ? "還沒有帳號？" : "已經有帳號？"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary font-medium"
            >
              {mode === "login" ? "註冊" : "登入"}
            </button>
          </p>
          <p className="text-center text-xs">
            <Link to="/" className="text-muted-foreground hover:text-ink">回首頁</Link>
          </p>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;