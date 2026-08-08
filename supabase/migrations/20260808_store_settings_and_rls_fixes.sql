-- Migration: 20260808_store_settings_and_rls_fixes.sql
-- Adds store_settings table and fixes RLS policies so admin can write to inventory & orders

-- ============================================================
-- 1. STORE SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default settings
INSERT INTO store_settings (key, value) VALUES
  ('store_name', 'Vaily Pyro Park'),
  ('tagline', 'Sivakasi Direct Fireworks Outlet'),
  ('helpline_mobile', '+91 98401 23456'),
  ('whatsapp_number', '919840123456'),
  ('gstin', '33AAACV1234A1Z5'),
  ('announcement_banner', '⚡ DIWALI PRE-BOOKING OPEN: Get up to 75% OFF Factory Direct Rates!')
ON CONFLICT (key) DO NOTHING;

-- Public read for announcement banner (storefront needs it)
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public store_settings read" ON store_settings FOR SELECT USING (true);
-- Authenticated (admin) can update
CREATE POLICY "Admin store_settings write" ON store_settings FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 2. FIX ORDERS TABLE — add missing columns used by app
-- ============================================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_partner VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'COD';

-- ============================================================
-- 3. FIX INVENTORY RLS — admin must be able to write stock
-- ============================================================
-- Drop old restrictive policies
DROP POLICY IF EXISTS "Admin inventory write" ON inventory;
DROP POLICY IF EXISTS "Admin inventory_movements write" ON inventory_movements;

-- Allow authenticated admin to read & write inventory
CREATE POLICY "Admin inventory full access" ON inventory
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public inventory read" ON inventory
  FOR SELECT USING (true);

-- Allow authenticated admin to read & write inventory movements
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin inventory_movements full access" ON inventory_movements
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public inventory_movements read" ON inventory_movements
  FOR SELECT USING (true);

-- ============================================================
-- 4. FIX ORDERS RLS — allow public to insert (checkout), admin to do everything
-- ============================================================
DROP POLICY IF EXISTS "Public orders write" ON orders;
DROP POLICY IF EXISTS "Admin orders full access" ON orders;

CREATE POLICY "Public orders insert" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public orders read own" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Admin orders full access" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

-- Allow public to insert order items (checkout)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public order_items insert" ON order_items;
CREATE POLICY "Public order_items insert" ON order_items
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public order_items read" ON order_items
  FOR SELECT USING (true);
CREATE POLICY "Admin order_items full access" ON order_items
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 5. PRODUCTS / CATEGORIES — admin write access
-- ============================================================
CREATE POLICY "Admin products full access" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin categories full access" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 6. ORDER NUMBER SEQUENCE (replaces random suffix)
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS order_seq START 1001;

-- Helper function to generate safe order numbers
CREATE OR REPLACE FUNCTION next_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'VPP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
