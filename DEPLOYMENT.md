# ORII Platform Deployment Guide

This guide covers deploying the ORII (Open Research Institute of India) platform with the frontend on Vercel and backend on Render.

## Architecture Overview

- **Frontend**: Next.js application deployed on Vercel
- **Backend**: Node.js/Express API deployed on Render
- **Database**: MongoDB Atlas (cloud database)
- **File Storage**: GridFS (MongoDB)

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to a GitHub repository
2. **MongoDB Atlas**: Set up a MongoDB Atlas cluster
3. **Vercel Account**: Sign up at https://vercel.com
4. **Render Account**: Sign up at https://render.com
5. **Domain Names** (optional): For custom domains

## Part 1: Backend Deployment on Render

### Step 1: Deploy Backend Service

1. **Connect Repository to Render**
   - Go to https://render.com/dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your backend code

2. **Configure Service Settings**
   ```
   Name: orii-backend
   Root Directory: backend (if backend is in a subfolder)
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Set Environment Variables**
   Go to Environment tab and add these variables:
   
   ```bash
   # Server Configuration
   NODE_ENV=production
   PORT=10000
   
   # MongoDB Atlas Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/orii-database?retryWrites=true&w=majority
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
   JWT_EXPIRES_IN=7d
   
   # Frontend URL (will be updated after Vercel deployment)
   FRONTEND_URL=https://your-frontend-url.vercel.app
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   
   # Admin Configuration
   ADMIN_EMAIL=yashabalam707@gmail.com
   ADMIN_PASSWORD=@Yashab07
   ```

4. **Important Notes**
   - Replace `username:password@cluster` with your actual MongoDB Atlas credentials
   - Generate a strong JWT_SECRET (minimum 32 characters)
   - Use Gmail App Password for EMAIL_PASS (not your regular password)
   - The FRONTEND_URL will be updated after Vercel deployment

### Step 2: Get Backend URL

After deployment, your backend URL will be:
```
https://your-service-name.onrender.com
```

Note this URL - you'll need it for frontend configuration.

## Part 2: Frontend Deployment on Vercel

### Step 1: Deploy Frontend

1. **Connect Repository to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository containing your frontend code

2. **Configure Build Settings**
   ```
   Framework Preset: Next.js
   Root Directory: frontend (if frontend is in a subfolder)
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Set Environment Variables**
   Go to Settings → Environment Variables and add:
   
   ```bash
   # Backend API URL (replace with your actual Render URL)
   NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com
   
   # App Configuration
   NEXT_PUBLIC_APP_NAME=ORII - Open Research Institute of India
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

### Step 2: Update Backend CORS

After getting your Vercel URL (e.g., `https://your-project.vercel.app`):

1. Go back to Render dashboard
2. Update the `FRONTEND_URL` environment variable with your Vercel URL
3. Also update the CORS configuration in your backend code if needed

## Part 3: Database Setup

### MongoDB Atlas Configuration

1. **Create Database User**
   - Go to Database Access in MongoDB Atlas
   - Create a user with read/write permissions
   - Note the username and password

2. **Configure Network Access**
   - Go to Network Access
   - Add `0.0.0.0/0` to allow connections from anywhere (for cloud deployments)

3. **Get Connection String**
   - Go to Database → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## Part 4: Post-Deployment Setup

### Create Admin Account

1. **Access Backend Terminal (Optional)**
   If you need to create the admin account manually:
   ```bash
   node create_admin.js
   ```

2. **Or Login with Existing Admin**
   Use the credentials:
   - Email: yashabalam707@gmail.com
   - Password: @Yashab07

### Test Deployment

1. **Health Check**
   ```bash
   curl https://your-backend-service.onrender.com/api/health
   ```

2. **Frontend Access**
   Visit your Vercel URL and test:
   - Registration
   - Login
   - API connectivity

## Environment Variables Summary

### Backend (Render)
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/orii-database
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
ADMIN_EMAIL=yashabalam707@gmail.com
ADMIN_PASSWORD=@Yashab07
```

### Frontend (Vercel)
```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_APP_NAME=ORII - Open Research Institute of India
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure FRONTEND_URL in backend matches your Vercel URL exactly
   - Check that credentials are enabled in both frontend and backend

2. **Database Connection**
   - Verify MongoDB Atlas network access allows 0.0.0.0/0
   - Check connection string format and credentials

3. **Environment Variables**
   - Ensure all required variables are set in both Render and Vercel
   - Restart services after changing environment variables

4. **Build Failures**
   - Check build logs in Vercel/Render dashboards
   - Ensure all dependencies are in package.json

### Useful Commands

```bash
# Test backend health
curl https://your-backend.onrender.com/api/health

# Test login endpoint
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"yashabalam707@gmail.com","password":"@Yashab07"}'
```

## Security Considerations

1. **JWT Secret**: Use a strong, unique secret (minimum 32 characters)
2. **Database**: Use strong database passwords and limit network access
3. **Email**: Use Gmail App Passwords, not regular passwords
4. **HTTPS**: Both Vercel and Render provide HTTPS by default
5. **Environment Variables**: Never commit secrets to version control

## Monitoring and Maintenance

1. **Logs**: Check Render and Vercel dashboards for application logs
2. **Performance**: Monitor response times and error rates
3. **Updates**: Regularly update dependencies and security patches
4. **Backups**: Set up automated MongoDB Atlas backups

## Support

If you encounter issues:
1. Check the deployment logs in Render/Vercel dashboards
2. Verify all environment variables are correctly set
3. Test individual API endpoints
4. Check MongoDB Atlas connection and network access