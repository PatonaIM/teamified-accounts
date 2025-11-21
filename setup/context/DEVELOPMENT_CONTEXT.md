# Development Context

## Quick Start

### One-Command Setup
```bash
# Complete development environment setup
./setup/scripts/setup-dev-environment.sh
```

### Manual Setup
```bash
# 1. Generate environment file
./setup/scripts/generate-secrets.sh

# 2. Start services
docker-compose -f docker-compose.dev.yml up -d

# 3. Wait for services
./setup/scripts/wait-for-services.sh

# 4. Setup database
./scripts/setup-database.sh
```

## Environment Setup

### Required Environment Variables
Create a `.env` file in the project root with these variables:

```bash
# JWT Configuration (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Database Configuration
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=teamified_portal

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# Application Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Email Configuration (optional for development)
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
```

### Development vs Production Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| **Hot Reload** | ✅ Enabled with volume mounts | ❌ Optimized builds |
| **Debug Mode** | ✅ NODE_ENV=development | ❌ NODE_ENV=production |
| **Volume Mounts** | ✅ Source code mounted | ❌ Compiled code only |
| **Health Checks** | ✅ Basic checks | ✅ Comprehensive monitoring |
| **Restart Policy** | ✅ unless-stopped | ✅ unless-stopped |
| **Logging** | ✅ Verbose debug logs | ✅ Structured production logs |

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

# View all service logs
docker-compose -f docker-compose.dev.yml logs -f

# Restart backend service
docker-compose -f docker-compose.dev.yml restart backend

# Clean dist directory and restart (fixes TypeScript compilation conflicts)
rm -rf dist && docker-compose -f docker-compose.dev.yml restart backend

# Complete reset
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d --build
```

## Database Management

### Migration Commands
```bash
# Generate new migration
npm run migration:generate -- src/migrations/AddNewFeature

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Check migration status
npm run typeorm -- migration:show -d src/config/database.config.ts
```

### Database Reset Commands
```bash
# Complete reset with reseed
./scripts/setup-database.sh --reset

# Reset specific tables
docker exec teamified_postgres_dev psql -U postgres -d teamified_portal -c "TRUNCATE TABLE users, clients RESTART IDENTITY CASCADE;"

# Reset and reseed
docker exec teamified_postgres_dev psql -U postgres -d teamified_portal -c "TRUNCATE TABLE audit_logs, user_roles, clients, users RESTART IDENTITY CASCADE;"
node scripts/seed-database-enhanced.js
```

### Database Connection Details
- **Host**: `localhost` (Docker port mapping)
- **Port**: `5432` (mapped from container)
- **Database**: `teamified_portal`
- **User**: `postgres`
- **Password**: `password`

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

### Enhanced Test Users (from seed-database-enhanced.js)
| Email | Name | Role | Password | Access Level |
|-------|------|------|----------|--------------|
| `user1@teamified.com` | Anita Reddy | Admin | `Admin123!` | Full system access |
| `user2@teamified.com` | Meera Agarwal | Admin | `Admin123!` | Full system access |
| `user3@teamified.com` | Meera Nair | Timesheet Approver | `Approver123!` | Timesheet approval access |
| `user6@teamified.com` | [Generated Name] | EOR | `EOR123!` | Client-specific access |
| `user9@teamified.com` | [Generated Name] | Candidate | `Candidate123!` | User-specific access |

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

### Key API Endpoints
```bash
# Users API
GET /api/v1/users
GET /api/v1/users/{id}
GET /api/v1/users?search=anita&status=active
GET /api/v1/users/me/profile
PUT /api/v1/users/me/profile

# Clients API
GET /api/v1/clients
GET /api/v1/clients/{id}

# Employment Records API
GET /api/v1/employment-records
GET /api/v1/employment-records?user_id={id}
GET /api/v1/users/me/employment

# Salary History API
GET /api/v1/salary-history?employment_record_id={id}
```

## Logging and Monitoring

### Log Locations
- **Backend logs**: `docker logs teamified_backend_dev`
- **Frontend logs**: `docker logs teamified_frontend_dev`
- **Database logs**: `docker logs teamified_postgres_dev`
- **Redis logs**: `docker logs teamified_redis_dev`

### Log Aggregation
```bash
# View all logs together
docker-compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Follow logs with timestamps
docker-compose -f docker-compose.dev.yml logs -f -t

