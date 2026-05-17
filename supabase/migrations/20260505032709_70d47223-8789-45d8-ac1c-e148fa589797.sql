ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS gmap_place_id text;
DELETE FROM public.bookings;
DELETE FROM public.reviews;
DELETE FROM public.restaurants;