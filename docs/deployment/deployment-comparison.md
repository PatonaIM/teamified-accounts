# Deployment Comparison: Development vs Production

## Overview
This document compares the development and production deployment configurations for the Teamified Portal.

## Recent Changes (Latest Update)
**Development Environment Migration**: The development environment has been migrated to use a production-like nginx setup to better mirror the production deployment and resolve static assets issues.

## Seed Script Used
**Script Executed**: `scripts/seed-database-enhanced.js`
- **Data Generated**: 25 users, 25 employment records, 5 clients
- **Features**: Comprehensive test data with realistic profile data, employment records, and user roles
- **Database Issues**: The script expected certain columns that were missing from the database schema

## Key Differences

### 1. Docker Compose Files

#### Development (`docker-compose.dev.yml`) - **UPDATED**
- **Container Names**: `*_dev` suffix (e.g., `teamified_postgres_dev`)
- **Volumes**: Separate dev volumes (`postgres_data_dev`, `redis_data_dev`)
- **Network**: `teamified_network_dev` with subnet `172.21.0.0/16`
- **Architecture**: **Production-like setup with nginx reverse proxy**
- **Frontend**: Uses production Dockerfile (`frontend/Dockerfile`) with nginx
- **Backend**: Uses production Dockerfile (`Dockerfile.backend`) with compiled code
- **Nginx**: Reverse proxy service added for production-like behavior
- **Environment**: `NODE_ENV=development` (but with production-like infrastructure)

#### Production (`docker-compose.yml`)
- **Container Names**: No suffix (e.g., `teamified_postgres`)
- **Volumes**: Production volumes (`postgres_data`, `redis_data`)
- **Network**: `teamified_network` with subnet `172.20.0.0/16`
- **Static Build**: Pre-built images, no volume mounts
- **Environment**: `NODE_ENV=production`
- **Nginx**: Reverse proxy service (same as dev now)

### 2. Backend Dockerfiles

#### Development - **UPDATED**
- **Dockerfile Used**: `Dockerfile.backend` (production Dockerfile)
- **Base Image**: `node:18-alpine` (multi-stage build)
- **Build Process**: Full build with `npm run build`
- **Command**: `node dist/main.js` (compiled JavaScript)
- **Dependencies**: Only production dependencies in final stage
- **Security**: Non-root user (`nestjs`), proper permissions
- **Health Check**: Built-in health check endpoint

#### Production (`Dockerfile.backend`)
- **Base Image**: `node:18-alpine` (multi-stage build)
- **Build Process**: Full build with `npm run build`
- **Command**: `node dist/main.js` (compiled JavaScript)
- **Dependencies**: Only production dependencies in final stage
- **Security**: Non-root user (`nestjs`), proper permissions
- **Health Check**: Built-in health check endpoint

### 3. Frontend Dockerfiles

#### Development - **UPDATED**
- **Dockerfile Used**: `frontend/Dockerfile` (production Dockerfile)
- **Base Image**: `node:20-alpine` (builder) + `nginx:alpine` (production)
- **Build Process**: Full build with `npm run build`
- **Web Server**: Nginx serving static files
- **Port**: 80 (Nginx)
- **Security**: Non-root user (`nginx`), proper permissions
- **Health Check**: Built-in health check
- **Nginx Config**: `nginx-frontend.conf` (simplified for static file serving)

#### Production (`frontend/Dockerfile`)
- **Base Image**: `node:20-alpine` (builder) + `nginx:alpine` (production)
- **Build Process**: Full build with `npm run build`
- **Web Server**: Nginx serving static files
- **Port**: 80 (Nginx)
- **Security**: Non-root user (`nginx`), proper permissions
- **Health Check**: Built-in health check
- **Nginx Config**: `nginx.conf` (full configuration with API proxying)

### 4. Nginx Configuration

#### Development - **NEW**
- **Main Nginx**: `frontend/nginx.conf` (reverse proxy with API proxying)
- **Frontend Nginx**: `frontend/nginx-frontend.conf` (static file serving only)
- **Architecture**: Two-tier nginx setup
  - Main nginx: Handles routing, API proxying, rate limiting
  - Frontend nginx: Serves static files only
- **Static Assets**: Properly served with correct MIME types
- **API Proxying**: Backend API calls routed through main nginx

