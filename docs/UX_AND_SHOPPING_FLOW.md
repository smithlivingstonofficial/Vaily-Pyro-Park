# UX & Shopping Flow Architecture

## 1. Design Philosophy
> **"Shopping must be extremely fast, effortless, and visual."**

The user experience prioritizes mobile usability, high touch targets, low cognitive load, and instant visual feedback. Customers should never be forced to navigate back and forth between product pages and category lists just to add items.

---

## 2. Primary Customer Journey

```text
┌────────────────┐
│  OPEN WEBSITE  │  Sticky header with search bar & category pill slider
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ BROWSE / SEARCH│  Mobile 2-column card grid or Quick Shop list view
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ TAP + TO ADD   │  Instant local UI update + server sync (0 page reloads)
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ VIEW CART BAR  │  Bottom persistent bar shows item count, subtotal, progress
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ MIN-ORDER CHECK│  Cart drawer displays progress bar & top-up recommendations
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ ONE-PAGE CHECK │  Guest details (Name, Phone, Address) & Delivery Selection
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ ORDER CONFIRMED│  Order ID generated, live tracking link & WhatsApp share
└────────────────┘
```

---

## 3. Mobile Layout Wireframes

### 3.1 Mobile Storefront & Quick Grid
```text
┌─────────────────────────────────────────┐
│ 🎆 Vaily Pyro Park            🔍 🛒(3)  │
├─────────────────────────────────────────┤
│ 🔍 Search sparklers, rockets, pots...  │
├─────────────────────────────────────────┤
│ [All] [Sparklers] [Ground] [Aerial] [🎁]│ (Horizontal Category Pills)
├────────────────────┬────────────────────┤
│ ┌────────────────┐ │ ┌────────────────┐ │
│ │  [PRODUCT IMG] │ │ │  [PRODUCT IMG] │ │
│ │                │ │ │                │ │
│ │ Deluxe Pot     │ │ │ 10" Sparkler   │ │
│ │ ₹450  <s>₹600</s> │ │ ₹180  <s>₹240</s> │ │
│ │ 25% OFF        │ │ │ 25% OFF        │ │
│ │  [-] 2 [+]     │ │ │  [-] 0 [+]     │ │
│ └────────────────┘ │ └────────────────┘ │
├────────────────────┴────────────────────┤
│ 🛒 3 items | ₹1,080       [ VIEW CART ] │ (Sticky Bottom Drawer Trigger)
└─────────────────────────────────────────┘
```

### 3.2 Dynamic Cart Drawer & Threshold Progress
```text
┌─────────────────────────────────────────┐
│ 🛒 Your Shopping Cart              [X]  │
├─────────────────────────────────────────┤
│ Minimum Order (Tamil Nadu): ₹3,000      │
│ Progress: ₹1,080 / ₹3,000               │
│ [██████████░░░░░░░░░░░░░░] 36%          │
│ ⚠️ Add ₹1,920 more to enable checkout!  │
├─────────────────────────────────────────┤
│ Add quick top-ups:                      │
│ + [Add ₹180 Sparkler]  + [Add ₹450 Pot]│
├─────────────────────────────────────────┤
│ Items in Cart:                          │
│ • 2x Deluxe Pot - ₹900      [-] 2 [+] 🗑️│
│ • 1x 10" Sparkler - ₹180    [-] 1 [+] 🗑️│
├─────────────────────────────────────────┤
│ Subtotal:                       ₹1,080  │
│ Delivery Fee:               Calculated  │
│ Total Savings:                    ₹360  │
│ [ PROCEED TO CHECKOUT (Locked) ]       │
└─────────────────────────────────────────┘
```

---

## 4. Specialized UX Modes

### 4.1 Quick Shop Mode (Table View for Bulk Buyers)
For experienced buyers or retailers who know exact SKUs:
* A high-density table showing: `Product Name`, `Pack Size`, `MRP`, `Selling Price`, `Qty Input`, `Subtotal`.
* Instant numeric keypad input. Pressing `Tab` or `Enter` advances to the next item line.

### 4.2 Buy Again Flow
Returning customers enter their mobile number or click their order link:
* Displays prior purchase list with product thumbnails, quantities, and current prices.
* Single button: **"Re-Add All Items to Cart"**, with ability to tweak steppers prior to checkout.

### 4.3 WhatsApp Order Confirmation
Upon checkout submission:
* Order details are saved securely to PostgreSQL.
* Customer receives an immediate confirmation UI screen with a primary CTA: **"Send Order Copy to WhatsApp"**.
* Clicking opens WhatsApp with a formatted message containing Order ID, total amount, item breakdown, and delivery address.
