# 🚀 Frontend Deployment on Vercel - Step by Step Guide

## Step 1: Access Vercel Dashboard
1. Go to https://vercel.com
2. Sign up or log in to your account
3. Click "New Project" button

## Step 2: Import Your Repository
1. **Connect GitHub Account** (if not already connected)
   - Click "Continue with GitHub"
   - Authorize Vercel to access your repositories

2. **Import Repository**
   - Find "oriiindia" repository in the list
   - Click "Import" next to it

## Step 3: Configure Project Settings

### Basic Settings
- **Project Name**: `orii-frontend` (or any name you prefer)
- **Framework Preset**: Next.js (should auto-detect)
- **Root Directory**: `frontend` (since frontend is in a subfolder)
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `.next` (auto-filled)
- **Install Command**: `npm install` (auto-filled)

### Advanced Settings (Click "Environment Variables")
Add this environment variable:

```bash
# Variable Name: NEXT_PUBLIC_API_URL
# Value: https://oriiindia.onrender.com
```

## Step 4: Deploy
1. Click "Deploy"
2. Wait for the build to complete (usually 2-5 minutes)
3. Check the logs for any errors

## Step 5: Get Your Frontend URL
After successful deployment:
- Your frontend URL will be: `https://your-project-name.vercel.app`
- Vercel will also provide a custom domain option

## Step 6: Update Backend CORS
After getting your Vercel URL, update your Render backend:

1. Go to Render Dashboard → Your Backend Service
2. Go to Environment Variables
3. Update `FRONTEND_URL` to your Vercel URL:
   ```bash
   FRONTEND_URL=https://your-project-name.vercel.app
   ```
4. Save and redeploy

## Step 7: Test Your Deployment

### Test Website
Visit your Vercel URL and test:
- ✅ Homepage loads
- ✅ Registration works
- ✅ Login works with admin credentials:
  - Email: yashabalam707@gmail.com
  - Password: @Yashab07
- ✅ Research papers display
- ✅ All API calls work

### Test Admin Access
- Login with admin credentials
- Check admin dashboard functionality

## 🎯 Environment Variables Summary

### Required in Vercel:
```bash
NEXT_PUBLIC_API_URL=https://oriiindia.onrender.com
```

### Optional (for branding):
```bash
NEXT_PUBLIC_APP_NAME=ORII - Open Research Institute of India
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🔧 Troubleshooting

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify Next.js configuration

### API Connection Issues
- Verify NEXT_PUBLIC_API_URL is set correctly
- Check browser console for CORS errors
- Ensure backend FRONTEND_URL is updated

### Performance Issues
- Vercel automatically optimizes images and fonts
- Uses CDN for global performance
- Automatic code splitting

## 📋 Deployment Checklist
- [ ] Repository imported to Vercel
- [ ] Root directory set to `frontend`
- [ ] Environment variable `NEXT_PUBLIC_API_URL` set
- [ ] Build successful
- [ ] Website accessible at Vercel URL
- [ ] Backend CORS updated with Vercel URL
- [ ] Login/registration tested
- [ ] Admin access verified

## 🎉 Success!
Once deployed, your ORII platform will be live with:
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://oriiindia.onrender.com`
- **Database**: MongoDB Atlas (connected)