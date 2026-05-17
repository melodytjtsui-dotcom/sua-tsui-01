
DROP POLICY IF EXISTS "bookings public read" ON public.bookings;
CREATE POLICY "bookings owner read" ON public.bookings
  FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
