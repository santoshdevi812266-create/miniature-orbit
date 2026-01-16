# EZO Billing POS - Database Setup Guide

## Supabase Setup Instructions

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Sign up or log in
- Create a new project
- Copy your **Project URL** and **Anon Key**

### 2. Create Tables

Execute the following SQL commands in Supabase SQL Editor:

#### Products Table
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(50) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster barcode lookup
CREATE INDEX idx_products_barcode ON products(barcode);
```

#### Customers Table
```sql
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for phone lookup
CREATE INDEX idx_customers_phone ON customers(phone);
```

#### Bills Table
```sql
CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for bill lookup
CREATE INDEX idx_bills_bill_number ON bills(bill_number);
CREATE INDEX idx_bills_created_at ON bills(created_at);
```

#### Bill Items Table
```sql
CREATE TABLE bill_items (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bills(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for bill item lookup
CREATE INDEX idx_bill_items_bill_id ON bill_items(bill_id);
```

### 3. Add Sample Products

```sql
INSERT INTO products (name, barcode, price, unit, category) VALUES
('Rice (1kg)', '8901234567890', 80, 'kg', 'Groceries'),
('Wheat (1kg)', '8901234567891', 55, 'kg', 'Groceries'),
('Sugar (1kg)', '8901234567892', 50, 'kg', 'Groceries'),
('Oil (1L)', '8901234567893', 200, 'L', 'Groceries'),
('Salt (1kg)', '8901234567894', 30, 'kg', 'Groceries'),
('Bread', '8901234567895', 40, 'piece', 'Bakery'),
('Milk (1L)', '8901234567896', 60, 'L', 'Dairy'),
('Butter (200g)', '8901234567897', 120, 'g', 'Dairy'),
('Tomato', '9876543210123', 40, 'kg', 'Vegetables'),
('Potato', '9876543210124', 30, 'kg', 'Vegetables'),
('Onion', '9876543210125', 35, 'kg', 'Vegetables'),
('Apple', '9876543210126', 120, 'kg', 'Fruits');
```

### 4. Configure App

1. Open `js/supabase-config.js`
2. Replace:
   - `YOUR_SUPABASE_URL` with your Supabase Project URL
   - `YOUR_SUPABASE_ANON_KEY` with your Anon Key

Example:
```javascript
const SUPABASE_URL = 'https://yourproject.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## Features

### POS App (pos-app.html)
- ✅ Camera preview integration
- ✅ Product selection and search
- ✅ Shopping cart management
- ✅ Discount calculation
- ✅ Multiple payment methods (Cash, Card, Online)
- ✅ QR code bill generation
- ✅ Customer details storage (optional)
- ✅ Bill history in local storage

### Scanner App (scanner-app.html)
- ✅ Barcode scanner integration
- ✅ Real-time product scanning
- ✅ Quantity/weight input
- ✅ Tax calculation
- ✅ Recent scan tracking
- ✅ Statistics display
- ✅ Payment processing
- ✅ QR code generation

## Payment Methods

1. **Cash** - Direct payment
2. **Card** - Debit/Credit card payment (can integrate with payment gateway)
3. **Online** - UPI/Razorpay integration (placeholder included)

## Local Features

- Bill history stored in browser's localStorage
- Automatic bill numbering
- Real-time calculations
- Responsive design for all devices
- Hindi thank you message after payment

## Security Notes

- Keep Supabase keys secure
- Use environment variables in production
- Enable Row Level Security (RLS) policies
- Validate all input on server side

## Customization

### Add More Products
Use the SQL INSERT statement above or add directly via Supabase dashboard.

### Change Payment Methods
Edit `js/payment.js` - `PaymentProcessor` class

### Customize Styling
Modify `css/style.css` - All colors defined as CSS variables

### Change Thank You Message
Search for "Dhanyavaad" in HTML files and replace with your message

## Testing

1. Open `index.html` in browser
2. Select POS or Scanner app
3. Add sample products from database
4. Complete payment flow
5. Check QR code generation
6. Verify bill storage

## Mobile Support

Both apps are fully responsive and work on:
- Smartphones (Android/iOS)
- Tablets
- Desktop browsers

Enable barcode scanner on devices with proper hardware.
