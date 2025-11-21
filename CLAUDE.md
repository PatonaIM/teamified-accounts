# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Current Work Context
<!-- Auto-generated from story extraction - Last updated: 2025-10-22 -->

**Epic**: Epic 6 eor onboarding (`docs/prd/epic-6-eor-onboarding.md`)
**Story**: Story 6.5 - Story (`docs/stories/6.5.story.md`)
**Status**: Draft

**User Story**:
As an HR manager, I want a centralized dashboard to review candidate onboarding submissions with per-category document verification, so that I can efficiently approve/reject documents, request changes, and maintain compliance before granting EOR role.

**Top Priority ACs**:
1. Centralized Dashboard View all candidates in `onboarding` status with submission progress indicators
2. Per-Category Checklist Display document counts and verification status for each category (Profile, CVs, Identity, Employment, Education)
3. Document Review View uploaded documents with metadata (filename, size, upload date, status)
4. Verification Actions Approve/Reject/Request-Changes with mandatory comment field
5. Status Transitions Mark documents as Verified (approved) or Needs Changes with HR notes

**Current Tasks**:
- [ ] Task 1: HR Dashboard Page
- [ ] Task 2: Document Review Modal
- [ ] Task 3: Backend Verification Endpoints
- [ ] Task 4: Verified Lock Implementation
- [ ] Task 5: Bulk Verification Actions
- [ ] Task 6: Verification Revocation
- [ ] Task 7: Audit Logging Enhancement
- [ ] Task 8: HR Dashboard Data Service
- [ ] Task 9: UI Components
- [ ] Task 10: RBAC Enforcement
- [ ] Task 11: Notification Triggers (Story 6.6 dependency)
- [ ] Task 12: Testing
- [ ] Task 13: Documentation

**Key Context**:
### Previous Story Insights

From Stories 6.1-6.4:

📖 **Full Story**: `docs/stories/6.5.story.md` (complete AC, all tasks, testing standards)

---

## Documentation Structure

**BMad-Generated Docs**:
- **PRD**: `docs/prd.md` - Full product requirements (sharded from BMad planning)
- **Epics**: `docs/prd/epic-X-name.md` - Epic documentation with stories
- **Stories**: `docs/stories/X.X.story.md` - Detailed story documents (BMad template)
- **Archive**: `docs/stories/archive/` - Completed stories

**Story Workflow**:
1. BMad Scrum Master creates story → `docs/stories/X.X.story.md`
2. Extract context: `npm run story:extract X.X` (updates "Current Work Context" above)
3. Develop with full story details available in story file
4. Complete: `npm run story:complete X.X` (updates Dev Agent Record in story)
5. QA Agent reviews and fills QA Results section

---

## Commands Quick Ref

**Dev**: `npm run start:dev` | `cd frontend && npm run dev`
**Build**: `npm run build` | `cd frontend && npm run build`
**Test**: `npm run test` | `npx playwright test` | `cd frontend && npm run test`
**DB**: `docker-compose up -d` → `./scripts/setup-database.sh` | `npm run seed:db`
**Validate**: `npm run validate:all` | `npm run lint`
**Story Tools**: `npm run story:extract <num>` | `npm run story:complete <num>`

**URLs**: Frontend http://localhost:5173 | API http://localhost:3000/api | Docs http://localhost:3000/api/docs

**Test Accounts** (after `./scripts/setup-database.sh`):
- `admin@teamified.com` / `Admin123!` (admin)
- `hr@teamified.com` / `HRManager123!` (admin)
- `john.doe@example.com` / `EORUser123!` (eor)

---

## Quick Architecture Reference

### Stack Overview
| Layer | Technology | Key Patterns |
|-------|------------|--------------|
| **Backend** | NestJS 10 + PostgreSQL 15 + TypeORM | Modules, Controllers at `v1/*`, Guards from `common/guards/` |
| **Frontend** | React 19 + MUI v7 + Vite + Router v7 | Context API, Protected routes, Axios interceptors |
| **Database** | PostgreSQL + Audit logs | RBAC, Immutable salary history, Document metadata |
| **Design** | MUI 3 Expressive | Purple #A16AE8, Blue #8096FD, Plus Jakarta Sans |

### Module Quick Reference
**Backend**: auth, users, user-roles, employment-records, salary-history, clients, invitations, documents, profiles, audit, common
**Frontend**: components/, pages/, hooks/ (useAuth, useRoleBasedNavigation), services/, types/, theme/

### Critical Patterns
- **API Prefix**: Set globally (`/api`) → Use `@Controller('v1/feature')` NOT `'api/v1/...'`
- **Guards**: Import from `../../common/guards/` (JwtAuthGuard, RolesGuard)
- **Decorators**: Import from `../../common/decorators/` (Roles, GetUser)
- **Auth**: Always import `AuthModule` in feature modules using guards
- **Validation**: Use `@IsNumber()` for decimals | Convert dates: `new Date(dto.dateString)`

