# 🚀 Production Deployment Guide - Netlify + Backend

## 🔴 Problem
After deploying frontend to Netlify, login fails with "Failed to fetch" error.

### Root Causes
1. **No VITE_API_URL set:** Environment variable not configured in Netlify
2. **Backend not deployed:** Still running on localhost (not publicly accessible)
3. **Auto-detection fails:** Frontend tries to connect to netlify.app:4000 (doesn't exist)
4. **CORS not configured for production domain:** Backend blocks Netlify requests

---

## ✅ Solution Overview

You need to:
1. **Deploy the backend** to a publicly accessible server
2. **Set VITE_API_URL** in Netlify build environment
3. **Configure CORS** for the Netlify domain
4. **Ensure HTTPS** for both frontend and backend
5. **Test production login** before going live

---

## 📋 Step-by-Step Deployment Guide

### Step 1: Choose a Backend Hosting Option

#### Option A: Railway (Recommended - Simple)
- 🟢 Easiest setup
- 💰 Free tier available
- ⏱️ 5 minutes to deploy
- 🔗 Documentation: railway.app
- **Steps:**
  1. Sign up at railway.app
  2. Create new project → GitHub repo
  3. Select `server.js` as entry point
  4. Add environment variables (HOST=0.0.0.0, PORT=auto-assigned)
  5. Deploy
  6. Copy the public URL (e.g., `https://api-xyz.railway.app`)

#### Option B: Heroku (Alternative)
- 🟢 Well-established
- 💰 Free tier available
- ⏱️ 10 minutes to deploy
- 🔗 Documentation: heroku.com
- **Steps:**
  1. Sign up at heroku.com
  2. Create new app
  3. Connect GitHub repo
  4. Deploy `server.js`
  5. Copy the app URL

#### Option C: AWS/Google Cloud (Professional)
- 🟢 Scalable
- 💰 Pay-as-you-go
- ⏱️ 20+ minutes
- Requires more configuration

#### Option D: DigitalOcean/Linode (Cost-effective)
- 🟢 Reliable
- 💰 $5-10/month
- ⏱️ 15 minutes
- Good for permanent solutions

**Recommended: Railway or Heroku for quick setup**

---

### Step 2: Get Backend URL

After deploying, you'll have a URL like:
- Railway: `https://api-xyz.railway.app`
- Heroku: `https://your-app-name.herokuapp.com`

**Note this URL** - you'll use it in Step 3.

---

### Step 3: Configure Netlify Build Environment

1. Go to **Netlify Dashboard** → Your Site
2. Click **Site Settings** → **Build & Deploy** → **Environment**
3. Add new variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://api-xyz.railway.app` (your backend URL)
4. Click **Save**

**Example:**
```
VITE_API_URL = https://api-abc123.railway.app
```

---

### Step 4: Redeploy Frontend on Netlify

1. Go to **Netlify** → Your Site
2. Click **Deploys**
3. Click **Trigger deploy** → **Deploy site**
4. Wait for build to complete
5. Check **Logs** for any errors

**You should see in logs:**
```
[API] Using VITE_API_URL from environment: https://api-xyz.railway.app
```

---

### Step 5: Configure Backend CORS for Production

Update `server.js` to accept Netlify domain:

#### Production CORS Configuration

Modify the CORS middleware in `server.js`:

```javascript
// Configure CORS with environment-specific settings
server.use((req, res, next) => {
  const origin = req.headers.origin
  const allowedOrigins = [
    'http://localhost:5173',      // Local dev
    'http://localhost:3000',      // Local production build
    'http://127.0.0.1:5173',      // Local fallback
    process.env.FRONTEND_URL,     // Production frontend (from env var)
  ].filter(Boolean)
  
  // For development: allow all origins
  if (process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', '*')
  } else {
    // For production: only allow specific origins
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin)
    }
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Max-Age', '86400')
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})
```

Then redeploy backend with FRONTEND_URL environment variable:
```
FRONTEND_URL = https://your-site.netlify.app
```

---

### Step 6: Test the Production Deployment

#### Test 1: Check Frontend Environment
1. Deploy frontend to Netlify (with VITE_API_URL set)
2. Open browser DevTools (F12)
3. Go to Console
4. You should see:
   ```
   [API] Using VITE_API_URL from environment: https://api-xyz.railway.app
   ```

#### Test 2: Check Network Requests
1. DevTools → Network tab
2. Attempt login
3. Look for requests to `https://api-xyz.railway.app/login`
4. Should return 200 or 401 (not CORS error)

#### Test 3: Test Login
1. Use valid credentials
2. Should log in successfully
3. Dashboard should load

#### Test 4: Check Backend Response
```bash
# From terminal/command line
curl -X POST https://api-xyz.railway.app/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","passwordHash":"test"}'

# Should get response (not CORS error)
```

---

## 🔐 HTTPS Configuration

### Automatic (Recommended)
- **Netlify:** Automatically provides HTTPS via Let's Encrypt
- **Railway/Heroku:** Automatically provide HTTPS

### Manual (if needed)
1. Ensure backend uses HTTPS
2. Ensure frontend uses HTTPS
3. API calls should be `https://`, not `http://`

---

## 📊 Production Deployment Checklist

### Before Deployment
- [ ] Backend code committed and ready
- [ ] Frontend code with CORS updates committed
- [ ] Chose hosting provider (Railway recommended)
- [ ] Backend will be deployed to public URL

### During Deployment - Backend
- [ ] Create account on chosen platform
- [ ] Deploy `server.js` to get public URL
- [ ] Set environment variables (HOST=0.0.0.0, PORT=auto)
- [ ] Verify backend is running
- [ ] Test with curl/Postman

### During Deployment - Frontend (Netlify)
- [ ] Go to Netlify Site Settings → Environment
- [ ] Add `VITE_API_URL=<your-backend-url>`
- [ ] Trigger new deployment
- [ ] Wait for build to complete
- [ ] Check build logs for API URL confirmation

### After Deployment - Testing
- [ ] Open deployed site in browser
- [ ] Check Console for `[API] Using VITE_API_URL...`
- [ ] Check Network tab for requests to backend
- [ ] Try login with valid credentials
- [ ] Verify dashboard loads
- [ ] Test a few operations (add product, etc.)

### Final Verification
- [ ] Login works on production
- [ ] No CORS errors in console
- [ ] No "Failed to fetch" errors
- [ ] All API endpoints working
- [ ] Both frontend and backend using HTTPS

---

## 🚨 Common Issues & Solutions

### Issue: "Failed to fetch" still appears

**Cause 1: VITE_API_URL not set**
```
Fix: Go to Netlify → Build & Deploy → Environment
    Add VITE_API_URL = your-backend-url
    Redeploy
```

**Cause 2: Backend not running**
```
Fix: Check backend hosting platform dashboard
    Verify it shows "Running" or "Active"
    Check logs for errors
```

**Cause 3: CORS blocking request**
```
Fix: Check browser console for specific CORS error
    Update backend CORS to allow your Netlify domain
    Redeploy backend
```

**Cause 4: Wrong URL format**
```
Wrong: https://api-xyz.railway.app/ (with trailing slash)
Right: https://api-xyz.railway.app (without trailing slash)
```

### Issue: Build fails on Netlify

**Check:**
1. Netlify Build logs → Deployments
2. Look for error messages
3. Most common: Missing Node version
4. Fix: Create `netlify.toml`:
```toml
[build]
  command = "npm install && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"
```

### Issue: CORS error in console

**Check browser console for:**
```
Access to XMLHttpRequest at 'https://...' from origin 'https://your-site.netlify.app'
has been blocked by CORS policy
```

**Fix:**
1. Ensure backend CORS allows your Netlify domain
2. Check FRONTEND_URL environment variable
3. Redeploy backend
4. Hard refresh browser (Ctrl+Shift+R)

### Issue: Mixed Content Error

**Error:** "Mixed Content: The page was loaded over HTTPS, but requested an insecure resource"

**Cause:** Frontend using HTTPS, but API URL using HTTP

**Fix:**
```
Wrong: VITE_API_URL = http://api.example.com
Right: VITE_API_URL = https://api.example.com
```

---

## 📝 Environment Variables Reference

### Frontend (Netlify Build Settings)

```
VITE_API_URL = https://your-backend-url.com
```

### Backend (Hosting Platform Settings)

```
NODE_ENV = production
HOST = 0.0.0.0
PORT = auto-assigned (platform handles this)
FRONTEND_URL = https://your-site.netlify.app
```

---

## 🔄 Deployment Workflow

```
1. Update code locally
   ↓
2. Commit to GitHub
   ↓
3. Deploy backend
   - Copy public URL
   ↓
4. Configure Netlify
   - Set VITE_API_URL
   - Trigger deploy
   ↓
5. Test production
   - Check console for API URL
   - Try login
   - Verify API requests
   ↓
6. Monitor
   - Check error logs
   - Verify login flow
   - Monitor API performance
```

---

## 🎯 Quick Start - Railway Deployment

### 1. Create Account (2 min)
- Go to railway.app
- Sign up with GitHub
- Authorize Railway

### 2. Deploy Backend (3 min)
- Create new project
- Select your GitHub repo
- Wait for automatic deployment
- Copy the public URL

### 3. Configure Frontend (2 min)
- Go to Netlify build settings
- Add `VITE_API_URL = <railway-url>`
- Trigger deploy

### 4. Test (2 min)
- Open deployed site
- Try login
- Verify it works

**Total time: ~10 minutes** ⏱️

---

## 📞 Troubleshooting

### Verify Backend is Running
```bash
# Test if backend is accessible
curl -I https://your-backend-url.com/

# Should return 200 or similar (not connection error)
```

### Verify Frontend is Using Correct URL
```
1. Open deployed site
2. Open DevTools (F12)
3. Console tab
4. Look for: [API] Using VITE_API_URL from environment
5. Should show correct backend URL
```

### Check API Endpoint
```bash
# Test login endpoint
curl -X POST https://your-backend-url.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","passwordHash":"test"}'
```

---

## ✅ Success Indicators

✅ Frontend deployed on Netlify with HTTPS
✅ Backend deployed on public URL with HTTPS
✅ VITE_API_URL set in Netlify build environment
✅ Console shows correct API URL
✅ Network tab shows requests to backend
✅ Login works with valid credentials
✅ Dashboard loads after login
✅ No CORS errors in console

---

## 🎉 You're Ready!

Once the above steps are complete, production login will work reliably!

**Next:** Follow the Railway Quick Start section above to deploy in 10 minutes.
