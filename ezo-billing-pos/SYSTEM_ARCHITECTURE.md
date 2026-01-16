# 🏗️ System Architecture & File Dependencies

## Application Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    EZO BILLING POS SYSTEM                       │
│                         Version 2.0                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERFACE LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                 │
│  │  index.html      │    │  pos-app.html    │                 │
│  │  Dashboard       │    │  Classic POS     │                 │
│  └──────────────────┘    └──────────────────┘                 │
│           │                      │                              │
│  ┌────────▼──────────────────────▼──────────┐                 │
│  │    pos-enhanced.html (NEW)                │                 │
│  │  ┌─────────────────────────────────────┐ │                 │
│  │  │  Product Grid      │ Cart & Bill    │ │                 │
│  │  │  45%               │ 55%            │ │                 │
│  │  ├───────────┬────────┤                │ │                 │
│  │  │ Products  │ Camera │ Bill Items     │ │                 │
│  │  │ Search    │ Preview│ Summary        │ │                 │
│  │  │           │        │ Payment        │ │                 │
│  │  │ Qty Modal │ Settings│               │ │                 │
│  │  │           │        │                │ │                 │
│  │  │ Add       │        │                │ │                 │
│  │  │ Products  │        │                │ │                 │
│  │  └─────────────────────────────────────┘ │                 │
│  └─────────────────────────────────────────┘                 │
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                 │
│  │ analytics.html   │    │scanner-app.html  │                 │
│  │ Sales Dashboard  │    │Barcode Scanner   │                 │
│  └──────────────────┘    └──────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              BUSINESS LOGIC & SERVICES LAYER                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  js/pos-enhanced.js (NEW)                               │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │ class EnhancedPOSApp                              │  │   │
│  │  │ - selectProduct()                                 │  │   │
│  │  │ - addToCart()                                     │  │   │
│  │  │ - updateBill()                                    │  │   │
│  │  │ - processPayment()                                │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ▲                                   │
│                              │                                   │
│  ┌──────────────────────┬────┴──────────────┬──────────────┐    │
│  │                      │                   │              │    │
│  ▼                      ▼                   ▼              ▼    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ ┌──────┐ │
│  │ product-     │  │ analytics.js │  │ payment.js   │ │qr-   │ │
│  │ manager.js   │  │ (NEW)        │  │              │ │gen.  │ │
│  │ (NEW)        │  │              │  │              │ │js    │ │
│  │              │  │ class        │  │ processPayment│ │      │ │
│  │ • Security-  │  │ Analytics-   │  │ • Card       │ │ QR   │ │
│  │   Camera     │  │ Dashboard    │  │ • Cash       │ │codes │ │
│  │ • Product-   │  │              │  │ • Online     │ │      │ │
│  │   Manager    │  │ • updateStats │  │ • Wallet     │ │ Bills│ │
│  │ • Sales-     │  │ • renderCharts│  │              │ │ Recpt│ │
│  │   Analytics  │  │ • exportReport│  │              │ │      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ └──────┘ │
│        │                    │                                    │
│        └────────┬───────────┘                                    │
│                 │                                                │
│  ┌──────────────▼──────────────┐                                │
│  │ chart-renderer.js (NEW)     │                                │
│  │ Canvas-Based Visualization │                                │
│  │                            │                                │
│  │ • createBarChart()         │                                │
│  │ • createLineChart()        │                                │
│  │ • createPieChart()         │                                │
│  │                            │                                │
│  └────────────────────────────┘                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│         DATA & CONFIGURATION LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │      js/supabase-config.js (Already Configured)         │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ SUPABASE_URL                                       │ │  │
│  │  │ https://csaqawuizxptaswtvbla.supabase.co          │ │  │
│  │  │                                                    │ │  │
│  │  │ SUPABASE_ANON_KEY                                 │ │  │
│  │  │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...        │ │  │
│  │  │                                                    │ │  │
│  │  │ Functions:                                         │ │  │
│  │  │ • getProducts()                                    │ │  │
│  │  │ • saveBill()                                       │ │  │
│  │  │ • saveBillItems()                                  │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          css/style.css                                  │  │
│  │  Primary colors and responsive grid definitions        │  │
│  │                                                        │  │
│  │  • --primary-color: #1a1a2e (dark blue)              │  │
│  │  • --accent-color: #0f3460 (deeper blue)             │  │
│  │  • --success-color: #27ae60 (green)                  │  │
│  │  • Grid layout, typography, animations              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│         BACKEND & PERSISTENCE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│          SUPABASE PostgreSQL Database                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  products    │  │ customers    │  │    bills     │         │
│  │              │  │              │  │              │         │
│  │ id           │  │ id           │  │ id           │         │
│  │ name         │  │ name         │  │ bill_number  │         │
│  │ barcode      │  │ phone        │  │ total_amount │         │
│  │ price        │  │ email        │  │ discount     │         │
│  │ unit         │  │              │  │ payment_meth │         │
│  │ category     │  │ created_at   │  │ customer_id  │         │
│  │ created_at   │  │              │  │ created_at   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────────────────────────┐                         │
│  │      bill_items                  │                         │
│  │                                  │                         │
│  │  id                              │                         │
│  │  bill_id (FK → bills.id)        │                         │
│  │  product_id (FK → products.id)  │                         │
│  │  quantity                        │                         │
│  │  unit_price                      │                         │
│  │  total_price                     │                         │
│  │  created_at                      │                         │
│  └──────────────────────────────────┘                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Dependency Graph

