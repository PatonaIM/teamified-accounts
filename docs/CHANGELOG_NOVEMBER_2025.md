# Changelog - November 2025

## November 22, 2025

### Refactored Internal User Management

#### Summary
Replaced the separate "Internal Users" admin tool with a special "Teamified" organization that uses an exclusive "internal" subscription tier. Internal staff are now managed the same way as client organization members, but with internal-specific roles.

#### Changes Made

##### 1. Database Schema Updates
- Added `internal` subscription tier to organizations table
- Added `website` field to organizations table (VARCHAR 500)
- Created Teamified organization (slug: `teamified-internal`, subscription: `internal`)
- Migrated all 12 internal users to Teamified organization as members

##### 2. Role System Refactoring

**Renamed `internal_member` to `internal_employee`:**
- Updated all backend type definitions
- Updated invitation entities and DTOs
- Updated user roles service
- Updated JWT and SSO services
- Maintained backward compatibility through legacy mappings

**Complete Role Type List:**

Client Roles:
- `client_admin` - Full access to organization management
- `client_hr` - Manage users and HR functions  
- `client_finance` - Manage financial operations
- `client_recruiter` - Manage recruitment processes
- `client_employee` - Standard user access (default)

Internal Roles:
- `super_admin` - Full system access and control
- `internal_hr` - Internal HR operations
- `internal_finance` - Internal finance operations
- `internal_account_manager` - Manage client accounts
- `internal_recruiter` - Internal recruitment
- `internal_marketing` - Internal marketing operations
- `internal_employee` - Standard internal team member (default)

##### 3. Backend Validation
- Implemented subscription tier validation (prevents clients from selecting 'internal')
- Implemented role constraint validation (internal roles only for Teamified, client roles only for others)
- Protected Teamified organization from deletion and subscription changes

##### 4. Organization Sorting
- Teamified always appears first in organization lists (when not filtered out)
- Then sorted by subscription tier priority: internal (5) > enterprise (4) > professional (3) > basic (2) > free (1)
- Then by member count (descending)
- **Filter Behavior**: Subscription tier filter excludes Teamified when a specific tier (other than "Internal") is selected

##### 5. Frontend Updates

**Organization Management Page:**
- Removed "Internal Users" admin page, route, and menu card
- Added subscription tier filter dropdown in left panel
- Updated organization list to show Teamified first
- Hidden Billing Details tab for Teamified organization
- Adjusted tab indices dynamically based on organization type

**Organization Invitation Modal:**
- Shows internal roles when inviting to Teamified organization
- Shows client roles when inviting to client organizations  
- Role filtering based on `subscriptionTier` prop
- Added `internal_employee` to internal roles list
- Added spacing above "Send Email Invitation" label

**Subscription Tier Styling:**
- "Internal" badge: Black background with white text (light mode)
- "Internal" badge: White background with black text (dark mode)
- Applied to both organization list and details view

##### 6. Documentation Updates
- Created `ORGANIZATION_MANAGEMENT_AND_ROLES.md` - comprehensive documentation
- Created this changelog - `CHANGELOG_NOVEMBER_2025.md`

#### Files Changed

**Backend:**
- `src/common/types/role-types.ts`
- `src/invitations/dto/create-invitation.dto.ts`
- `src/invitations/dto/create-internal-invitation.dto.ts`
- `src/invitations/entities/invitation.entity.ts`
- `src/invitations/invitations.service.ts`
- `src/invitations/invitations.controller.ts`
- `src/user-roles/dto/assign-role.dto.ts`
- `src/user-roles/dto/update-role.dto.ts`
- `src/user-roles/services/user-roles.service.ts`
- `src/auth/services/jwt.service.ts`
- `src/sso/sso.service.ts`
- `src/organizations/entities/organization.entity.ts`
- `src/organizations/organizations.service.ts`
- `src/organizations/dto/create-organization.dto.ts`
- `src/organizations/dto/update-organization.dto.ts`

**Frontend:**
- `frontend/src/pages/OrganizationManagementPage.tsx`
- `frontend/src/components/invitations/OrganizationInvitationModal.tsx`
- `frontend/src/App.tsx` (removed Internal Users route)

**Database Migrations:**
- `migrations/add-internal-subscription-tier-and-teamified.sql`
- `migrations/migrate-internal-users-to-teamified.sql`

**Documentation:**
- `docs/ORGANIZATION_MANAGEMENT_AND_ROLES.md` (new)
- `docs/CHANGELOG_NOVEMBER_2025.md` (new)

#### Migration Notes

##### Internal Users
All existing internal users with the following roles were automatically migrated to the Teamified organization:
- `super_admin`
- `internal_hr`
- `internal_finance`
- `internal_account_manager`
- `internal_recruiter`
- `internal_marketing`
- `internal_employee` (formerly `internal_member`)

##### Backward Compatibility
The system maintains backward compatibility with legacy role names:
- `client_member` → `client_employee`
- `internal_member` → `internal_employee`

Old data with these role names will continue to work through automatic mapping in the permissions service.

#### Testing Checklist
- [x] Teamified organization created successfully
- [x] All 12 internal users migrated as members
- [x] Internal roles displayed in invitation modal for Teamified
- [x] Client roles displayed in invitation modal for other organizations
- [x] Billing tab hidden for Teamified organization
- [x] Tab navigation works correctly when switching organizations
- [x] Subscription tier filter works correctly
- [x] Teamified always appears first in organization list
- [x] "Internal" subscription badge displays with correct colors
- [x] No LSP errors in TypeScript code
- [x] Backend compiles and runs successfully

#### Breaking Changes
None. All changes are backward compatible through legacy role mappings.

#### Deprecations
- `internal_member` role type (use `internal_employee` instead)
- `client_member` role type (use `client_employee` instead)

Note: These are not removed, just mapped to new names for compatibility.

#### Future Considerations
1. Consider adding more granular internal roles as team grows
2. May need to add organization groups/teams for large client organizations
3. Consider role permission customization per organization
4. Evaluate need for hierarchical role structures

---

*This changelog documents significant changes to the organization and role management system as of November 22, 2025.*
