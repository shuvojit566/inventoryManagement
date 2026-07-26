# Mobile Login Fix - Troubleshooting Guide

## Problem
Mobile login fails with "Failed to fetch" error while desktop login works fine.

## Root Causes Fixed

### 1. **Hardcoded Localhost URL** ✅ FIXED
**Issue:** The frontend was hardcoded to use `http://localhost:4000`, which doesn't work on mobile devices as `localhost` refers to the mobile device itself.

**Fix:** Updated `src/utils/api.js` to dynamically detect the correct API URL based on:
- The frontend's current hostname/IP address
- The development vs production environment
- Environment variables (VITE_API_URL)

### 2. **Missing CORS Headers** ✅ FIXED
**Issue:** The backend server didn't include CORS (Cross-Origin Resource Sharing) headers, causing browsers to block requests from different devices/domains.

**Fix:** Added CORS middleware to `server.js`:
```javascript
res.header('Access-Control-Allow-Origin', '*')
res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
```

### 3. **Backend Only Listening on Localhost** ✅ FIXED
**Issue:** The backend was only listening on `localhost` (127.0.0.1), making it inaccessible from mobile devices on the same network.

**Fix:** Updated server to listen on `0.0.0.0` (all network interfaces) by default.

## Setup Instructions

### Development Setup (Local Network Testing)

#### Step 1: Configure Backend
Create a `.env` file in the project root:
```
HOST=0.0.0.0
PORT=4000
```

#### Step 2: Start Backend Server
```bash
npm run json-server
```

The backend will output:
```
JSON Server is running on http://localhost:4000
[Mobile Access] Use your machine IP address instead of localhost
[Example] http://<YOUR_IP>:4000
```

#### Step 3: Find Your Machine IP
**Windows:**
```bash
ipconfig
```
Look for IPv4 Address (e.g., 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig
```
Look for inet address under your network interface

#### Step 4: Start Frontend Dev Server
```bash
npm run dev
```

#### Step 5: Access from Mobile
1. On your mobile device, connect to the **same WiFi network**
2. Open browser and go to: `http://<YOUR_IP>:5173`
3. Try logging in - it should now work!

**Example:**
- Your machine IP: `192.168.1.100`
- Frontend URL: `http://192.168.1.100:5173`
- Backend URL: `http://192.168.1.100:4000`

### Production Setup

#### For Cloud Deployment (AWS, Heroku, etc.)
Create a `.env` file:
```
VITE_API_URL=https://api.yourdomain.com
HOST=0.0.0.0
PORT=4000
```

Build and deploy:
```bash
npm run build
```

#### For Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 4000
CMD ["node", "server.js"]
```

## Testing the Fix

### Quick Test
1. **Desktop:** Login from `http://localhost:5173` - Should work ✅
2. **Mobile (same WiFi):** Login from `http://<YOUR_IP>:5173` - Should now work ✅

### Browser Developer Tools
If still having issues, check:

**On Mobile:**
1. Open DevTools (F12 in most browsers, or use remote debugging)
2. Check Console tab for error messages
3. Check Network tab to see if requests reach the backend

**Common Issues:**
- **Error: "Failed to fetch"** → Backend server not running or unreachable
- **Error: "CORS policy"** → Backend CORS headers not set (should be fixed now)
- **Error: "Connection refused"** → Wrong IP address or port

## Environment Variables Reference

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | Auto-detect | Override API URL (useful for production) |
| `HOST` | `0.0.0.0` | Backend server binding address |
| `PORT` | `4000` | Backend server port |

## How the Auto-Detection Works

The frontend now intelligently detects the API URL:

1. **Check environment variable** → Use `VITE_API_URL` if set
2. **Dev server (port 5173)** → Connect to backend on port 4000 of same host
3. **Production (port 80/443)** → Connect to backend on same host/port or port 4000
4. **Fallback** → Use detected hostname + port 4000

This means:
- ✅ Desktop: Works automatically
- ✅ Mobile on same network: Works automatically (if backend listens on 0.0.0.0)
- ✅ Production: Works automatically (if API on same domain)
- ✅ Custom setup: Use `VITE_API_URL` environment variable

## Verification Checklist

- [ ] Backend server running with `npm run json-server`
- [ ] Backend listening on `0.0.0.0:4000` (not just `localhost`)
- [ ] Frontend and mobile on same WiFi network
- [ ] Mobile can ping your machine IP (network connectivity OK)
- [ ] No firewall blocking port 4000
- [ ] CORS headers present in backend responses
- [ ] Mobile logs in successfully

## Still Having Issues?

### Check Network Connectivity
**Windows:**
```bash
# From mobile, verify backend is reachable
ping <YOUR_IP>
```

### Verify Backend is Running
**Check if port 4000 is listening:**
```bash
# Windows
netstat -an | find ":4000"

# Mac/Linux
netstat -an | grep :4000
```

### Test Backend Directly
**From mobile browser, visit:** `http://<YOUR_IP>:4000/login`

Should show an error about missing POST data, confirming backend is accessible.

### Check Firewall
Ensure port 4000 is not blocked by:
- Windows Defender Firewall
- Antivirus software
- Network router/firewall

## Related Files Modified

- `src/utils/api.js` - Dynamic API URL detection
- `server.js` - CORS headers + listen on 0.0.0.0
- `vite.config.js` - Dev server proxy configuration
- `.env.example` - Environment variables documentation
