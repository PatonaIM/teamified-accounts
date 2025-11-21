# Vercel Quick Start - 5 Minutes ⚡

## 🎯 Deploy in 5 Steps

### 1️⃣ Push to GitHub (if not already)

```bash
cd frontend
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2️⃣ Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. **Root Directory:** Select `frontend/` (important!)

### 3️⃣ Configure Settings

Vercel auto-detects Vite. Just verify:
- ✅ Framework: Vite
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`

### 4️⃣ Add Environment Variables

Click "Environment Variables" and add:

```
VITE_API_URL = https://your-backend-domain.com/api
```

*(Optional: Add Workable vars if using Jobs feature)*

### 5️⃣ Deploy!

Click **"Deploy"** - Done in ~2 minutes! 🚀

---

## 🔧 After Deployment

### Update Backend CORS

Add your Vercel URL to backend CORS whitelist:

```typescript
// src/main.ts
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app',  // ← Add this
  ],
  credentials: true,
});
```

### Test Your Deployment

1. Visit your Vercel URL
2. Try logging in
3. Check jobs page loads
4. Verify filters work

---

## 📋 Environment Variables Needed

| Variable | Example | Where to Get It |
|----------|---------|-----------------|
| `VITE_API_URL` | `https://api.yoursite.com/api` | Your backend URL |
| `VITE_WORKABLE_SUBDOMAIN` | `teamified` | Workable Settings |
| `VITE_WORKABLE_API_TOKEN` | `sk_live_xxx` | Workable API Keys |

---

## ⚡ That's It!

Your frontend is now live on Vercel's global CDN.

**Next Steps:**
- Add custom domain in Vercel dashboard
- Enable Analytics
- Set up monitoring

**Full guide:** See `VERCEL_DEPLOYMENT_GUIDE.md` for advanced configuration.

---

## 🆘 Quick Troubleshooting

**Page is blank?**
→ Check browser console for errors

**CORS error?**
→ Add Vercel domain to backend CORS

**404 on refresh?**
→ Already fixed by `vercel.json` rewrite rule

**Build fails?**
→ Test `npm run build` locally first

---

Need help? Check the full deployment guide or Vercel docs!

