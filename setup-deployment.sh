#!/bin/bash

# ORII Platform Deployment Helper Script
# This script helps set up environment variables for deployment

echo "🚀 ORII Platform Deployment Helper"
echo "=================================="

# Create backend production environment file
echo "📝 Creating backend production environment template..."
cat > backend/.env.production << EOF
# Production Environment Variables for Backend

# Server Configuration
NODE_ENV=production
PORT=10000

# MongoDB Atlas Configuration
# Replace with your actual MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/orii-database?retryWrites=true&w=majority

# JWT Configuration
# Generate a strong secret key (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-chars
JWT_EXPIRES_IN=7d

# Frontend URL - Update after Vercel deployment
FRONTEND_URL=https://your-frontend-url.vercel.app

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Admin Configuration
ADMIN_EMAIL=yashabalam707@gmail.com
ADMIN_PASSWORD=@Yashab07
EOF

echo "✅ Backend environment template created at backend/.env.production"

# Create frontend production environment file
echo "📝 Creating frontend production environment template..."
cat > frontend/.env.production << EOF
# Production Environment Variables for Frontend

# Backend API URL - Update with your Render backend URL
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com

# App Configuration
NEXT_PUBLIC_APP_NAME=ORII - Open Research Institute of India
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF

echo "✅ Frontend environment template created at frontend/.env.production"

echo ""
echo "🔧 Next Steps:"
echo "1. Update the environment files with your actual values"
echo "2. Deploy backend to Render using the backend/.env.production values"
echo "3. Deploy frontend to Vercel using the frontend/.env.production values"
echo "4. Update FRONTEND_URL in backend with your Vercel URL"
echo "5. Update NEXT_PUBLIC_API_URL in frontend with your Render URL"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"
echo "✅ See DEPLOYMENT_CHECKLIST.md for step-by-step checklist"