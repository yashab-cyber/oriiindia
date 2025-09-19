# Profile Update Issue - Debugging Guide

## Problem
Profile information updating is not working when deployed on Render (backend) and Vercel (frontend).

## Potential Issues & Solutions

### 1. CORS Configuration ✅ FIXED
**Issue**: Backend might not allow requests from Vercel domain
**Solution**: Updated `/workspaces/oriiindia/backend/server.js` to include multiple Vercel URL patterns:
- `https://oriiindia0.vercel.app`
- `https://oriiindia.vercel.app`
- `https://oriiindia-git-main-yashab-cyber.vercel.app`
- `https://oriiindia-yashab-cyber.vercel.app`

### 2. Environment Configuration ✅ VERIFIED
**Issue**: Frontend might not be pointing to correct backend URL
**Status**: Checked and confirmed:
- Frontend production env: `NEXT_PUBLIC_API_URL=https://oriiindia.onrender.com`
- Backend production env: `FRONTEND_URL=https://oriiindia0.vercel.app`

### 3. Enhanced Error Handling ✅ ADDED
**Issue**: Poor error reporting making debugging difficult
**Solution**: Added comprehensive logging to:
- Frontend: `/workspaces/oriiindia/frontend/src/app/profile/page.tsx`
- API config: `/workspaces/oriiindia/frontend/src/lib/config.ts`

### 4. Authentication Token Issues (POTENTIAL)
**Possible Issues**:
- Token expiration
- Token not being sent properly
- Backend JWT secret mismatch

### 5. Data Format Issues (POTENTIAL)
**Current Fix**: Backend expects flattened data with `profile.` prefix:
```javascript
// Frontend sends:
{
  "firstName": "John",
  "lastName": "Doe", 
  "profile.bio": "My bio",
  "profile.title": "Researcher"
}
```

## Testing Steps

### 1. Open Browser Console
When testing profile updates, check browser console for:
- API configuration logs
- Request/response details
- Error messages

### 2. Check Network Tab
Look for:
- CORS errors
- 401 (authentication) errors
- 500 (server) errors
- Request payload format

### 3. Use API Test Tool
Open `/workspaces/oriiindia/api-test.html` in browser to test:
- Basic API connectivity
- Authentication with user token

## Common Error Messages & Solutions

### "Failed to fetch"
- **Cause**: Network connectivity or CORS issue
- **Solution**: Check if backend is running and CORS is configured

### "401 Unauthorized"
- **Cause**: Invalid or expired token
- **Solution**: Re-login to get fresh token

### "500 Internal Server Error"  
- **Cause**: Backend error (validation, database, etc.)
- **Solution**: Check backend logs on Render dashboard

### "Access denied. No token provided"
- **Cause**: Authorization header not being sent
- **Solution**: Verify token exists in localStorage

## Next Steps if Still Not Working

1. **Check Render Logs**: Go to Render dashboard and check backend logs for errors
2. **Verify Token**: Manually decode JWT token to check expiration
3. **Test Locally**: Run frontend locally but point to production backend
4. **Check Database**: Verify MongoDB Atlas connection and user permissions

## Backend Route Structure
- Profile Update: `PUT /api/auth/me` (requires authentication)
- Profile Get: `GET /api/auth/me` (requires authentication)
- Health Check: `GET /api/health` (public)