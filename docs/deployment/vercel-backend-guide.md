# Vercel Backend & Database Deployment Guide

## 🎯 CRITICAL SUCCESS FACTORS (Updated Oct 2025)

**✅ VERIFIED WORKING CONFIGURATION**

After extensive testing, the following configuration is **REQUIRED** for NestJS to work on Vercel serverless:

### 1. Proper Handler Export Pattern
```typescript
// WRONG - Will fail with timeouts
export default bootstrap;

// CORRECT - Works on Vercel
let cachedApp: any = null;

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  return cachedApp(req, res);
}
```

### 2. No `app.listen()` in Production
```typescript
// In bootstrap function:
if (process.env.NODE_ENV === 'production') {
  await app.init();  // Don't call listen()
  return app.getHttpAdapter().getInstance();
} else {
  await app.listen(port);  // Only in development
}
```

### 3. Optimized Database Settings
```typescript
// database.config.ts
extra: {
  connectionLimit: 5,  // Reduced for serverless
  acquireTimeoutMillis: 10000,
  timeout: 10000,
  max: 5,
  idleTimeoutMillis: 30000,
}
```

### Performance Metrics
- **Cold Start:** 3-5 seconds (full app with TypeORM + 20 modules)
- **Warm Start:** <100ms (cached app instance)
- **Database Connection:** ~200ms (after first connection)
- **Redis Connection:** ~600ms (after first connection)

---

## 📋 Overview

This guide covers deploying the Teamified NestJS backend and PostgreSQL database to Vercel, including the complete job application integration system with Workable ATS.

## 🏗️ Architecture

```
Vercel Backend Deployment
├── NestJS API (Serverless Functions)
├── PostgreSQL (Vercel Postgres)
├── Redis (Vercel KV)
├── File Storage (Vercel Blob)
├── Workable ATS Integration
└── Authentication & Authorization
```

## 🚀 Prerequisites

- Vercel account with Pro plan (required for database features)
- GitHub repository with backend code
- Workable ATS account with API access
- Domain name (optional, for custom domains)

## 📦 Step 1: Prepare Backend for Vercel

### 1.1 Update Package.json

```json
{
  "name": "teamified-backend",
  "version": "1.0.0",
  "scripts": {
    "build": "nest build",
    "start": "node dist/main",
    "start:prod": "node dist/main",
    "vercel-build": "npm run build"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### 1.2 Create Vercel Configuration

Create `vercel.json` in the project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["dist/**"]
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/src/main.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/src/main.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "src/main.ts": {
      "maxDuration": 30
    }
  }
}
```

