CREATE POLICY "Authenticated users can insert orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);