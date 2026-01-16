#!/bin/bash
# EZO Billing POS - Installation Verification Script

echo "🏪 EZO Billing POS - Verification Script"
echo "========================================"
echo ""

# Check if all files exist
echo "📋 Checking files..."
files=(
    "index.html"
    "pos-app.html"
    "scanner-app.html"
    "css/style.css"
    "js/supabase-config.js"
    "js/pos-app.js"
    "js/scanner-app.js"
    "js/payment.js"
    "js/qr-generator.js"
    "js/camera.js"
    "js/barcode-scanner.js"
    "js/integrations.js"
    "README.md"
    "QUICK_START.md"
    "DATABASE_SETUP.md"
)

missing_files=0

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING"
        ((missing_files++))
    fi
done

echo ""
echo "========================================"
if [ $missing_files -eq 0 ]; then
    echo "✅ All files present!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update Supabase credentials in js/supabase-config.js"
    echo "2. Create database tables using DATABASE_SETUP.md"
    echo "3. Add products to database"
    echo "4. Open index.html in browser"
    echo ""
    echo "🎉 Ready to use!"
else
    echo "❌ $missing_files files missing"
    echo "Please ensure all files are in the correct location"
fi

echo ""
echo "📞 Support: Check README.md and QUICK_START.md for help"
