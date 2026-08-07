-- SQL Migration: 20260807_seed_initial_catalog.sql
-- Description: Seed initial categories, products, inventory, and delivery zones into Supabase database for production testing

-- 1. SEED CATEGORIES
INSERT INTO categories (id, name, slug, description, icon_name, display_order, is_active)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Sparklers', 'sparklers', 'Classic hand-held electric sparklers', 'Sparkles', 1, true),
  ('c1000000-0000-0000-0000-000000000002', 'Ground Chakkars', 'ground-chakkars', 'Fast spinning ground fireworks', 'RotateCw', 2, true),
  ('c1000000-0000-0000-0000-000000000003', 'Flower Pots', 'flower-pots', 'Bright fountain fireworks', 'Flame', 3, true),
  ('c1000000-0000-0000-0000-000000000004', 'Sky Shots & Rockets', 'sky-shots-rockets', 'High-altitude aerial fireworks', 'Rocket', 4, true),
  ('c1000000-0000-0000-0000-000000000005', 'Novelty & Fancy', 'novelty-fancy', 'Special effect party crackers', 'PartyPopper', 5, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug;

-- 2. SEED PRODUCTS
INSERT INTO products (id, category_id, name, slug, sku, description, pack_size, mrp, selling_price, image_url, is_active, is_featured, is_best_seller, sound_level)
VALUES
  (
    'p1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    '10cm Electric Sparklers',
    '10cm-electric-sparklers',
    'SPK-10CM',
    '10 Crackers per box. Long burning golden electric sparklers.',
    '1 Box (10 Pcs)',
    120.00,
    30.00,
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    true,
    true,
    true,
    'Low'
  ),
  (
    'p1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000001',
    '15cm Green Sparklers',
    '15cm-green-sparklers',
    'SPK-15GRN',
    '10 Crackers per box. Vibrant green sparkling flames.',
    '1 Box (10 Pcs)',
    180.00,
    45.00,
    'https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?w=600&auto=format&fit=crop&q=80',
    true,
    false,
    true,
    'Low'
  ),
  (
    'p1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000002',
    'Ground Chakkar Special',
    'ground-chakkar-special',
    'CHK-SPCL',
    '10 Pieces per box. Smooth high-speed ground rotation.',
    '1 Box (10 Pcs)',
    240.00,
    60.00,
    'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=600&auto=format&fit=crop&q=80',
    true,
    true,
    false,
    'Medium'
  ),
  (
    'p1000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000003',
    'Flower Pot Big Deluxe',
    'flower-pot-big-deluxe',
    'FPT-DELUXE',
    '10 Pieces per box. Massive golden fountain burst.',
    '1 Box (10 Pcs)',
    350.00,
    90.00,
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
    true,
    true,
    true,
    'Medium'
  ),
  (
    'p1000000-0000-0000-0000-000000000005',
    'c1000000-0000-0000-0000-000000000004',
    '12 Multi-Color Sky Shots',
    '12-multi-color-sky-shots',
    'SKY-12SHOT',
    '1 Piece. 12 sequential multi-color aerial bursts.',
    '1 Box (1 Pc)',
    800.00,
    220.00,
    'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=600&auto=format&fit=crop&q=80',
    true,
    true,
    true,
    'High'
  )
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, selling_price = EXCLUDED.selling_price;

-- 3. SEED INVENTORY BALANCES
INSERT INTO inventory (product_id, available_stock, reserved_stock, safety_threshold)
VALUES
  ('p1000000-0000-0000-0000-000000000001', 150, 5, 20),
  ('p1000000-0000-0000-0000-000000000002', 100, 2, 15),
  ('p1000000-0000-0000-0000-000000000003', 80, 0, 15),
  ('p1000000-0000-0000-0000-000000000004', 60, 4, 10),
  ('p1000000-0000-0000-0000-000000000005', 40, 1, 10)
ON CONFLICT (product_id) DO UPDATE SET available_stock = EXCLUDED.available_stock;
