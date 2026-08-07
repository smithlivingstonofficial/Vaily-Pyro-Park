# Product Requirements Document (PRD)

## 1. Executive Summary
The **Vaily Pyro Park** platform is a modern, high-performance, mobile-first e-commerce system optimized for fireworks and crackers businesses. It addresses the unique operational demands of seasonal festival sales (Diwali, New Year, weddings) in India, catering to both quick individual purchases and bulk orders with maximum speed, clarity, and security.

---

## 2. Core Functional Requirements

### 2.1 Customer Storefront & Shopping Experience
* **Quick-Add Grid**: Product cards on mobile and desktop feature direct `[-] QTY [+]` steppers that instantly mutate cart state without modals or page reloads.
* **Smart Search & Filter**: Instant client/server debounced search across product names, SKUs, categories, and tags. Filters for category, price range, sound/visual type, and stock availability.
* **Shop by Purpose / Occasion**: Curated collection landing pages (e.g., "Family Pack", "Kids Friendly", "Grand Aerial Show", "Budget Special").
* **Product Quick View**: Slide-out drawer or overlay providing hi-res images, pack contents, safety ratings, and quick quantity controls.
* **Combos & Bundles**: Pre-packaged assortment boxes (e.g., "Diwali Supreme Box") containing predefined item lists with bundle discounts.
* **Buy Again Flow**: One-click re-order for returning customers with quick quantity adjustments before checkout.

### 2.2 Cart & Minimum Order System
* **Server-Authoritative Pricing**: Subtotal, item discounts, coupons, delivery charges, and final amounts are calculated exclusively on the server.
* **Dynamic Minimum Order Thresholds**: Configurable location-based minimum order requirements (e.g., Tamil Nadu: ₹3,000; Rest of India: ₹5,000).
* **Cart Progress Indicator**: Visual progress bar in the drawer cart showing remaining amount needed to reach minimum order threshold, accompanied by 1-tap "top-up" product recommendations.
* **Cart Persistence**: Seamless cart retention across page refreshes and browser restarts for guest and logged-in users.

### 2.3 One-Page Checkout & Orders
* **Guest Checkout**: Allows instant ordering using Mobile Number, Name, and Shipping Address without forced password creation.
* **Delivery Zone Calculator**: Dynamic calculation of shipping fees and estimated delivery timelines based on customer state/pincode.
* **Order Tracking**: Public tracking interface (`/track-order?id=...`) showing live state progression: `PENDING` → `CONFIRMED` → `PACKING` → `PACKED` → `DISPATCHED` → `DELIVERED`.
* **WhatsApp Commerce Integration**: Automated order receipt generated with a single-tap "Send Order to WhatsApp" button for manual confirmation or support updates.

---

## 3. Admin & Operations Requirements

### 3.1 Inventory & Warehouse Management
* **Database Inventory Movement**: All inventory changes log movement types (`PURCHASE`, `RESERVATION`, `SALE`, `CANCELLATION`, `DAMAGE`, `ADJUSTMENT`).
* **Atomic Inventory Reservation**: Placing an order atomically reserves stock for a configurable window (e.g., 30 minutes) to prevent overselling during peak traffic.
* **Low Stock Alerts**: Configurable alerts per SKU when available stock falls below safety thresholds.

### 3.2 Catalogue & Bulk Operations
* **Product Management**: Full CRUD capabilities for products, pack sizes, categories, media, tags, active/inactive statuses, and SEO meta tags.
* **Bulk Imports/Updates**: CSV/Excel template import for updating price lists, stock levels, and discount rates across hundreds of SKUs simultaneously with strict pre-validation.

### 3.3 Role-Based Access Control (RBAC)
* Admin roles with granular Supabase RLS policies:
  * `SUPER_ADMIN`: Full platform access, settings, staff management, audit logs.
  * `ORDER_MANAGER`: Order status progression, customer communication, tracking IDs.
  * `INVENTORY_MANAGER`: Stock level adjustments, purchase imports, damage logs.
  * `PACKING_STAFF`: Order pick list viewing, order packing confirmation.

### 3.4 Season & Campaign Engine
* Configurable active season model (e.g., "Diwali 2026 Season") enabling global price updates, seasonal banners, and specific category displays without redeploying code.

---

## 4. Non-Functional Requirements
* **Performance**: First Contentful Paint (FCP) < 1.0s, Time to Interactive (TTI) < 2.0s on 4G networks. Lighthouse performance score > 90.
* **Security**: Zero client-side price trust. Complete Supabase Row Level Security (RLS) enforcement. Protection against SQL injection, XSS, and request tampering.
* **Scalability**: Ability to absorb 10,000+ concurrent visitors during seasonal peak surges utilizing Cloudflare edge caching and Vercel serverless auto-scaling.
* **Accessibility**: Full compliance with WCAG 2.1 AA (contrast ratios, keyboard navigation, touch targets ≥ 48px, ARIA labels).
