# Admin Requirements & Operational System

## 1. Executive Summary
The Admin Console provides business managers, warehouse teams, and fulfillment staff with a fast, responsive interface to manage orders, inventory, product catalogues, seasonal campaigns, and system settings with maximum operational efficiency.

---

## 2. Core Admin Modules

```text
┌──────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                           │
├───────────────┬─────────────────────────────┬────────────────┤
│  OVERVIEW     │  OPERATIONS                 │  CATALOGUE     │
│  • Sales KPIs │  • Order Fulfillment        │  • Products    │
│  • Orders Feed│  • Stock Movement Ledger    │  • Combos      │
│  • Low Stock  │  • Delivery Zone Matrix     │  • CSV Imports │
├───────────────┴─────────────────────────────┴────────────────┤
│  ADMINISTRATIVE & GOVERNANCE                                 │
│  • Role-Based Access Control (RBAC)                           │
│  • Active Season Selector                                     │
│  • Audit Trail & Change Logs                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Order Processing Workflow

### 3.1 Lifecycle & Status Engine
```text
  [ PENDING ] ───( Admin Confirms / Payment Verified )───> [ CONFIRMED ]
       │                                                         │
       ▼                                                         ▼
  [ CANCELLED ] <──────────────────────────────────────── [ PACKING ]
                                                                 │
                                                                 ▼
                                                            [ PACKED ]
                                                                 │
                                                                 ▼
                                                          [ DISPATCHED ]
                                                                 │
                                                                 ▼
                                                           [ DELIVERED ]
```

### 3.2 Key Order Features
* **Quick Status Actions**: Single-click transitions directly from order lists.
* **Bulk Order Operations**: Select multiple orders to bulk-print packing slips or update statuses to `PACKING` / `DISPATCHED`.
* **Internal Order Notes**: Time-stamped internal comments visible only to admin staff.
* **Customer WhatsApp Contact**: Direct button to initiate WhatsApp chat pre-filled with order tracking information.

---

## 4. Catalogue & Inventory Control

### 4.1 Product & Combo Management
* **Single & Combo Products**: Manage regular SKUs alongside multi-item bundle combos (e.g., "Family Party Box").
* **Dynamic Pricing Engine**: Set regular price (MRP), selling price, discount percentage, pack size, category tags, and active status.
* **Image Pipeline**: Drag-and-drop image upload automatically routed to Cloudflare R2 / Supabase Storage with responsive WebP delivery.

### 4.2 Bulk CSV/Excel Imports & Validation
* Upload bulk price list updates using CSV files.
* **Pre-Validation System**: System inspects uploaded CSVs for syntax errors, missing SKUs, invalid numbers, or missing categories BEFORE executing database mutations.

### 4.3 Inventory Movement Ledger
* Full traceability of stock changes using inventory movement records:
  ```text
  Available Stock = Opening Stock + Purchase Receipts - Reserved Orders - Sales Deliveries - Damages + Cancellations
  ```
* Stock adjustment interface for logging warehouse breakage or new factory purchases with mandatory reason codes.

---

## 5. Security & Governance

### 5.1 Staff Roles & Access Control
| Role | View Orders | Update Orders | Edit Pricing | Adjust Stock | Audit Logs | Manage Staff |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `SUPER_ADMIN` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `ORDER_MANAGER` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `INVENTORY_MANAGER` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `PACKING_STAFF` | ✅ (Picklists) | ✅ (Packed) | ❌ | ❌ | ❌ | ❌ |

### 5.2 Audit Logging
All admin actions mutating state (price changes, order cancellations, role grants, inventory overrides) generate immutable audit records capturing:
* `user_id`, `role`, `timestamp`, `action_type`, `target_entity`, `old_value_json`, `new_value_json`, `ip_address`.
