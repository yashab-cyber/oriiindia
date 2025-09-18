# Deployment Checklist

## Pre-Deployment
- [ ] Code pushed to GitHub repository
- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with read/write permissions
- [ ] Network access configured (0.0.0.0/0 for cloud deployment)
- [ ] Gmail App Password generated for email service

## Backend Deployment (Render)
- [ ] Web service created and connected to GitHub
- [ ] Build and start commands configured
- [ ] Environment variables set:
  - [ ] NODE_ENV=production
  - [ ] PORT=10000
  - [ ] MONGODB_URI (with correct credentials)
  - [ ] JWT_SECRET (minimum 32 characters)
  - [ ] JWT_EXPIRES_IN=7d
  - [ ] EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
  - [ ] ADMIN_EMAIL, ADMIN_PASSWORD
- [ ] Service deployed successfully
- [ ] Health check endpoint accessible
- [ ] Backend URL noted for frontend configuration

## Frontend Deployment (Vercel)
- [ ] Project created and connected to GitHub
- [ ] Framework preset set to Next.js
- [ ] Root directory configured (if applicable)
- [ ] Environment variables set:
  - [ ] NEXT_PUBLIC_API_URL (backend Render URL)
  - [ ] NEXT_PUBLIC_APP_NAME
  - [ ] NEXT_PUBLIC_APP_VERSION
- [ ] Build successful
- [ ] Frontend URL noted for backend CORS configuration

## Post-Deployment Configuration
- [ ] Backend FRONTEND_URL updated with Vercel URL
- [ ] CORS configuration updated in backend
- [ ] Both services redeployed with new environment variables
- [ ] Admin account accessible with provided credentials

## Testing
- [ ] Backend health check responds correctly
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works with admin credentials
- [ ] API calls from frontend to backend successful
- [ ] File uploads work (if applicable)
- [ ] Email notifications work (if configured)

## URLs to Update
Replace these placeholder URLs with your actual deployment URLs:

**In Backend Environment Variables:**
- FRONTEND_URL: `https://your-frontend.vercel.app`

**In Frontend Environment Variables:**
- NEXT_PUBLIC_API_URL: `https://your-backend.onrender.com`

**In Backend CORS Configuration (server.js):**
- Update the `allowedOrigins` array with your actual Vercel URL

## Final Verification
- [ ] Both services show "healthy" status
- [ ] No CORS errors in browser console
- [ ] Database connections working
- [ ] All core features functional
- [ ] Performance acceptable (first load may be slow on Render free tier)