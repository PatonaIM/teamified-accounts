# New Module Deployment Checklist

## Purpose
Prevent common deployment issues when adding new NestJS modules to the project.

## Checklist

### 1. Module Creation
- [ ] Create module directory under `src/`
- [ ] Create entities, services, controllers, DTOs
- [ ] Add module to `src/app.module.ts` imports
- [ ] Register entities in `src/config/database.config.ts`

### 2. Database Updates
- [ ] Update `init-db.sql` with new tables (if applicable)
- [ ] Run database migration/init script to create tables
- [ ] Verify tables exist with `\d table_name` in psql

### 3. TypeScript Configuration Verification
- [ ] Verify `tsconfig.json` has `rootDir: "./src"`
- [ ] Verify `tsconfig.json` excludes: `tests/**/*`, `dist/**/*`, `frontend/**/*`
- [ ] Run `npm run build` locally to verify compilation
- [ ] Check `dist/` folder structure - `main.js` should be at `dist/main.js`, not `dist/src/main.js`

### 4. Docker Dev Environment
- [ ] **CRITICAL:** Rebuild Docker image when adding new modules: `docker-compose -f docker-compose.dev.yml build backend`
- [ ] Start container: `docker-compose -f docker-compose.dev.yml up -d backend`
- [ ] Wait 10 seconds for compilation
- [ ] Check logs for route registration: `docker logs teamified_backend_dev --tail 100 | grep -i "YourModule"`
- [ ] Verify no "Cannot find module" errors

### 5. Route Verification
- [ ] Check backend logs show all expected routes registered
- [ ] Test at least one endpoint with curl or Postman
- [ ] Verify Swagger docs include new endpoints: http://localhost:3000/api/docs

### 6. Linting & Testing
- [ ] Run `npx tsc --noEmit` to check for TypeScript errors
- [ ] Run linter on new files
- [ ] Create unit tests for services
- [ ] Create E2E tests for critical endpoints (if applicable)

## Common Issues & Solutions

### Issue: "Cannot find module '/app/dist/main.js'"
**Cause:** TypeScript compiled to wrong directory structure  
**Solution:** 
1. Add `"rootDir": "./src"` to `tsconfig.json`
2. Rebuild: `rm -rf dist && npm run build`
3. Rebuild Docker: `docker-compose -f docker-compose.dev.yml build backend`

### Issue: New routes not appearing in logs
**Cause:** Source files not copied into Docker container  
**Solution:** Rebuild Docker image: `docker-compose -f docker-compose.dev.yml build backend`

### Issue: TS6059 - File not under rootDir
**Cause:** Test files or other directories not excluded  
**Solution:** Add to `tsconfig.json` exclude: `"tests/**/*"`, `"dist/**/*"`

### Issue: TypeORM "No metadata for 'EntityName' was found"
**Cause:** Entity not registered in database config  
**Solution:** Add entity to `src/config/database.config.ts` entities array

## Quick Command Reference

```bash
# Full clean rebuild
rm -rf dist && npm run build && docker-compose -f docker-compose.dev.yml build backend && docker-compose -f docker-compose.dev.yml up -d backend

# Check compilation output structure
npm run build && ls -la dist/

# Verify TypeScript config
npx tsc --showConfig | grep -E "rootDir|outDir"

# Check running routes
docker logs teamified_backend_dev --tail 100 | grep "RoutesResolver"

# Access container to debug
docker exec -it teamified_backend_dev sh

# Check database tables
docker exec -i teamified_postgres_dev psql -U postgres -d teamified_portal -c "\dt"
```

## Prevention Tips

1. **Always rebuild Docker after adding new modules** - Don't rely on hot-reload for new directories
2. **Verify tsconfig settings before first build** - Check `rootDir` and `exclude` patterns
3. **Test locally before Docker** - Run `npm run build` to catch TypeScript issues early
4. **Check logs immediately** - Don't assume routes registered successfully
5. **Use the checklist** - Follow this checklist every time you add a new module

## Updated: 2025-10-02

