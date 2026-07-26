# 🔴 PRODUCTION DEBUGGING - "Failed to fetch" Issue

> **Status**: App shows "Failed to fetch" on Netlify deployed version
> **Goal**: Identify the exact root cause and implement fix

---

## ⚠️ CRITICAL FACT CHECK

**Key Point**: This app uses **json-server** (file-based database), NOT MongoDB.
- There is NO MongoDB connection to debug
- Backend is `server.js` running Node.js with json-server
- Database is `db.json` (already has test users)
- **The "Failed to fetch" error is 100% a connectivity issue**

---

## 🔍 DIAGNOSIS: The 3 Most Likely Causes

### **CAUSE #1: Backend is NOT deployed (60% probability)**
```
❌ Problem: Backend running only on your local machine
❌ Result: Netlify frontend can't reach localhost:4000
❌ Error: "Failed to fetch" (connection refused)

✅ Check: Open browser DevTools → Network tab → Try login
           If you see "connection refused" or "CORS error from request", this is the issue
```

### **CAUSE #2: VITE_API_URL not set in Netlify (25% probability)**
```
❌ Problem: Environment variable missing from Netlify
❌ Result: Frontend tries auto-detection, fails
❌ Error: "Failed to fetch" trying to connect to netlify.app:4000

✅ Check: Netlify Site Settings → Build & Deploy → Environment
           Search for "VITE_API_URL"
           If missing or empty → THIS IS THE ISSUE
```

### **CAUSE #3: Backend URL in VITE_API_URL is wrong (10% probability)**
```
❌ Problem: URL is incorrect, misspelled, or incomplete
❌ Result: Frontend connects to wrong server
❌ Error: "Failed to fetch" or 404/timeout

✅ Check: What backend URL did you set in VITE_API_URL?
           Should be: https://your-backend-name.railway.app (no trailing slash)
           NOT: http://localhost:4000 or http://127.0.0.1:4000
```

### **CAUSE #4: Frontend not redeployed after adding env var (5% probability)**
```
❌ Problem: VITE_API_URL set, but old build still deployed
❌ Result: Frontend uses old auto-detection
❌ Error: "Failed to fetch" trying localhost

✅ Check: Netlify Deploys → When was last deployment?
           If BEFORE adding VITE_API_URL → NOT redeployed yet
```

---

## 🎯 STEP-BY-STEP DIAGNOSIS

### **STEP 1: Check if Backend is Deployed**

**Question**: Is `server.js` running on a public URL anywhere?
- ✅ YES → Go to Step 2
- ❌ NO → **THIS IS YOUR PROBLEM** (See "Fix" section below)

**Where to check**:
- Railway.app dashboard → Projects → Your project → Should say "Running"
- Heroku dashboard → Apps → Your app → Should say "Running"
- Your own server → Should be publicly accessible at `https://yourdomain.com`

**If not deployed**:
```
THIS IS THE #1 ISSUE!
The backend must be deployed to a public URL.
Without this, Netlify frontend cannot reach it.

Go to: Railway.app or Heroku
Deploy server.js
Get the public URL
Then continue to Step 2
```

---

### **STEP 2: Test Backend Directly**

**In browser**, go to your backend URL (e.g., `https://your-backend-name.railway.app/`):

| Result | Meaning | Next Step |
|--------|---------|-----------|
| See JSON data | ✅ Backend is working | Go to Step 3 |
| "Cannot GET /" | ✅ Backend is working | Go to Step 3 |
| Page hangs / Timeout | ❌ Backend is down | Restart backend |
| "Connection refused" | ❌ Backend not reachable | Check URL, deployment status |

**Test the login endpoint directly**:
```bash
curl -X POST https://your-backend-url/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bshuvojit566@gmail.com","passwordHash":"6f2cb9dd8f4b65e24e1c3f3fa5bc57982349237f11abceacd45bbcb74d621c25"}'
```

**Expected response**:
```json
{
  "id": "u_admin_001",
  "fullName": "System Administrator",
  "email": "bshuvojit566@gmail.com",
  ...
}
```

**If this works** → Backend is fine. Go to Step 3.
**If this fails** → Backend has an issue. Check its logs.

---

### **STEP 3: Verify VITE_API_URL in Netlify**

**Open Netlify dashboard**:
1. Your site → Site Settings
2. Build & Deploy → Environment
3. Look for environment variables

**Check**:
- ✅ VITE_API_URL exists?
- ✅ Value is correct (e.g., `https://your-backend-name.railway.app`)?
- ✅ No typos, trailing slashes, or `http://localhost`?

