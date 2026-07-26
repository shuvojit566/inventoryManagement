# Quick Start - Mobile Login Fix

## 🚀 Get Mobile Login Working in 3 Steps

### Step 1: Start Backend Server
```bash
npm run json-server
```

You'll see:
```
JSON Server is running on http://localhost:4000
[Mobile Access] Use your machine IP address instead of localhost
[Example] http://<YOUR_IP>:4000
```

### Step 2: Find Your Machine IP (Windows)
```bash
ipconfig
```

Look for "IPv4 Address" - something like `192.168.1.100`

### Step 3: Start Frontend Dev Server (New Terminal)
```bash
npm run dev
```

Then access from mobile:
```
http://192.168.1.100:5173
```

✅ **Login should now work on mobile!**

---

## 🔧 What Changed?

| Issue | Fix |
|-------|-----|
| Hardcoded `localhost:4000` | Auto-detects correct IP |
| No CORS headers | Added CORS support |
| Backend unreachable from network | Now listens on `0.0.0.0` |

---

## 📱 Testing Checklist

- [ ] Backend running (`npm run json-server`)
- [ ] Found your machine IP (`ipconfig`)
- [ ] Frontend running (`npm run dev`)
- [ ] Mobile on same WiFi network
- [ ] Mobile can open `http://<YOUR_IP>:5173`
- [ ] Mobile login works ✅

---

## ⚠️ Common Issues

**"Failed to fetch" on mobile?**
- Backend not running? Start it: `npm run json-server`
- Wrong IP address? Check `ipconfig` again
- Different WiFi networks? Mobile must be on same WiFi as PC
- Firewall blocking port 4000? Check firewall settings

**Desktop still works?**
- Yes! `http://localhost:5173` still works ✅

**Production ready?**
- Set `VITE_API_URL` environment variable to your backend URL
- Build: `npm run build`
- Deploy as usual

---

## 📖 More Details

- Full troubleshooting: `MOBILE_LOGIN_FIX.md`
- Implementation details: `IMPLEMENTATION_SUMMARY.md`
- Environment setup: `.env.example`

---

## ✨ That's It!

Your app now works on:
- ✅ Desktop (`http://localhost:5173`)
- ✅ Mobile on same network (`http://<YOUR_IP>:5173`)
- ✅ Production (set `VITE_API_URL` env var)
