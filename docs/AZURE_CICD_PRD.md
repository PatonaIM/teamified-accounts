# Azure CI/CD Production Deployment Guide

> **Document Version:** 1.0  
> **Last Updated:** December 2025  
> **Status:** Planning

---

## Table of Contents

1. [Overview](#overview)
2. [Environment Strategy](#environment-strategy)
3. [Database Strategy](#database-strategy)
4. [Azure Container Apps Deployment](#azure-container-apps-deployment)
5. [Azure Cache for Redis](#azure-cache-for-redis)
6. [Environment Variables & Secrets Management](#environment-variables--secrets-management)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Domain & SSL Configuration](#domain--ssl-configuration)
9. [Implementation Checklist](#implementation-checklist)

---

## Overview

This document outlines the deployment strategy for the Teamified Accounts SSO application, covering both development (DEV) and production (PROD) environments.

### Architecture Summary

| Component | Technology | Notes |
|-----------|------------|-------|
| Backend | NestJS (Node.js) | REST API with TypeORM |
| Frontend | Vite + React | Static files served by backend |
| Database | Supabase PostgreSQL | Shared across environments |
| Cache | Azure Cache for Redis | Rate limiting |
| Container | Azure Container Apps | Single container deployment |

---

## Environment Strategy

### Two-Environment Approach

| Environment | Platform | Purpose | Database |
|-------------|----------|---------|----------|
| **DEV** | Replit Published App | Development, testing, staging | Supabase PostgreSQL |
| **PROD** | Azure Container Apps | Production, live users | Supabase PostgreSQL |

### Key Decisions

1. **Replit as DEV Environment**
   - Published Replit app serves as the development/staging environment
   - Quick iteration and testing before Azure deployment
   - URL: `https://teamified-accounts.replit.app`

2. **Azure as PROD Environment**
   - Azure Container Apps for production workloads
   - Better scalability, monitoring, and enterprise features
   - Custom domain with SSL

3. **Database Strategy**
   - Keeping Supabase PostgreSQL as the production database
   - No migration to Azure SQL Server at this time (pragmatic decision)
   - Can revisit database migration in future iterations

---

## Database Strategy

### Current Setup

The application uses **Supabase PostgreSQL** as the database:

- **Provider:** Supabase (Neon-backed PostgreSQL)
- **Connection:** Via `DATABASE_URL` environment variable
- **ORM:** TypeORM with entity synchronization disabled
- **Tables:** 39 tables including users, sessions, organizations, etc.

### Connection Configuration

```typescript
// src/config/database.config.ts
const postgresUrl = configService.get('POSTGRES_URL') || configService.get('DATABASE_URL');

const config: TypeOrmModuleOptions = {
  type: 'postgres',
  url: postgresUrl,
  ssl: { rejectUnauthorized: false },
  // ... entity configuration
};
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Full PostgreSQL connection string |
| `PGHOST` | Database host |
| `PGPORT` | Database port (usually 5432) |
| `PGUSER` | Database username |
| `PGPASSWORD` | Database password |
| `PGDATABASE` | Database name |

### Future Migration Considerations

If migrating to Azure SQL Server in the future:

1. Schema conversion (PostgreSQL → T-SQL)
2. Data type mapping (uuid → uniqueidentifier, etc.)
3. Driver change (pg → mssql)
4. Connection string format update

---

## Azure Container Apps Deployment

### Deployment Approach: Single Container

We're using a **single container** approach where the NestJS backend serves both the API and frontend static files.

#### No Backend Code Changes Required

The NestJS backend **already supports** serving the frontend in production mode. This is the same pattern used by Replit's Published App. The existing code in `src/main.ts` handles:

1. **Static file serving** (lines 158-180):
   ```typescript
   if (isProduction) {
     frontendPath = path.join(__dirname, 'public');
     expressApp.use(express.static(frontendPath, { ... }));
   }
   ```

2. **SPA fallback routing** (lines 339-355):
   ```typescript
   // All non-API routes serve index.html for client-side routing
   expressApp.get(/^(?!\/api).*$/, (req, res) => {
     res.sendFile(indexPath);
   });
   ```

3. **Frontend API configuration** (`frontend/src/services/authService.ts`):
   ```typescript
   // Uses relative path, works on any domain
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
   ```

**What triggers production mode:**
- Set `NODE_ENV=production`
- Frontend files exist in `dist/public/` (relative to the compiled backend)

**Critical Path Detail:** The runtime code uses `path.join(__dirname, 'public')` where `__dirname` is the `dist/` folder containing `main.js`. Therefore, frontend files **must** be placed in `dist/public/`, not `/app/public/`.

This means the only build requirement is copying the frontend build output to `dist/public/`.

#### Why Single Container?

| Factor | Decision |
|--------|----------|
| Simplicity | Easier CI/CD, one image to manage |
| API Path | Client apps integrate via same base URL |
| Scaling | Sufficient for current traffic |
| Cost | Lower than multi-container |
| **No code changes** | Backend already supports this pattern |

#### Replit vs Azure: Same Pattern

Both Replit Published Apps and Azure Container Apps achieve the same result using the identical backend code:

| Aspect | Replit (DEV) | Azure (PROD) |
|--------|--------------|--------------|
| **Development Mode** | 2 workflows: Backend (3000), Frontend (5000) | N/A - uses container |
| **Production Mode** | Single process on port 5000 | Single container on port 8080 |
| **Static Files Location** | `dist/public/` | `dist/public/` |
| **API Routing** | `/api/*` → NestJS controllers | `/api/*` → NestJS controllers |
| **SPA Fallback** | `/*` → `index.html` | `/*` → `index.html` |
| **Trigger** | `NODE_ENV=production` | `NODE_ENV=production` |
| **Build Process** | Replit handles automatically | Dockerfile multi-stage build |

**Key Insight:** The Replit Published App and Azure deployment use the exact same backend code path. The only difference is how the build artifacts are assembled:
- **Replit**: Handles the frontend build and places files in `dist/public/` automatically
- **Azure**: The Dockerfile explicitly builds frontend and copies to `dist/public/`

### Container Architecture

```
┌─────────────────────────────────────┐
│         Azure Container App          │
│  ┌─────────────────────────────────┐ │
│  │    Single Container (Node.js)   │ │
│  │  ┌───────────────────────────┐  │ │
│  │  │   NestJS Backend          │  │ │
│  │  │   - REST API (/api/*)     │  │ │
│  │  │   - Static Files (/*.*)   │  │ │
│  │  └───────────────────────────┘  │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│      Supabase PostgreSQL            │
└─────────────────────────────────────┘
```

### Dockerfile (Unified)

A unified Dockerfile will be created to:

1. Build the frontend (Vite)
2. Build the backend (NestJS)
3. Copy frontend dist to backend's static serving directory
4. Serve everything from a single Node.js process

```dockerfile
# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
RUN npm ci
COPY src/ ./src/
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy backend build output
COPY --from=backend-builder --chown=nestjs:nodejs /app/dist ./dist
# IMPORTANT: Frontend must go to dist/public (runtime reads from path.join(__dirname, 'public'))
COPY --from=frontend-builder --chown=nestjs:nodejs /app/frontend/dist ./dist/public

USER nestjs
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### Azure Container App Configuration

#### Prerequisites

- Azure Container Registry (ACR) ✓ (Already exists)
- Resource Group ✓ (Already exists)
- Container Apps Environment (Create if not exists)

#### Creating Container App with Quickstart Image

You can create the Container App first with a quickstart image:

```bash
# Create Container Apps Environment (if needed)
az containerapp env create \
  --name teamified-env \
  --resource-group rg-tmf-prd-ausest \
  --location australiaeast

# Create Container App with quickstart image
# Note: Quickstart image uses port 80, we'll update to 8080 when deploying our image
az containerapp create \
  --name teamified-accounts \
  --resource-group rg-tmf-prd-ausest \
  --environment teamified-env \
  --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3
```

#### Updating with Your Image Later

> **Important:** When switching from the quickstart image to your custom image, you must also update the target port from 80 to 8080.

```bash
# Build and push your image
docker build -f Dockerfile.unified -t tmfregistryprod.azurecr.io/teamified-accounts:latest .
docker push tmfregistryprod.azurecr.io/teamified-accounts:latest

# Update Container App with new image AND correct port (8080)
az containerapp ingress update \
  --name teamified-accounts \
  --resource-group rg-tmf-prd-ausest \
  --target-port 8080

az containerapp update \
  --name teamified-accounts \
  --resource-group rg-tmf-prd-ausest \
  --image tmfregistryprod.azurecr.io/teamified-accounts:latest
```

Alternatively, update both in a single command:
```bash
az containerapp update \
  --name teamified-accounts \
  --resource-group rg-tmf-prd-ausest \
  --image tmfregistryprod.azurecr.io/teamified-accounts:latest \
  --set-env-vars "PORT=8080"
```

---

## Azure Cache for Redis

### Purpose

Redis is used for **rate limiting** via NestJS ThrottlerModule. Using Azure Cache for Redis ensures:
- Shared rate limit counters across all container instances
- Persistence across container restarts
- Correct behavior when scaling to multiple replicas

### Current Usage in Codebase

- `src/config/redis.config.ts` - Redis configuration
- `src/app.module.ts` - ThrottlerModule integration
- `src/auth/auth.module.ts` - Rate limiting on auth endpoints

### Why Redis Over In-Memory?

| Aspect | In-Memory | Redis |
|--------|-----------|-------|
| **Multi-instance** | Each container has own counter | Shared counter across instances |
| **Restart persistence** | Counters reset on restart | Counters persist |
| **Scaling** | Less effective with many replicas | Works correctly with scaling |
| **Cost** | Free | ~$16/month (Basic C0) |

**Decision:** Use Azure Cache for Redis from the start for production-ready rate limiting.

### Step 1: Create the Resource

1. Azure Portal → Create a resource → "Azure Cache for Redis"
2. Configuration:
   - **Name:** `teamified-accounts-redis`
   - **Resource Group:** `rg-tmf-prd-ausest`
   - **Location:** Australia East (same region as Container App)
   - **Cache type:** Standard C1 (with HA) ✅ Already created
   - **Connectivity:** Public endpoint

### Step 2: Get Connection Details

After creation:
1. Go to Redis resource → Settings → Access keys
2. Copy **Primary connection string**

### Step 3: Format Connection String

Azure provides (from Access keys):
```
teamified-accounts-redis.redis.cache.windows.net:6380,password=xxxxx,ssl=True,abortConnect=False
```

Convert to standard Redis URL format:
```
rediss://:YOUR_PASSWORD@teamified-accounts-redis.redis.cache.windows.net:6380
```

> **Note:** Get YOUR_PASSWORD from Azure Portal → Redis → Settings → Access keys

> Note: `rediss://` (with double 's') indicates SSL/TLS connection

### Step 4: Configure Environment Variable

Add to Azure Container App:
```bash
az containerapp update \
  --name teamified-accounts \
  --resource-group rg-tmf-prd-ausest \
  --set-env-vars "REDIS_URL=rediss://:YOUR_PASSWORD@teamified-accounts-redis.redis.cache.windows.net:6380"
```

> **Note:** Replace YOUR_PASSWORD with the actual password from Azure Portal → Redis → Access keys

The application will automatically use the Redis storage for rate limiting when `REDIS_URL` is configured.

### Fallback: In-Memory Throttling

If `REDIS_URL` is not set, the app falls back to in-memory throttling. This is useful for local development but not recommended for production with multiple replicas.

---

## Environment Variables & Secrets Management

### Strategy: Same Keys, Different Values

Both environments use identical environment variable names with different values.

### Environment Variables Comparison

| Variable | DEV (Replit) | PROD (Azure) |
|----------|--------------|--------------|
| `NODE_ENV` | `development` | `production` |
| `PORT` | `5000` | `8080` |
| `BASE_URL` | `https://teamified-accounts.replit.app` | `https://teamified-accounts.delightfulocean-ab8e789f.australiaeast.azurecontainerapps.io` (or custom domain) |
| `DATABASE_URL` | Supabase connection string | Same Supabase project |
| `JWT_SECRET` | DEV value | **Generate new value for PROD** |
| `JWT_REFRESH_SECRET` | DEV value | **Generate new value for PROD** |
| `REDIS_URL` | Replit Redis (if configured) | Azure Cache for Redis (`teamified-accounts-redis`) |
| `SESSION_SECRET` | DEV value | **Generate new value for PROD** |

### Secrets in Replit (DEV)

Managed via Replit's Secrets tool:
- Encrypted at rest and in transit
- Accessed via `process.env.SECRET_NAME`
- Available in both development and published app

Current secrets configured:
- `DATABASE_URL`, `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`, `SESSION_SECRET`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `REDIS_URL`
- `SENDGRID_API_KEY`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `OPENAI_API_KEY`
- And more...

### Secrets in Azure (PROD)

Two options:

#### Option A: Container Apps Secrets (Simpler)

```bash
az containerapp secret set \
  --name teamified-accounts \
  --resource-group rg-tmf-prd-ausest \
  --secrets "jwt-secret=YOUR_VALUE" "db-url=YOUR_VALUE"

az containerapp update \
  --name teamified-accounts \
  --resource-group rg-tmf-prd-ausest \
  --set-env-vars "JWT_SECRET=secretref:jwt-secret" "DATABASE_URL=secretref:db-url"
```

> **Note:** Replace YOUR_VALUE with actual secret values. Generate new JWT secrets for production.

#### Option B: Azure Key Vault (Enterprise)

1. Create Key Vault
2. Add secrets to vault
3. Configure Container App managed identity
4. Reference secrets from Key Vault

### Code Pattern

No code changes needed - just use `ConfigService`:

```typescript
const jwtSecret = this.configService.get('JWT_SECRET');
const databaseUrl = this.configService.get('DATABASE_URL');
```

---

## CI/CD Pipeline

### GitHub Actions (Automated Deployment)

Automatically deploy to Azure Container Apps when pushing to `main` branch.

#### Workflow Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Push to    │ ──▶ │  Build       │ ──▶ │  Push to     │ ──▶ │  Deploy to   │
│   main       │     │  Docker      │     │  ACR         │     │  Container   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

### Step 1: Create Azure Service Principal

The Service Principal allows GitHub Actions to authenticate with Azure.

Run this command in Azure CLI:

```bash
az ad sp create-for-rbac \
  --name "github-actions-teamified" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/rg-tmf-prd-ausest \
  --json-auth \
  --output json
```

> **Note:** Get YOUR_SUBSCRIPTION_ID from Azure Portal → Subscriptions

**Output example:**
```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  ...
}
```

**Copy the entire JSON output** - you'll need it for the `AZURE_CREDENTIALS` secret.

---

### Step 2: Get ACR Credentials

1. Go to Azure Portal → `tmfregistryprod` → **Settings** → **Access keys**
2. Enable **Admin user** if not already enabled
3. Copy:
   - **Login server:** `tmfregistryprod.azurecr.io`
   - **Username:** (from Access keys page)
   - **Password:** (from Access keys page)

---

### Step 3: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `AZURE_CREDENTIALS` | Entire JSON output from Step 1 |
| `ACR_LOGIN_SERVER` | `tmfregistryprod.azurecr.io` |
| `ACR_USERNAME` | From ACR Access keys |
| `ACR_PASSWORD` | From ACR Access keys |
| `AZURE_RESOURCE_GROUP` | `rg-tmf-prd-ausest` |
| `CONTAINER_APP_NAME` | `teamified-accounts` |

**GitHub Repository:** [PatonaIM/teamified-accounts](https://github.com/PatonaIM/teamified-accounts)

---

### Step 4: Create Workflow File

Create `.github/workflows/teamified-accounts-build-and-deploy.yml`:

```yaml
name: Teamified Accounts - Build & Deploy - PROD

on:
  push:
    branches: [main]
  workflow_dispatch:  # Allows manual trigger

env:
  IMAGE_NAME: teamified-accounts

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      # 1. Checkout code
      - name: Checkout code
        uses: actions/checkout@v4
      
      # 2. Login to Azure
      - name: Login to Azure
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      # 3. Login to Azure Container Registry
      - name: Login to ACR
        uses: azure/docker-login@v1
        with:
          login-server: ${{ secrets.ACR_LOGIN_SERVER }}
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}
      
      # 4. Build and push Docker image
      - name: Build and push image
        run: |
          docker build -f Dockerfile.unified \
            -t ${{ secrets.ACR_LOGIN_SERVER }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
            -t ${{ secrets.ACR_LOGIN_SERVER }}/${{ env.IMAGE_NAME }}:latest \
            .
          docker push ${{ secrets.ACR_LOGIN_SERVER }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          docker push ${{ secrets.ACR_LOGIN_SERVER }}/${{ env.IMAGE_NAME }}:latest
      
      # 5. Deploy to Azure Container Apps
      - name: Deploy to Container App
        uses: azure/container-apps-deploy-action@v1
        with:
          containerAppName: ${{ secrets.CONTAINER_APP_NAME }}
          resourceGroup: ${{ secrets.AZURE_RESOURCE_GROUP }}
          imageToDeploy: ${{ secrets.ACR_LOGIN_SERVER }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
```

---

### Workflow Triggers

| Trigger | Description |
|---------|-------------|
| `push: branches: [main]` | Auto-deploy on every push to main |
| `workflow_dispatch` | Manual trigger from GitHub Actions tab |

---

### Deployment Flow

1. Developer pushes to `main` branch
2. GitHub Actions triggers
3. Builds unified Docker image (backend + frontend)
4. Pushes image to Azure Container Registry with commit SHA tag
5. Updates Container App to use new image
6. Container App pulls new image and restarts

---

### Monitoring Deployments

- **GitHub:** Actions tab → View workflow runs
- **Azure Portal:** Container App → Revisions and replicas
- **Logs:** Container App → Log stream

---

## Domain & SSL Configuration

### Default Domain (Auto-Generated)

Azure Container Apps generates URLs with this pattern:
```
https://YOUR_APP_NAME.RANDOM_STRING.REGION.azurecontainerapps.io
```

Example:
```
https://teamified-accounts.delightfulocean-ab8e789f.australiaeast.azurecontainerapps.io
```

**The random string** (e.g., `delightfulocean-ab8e789f`) is generated by the Container Apps Environment and **cannot be removed or customized** from the default URL.

> Note: `*.azurewebsites.net` is for Azure App Service only, not Container Apps

### Solution: Add a Custom Domain

To get a clean URL like `accounts.teamified.com`, you need to add a custom domain.

#### Step 1: Add Custom Domain

**Via Azure Portal:**
1. Go to Container App → **Settings** → **Custom domains**
2. Click **Add custom domain**
3. Enter your domain (e.g., `accounts.teamified.com`)

**Via CLI:**
```bash
az containerapp hostname add \
  --name teamified-accounts \
  --resource-group rg-tmf-prd-ausest \
  --hostname accounts.teamified.com
```

#### Step 2: Configure DNS Records

Add these records at your domain provider (e.g., Cloudflare, GoDaddy):

| Type | Name | Value |
|------|------|-------|
| **CNAME** | `accounts` | `teamified-accounts.delightfulocean-ab8e789f.australiaeast.azurecontainerapps.io` |
| **TXT** | `asuid.accounts` | (Validation code from Azure Portal) |

#### Step 3: Bind Managed Certificate (Free SSL)

Azure provides free SSL certificates:

**Via Portal:**
1. After DNS validation, click **Bind**
2. Select **Managed certificate**
3. Azure will provision the certificate automatically

**Via CLI:**
```bash
az containerapp hostname bind \
  --name teamified-accounts \
  --resource-group rg-tmf-prd-ausest \
  --hostname accounts.teamified.com \
  --environment teamified-env \
  --validation-method CNAME
```

#### Step 4: Update BASE_URL

After custom domain is active, update the `BASE_URL` environment variable:
```bash
az containerapp update \
  --name teamified-accounts \
  --resource-group rg-tmf-prd-ausest \
  --set-env-vars "BASE_URL=https://accounts.teamified.com"
```

---

## Implementation Checklist

### Phase 1: Prepare Unified Dockerfile
- [ ] Create `Dockerfile.unified` combining frontend and backend
- [x] Configure NestJS to serve static files from `/public` (already done in codebase)
- [ ] Test locally with `docker build` and `docker run`

### Phase 2: Azure Resources Setup
- [x] Create Container Apps Environment ✅
- [x] Create Container App (`teamified-accounts`) ✅
- [x] Set up Azure Cache for Redis (`teamified-accounts-redis`) ✅
- [x] Configure secrets/environment variables ✅

### Phase 3: Initial Deployment
- [ ] Push unified image to ACR (`tmfregistryprod.azurecr.io`)
- [ ] Update Container App with your image
- [ ] Verify application functionality
- [ ] Configure custom domain (separate team handling)

### Phase 4: CI/CD Pipeline
- [ ] Create GitHub Actions workflow (`.github/workflows/teamified-accounts-build-and-deploy.yml`)
- [ ] Configure Azure credentials in GitHub secrets
- [ ] Test automated deployment
- [ ] Set up branch protection rules (optional)

### Phase 5: Monitoring & Operations
- [ ] Configure Azure Monitor alerts
- [ ] Set up log analytics
- [ ] Document runbooks for common operations

---

## Appendix

### Useful Azure CLI Commands

```bash
# List Container Apps
az containerapp list --resource-group rg-tmf-prd-ausest

# View logs
az containerapp logs show --name teamified-accounts --resource-group rg-tmf-prd-ausest

# Scale replicas
az containerapp update --name teamified-accounts --resource-group rg-tmf-prd-ausest --min-replicas 2 --max-replicas 5

# View secrets
az containerapp secret list --name teamified-accounts --resource-group rg-tmf-prd-ausest

# Restart Container App (replace REVISION_NAME with actual revision)
az containerapp revision restart --name teamified-accounts --resource-group rg-tmf-prd-ausest --revision REVISION_NAME
```

### Cost Estimates (Monthly)

| Resource | Tier | Estimated Cost |
|----------|------|----------------|
| Container Apps | Consumption (1 vCPU, 2GB) | ~$20-40 |
| Azure Cache for Redis | Standard C1 | ~$50 |
| Container Registry | Basic | ~$5 |
| **Total** | | **~$75-95/month** |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | Agent | Initial planning document |
