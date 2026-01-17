#!/bin/bash

# EZO Billing POS - Quick Deployment to Vercel
# This script deploys the app to Vercel via terminal

set -e

echo "🚀 EZO Billing POS - Vercel Deployment"
echo "======================================"
echo ""

cd /workspaces/codespaces-blank

# Step 1: Install Vercel CLI
echo "📦 Installing Vercel CLI..."
npm install -g vercel

echo ""
echo "✅ Prerequisites complete!"
echo ""
echo "🔑 IMPORTANT: You need to authenticate with Vercel"
echo ""
echo "Next steps:"
echo "1. Run: vercel login"
echo "2. Follow the authentication prompts"
echo "3. Then run: vercel --prod"
echo ""
echo "OR use GitHub integration at: https://vercel.com/dashboard"
echo ""
echo "Your repository:"
echo "  GitHub: https://github.com/santoshdevi812266-create/miniature-orbit"
echo ""
echo "Project Info:"
echo "  - UPI ID: 8791012083@upi"
echo "  - QR Code: Auto-generates for each payment"
echo "  - Real-time Sync: Supabase integration"
echo "  - Features: Scanner, Analytics, SMS, Price adjustment"
