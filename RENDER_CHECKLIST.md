# 📋 Backend Render Deployment Checklist

## Before You Start
- [ ] GitHub repository is up to date
- [ ] MongoDB Atlas cluster is running
- [ ] Database user created with read/write permissions
- [ ] Network access configured (0.0.0.0/0 for cloud)
- [ ] Render account created

## Render Setup Steps
- [ ] 1. Go to render.com → New → Web Service
- [ ] 2. Connect GitHub account
- [ ] 3. Select oriiindia repository
- [ ] 4. Configure service:
  - [ ] Name: orii-backend
  - [ ] Branch: main
  - [ ] Root Directory: backend
  - [ ] Runtime: Node
  - [ ] Build Command: npm install
  - [ ] Start Command: npm start

## Environment Variables
- [ ] NODE_ENV=production
- [ ] PORT=10000
- [ ] MONGODB_URI=mongodb+srv://... (YOUR ACTUAL CONNECTION STRING)
- [ ] JWT_SECRET=... (MINIMUM 32 CHARACTERS)
- [ ] JWT_EXPIRES_IN=7d
- [ ] FRONTEND_URL=https://your-frontend.vercel.app
- [ ] EMAIL_HOST=smtp.gmail.com
- [ ] EMAIL_PORT=587
- [ ] EMAIL_USER=your-email@gmail.com
- [ ] EMAIL_PASS=your-gmail-app-password
- [ ] ADMIN_EMAIL=yashabalam707@gmail.com
- [ ] ADMIN_PASSWORD=@Yashab07

## After Deployment
- [ ] Service shows "Live" status
- [ ] Health check works: https://your-service.onrender.com/api/health
- [ ] Admin login test successful
- [ ] Backend URL noted for frontend deployment

## Your Backend URL Will Be:
```
https://your-service-name.onrender.com
```

## Test Commands:
```bash
# Health Check
curl https://your-service-name.onrender.com/api/health

# Login Test
curl -X POST https://your-service-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"yashabalam707@gmail.com","password":"@Yashab07"}'
```

## What You Need for Frontend:
- Your Render backend URL to set as NEXT_PUBLIC_API_URL in Vercel