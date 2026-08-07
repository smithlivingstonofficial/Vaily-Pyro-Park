# Technical Implementation Plan

## 1. Phased Execution Roadmap

```text
┌────────────────────────────────────────────────────────┐
│ Phase 0: Research, Architecture & Specification [DONE]  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 1: Project Initialization & Foundation           │
│ • Next.js 14 App Router, TS, Tailwind, Supabase setup  │
│ • Database Schema & RLS Migrations                      │
│ • Design System & UI Primitive Setup                   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 2: Core Customer Storefront & Quick-Add Engine   │
│ • Storefront Layout & Mobile Responsive Header          │
│ • Quick-Add Product Cards with Qty Steppers            │
│ • Search, Category Filters, & Quick-View Modal          │
│ • Cart State Management & Drawer Component             │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 3: Checkout Engine & Order System                │
│ • One-Page Guest Checkout UI                           │
│ • Delivery Zone & Server Minimum Order Validation      │
│ • Transactional Order Creation & Inventory Reservation │
│ • Order Confirmation Screen & Tracking Page            │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 4: Admin Operations Console                      │
│ • Admin Dashboard with Sales & Order KPIs              │
│ • Order Processing Workflow & Status Transitions       │
│ • Product CRUD & CSV Bulk Import System                │
│ • Inventory Movement Ledger & Stock Management         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 5: Enhanced Business Features                    │
│ • Combos & Assortment Box Management                   │
│ • Coupon & Discount Engine                             │
│ • WhatsApp Order Sharing Integration                   │
│ • Buy Again & Fast Quick-Shop Table Mode               │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 6: QA, Security Hardening & Performance Polish   │
│ • E2E Integration & Stress Testing                     │
│ • Lighthouse Audit & Asset Pipeline Optimization       │
│ • Security Penetration Audit & RLS Verification        │
└────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Deliverables & Task Matrix

### Phase 1: Project Foundation
* Initialize Next.js App Router application with TypeScript and Tailwind CSS.
* Configure Supabase client libraries (`@supabase/ssr` & `@supabase/supabase-js`).
* Create SQL migration scripts for database tables (`stores`, `categories`, `products`, `inventory`, `orders`, `order_items`, `delivery_zones`).
* Implement base design system tokens, typography, and core components (`Button`, `Input`, `Drawer`, `Card`, `Badge`, `Toast`).

### Phase 2: Storefront & Quick Add
* Implement Responsive Header with sticky search bar and category pill navigation.
* Build `QuickAddCard` component featuring `[-] QTY [+]` quantity steppers.
* Build `CartDrawer` component displaying real-time subtotal, savings, and minimum order progress bar.
* Implement debounced search and category filtering.

### Phase 3: Checkout & Order Creation
* Build single-page guest checkout form validating Name, Mobile, Address, and Delivery Zone.
* Write server action `createOrderAction()` enforcing server-side price recalculation and minimum order check.
* Implement Postgres atomic function `reserve_order_inventory()`.
* Build public Order Confirmation & Live Tracking interface.

### Phase 4: Admin Panel
* Build protected `/admin` layout with staff role validation.
* Build Orders table with status updates, filter options, and detail drawer.
* Build Product catalogue management with image upload and CSV bulk update parser.
* Build Stock ledger viewer and adjustment modal.

### Phase 5: Business Extensions
* Build Combo Box assortment management engine.
* Add WhatsApp single-click order share formatting.
* Add Quick Shop table view for bulk retailers.
* Add Buy Again re-ordering screen.

---

## 3. Verification & Testing Strategy

### 3.1 Automated & Unit Tests
* **Pricing & Discount Service**: Unit tests for pricing logic, tax calculations, bundle discounts, and coupons.
* **Minimum Order Validation**: Unit tests verifying that sub-threshold orders are rejected.
* **Zod Schemas**: Validation tests for checkout payloads and CSV imports.

### 3.2 Security Verification
* Attempt checkout with altered price fields to verify server-side override.
* Attempt sub-threshold order to verify server enforcement.
* Attempt unauthenticated accesses to `/admin` routes to confirm RLS policies.
