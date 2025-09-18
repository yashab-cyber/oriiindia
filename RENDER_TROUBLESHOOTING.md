# 🔧 Render Deployment Troubleshooting

## ❌ Common Error: ERESOLVE Dependency Conflict

### Error Message:
```
npm error code ERESOLVE
npm error ERESOLVE could not resolve
npm error While resolving: multer-gridfs-storage@5.0.2
npm error Found: multer@2.0.2
npm error Could not resolve dependency:
npm error peer multer@"^1.4.2" from multer-gridfs-storage@5.0.2
```

### ✅ Solution:
The issue is a dependency conflict between multer versions. Use the legacy peer deps flag.

**In Render Dashboard:**
- Set Build Command to: `npm install --legacy-peer-deps`

### Why This Happens:
- `multer-gridfs-storage@5.0.2` requires `multer@^1.4.2`
- Your project uses `multer@^1.4.5-lts.1` (compatible but npm strict resolution fails)
- `--legacy-peer-deps` tells npm to use the older, more permissive resolution algorithm

### Alternative Solutions:

#### Option 1: Force Install (Less Preferred)
```bash
Build Command: npm install --force
```

#### Option 2: Use Yarn (Alternative)
```bash
Build Command: yarn install
```

### ✅ Verification:
After successful deployment, your logs should show:
```
🌟 Orii API Server running on port 10000
📍 API URL: http://localhost:10000
🏥 Health check: http://localhost:10000/api/health
```

---

## 🚨 Other Common Render Issues

### 1. MongoDB Connection Errors
**Error**: `MongoNetworkError` or connection timeout

**Solution**:
- Verify MongoDB Atlas network access allows `0.0.0.0/0`
- Check MONGODB_URI environment variable format
- Ensure database user has read/write permissions

### 2. Environment Variables Not Set
**Error**: `process.env.VARIABLE_NAME is undefined`

**Solution**:
- Double-check all environment variables in Render dashboard
- Restart the service after adding new variables
- Verify variable names match exactly (case-sensitive)

### 3. Build Timeout
**Error**: Build takes too long and times out

**Solution**:
- Use `npm ci` instead of `npm install` for faster installs
- Remove unnecessary devDependencies
- Consider using build cache

### 4. Port Issues
**Error**: `EADDRINUSE` or port binding errors

**Solution**:
- Ensure your app uses `process.env.PORT || 5000`
- Don't hardcode port numbers
- Render automatically assigns port 10000

### 5. File Path Issues
**Error**: Module not found or path errors

**Solution**:
- Use relative paths consistently
- Check case sensitivity in file names
- Verify all imports use correct file extensions

---

## 📝 Quick Deployment Checklist

### Before Deployment:
- [ ] All code committed and pushed to GitHub
- [ ] MongoDB Atlas cluster running and accessible
- [ ] Environment variables documented

### During Deployment:
- [ ] Build Command: `npm install --legacy-peer-deps`
- [ ] Start Command: `npm start`
- [ ] All environment variables set correctly
- [ ] Root directory set to `backend` (if applicable)

### After Deployment:
- [ ] Service shows "Live" status
- [ ] Health endpoint accessible
- [ ] Logs show successful startup
- [ ] Database connection working

### Test Commands:
```bash
# Health Check
curl https://your-service.onrender.com/api/health

# Should return:
{
  "status": "OK",
  "message": "Orii API Server is running",
  "timestamp": "..."
}
```

---

## 🆘 Getting Help

### Render Support:
- Check service logs in Render dashboard
- Use Render community forum
- Check Render status page for outages

### Application Issues:
- Review application logs
- Test API endpoints individually
- Verify environment variable values

### Database Issues:
- Check MongoDB Atlas dashboard
- Verify connection string format
- Test connection from local environment