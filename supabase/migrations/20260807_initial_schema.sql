-- SQL Migration: 20260807_initial_schema.sql
-- Description: Single-Shop Database Schema for Vaily Pyro Park E-Commerce Platform

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. CATEGORIES TABLE
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

-- 2. PRODUCTS TABLE
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
    sound_level VARCHAR(50) DEFAULT 'Medium', -- Low, Medium, High, Silent
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INVENTORY & MOVEMENTS
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    available_stock INT NOT NULL DEFAULT 0 CHECK (available_stock >= 0),
    reserved_stock INT NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
    safety_threshold INT NOT NULL DEFAULT 10,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
    CREATE TYPE movement_type AS ENUM ('PURCHASE', 'RESERVATION', 'SALE', 'CANCELLATION', 'DAMAGE', 'ADJUSTMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type movement_type NOT NULL,
    quantity INT NOT NULL,
    reason TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMBOS TABLE
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

-- 5. ORDERS & ORDER ITEMS
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PACKING', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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

-- 6. DELIVERY ZONES
CREATE TABLE IF NOT EXISTS delivery_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_name VARCHAR(100) NOT NULL,
    state_codes TEXT[] NOT NULL,
    min_order_amount DECIMAL(10, 2) NOT NULL DEFAULT 3000.00,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    estimated_days VARCHAR(50) DEFAULT '3-5 Days',
    is_active BOOLEAN DEFAULT true
);

-- Default Delivery Zones Seed
INSERT INTO delivery_zones (zone_name, state_codes, min_order_amount, delivery_fee, estimated_days)
VALUES 
('Tamil Nadu (Home Zone)', ARRAY['TN', 'Tamil Nadu'], 3000.00, 0.00, '2-3 Days'),
('South India (Puducherry, Kerala, KA, AP, TS)', ARRAY['PY', 'KL', 'KA', 'AP', 'TS', 'Puducherry', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana'], 4000.00, 150.00, '3-4 Days'),
('Rest of India', ARRAY['MH', 'DL', 'GJ', 'RJ', 'UP', 'WB', 'MP', 'HR', 'PB', 'ALL'], 5000.00, 250.00, '5-7 Days')
ON CONFLICT DO NOTHING;

-- INDEXES FOR MAXIMUM SPEED
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_orders_customer_mobile ON orders(customer_mobile);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);

-- ROW LEVEL SECURITY (SINGLE SHOP)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public categories read" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public products read" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public delivery zones read" ON delivery_zones FOR SELECT USING (is_active = true);

-- ATOMIC SINGLE-SHOP INVENTORY RESERVATION PROCEDURE
CREATE OR REPLACE FUNCTION reserve_order_inventory(
    p_items JSONB
) RETURNS BOOLEAN AS $$
DECLARE
    item RECORD;
    v_available INT;
BEGIN
    FOR item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT)
    LOOP
        SELECT available_stock INTO v_available 
        FROM inventory 
        WHERE product_id = item.product_id
        FOR UPDATE;

        IF v_available IS NULL OR v_available < item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product %', item.product_id;
        END IF;

        UPDATE inventory 
        SET available_stock = available_stock - item.quantity,
            reserved_stock = reserved_stock + item.quantity
        WHERE product_id = item.product_id;

        INSERT INTO inventory_movements (product_id, type, quantity, reason)
        VALUES (item.product_id, 'RESERVATION', item.quantity, 'Order placement stock reservation');
    END LOOP;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
