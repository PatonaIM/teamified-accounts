# CV Functionality - Database Issue

## 🔴 **CRITICAL ISSUE IDENTIFIED**

**Date**: October 17, 2025  
**Reporter**: User testing job application workflow  
**Issue**: CV section doesn't show any CVs during job application

---

## 🔍 Root Cause

The **`documents`** and **`eor_profiles`** tables are **missing from the database**.

### Investigation Results

1. ✅ Database exists: `teamified_portal`
2. ✅ Users table exists with user25
3. ❌ **`eor_profiles` table: MISSING**
4. ❌ **`documents` table: MISSING**

### Why Documents Table Doesn't Exist

The `documents` table has a foreign key constraint to `eor_profiles`:
```sql
eor_profile_id UUID REFERENCES eor_profiles(id) ON DELETE CASCADE
```

Since `eor_profiles` doesn't exist, the `documents` table creation fails silently with `CREATE TABLE IF NOT EXISTS`.

### Why EOR Profiles Table Doesn't Exist

The `eor_profiles` table is **not defined in `init-db.sql`**. It's missing from the database schema entirely.

---

## 📊 Current State

### Tables That Exist (23 total)
```
✅ users
✅ user_roles
✅ clients
✅ countries
✅ currencies
✅ employment_records
✅ exchange_rates
✅ invitations
✅ leave_approvals
✅ leave_balances
✅ leave_requests
✅ payroll_periods
✅ payroll_processing_logs
✅ payslips
✅ region_configurations
✅ salary_components
✅ salary_history
✅ sessions
✅ statutory_components
✅ tax_years
✅ timesheet_approvals
✅ timesheets
✅ audit_logs
```

### Tables That Are Missing
```
❌ eor_profiles
❌ documents
```

---

## 💥 Impact

### Features Broken
1. **CV Upload** - Users can't upload CVs
2. **CV Management** - Can't view, download, or delete CVs
3. **Job Applications** - CV selection step fails/shows empty
4. **Profile Completion** - CV-based completion percentage broken
5. **Document Management** - Entire document system non-functional

### User Experience
- ❌ Job application workflow breaks at CV selection
- ❌ Profile page CV section shows errors or nothing
- ❌ Document management page doesn't work
- ❌ Profile completion percentage incorrect

---

## 🔧 Solution Required

### Option 1: Add EOR Profiles Table to init-db.sql (Recommended)

Add the complete EOR profiles schema to `init-db.sql`:

```sql
-- EOR Profiles Table
CREATE TABLE IF NOT EXISTS eor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    country_id UUID NOT NULL REFERENCES countries(id),
    full_legal_name VARCHAR(255),
    date_of_birth DATE,
    nationality VARCHAR(100),
    tax_id VARCHAR(100),
    social_security_number VARCHAR(100),
    passport_number VARCHAR(100),
    work_permit_number VARCHAR(100),
    bank_name VARCHAR(255),
    bank_account_number VARCHAR(100),
    bank_routing_number VARCHAR(100),
    bank_swift_code VARCHAR(50),
    emergency_contact_name VARCHAR(255),
    emergency_contact_relationship VARCHAR(100),
    emergency_contact_phone VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    profile_completion_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_eor_profiles_user_id ON eor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_eor_profiles_country_id ON eor_profiles(country_id);
```

Then run:
```bash
docker-compose exec postgres psql -U postgres -d teamified_portal < init-db.sql
```

### Option 2: Run TypeORM Migrations

If migrations exist:
```bash
docker-compose exec backend npm run migration:run
```

### Option 3: Recreate Database from Scratch

Stop services and recreate:
```bash
docker-compose down -v
docker-compose up -d
```

Then run init and seed scripts.

---

## 🚨 Immediate Workaround

### For Testing Job Applications

Since candidate users (like user25) don't have EOR profiles and shouldn't need them, the CV selection step in `JobApplicationPage.tsx` was already made optional:

```typescript
// CV selection is optional - validation commented out
// if (activeStep === 1 && !selectedCvId) {
//   return false;
// }
```

However, **the backend still won't work** because the documents table doesn't exist at all.

### Quick Test Fix

1. Make CV selection step skippable in UI (already done)
2. Skip CV attachment to Workable submission temporarily
3. Test rest of application workflow

---

## 📝 Recommended Action Plan

### Immediate (Critical)
1. ✅ **Identify issue**: COMPLETE
2. ⚠️ **Add eor_profiles table** to init-db.sql
3. ⚠️ **Run init-db.sql** to create missing tables
4. ⚠️ **Verify tables exist** with `\dt`
5. ⚠️ **Test CV upload** for candidate users
6. ⚠️ **Test job application** with CV selection

### Short Term
1. Update database seeding to include sample CVs
2. Create migration scripts for future schema changes
3. Add database health checks to deployment
4. Document required database schema

### Long Term
1. Implement proper migration system (TypeORM already configured)
2. Add integration tests for database schema
3. Create database version tracking
4. Automate schema validation on startup

---

## 🧪 Verification Steps

After fixing, verify with:

```bash
# Check tables exist
docker-compose exec postgres psql -U postgres -d teamified_portal -c "\dt" | grep -E "eor_profiles|documents"

# Check documents table structure
docker-compose exec postgres psql -U postgres -d teamified_portal -c "\d documents"

# Check for any documents
docker-compose exec postgres psql -U postgres -d teamified_portal -c "SELECT COUNT(*) FROM documents;"

# Try uploading a CV via UI
# Navigate to: Profile > CV Management > Upload CV
```

---

## 📚 Related Files

- `init-db.sql` - Database initialization (needs eor_profiles added)
- `src/documents/entities/document.entity.ts` - Document entity definition
- `src/profiles/entities/eor-profile.entity.ts` - EOR profile entity (if exists)
- `frontend/src/components/jobs/CVSelection.tsx` - CV selection UI
- `frontend/src/pages/JobApplicationPage.tsx` - Application form

---

## 🎯 Status

**Issue**: 🔴 **CRITICAL - Feature Non-Functional**  
**Priority**: **P0 - Immediate Action Required**  
**Assigned To**: Database/DevOps  
**ETA**: Should be fixed before job application feature can be considered complete

---

**Reported By**: User Acceptance Testing  
**Confirmed By**: Database inspection  
**Severity**: Critical (blocks core functionality)