#### Production
- **Main Nginx**: `frontend/nginx.conf` (reverse proxy with API proxying)
- **Frontend Nginx**: `frontend/nginx-frontend.conf` (static file serving only)
- **Architecture**: Same two-tier nginx setup as development
- **Static Assets**: Properly served with correct MIME types
- **API Proxying**: Backend API calls routed through main nginx

### 5. Environment Variables

#### Development - **UPDATED**
```bash
NODE_ENV=development
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=teamified_portal
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_password
JWT_SECRET=dev-jwt-secret-key
JWT_REFRESH_SECRET=dev-refresh-secret-key
PORT=3000
FRONTEND_URL=http://localhost
VITE_API_BASE_URL=http://localhost/api
```

#### Production
```bash
NODE_ENV=production
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=teamified_portal
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_password
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
PORT=3000
FRONTEND_URL=http://localhost
VITE_API_BASE_URL=http://localhost/api
```

### 6. Port Configuration

#### Development - **UPDATED**
- **Frontend**: 80 (Nginx) - **Changed from 5173**
- **Backend**: 3000 (NestJS)
- **Database**: 5432
- **Redis**: 6379
- **Nginx**: 80 (HTTP), 8080 (HTTP)

#### Production
- **Frontend**: 80 (Nginx)
- **Backend**: 3000 (NestJS)
- **Database**: 5432
- **Redis**: 6379
- **Nginx**: 443 (HTTPS), 8080 (HTTP)

### 7. Database Schema Issues

#### Problem Identified
The `clients` table was missing several columns that the backend entity expected:
- `contact_info` (jsonb)
- `status` (varchar)
- `migrated_from_zoho` (boolean)
- `zoho_client_id` (varchar)

#### Solution Applied
```sql
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_info jsonb;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS status character varying(20) NOT NULL DEFAULT 'active';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS migrated_from_zoho boolean NOT NULL DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS zoho_client_id character varying(100);
```

### 8. Static Assets Issues - **RESOLVED**

#### Problem Identified
- **404 Errors**: JavaScript and CSS assets returning 404
- **MIME Type Issues**: CSS files served as HTML instead of CSS
- **Root Cause**: Frontend container using wrong nginx configuration

#### Solution Applied
1. **Created Separate nginx Config**: `frontend/nginx-frontend.conf` for static file serving only
2. **Updated Frontend Dockerfile**: Modified to use the new simple nginx configuration
3. **Rebuilt Frontend Container**: Applied the correct configuration
4. **Result**: All static assets now load correctly with proper MIME types

### 9. Deployment Scripts

#### Development (`deploy-dev.sh`) - **UPDATED**
- Uses `docker-compose.dev.yml`
- **Full build process** (now matches production)
- **Production-like infrastructure** with nginx
- Separate dev volumes and networks
- **No hot reload** (uses compiled code like production)

#### Production (`deploy.sh`)
- Uses `docker-compose.yml`
- Full build process
- Production optimizations
- Health checks and proper signal handling

## Key Benefits of Development Migration

1. **Production Parity**: Development environment now mirrors production setup
2. **Static Assets**: Properly served with correct MIME types
3. **Nginx Configuration**: Same routing and proxying behavior as production
4. **Debugging**: Easier to debug production-like issues in development
5. **Deployment Confidence**: Higher confidence in production deployments

## Recommendations for Production Deployment

1. **Database Schema**: Ensure all required columns exist before running seed scripts
2. **Environment Variables**: Update JWT secrets and other sensitive values
3. **SSL/TLS**: Configure proper SSL certificates for production
4. **Monitoring**: Add proper logging and monitoring
5. **Backup**: Implement database backup strategies
6. **Security**: Review and harden security configurations

## Current Status

✅ **Development Environment**: Fully functional with production-like setup
✅ **Database Schema**: Fixed and working
✅ **API Endpoints**: All working correctly
✅ **Frontend**: All pages loading without errors
✅ **Static Assets**: JavaScript and CSS loading correctly
✅ **Nginx Configuration**: Properly configured for both dev and production
✅ **Seed Data**: 25 users, 25 employment records, 5 clients
✅ **Login Functionality**: Working with test credentials

## Test Credentials

- **Admin**: `user1@teamified.com` / `Admin123!`
- **Timesheet Approver**: `user3@teamified.com` / `Approver123!`
- **EOR**: `user6@teamified.com` / `EOR123!`
- **Candidate**: `user9@teamified.com` / `Candidate123!`

The development environment is now fully functional with a production-like setup, making it easier to identify and resolve issues before production deployment.