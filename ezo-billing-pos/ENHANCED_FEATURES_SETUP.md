# 🚀 Enhanced POS System - Complete Setup Guide

## Overview

Your enhanced POS system is now ready with advanced features:

✅ **Real Security Camera Integration** - Live RTSP/HTTP/MJPEG/HLS streams  
✅ **Product Management** - Add, edit, delete products directly in the app  
✅ **HTML/CSS Quantity Input** - Modern quantity picker with presets  
✅ **Tablet Optimization** - Fully responsive for iPad/Android tablets  
✅ **Sales Analytics Dashboard** - Daily/weekly graphs and reports  

---

## 📱 How to Use Each Feature

### 1️⃣ **Enhanced POS App** (Best for tablets & product management)

**Access:** [Click Enhanced POS from home](index.html) or direct link: `pos-enhanced.html`

#### Features:
- **Product Grid** - Browse all products, tap to select
- **Quantity Picker** - Modern HTML/CSS quantity controls:
  - 🔘 Preset buttons (0.5, 1, 2, 5 kg)
  - ➕➖ Increment/Decrement buttons
  - 🔢 Manual input field
- **Product Management** - Add new products:
  - Product Name
  - Barcode (10-digit)
  - Price
  - Unit (kg, pcs, liters, etc.)
  - Category
- **Camera Preview** - Real camera feed:
  - Enter HTTP/MJPEG/RTSP/HLS URL
  - Live preview in app
  - Easy URL update anytime
- **Bill Summary** - Cart items with quantities
- **Payment** - Card/Cash/Online/Wallet options

#### Tablet Optimization:
- **iPad Portrait**: 2-column layout (45% products, 55% cart)
- **iPad Landscape**: Full responsive layout
- **Android Tablet**: Touch-friendly buttons (50x50px minimum)
- **Mobile**: Single column, full width

---

### 2️⃣ **Sales Analytics Dashboard**

**Access:** [Click Analytics from home](index.html) or direct link: `analytics.html`

#### Features:
- **Stat Cards**:
  - Today's Sales
  - Weekly Total
  - Monthly Total
  - Average Transaction
- **Daily Sales Chart** - Bar chart with trend
- **Weekly Trend** - Line chart over 7 days
- **Payment Methods** - Pie chart breakdown
- **Filters**:
  - Report type selector
  - Date range picker
- **Export** - Download as CSV
- **Print** - Generate print-friendly report

#### Reading Analytics:
1. Select report type (Daily/Weekly/Monthly)
2. Choose date range
3. View charts and stats
4. Export data if needed
5. Print for records

---

### 3️⃣ **Security Camera Setup**

#### Supported Stream Formats:

**HTTP Stream** (JPEG)
```
URL: http://192.168.1.100:8080/stream
Endpoint: /stream, /video, /mjpeg, /live
```

**MJPEG Stream** (Motion JPEG)
```
URL: http://camera-ip:8080/mjpg/video.mjpg
Endpoint: /mjpg/video.mjpg, /stream.mjpeg
```

**RTSP Stream** (Real-time Streaming)
```
URL: rtsp://192.168.1.100:554/stream
Format: rtsp://[username]:[password]@[ip]:[port]/[stream_path]
```

**HLS Stream** (HTTP Live Streaming)
```
URL: http://192.168.1.100:8080/stream.m3u8
Used for: Cloud-based cameras, CDN delivery
```

#### Steps to Add Camera:

1. Open Enhanced POS app
2. Find "Camera Settings" section
3. Enter your camera stream URL
4. Click "Update Camera"
5. Live preview appears in camera container
6. To change: Update URL and click again

#### Finding Your Camera URL:

**IP Camera (WiFi):**
- Check camera manual for default URL
- Common: `http://192.168.1.100:8080/stream`
- Or use camera's mobile app to find stream URL

**USB Webcam:**
- Not applicable (requires special setup)
- Use browser's native camera instead

**Cloud Camera (Hikvision, Dahua, etc.):**
- Contact provider for RTSP/HLS link
- Typically in your account settings

---

## 🗄️ Database Setup

### Required Tables in Supabase:

**1. products**
```sql
CREATE TABLE products (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  barcode TEXT UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**2. customers**
```sql
CREATE TABLE customers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**3. bills**
```sql
CREATE TABLE bills (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  bill_number TEXT UNIQUE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  payment_method TEXT NOT NULL,
  customer_id BIGINT REFERENCES customers(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**4. bill_items**
```sql
CREATE TABLE bill_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  bill_id BIGINT NOT NULL REFERENCES bills(id),
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity DECIMAL(10, 3) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Enable Row Level Security:

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;
```

---

## 🔐 Configuration

### Supabase Credentials (Already Configured)

File: `js/supabase-config.js`

✅ **Credentials are already set!**
```javascript
const SUPABASE_URL = 'https://csaqawuizxptaswtvbla.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

No additional setup needed - just start using the app!

---

## 📊 Key JavaScript Classes

### ProductManager
```javascript
// Load all products
await productManager.loadProducts();

// Add product
await productManager.addProduct({
  name: 'Tomato',
  barcode: '1234567890',
  price: 60,
  unit: 'kg',
  category: 'Vegetables'
});

// Update product
await productManager.updateProduct(productId, newData);

// Delete product
await productManager.deleteProduct(productId);
```

