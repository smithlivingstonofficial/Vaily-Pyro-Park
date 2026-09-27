-- ==============================================================================
-- Migration: Add mrp column to order_items and bill_items
-- File: supabase/migrations/20260927_add_mrp_to_order_items.sql
-- ==============================================================================

-- 1. Add mrp column to order_items if it doesn't already exist
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS mrp DECIMAL(10, 2);

-- 2. Add mrp column to bill_items if it doesn't already exist
ALTER TABLE public.bill_items 
ADD COLUMN IF NOT EXISTS mrp DECIMAL(10, 2);

-- 3. Populate existing rows with product MRP where missing
UPDATE public.order_items oi
SET mrp = p.mrp
FROM public.products p
WHERE oi.product_id = p.id
  AND (oi.mrp IS NULL OR oi.mrp = 0);

UPDATE public.bill_items bi
SET mrp = p.mrp
FROM public.products p
WHERE bi.product_id = p.id
  AND (bi.mrp IS NULL OR bi.mrp = 0);
