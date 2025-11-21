# Vercel Deployment Guide - Teamified Jobs Board

## 📋 Overview

This guide covers deploying the Teamified frontend (React + Vite + Material-UI) to Vercel and connecting it to your NestJS backend.

## 🏗️ Architecture

```
Frontend (Vercel)                    Backend (Your Server/Vercel)
├── React + Vite                     ├── NestJS
├── Material-UI                      ├── PostgreSQL
├── React Router                     ├── Workable API Integration
└── Tailwind CSS                     └── REST API
```

## 🚀 Option 1: Deploy via v0.dev (Recommended)

### Step 1: Prepare Your Repository

1. **Ensure your frontend code is in a Git repository**
   ```bash
   cd frontend
   git init  # if not already initialized
   git add .
   git commit -m "Prepare frontend for Vercel deployment"
   ```

2. **Push to GitHub/GitLab/Bitbucket**
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

### Step 2: Import to v0.dev

1. Go to [v0.dev](https://v0.dev)
2. Sign in with your GitHub account
3. Click "Import Project"
4. Select your repository
5. Set root directory: `frontend/`

### Step 3: Configure Build Settings

**Framework Preset:** Vite
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`
**Node Version:** 18.x or 20.x

### Step 4: Environment Variables

Add these in v0/Vercel dashboard under "Environment Variables":

```env
# Backend API URL (REQUIRED)
VITE_API_URL=https://your-backend-domain.com/api

# Workable Integration (if using Jobs feature)
VITE_WORKABLE_SUBDOMAIN=your-workable-subdomain
VITE_WORKABLE_API_TOKEN=your-workable-token
```

**Important:** All Vite env vars must be prefixed with `VITE_`

### Step 5: Deploy

Click "Deploy" - Vercel will:
1. Install dependencies
2. Run build command
3. Deploy to global CDN
4. Provide you with a URL

---

## 🚀 Option 2: Deploy via Vercel CLI


### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy from Frontend Directory

```bash
cd frontend
vercel
```

Follow the prompts:
- **Setup and deploy?** Y
- **Which scope?** Select your team/account
- **Link to existing project?** N (first time) or Y (subsequent)
- **Project name?** teamified-jobs-board
- **In which directory is your code located?** ./
- **Want to override settings?** Y
  - **Build Command:** `npm run build`
  - **Output Directory:** `dist`
  - **Development Command:** `npm run dev`

### Step 4: Add Environment Variables

```bash
vercel env add VITE_API_URL
# Enter value: https://your-backend-domain.com/api

vercel env add VITE_WORKABLE_SUBDOMAIN
# Enter value: your-subdomain

vercel env add VITE_WORKABLE_API_TOKEN
# Enter value: your-token
```

### Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

---

## 🔧 Backend Configuration

### CORS Settings (Important!)

Your NestJS backend **MUST** allow requests from your Vercel domain.

**Update `src/main.ts`:**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for Vercel frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173', // Vite dev
      'https://your-vercel-app.vercel.app', // Your Vercel domain
      'https://your-custom-domain.com', // Custom domain
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(3000);
}
bootstrap();
```

### Backend Deployment Options

**Option A: Deploy Backend to Vercel**
- Use Vercel Serverless Functions
- Add PostgreSQL via Vercel Postgres or external provider
- Limited to serverless architecture

**Option B: Deploy Backend to Railway/Render/Fly.io**
- Full control over server
- PostgreSQL included
- Better for NestJS/long-running processes

**Option C: Keep Current Docker Setup**
- Deploy to AWS/DigitalOcean/Linode
- Use your existing docker-compose setup
- Add domain with HTTPS (Let's Encrypt)

---

## 📝 Update Frontend API URL

**In `frontend/src/services/workableService.ts` and other API services:**

```typescript
// Before (hardcoded)
const API_BASE_URL = 'http://localhost:3000/api';

// After (use environment variable)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

**In `frontend/src/services/authService.ts`:**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

Apply this pattern to ALL service files that make API calls.

---

## 🔐 Environment Variables Reference

### Production (Vercel Dashboard)

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://api.teamified.com/api` | Your backend API URL |
| `VITE_WORKABLE_SUBDOMAIN` | `your-company` | Workable subdomain |
| `VITE_WORKABLE_API_TOKEN` | `sk_live_xxx` | Workable API token |

### Development (`.env.local`)

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_WORKABLE_SUBDOMAIN=your-subdomain
VITE_WORKABLE_API_TOKEN=your-token
```

**Note:** `.env.local` should be in `.gitignore` (security)

---

## 🎯 Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to your project settings
2. Navigate to "Domains"
3. Click "Add Domain"
4. Enter your domain: `jobs.teamified.com`

### Step 2: Configure DNS

Add these records in your DNS provider:

**For subdomain (jobs.teamified.com):**
```
Type: CNAME
Name: jobs
Value: cname.vercel-dns.com
```

**For apex domain (teamified.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

### Step 3: SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt.
Wait 24-48 hours for DNS propagation and cert issuance.

---

## 🧪 Testing Your Deployment

### 1. Test Frontend Loads

```bash
curl https://your-app.vercel.app
# Should return HTML with React app
```

### 2. Test API Connection

Open browser console on your deployed site:

```javascript
fetch(import.meta.env.VITE_API_URL + '/health')
  .then(r => r.json())
  .then(console.log)
```

### 3. Test Authentication

1. Navigate to `/login`
2. Try logging in with test credentials
3. Check Network tab for API calls
4. Verify CORS headers present

### 4. Test Jobs Page

1. Navigate to `/jobs`
2. Verify jobs load from Workable API
3. Check console for errors
4. Test filters and search

---

## 🐛 Common Issues & Fixes

### Issue 1: CORS Errors

**Error:** `Access to fetch blocked by CORS policy`

**Fix:**
- Add Vercel domain to backend CORS config
- Ensure `credentials: true` if using cookies
- Check OPTIONS requests are handled

### Issue 2: 404 on Page Refresh

**Error:** Page works on first load, 404 on refresh

**Fix:**
- Ensure `vercel.json` has rewrite rule (already added)
- Vercel should route all paths to `/index.html`

### Issue 3: Environment Variables Not Working

**Error:** `import.meta.env.VITE_API_URL is undefined`

**Fix:**
- Ensure vars are prefixed with `VITE_`
- Redeploy after adding env vars
- Check they're added to "Production" environment

### Issue 4: Build Fails

**Error:** Build errors during deployment

**Fix:**
```bash
# Test build locally first
cd frontend
npm run build

# If it works locally but fails on Vercel:
# - Check Node version matches
# - Ensure all dependencies in package.json
# - Check for TypeScript errors
```

### Issue 5: Blank Page After Deployment

**Error:** Deployment succeeds but page is blank

**Fix:**
1. Check browser console for errors
2. Verify `VITE_API_URL` is set correctly
3. Check backend is accessible
4. Verify build output has files in `dist/`

---

## 📊 Monitoring & Analytics

### Vercel Analytics

Enable in project settings:
1. Go to "Analytics" tab
2. Click "Enable Analytics"
3. View page views, performance, and vitals

### Error Tracking

Consider adding:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **PostHog** - Product analytics

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys on:
- **Push to main branch** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment

### Manual Deployment

```bash
# Deploy to production
cd frontend
vercel --prod

# Deploy to preview
vercel
```

### Deployment Hooks

Set up webhooks for:
- Slack notifications
- Discord notifications
- Custom integrations

---

## 📈 Performance Optimization

### Already Configured

✅ Static asset caching (31536000s)
✅ Gzip compression
✅ Global CDN distribution
✅ Automatic HTTPS
✅ HTTP/2 support

### Additional Optimizations

1. **Code Splitting**
   - Lazy load routes
   - Dynamic imports for large components

2. **Image Optimization**
   - Use Vercel Image Optimization
   - Serve WebP format

3. **Bundle Analysis**
   ```bash
   npm run build
   npx vite-bundle-visualizer
   ```

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [React Router on Vercel](https://vercel.com/docs/frameworks/vite#routing)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## ✅ Deployment Checklist

- [ ] Frontend code in Git repository
- [ ] `vercel.json` configuration file created
- [ ] Environment variables prepared
- [ ] Backend CORS configured for Vercel domain
- [ ] API service files use `VITE_API_URL`
- [ ] Test build locally (`npm run build`)
- [ ] Deploy to Vercel
- [ ] Add environment variables in dashboard
- [ ] Test deployed site
- [ ] Configure custom domain (optional)
- [ ] Enable analytics (optional)
- [ ] Set up monitoring (optional)

---

## 🆘 Need Help?

**Vercel Support:**
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Support: support@vercel.com

**Deployment Issues:**
1. Check deployment logs in Vercel dashboard
2. Test build locally first
3. Verify environment variables
4. Check backend connectivity

---

Generated: October 17, 2025
Version: 1.0

