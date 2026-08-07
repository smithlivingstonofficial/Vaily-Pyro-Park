# Performance Architecture & Optimization Strategy

## 1. Performance Goals & SLA

| Metric | Target SLA | Strategy |
| :--- | :--- | :--- |
| **First Contentful Paint (FCP)** | < 0.9 seconds | React Server Components, minimal initial JS bundle (< 80KB gzip). |
| **Time to Interactive (TTI)** | < 1.8 seconds | Edge rendering via Vercel, pre-fetched critical assets. |
| **Largest Contentful Paint (LCP)** | < 1.2 seconds | Next.js Image component with WebP conversion & Cloudflare CDN edge caching. |
| **Cumulative Layout Shift (CLS)** | 0.00 | Explicit dimensions on media, skeleton placeholders for dynamic items. |
| **Database Response Time** | < 25 milliseconds | Indexed queries, column selection (`SELECT id, name, price`), connection pooling. |

---

## 2. Image Optimization Pipeline

```text
┌────────────────────────────────────────────────────────┐
│             ADMIN / CATALOGUE IMAGE UPLOAD             │
└──────────────────────────┬─────────────────────────────┘
                           │ Original high-resolution image
                           ▼
┌────────────────────────────────────────────────────────┐
│               CLOUDFLARE R2 BUCKET                     │
│  Stores pristine original master images                │
└──────────────────────────┬─────────────────────────────┘
                           │ Edge request
                           ▼
┌────────────────────────────────────────────────────────┐
│             CLOUDFLARE IMAGE RESIZING                  │
│  Auto-formats to WebP / AVIF                           │
│  Generates dynamic thumbnail variants (150px, 400px)   │
└──────────────────────────┬─────────────────────────────┘
                           │ Sub-50ms Cached Delivery
                           ▼
┌────────────────────────────────────────────────────────┐
│                NEXT.JS STOREFRONT UI                   │
│  Renders responsive sizes attribute with lazy loading  │
└────────────────────────────────────────────────────────┘
```

---

## 3. Data Fetching & Caching Topology

### 3.1 Static & Incremental Static Regeneration (ISR)
* **Category & Home Banners**: Generated at build time and revalidated every 60 minutes (`revalidate = 3600`).
* **Product Catalog**: Server Components read directly from Supabase with tagged cache revalidation when admin mutates prices (`revalidateTag('products')`).

### 3.2 Dynamic Real-Time Reads
* **Cart & Inventory**: Dynamic server calls bypassing cache to ensure absolute stock accuracy prior to checkout completion.

---

## 4. Database Query Optimization Checklist
1. **Explicit Column Selection**: Never use `SELECT *`. Fetch only required fields (`SELECT id, name, selling_price, image_url`).
2. **Indexed Foreign Keys & Slugs**: All `category_id`, `sku`, `slug`, and `status` columns feature B-Tree or GIN indexes.
3. **Pagination & Limits**: Product lists default to 24 items per fetch with infinite scroll / cursor pagination.
