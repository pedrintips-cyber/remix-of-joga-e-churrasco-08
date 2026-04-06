ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paradise_transaction_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_document text;

CREATE UNIQUE INDEX IF NOT EXISTS site_settings_key_unique ON public.site_settings(key);