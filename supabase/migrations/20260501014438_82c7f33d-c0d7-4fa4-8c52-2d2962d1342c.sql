
-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved reviews viewable by everyone"
  ON public.reviews FOR SELECT
  USING (approved = true OR has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);

-- Seed site_content defaults
INSERT INTO public.site_content (section_key, content) VALUES
  ('socials', '{"instagram":"https://instagram.com/mishiofficial1701","email":"mishiofficial1701@gmail.com","phone":"+91 0000000000"}'::jsonb),
  ('policies', '{"delivery":"15-Day Royal Delivery — All orders are dispatched within 15 days of confirmation.","returns":"4-Day Return Window — Mandatory unboxing video required. No returns on personalized/custom items.","privacy":"Your data is sacred. We never share or sell customer information."}'::jsonb),
  ('hero', '{"title":"Where Love Unites Empires","subtitle":"A Royal Legacy of Fine Jewellery, Lab Grown Diamonds & Premium Fashion"}'::jsonb)
ON CONFLICT (section_key) DO NOTHING;