### 1.3 Update Main.ts for Vercel

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for Vercel
  app.enableCors({
    origin: [
      'https://your-frontend-domain.vercel.app',
      'http://localhost:5173', // Development
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Set global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
}

// For Vercel serverless
export default bootstrap;
```

## 🗄️ Step 2: Set Up Vercel Postgres Database

### 2.1 Create Vercel Postgres Database

1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to "Storage" tab
4. Click "Create Database" → "Postgres"
5. Choose a name: `teamified-db`
6. Select region closest to your users

### 2.2 Update Database Configuration

Create `src/config/database.config.ts`:

```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  extra: {
    connectionLimit: 10,
  },
};
```

### 2.3 Update App Module

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    // ... other modules
  ],
})
export class AppModule {}
```

## 🔄 Step 3: Set Up Vercel KV (Redis)

### 3.1 Create Vercel KV Store

1. In Vercel dashboard, go to "Storage"
2. Click "Create Database" → "KV"
3. Name: `teamified-kv`
4. Select region

### 3.2 Update Redis Configuration

```typescript
// src/config/redis.config.ts
export const redisConfig = {
  url: process.env.KV_URL,
  token: process.env.KV_REST_API_TOKEN,
};
```

## 📁 Step 4: Set Up Vercel Blob Storage

### 4.1 Create Blob Storage

1. In Vercel dashboard, go to "Storage"
2. Click "Create Database" → "Blob"
3. Name: `teamified-blob`

### 4.2 Update Storage Service

```typescript
// src/documents/services/storage.service.ts
import { Injectable } from '@nestjs/common';
import { put, del } from '@vercel/blob';

@Injectable()
export class StorageService {
  async uploadCV(
    ownerId: string,
    versionId: string,
    file: Buffer,
    fileName: string,
    contentType: string,
    userType: 'candidate' | 'eor' = 'eor',
  ): Promise<UploadResult> {
    const pathPrefix = userType === 'candidate' ? 'cvs/users' : 'cvs/eor-profiles';
    const filePath = `${pathPrefix}/${ownerId}/${versionId}`;
    
    const blob = await put(filePath, file, {
      access: 'public',
      contentType,
    });

    return {
      filePath: blob.url,
      sha256Checksum: this.generateChecksum(file),
      fileSize: file.length,
    };
  }

  async generateSignedUrl(filePath: string): Promise<SignedUrlResult> {
    // Vercel Blob URLs are already signed
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    return {
      downloadUrl: filePath,
      expiresAt,
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    await del(filePath);
  }
}
```

## 🔐 Step 5: Environment Variables

### 5.1 Required Environment Variables

Set these in Vercel dashboard → Project Settings → Environment Variables:

```bash
# Database
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# Redis
KV_URL=redis://...
KV_REST_API_TOKEN=...

# Blob Storage
BLOB_READ_WRITE_TOKEN=...

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Workable ATS
WORKABLE_SUBDOMAIN=yourcompany
WORKABLE_API_TOKEN=your-workable-token

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# CORS
FRONTEND_URL=https://your-frontend.vercel.app
```

### 5.2 Environment-Specific Variables

```bash
# Production
NODE_ENV=production
API_BASE_URL=https://your-backend.vercel.app

# Development
NODE_ENV=development
API_BASE_URL=http://localhost:3000
```

## 🚀 Step 6: Deploy to Vercel

### 6.1 Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Set root directory: `/` (for backend)
5. Framework: Other

### 6.2 Configure Build Settings

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run start:dev"
}
```

### 6.3 Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## 🗃️ Step 7: Database Migration

### 7.1 Set Up Database Schema

The project uses SQL-based database setup (not TypeORM migrations):

```bash
# Option 1: Using Vercel Dashboard
# 1. Go to Vercel Dashboard → Your Project → Storage → Postgres
# 2. Open the database editor
# 3. Copy and run the contents of init-db.sql

# Option 2: Using external tool
# Connect to your Vercel Postgres database and run:
psql $POSTGRES_URL -f init-db.sql
```

### 7.2 Seed Database

The project provides two separate seeding scripts:

#### **Production Seeding** (✅ Safe for Production)

```bash
# Seed production data only:
# - Countries (India, Philippines, Australia)
# - Currencies (INR, PHP, AUD, USD)
# - Tax years and configurations
# - Payroll components (salary & statutory)
# - Exchange rates
# - One admin user (admin@teamified.com)

npm run seed:prod
# OR
node scripts/seed-database-production.js
```

**Default Admin Credentials:**
- Email: `admin@teamified.com`
- Password: `Admin123!`
- ⚠️ **IMPORTANT:** Change this password immediately after first login!

#### **Development Seeding** (⚠️ Development Only)

```bash
# Seed comprehensive test data:
# - All production data PLUS
# - 25 test users
# - 3 test clients
# - Employment records
# - Salary history
# - Timesheets & leave requests
# - Payslips & tax documents

npm run seed:dev
# OR
node scripts/seed-database-development.js
```

**⚠️ DO NOT run development seed in production!**

#### Running Seeds on Vercel

To seed the Vercel production database:

```bash
# Option 1: Via API endpoint (if SeedModule is enabled)
curl -X POST https://your-backend.vercel.app/api/v1/seed/database

