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
      └──────┬───────┘     └──────────────┘
             │
             ▼
      ┌──────────────┐
      │  inventory   │
      └──────────────┘
```

---

## 2. PostgreSQL DDL (Single Shop)

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

-- 3. INVENTORY & MOVEMENTS
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    available_stock INT NOT NULL DEFAULT 0 CHECK (available_stock >= 0),
    reserved_stock INT NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
    safety_threshold INT NOT NULL DEFAULT 10,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE movement_type AS ENUM ('PURCHASE', 'RESERVATION', 'SALE', 'CANCELLATION', 'DAMAGE', 'ADJUSTMENT');

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type movement_type NOT NULL,
    quantity INT NOT NULL,
    reason TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS & PRICE SNAPSHOTS
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
CREATE INDEX idx_orders_customer_mobile ON orders(customer_mobile);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_inventory_product ON inventory(product_id);
```
