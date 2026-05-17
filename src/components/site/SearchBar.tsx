import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users } from "lucide-react";

type Props = { variant?: "hero" | "compact" };

const SearchBar = ({ variant = "hero" }: Props) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("台北");
  const [people, setPeople] = useState(2);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (city) params.set("city", city);
    navigate(`/search?${params.toString()}`);
  };

  const isHero = variant === "hero";

  return (
    <form
      onSubmit={submit}
      className={`grid gap-2 rounded-xl border border-border bg-paper p-2 shadow-card md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center ${
        isHero ? "md:p-2" : "md:p-1.5"
      }`}
    >
      <label className="flex items-center gap-2 px-3 py-2.5 md:py-3">
        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋餐廳、料理或地點"
          className="w-full bg-transparent outline-none text-base placeholder:text-muted-foreground"
        />
      </label>
      <div className="hidden md:block w-px h-8 bg-border" />
      <label className="flex items-center gap-2 px-3 py-2.5">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="bg-transparent outline-none text-sm font-medium"
        >
          {["台北","新北","桃園","台中","台南","高雄","宜蘭","花蓮"].map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <div className="hidden md:block w-px h-8 bg-border" />
      <label className="flex items-center gap-2 px-3 py-2.5">
        <Users className="h-4 w-4 text-muted-foreground" />
        <select
          value={people}
          onChange={(e) => setPeople(Number(e.target.value))}
          className="bg-transparent outline-none text-sm font-medium"
        >
          {[1,2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} 人</option>)}
        </select>
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-warm px-6 py-3 text-primary-foreground font-semibold shadow-stamp hover:opacity-95 transition-opacity"
      >
        <Search className="h-4 w-4" /> 搜尋
      </button>
    </form>
  );
};

export default SearchBar;