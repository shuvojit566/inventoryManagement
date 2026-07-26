# 🔍 Production Login Troubleshooting Guide

## 🎯 Diagnostic Flowchart

```
Login fails in production?
    ↓
1. Check console message
    ↓
    ├─ "[API] Using VITE_API_URL..."
    │  ├─ URL correct? → Go to step 2
    │  └─ URL wrong/missing? → Fix VITE_API_URL in Netlify
    │
    └─ "[API] WARNING: VITE_API_URL not set..."
       → Add VITE_API_URL to Netlify build environment
```

---

## 🔧 Step-by-Step Troubleshooting

### Step 1: Verify Frontend Environment Variable

**Check if Netlify has VITE_API_URL set:**

1. Netlify Dashboard → Your Site
2. Site Settings → Build & Deploy → Environment
3. Look for `VITE_API_URL` variable

**If missing:**
- Add it: `VITE_API_URL = https://your-backend-url`
- Trigger new deploy
- Wait for build to complete

**If present:**
- Check the value (should be your backend URL)
- Correct if wrong
- Redeploy
- Continue to Step 2

---

### Step 2: Verify Console Message

**Open your deployed site in browser:**

1. Press F12 to open DevTools
2. Go to Console tab
3. Look for one of these messages:

**Good:**
```
[API] Using VITE_API_URL from environment: https://api-xyz.railway.app
```

**Bad:**
```
[API] WARNING: VITE_API_URL not set for production...
[API] Using fallback: https://your-site.netlify.app:4000
```

**If showing "using fallback":**
- Go back to Step 1
- Add VITE_API_URL to Netlify
- Redeploy

---

### Step 3: Verify Network Requests

**Check if frontend is actually calling the backend:**

1. DevTools → Network tab
2. Attempt login (enter credentials and click "Sign in")
3. Look for requests to your backend URL

**What to look for:**
- Request to `/login` endpoint
- Should show the backend URL (not netlify.app)
- Status should be 401 (invalid creds) or 200 (success)

**Example:**
```
POST https://api-xyz.railway.app/login
Status: 401
Response: {"error": "Invalid credentials"}
```

**If seeing 401 or 200:**
- Backend is reachable ✅
- CORS is working ✅
- Check credentials (wrong email/password?)

**If seeing CORS error:**
```
Access to XMLHttpRequest... blocked by CORS policy
```
- Go to Step 4

**If seeing no requests:**
- Frontend might not be calling API
- Check console for JavaScript errors
- Clear cache: Ctrl+Shift+Delete

---

### Step 4: Verify Backend is Running

**Test if backend is accessible:**

#### Method 1: Browser URL Bar
```
1. Open: https://your-backend-url/ (or /login)
2. You should get a JSON response or error
3. NOT a "Connection refused" or timeout error
```

#### Method 2: Using curl command
```bash
# Windows PowerShell
$response = Invoke-WebRequest -Uri "https://your-backend-url/" -ErrorAction SilentlyContinue
$response.StatusCode

# Should return 200, 404, or similar (not connection error)
```

#### Method 3: Check backend hosting platform
```
1. Go to Railway/Heroku dashboard
2. Find your app
3. Check status (should say "Running" or "Active")
4. Click on it to see logs
5. Look for errors
```

**If backend is running:**
- Continue to Step 5

**If backend is NOT running:**
- Check hosting platform (Railway/Heroku)
- Restart if needed
- Check logs for startup errors
- Redeploy if necessary

---

### Step 5: Verify CORS Configuration

**Check if backend CORS headers are correct:**

#### Method 1: Check response headers
```
1. DevTools → Network tab
2. Click the login request
3. Go to Response Headers tab
4. Look for:
   - Access-Control-Allow-Origin
   - Access-Control-Allow-Methods
   - Access-Control-Allow-Headers
```

**Expected headers:**
```
Access-Control-Allow-Origin: https://your-site.netlify.app
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

#### Method 2: Using curl
```bash
curl -i -X OPTIONS https://your-backend-url/login \
  -H "Origin: https://your-site.netlify.app" \
  -H "Access-Control-Request-Method: POST"

# Should include Access-Control-Allow headers
```

**If headers present and allow your Netlify domain:**
- CORS is configured correctly ✅

**If headers missing or wrong:**
- Update backend CORS configuration
- Set FRONTEND_URL environment variable
- Redeploy backend

---

### Step 6: Verify Credentials

**Check if login failing due to wrong credentials:**

#### Method 1: Check backend logs
```
1. Go to backend hosting dashboard
2. Look at application logs
3. Search for login attempts
4. Check error messages
```

#### Method 2: Manual API test
```bash
curl -X POST https://your-backend-url/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","passwordHash":"your-password-hash"}'

