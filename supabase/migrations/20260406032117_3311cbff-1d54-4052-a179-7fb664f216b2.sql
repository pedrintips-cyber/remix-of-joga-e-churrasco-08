
DROP POLICY "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (
    customer_name IS NOT NULL AND
    customer_phone IS NOT NULL AND
    customer_address IS NOT NULL AND
    items IS NOT NULL AND
    total > 0
  );
