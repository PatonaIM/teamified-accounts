# Story 8.3: CV Architecture Fix - Supporting Candidates

## Problem Statement

The current CV management system requires an EOR profile to upload and manage CVs. However, **candidates are the primary users who need to upload CVs** for job applications, and they don't have EOR profiles.

### Current Architecture Issues
1. `Document` entity only has `eorProfileId` field (NOT NULL)
2. CV Controller checks for `user.eorProfile?.id` and returns 428 error if missing
3. CV Service requires `eorProfileId` parameter for all operations
4. Candidates cannot upload, list, or attach CVs to applications

## Solution: Dual-Mode CV Storage

Support both candidate and EOR employee CV storage by making the Document entity flexible.

### Database Changes Required

**1. Update `documents` table schema:**
```sql
-- Make eor_profile_id nullable
ALTER TABLE documents 
  ALTER COLUMN eor_profile_id DROP NOT NULL;

-- Add user_id column (nullable, for candidates)
ALTER TABLE documents 
  ADD COLUMN user_id UUID NULL;

-- Add foreign key constraint
ALTER TABLE documents 
  ADD CONSTRAINT fk_documents_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id);

-- Add check constraint: must have either eor_profile_id OR user_id
ALTER TABLE documents 
  ADD CONSTRAINT chk_documents_owner 
  CHECK (
    (eor_profile_id IS NOT NULL AND user_id IS NULL) OR 
    (eor_profile_id IS NULL AND user_id IS NOT NULL)
  );

-- Add index for user_id
CREATE INDEX idx_documents_user_id ON documents(user_id);
```

### Code Changes Required

**1. Document Entity (`src/documents/entities/document.entity.ts`)**
- Add `userId` field (nullable)
- Make `eorProfileId` nullable
- Add `user` relationship
- Add CHECK constraint for owner validation

**2. CV Service (`src/documents/services/cv.service.ts`)**
- Update `uploadCV` to accept either `userId` or `eorProfileId`
- Update `listCVs` to query by either field
- Update `getDownloadUrl` to query by either field
- Add helper methods to determine user type

**3. CV Controller (`src/documents/controllers/cv.controller.ts`)**
- Remove EOR profile requirement check
- Detect user type (candidate vs EOR)
- Pass appropriate ID to service methods
- Update API documentation

**4. Storage Service**
- Update file path generation to support both user types:
  - Candidates: `cvs/users/{userId}/{versionId}/...`
  - EOR: `cvs/eor-profiles/{eorProfileId}/{versionId}/...`

### Implementation Strategy

**Phase 1: Database Migration**
1. Create migration file
2. Update Document entity
3. Test migration rollback

**Phase 2: Service Layer**
1. Update CV Service methods
2. Add user type detection
3. Update storage paths

**Phase 3: Controller Layer**
1. Remove EOR profile checks
2. Add user type logic
3. Update API docs

**Phase 4: Testing**
1. Test candidate CV upload
2. Test EOR employee CV upload
3. Test CV listing for both types
4. Test download URLs for both types
5. Test Story 8.3 application flow

### User Type Detection Logic

```typescript
function getUserType(user: User): 'candidate' | 'eor' {
  if (user.eorProfile?.id) {
    return 'eor';
  }
  return 'candidate';
}

function getOwnerField(userType: 'candidate' | 'eor', user: User): { userId?: string; eorProfileId?: string } {
  if (userType === 'candidate') {
    return { userId: user.id };
  }
  return { eorProfileId: user.eorProfile.id };
}
```

### Benefits

1. ✅ Candidates can upload CVs without EOR profiles
2. ✅ Story 8.3 job application flow works correctly
3. ✅ Backward compatible with existing EOR CVs
4. ✅ Maintains data integrity with CHECK constraint
5. ✅ Clear separation between candidate and EOR documents

### Migration Safety

- **Existing Data:** All existing documents have `eorProfileId`, will remain unchanged
- **Rollback:** Migration can be reversed by removing `user_id` column and making `eor_profile_id` NOT NULL again
- **Zero Downtime:** Nullable columns allow gradual rollout

### Testing Scenarios

**Scenario 1: Candidate uploads CV**
- User: `user25@teamified.com` (candidate, no EOR profile)
- Action: POST `/api/v1/users/me/profile/cv`
- Expected: CV uploaded with `userId`, `eorProfileId` NULL
- Result: ✅ Success

**Scenario 2: EOR employee uploads CV**
- User: `eor@example.com` (has EOR profile)
- Action: POST `/api/v1/users/me/profile/cv`
- Expected: CV uploaded with `eorProfileId`, `userId` NULL
- Result: ✅ Success

**Scenario 3: Candidate applies for job**
- User: Candidate with uploaded CV
- Action: Submit job application
- Expected: CV attached to Workable submission
- Result: ✅ Success

### Estimated Effort

- Database migration: 30 minutes
- Entity updates: 30 minutes
- Service refactoring: 1-2 hours
- Controller updates: 1 hour
- Testing: 1 hour
- **Total: 4-5 hours**

### Priority

**HIGH** - This blocks the core functionality of Story 8.3 (job applications) for candidates.

### Recommendation

Implement this fix immediately after completing Story 8.3 initial development. This is a critical architectural issue that affects the usability of the job application system.

---

**Author:** Developer James  
**Date:** January 17, 2025  
**Related Story:** 8.3 - Application Submission System