# Check if response is:
# {"error": "Invalid credentials"} - wrong password
# {User object} - correct password, login successful
```

---

## 🚨 Common Errors & Fixes

### Error 1: "Failed to fetch"
```
Meaning:   Request couldn't be sent at all
Causes:    1. Backend not running
           2. Wrong URL
           3. Network blocked
           4. Backend crashed

Fix:       1. Check backend is running (Step 4)
           2. Check VITE_API_URL is correct (Step 1)
           3. Check firewall/network
           4. Check backend logs for errors
```

### Error 2: CORS Policy blocked request
```
Message:   "Access to XMLHttpRequest... blocked by CORS policy"
Cause:     Backend not allowing your Netlify domain

Fix:       1. Set FRONTEND_URL on backend
           2. Redeploy backend
           3. Verify CORS headers (Step 5)
           4. Hard refresh browser
```

### Error 3: Mixed Content Warning
```
Message:   "Mixed Content: The page was loaded over HTTPS, but 
            requested an insecure resource"
Cause:     Frontend using HTTPS, API using HTTP

Fix:       Change VITE_API_URL to use HTTPS:
           https://... not http://...
```

### Error 4: 401 Unauthorized
```
Meaning:   Credentials are invalid
Status:    This is actually GOOD - backend is reachable!

Fix:       Use correct email and password
           Check database for registered users
```

### Error 5: 404 Not Found
```
Meaning:   Backend is running, but endpoint doesn't exist
Cause:     Wrong backend URL or API path changed

Fix:       Verify backend URL includes domain only
           NOT /api prefix or other paths
```

### Error 6: Timeout
```
Meaning:   Request took too long, connection dropped
Cause:     Backend unresponsive or network slow

Fix:       1. Check backend is responsive
           2. Check backend logs
           3. Try from different location
           4. Check network speed
```

---

## 🧪 Testing Checklist

### Frontend Checks
- [ ] Open DevTools (F12)
- [ ] Check Console for API URL message
- [ ] Verify VITE_API_URL is set correctly
- [ ] Check Network tab for API requests
- [ ] Verify requests go to correct backend URL

### Backend Checks
- [ ] Backend is running (check hosting dashboard)
- [ ] Accessible via public URL
- [ ] Responds to HTTP requests
- [ ] CORS headers are present
- [ ] CORS allows your Netlify domain
- [ ] Accepts POST /login requests

### Login Flow Checks
- [ ] Click "Sign in" button
- [ ] See network request in DevTools
- [ ] Request reaches backend
- [ ] Backend responds with 200 or 401
- [ ] If 200: User object returned
- [ ] If 401: Check credentials
- [ ] No CORS errors in console

---

## 📊 Debugging Information to Collect

If still having issues, gather this information:

**Frontend:**
```
1. Browser console message about API URL
2. Network tab request details:
   - Request URL
   - Request headers
   - Response status
   - Response headers
   - Response body
3. Browser and OS
```

**Backend:**
```
1. Hosting platform (Railway/Heroku/etc)
2. Backend URL
3. Application logs
4. Error messages
5. Is it running/active?
```

**Environment:**
```
1. VITE_API_URL value in Netlify
2. FRONTEND_URL value in backend
3. NODE_ENV setting
4. Are they matching?
```

---

## 🔗 Quick Reference

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Netlify env var set | VITE_API_URL present | ? | ☐ |
| Console message | "Using VITE_API_URL" | ? | ☐ |
| Backend running | Hosting shows "Running" | ? | ☐ |
| Backend accessible | HTTP 200/404 | ? | ☐ |
| Network request | To backend URL | ? | ☐ |
| CORS headers | Present and correct | ? | ☐ |
| Login succeeds | Dashboard loads | ? | ☐ |

---

## 💡 Pro Tips

1. **Always check console first**
   - Messages tell you exactly what's happening
   - "Using VITE_API_URL" = good
   - "WARNING: VITE_API_URL not set" = problem

2. **Hard refresh your browser**
   - Ctrl+Shift+R (Windows)
   - Cmd+Shift+R (Mac)
   - Clears cache and reloads

3. **Check hosting platform dashboard**
   - Most info is visible there
   - Check if app is running
   - Look at recent logs
   - Restart if needed

4. **Test API directly**
   - Use curl or Postman
   - Verify backend works independently
   - Isolate if it's frontend or backend issue

5. **Check both directions**
   - Frontend → Backend (is request being sent?)
   - Backend → Frontend (are headers allowed?)

---

## 🎯 Most Common Fix

90% of production login issues are fixed by:

1. Adding `VITE_API_URL` to Netlify environment
2. Redeploying frontend on Netlify
3. Waiting for build to complete
4. Hard refreshing browser

Try this first!

---

## 📞 When All Else Fails

1. Check `PRODUCTION_DEPLOYMENT.md` for detailed setup
2. Check `QUICK_PRODUCTION_FIX.md` for quick start
3. Review your steps from deployment
4. Check backend hosting logs for errors
5. Verify credentials are correct
6. Try from a different browser/device
