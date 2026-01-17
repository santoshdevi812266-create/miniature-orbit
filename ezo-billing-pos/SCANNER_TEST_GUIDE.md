# 🧪 Scanner App - Quick Test Guide

## Test Everything in 5 Minutes

### Open Scanner App
```
http://localhost:8000/scanner-app.html
```

---

## Test 1: Debouncing (No Duplicates) - 1 min

**What to do:**
1. Type barcode: `1001`
2. Press Enter **immediately** type and enter `1001` again

**Expected:**
- First scan: ✓ Product added, beep heard
- Second scan: 🚫 Ignored (debounced)
- Wait 500ms
- Third scan: ✓ Works again

**Console shows:**
```
✓ Barcode scanned: 1001
✓ Product found: Rice (1kg)
[500ms wait...]
✓ Barcode scanned: 1001
```

---

## Test 2: Beep Sound - 1 min

**What to do:**
1. Type any barcode: `1002`
2. Press Enter
3. Listen for sound

**Expected:**
- *Beep sound* when barcode detected
- Higher *Beep* if product found

**Volume:**
- Should be audible but not loud
- Check browser speaker volume if silent

---

## Test 3: Unknown Barcode Modal - 2 min

**What to do:**
1. Type: `9999` (doesn't exist)
2. Press Enter
3. **Modal should pop up** with dark background

**Expected:**
- Dark overlay appears
- Modal centered on screen
- Shows "Product not found! Add it directly below 👇"
- Barcode field has `9999`
- Name field is focused (can type immediately)

**Add product:**
1. Type name: `Test Item`
2. Type price: `99`
3. Unit: `pcs` (already selected)
4. Click: **"✓ Add Product"** (NOT "Send to POS")

**Result:**
- Modal closes
- Shows: "✓ Test Item added successfully!"
- *Beep sound* (success)

**Verify it worked:**
1. Type: `9999` again
2. Press Enter
3. ✓ Product appears!

**Console shows:**
```
📋 Opening add product modal for barcode: 9999
✓ Add product modal opened
✓ Product added locally: Test Item
✓ Test Item added successfully!
```

---

## Test 4: No Need for Main POS - 1 min

**Important:** Scanner works independently!

**What to do:**
1. **Close POS tab** (don't need it)
2. In Scanner: Type unknown barcode `8888`
3. Modal opens
4. Add product:
   - Name: `Offline Item`
   - Price: `50`
5. Click "✓ Add Product"

**Result:**
- ✓ Product added
- ✓ Can scan `8888` again
- ✓ No POS needed!

**Console shows:**
```
✓ Product added locally: Offline Item
[Product can be scanned even without POS connected]
```

---

## Test 5: Multiple Barcode Formats - 30 sec

**If you have camera enabled:**
1. Click: "📷 Use Camera to Scan"
2. Point at different barcode types:
   - UPC codes
   - EAN codes  
   - QR codes
   - Code-128

**Expected:**
- Should detect most common formats
- Fallback to manual entry always works

---

## What to Check Console For

**F12 → Console tab:**

### Good Signs ✓
```
✓ Barcode scanned: 1001
✓ Product found: Rice (1kg)
🚫 Duplicate scan ignored (debounced)
✓ Add product modal opened
✓ Product added locally: Test Item
```

### Bad Signs ✗
```
❌ Add product panel not found!
Error: Cannot read property...
ReferenceError: barcodeDetector undefined
```

If you see bad signs, let me know!

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Scan barcode in input |
| Escape | Close modal (if open) |
| Tab | Move between form fields |

---

## All Test Products Ready

Use these to test (all exist):
- `1001` = Rice (₹50)
- `1002` = Wheat (₹45)
- `1003` = Sugar (₹55)
- `1004` = Salt (₹15)
- `1005` = Oil (₹120)

---

## Troubleshooting

### No beep sound
- Check browser volume (not muted)
- Check system volume
- Some browsers need user interaction first
- Try scanning known product

### Modal doesn't appear
- Try refreshing page
- Check console (F12) for errors
- Try different unknown barcode

### Keeps adding duplicates
- Debounce might not be working
- Check console: `🚫 Duplicate scan ignored`
- Try waiting 600ms between scans

### Barcode camera not detecting
- BarcodeDetector API not available
- Use manual input (type barcode)
- Try different lighting
- Some browsers don't support it

---

## Summary

✓ **All 4 improvements working:**
1. Debouncing: No duplicates
2. Beep: Audio feedback
3. Modal: Clear UI for unknown products
4. Formats: More barcodes recognized

**Everything ready to use!** 🚀