---

## Development Guidelines

### Controller Standards
- **Global Prefix**: `/api` set in `main.ts` via `app.setGlobalPrefix('api')`
- **Controllers**: Use `@Controller('v1/feature-name')` NOT `@Controller('api/v1/...')`
- **Final URLs**: Results in `/api/v1/feature-name` endpoints
- **Auth Module**: Always import `AuthModule` in feature modules using guards
- **Guards**: Import from `../../common/guards/` NOT `../../auth/guards/`

### Database Development
- Use TypeORM with entities in `entities/` subdirectories
- Generate migrations for schema changes
- Audit logging automatically handled for tracked entities
- **Database scripts**:
  - `init-db.sql` - Schema initialization (runs automatically in Docker)
  - `scripts/seed-database.js` - Test data (25+ users, employment records, salary history)
  - `./scripts/setup-database.sh` - Combined init + seed (essential after first Docker run)

### Testing
- **Backend**: Jest (unit/integration tests)
- **Frontend**: Vitest (unit) + Playwright (E2E)
- **E2E**: Playwright configured for login flows, Swagger UI, API testing

---

## Setup

### Prerequisites
- Node.js 18+
- Docker and Docker Compose

### Local Development Setup
1. Clone repository
2. `docker-compose up -d`
3. `./scripts/setup-database.sh` (essential for proper DB schema)
4. Backend: `npm run start:dev`
5. Frontend: `cd frontend && npm run dev`

---

## Deployment

### Local Development
```bash
docker-compose up -d
./scripts/setup-database.sh
npm run start:dev
cd frontend && npm run dev
```

### Vercel Production

**Frontend** (`cd frontend && vercel --prod`):
- Auto-detects Vite framework
- Set `VITE_API_URL` environment variable
- SPA routing configured in `frontend/vercel.json`

**Backend** (`./scripts/deploy-vercel.sh --backend`):
- Requires Vercel Pro (for Postgres/KV/Blob storage)
- Serverless NestJS configuration in `vercel-backend.json`
- Performance: Cold start 3-5s, Warm <100ms

**Database Setup**:
1. Create Vercel Postgres/KV/Blob in dashboard
2. Run `init-db.sql` in Postgres editor
3. Seed: `npm run seed:prod` (production) or `npm run seed:dev` (development)

**Default Admin**: `admin@teamified.com` / `Admin123!` (⚠️ change after first login)

**Detailed Guides**: See `docs/deployment/vercel-*.md` (8 comprehensive guides)

**Common Issues**:
- **CORS**: Add domain to `src/main.ts` CORS config
- **404 on refresh**: `vercel.json` rewrites already configured
- **Env vars**: Use `VITE_` prefix for frontend
- **Backend timeout**: Increase `maxDuration` in `vercel-backend.json`

---

## Troubleshooting

### Common Issues
- **Route 404s**: Use `@Controller('v1/feature')` NOT `@Controller('api/v1/...')` (global `/api` prefix in main.ts)
- **Auth Dependencies**: Import `AuthModule` in feature modules using guards
- **Database**: Run `./scripts/setup-database.sh` after initial Docker setup
- **Validation**: Use `@IsNumber()` for numeric fields, convert dates properly

### Reset Environment
```bash
docker-compose down -v
docker-compose up -d --build
./scripts/setup-database.sh
```

---

**Quick Links**:
- API Documentation: http://localhost:3000/api/docs
- BMad User Guide: `.bmad-core/user-guide.md`
- Style Guide: `docs/style-guide/quick-reference.md`

## Vercel Deployment

This application is deployed on Vercel with separate frontend and backend deployments.

### Quick Deployment

```bash
# Deploy frontend
./scripts/deploy-vercel.sh --frontend

# Deploy backend
./scripts/deploy-vercel.sh --backend

# Deploy both
./scripts/deploy-vercel.sh --both
```

### Frontend Deployment

**Location**: `/frontend`
**Platform**: Vercel Global Edge Network (static site)
**Documentation**: `frontend/VERCEL_DEPLOYMENT.md`, `VERCEL_QUICK_START.md`

**Key Points**:
- Static assets served from global CDN (100+ edge locations)
- Build region is `iad1` but assets are distributed worldwide
- No serverless functions needed
- Vite build output deployed to edge network

**Environment Variables**:
```env
VITE_API_URL=https://your-backend.vercel.app/api
VITE_WORKABLE_SUBDOMAIN=your-subdomain  # Optional
VITE_WORKABLE_API_TOKEN=your-token      # Optional
```