```
index.html
    ├── css/style.css
    ├── js/supabase-config.js
    └── Navigation to:
        ├── pos-app.html
        ├── pos-enhanced.html
        ├── scanner-app.html
        └── analytics.html

pos-enhanced.html (NEW)
    ├── css/style.css
    ├── js/supabase-config.js (Supabase client)
    ├── js/product-manager.js (NEW)
    │   └── SecurityCamera, ProductManager, SalesAnalytics classes
    ├── js/payment.js (Payment processing)
    ├── js/qr-generator.js (QR code generation)
    └── js/pos-enhanced.js (NEW) ← Main application logic
        └── EnhancedPOSApp class

analytics.html (NEW)
    ├── css/style.css
    ├── js/supabase-config.js (Supabase client)
    ├── js/product-manager.js (NEW)
    │   └── SalesAnalytics class
    ├── js/chart-renderer.js (NEW)
    │   └── ChartRenderer for canvas visualization
    └── js/analytics.js (NEW)
        └── AnalyticsDashboard class
```

---

## Data Flow Diagrams

### POS Transaction Flow

```
User Opens pos-enhanced.html
            │
            ▼
  EnhancedPOSApp initializes
            │
            ├─→ ProductManager loads products from Supabase
            │
            ├─→ SecurityCamera initializes (optional)
            │
            └─→ displayProducts() shows grid
            │
User Clicks Product Card
            │
            ▼
  openQuantityPanel() shows modal
            │
            ├─→ User chooses quantity method:
            │   ├─ Preset button (0.5, 1, 2, 5)
            │   ├─ Inc/Dec buttons
            │   └─ Manual input field
            │
            ▼
  confirmQuantity() called
            │
            ▼
  addToCart(productId, quantity)
            │
            ▼
  updateBill() displays cart
            │
User Clicks Payment Button
            │
            ▼
  openPaymentModal() shows methods
            │
User Chooses Payment Method
            │
            ├─ Card
            ├─ Cash
            ├─ Online
            └─ Wallet
            │
            ▼
  processPayment(method)
            │
            ├─→ paymentProcessor.processPayment()
            │
            ├─→ QRCodeGenerator.generateBillQR()
            │
            └─→ showSuccessModal()
            │
User Completes Payment
            │
            ▼
  completePayment()
            │
            ├─→ Save bill to Supabase (bills table)
            │
            ├─→ Save items to Supabase (bill_items table)
            │
            ├─→ Update localStorage (local history)
            │
            └─→ clearBill() reset for next customer
```

### Analytics Report Flow

```
User Opens analytics.html
            │
            ▼
  AnalyticsDashboard initializes
            │
            ├─→ Fetch all bills from Supabase
            │
            ├─→ Fetch all bill_items from Supabase
            │
            ▼
  SalesAnalytics processes data
            │
            ├─→ getDailySales() - today's breakdown by hour/product
            │
            ├─→ getWeeklySales() - last 7 days totals
            │
            ├─→ getMonthlySales() - full month aggregation
            │
            ├─→ getPaymentBreakdown() - by payment method
            │
            └─→ getAverageTransaction() - mean transaction value
            │
            ▼
  ChartRenderer creates visualizations
            │
            ├─→ createBarChart() - Daily sales
            │
            ├─→ createLineChart() - Weekly trend
            │
            └─→ createPieChart() - Payment methods
            │
            ▼
  Display on dashboard
            │
            ├─ Stat cards (Today, Week, Month, Avg)
            │
            ├─ Daily bar chart
            │
            ├─ Weekly line chart
            │
            ├─ Payment method breakdown
            │
            └─ Export/Print buttons
            │
User Selects Export
            │
            ├─→ exportReport() generates CSV
            │
            └─→ Browser downloads file
            │
User Selects Print
            │
            └─→ printReport() generates HTML
                → Browser print dialog
```

---

## Component Interaction Matrix

| Component | Interacts With | Purpose |
|-----------|----------------|---------|
| EnhancedPOSApp | ProductManager | Load/manage products |
| EnhancedPOSApp | SecurityCamera | Display camera preview |
| EnhancedPOSApp | PaymentProcessor | Process payments |
| EnhancedPOSApp | QRCodeGenerator | Generate receipt QR |
| AnalyticsDashboard | SalesAnalytics | Calculate metrics |
| AnalyticsDashboard | ChartRenderer | Visualize data |
| SalesAnalytics | Supabase | Fetch bills/items |
| ChartRenderer | Canvas API | Draw charts |
| SecurityCamera | Camera Server | Fetch video stream |
| ProductManager | Supabase | CRUD products |

