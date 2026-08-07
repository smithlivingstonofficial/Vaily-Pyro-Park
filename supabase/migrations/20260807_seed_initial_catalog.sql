-- ============================================================================
-- VAILY PYRO PARK: TEST SAMPLE DATA SQL MIGRATION SCRIPT
-- ============================================================================
-- Execute this SQL in your Supabase SQL Editor to populate sample test data.
-- ============================================================================

-- Ensure optional tracking & payment columns exist on orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier_partner VARCHAR(255);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT true;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) DEFAULT 'UPI Direct';
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 1. SEED PRODUCT CATEGORIES
INSERT INTO public.categories (id, name, slug, description, icon_name, display_order, is_active)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'Sparklers', 'sparklers', 'Electric, Gold & Color Sparklers for all ages', 'Sparkles', 1, true),
  ('11111111-0000-0000-0000-000000000002', 'Flower Pots', 'flower-pots', 'Golden, Silver & Multicolor fountains', 'Flame', 2, true),
  ('11111111-0000-0000-0000-000000000003', 'Ground Chakkaras', 'ground-chakkaras', 'High-speed smooth spinning ground wheels', 'RotateCw', 3, true),
  ('11111111-0000-0000-0000-000000000004', 'Sky Rockets', 'rockets', 'Whistling & Sky Bursting Rockets', 'Rocket', 4, true),
  ('11111111-0000-0000-0000-000000000005', 'Aerial Multi-Shots', 'aerial-shots', '12, 25 & 60 Shot Sky Fireworks Cakes', 'Zap', 5, true),
  ('11111111-0000-0000-0000-000000000006', 'Sound Crackers', 'sound-crackers', '100 to 10,000 Garland Sound Crackers', 'Volume2', 6, true),
  ('11111111-0000-0000-0000-000000000007', 'Festival Combos', 'combos', 'Curated festival gift boxes at wholesale rates', 'Gift', 7, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 2. SEED FIREWORKS PRODUCTS
INSERT INTO public.products (
  id,
  category_id,
  name,
  slug,
  sku,
  description,
  pack_size,
  mrp,
  selling_price,
  image_url,
  is_active,
  is_featured,
  is_best_seller,
  sound_level
)
VALUES
  (
    '22222222-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000001',
    '10cm Electric Sparklers',
    '10cm-electric-sparklers',
    'SPK-10E',
    '10 Crackers per box. Bright electric silver sparks, child safe.',
    '1 Box (10 Pcs)',
    200.00,
    50.00,
    'https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?w=600&auto=format&fit=crop&q=80',
    true,
    true,
    true,
    'Silent'
  ),
  (
    '22222222-0000-0000-0000-000000000002',
    '11111111-0000-0000-0000-000000000001',
    '15cm Green Sparklers',
    '15cm-green-sparklers',
    'SPK-15GRN',
    '10 Crackers per box. Vibrant green sparkling flames.',
    '1 Box (10 Pcs)',
    320.00,
    80.00,
    'https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?w=600&auto=format&fit=crop&q=80',
    true,
    false,
    true,
    'Low'
  ),
  (
    '22222222-0000-0000-0000-000000000003',
    '11111111-0000-0000-0000-000000000003',
    'Ground Chakkar Special',
    'ground-chakkar-special',
    'CHK-SPCL',
    '10 Pieces per box. High-speed smooth spinning ground wheels.',
    '1 Box (10 Pcs)',
    240.00,
    60.00,
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&auto=format&fit=crop&q=80',
    true,
    true,
    false,
    'Low'
  ),
  (
    '22222222-0000-0000-0000-000000000004',
    '11111111-0000-0000-0000-000000000002',
    'Flower Pots Special (Big)',
    'flower-pots-special',
    'FPT-SPCL',
    '10 Pieces per box. High golden sparkling fountains.',
    '1 Box (10 Pcs)',
    380.00,
    95.00,
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    true,
    true,
    true,
    'Medium'
  ),
  (
    '22222222-0000-0000-0000-000000000005',
    '11111111-0000-0000-0000-000000000005',
    '25 Shot Sky Rocket Cake',
    '25-shot-sky-rocket-cake',
    'ARS-25R',
    '1 Piece per box. 25 continuous aerial multicolor sky bursts.',
    '1 Box (1 Pc)',
    1800.00,
    450.00,
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
    true,
    true,
    true,
    'High'
  ),
  (
    '22222222-0000-0000-0000-000000000006',
    '11111111-0000-0000-0000-000000000006',
    '1000 Wala Sound Garland',
    '1000-wala-sound-garland',
    'SND-1000W',
    '1 Garland box. Loud continuous crackers string.',
    '1 Box (1 Garland)',
    1200.00,
    300.00,
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
    true,
    false,
    true,
    'High'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  mrp = EXCLUDED.mrp,
  selling_price = EXCLUDED.selling_price,
  is_active = EXCLUDED.is_active;

-- 3. SEED WAREHOUSE INVENTORY BALANCES
INSERT INTO public.inventory (product_id, available_stock, reserved_stock, safety_threshold)
VALUES
  ('22222222-0000-0000-0000-000000000001', 250, 0, 20),
  ('22222222-0000-0000-0000-000000000002', 180, 0, 20),
  ('22222222-0000-0000-0000-000000000003', 200, 0, 20),
  ('22222222-0000-0000-0000-000000000004', 150, 0, 20),
  ('22222222-0000-0000-0000-000000000005', 60, 0, 10),
  ('22222222-0000-0000-0000-000000000006', 90, 0, 15)
ON CONFLICT (product_id) DO UPDATE SET
  available_stock = EXCLUDED.available_stock;

-- 4. SEED REGIONAL DELIVERY ZONES & FREIGHT RATES
INSERT INTO public.delivery_zones (id, zone_name, state_codes, min_order_amount, delivery_fee, estimated_days, is_active)
VALUES
  (
    '33333333-0000-0000-0000-000000000001',
    'Tamil Nadu (Home Zone)',
    ARRAY['TN'],
    3000.00,
    0.00,
    '1-2 Days Express Transport',
    true
  ),
  (
    '33333333-0000-0000-0000-000000000002',
    'South India (KL, KA, AP, TS, PY)',
    ARRAY['KL', 'KA', 'AP', 'TS', 'PY'],
    4500.00,
    250.00,
    '2-4 Days Fast Lorry Transport',
    true
  ),
  (
    '33333333-0000-0000-0000-000000000003',
    'Rest of India (MH, DL, GJ, WB, etc.)',
    ARRAY['MH', 'DL', 'GJ', 'WB', 'MP', 'UP', 'PB', 'HR', 'RJ', 'OD', 'BR', 'CT', 'GA', 'JH', 'UT', 'HP', 'AS'],
    6000.00,
    450.00,
    '4-7 Days National Transport',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  min_order_amount = EXCLUDED.min_order_amount,
  delivery_fee = EXCLUDED.delivery_fee,
  is_active = EXCLUDED.is_active;

-- 5. SEED SAMPLE PRODUCTION TEST ORDER
INSERT INTO public.orders (
  id,
  order_number,
  customer_name,
  customer_mobile,
  customer_email,
  shipping_address,
  city,
  state,
  pincode,
  subtotal,
  discount_amount,
  delivery_fee,
  grand_total,
  status,
  courier_partner,
  tracking_number,
  is_paid,
  payment_method,
  created_at
)
VALUES (
  '44444444-0000-0000-0000-000000000001',
  'VPP-2026-1001',
  'Senthil Kumar',
  '9840123456',
  'senthil.kumar@example.com',
  'Plot 42, Cross Street, T. Nagar',
  'Chennai',
  'Tamil Nadu',
  '600017',
  3170.00,
  9510.00,
  0.00,
  3170.00,
  'CONFIRMED',
  'VRL Logistics',
  'VRL-TN-89412',
  true,
  'UPI Direct',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Seed Items for Sample Order
INSERT INTO public.order_items (order_id, product_id, product_name, unit_price, quantity, total_price, image_url)
VALUES
  ('44444444-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', '10cm Electric Sparklers', 50.00, 10, 500.00, 'https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?w=600&auto=format&fit=crop&q=80'),
  ('44444444-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', '15cm Green Sparklers', 80.00, 5, 400.00, 'https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?w=600&auto=format&fit=crop&q=80'),
  ('44444444-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000005', '25 Shot Sky Rocket Cake', 450.00, 4, 1800.00, 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;
