import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, User, Globe, LogOut, BarChart2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo-suatshui.png";

const Header = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user?.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("已登出");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Sua-Tshui 食喙" className="h-10 w-10 object-contain" />
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Sua-Tshui<span className="text-muted-foreground text-xs ml-1 font-sans font-normal">食喙</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-foreground/80">
          <NavLink to="/search" className={({ isActive }) => isActive ? "text-primary" : "hover:text-primary transition-colors"}>探索餐廳</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "text-primary inline-flex items-center gap-1" : "hover:text-primary transition-colors inline-flex items-center gap-1"}>
            <BarChart2 className="h-3.5 w-3.5" />數據儀表板
          </NavLink>
          <a href="#categories" className="hover:text-primary transition-colors">分類</a>
          <a href="#cities" className="hover:text-primary transition-colors">縣市</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/search" className="md:hidden p-2 rounded-md hover:bg-muted" aria-label="Search">
            <Search className="h-5 w-5" />
          </Link>
          <button className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md hover:bg-muted text-foreground/70" aria-label="Language">
            <Globe className="h-4 w-4" /> 繁中
          </button>
          {email ? (
            <>
              <span className="hidden sm:inline text-xs text-muted-foreground max-w-[140px] truncate">{email}</span>
              <button onClick={logout} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted">
                <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">登出</span>
              </button>
            </>
          ) : (
            <Link to="/auth" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted">
              <User className="h-4 w-4" /> <span className="hidden sm:inline">登入</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;