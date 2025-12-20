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
  --resource-group YOUR_RESOURCE_GROUP \
  --location australiaeast

# Create Container App with quickstart image
# Note: Quickstart image uses port 80, we'll update to 8080 when deploying our image
az containerapp create \
  --name teamified-accounts \
  --resource-group YOUR_RESOURCE_GROUP \
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
docker build -f Dockerfile.unified -t YOUR_ACR.azurecr.io/teamified-accounts:latest .
docker push YOUR_ACR.azurecr.io/teamified-accounts:latest

# Update Container App with new image AND correct port (8080)
az containerapp ingress update \
  --name teamified-accounts \
  --resource-group YOUR_RESOURCE_GROUP \
  --target-port 8080

az containerapp update \
  --name teamified-accounts \
  --resource-group YOUR_RESOURCE_GROUP \
  --image YOUR_ACR.azurecr.io/teamified-accounts:latest
```

Alternatively, update both in a single command:
```bash
az containerapp update \
  --name teamified-accounts \
  --resource-group YOUR_RESOURCE_GROUP \
  --image YOUR_ACR.azurecr.io/teamified-accounts:latest \
  --set-env-vars "PORT=8080"
```

---

## Azure Cache for Redis

### Purpose

Redis is used for **rate limiting** via NestJS ThrottlerModule.

### Current Usage in Codebase

- `src/config/redis.config.ts` - Redis configuration
- `src/app.module.ts` - ThrottlerModule integration
- `src/auth/auth.module.ts` - Rate limiting on auth endpoints

### Azure Cache for Redis Setup

#### Step 1: Create the Resource

1. Azure Portal → Create a resource → "Azure Cache for Redis"
2. Configuration:
   - **Name:** `teamified-redis`
   - **Resource Group:** Your existing resource group
   - **Location:** Same region as Container App
   - **Cache type:** Basic C0 (~$16/month) or Standard C0 (~$50/month for HA)
   - **Connectivity:** Public endpoint (simpler setup)

#### Step 2: Get Connection Details

After creation:
1. Go to Redis resource → Settings → Access keys
2. Copy **Primary connection string**

#### Step 3: Format Connection String

Azure provides:
```
teamified-redis.redis.cache.windows.net:6380,password=xxxxx,ssl=True,abortConnect=False
```

Convert to standard Redis URL:
```
rediss://:YOUR_PASSWORD@teamified-redis.redis.cache.windows.net:6380
```

> Note: `rediss://` (with double 's') indicates SSL/TLS connection

#### Step 4: Configure Environment Variable

Add to Azure Container App:
```
REDIS_URL=rediss://:YOUR_PASSWORD@teamified-redis.redis.cache.windows.net:6380
```

### Alternative: In-Memory Throttling

If Redis is not critical, the app can fall back to in-memory throttling:

```typescript
// In ThrottlerModule config
ThrottlerModule.forRoot({
  ttl: 60,
  limit: 10,
  // No storage specified = in-memory
})
```

---

## Environment Variables & Secrets Management

### Strategy: Same Keys, Different Values

Both environments use identical environment variable names with different values.

### Environment Variables Comparison

| Variable | DEV (Replit) | PROD (Azure) |
|----------|--------------|--------------|
| `NODE_ENV` | `development` | `production` |
| `PORT` | `5000` | `8080` |
| `BASE_URL` | `https://teamified-accounts.replit.app` | `https://your-domain.com` |
| `DATABASE_URL` | Supabase connection string | Same or different Supabase project |
| `JWT_SECRET` | DEV value | Different PROD value |
| `JWT_REFRESH_SECRET` | DEV value | Different PROD value |
| `REDIS_URL` | Replit Redis (if any) | Azure Cache for Redis |
| `SESSION_SECRET` | DEV value | Different PROD value |

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
  --resource-group YOUR_RESOURCE_GROUP \
  --secrets "jwt-secret=YOUR_VALUE" "db-url=YOUR_VALUE"

az containerapp update \
  --name teamified-accounts \
  --resource-group YOUR_RESOURCE_GROUP \
  --set-env-vars "JWT_SECRET=secretref:jwt-secret" "DATABASE_URL=secretref:db-url"
