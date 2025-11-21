# Deployment Issue Prevention

## Summary of Issues Encountered (Story 7.4 Task 1)

During the deployment of the Timesheet Management Module, we encountered several cascading issues that prevented the backend from starting. This document outlines what happened and how we've prevented it from happening again.

## The Issues

### 1. TypeScript Output Directory Structure
**Problem:** TypeScript compiled files to `dist/src/main.js` instead of `dist/main.js`  
**Cause:** Missing `"rootDir": "./src"` in `tsconfig.json`  
**Impact:** Docker container crashed looking for `/app/dist/main.js`  
**Time Lost:** ~15 minutes

### 2. Docker Hot-Reload Limitation
**Problem:** New `timesheets/` module wasn't detected by running container  
**Cause:** Docker volume mounting only watches existing files, not new directories  
**Impact:** Routes didn't appear even after compilation  
**Time Lost:** ~10 minutes

### 3. Test Files in Compilation Path
**Problem:** Build failed with TS6059 error after adding `rootDir`  
**Cause:** `tests/` directory at root wasn't excluded  
**Impact:** Blocked compilation  
**Time Lost:** ~5 minutes

**Total Time Lost:** ~30 minutes  
**Root Cause:** Lack of validation and documentation for build configuration

---

## Prevention Measures Implemented

### 1. ✅ Fixed TypeScript Configuration
**File:** `tsconfig.json`
```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",  // ← ADDED - Ensures correct output structure
    ...
  },
  "exclude": [
    "frontend/**/*",
    "docs/**/*",
    "node_modules/**/*",
    "tests/**/*",        // ← ADDED - Prevents TS6059 error
    "dist/**/*"          // ← ADDED - Prevents circular issues
  ]
}
```

### 2. ✅ Created Validation Script
**File:** `scripts/validate-build-config.js`

Validates:
- ✅ `tsconfig.json` syntax
- ✅ `rootDir` is set to `"./src"`
- ✅ `outDir` is set to `"./dist"`
- ✅ All required exclude patterns exist
- ✅ Build output is in correct location
- ✅ `nest-cli.json` configuration

**Usage:**
```bash
npm run validate:config
```

### 3. ✅ Added npm Scripts
**File:** `package.json`

New commands:
```json
{
  "scripts": {
    "validate:config": "node scripts/validate-build-config.js",
    "build:validate": "node scripts/validate-build-config.js && npm run build",
    "docker:rebuild": "docker-compose -f docker-compose.dev.yml build backend && docker-compose -f docker-compose.dev.yml up -d backend"
  }
}
```

### 4. ✅ Created Deployment Checklist
**File:** `.bmad-core/checklists/new-module-deployment.md`

Complete checklist for adding new modules with:
- Pre-deployment validation steps
- Build configuration verification
- Docker rebuild requirements
- Route verification steps
- Common issues & solutions

### 5. ✅ Updated Development Documentation
**File:** `DEVELOPMENT_CONTEXT.md`

Added section on **"When to Rebuild Docker Image"**:
- Clear distinction between restart vs rebuild
- Examples of when each is needed
- Command reference

### 6. ✅ Created Troubleshooting Guide
**File:** `TROUBLESHOOTING.md`

Comprehensive guide covering:
- Cannot find module errors
- Missing routes
- TypeORM metadata issues
- Docker restart loops
- Quick recovery commands

---

## New Workflow for Adding Modules

### Before (What We Did Wrong)
```bash
# Create new module files
# Add to app.module.ts
docker-compose -f docker-compose.dev.yml restart backend  # ❌ NOT ENOUGH
# Wonder why routes don't appear...
```

### After (Correct Process)
```bash
# 1. Validate current configuration
npm run validate:config

# 2. Create new module files
# 3. Add to app.module.ts
# 4. Add entities to database.config.ts

# 5. Build and validate locally
npm run build:validate

# 6. Rebuild Docker image (CRITICAL!)
npm run docker:rebuild

# 7. Verify routes registered
docker logs teamified_backend_dev --tail 100 | grep "YourModule"

# 8. Test endpoints
curl http://localhost:3000/api/v1/your-endpoint
```

---

## Prevention Checklist

**Every time you add a new module:**

- [ ] Run `npm run validate:config` first
- [ ] Create module files under `src/`
- [ ] Register in `app.module.ts`
- [ ] Register entities in `database.config.ts`
- [ ] Run `npm run build:validate`
- [ ] Run `npm run docker:rebuild` (**NOT** just restart)
- [ ] Verify routes in logs
- [ ] Test at least one endpoint
- [ ] Update `init-db.sql` if database changes needed

**Red Flags to Watch For:**

- 🚩 Container repeatedly restarting
- 🚩 "Cannot find module" errors in logs
- 🚩 Routes not appearing in startup logs
- 🚩 Build succeeds but Docker fails
- 🚩 dist/src/main.js instead of dist/main.js

---

## Quick Reference Commands

```bash
# Validate configuration
npm run validate:config

# Build with validation
npm run build:validate

# Rebuild Docker (for new modules)
npm run docker:rebuild

# Full clean rebuild
rm -rf dist && npm run build:validate && npm run docker:rebuild

# Check routes registered
docker logs teamified_backend_dev --tail 100 | grep "RoutesResolver"

# Verify container health
docker ps | grep backend
```

---

## Key Takeaways

1. **TypeScript configuration matters** - `rootDir` and `outDir` must be correct
2. **Docker hot-reload has limits** - New directories require image rebuild
3. **Validation prevents issues** - Run validation script before deploying
4. **Documentation saves time** - Follow the checklist every time
5. **Test immediately** - Don't assume routes registered correctly

---

## Success Metrics

After implementing these measures:

- ✅ Configuration validated automatically
- ✅ Clear distinction between restart vs rebuild
- ✅ Comprehensive troubleshooting guide available
- ✅ Checklist ensures nothing is missed
- ✅ npm scripts simplify common tasks

**Expected Time Savings:** ~30 minutes per new module (100% of time previously lost)

---

## Maintenance

**Review Quarterly:**
- Update checklist based on new issues encountered
- Enhance validation script with new checks
- Update troubleshooting guide with solutions

**After Each Deployment Issue:**
- Document what went wrong
- Add validation check if possible
- Update troubleshooting guide

---

## Related Documentation

- `.bmad-core/checklists/new-module-deployment.md` - Complete deployment checklist
- `TROUBLESHOOTING.md` - Detailed error solutions
- `DEVELOPMENT_CONTEXT.md` - Docker commands and context
- `scripts/validate-build-config.js` - Validation script source

---

**Created:** 2025-10-02  
**Last Updated:** 2025-10-02  
**Triggered By:** Story 7.4 Task 1 deployment issues  
**Status:** Active Prevention Measures

