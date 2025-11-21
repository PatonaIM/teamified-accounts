# Vercel Deployment Usage Guide

## 🚀 Deployment Options

The `deploy-vercel.sh` script can deploy frontend, backend, or both to separate Vercel projects.

## 📋 Usage

### **Interactive Mode (Recommended)**
```bash
./scripts/deploy-vercel.sh
```
This will prompt you to choose what to deploy:
1. Frontend only
2. Backend only  
3. Both frontend and backend

### **Command Line Options**
```bash
# Deploy only frontend
./scripts/deploy-vercel.sh --frontend

# Deploy only backend
./scripts/deploy-vercel.sh --backend

# Deploy both frontend and backend
./scripts/deploy-vercel.sh --both

# Show help
./scripts/deploy-vercel.sh --help
```

## 🏗️ Project Structure

### **Frontend Project**
- **Name:** `teamified_team_member_portal_frontend`
- **Directory:** `frontend/`
- **Type:** Static React app
- **Configuration:** Uses `frontend/vercel.json`

### **Backend Project**
- **Name:** `teamified_team_member_portal_backend`
- **Directory:** Root (`/`)
- **Type:** Serverless NestJS API
- **Configuration:** Uses `vercel-backend.json`

## 🔧 Configuration Files

### **Frontend Configuration**
- `frontend/vercel.json` - Frontend-specific Vercel config
- `frontend/package.json` - Frontend dependencies and scripts

### **Backend Configuration**
- `vercel-backend.json` - Backend-specific Vercel config
- `vercel.json` - Root Vercel config (used during backend deployment)
- `src/config/database.config.ts` - Database configuration
- `src/config/redis.config.ts` - Redis configuration

## 🚀 Deployment Process

### **Frontend Deployment**
1. Changes to `frontend/` directory
2. Installs frontend dependencies
3. Deploys to Vercel as static site
4. Creates/updates `teamified_team_member_portal_frontend` project

### **Backend Deployment**
1. Installs backend dependencies
2. Builds NestJS application
3. Copies `vercel-backend.json` to `vercel.json`
4. Deploys to Vercel as serverless functions
5. Creates/updates `teamified_team_member_portal_backend` project
6. Sets up environment variables
7. Configures database setup

## 🔗 Connecting Frontend and Backend

After deploying both:

### **1. Get Backend URL**
```bash
# Check backend deployment
vercel ls | grep teamified-backend
```

### **2. Update Frontend Environment Variables**
In Vercel Dashboard → Frontend Project → Settings → Environment Variables:

```bash
VITE_API_URL=https://your-backend.vercel.app/api
```

### **3. Update Backend CORS**
In Vercel Dashboard → Backend Project → Settings → Environment Variables:

```bash
FRONTEND_URL=https://your-frontend.vercel.app
```

## 📊 Deployment Status

### **Check Deployments**
```bash
# List all deployments
vercel ls

# Check specific project
vercel ls --scope=your-team
```

### **View Logs**
```bash
# Backend logs
vercel logs --scope=your-team teamified_team_member_portal_backend

# Frontend logs  
vercel logs --scope=your-team teamified_team_member_portal_frontend
```

## 🧪 Testing Deployments

### **Test Frontend**
```bash
# Get frontend URL from Vercel dashboard
curl https://your-frontend.vercel.app
```

### **Test Backend**
```bash
# Test health endpoint
curl https://your-backend.vercel.app/api/health

# Test API documentation
curl https://your-backend.vercel.app/api/docs
```

## 🔄 Redeployment

### **Redeploy Frontend**
```bash
./scripts/deploy-vercel.sh --frontend
```

### **Redeploy Backend**
```bash
./scripts/deploy-vercel.sh --backend
```

### **Redeploy Both**
```bash
./scripts/deploy-vercel.sh --both
```

## 🚨 Troubleshooting

### **Common Issues**

1. **Frontend deployment fails**
   - Check `frontend/package.json` for build scripts
   - Verify `frontend/vercel.json` configuration
   - Ensure all dependencies are installed

2. **Backend deployment fails**
   - Check TypeScript compilation errors
   - Verify `vercel-backend.json` configuration
   - Ensure database configuration is correct

3. **Projects deploy to same Vercel project**
   - Delete `.vercel/` directory and redeploy
   - Use `--name` flag to specify project names
   - Check Vercel dashboard for separate projects

### **Reset Deployment**
```bash
# Remove Vercel configuration
rm -rf .vercel/
rm -rf frontend/.vercel/

# Redeploy with fresh configuration
./scripts/deploy-vercel.sh --both
```

## 📋 Deployment Checklist

### **Before Deployment**
- [ ] Vercel CLI installed and authenticated
- [ ] All code committed to Git
- [ ] Environment variables planned
- [ ] Database setup planned

### **After Frontend Deployment**
- [ ] Frontend URL accessible
- [ ] Environment variables configured
- [ ] API URL points to backend

### **After Backend Deployment**
- [ ] Backend URL accessible
- [ ] Database created and configured
- [ ] Environment variables set
- [ ] API endpoints tested
- [ ] CORS configured for frontend

## 🎯 Best Practices

1. **Deploy backend first** to get the API URL
2. **Update frontend** with backend URL
3. **Test both deployments** before going live
4. **Use separate projects** for frontend and backend
5. **Configure environment variables** after deployment
6. **Set up monitoring** for both projects

---

**For detailed setup instructions, see:**
- `VERCEL_BACKEND_DEPLOYMENT_GUIDE.md` - Backend setup
- `VERCEL_DATABASE_SETUP.md` - Database configuration
