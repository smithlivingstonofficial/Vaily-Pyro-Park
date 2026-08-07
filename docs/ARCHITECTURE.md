# System Architecture & Infrastructure (Single-Shop Platform)

## 1. Architectural Philosophy
The platform is engineered as a **High-Performance Single-Shop Modular Monolith** for **Vaily Pyro Park**, optimized for zero monthly infrastructure fees, sub-second latency, peak seasonal festival traffic surges, and strict data consistency.

```text
┌────────────────────────────────────────────────────────┐
│               CLOUDFLARE CDN / EDGE                    │
│  • Edge DNS, SSL/TLS, DDoS Protection                  │
│  • Global Static Asset & WebP Image Cache               │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS / HTTP/3
                           ▼
┌────────────────────────────────────────────────────────┐
│                   VERCEL HOSTING                       │
│  • Next.js 14 App Router (React Server Components)     │
│  • Edge Middleware & Server Actions                    │
└──────────────────────────┬─────────────────────────────┘
                           │ TLS Connection Pooling
                           ▼
┌────────────────────────────────────────────────────────┐
│              SUPABASE INFRASTRUCTURE                   │
│  • Single-Store PostgreSQL 15 Database                 │
│  • Row Level Security (RLS) Engine                     │
│  • Atomic SQL Inventory Reservation                    │
└────────────────────────────────────────────────────────┘
```

---

## 2. Zero-Cost & Maximum Speed WhatsApp Integration
Rather than using expensive third-party WhatsApp API providers (e.g. Twilio or Meta WhatsApp Business API which cost monthly subscription fees plus per-message charges), the platform uses **Native Client-Side WhatsApp Deep-Linking**:
* **URL Scheme**: `https://wa.me/919840000000?text=<ENCODED_ORDER_TEXT>`
* **Cost**: **₹0 / $0 per month** forever.
* **Latency**: **0ms server latency** (computed instantly in client memory).
* **Frictionless Experience**: Opens native WhatsApp app on iOS, Android, or Desktop pre-filled with the customer's order summary and address proof.

---

## 3. Simplified Single-Shop Stack

| Layer | Technology | Selection Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 14+ (App Router) | Server Components for minimal JS payload, instant SSR, native Server Actions. |
| **Language** | TypeScript | Strict type safety across UI, API payload schemas, and database entities. |
| **Styling** | Tailwind CSS | Zero-runtime CSS bundle, modular utility classes, festive gold theme tokens. |
| **Database** | Supabase (PostgreSQL) | Single-store relational SQL engine, native RLS security, transactional integrity. |
| **Storage & CDN** | Cloudflare R2 + CDN | WebP media delivery with edge caching and zero egress fees. |
| **Hosting** | Vercel | Global edge serverless deployment. |
