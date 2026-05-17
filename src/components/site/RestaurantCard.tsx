import { Link } from "react-router-dom";
import { Star, MapPin, Wallet } from "lucide-react";
import type { DBRestaurant } from "@/lib/restaurant-types";
import { priceLabel } from "@/lib/restaurant-types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800";

const RestaurantCard = ({ r }: { r: DBRestaurant }) => {
  const cover = r.cover_image || FALLBACK_IMAGE;
  return (
    <Link
      to={`/r/${r.id}`}
      className="group block rounded-2xl overflow-hidden bg-card border border-border shadow-card hover:shadow-stamp hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={cover}
          alt={r.name}
          loading="lazy"
          width={1024}
          height={768}
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src !== FALLBACK_IMAGE) img.src = FALLBACK_IMAGE;
          }}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 right-3 stamp h-10 w-10 text-sm rounded-full">
          {(r.rating ?? 0).toFixed(1)}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display font-bold text-lg text-ink truncate group-hover:text-primary transition-colors">
            {r.name}
          </h3>
          <span className="text-xs text-muted-foreground shrink-0 inline-flex items-center gap-1">
            <Wallet className="h-3 w-3" /> NT${r.avg_price ?? "—"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
          {r.description ?? priceLabel(r.avg_price)}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            {(r.rating ?? 0).toFixed(1)} ({(r.review_count ?? 0).toLocaleString()})
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {r.city}
            {r.district ? ` · ${r.district}` : ""}
          </span>
        </div>
        <div className="mt-3">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-foreground/70">
            {r.category}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
