# Frontend Vercel Deployment

## Important: Static Site Deployment

This frontend is a **static site** (Vite/React build), which means:

### ✅ How It Works
- Static assets (HTML, CSS, JS) are deployed to **Vercel's Global Edge Network**
- Assets are automatically distributed to edge locations worldwide
- Users are served from the nearest edge location for optimal performance
- No serverless functions = no region-specific deployment needed

### 🌍 Edge Network vs Regions

**The `regions` setting in `vercel.json` ONLY applies to:**
- Serverless Functions (API routes in `/api` directory)
- Server-Side Rendering (SSR)

**For static frontends:**
- Assets are served from Vercel's global CDN
- The "region" you see (like `iad1`) is just the **build region**, not where assets are served from
- Assets are cached and served from 100+ edge locations globally

### 🚀 Performance

This is actually **better** than deploying to a single region because:
- Australian users get assets from Sydney edge
- US users get assets from US edges
- European users get assets from EU edges
- Etc.

### 🔧 Backend Configuration

The **backend** (`/vercel.json` in root) IS configured for `syd1` region because it has serverless functions that need to run in a specific region.

## Deployment Commands

```bash
# Deploy frontend (uses global edge network)
./scripts/deploy-vercel.sh --frontend

# Deploy backend (deploys to syd1 region)
./scripts/deploy-vercel.sh --backend

# Deploy both
./scripts/deploy-vercel.sh --both
```

## Environment Variables

Make sure to set in Vercel dashboard:
- `VITE_API_BASE_URL` - Points to backend URL

## Verification

After deployment:
1. Check Vercel dashboard for deployment status
2. Test from different locations to verify edge network
3. Backend API calls will go to `syd1` region
4. Frontend assets served from nearest edge location

---

**Note:** If you need true region-specific deployment for compliance reasons, you would need to:
1. Convert to SSR (Server-Side Rendering)
2. Add serverless functions
3. This would impact performance and increase costs

