# EZO Billing POS System

Modern Point of Sale system with barcode scanning, real-time sync, and analytics.

## Features

- **Dual-App Architecture**: Tablet POS + Phone Scanner
- **Barcode Scanning**: 8 format support with camera
- **Real-time Sync**: Supabase-powered cross-device sync
- **Payment Processing**: Cash, Card, Online, UPI
- **Analytics Dashboard**: Sales tracking and reports
- **Price Adjustment**: Edit prices per bill item
- **Invoice Management**: Print & SMS capabilities

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Navigate to http://localhost:8000
```

### Production with Railway

1. Push code to GitHub
2. Connect to Railway
3. Deploy automatically

## Deployment to Vercel via Railway

### Option 1: Direct Vercel Deployment

```bash
npm install -g vercel
vercel
```

### Option 2: Railway Deployment

```bash
npm install -g @railway/cli
railway init
railway up
```

## Environment Variables

Create `.env.local`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## Project Structure

```
ezo-billing-pos/
├── index.html           # Home page
├── pos-enhanced.html    # Tablet POS
├── scanner-app.html     # Phone scanner
├── analytics.html       # Analytics dashboard
├── css/
│   └── style.css       # Styles
├── js/
│   ├── pos-enhanced.js # POS logic
│   ├── scanner-app.js  # Scanner logic
│   ├── product-manager.js
│   ├── analytics.js
│   └── ...
└── server.js           # Express server
```

## Default Test Products

Products 1001-1010 with test data:
- Mini USB 1GB - ₹50
- Pen Drive 16GB - ₹150
- Mouse - ₹200
- Keyboard - ₹500
- HDMI Cable - ₹100
- And more...

## Default Login

Username: `ajay2266`
