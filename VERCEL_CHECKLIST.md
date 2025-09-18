# 📋 Frontend Vercel Deployment Checklist

## Before You Start
- [ ] Backend deployed and running: https://oriiindia.onrender.com ✅
- [ ] GitHub repository is up to date
- [ ] Vercel account created

## Vercel Deployment Steps
- [ ] 1. Go to vercel.com → New Project
- [ ] 2. Import GitHub repository "oriiindia"
- [ ] 3. Configure project settings:
  - [ ] Project Name: orii-frontend (or your choice)
  - [ ] Framework: Next.js
  - [ ] Root Directory: frontend
  - [ ] Build Command: npm run build
  - [ ] Output Directory: .next

## Environment Variables
- [ ] NEXT_PUBLIC_API_URL=https://oriiindia.onrender.com

## After Deployment
- [ ] Frontend shows "Live" status
- [ ] Website accessible at your Vercel URL
- [ ] Save your Vercel URL for backend CORS update

## Update Backend CORS
- [ ] Go to Render Dashboard → orii-backend → Environment
- [ ] Update FRONTEND_URL=https://your-vercel-url.vercel.app
- [ ] Save and redeploy backend

## Test Everything
- [ ] Homepage loads correctly
- [ ] Registration form works
- [ ] Login works with: yashabalam707@gmail.com / @Yashab07
- [ ] Research papers display
- [ ] Admin dashboard accessible
- [ ] No CORS errors in browser console

## Your URLs Will Be:
```
Frontend: https://your-project-name.vercel.app
Backend:  https://oriiindia.onrender.com
```

## Admin Test Credentials:
```
Email: yashabalam707@gmail.com
Password: @Yashab07
```

## Quick Deploy Command:
If you prefer CLI deployment:
```bash
npm i -g vercel
cd frontend
vercel --prod
```