-- ==============================================================================
-- Production SQL Script 01: Complete Database Schema, Functions, Indexes & RLS
-- Project: Vaily Pyro Park (Sivakasi Direct Fireworks E-Commerce Outlet)
-- Target: Supabase PostgreSQL 15
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PACKING', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(100),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    pack_size VARCHAR(100),
    mrp DECIMAL(10, 2) NOT NULL CHECK (mrp >= 0),
    selling_price DECIMAL(10, 2) NOT NULL CHECK (selling_price >= 0),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_best_seller BOOLEAN DEFAULT false,
    sound_level VARCHAR(50) DEFAULT 'Medium',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COMBOS & COMBO ITEMS
CREATE TABLE IF NOT EXISTS combos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    mrp DECIMAL(10, 2) NOT NULL CHECK (mrp >= 0),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS combo_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    combo_id UUID NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0)
);

-- 7. ORDERS & ORDER ITEMS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_mobile VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    shipping_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    grand_total DECIMAL(10, 2) NOT NULL,
    status order_status DEFAULT 'PENDING',
    admin_notes TEXT,
    courier_partner VARCHAR(100),
    tracking_number VARCHAR(100),
    estimated_delivery VARCHAR(50),
    is_paid BOOLEAN DEFAULT false,
    payment_method VARCHAR(50) DEFAULT 'COD',
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price DECIMAL(10, 2) NOT NULL
);

-- 8. DELIVERY ZONES
CREATE TABLE IF NOT EXISTS delivery_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_name VARCHAR(100) NOT NULL,
    state_codes TEXT[] NOT NULL,
    min_order_amount DECIMAL(10, 2) NOT NULL DEFAULT 3000.00,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    estimated_days VARCHAR(50) DEFAULT '3-5 Days',
    is_active BOOLEAN DEFAULT true
);

-- ==============================================================================
-- 9. HIGH-SPEED INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_mobile ON orders(customer_mobile);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_city ON orders(city);

-- ==============================================================================
-- 10. SEQUENCES & HELPER FUNCTIONS
-- ==============================================================================
CREATE SEQUENCE IF NOT EXISTS order_seq START 1001;

CREATE OR REPLACE FUNCTION next_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'VPP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

-- Public Read Access Policies (Storefront)
CREATE POLICY "Public store_settings read" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Public categories read" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public products read" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public delivery_zones read" ON delivery_zones FOR SELECT USING (is_active = true);

-- Checkout Policies (Public Order Placement)
CREATE POLICY "Public orders insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public orders read own" ON orders FOR SELECT USING (true);
CREATE POLICY "Public order_items insert" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public order_items read" ON order_items FOR SELECT USING (true);

-- Authenticated Admin Policies (Dashboard Access)
CREATE POLICY "Admin store_settings write" ON store_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin categories full access" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin products full access" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin orders full access" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin order_items full access" ON order_items FOR ALL USING (auth.role() = 'authenticated');
