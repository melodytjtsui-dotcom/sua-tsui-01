-- Sua-Tshui 食喙 — Full Schema Setup
-- Paste this entire file into Supabase SQL Editor and run it once.

CREATE TABLE public.restaurants (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL,
  city          TEXT,
  district      TEXT,
  address       TEXT,
  phone         TEXT,
  avg_price     INT,
  rating        NUMERIC(2,1) DEFAULT 0,
  review_count  INT DEFAULT 0,
  description   TEXT,
  cover_image   TEXT,
  open_hours    JSONB,
  lat           NUMERIC(9,6),
  lng           NUMERIC(9,6),
  gmap_place_id TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.reviews (
  id            BIGSERIAL PRIMARY KEY,
  restaurant_id BIGINT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id       UUID,
  author_name   TEXT CHECK (author_name IS NULL OR char_length(author_name) <= 80),
  rating        INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content       TEXT CHECK (content IS NULL OR char_length(content) <= 2000),
  is_tourist    BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.bookings (
  id            BIGSERIAL PRIMARY KEY,
  restaurant_id BIGINT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id       UUID,
  date          DATE NOT NULL,
  time_slot     TEXT NOT NULL,
  party_size    INT NOT NULL CHECK (party_size BETWEEN 1 AND 20),
  guest_name    TEXT NOT NULL CHECK (char_length(guest_name) BETWEEN 1 AND 80),
  guest_phone   TEXT NOT NULL CHECK (char_length(guest_phone) BETWEEN 6 AND 30),
  guest_email   TEXT CHECK (guest_email IS NULL OR char_length(guest_email) <= 200),
  note          TEXT CHECK (note IS NULL OR char_length(note) <= 500),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pipeline_logs (
  id               BIGSERIAL PRIMARY KEY,
  ran_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  source           TEXT NOT NULL,
  records_fetched  INT NOT NULL DEFAULT 0,
  records_upserted INT NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'success',
  error_message    TEXT,
  duration_ms      INT
);

-- Indexes
CREATE INDEX idx_restaurants_city     ON public.restaurants(city);
CREATE INDEX idx_restaurants_category ON public.restaurants(category);
CREATE INDEX idx_reviews_restaurant   ON public.reviews(restaurant_id);
CREATE INDEX idx_bookings_restaurant  ON public.bookings(restaurant_id);

-- RLS
ALTER TABLE public.restaurants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "restaurants public read"   ON public.restaurants  FOR SELECT USING (true);
CREATE POLICY "reviews public read"       ON public.reviews       FOR SELECT USING (true);
CREATE POLICY "pipeline_logs public read" ON public.pipeline_logs FOR SELECT USING (true);
CREATE POLICY "pipeline_logs anyone insert" ON public.pipeline_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "reviews insert"  ON public.reviews  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "reviews update"  ON public.reviews  FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "reviews delete"  ON public.reviews  FOR DELETE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "bookings insert" ON public.bookings FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "bookings read"   ON public.bookings FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