---

## Database Schema with Relationships

```sql
-- Products Table
products
├── id (Primary Key)
├── name (TEXT)
├── barcode (TEXT, UNIQUE)
├── price (DECIMAL)
├── unit (TEXT)
├── category (TEXT)
└── created_at (TIMESTAMP)

-- Bills Table
bills
├── id (Primary Key)
├── bill_number (TEXT, UNIQUE)
├── total_amount (DECIMAL)
├── discount (DECIMAL)
├── payment_method (TEXT: Card, Cash, Online, Wallet)
├── customer_id (Foreign Key → customers.id)
└── created_at (TIMESTAMP)

-- Bill Items (Junction Table)
bill_items
├── id (Primary Key)
├── bill_id (Foreign Key → bills.id) ◄─── Relationship 1
├── product_id (Foreign Key → products.id) ◄─── Relationship 2
├── quantity (DECIMAL)
├── unit_price (DECIMAL)
├── total_price (DECIMAL)
└── created_at (TIMESTAMP)

-- Customers Table
customers
├── id (Primary Key)
├── name (TEXT)
├── phone (TEXT, UNIQUE)
├── email (TEXT)
└── created_at (TIMESTAMP)

Relationships:
bills → customers (many-to-one: customer can have multiple bills)
bill_items → bills (many-to-one: bill has multiple items)
bill_items → products (many-to-one: product appears in multiple bills)
```

---

## CSS Class Hierarchy & Responsive Breakpoints

```css
/* Base Container */
.main-layout
├── Desktop (> 1024px)
│   └── grid-template-columns: 50% 50%
│
├── Tablet (768px - 1024px)
│   └── grid-template-columns: 45% 55%
│
└── Mobile (< 768px)
    └── grid-template-columns: 100%
        └── grid-template-rows: auto auto

/* Product Grid */
.products-grid
├── Desktop: 4 columns
├── Tablet: 3 columns
└── Mobile: 2 columns

/* Cart & Bill */
.bill-section
├── Desktop: Sticky right panel
├── Tablet: Sticky right panel (narrower)
└── Mobile: Full width below products

/* Buttons */
.quantity-button (50×50px minimum)
.btn-add-to-cart (full width on mobile)
.payment-button (grid on desktop, stack on mobile)
```

---

## Authentication & Security Flow

```
┌─────────────────────────────────────┐
│ Browser App (Client-side)          │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ supabase-config.js            │  │
│ │ SUPABASE_ANON_KEY (public)    │  │
│ └───────────────────────────────┘  │
└──────────────┬──────────────────────┘
               │
               │ HTTPS
               │
        ┌──────▼──────────┐
        │   Supabase     │
        │   Cloud        │
        │                │
        │ ┌────────────┐ │
        │ │   Auth     │ │
        │ │ Row Level  │ │
        │ │ Security   │ │
        │ └────────────┘ │
        │                │
        │ ┌────────────┐ │
        │ │ PostgreSQL │ │
        │ │ Database   │ │
        │ └────────────┘ │
        └────────────────┘

Security Layers:
1. ANON_KEY in localStorage (Supabase session)
2. Row Level Security policies on tables
3. HTTPS encryption in transit
4. Server-side validation in Supabase functions
5. No sensitive data stored on client
```

---

## Performance Optimization Strategies

```
Load Time Optimization
├── Code Splitting
│   └── pos-enhanced.js only loaded on POS page
│
├── Asset Caching
│   └── CSS/JS cached by browser
│
├── Canvas Rendering
│   └── Charts rendered on client (no image downloads)
│
└── Database Queries
    └── Only fetch necessary data per page

Memory Optimization
├── Event Delegation
│   └── Single listener on product grid
│
├── Object Pooling
│   └── Reuse cart items array
│
└── DOM Manipulation
    └── Batch updates with innerHTML

Network Optimization
├── Single Supabase Connection
│   └── Shared across all pages
│
├── Minimal Data Transfer
│   └── Only fetch product name, price, barcode
│
└── Lazy Loading
    └── Load camera stream on demand
```

---

## Deployment Architecture

```
Local Development
├── index.html → localhost/ezo-billing-pos/
├── pos-enhanced.html → localhost/ezo-billing-pos/pos-enhanced.html
└── All files served locally

Production (Web Server)
├── /ezo-billing-pos/index.html
├── /ezo-billing-pos/pos-enhanced.html
├── /ezo-billing-pos/analytics.html
├── /ezo-billing-pos/css/
├── /ezo-billing-pos/js/
└── Supabase API → https://csaqawuizxptaswtvbla.supabase.co

Camera Integration
├── Local Camera (same network)
│   └── http://192.168.1.x:8080/stream
│
├── Cloud Camera (internet)
│   └── rtsp://provider.com/stream
│
└── Mobile Hotspot
    └── Share WiFi with app tablet
```

---

**Architecture Version:** 2.0  
**Last Updated:** 2024  
**Status:** Production Ready  

