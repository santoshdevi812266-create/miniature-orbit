# 📱 Tablet Quick Reference Guide

## For iPad/Android Tablet Users

### Starting the App on Tablet

1. Open browser (Chrome, Safari)
2. Navigate to: `http://[your-computer-ip]:8000`
   - Or direct file path if local
3. Click "💳 Enhanced POS"

---

## 🎯 Quick Steps: Processing a Bill

### Step 1: Select Product
- **Tap product card** in left panel
- Product grid shows all items
- Use search bar to find quickly

### Step 2: Enter Quantity
Quantity panel pops up with 3 ways to enter:

**Option A: Preset Buttons** (Fastest!)
```
0.5 kg | 1 kg | 2 kg | 5 kg
```
Tap the amount you want

**Option B: Plus/Minus** (Precise control)
```
[−] 1.5 [+]
```
Tap − or + to adjust

**Option C: Type Directly** (Exact amounts)
```
[Input box with number]
```
Type amount and tap ✓

### Step 3: Confirm & Add
```
[Confirm Button] → Item added to cart
```

### Step 4: Review Bill
- Right side shows all items
- See total at bottom
- Remove items with ✕ button

### Step 5: Proceed to Payment
```
[Payment Button] → Choose payment method
```

### Step 6: Process Payment
```
Choose: 💳 Card | 💵 Cash | 🌐 Online | 👛 Wallet
```
Click method → QR code shows → Done!

---

## ➕ Adding New Products

Located at **bottom of left panel**

**Fill in:**
1. Product Name: "Tomatoes"
2. Barcode: "1234567890"
3. Price: "60"
4. Unit: "kg" (or "pcs", "liters")
5. Category: "Vegetables"

**Tap: Add Product** → Product available immediately

---

## 🎥 Setting Up Security Camera

1. Find **Camera Settings** section
2. Get your camera URL:
   - IP Camera: `http://192.168.1.100:8080/stream`
   - Cloud Camera: Check account settings
   - Check camera manual

3. Paste URL in text box
4. Tap **Update Camera**
5. Live preview appears

**Supported formats:**
- ✅ HTTP streams
- ✅ MJPEG (Motion JPEG)
- ✅ RTSP (Real-time)
- ✅ HLS (Cloud cameras)

---

## 📊 Viewing Sales Analytics

**From home dashboard:** Click 📊 Analytics

**Or direct:** analytics.html

### Dashboard shows:
- **Today's Sales** - ₹ amount
- **Weekly Total** - 7-day sum
- **Monthly Total** - Full month
- **Avg Transaction** - Average per bill

### Charts:
1. **Daily Bar Chart** - Sales by day
2. **Weekly Line Chart** - 7-day trend
3. **Payment Pie Chart** - Method breakdown

### Export Data:
```
[CSV Export] → Download spreadsheet
[Print] → Print-friendly report
```

---

## 🔧 Tablet-Specific Tips

### For iPad (Portrait):
- **Left side:** Product grid (45%)
- **Right side:** Cart/Bill (55%)
- **Camera:** Top of app

### For iPad (Landscape):
- Full width layout
- All controls visible
- Comfortable for standing/counter use

### For Android Tablet:
- Rotate screen for best view
- Large touch buttons (50×50px)
- Pinch to zoom if needed

### Battery Saving:
- Reduce screen brightness
- Close background apps
- Use airplane mode to reduce WiFi power

---

## ⚡ Quick Tips & Tricks

### Speed Up Billing:
1. Use product grid search
2. Use preset quantity buttons (faster than typing)
3. Set default payment method

### Manage Inventory:
- Edit product prices before sale
- Remove sold-out items
- Add new items on the fly

### Camera Troubleshooting:
- Camera not showing? Check WiFi connection
- Try different camera URL format
- Update URL and refresh

### Check Sales:
- Open Analytics anytime
- See today's totals
- Print reports for records

---

## 📞 Common Issues

### "Product not saving"
→ Check internet connection to Supabase  
→ Verify database is set up

### "Quantity modal stuck"
→ Tap outside the modal to close  
→ Clear browser cache (Settings → Storage)

### "Camera keeps disconnecting"
→ Check WiFi signal strength  
→ Restart camera and tablet  
→ Try cloud-based camera service instead

### "Analytics shows no data"
→ Wait for first sale to process  
→ Refresh page (Ctrl+R)  
→ Check date range selector

---

## 🎨 Customizing for Your Store

### Change Business Name:
Edit `index.html` and `pos-enhanced.html`
```
<h1>🏪 YOUR STORE NAME</h1>
```

### Change Logo/Emoji:
Edit heading emoji: `🏪` → `🛒` or `🏬`

### Add Store Address:
Edit footer in `pos-enhanced.html`:
```
<footer>
  Your Store Name | Address | Phone
</footer>
```

---

## 🚀 Performance Optimization

### Make App Faster on Tablet:

1. **Offline Support:**
   - App works even without internet (local data)
   - Syncs when connection returns

2. **Faster Loading:**
   - Clear browser cache regularly
   - Restart app after adding many products

3. **Smooth Scrolling:**
   - Use hardware-accelerated scrolling
   - Avoid zooming (use full resolution)

---

## 📲 Installing as Web App (Optional)

### On iPad:
1. Open Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Choose name and icon
5. App now launches like native app

### On Android:
1. Open Chrome
2. Tap Menu (⋮)
3. Select "Install app"
4. Confirm
5. App on home screen

---

## ✅ Pre-Shift Checklist

Before opening:
- [ ] WiFi is connected
- [ ] Camera URL is correct
- [ ] All products loaded
- [ ] Printer working (if using)
- [ ] Tablet battery > 50%
- [ ] Today's date is correct

---

## 🎯 Training Quick Tips

**For new staff:**
1. **Learn product grid** - 5 min
2. **Practice quantity input** - 5 min
3. **Process sample bill** - 10 min
4. **Try all payment methods** - 5 min
5. **Check analytics** - 5 min

Total training: **~30 minutes**

---

## 📞 Support

**Error in console?** (F12 → Console tab)
- Screenshot error
- Check internet connection
- Refresh page and try again

**Feature not working?**
- Make sure all scripts loaded (Network tab)
- Check Supabase credentials
- Clear cache and reload

**Performance slow?**
- Reduce number of products
- Close extra browser tabs
- Restart tablet

---

**Made for iPad & Android Tablets**  
**Optimized for Portrait & Landscape**  
**Works on 7" to 12" screens**

Enjoy your enhanced POS system! 🎉
