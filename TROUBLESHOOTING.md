# Troubleshooting Guide

## Backend Deployment Issues

### Cannot find module '/app/dist/main.js'

**Symptoms:**
- Backend container crashes on startup
- Logs show: `Error: Cannot find module '/app/dist/main.js'`

**Root Cause:**
TypeScript is compiling to `dist/src/main.js` instead of `dist/main.js`

**Solution:**
```bash
# 1. Fix tsconfig.json - ensure these settings exist:
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",  # <- CRITICAL
    ...
  },
  "exclude": [
    "frontend/**/*",
    "docs/**/*", 
    "node_modules/**/*",
    "tests/**/*",      # <- REQUIRED with rootDir
    "dist/**/*"        # <- REQUIRED with rootDir
  ]
}

# 2. Clean rebuild
rm -rf dist
npm run build

# 3. Verify structure (main.js should be at root of dist/)
ls -la dist/

# 4. Rebuild Docker
docker-compose -f docker-compose.dev.yml build backend
docker-compose -f docker-compose.dev.yml up -d backend
```

---

### New Module Routes Not Appearing

**Symptoms:**
- Created new module/controller
- Routes don't appear in logs
- 404 errors when calling endpoints

**Root Cause:**
Source files not copied into Docker container (hot-reload doesn't detect new directories)

**Solution:**
```bash
# MUST rebuild Docker image for new modules
docker-compose -f docker-compose.dev.yml build backend
docker-compose -f docker-compose.dev.yml up -d backend

# Wait and verify
sleep 10
docker logs teamified_backend_dev --tail 100 | grep -i "YourModuleName"
```

---

### TypeORM "No metadata for Entity was found"

**Symptoms:**
- Backend starts but crashes on first database query
- Error: `No metadata for 'YourEntity' was found`

**Root Cause:**
Entity not registered in TypeORM configuration

**Solution:**
```typescript
// src/config/database.config.ts
import { YourEntity } from '../your-module/entities/your.entity';

export const databaseConfig = (configService: ConfigService) => ({
  ...
  entities: [
    User, 
    Session, 
    YourEntity,  // <- ADD THIS
    ...
  ],
  ...
});
```

Then rebuild:
```bash
docker-compose -f docker-compose.dev.yml build backend
docker-compose -f docker-compose.dev.yml up -d backend
```

---

### TS6059: File not under rootDir

**Symptoms:**
- `npm run build` fails
- Error: `File '/path/to/file.ts' is not under 'rootDir'`

**Root Cause:**
TypeScript finds files outside `src/` when `rootDir: "./src"` is set

**Solution:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "rootDir": "./src"
  },
  "exclude": [
    "frontend/**/*",
    "docs/**/*",
    "node_modules/**/*",
    "tests/**/*",     # <- ADD THIS
    "dist/**/*"       # <- ADD THIS
  ]
}
```

---

### Docker Container Restart Loop

**Symptoms:**
- Container keeps restarting
- `docker ps` shows container constantly restarting

**Diagnosis:**
```bash
# Check logs for error
docker logs teamified_backend_dev --tail 50

# Common causes:
# 1. Missing dist/main.js (see above)
# 2. Database connection failure
# 3. Missing environment variables
# 4. Port already in use
```

**Solutions by Error:**

**If "Cannot find module":**
- Fix tsconfig and rebuild (see first section)

**If "ECONNREFUSED" or database error:**
```bash
# Check database is running
docker ps | grep postgres

# Restart database
docker-compose -f docker-compose.dev.yml restart postgres

# Check connection from backend container
docker exec -it teamified_backend_dev ping postgres
```

**If "Port already in use":**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill it
lsof -ti:3000 | xargs kill -9

# Restart backend
docker-compose -f docker-compose.dev.yml up -d backend
```

---

## Prevention Checklist

**Before Adding New Modules:**
- [ ] Verify `tsconfig.json` has correct `rootDir` and `exclude` settings
- [ ] Plan to rebuild Docker image after adding module
- [ ] Have database update script ready if needed

**After Adding New Module:**
- [ ] Add module to `app.module.ts`
- [ ] Add entities to `database.config.ts`
- [ ] Run `npm run build` locally first
- [ ] Rebuild Docker: `docker-compose -f docker-compose.dev.yml build backend`
- [ ] Check logs for route registration
- [ ] Test at least one endpoint

**Daily Development:**
- Use restart for file changes in existing modules
- Use rebuild only when adding new modules/dependencies
- Check logs immediately after any deployment change

---

## Quick Recovery Commands

```bash
# Nuclear option - full reset
docker-compose -f docker-compose.dev.yml down
rm -rf dist node_modules
npm ci
npm run build
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up -d

# Verify everything
docker ps
docker logs teamified_backend_dev --tail 50
docker logs teamified_postgres_dev --tail 20
```

---

## Getting Help

If issues persist:

1. Check this troubleshooting guide first
2. Review `.bmad-core/checklists/new-module-deployment.md`
3. Check `DEVELOPMENT_CONTEXT.md` for environment details
4. Verify Docker containers are healthy: `docker ps`
5. Check all logs: `docker-compose -f docker-compose.dev.yml logs`

## Last Updated
2025-10-02 - After Story 7.4 Task 1 deployment lessons learned