# Option 2: Connect directly to Vercel Postgres
# Get POSTGRES_URL from Vercel dashboard
POSTGRES_URL="your-postgres-url" npm run seed:prod
```

## 🔧 Step 8: Configure Workable Integration

### 8.1 Workable API Setup

1. Log into your Workable account
2. Go to Settings → API
3. Create new API token with scopes:
   - `r_jobs` (read jobs)
   - `w_candidates` (write candidates)
4. Add token to Vercel environment variables

### 8.2 Test Workable Integration

```bash
# Test API endpoint
curl https://your-backend.vercel.app/api/v1/workable/jobs
```

## 📊 Step 9: Monitoring & Analytics

### 9.1 Vercel Analytics

1. Enable Vercel Analytics in dashboard
2. Monitor function execution times
3. Set up alerts for errors

### 9.2 Database Monitoring

1. Monitor Postgres usage in Vercel dashboard
2. Set up alerts for high usage
3. Monitor KV store performance

## 🧪 Step 10: Testing

### 10.1 API Testing

```bash
# Test health endpoint
curl https://your-backend.vercel.app/api/health

# Test authentication
curl -X POST https://your-backend.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'

# Test CV upload
curl -X POST https://your-backend.vercel.app/api/v1/users/me/profile/cv \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test-cv.pdf"
```

### 10.2 Database Testing

```bash
# Test database connection
curl https://your-backend.vercel.app/api/health/detailed
```

## 🚨 Troubleshooting

### Common Issues

1. **Function Timeout**
   - Increase `maxDuration` in vercel.json
   - Optimize database queries

2. **Database Connection Issues**
   - Check `POSTGRES_URL` environment variable
   - Verify SSL configuration

3. **File Upload Issues**
   - Check Blob storage configuration
   - Verify file size limits

4. **CORS Issues**
   - Update CORS configuration in main.ts
   - Check frontend URL in environment variables

### Debug Commands

```bash
# Check Vercel logs
vercel logs

# Check function logs
vercel logs --follow

# Test locally with Vercel environment
vercel env pull .env.local
npm run start:dev
```

## 📈 Performance Optimization

### 1. Database Optimization

```typescript
// Add database indexes
@Entity()
export class Document {
  @Index()
  @Column()
  userId: string;

  @Index()
  @Column()
  documentType: DocumentType;
}
```

### 2. Caching Strategy

```typescript
// Use Redis for caching
@Injectable()
export class CacheService {
  async get(key: string) {
    return await this.redis.get(key);
  }

  async set(key: string, value: any, ttl: number = 3600) {
    return await this.redis.setex(key, ttl, JSON.stringify(value));
  }
}
```

### 3. Function Optimization

```typescript
// Optimize imports
import { Injectable } from '@nestjs/common';

// Use connection pooling
const dbConfig = {
  extra: {
    connectionLimit: 10,
    acquireTimeoutMillis: 30000,
    timeout: 20000,
  },
};
```

## 🔒 Security Considerations

### 1. Environment Variables

- Never commit `.env` files
- Use Vercel's environment variable encryption
- Rotate secrets regularly

### 2. Database Security

- Use SSL connections
- Implement row-level security
- Regular security audits

### 3. API Security

- Rate limiting
- Input validation
- JWT token expiration
- CORS configuration

## 📋 Deployment Checklist

- [ ] Repository connected to Vercel
- [ ] Environment variables configured
- [ ] Database created and configured
- [ ] Redis KV store set up
- [ ] Blob storage configured
- [ ] Workable API integration tested
- [ ] Migrations run successfully
- [ ] Database seeded
- [ ] API endpoints tested
- [ ] CORS configured correctly
- [ ] Monitoring set up
- [ ] Performance optimized

## 🎯 Next Steps

1. **Set up CI/CD pipeline** for automated deployments
2. **Configure custom domain** for production
3. **Set up monitoring and alerting**
4. **Implement backup strategies**
5. **Plan for scaling** as user base grows

## 📞 Support

- [Vercel Documentation](https://vercel.com/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [PostgreSQL on Vercel](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)

---

**Last Updated:** 2025-01-18  
**Version:** 1.0  
**Author:** James (Full Stack Developer)
