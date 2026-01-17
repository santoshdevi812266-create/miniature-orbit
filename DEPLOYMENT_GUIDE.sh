#!/bin/bash

# EZO Billing POS - Vercel Deployment Script
# This script automates deployment to Vercel

echo "🚀 EZO Billing POS - Vercel Deployment"
echo "======================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "📝 Deployment Steps:"
echo "1. Make sure you're logged in to GitHub"
echo "2. Install Vercel CLI: npm install -g vercel"
echo "3. Run 'vercel login' to authenticate"
echo "4. From the repo root, run: vercel --prod"
echo ""
echo "Or use GitHub integration:"
echo "1. Go to https://vercel.com"
echo "2. Click 'New Project'"
echo "3. Import from GitHub: santoshdevi812266-create/miniature-orbit"
echo "4. Select 'Root Directory': /ezo-billing-pos (if needed)"
echo "5. Deploy!"
echo ""
echo "Current Git Remote:"
git remote -v
echo ""
echo "Latest Commits:"
git log --oneline -5
echo ""
echo "✅ Ready for deployment!"
