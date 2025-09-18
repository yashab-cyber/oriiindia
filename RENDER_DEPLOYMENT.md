# 🚀 Backend Deployment on Render - Step by Step Guide

## Step 1: Access Render Dashboard
1. Go to https://render.com
2. Sign up or log in to your account
3. Click "New +" button in the top right
4. Select "Web Service"

## Step 2: Connect Your Repository
1. **Connect GitHub Account**
   - Click "Connect account" next to GitHub
   - Authorize Render to access your repositories
   - Select your GitHub username

2. **Choose Repository**
   - Find "oriiindia" repository
   - Click "Connect" next to it

## Step 3: Configure Service Settings
Fill in the following settings:

### Basic Settings
- **Name**: `orii-backend` (or any name you prefer)
- **Branch**: `main`
- **Root Directory**: `backend` (since backend is in a subfolder)
- **Runtime**: `Node`

### Build Settings
- **Build Command**: `npm install --legacy-peer-deps`
- **Start Command**: `npm start`

**Note**: We use `--legacy-peer-deps` to resolve a dependency conflict between multer v1.4.x and multer-gridfs-storage v5.x.

### Advanced Settings
- **Auto-Deploy**: `Yes` (recommended)

## Step 4: Set Environment Variables
Click on "Environment" tab and add these variables:

### Required Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=10000

# MongoDB Atlas (CRITICAL - Replace with your actual connection string)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/orii-database?retryWrites=true&w=majority

# JWT Configuration (CRITICAL - Use a strong secret)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-this
JWT_EXPIRES_IN=7d

# Frontend URL (Update after you deploy frontend to Vercel)
FRONTEND_URL=https://your-frontend-name.vercel.app

# Email Configuration (Optional - for contact forms)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Admin Configuration
ADMIN_EMAIL=yashabalam707@gmail.com
ADMIN_PASSWORD=@Yashab07
```

### ⚠️ Important Notes:
1. **MONGODB_URI**: Replace `username:password@cluster` with your actual MongoDB Atlas credentials
2. **JWT_SECRET**: Generate a strong secret (minimum 32 characters)
3. **FRONTEND_URL**: Will be updated after frontend deployment
4. **EMAIL_PASS**: Use Gmail App Password, not regular password

## Step 5: Deploy
1. Click "Create Web Service"
2. Render will start building your application
3. Wait for the build to complete (usually 2-5 minutes)
4. Check the logs for any errors

## Step 6: Get Your Backend URL
After successful deployment:
1. Your backend URL will be: `https://your-service-name.onrender.com`
2. Test the health endpoint: `https://your-service-name.onrender.com/api/health`
3. Save this URL - you'll need it for frontend deployment

## Step 7: Test Your Deployment

### Health Check
```bash
curl https://your-service-name.onrender.com/api/health
```
Should return:
```json
{
  "status": "OK",
  "message": "Orii API Server is running",
  "timestamp": "2025-01-XX..."
}
```

### Test Login
```bash
curl -X POST https://your-service-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"yashabalam707@gmail.com","password":"@Yashab07"}'
```

## Step 8: Common Issues & Solutions

### Build Failures
- **Node Version**: Ensure package.json has correct node version in engines
- **Dependencies**: Make sure all dependencies are in package.json, not devDependencies
- **Build Command**: Verify `npm install` works locally

### Runtime Errors
- **Environment Variables**: Double-check all required variables are set
- **MongoDB Connection**: Verify MongoDB Atlas connection string and network access
- **Port Configuration**: Render uses PORT=10000, ensure your app uses process.env.PORT

### Database Issues
- **MongoDB Atlas Network Access**: Add `0.0.0.0/0` to allow connections from anywhere
- **Database User**: Ensure user has read/write permissions
- **Connection String**: Verify the connection string format

## Step 9: Monitor Your Service
1. **Logs**: Check Render dashboard for real-time logs
2. **Metrics**: Monitor CPU, memory usage in Render dashboard
3. **Health Checks**: Render automatically monitors `/api/health` endpoint

## Step 10: Update Frontend Configuration
After backend deployment:
1. Copy your Render backend URL
2. Update frontend environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
3. Deploy frontend to Vercel
4. Update backend `FRONTEND_URL` with your Vercel URL

## 🎯 Success Checklist
- [ ] Service deployed successfully
- [ ] Health endpoint returns 200 OK
- [ ] Environment variables all set correctly
- [ ] MongoDB connection working
- [ ] Admin login test successful
- [ ] Backend URL noted for frontend deployment

## 🔧 Render-Specific Files Created
Your repository already includes:
- `backend/render.yaml` - Render service configuration
- `backend/package.json` - Updated with engines and scripts
- `DEPLOYMENT.md` - Complete deployment guide

## 🆘 Need Help?
- Check Render logs in dashboard
- Verify environment variables
- Test MongoDB Atlas connection
- Ensure all dependencies are installed
- Contact support if persistent issues

---
**Next Step**: Deploy frontend to Vercel using the backend URL from this deployment.