
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_content_len CHECK (content IS NULL OR char_length(content) <= 2000),
  ADD CONSTRAINT reviews_author_len CHECK (author_name IS NULL OR char_length(author_name) <= 80);

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_name_len CHECK (char_length(guest_name) BETWEEN 1 AND 80),
  ADD CONSTRAINT bookings_phone_len CHECK (char_length(guest_phone) BETWEEN 6 AND 30),
  ADD CONSTRAINT bookings_email_len CHECK (guest_email IS NULL OR char_length(guest_email) <= 200),
  ADD CONSTRAINT bookings_note_len CHECK (note IS NULL OR char_length(note) <= 500),
  ADD CONSTRAINT bookings_status_chk CHECK (status IN ('pending','confirmed','cancelled'));

DROP POLICY IF EXISTS "reviews anyone insert" ON public.reviews;
CREATE POLICY "reviews insert with identity check" ON public.reviews
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "bookings anyone insert" ON public.bookings;
CREATE POLICY "bookings insert with identity check" ON public.bookings
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
