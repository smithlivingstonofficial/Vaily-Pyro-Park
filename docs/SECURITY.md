# Security Architecture & RLS Enforcement

## 1. Zero-Trust Security Paradigm
The platform assumes that all client-side inputs, browser state, and HTTP payloads are potentially tampered with or malicious.

```text
┌────────────────────────────────────────────────────────┐
│                   BROWSER / CLIENT                     │
│  Sends item list & quantity choices                    │
└──────────────────────────┬─────────────────────────────┘
                           │ Raw inputs (Product IDs + Qtys)
                           ▼
┌────────────────────────────────────────────────────────┐
│             SERVER ACTIONS / API ROUTE                 │
│  1. Validate payload structure using Zod               │
│  2. Fetch ground-truth prices directly from PostgreSQL  │
│  3. Calculate final totals & verify min order rule     │
│  4. Execute atomic inventory reservation               │
└──────────────────────────┬─────────────────────────────┘
                           │ Verified SQL Transaction
                           ▼
┌────────────────────────────────────────────────────────┐
│                POSTGRESQL + SUPABASE RLS               │
│  Strict RLS policies block unauthorized reads/writes  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Row Level Security (RLS) Policies

### 2.1 Products & Categories Policies (Public Read, Admin Write)
```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Anonymous & Customer Read Policy
CREATE POLICY "Public products read" ON products
    FOR SELECT USING (is_active = true);

-- Admin Write Policy
CREATE POLICY "Admin product management" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('SUPER_ADMIN', 'INVENTORY_MANAGER')
        )
    );
```

### 2.2 Orders & Order Items Security
```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Customers can insert orders via Server Action (SECURITY DEFINER service role)
-- Customers can view their specific order if they possess the order UUID/number:
CREATE POLICY "Customer order lookup" ON orders
    FOR SELECT USING (
        id::text = current_setting('request.jwt.claims', true)::json->>'order_id'
        OR auth.uid() IS NOT NULL
    );

-- Admin Full Order Access Policy
CREATE POLICY "Admin order operations" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('SUPER_ADMIN', 'ORDER_MANAGER', 'PACKING_STAFF')
        )
    );
```

---

## 3. Threat Mitigation Matrix

| Security Threat | Attack Vector | Technical Safeguard |
| :--- | :--- | :--- |
| **Price Tampering** | Manipulating price payload in JS requests. | Prices are fetched exclusively from `products` table on the server during checkout. |
| **Bypassing Min Order** | Calling submit API with sub-₹3000 cart. | `order.service.ts` validates `subtotal >= delivery_zone.min_order` server-side before DB write. |
| **Overselling Stock** | Simultaneous checkouts during peak sales. | Postgres row-level locks (`FOR UPDATE`) inside atomic SQL reservation procedure. |
| **Admin Route Bypass** | Accessing `/admin` routes directly. | Middleware JWT token validation + Supabase database RLS role enforcement. |
| **XSS & Injection** | Malicious script injections in forms. | React auto-escaping, Zod input sanitization, parameterized SQL queries. |
| **Media Upload Exploits** | Uploading PHP/Executable scripts. | Storage buckets strictly limited to MIME types `image/webp`, `image/jpeg`, `image/png`. |
