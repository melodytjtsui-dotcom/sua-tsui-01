CREATE POLICY "reviews owner update" ON public.reviews FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid()) WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "reviews owner delete" ON public.reviews FOR DELETE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());