# View last 100 lines of backend logs
docker logs --tail 100 teamified_backend_dev
```

### Performance Monitoring
- **Backend health**: http://localhost:3000/api/health
- **Database connections**: Check PostgreSQL logs
- **Redis memory usage**: `docker exec teamified_redis_dev redis-cli info memory`
- **Container resource usage**: `docker stats`

### Health Check Endpoints
```bash
# Backend health check
curl http://localhost:3000/api/health

# Database connection test
docker exec teamified_postgres_dev pg_isready -U postgres -d teamified_portal

# Redis connection test
docker exec teamified_redis_dev redis-cli ping
```

## Common Issues & Solutions

### TypeScript Compilation Errors
- **Problem**: "Cannot write file because it would overwrite input file"
- **Solution**: `rm -rf dist && docker-compose -f docker-compose.dev.yml restart backend`

### 401 Unauthorized Errors
- **Problem**: Missing or invalid JWT token
- **Solution**: Login first to get JWT token, then include in Authorization header

### Database Connection Issues
- **Problem**: Database connection failed
- **Solution**: 
  ```bash
  # Check if Docker is running
  docker ps
  
  # Verify PostgreSQL container is healthy
  docker ps | grep postgres
  
  # Check container logs
  docker logs teamified_postgres_dev
  
  # Ensure no local PostgreSQL is running on port 5432
  lsof -i :5432
  ```

### Port Conflicts
- **Problem**: Port 5432 already in use
- **Solution**: 
  ```bash
  # Stop local PostgreSQL service
  brew services stop postgresql@15
  
  # Check port usage
  lsof -i :5432
  
  # Kill process using port
  sudo lsof -ti:5432 | xargs kill -9
  ```

### Role Management
- **Admin Role**: Has full system access including `users.read`, `users.create`, `users.update`, `users.delete`, `roles.assign`, `roles.manage`, `system.admin`
- **Role Types**: `admin`, `hr`, `client`, `eor`, `candidate`
- **Scopes**: `user`, `group`, `client`, `all`

### Container Issues
- **Problem**: Container won't start
- **Solution**:
  ```bash
  # Check container logs
  docker logs teamified_backend_dev
  
  # Rebuild container
  docker-compose -f docker-compose.dev.yml up -d --build backend
  
  # Complete reset
  docker-compose -f docker-compose.dev.yml down -v
  docker-compose -f docker-compose.dev.yml up -d
  ```

## Security Checklist

### Development Environment
- [ ] Use strong passwords for test accounts
- [ ] Never commit .env files
- [ ] Use different secrets for dev/staging/production
- [ ] Regularly rotate test credentials
- [ ] Enable HTTPS in production

### Production Deployment
- [ ] Change all default passwords
- [ ] Use strong, unique secrets
- [ ] Enable SSL/TLS certificates
- [ ] Configure proper CORS settings
- [ ] Set up rate limiting
- [ ] Enable audit logging

### Secret Management
```bash
# Generate secure secrets
./setup/scripts/generate-secrets.sh

# Never commit these files
echo ".env" >> .gitignore
echo "*.env" >> .gitignore
echo "secrets/" >> .gitignore
```

## Development Workflow

### Daily Development Commands
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Run tests
npm run test

# Run linting
npm run lint

# Access backend shell
docker-compose -f docker-compose.dev.yml exec backend sh

# Reset database
./scripts/setup-database.sh --reset
```

### Code Quality Commands
```bash
# Format code
npm run format

# Lint and fix
npm run lint

# Run all tests
npm run test:all

# Check test coverage
npm run test:cov
```

### Debugging Commands
```bash
# Debug backend
docker-compose -f docker-compose.dev.yml exec backend npm run start:debug

# Check database
docker exec -it teamified_postgres_dev psql -U postgres -d teamified_portal

# Check Redis
docker exec -it teamified_redis_dev redis-cli

# Monitor container resources
docker stats
```

## Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/health

## Common Implementation Issues & Solutions

### Critical Issues to Avoid

