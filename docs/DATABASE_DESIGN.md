# Database Design & Schema Specifications (Single-Shop)

## 1. Schema Overview & Relational Structure
The database is built on PostgreSQL 15 via Supabase. It uses strict single-shop normalization, declarative constraints, transactional triggers, and Row Level Security (RLS).

```text
┌──────────────┐     ┌──────────────┐
│  categories  │───< │   products   │
└──────────────┘     └──────┬───────┘
                            │
      ┌──────────────┐      │
      │    combos    │      │
      └──────────────┘      │
                            ▼
      ┌──────────────┐     ┌──────────────┐
      │    orders    │───< │ order_items  │
      └──────────────┘     └──────────────┘
```

---

## 2. PostgreSQL DDL (Single Shop Current Schema)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. CATEGORIES
CREATE TABLE categories (
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

-- 2. PRODUCTS
CREATE TABLE products (
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

-- 3. ORDERS & ORDER ITEMS
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PACKING', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED');

CREATE TABLE orders (
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

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price DECIMAL(10, 2) NOT NULL
);
```

---

## 3. High-Speed Indexes
```sql
CREATE INDEX idx_products_search ON products USING gin(name gin_trgm_ops);
CREATE INDEX idx_products_category ON products(category_id) WHERE is_active = true;
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_customer_mobile ON orders(customer_mobile);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_city ON orders(city);
```

---

## 4. Helper Functions & Sequences
```sql
CREATE SEQUENCE IF NOT EXISTS order_seq START 1001;

CREATE OR REPLACE FUNCTION next_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'VPP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
```