**Configuration**: `frontend/vercel.json`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Includes SPA routing rewrite rules

### Backend Deployment

**Location**: `/` (root)
**Platform**: Vercel Serverless Functions
**Region**: Sydney (`syd1`)
**Documentation**: `VERCEL_BACKEND_DEPLOYMENT_GUIDE.md`, `VERCEL_NESTJS_SERVERLESS_SUCCESS.md`

**Critical Configuration** (NestJS on Vercel):

1. **Handler Export Pattern** (`src/main.ts`):
```typescript
// App instance caching for cold start optimization
let cachedApp: any = null;

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  return cachedApp(req, res);
}
```

2. **No `app.listen()` in Production**:
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ... configuration ...

  if (process.env.NODE_ENV === 'production') {
    await app.init();  // Don't call listen() in serverless
    return app.getHttpAdapter().getInstance();
  } else {
    await app.listen(port);  // Only in development
  }
}
```

3. **Optimized Database Settings** (`src/config/database.config.ts`):
```typescript
extra: {
  connectionLimit: 5,  // Reduced for serverless
  acquireTimeoutMillis: 10000,
  timeout: 10000,
  max: 5,
  idleTimeoutMillis: 30000,
}
```

**Performance Metrics**:
- Cold Start: 3-5 seconds (full app with TypeORM + 20 modules)
- Warm Start: <100ms (cached app instance)
- Database Connection: ~200ms (after first connection)

### Vercel Storage

**PostgreSQL** (Vercel Postgres):
- Database initialization: `init-db.sql` (run via Vercel dashboard or external client)
- Production seeding: `npm run seed:prod` (creates admin user + base data)
- Development seeding: `npm run seed:dev` (creates 25+ test users + comprehensive data)
- **Important**: Use SQL scripts, not TypeORM migrations

**Blob Storage** (Vercel Blob):
- CV/document uploads use dual storage strategy
- Production: Vercel Blob storage (automatic via `NODE_ENV=production`)
- Development: Local filesystem (`./storage`)
- Files stored with full URLs in production
- Documentation: `VERCEL_BLOB_STORAGE_SETUP.md`

**Redis** (Vercel KV):
- Session management and caching
- Configured via `KV_URL` and `KV_REST_API_TOKEN`

### Required Environment Variables (Vercel)

**Backend** (set in Vercel dashboard):
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

# Application
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
FRONTEND_URL=https://your-frontend.vercel.app

# Optional: Workable Integration
WORKABLE_SUBDOMAIN=yourcompany
WORKABLE_API_TOKEN=your-workable-token
```

### Deployment Workflow

1. **Initial Setup**:
   - Create Vercel Postgres database
   - Create Vercel KV store
   - Create Vercel Blob storage
   - Set all environment variables
   - Run `init-db.sql` script via Vercel dashboard

2. **Seed Database**:
```bash
# Production seeding (admin user + base data)
curl -X POST https://your-backend.vercel.app/api/v1/seed/database

# Clear database if needed
curl -X POST https://your-backend.vercel.app/api/v1/seed/clear
```

3. **Deploy**:
```bash
# Automatic: Push to main branch
git push origin main

# Manual: Use deployment script
./scripts/deploy-vercel.sh --both
```

### Testing Deployment

```bash
# Test backend health
curl https://your-backend.vercel.app/api/health

# Test authentication
curl -X POST https://your-backend.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@teamified.com", "password": "Admin123!"}'

# Test frontend
open https://your-frontend.vercel.app
```

### Common Deployment Issues

1. **CORS Errors**: Add Vercel frontend URL to backend CORS config in `src/main.ts`
2. **Function Timeouts**: Increase `maxDuration` in `vercel.json` or optimize database queries
3. **Database Connection**: Verify `POSTGRES_URL` and SSL configuration
4. **Blob Upload Errors**: Ensure `BLOB_READ_WRITE_TOKEN` is set and blob storage is enabled
5. **Cold Start Delays**: Expected on first request (3-5s), subsequent requests are <100ms

### Vercel Documentation

For detailed deployment guides, see:
- `VERCEL_QUICK_START.md` - Frontend deployment (5-minute guide)
- `VERCEL_DEPLOYMENT_GUIDE.md` - Comprehensive frontend guide
- `VERCEL_BACKEND_DEPLOYMENT_GUIDE.md` - Backend deployment guide
- `VERCEL_NESTJS_SERVERLESS_SUCCESS.md` - Critical NestJS serverless configuration
- `VERCEL_DATABASE_SETUP.md` - Database initialization guide
- `VERCEL_SEED_GUIDE.md` - Database seeding guide
- `VERCEL_BLOB_STORAGE_SETUP.md` - File storage configuration
- `frontend/VERCEL_DEPLOYMENT.md` - Frontend-specific notes