#!/bin/bash

# Quick Test Script for POS & Scanner Button Functionality

echo "🔧 Testing Button Functionality..."
echo ""

# Check server is running
echo "✓ Checking server..."
if curl -s http://localhost:8000/scanner-app.html > /dev/null 2>&1; then
    echo "  ✅ Server running on port 8000"
else
    echo "  ❌ Server not responding"
    exit 1
fi

# Check files exist
echo ""
echo "✓ Checking required files..."
files=(
    "js/scanner-app.js"
    "js/pos-enhanced.js"
    "js/supabase-client.js"
    "scanner-app.html"
    "pos-enhanced.html"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing!)"
    fi
done

echo ""
echo "✓ Checking JavaScript syntax..."
node -c js/scanner-app.js && echo "  ✅ scanner-app.js OK" || echo "  ❌ scanner-app.js ERROR"
node -c js/pos-enhanced.js && echo "  ✅ pos-enhanced.js OK" || echo "  ❌ pos-enhanced.js ERROR"

echo ""
echo "=== READY TO TEST ==="
echo ""
echo "Open these URLs in your browser:"
echo ""
echo "1️⃣  Scanner App (with camera button):"
echo "   http://localhost:8000/scanner-app.html"
echo "   - Enter username: ajay2266"
echo "   - Click 'Connect' button"
echo "   - Click '📷 Use Camera to Scan' button"
echo ""
echo "2️⃣  POS App (with barcode scan button):"
echo "   http://localhost:8000/pos-enhanced.html"
echo "   - Scroll to 'Add New Product' section"
echo "   - Click '📷 Scan' button next to Barcode field"
echo ""
echo "3️⃣  Test Panel:"
echo "   http://localhost:8000/test-buttons.html"
echo ""
echo "Check browser console (F12) for debug messages with [timestamp] prefix"
echo ""
