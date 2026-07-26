# ⚡ Production Setup - Step by Step

## 🎯 Goal: Get Production Login Working in 10-15 Minutes

---

## 📋 Prerequisites

- ✅ Frontend already deployed on Netlify
- ✅ Backend code ready to deploy
- ✅ GitHub repo with code

---

## 🚀 STEP-BY-STEP GUIDE

### PHASE 1: Deploy Backend (5 minutes)

#### STEP 1.1: Choose Hosting Platform

**Option A: Railway (Recommended)**
- Go to https://railway.app
- Click "Login with GitHub"
- Authorize Railway to access your repos

**Option B: Heroku**
- Go to https://heroku.com
- Sign up if needed
- Click "New App"

#### STEP 1.2: Deploy Your Backend

**For Railway:**
```
1. Click "New Project"
2. Select "GitHub Repo"
3. Find your inventoryManagement repo
4. Click "Deploy"
5. Wait 2-3 minutes for deployment
6. When done, click your project
7. Click "View Logs" or refresh page
8. Your app URL is shown (https://xxx.railway.app)
9. COPY THIS URL - you'll need it next
```

**For Heroku:**
```
1. Click "New" → "Create new app"
2. App name: your-app-api (e.g., myapp-api)
3. Region: Europe (or closest to you)
4. Click "Create app"
5. Go to "Deploy" tab
6. Connect GitHub → Select your repo
7. Click "Deploy Branch"
8. Wait for deployment
9. When done, see URL at top of page
10. COPY THIS URL - you'll need it next
```

#### STEP 1.3: Verify Backend is Running

```
Option 1: Check Platform Dashboard
- Railway: Shows "Running" status
- Heroku: Shows "Active" status

Option 2: Test in Browser
- Go to: https://your-backend-url/
- Should see JSON response (not connection error)
```

✅ **Backend Done!** You have the URL.

---

### PHASE 2: Configure Netlify (3-5 minutes)

#### STEP 2.1: Open Netlify Dashboard

```
1. Go to https://app.netlify.com
2. Find your site (should already be deployed)
3. Click on it
```

#### STEP 2.2: Add Environment Variable

```
1. Click "Site Settings"
2. Go to "Build & Deploy"
3. Click "Environment"
4. Click "Add environment variables" (or "Edit variables")
5. Fill in:
   Key: VITE_API_URL
   Value: https://your-backend-url
   (Paste the URL you copied from Railway/Heroku)
6. Click "Save"
```

**Example:**
```
Key:   VITE_API_URL
Value: https://your-app-xyz123.railway.app
```

#### STEP 2.3: Verify Variable is Saved

```
1. Look at the list of environment variables
2. You should see: VITE_API_URL = https://...
3. If you don't see it, scroll down or refresh
```

✅ **Netlify Configuration Done!**

---

### PHASE 3: Redeploy Frontend (2-3 minutes)

#### STEP 3.1: Trigger New Deployment

```
1. Still on Netlify, click "Deploys"
2. Look for "Trigger Deploy" button (top right)
3. Click it → "Deploy site"
4. Wait for build to complete (should take 1-2 minutes)
5. You should see status: "Published" ✅
```

#### STEP 3.2: Wait for Build to Complete

```
Watch the deploy status:
- "Queued" → "Building" → "Publishing" → "Published"
- This usually takes 1-2 minutes
- Once it says "Published", deployment is done
```

#### STEP 3.3: Check Deploy Logs (Optional)

```
To verify VITE_API_URL was picked up:
1. On Netlify Deploys page
2. Find latest deployment
3. Click on it
4. Look at logs for: "VITE_API_URL"
5. Should show your backend URL
```

✅ **Frontend Redeployed!**

---

### PHASE 4: Test Production (2-3 minutes)

#### STEP 4.1: Open Your Deployed Site

```
1. On Netlify, click site name or visit URL
2. Your app should load
3. You should see login page
```

#### STEP 4.2: Check Console for API URL

