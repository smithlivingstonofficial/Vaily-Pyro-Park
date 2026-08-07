# Platform Product Roadmap

## 1. Release Schedule Overview

```text
  MVP (V1.0)              V1.5 ENHANCEMENTS          V2.0 MULTI-TENANT SAAS
┌──────────────────┐     ┌──────────────────┐     ┌───────────────────────┐
│ • Quick-Add Grid │     │ • WhatsApp Bot   │     │ • Multi-Store Admin   │
│ • One-Page Check │ ──> │ • Celebration    │ ──> │ • Custom Store Domains│
│ • Min-Order UX   │     │   Planner Tool   │     │ • Tenant Subscriptions│
│ • Admin Panel    │     │ • Abandoned Cart │     │ • Vendor Payouts      │
│ • Stock Ledger   │     │ • SMS Alerts     │     │ • Analytics Suite     │
└──────────────────┘     └──────────────────┘     └───────────────────────┘
```

---

## 2. Milestone Details

### Milestone 1: Core MVP (Current Target)
* **Goal**: Launch high-performance, single-store platform for Vaily Pyro Park.
* **Key Features**:
  * Mobile-first quick-add storefront grid with quantity steppers.
  * Drawer cart with real-time subtotal, savings, and minimum order progress bar.
  * One-page guest checkout with delivery zone verification.
  * Server-authoritative checkout with atomic inventory reservation.
  * Complete Admin Console for order status management, product editing, bulk CSV updates, and inventory ledger.
  * WhatsApp single-click order receipt generator.

### Milestone 2: Conversational & Marketing Engine (V1.5)
* **Goal**: Enhance customer retention and automated re-engagement.
* **Key Features**:
  * **Celebration Planner**: Interactive wizard ("Select Budget & Event Type") that auto-populates ideal cracker assortments.
  * Automated WhatsApp notification webhooks for order status updates (`CONFIRMED`, `DISPATCHED`).
  * Abandoned cart retrieval via temporary guest cart tokens.

### Milestone 3: Multi-Tenant SaaS Platform (V2.0)
* **Goal**: Expand architecture to support multiple independent cracker merchants.
* **Key Features**:
  * Multi-store registration and custom domain mapping (`store1.com`, `store2.com`).
  * Merchant-isolated admin dashboards powered by Supabase RLS `store_id` scoping.
  * Subscription billing and platform fee processing.
