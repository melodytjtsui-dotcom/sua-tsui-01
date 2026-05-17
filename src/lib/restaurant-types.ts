export type DBRestaurant = {
  id: number;
  name: string;
  category: string;
  city: string;
  district: string | null;
  address: string | null;
  phone: string | null;
  avg_price: number | null;
  rating: number | null;
  review_count: number | null;
  description: string | null;
  cover_image: string | null;
  open_hours: Record<string, string> | null;
  lat: number | null;
  lng: number | null;
};

export type DBReview = {
  id: number;
  restaurant_id: number;
  user_id: string | null;
  author_name: string | null;
  rating: number;
  content: string | null;
  is_tourist: boolean | null;
  created_at: string;
};

export const priceTierOf = (avg: number | null | undefined): 1 | 2 | 3 | 4 => {
  const p = avg ?? 0;
  if (p < 100) return 1;
  if (p < 500) return 2;
  if (p < 1000) return 3;
  return 4;
};

export const priceLabel = (avg: number | null | undefined): string => {
  const p = avg ?? 0;
  if (p < 100) return "NT$ 100 以下";
  if (p < 500) return "NT$ 100 – 500";
  if (p < 1000) return "NT$ 500 – 1000";
  return "NT$ 1000 以上";
};

export const dayLabels: Record<string, string> = {
  mon: "週一", tue: "週二", wed: "週三", thu: "週四",
  fri: "週五", sat: "週六", sun: "週日",
};