```
1. Press F12 to open DevTools
2. Go to "Console" tab
3. Look for message: [API] Using VITE_API_URL from environment
4. Should show your backend URL
```

**Good:**
```
[API] Using VITE_API_URL from environment: https://api-xyz.railway.app
```

**Bad:**
```
[API] WARNING: VITE_API_URL not set for production
```

If you see the bad message:
- Go back to Step 2.2
- Make sure VITE_API_URL was saved
- Redeploy again (Step 3.1)
- Hard refresh: Ctrl+Shift+R

#### STEP 4.3: Test Login

```
1. On login page, enter credentials:
   Email: admin@example.com (or any registered user)
   Password: password (or correct password)
2. Click "Sign In"
3. Watch Network tab while logging in:
   - Should see request to your backend URL
   - Should NOT see "Failed to fetch"
   - Should NOT see CORS error
```

#### STEP 4.4: Verify Success

```
If you see:
✅ Dashboard loads
✅ Can see inventory
✅ Can create/edit items
✅ No error messages

Then: LOGIN WORKS! 🎉
```

---

## 🚨 Troubleshooting During Setup

### "VITE_API_URL not set" Message in Console

**Fix:**
```
1. Go to Step 2.2 again
2. Make sure VITE_API_URL is in the list
3. Make sure the value is correct (no typos)
4. Click "Save" if you made changes
5. Trigger new deployment (Step 3.1)
6. Wait for build to complete
7. Hard refresh: Ctrl+Shift+R
8. Check console again
```

### "Failed to fetch" Error

**Causes & Fixes:**
```
Cause 1: Backend not running
- Fix: Check hosting dashboard (Railway/Heroku)
- Should show "Running" or "Active"
- If not, restart or check logs

Cause 2: Wrong backend URL
- Fix: Check VITE_API_URL in Netlify
- Make sure it matches your deployment URL
- No trailing slash!
- Redeploy frontend

Cause 3: CORS blocked
- Fix: Check browser console for CORS error
- If present, backend needs CORS update
- Will need to redeploy backend
```

### Login Button Does Nothing

**Fix:**
```
1. Check browser console (F12)
2. Look for error messages
3. Check Network tab
4. Are requests even being sent?
5. If yes → check CORS error
6. If no → JavaScript error, check console
```

---

## ✅ Success Checklist

Before considering this "done", verify:

**Backend (Railway/Heroku):**
- [ ] Deployed and running
- [ ] Shows "Running" or "Active" status
- [ ] Can access via browser: https://your-url/
- [ ] Returns JSON response

**Frontend (Netlify):**
- [ ] VITE_API_URL added to environment
- [ ] Netlify redeployed after adding variable
- [ ] Deployment shows "Published"
- [ ] Site loads when you visit URL

**Console Verification:**
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] See: [API] Using VITE_API_URL from environment
- [ ] Shows your backend URL

**Login Test:**
- [ ] Can click login button
- [ ] Can enter credentials
- [ ] Network tab shows request to backend
- [ ] No CORS errors
- [ ] Status is 401 (bad creds) or 200 (success)
- [ ] Dashboard loads if credentials correct

---

## 🎯 Expected Timeline

```
Step 1 (Deploy Backend):     5 minutes
Step 2 (Configure Netlify):  3 minutes
Step 3 (Redeploy Frontend):  2 minutes
Step 4 (Test):               2 minutes
─────────────────────────────────────
TOTAL:                       12 minutes
```

---

## 🎉 You're Done!

If all checks above pass, production login is working! 

### Next Steps:
1. Do a final manual test
2. Monitor backend logs for a few hours
3. Tell users to try logging in
4. Collect feedback

---

## 📞 If Something Goes Wrong

1. **Check the troubleshooting section above**
2. **Read `PRODUCTION_TROUBLESHOOTING.md` for detailed help**
3. **Verify all steps were completed exactly as written**
4. **Check both Netlify and backend hosting logs**

---

**Time to Deploy:** ~12 minutes ⏱️
**Difficulty:** Easy 🟢
**Required Knowledge:** None - just follow steps!