#### 1. Route Prefix Problems
**Issue**: Controllers using `@Controller('api/v1/feature')` instead of `@Controller('v1/feature')`
**Symptoms**: Routes return 404 errors, endpoints not accessible
**Solution**: Always use `v1/` prefix only, not `api/v1/`

```typescript
// ✅ Correct
@Controller('v1/feature-name')

// ❌ Incorrect - causes 404 errors
@Controller('api/v1/feature-name')
```

#### 2. Authentication Import Issues
**Issue**: Importing auth components from wrong paths
**Symptoms**: "Cannot find module" compilation errors
**Solution**: Always import from `../../common/` not `../../auth/`

```typescript
// ✅ Correct
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

// ❌ Incorrect - causes compilation errors
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
```

#### 3. Missing AuthModule Import
**Issue**: Controllers use auth guards but module doesn't import `AuthModule`
**Symptoms**: "JwtTokenService not available" runtime errors
**Solution**: Always import `AuthModule` when using authentication

```typescript
// ✅ Correct
@Module({
  imports: [
    TypeOrmModule.forFeature([Entity]),
    AuthModule, // Required for JWT guards
  ],
})

// ❌ Incorrect - causes dependency resolution errors
@Module({
  imports: [
    TypeOrmModule.forFeature([Entity]),
    // Missing AuthModule
  ],
})
```

#### 4. DTO Validation Issues
**Issue**: Using overly restrictive validation decorators
**Symptoms**: Valid data rejected during API calls
**Solution**: Use appropriate validation decorators

```typescript
// ✅ Correct
@IsNumber({}, { message: 'Amount must be a valid number' })
amount: number;

// ❌ Incorrect - too restrictive
@IsDecimal({ decimal_digits: '0,2' })
amount: number;
```

#### 5. Date Handling Problems
**Issue**: Comparing string dates with Date objects
**Symptoms**: TypeScript compilation errors or runtime type errors
**Solution**: Convert string dates to Date objects

```typescript
// ✅ Correct
const effectiveDate = new Date(createDto.effectiveDate);
if (effectiveDate > someDate) {
  // comparison works
}

// ❌ Incorrect - type mismatch
if (createDto.effectiveDate > someDate) {
  // TypeScript error
}
```

### Prevention Checklist

Before implementing any new feature:

1. **Route Configuration**
   - [ ] Use `v1/` prefix only in controllers
   - [ ] Verify routes are mapped in startup logs

2. **Authentication Setup**
   - [ ] Import auth components from `../../common/`
   - [ ] Import `AuthModule` in feature modules
   - [ ] Use proper guards and decorators

3. **DTO Validation**
   - [ ] Use appropriate validation decorators
   - [ ] Include custom error messages
   - [ ] Test with various input formats

4. **Module Dependencies**
   - [ ] Import all required modules
   - [ ] Declare controllers and services properly
   - [ ] Export services if needed by other modules

### Validation Tools

#### Implementation Validation Script
```bash
# Run validation script to check for common issues
node scripts/validate-implementation.js
```

#### Manual Verification
```bash
# Check route mapping
docker-compose -f docker-compose.dev.yml logs backend | grep "RouterExplorer"

# Check for dependency errors
docker-compose -f docker-compose.dev.yml logs backend | grep "Cannot resolve dependencies"

# Test API endpoints
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/feature-name
```

### Quick Reference

For detailed patterns and solutions, see:
- `docs/development/quick-reference.md` - Common patterns and code examples
- `docs/development/feature-development-checklist.md` - Step-by-step checklist
- `docs/architecture/coding-standards.md` - Detailed coding standards

## Quick Reference

### Essential Commands
```bash
# Complete setup
./setup/scripts/setup-dev-environment.sh

# Start services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Reset everything
docker-compose -f docker-compose.dev.yml down -v && docker-compose -f docker-compose.dev.yml up -d

# Database reset
./scripts/setup-database.sh --reset
```

### Test Credentials
- **Primary Admin**: `user1@teamified.com` / `Admin123!`
- **HR Manager**: `hr@teamified.com` / `HR123!`
- **EOR User**: `john.doe@example.com` / `EOR123!`

---

**Last Updated**: 2025-01-27  
**Version**: 2.0  
**Maintained By**: Development Team