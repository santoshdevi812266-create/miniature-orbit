# EZO Billing POS - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Supabase Configuration (2 minutes)
1. Visit [supabase.com](https://supabase.com) and create account
2. Create new project
3. Go to SQL Editor
4. Copy-paste entire content from `DATABASE_SETUP.md`
5. Execute all SQL commands

### Step 2: Update Credentials (1 minute)
1. Open `js/supabase-config.js`
2. Find `SUPABASE_URL` and `SUPABASE_ANON_KEY`
3. Replace with your Supabase project credentials
4. Save file

### Step 3: Add Products (1 minute)
1. In Supabase dashboard, go to products table
2. Verify sample products are added
3. Add your own products with format:
   - Name: Product name
   - Barcode: Unique 12-13 digit code
   - Price: Amount in rupees
   - Unit: kg, L, piece, g, etc.
   - Category: Product category

### Step 4: Open App (1 minute)
1. Open `index.html` in web browser
2. Click "POS Billing" or "Barcode Scanner"
3. Start adding products!

## 💡 Using the POS App

### Adding Products
1. Click on product in grid
2. Enter quantity when prompted
3. Click "Proceed to Payment"

### Payment
1. Select payment method (Cash/Card/Online)
2. View generated QR code
3. Click "Done - New Bill"

### Customer Details
- Name and phone are optional
- Leave blank for walk-in customers
- Saved to database for future reference

## 🔍 Using the Scanner App

### Scanning Products
1. Focus on barcode input field
2. Scan barcode with scanner or type manually
3. Enter quantity
4. Click "Add to Bill"
5. Repeat for more products

### Statistics
- Total Items: Sum of all quantities
- Unique Products: Different products scanned
- Total Scans: Number of barcode scans

## 📱 Mobile Usage

### On Smartphone
1. Open app URL in browser
2. Camera works on supported devices
3. Scanner needs hardware barcode reader
4. Perfect for quick checkout

### On Tablet
1. Great for POS display
2. Camera preview visible
3. Touch-friendly interface

## ⚙️ Configuration

### Change Store Name
Search for "EZO Billing" in HTML files, replace with your name

### Add More Payment Methods
Edit `js/payment.js` line with `this.paymentMethods = ['Cash', 'Card', 'Online'];`

### Change Colors
Edit CSS variables in `css/style.css`:
```css
--primary-color: #1a1a2e;
--accent-color: #0f3460;
--success-color: #27ae60;
```

### Change Thank You Message
Search for "Dhanyavaad" and replace with your message

## 🎨 Customization

### Add Logo
In `index.html`, `pos-app.html`, `scanner-app.html`:
Replace the emoji (🏪) with your logo

### Change Theme
1. Edit `css/style.css`
2. Modify color variables
3. Update button styles

### Add Discount Types
1. Edit `js/pos-app.js`
2. Add new discount calculation logic
3. Update HTML form

## 🐛 Common Issues

### "Product not found"
- Verify barcode is correct
- Check products table has data
- Ensure barcode format matches

### Camera not showing
- Check browser camera permissions
- May not work on http://localhost
- Some browsers need https

### QR Code blank
- Check internet connection
- QR Server API might be down
- Try refreshing page

### Supabase connection error
- Verify URL and key are correct
- Check if Supabase project is active
- Ensure tables exist in database

## 📊 Sample Data

### Pre-loaded Products
```
Rice - 8901234567890 - ₹80/kg
Wheat - 8901234567891 - ₹55/kg
Sugar - 8901234567892 - ₹50/kg
Oil - 8901234567893 - ₹200/L
... and more
```

You can add unlimited products via Supabase!

## 💾 Data Backup

### LocalStorage
- Bills stored in browser automatically
- Survives browser refresh
- Lost if cache cleared

### Supabase
- Cloud database backup
- Accessible from anywhere
- Permanent storage

## 📱 Feature Comparison

| Feature | POS App | Scanner App |
|---------|---------|-------------|
| Camera Preview | Yes | No |
| Product Search | Yes | No |
| Barcode Scanning | Yes | Yes |
| Manual Entry | Yes | Yes |
| Discount | Yes | No |
| Tax | No | Yes |
| QR Code | Yes | Yes |
| Bill History | Local | Local |

## 🎯 Best Practices

1. **Regular Backups**: Supabase auto-backups enabled
2. **Security**: Use strong Supabase credentials
3. **Testing**: Test with sample products first
4. **Maintenance**: Add products regularly
5. **Monitoring**: Check daily sales in database

## 📈 Next Steps

After setup:
1. ✅ Add all your products to database
2. ✅ Test both POS and Scanner apps
3. ✅ Train staff on usage
4. ✅ Set up payment integrations (optional)
5. ✅ Monitor daily sales

## 🔗 Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [QR Code API](https://www.qr-server.com/)
- [JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 💬 Tips & Tricks

### Speed Up Scanning
- Use numeric barcode lookup
- Train staff on proper scanning
- Organize products logically

### Better UX
- Use same device for all transactions
- Print QR codes for records
- Keep product prices updated

### Mobile Optimization
- Use responsive design fully
- Test on target devices
- Consider network speed

## 🎓 Learning Resources

- Review `DATABASE_SETUP.md` for schema
- Check `README.md` for complete features
- Inspect HTML for structure
- View JS files for logic

---

**Need Help?** 
1. Check database is set up correctly
2. Verify Supabase credentials
3. Ensure products exist
4. Test with sample barcode

**Ready to bill? Let's go! 🚀**
