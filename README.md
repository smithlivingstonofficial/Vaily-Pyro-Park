# 🎆 Vaily Pyro Park — Sivakasi Direct Online Store

An e-commerce platform built for direct factory Sivakasi fireworks shopping, featuring instant quick-add order processing, regional delivery pricing, real-time inventory management, and an admin management suite.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL with RLS policies)
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Typography**: Google Fonts (Inter & Poppins)
- **Local Caching**: Custom `localCache` with SWR (Stale-While-Revalidate) & localStorage persistence

---

## 📁 Project Folder Structure

```
Vaily Pyro Park/
├── public/
│   ├── Final Crackers Price List.xlsx   # Official catalog source
│   └── products_catalog.csv             # Exported catalog for bulk CSV upload
├── scripts/
│   ├── generate_seed.js                 # Catalog parser & SQL seed generator
│   └── inspect_excel.js                 # Excel metadata inspection helper
├── src/
│   ├── app/
│   │   ├── (admin)/                     # Admin management panel & order console
│   │   ├── (storefront)/                # Storefront catalog, checkout, & tracking
│   │   ├── globals.css                  # Design system & Tailwind theme
│   │   └── layout.tsx                   # Root layout & Google Fonts configuration
│   ├── components/
│   │   ├── admin/                       # Admin modals, order drawers, & metrics
│   │   └── storefront/                  # Storefront header, cards, drawers, & footer
│   ├── context/
│   │   └── CartContext.tsx              # Regional pricing & cart state manager
│   ├── lib/
│   │   ├── services/                    # Supabase database services (Product, Order, etc.)
│   │   ├── supabase/                    # Supabase client initializer
│   │   └── utils/                       # localCache & utility functions
│   └── types/                           # TypeScript interface definitions
└── supabase/
    └── migrations/                      # SQL schema, security RLS, and catalog seeds
```

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront.

---

## 🗄️ Database Setup & Reset

Execute the migrations in your **Supabase Dashboard → SQL Editor** in numerical order:

1. `20260807_initial_schema.sql` — Base tables (categories, products, inventory, orders)
2. `20260807_create_admin_user.sql` — Admin authentication & role policies
3. `20260808_store_settings_and_rls_fixes.sql` — Store settings & regional logistics
4. `20260808_fix_delivery_zones.sql` — Regional delivery pricing
5. `20260808_clear_db_and_seed_catalog.sql` — Product catalog seed (145 products across 15 categories)

---

## ⚡ Performance Caching

Database queries (`getAllProducts`, `getCategories`, `getCombos`, `getDeliveryZones`) are cached locally using `localCache` (`src/lib/utils/cache.utils.ts`):
- **Stale-While-Revalidate**: Instant 0ms responses from local memory / `localStorage`.
- **Auto Invalidation**: Any DB mutation (create/update/delete/bulk import) automatically clears target caches.

---

## 📜 License

Private Repository — © 2026 Vaily Pyro Park. All rights reserved.
