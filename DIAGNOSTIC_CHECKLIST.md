# 🔧 PRODUCTION DIAGNOSTIC CHECKLIST

**Use this form to systematically check what's working and what's not**

---

## ❓ CRITICAL QUESTIONS - Answer These First

### Q1: Backend Deployment Status
```
Is server.js deployed to a public URL (Railway, Heroku, etc.)?
  [ ] YES  - Deployed and running. URL is: ___________________
  [ ] NO   - Not deployed yet. DEPLOY FIRST before other steps.
  [ ] MAYBE - Not sure. Check your platform dashboard.
```

### Q2: Frontend Environment Variable
```
What is VITE_API_URL set to in Netlify Site Settings?
  [ ] Set to: ___________________
  [ ] Not set / empty
  [ ] Not sure. Check: Netlify → Site Settings → Build & Deploy → Environment
```

### Q3: Recent Deployments
```
When was the last frontend deployment on Netlify?
  [ ] After setting VITE_API_URL? (Check Netlify Deploys page)
  [ ] Before setting VITE_API_URL?
  [ ] Never deployed (new site)
```

---

## 🧪 TEST 1: Backend is Reachable

**Action**: Open your backend URL in a browser (e.g., https://your-app.railway.app/)

| Expected | Result | ✓/✗ |
|----------|--------|-----|
| See some JSON data OR "Cannot GET /" message | ___________ | ☐ |
| No error message, no timeout, no "refused" | ___________ | ☐ |

**What to do if failed**:
- [ ] Check backend deployment is running on platform dashboard
- [ ] Verify the URL is correct (no typos, right platform)
- [ ] Restart backend if needed

---

## 🧪 TEST 2: Login Endpoint Works

**Action**: Test the login API directly using curl or Postman

```bash
# MacOS/Linux users:
curl -X POST https://YOUR_BACKEND_URL/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bshuvojit566@gmail.com","passwordHash":"6f2cb9dd8f4b65e24e1c3f3fa5bc57982349237f11abceacd45bbcb74d621c25"}'

# Windows users: Use this format or Postman
```

**Expected Response**: 
- Status: `200 OK`
- Body: User object with `id`, `fullName`, `email`, etc. (NO `passwordHash`)

| Result | ✓/✗ |
|--------|-----|
| Got 200 OK with user data | ☐ |
| Got 401 (wrong password) | ☐ |
| Got CORS error | ☐ |
| Timeout / No response | ☐ |

**What to do if failed**:
- [ ] Backend not responding? Check if it's running
- [ ] CORS error? Backend might not have production config
- [ ] Timeout? Backend URL might be wrong

---

## 🧪 TEST 3: Frontend Console Messages

**Action**: 
1. Open your Netlify site (https://your-site.netlify.app)
2. Press F12
3. Go to Console tab
4. Try to login
5. Look for messages starting with `[API]`

| Message | What it means | Action |
|---------|--------------|--------|
| `[API] Using VITE_API_URL from environment: https://...` | ✅ Environment var is set | OK, go to next test |
| `[API] WARNING: VITE_API_URL not set for production...` | ❌ Env var is NOT set | Set VITE_API_URL in Netlify |
| `[API] Dev mode detected (port 5173)...` | ❌ Running in dev mode | Make sure you're on production URL |
| `[API] Local network detected...` | ❌ Running on LAN | Wrong environment |
| No `[API]` messages at all | ❓ Unknown issue | Check console for errors |

**Actual message seen**:
```
_________________________________________________________________
```

**What to do**:
- [ ] If env var not set: Add VITE_API_URL to Netlify environment
- [ ] If wrong detection: Verify you're on correct URL
- [ ] If no messages: Check for other console errors

---

## 🧪 TEST 4: Network Tab Analysis

**Action**:
1. Open your Netlify site
2. Press F12
3. Go to Network tab
4. Clear network log (trash icon)
5. Try to login
6. Look for POST request to `/login`
7. Click on it and check Response tab

| Check | Result | Status |
|-------|--------|--------|
| Request URL shows backend domain (not localhost) | ___________ | ☐ |
| Response status is 200 (success) or 401 (wrong pass) | ___________ | ☐ |
| Response headers include `Access-Control-Allow-Origin` | ___________ | ☐ |
| Response body is JSON (not error message) | ___________ | ☐ |

**Request URL should be**:
- ✅ `https://your-backend-name.railway.app/login`
- ✅ `https://your-app-name.herokuapp.com/login`
- ❌ NOT `https://your-site.netlify.app:4000/login`
- ❌ NOT `http://localhost:4000/login`

**Actual request URL seen**:
```
_________________________________________________________________
```

**Response status code**:
```
_________________________________________________________________
```

**What to do if failed**:
- [ ] If request goes to localhost: VITE_API_URL not set
- [ ] If CORS error: Backend CORS configuration issue
- [ ] If no response: Backend not running or URL wrong

---

## 📋 DIAGNOSIS MATRIX

**Based on your answers above, find your scenario**:

### Scenario A: Backend not deployed
```
Symptoms:
  ❌ "Backend Deployment Status" = NO
  ❌ Test 1 fails (Can't reach backend)
  
Root Cause:
  server.js not running on public URL

Solution:
  1. Deploy to Railway.app or Heroku
  2. Copy public URL
  3. Add to Netlify VITE_API_URL
  4. Redeploy frontend
  5. Test again
```

### Scenario B: Backend deployed but VITE_API_URL not set
```
Symptoms:
  ✅ Test 1 passes (Backend reachable)
  ✅ Test 2 passes (Login endpoint works)
  ❌ Test 3 shows "WARNING: VITE_API_URL not set"
  ❌ Test 4 request goes to wrong URL
  
Root Cause:
  VITE_API_URL missing from Netlify environment variables

Solution:
  1. Netlify → Site Settings → Build & Deploy → Environment
  2. Add: VITE_API_URL = https://your-backend-url
  3. Netlify → Deploys → Trigger deploy
  4. Wait for "Published"
  5. Test again
```

### Scenario C: VITE_API_URL set but wrong value
```
Symptoms:
  ✅ Test 3 shows VITE_API_URL is set
  ❌ Test 2 fails when you test that URL
  ❌ Request URL in Network tab is wrong
  
Root Cause:
  VITE_API_URL value is incorrect

Solution:
  1. Get correct backend URL from platform dashboard
  2. Update VITE_API_URL in Netlify
  3. Redeploy frontend
  4. Test again
```

### Scenario D: VITE_API_URL set but frontend not redeployed
```
Symptoms:
  ✅ VITE_API_URL set in Netlify
  ❌ Test 3 still shows "WARNING: VITE_API_URL not set"
  
Root Cause:
  Frontend build created BEFORE env var was set

Solution:
  1. Netlify → Deploys
  2. Click "Trigger deploy"
  3. Wait for "Published"
  4. Test again
```

### Scenario E: Backend CORS configuration
```
Symptoms:
  ✅ Test 2 works (curl succeeds)
  ❌ Test 4 shows CORS error
  
Root Cause:
  Backend CORS headers not configured correctly

Solution:
  1. Verify backend has NODE_ENV=production
  2. Verify backend has FRONTEND_URL set to Netlify domain
  3. Restart backend
  4. Test again
```

---

## 🎯 YOUR ACTION PLAN

**Fill this out based on your test results**:

```
1. Which tests passed?
   ☐ Test 1 (Backend reachable)
   ☐ Test 2 (Login endpoint works)
   ☐ Test 3 (Console shows VITE_API_URL)
   ☐ Test 4 (Network request correct)

2. Which scenario matches your symptoms? 
   ☐ Scenario A (Backend not deployed)
   ☐ Scenario B (VITE_API_URL not set)
   ☐ Scenario C (VITE_API_URL wrong value)
   ☐ Scenario D (Frontend not redeployed)
   ☐ Scenario E (CORS configuration)
   ☐ Other: ___________________

3. What's the fix?
   ________________________________________________
   ________________________________________________

4. After fix, will redeploy?
   ☐ Yes
   ☐ No
   ☐ Already done
```

---

## 📸 INFORMATION TO PROVIDE FOR HELP

**If still stuck, provide this information**:

```
1. Backend URL: ___________________________________

2. VITE_API_URL in Netlify: _______________________

3. Screenshot of Test 3 console message:
   (What does [API] message show?)
   _________________________________________________

4. Screenshot of Test 4 Network tab:
   (What's the request URL and status?)
   _________________________________________________

5. Recent changes made:
   (What did you just do?)
   _________________________________________________

6. Exact error shown:
   (Copy the exact error message)
   _________________________________________________
```

---

## ✅ SUCCESS CRITERIA

**After fix, you should have ALL of these**:

- [x] Backend deployed to public URL (Railway/Heroku)
- [x] Backend running and responding to requests
- [x] VITE_API_URL set in Netlify environment
- [x] Frontend redeployed to Netlify
- [x] Console shows: `[API] Using VITE_API_URL from environment: https://...`
- [x] Network shows request to backend domain (not localhost)
- [x] Login succeeds and dashboard loads
- [x] No errors in console or network tab

---

**Once all criteria met, production login issue is RESOLVED** ✅
