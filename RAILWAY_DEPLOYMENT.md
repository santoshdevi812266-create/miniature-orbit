# Railway Deployment Guide for EZO Billing POS

## Automatic Deployment Setup

### Option 1: Using Railway CLI
```bash
npm install -g @railway/cli
railway login
railway link  # Link to your Railway project
railway up
```

### Option 2: Using GitHub Integration
1. Go to https://railway.app/dashboard
2. Click "Create New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account
5. Select: `santoshdevi812266-create/miniature-orbit`
6. Railway auto-deploys on every push!

## Repository Information
- **GitHub URL**: https://github.com/santoshdevi812266-create/miniature-orbit
- **Main Directory**: `/ezo-billing-pos`
- **Server File**: `server.js`
- **Start Command**: `npm start`
- **Port**: 8000 (internally) / Auto-assigned by Railway

## Configuration
- Node.js will be auto-detected
- Express server serves static files + API routes
- Supabase integration already configured
- All environment variables ready

## Features Ready for Deployment
✅ Product Management (Local + Supabase)
✅ Barcode Scanner Integration
✅ UPI Payment with QR Code (8791012083@upi)
✅ Real-time Sync (Supabase Channels)
✅ Analytics Dashboard
✅ SMS Invoice Option
✅ Price Adjustment Per Bill
✅ Hindi Thank You Message

## After Deployment
Your app will be available at: `https://yourapp.railway.app`

## Push to Deploy
Just push to master branch:
```bash
git push origin master
```

Railway will automatically deploy!
