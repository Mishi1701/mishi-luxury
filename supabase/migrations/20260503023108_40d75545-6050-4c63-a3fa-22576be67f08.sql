ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'paypal',
  ADD COLUMN IF NOT EXISTS transaction_id text,
  ADD COLUMN IF NOT EXISTS shipping_cost integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expected_delivery text,
  ADD COLUMN IF NOT EXISTS shipment_id text,
  ADD COLUMN IF NOT EXISTS awb_code text,
  ADD COLUMN IF NOT EXISTS courier_name text,
  ADD COLUMN IF NOT EXISTS tracking_url text,
  ADD COLUMN IF NOT EXISTS pincode text;