**If missing or wrong**:
```
THIS IS YOUR PROBLEM!
Add/update VITE_API_URL with the correct backend URL
Then redeploy frontend
```

---

### **STEP 4: Check Frontend Console**

**On your Netlify site**:
1. Press F12 (or Cmd+Option+I on Mac)
2. Go to Console tab
3. Look for messages starting with `[API]`

**You should see**:
```
[API] Using VITE_API_URL from environment: https://your-backend-url
```

**If you see instead**:
```
[API] WARNING: VITE_API_URL not set for production...
[API] Dev mode detected (port 5173), using backend: https://your-site.netlify.app:4000
```

**This means**:
- ❌ VITE_API_URL not set in Netlify
- ❌ Frontend is trying to use auto-detection (which fails)
- ✅ Fix: Set VITE_API_URL in Netlify environment

---

### **STEP 5: Check Network Tab for CORS Errors**

**On your Netlify site**:
1. Press F12
2. Network tab
3. Try to login
4. Look for POST request to `/login`

**Check the response**:

| Headers | What it means |
|---------|--------------|
| `Access-Control-Allow-Origin: *` | ✅ CORS allowed from any origin |
| `Access-Control-Allow-Origin: https://your-site.netlify.app` | ✅ CORS allowed from Netlify |
| No `Access-Control-Allow-Origin` header | ❌ CORS not configured |
| CORS error in console | ❌ Backend rejecting request |

**If CORS error**:
```
Check that backend has NODE_ENV=production and FRONTEND_URL set correctly
(Already configured in server.js, just need to verify on deployment)
```

---

## 🛠️ QUICK FIX CHECKLIST

```
[ ] Step 1: Backend is deployed to public URL
    ✓ Check deployment dashboard (Railway/Heroku)
    ✓ Status is "Running"
    
[ ] Step 2: Backend is reachable and responding
    ✓ Open backend URL in browser
    ✓ See JSON or "Cannot GET /" (both OK)
    ✓ Test /login endpoint with curl/Postman
    
[ ] Step 3: VITE_API_URL is set in Netlify
    ✓ Netlify Site Settings → Build & Deploy → Environment
    ✓ Add: VITE_API_URL = https://your-backend-url
    
[ ] Step 4: Frontend redeployed
    ✓ Netlify Deploys → Trigger deploy (if env var added)
    ✓ Wait for "Published" status
    
[ ] Step 5: Test production login
    ✓ Open site on Netlify
    ✓ Press F12 → Console
    ✓ Should see: [API] Using VITE_API_URL from environment
    ✓ Try login with valid credentials
    ✓ No CORS errors in console
    ✓ Dashboard loads
```

---

## 🚀 THE ACTUAL FIX (If Not Done Yet)

### **If Backend NOT Deployed Yet**:

**Option A: Railway.app (Recommended, easiest)**
```
1. Go to railway.app
2. Sign in with GitHub
3. Create new project
4. Select "Deploy from GitHub repo"
5. Choose your repo
6. Railway auto-detects Node.js + json-server
7. Wait for "Running" status
8. Copy the URL from "Domains" section
   e.g., https://your-app-xyz.railway.app
```

**Option B: Heroku**
```
1. Go to heroku.com
2. Create new app
3. Connect GitHub repo
4. Deploy branch
5. Wait for build to complete
6. Copy app URL from "Settings"
   e.g., https://your-app-name.herokuapp.com
```

### **If VITE_API_URL Not Set in Netlify**:

1. **Netlify Dashboard** → Your Site → **Site Settings**
2. **Build & Deploy** → **Environment**
3. **Environment variables** → **Add**
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url` (from Railway/Heroku)
   - Example: `https://inventoryapp-production.railway.app`
4. **Click Save**
5. **Netlify** → **Deploys** → **Trigger deploy**
6. Wait for "Published" status

### **If Frontend Not Redeployed**:

1. **Netlify Dashboard** → Your Site → **Deploys**
2. Click **Trigger deploy** button
3. Wait for new build to complete
4. Check status shows "Published" ✅

---

## 📊 Complete Example: Production Setup

**Scenario**: Backend deployed to Railway, Frontend on Netlify

### Backend (Railway):
```
Deployed to: https://inventoryapp-prod.railway.app
Environment Variables:
  NODE_ENV = production
  FRONTEND_URL = https://my-inventory.netlify.app
  (Host and Port auto-assigned)
```

### Frontend (Netlify):
```
Deployed to: https://my-inventory.netlify.app
Environment Variables:
  VITE_API_URL = https://inventoryapp-prod.railway.app
```