```

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

### Recommended: GitHub Actions

#### Workflow Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Push to    │ ──▶ │  Build &     │ ──▶ │   Deploy     │
│   main/prod  │     │  Test        │     │   to Azure   │
└──────────────┘     └──────────────┘     └──────────────┘
```

#### Sample Workflow (.github/workflows/deploy.yml)

```yaml
name: Deploy to Azure Container Apps

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AZURE_CONTAINER_REGISTRY: YOUR_ACR.azurecr.io
  IMAGE_NAME: teamified-accounts
  RESOURCE_GROUP: YOUR_RESOURCE_GROUP
  CONTAINER_APP_NAME: teamified-accounts

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Login to ACR
        run: az acr login --name YOUR_ACR
      
      - name: Build and push image
        run: |
          docker build -f Dockerfile.unified -t ${{ env.AZURE_CONTAINER_REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} .
          docker push ${{ env.AZURE_CONTAINER_REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
      
      - name: Deploy to Container App
        run: |
          az containerapp update \
            --name ${{ env.CONTAINER_APP_NAME }} \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --image ${{ env.AZURE_CONTAINER_REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
```

---

## Domain & SSL Configuration

### Default Domain

Azure Container Apps provides:
```
https://YOUR_APP_NAME.azurecontainerapps.io
```

> Note: `*.azurewebsites.net` is for Azure App Service only, not Container Apps

### Custom Domain Setup

#### Step 1: Add Custom Domain

```bash
az containerapp hostname add \
  --name teamified-accounts \
  --resource-group YOUR_RESOURCE_GROUP \
  --hostname your-domain.com
```

#### Step 2: Configure DNS

Add CNAME or A record pointing to the Container App:
- **CNAME:** `your-domain.com` → `YOUR_APP_NAME.azurecontainerapps.io`

#### Step 3: Enable Managed Certificate (Free SSL)

```bash
az containerapp hostname bind \
  --name teamified-accounts \
  --resource-group YOUR_RESOURCE_GROUP \
  --hostname your-domain.com \
  --environment teamified-env \
  --validation-method CNAME
```

---

## Implementation Checklist

### Phase 1: Prepare Unified Dockerfile
- [ ] Create `Dockerfile.unified` combining frontend and backend
- [ ] Configure NestJS to serve static files from `/public`
- [ ] Test locally with `docker build` and `docker run`

### Phase 2: Azure Resources Setup
- [ ] Create Container Apps Environment
- [ ] Create Container App with quickstart image
- [ ] Set up Azure Cache for Redis
- [ ] Configure secrets/environment variables

### Phase 3: Initial Deployment
- [ ] Push unified image to ACR
- [ ] Update Container App with your image
- [ ] Verify application functionality
- [ ] Configure custom domain (optional)

### Phase 4: CI/CD Pipeline
- [ ] Create GitHub Actions workflow
- [ ] Configure Azure credentials in GitHub secrets
- [ ] Test automated deployment
- [ ] Set up branch protection rules

### Phase 5: Monitoring & Operations
- [ ] Configure Azure Monitor alerts
- [ ] Set up log analytics
- [ ] Document runbooks for common operations

---

## Appendix

### Useful Azure CLI Commands

```bash
# List Container Apps
az containerapp list --resource-group YOUR_RESOURCE_GROUP

# View logs
az containerapp logs show --name teamified-accounts --resource-group YOUR_RESOURCE_GROUP

# Scale replicas
az containerapp update --name teamified-accounts --resource-group YOUR_RESOURCE_GROUP --min-replicas 2 --max-replicas 5

# View secrets
az containerapp secret list --name teamified-accounts --resource-group YOUR_RESOURCE_GROUP

# Restart Container App
az containerapp revision restart --name teamified-accounts --resource-group YOUR_RESOURCE_GROUP --revision REVISION_NAME
```

### Cost Estimates (Monthly)

| Resource | Tier | Estimated Cost |
|----------|------|----------------|
| Container Apps | Consumption (1 vCPU, 2GB) | ~$20-40 |
| Azure Cache for Redis | Basic C0 | ~$16 |
| Container Registry | Basic | ~$5 |
| **Total** | | **~$40-60/month** |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | Agent | Initial planning document |
