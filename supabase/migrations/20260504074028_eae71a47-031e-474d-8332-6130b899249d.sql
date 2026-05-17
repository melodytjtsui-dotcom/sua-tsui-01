
CREATE TABLE public.restaurants (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  address TEXT,
  phone TEXT,
  avg_price INT,
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INT DEFAULT 0,
  description TEXT,
  cover_image TEXT,
  open_hours JSONB,
  lat NUMERIC(9,6),
  lng NUMERIC(9,6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.reviews (
  id BIGSERIAL PRIMARY KEY,
  restaurant_id BIGINT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID,
  author_name TEXT,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  is_tourist BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.bookings (
  id BIGSERIAL PRIMARY KEY,
  restaurant_id BIGINT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  party_size INT NOT NULL CHECK (party_size BETWEEN 1 AND 20),
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  guest_email TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "restaurants public read" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "bookings public read" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "bookings anyone insert" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews anyone insert" ON public.reviews FOR INSERT WITH CHECK (true);

CREATE INDEX idx_restaurants_city ON public.restaurants(city);
CREATE INDEX idx_restaurants_category ON public.restaurants(category);
CREATE INDEX idx_reviews_restaurant ON public.reviews(restaurant_id);
CREATE INDEX idx_bookings_restaurant ON public.bookings(restaurant_id);