### Test:
1. Open https://my-inventory.netlify.app
2. Press F12 → Console
3. Should see: `[API] Using VITE_API_URL from environment: https://inventoryapp-prod.railway.app`
4. Try login with: `bshuvojit566@gmail.com` + password
5. Dashboard loads ✅

---

## 🔧 Verification Commands

**Test backend reachability**:
```bash
# Should return JSON or "Cannot GET /"
curl https://your-backend-url/

# Should return user object or "Invalid credentials" error
curl -X POST https://your-backend-url/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bshuvojit566@gmail.com","passwordHash":"6f2cb9dd8f4b65e24e1c3f3fa5bc57982349237f11abceacd45bbcb74d621c25"}'
```

**Check CORS headers**:
```bash
# Backend should respond with Access-Control-Allow-Origin header
curl -i https://your-backend-url/login
```

**Verify environment variables** (after deployment):
```bash
# On Railway, Heroku, or your backend server
echo $VITE_API_URL           # On frontend (Netlify)
echo $NODE_ENV               # On backend
echo $FRONTEND_URL           # On backend
echo $PORT                   # On backend
```

---

## 📋 Troubleshooting Matrix

| Error | Cause | Fix |
|-------|-------|-----|
| "Failed to fetch" | Backend not deployed | Deploy to Railway/Heroku |
| "Failed to fetch" | VITE_API_URL not set | Add to Netlify environment |
| CORS error | Backend CORS not configured | Set FRONTEND_URL on backend |
| Timeout | Backend overloaded/dead | Restart backend, check logs |
| 401 Unauthorized | Wrong password hash | Check if password is correct |
| 404 Not Found | Wrong endpoint | Verify `/login` is correct path |
| Connection refused | Backend URL wrong | Copy exact URL from deployment |

---

## 🎓 Understanding the Architecture

```
┌─────────────────────────────────────────────────────────┐
│ USER OPENS: https://my-inventory.netlify.app            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ Netlify (Frontend)      │
        │ - React app            │
        │ - VITE_API_URL set     │
        │ - Serves HTML/JS/CSS   │
        └────────────┬───────────┘
                     │
                     │ Browser makes fetch() request
                     │ to API_BASE (/login)
                     ▼
        ┌────────────────────────────────────┐
        │ Railway (Backend)                   │
        │ https://xxx.railway.app            │
        │ - Receives POST /login request     │
        │ - Checks CORS headers             │
        │ - Reads from db.json              │
        │ - Returns user object             │
        └─────────────────────────────────┘
```

**If any part fails**:
- ❌ Frontend not on Netlify? → Deploy to Netlify
- ❌ Backend not public? → Deploy to Railway/Heroku
- ❌ VITE_API_URL missing? → Add to Netlify env
- ❌ Backend URL wrong? → Fix in VITE_API_URL
- ❌ Old code deployed? → Redeploy frontend

---

## ✅ Success Indicators

After proper setup, you should see:

```
1. Browser Console:
   ✅ [API] Using VITE_API_URL from environment: https://xxx.railway.app
   
2. Network Tab:
   ✅ POST request to https://xxx.railway.app/login
   ✅ Response status: 200 OK or 401 (if bad password)
   ✅ Response has user data (on 200)
   
3. Functional:
   ✅ Login succeeds with valid credentials
   ✅ Dashboard loads
   ✅ No CORS errors
   ✅ Inventory operations work
```

---

## 🆘 If Still Not Working

**Provide me with**:
1. Backend URL (where is server.js deployed?)
2. VITE_API_URL value (what's in Netlify environment?)
3. Screenshot of Netlify Console (F12, what does [API] message show?)
4. Screenshot of Network tab (what's the request URL and response?)
5. Backend logs (any errors when processing request?)

Then I can pinpoint the exact issue and provide specific fix.

---

## 📞 Quick Reference

| Component | Location | Status |
|-----------|----------|--------|
| Frontend Code | `src/utils/api.js` | ✅ Fixed |
| Backend Code | `server.js` | ✅ Fixed |
| Database | `db.json` | ✅ Has test users |
| CORS Config | `server.js` lines 9-47 | ✅ Configured |
| Environment Vars | `.env.example` | ✅ Documented |
| Frontend Build | Netlify | ❓ Need to verify |
| Backend Deploy | Railway/Heroku/? | ❓ Need to verify |
| VITE_API_URL | Netlify Env | ❓ Need to verify |

---

**NEXT ACTION**: Provide answers to these questions so I can identify exact problem:
1. Is server.js deployed to a public URL? (What's the URL?)
2. What is VITE_API_URL currently set to in Netlify?
3. What does the browser console show when you try to login?
4. What does the Network tab show for the /login request?
