# EZO Billing POS System

A modern, browser-based Point of Sale (POS) system with barcode scanning, security camera integration, and payment processing. Built with HTML5, CSS3, and JavaScript with Supabase backend.

## 🎯 Features

### Main POS App
- **Camera Preview** - Integrated security camera feed
- **Product Management** - Add products with prices and quantities
- **Shopping Cart** - Add/remove items with quantity adjustment
- **Discount System** - Apply percentage-based discounts
- **Payment Options** - Cash, Card, and Online payments
- **QR Code Bills** - Generate QR codes for each transaction
- **Customer Database** - Optional customer information storage
- **Responsive Design** - Works on all devices

### Barcode Scanner App
- **Barcode Scanning** - Real-time product barcode scanning
- **Weight/Quantity Input** - Support for products sold by weight
- **Quick Checkout** - Fast scanning and payment processing
- **Tax Calculation** - Configurable tax rates
- **Recent Scans** - Track recently scanned products
- **Statistics** - Real-time bill statistics
- **Mobile Optimized** - Perfect for handheld devices

## 📱 Apps Included

### 1. **Main Dashboard** (`index.html`)
- Quick navigation between POS and Scanner apps
- System information and setup instructions

### 2. **POS App** (`pos-app.html`)
- Professional point of sale interface
- Camera preview on left, bill on right
- Product grid with search functionality
- Full inventory management

### 3. **Scanner App** (`scanner-app.html`)
- Barcode scanning focused interface
- Real-time product lookup
- Quick quantity input
- Optimized for speed

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Supabase Anon Key
- **QR Generation**: QR Server API (no library needed)
- **Storage**: LocalStorage + Supabase
- **Styling**: EZO Billing Machine Theme

## 📂 File Structure

```
ezo-billing-pos/
├── index.html                 # Main dashboard
├── pos-app.html              # POS application
├── scanner-app.html          # Barcode scanner app
├── css/
│   └── style.css             # EZO billing machine styling
├── js/
│   ├── supabase-config.js    # Supabase configuration
│   ├── pos-app.js            # POS app logic
│   ├── scanner-app.js        # Scanner app logic
│   ├── payment.js            # Payment processing
│   ├── qr-generator.js       # QR code generation
│   ├── camera.js             # Camera preview
│   └── barcode-scanner.js    # Barcode scanning
├── DATABASE_SETUP.md         # Database setup guide
└── README.md                 # This file
```

## 🚀 Quick Start

### 1. Clone or Download
```bash
cd ezo-billing-pos
```

### 2. Configure Supabase
- Create Supabase project at [supabase.com](https://supabase.com)
- Run SQL from `DATABASE_SETUP.md`
- Copy credentials to `js/supabase-config.js`

### 3. Open in Browser
- Open `index.html` in your web browser
- No build process needed!

### 4. Add Products
- Use Supabase dashboard
- Add products with barcodes and prices
- Sample data included

### 5. Start Using
- Click "POS Billing" or "Barcode Scanner"
- Add products/scan barcodes
- Complete payment
- Print or save QR code

## 💰 Payment Processing

### Supported Methods
- **Cash** - Manual entry with amount
- **Card** - Credit/Debit card placeholder
- **Online** - UPI/Razorpay integration ready

### Integration Ready
- Payment gateway integration placeholders
- Transaction ID tracking
- Payment method storage

## 🎨 Styling

Based on EZO Billing Machine design:
- **Primary Color**: Dark Blue (#1a1a2e)
- **Accent Color**: Deep Blue (#0f3460)
- **Success Color**: Green (#27ae60)
- **Warning Color**: Orange (#f39c12)
- **Danger Color**: Red (#e74c3c)

All colors configurable in `css/style.css`

## 📊 Database Schema

### Tables
- **products** - Product inventory
- **customers** - Customer information
- **bills** - Transaction records
- **bill_items** - Individual bill line items

See `DATABASE_SETUP.md` for complete schema.

## 🎯 Key Functions

### POS App
```javascript
posApp.addToCart(productId)    // Add product to cart
posApp.removeFromCart(index)   // Remove from cart
posApp.updateBill()            // Update bill display
processPayment(method)         // Process payment
showSuccessModal(billData)     // Show success screen
```

### Scanner App
```javascript
scannerApp.handleBarcodeScan(barcode)  // Process barcode
scannerApp.addScannedProduct()         // Add to cart
scannerApp.processPayment(method)      // Process payment
scannerApp.clearBill()                 // Clear current bill
```

## 🔒 Security Features

- ✅ Supabase authentication
- ✅ Row Level Security (RLS) ready
- ✅ Input validation
- ✅ Transaction tracking
- ✅ Secure payment handling

## 📱 Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers
- ✅ Tablet browsers

## 🎤 Localization

- **Default**: English/Hindi (bilingual UI)
- **Thank You Message**: "Shopping ke liye Dhanyavaad!" (Hindi)
- **Easy to customize**: Edit text in HTML files

## 📈 Features Breakdown

| Feature | POS | Scanner |
|---------|-----|---------|
| Product Search | ✅ | ✅ |
| Camera Preview | ✅ | ❌ |
| Barcode Scanning | ✅ | ✅ |
| Weight Input | ✅ | ✅ |
| Discount | ✅ | ❌ |
| Tax | ❌ | ✅ |
| QR Code | ✅ | ✅ |
| Payment | ✅ | ✅ |
| Customer Info | ✅ | ❌ |

## 🔧 Configuration

### Change Store Name
Edit in HTML files - search for "EZO Billing"

### Add Payment Gateway
Edit `js/payment.js` - `processOnlinePayment()` method

### Customize Colors
Edit CSS variables in `css/style.css`

### Change Product List
Edit sample products in `js/pos-app.js` and `js/scanner-app.js`

## 💾 Data Storage

- **Bills**: Supabase + LocalStorage
- **Products**: Supabase
- **Customers**: Supabase
- **History**: Browser LocalStorage

## 📝 Bill Features

- Unique bill number generation
- Item-wise calculation
- Discount/Tax application
- Payment method recording
- Customer details (optional)
- QR code with bill data
- Thank you message

## 🎬 Getting Started Video

1. Open `index.html`
2. Click on "POS Billing" or "Barcode Scanner"
3. Select products or scan barcodes
4. Enter quantity/weight
5. Click "Proceed to Payment"
6. Select payment method
7. View QR code and bill
8. Click "Done - New Bill"

## 🐛 Troubleshooting

### Camera not working
- Check browser permissions
- Ensure HTTPS in production
- Try different browser

### Products not loading
- Check Supabase credentials
- Verify database tables exist
- Check internet connection

### QR code not showing
- QR Server should be accessible
- Check internet connection
- Try clearing browser cache

## 📞 Support

For issues or features:
1. Check DATABASE_SETUP.md
2. Review browser console errors
3. Verify Supabase connection
4. Check product data exists

## 📄 License

Free to use and modify for personal/commercial use.

## 🙏 Credits

Built with:
- Supabase
- QR Server API
- Modern CSS & JavaScript

## 📮 Feedback

Suggestions for improvement welcome!

---

**Happy Billing! Shopping ke liye Dhanyavaad! 🙏**
