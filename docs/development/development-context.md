# Development Context

## Docker Services

The backend services are running in Docker containers:

- **Backend Container**: `teamified_backend_dev`
- **Port Mapping**: `0.0.0.0:3000->3000/tcp`
- **Frontend Container**: `teamified_frontend_dev` 
- **Port Mapping**: `0.0.0.0:5173->5173/tcp`
- **Database**: `teamified_postgres_dev` on port 5432
- **Redis**: `teamified_redis_dev` on port 6379

### Docker Commands

```bash
# Check running containers
docker ps

# View backend logs
docker logs teamified_backend_dev

# Restart backend service (for config changes)
docker-compose -f docker-compose.dev.yml restart backend

# CRITICAL: Rebuild Docker image when adding NEW MODULES
# Hot-reload only works for existing files, not new directories
docker-compose -f docker-compose.dev.yml build backend
docker-compose -f docker-compose.dev.yml up -d backend

# Full clean rebuild (for major changes)
rm -rf dist && npm run build && docker-compose -f docker-compose.dev.yml build backend && docker-compose -f docker-compose.dev.yml up -d backend

# Verify routes are registered
docker logs teamified_backend_dev --tail 100 | grep "RoutesResolver"
```

### IMPORTANT: When to Rebuild Docker Image

**Rebuild Required:**
- ✅ Adding new modules/directories under `src/`
- ✅ Adding new source files in new locations
- ✅ Changing TypeScript configuration (`tsconfig.json`, `nest-cli.json`)
- ✅ Installing new npm dependencies

**Restart Sufficient:**
- ✅ Editing existing files (hot-reload handles this)
- ✅ Changing environment variables
- ✅ Database connection issues

## Authentication Credentials

Test user credentials are defined in `/scripts/seed-database.js`:

### Passwords Object (lines 106-112)
```javascript
const passwords = {
  admin: 'Admin123!',
  hr: 'HR123!',
  eor: 'EOR123!',
  candidate: 'Candidate123!',
  client: 'Client123!'
};
```

### User Accounts (lines 667-670)
- **Admin**: `admin@teamified.com` / `Admin123!`
- **HR Manager**: `hr@teamified.com` / `HR123!`
- **EOR Users**: `john.doe@example.com` / `EOR123!`
- **EOR Users**: `jane.smith@example.com` / `EOR123!`

### Login Endpoint
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@teamified.com", "password": "Admin123!"}'
```

## API Endpoints

### Base URL
- **Backend API**: `http://localhost:3000/api`
- **Auth Endpoints**: `http://localhost:3000/api/v1/auth/*`
- **Role Endpoints**: `http://localhost:3000/api/roles/*`
- **User Endpoints**: `http://localhost:3000/api/users/*`
- **Swagger Docs**: `http://localhost:3000/api/docs`

### Authentication
All protected endpoints require JWT Bearer token:
```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" http://localhost:3000/api/endpoint
```

## Common Issues & Solutions

### TypeScript Compilation Errors
- **Problem**: "Cannot write file because it would overwrite input file"
- **Solution**: `rm -rf dist && docker-compose -f docker-compose.dev.yml restart backend`

### 401 Unauthorized Errors
- **Problem**: Missing or invalid JWT token
- **Solution**: Login first to get JWT token, then include in Authorization header

### Role Management
- **Admin Role**: Has full system access including `users.read`, `users.create`, `users.update`, `users.delete`, `roles.assign`, `roles.manage`, `system.admin`
- **Role Types**: `admin`, `hr`, `client`, `eor`, `candidate`
- **Scopes**: `user`, `group`, `client`, `all`
