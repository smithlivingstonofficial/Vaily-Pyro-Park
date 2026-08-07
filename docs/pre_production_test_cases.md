# 🧪 Pre-Production QA Test Suite & Manual Test Cases

**Application**: Vaily Pyro Park (Sivakasi E-Commerce & Admin Console)  
**Target Release**: Production v1.0  
**Stack**: Next.js 16 + Supabase Postgres + Supabase Auth + Tailwind CSS v4 + TypeScript  

---

## 📋 Phase 0: Pre-Test Setup Checklist

Before beginning test execution, ensure the following SQL migrations have been executed in your **Supabase Dashboard ➔ SQL Editor**:

1. [ ] **Database Schema**: Execute [`supabase/migrations/20260807_initial_schema.sql`](file:///c:/Users/smith/Desktop/ElLabs/Vaily%20Pyro%20Park/supabase/migrations/20260807_initial_schema.sql).
2. [ ] **Admin User**: Execute [`supabase/migrations/20260807_create_admin_user.sql`](file:///c:/Users/smith/Desktop/ElLabs/Vaily%20Pyro%20Park/supabase/migrations/20260807_create_admin_user.sql) for `vel56skc@gmail.com`.
3. [ ] **Catalog Seed Data**: Execute [`supabase/migrations/20260807_seed_initial_catalog.sql`](file:///c:/Users/smith/Desktop/ElLabs/Vaily%20Pyro%20Park/supabase/migrations/20260807_seed_initial_catalog.sql).

---

## 🛍️ Suite 1: Customer Storefront & Catalog Browsing

| Test ID | Test Scenario | Steps to Execute | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **ST-01** | **Initial Page Load** | Navigate to `http://localhost:3000` | Header displays Sivakasi ticker, category tabs, and initial fireworks catalog loaded from Supabase DB. | [ ] |
| **ST-02** | **Category Filter** | Click "Sparklers" category tab | Grid displays only sparkler SKUs. URL/state updates smoothly. | [ ] |
| **ST-03** | **Search Query Filter** | Type "Sky Shot" in header search input | Catalog instantly filters to show "12 Multi-Color Sky Shots". | [ ] |
| **ST-04** | **View Switcher** | Click List View icon in header | Product display switches from 5-column grid to compact list view. | [ ] |
| **ST-05** | **Storefront Refresh Persistence** | Select "Flower Pots" category, type "Deluxe", then press **F5 (Refresh)** | After refresh, the page restores "Flower Pots" category and "Deluxe" search query automatically from `localStorage`. | [ ] |
| **ST-06** | **Quick View Modal** | Click "Quick View" on any product card | Light theme Quick View modal opens showing MRP, Selling Price, Discount %, and Pack Size. | [ ] |

---

## 🛒 Suite 2: Cart & Delivery Zone Thresholds

| Test ID | Test Scenario | Steps to Execute | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **CT-01** | **Delivery Zone Selection** | Open Zone Selector in header -> select "South India" | Minimum order threshold updates to ₹4,000 and delivery fee updates to ₹150. | [ ] |
| **CT-02** | **Add to Cart Stepper** | Click `+` on "10cm Electric Sparklers" 3 times | Cart drawer icon badge updates to `3`. Subtotal calculates correctly. | [ ] |
| **CT-03** | **Min Order Progress Bar** | Add items worth ₹2,500 with a ₹4,000 threshold | Progress bar shows `62%`, amber warning alerts user: "Add ₹1,500 more to checkout". | [ ] |
| **CT-04** | **Min Order Threshold Met** | Add items until subtotal exceeds ₹4,000 | Progress bar turns emerald green (`100%`), checkmark appears: "Min Order Reached". Checkout CTA becomes active. | [ ] |
| **CT-05** | **Cart Refresh Persistence** | Add 5 items, then press **F5 (Refresh)** | Cart items, quantities, subtotal, and selected delivery zone remain fully intact after browser refresh. | [ ] |

---

## 💳 Suite 3: Order Placement & Checkout Pipeline

| Test ID | Test Scenario | Steps to Execute | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **CO-01** | **Cart Drawer Checkout Form** | Click "Proceed to Checkout" in Cart Drawer | Shipping address form fields open (Name, Mobile, Address, City, State, Pincode). | [ ] |
| **CO-02** | **Mandatory Field Validation** | Leave Mobile blank and click "Place Order" | Alert prompts user to complete mandatory delivery address fields. | [ ] |
| **CO-03** | **Successful Order Placement** | Fill Name: "Ramesh Kumar", Mobile: "9876543210", City: "Chennai", State: "Tamil Nadu", click "Place Order" | Order is created with ID `VPP-2026-XXXX`. Success confirmation toast appears, cart clears, and record is saved to Supabase `orders` table. | [ ] |

---

## 🔐 Suite 4: Admin Authentication & Security Guard

| Test ID | Test Scenario | Steps to Execute | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **AU-01** | **Unauthenticated Route Protection** | Open a new incognito window and navigate directly to `/admin` | System blocks access and immediately redirects to `/admin/login`. | [ ] |
| **AU-02** | **Invalid Credentials Test** | Enter `wrong@email.com` / `wrongpass` on `/admin/login` | Error banner appears: "Authentication failed. Please check credentials." | [ ] |
| **AU-03** | **Successful Admin Login** | Enter `vel56skc@gmail.com` and password `VailyPyroAdmin@2026!` | Authenticates with Supabase Auth, success banner appears, and redirects to `/admin` dashboard within 1 second. | [ ] |
| **AU-04** | **Session Profile Badge** | Inspect sidebar / mobile header after login | Emerald badge displays `vel56skc@gmail.com (Active)`. | [ ] |
| **AU-05** | **Confirm Sign Out Popup** | Click "Sign Out Session" | Light theme confirm modal appears asking "Confirm Admin Sign Out". | [ ] |
| **AU-06** | **Cancel Sign Out** | Click "Cancel" in Sign Out popup | Modal closes. Admin remains logged in. | [ ] |
| **AU-07** | **Execute Sign Out** | Click "Sign Out Session" -> click "Yes, Sign Out" | Supabase session terminates, user is redirected to `/admin/login`. Navigating to `/admin` forces login screen. | [ ] |

---

## 📦 Suite 5: Admin Order Processing Hub

| Test ID | Test Scenario | Steps to Execute | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **OR-01** | **Executive Metric KPI Strip** | Navigate to `/admin/orders` | Total Revenue, Active Orders, Average Order Value, and Pending Dispatch KPI cards display live totals from Supabase. | [ ] |
| **OR-02** | **Segmented Status Filters** | Click "CONFIRMED" tab | Table/Card list filters to display only orders in CONFIRMED state. | [ ] |
| **OR-03** | **Order Details Drawer** | Click on order `VPP-2026-XXXX` | Mobile slide-up bottom sheet / drawer opens with order stage stepper, items list, customer contact, and audit history log. | [ ] |
| **OR-04** | **Order Status Transition** | Advance status from `PENDING` to `CONFIRMED` | Confirmation modal opens. After confirming, order stage advances, status badge turns blue, audit log records timestamped update. | [ ] |
| **OR-05** | **Logistics Carrier Dispatch** | Set status to `DISPATCHED`, enter Carrier: "VRL Logistics", Tracking #: "VRL-99201" | Tracking details save to Supabase `orders` row. Status updates to DISPATCHED. | [ ] |
| **OR-06** | **Printable Tax Invoice Modal** | Click "Print Packing Slip & Invoice" | Printable tax invoice opens with Sivakasi warehouse checklist, QR verification code, and print trigger. | [ ] |

---

## 🏭 Suite 6: Product Catalog & Warehouse Inventory

| Test ID | Test Scenario | Steps to Execute | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **PR-01** | **Product Active Toggle** | Navigate to `/admin/products` -> click "ACTIVE" toggle on SKU `SPK-10CM` | Status updates to `INACTIVE` in Supabase. Product disappears from customer storefront. | [ ] |
| **PR-02** | **Bulk CSV Import Modal** | Click "Bulk CSV Import" -> upload CSV file | Importer parses SKUs, validates columns, and appends imported products to catalog. | [ ] |
| **INV-01**| **Live Inventory Balances** | Navigate to `/admin/inventory` | Table / mobile cards display live stock, reserved units, and safety threshold alerts (e.g. `LOW STOCK` badge if stock <= safety threshold). | [ ] |
| **INV-02**| **Stock Adjustment Modal** | Click "Adjust Stock" on product -> select "PURCHASE", Quantity: 50, Reason: "Sivakasi Batch #402" | Available stock increases by 50 units. New entry appears in Movement Audit Log. | [ ] |

---

## 📱 Suite 7: Mobile Usability & Responsiveness

| Test ID | Test Scenario | Steps to Execute | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **MB-01** | **Mobile Navigation Drawer** | Open site on smartphone viewport (< 640px) -> tap hamburger icon | Slide-out mobile drawer opens smoothly. All navigation links and Sign Out triggers are accessible. | [ ] |
| **MB-02** | **Mobile Product Cards** | View `/admin/products` on mobile device | Grid displays dedicated mobile product cards with 1-tap edit and status triggers without horizontal scrolling. | [ ] |
| **MB-03** | **Mobile Inventory Cards** | View `/admin/inventory` on mobile device | Mobile stock cards display available/reserved/safety units cleanly with touch-friendly adjustment buttons. | [ ] |
| **MB-04** | **Mobile Drawer Slide-Up** | Click any order on mobile device | Order details slide up from the bottom as a mobile sheet for easy thumb navigation. | [ ] |

---

## 🎯 Final Pre-Production Acceptance Sign-Off

- **Tester Name**: __________________________  
- **Test Date**: __________________________  
- **Total Test Cases**: 27  
- **Passed**: ____ / 27  
- **Sign-Off Status**: `[ ] APPROVED FOR PRODUCTION RELEASE`  