### SecurityCamera
```javascript
// Initialize camera
const camera = new SecurityCamera('containerElementId');
camera.initialize();

// Update URL
camera.updateCameraUrl('http://192.168.1.100:8080/stream');
```

### SalesAnalytics
```javascript
// Get daily sales
const dailySales = await saleAnalytics.getDailySales();

// Get weekly summary
const weeklySummary = await saleAnalytics.getWeeklySales();

// Get payment method breakdown
const breakdown = await saleAnalytics.getPaymentBreakdown();
```

### ChartRenderer
```javascript
// Draw bar chart
ChartRenderer.createBarChart(canvasElement, data, {
  title: 'Daily Sales',
  xLabel: 'Date',
  yLabel: 'Amount'
});

// Draw line chart
ChartRenderer.createLineChart(canvasElement, data, {
  title: 'Weekly Trend'
});

// Draw pie chart
ChartRenderer.createPieChart(canvasElement, data, {
  title: 'Payment Methods'
});
```

---

## 🎯 Tablet Optimization Details

### Responsive Breakpoints:

**Desktop (> 1024px)**
- Product grid: 4 columns
- Layout: 50% products | 50% cart
- Buttons: Full size

**Tablet (768px - 1024px)**
- Product grid: 3 columns
- Layout: 45% products | 55% cart
- Buttons: 95% width

**Mobile (< 768px)**
- Product grid: 2 columns
- Layout: 100% width (stacked)
- Buttons: Touch-friendly, 50x50px

### CSS Grid Adjustments:

```css
/* Desktop */
.main-layout {
  grid-template-columns: 50% 50%;
}

/* Tablet */
@media (768px to 1024px) {
  .main-layout {
    grid-template-columns: 45% 55%;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .main-layout {
    grid-template-columns: 100%;
  }
}
```

---

## 🚨 Troubleshooting

### Camera Not Loading?

1. **Check URL Format**
   - Is it `http://` not `https://`?
   - Is port number correct? (8080, 8081, etc.)

2. **Check Network**
   - Camera must be on same WiFi
   - Or accessible via internet (cloud camera)

3. **Try Different Endpoints**
   - `/stream` → `/video.mjpeg`
   - `/mjpg/video.mjpg` → `/live`
   - Check camera documentation

### Products Not Saving?

1. Check Supabase connection in browser console
2. Verify products table exists
3. Check Row Level Security policies

### Analytics Not Showing Data?

1. Make sure bills were saved to Supabase
2. Check bill_items table has entries
3. Try different date range

### Quantity Input Not Working?

1. Clear browser cache (Ctrl+Shift+Del)
2. Check browser console for JavaScript errors
3. Ensure all scripts loaded (F12 → Network tab)

---

## 📝 Quantity Input HTML Structure

The quantity picker includes three input methods:

```html
<!-- Preset buttons -->
<button onclick="setQuantity(1)">1 kg</button>

<!-- Increment/Decrement -->
<button onclick="decreaseQuantity()">−</button>
<button onclick="increaseQuantity()">+</button>

<!-- Manual input -->
<input type="number" id="qtyInput" value="1">
<button onclick="confirmQuantity()">Add to Cart</button>
```

**Why HTML/CSS instead of JavaScript?**
- ✅ Better accessibility
- ✅ Works without JavaScript enabled
- ✅ Faster performance
- ✅ Better for touch on tablets

---

## 🎓 Learning Resources

### File Structure:
```
ezo-billing-pos/
├── index.html              // Home dashboard
├── pos-enhanced.html       // Enhanced POS (NEW!)
├── analytics.html          // Sales analytics (NEW!)
├── css/
│   └── style.css          // Base styles
├── js/
│   ├── product-manager.js  // Product & Camera classes (NEW!)
│   ├── chart-renderer.js   // Canvas charts (NEW!)
│   ├── analytics.js        // Dashboard logic (NEW!)
│   ├── pos-enhanced.js     // Enhanced POS logic (NEW!)
│   ├── supabase-config.js  // Database config
│   ├── payment.js          // Payment processing
│   └── qr-generator.js     // QR codes
```

### Code Flow:

1. **User opens pos-enhanced.html**
2. → `EnhancedPOSApp` class initializes
3. → `ProductManager` loads products from Supabase
4. → Products display in grid
5. → User clicks product → Quantity panel opens
6. → User enters quantity via HTML/CSS controls
7. → Item adds to cart
8. → User proceeds to payment
9. → Bill saved to Supabase
10. → Analytics dashboard updates

---

## 🎉 You're All Set!

Your enhanced POS system now has:
- ✅ Real camera integration
- ✅ Product management interface
- ✅ Modern quantity input
- ✅ Tablet-optimized UI
- ✅ Advanced analytics

**Start using it:**
1. Open `index.html` in your browser
2. Click "💳 Enhanced POS"
3. Add products or use existing ones
4. Set camera URL (optional)
5. Process transactions
6. View analytics anytime

**Questions?** Check the JavaScript console (F12) for helpful error messages!

---

**Version:** 2.0 Enhanced  
**Last Updated:** 2024  
**Creator:** EZO Billing Team
