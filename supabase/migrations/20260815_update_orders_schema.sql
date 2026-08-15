-- SQL Migration: 20260815_update_orders_schema.sql
-- Description: Update orders schema to align with mobile-optimized workflow, logistics tracking, audit trail, and date/status indexing.

-- 1. Ensure logistics & tracking fields exist on orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_partner VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery VARCHAR(50);

-- 2. Ensure JSONB history column exists for status audit trails
ALTER TABLE orders ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb;

-- 3. Ensure payment fields exist with defaults
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'COD';

-- 4. High-Speed Indexes for Admin Mobile Filtering & Search
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_mobile ON orders(customer_mobile);
CREATE INDEX IF NOT EXISTS idx_orders_city ON orders(city);

-- 5. Order Number Sequence Generator (VPP-YYYY-XXXX)
CREATE SEQUENCE IF NOT EXISTS order_seq START 1001;

CREATE OR REPLACE FUNCTION next_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'VPP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
