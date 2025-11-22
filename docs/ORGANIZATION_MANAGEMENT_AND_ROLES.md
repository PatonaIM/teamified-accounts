# Organization Management and Role System

**Document Version:** 2.0  
**Date:** November 22, 2025  
**Status:** Current Implementation

## Executive Summary

This document describes the organization management system and role-based access control in the Teamified platform. The system supports both client organizations and an internal Teamified organization with distinct role types and subscription tiers.

## Organization Types

### 1. Client Organizations
Client organizations are external companies that use Teamified services for their employment needs.

**Subscription Tiers:**
- `free` - Basic tier with limited features
- `basic` - Standard tier with core features
- `professional` - Advanced tier with enhanced features
- `enterprise` - Premium tier with full feature access

**Characteristics:**
- Can have multiple team members
- Subject to billing and subscription management
- Have organization-specific roles
- Can be managed through Organization Management interface

### 2. Internal Organization (Teamified)

The Teamified organization is a special internal organization for platform staff.

**Details:**
- **Name:** Teamified
- **Slug:** `teamified-internal`
- **Industry:** Recruitment
- **Website:** https://teamified.com/
- **Subscription Tier:** `internal` (exclusive tier not available to client organizations)

**Characteristics:**
- Always appears first in organization lists
- Has internal-specific roles
- Billing Details tab is hidden
- Cannot be deleted or have subscription changed

## Role System

### Role Types

The platform supports two categories of roles:

#### Client Roles
Used for members of client organizations:

| Role Type | Label | Description |
|-----------|-------|-------------|
| `client_admin` | Admin | Full access to organization management |
| `client_hr` | HR | Manage users and HR functions |
| `client_finance` | Finance | Manage financial operations |
| `client_recruiter` | Recruiter | Manage recruitment processes |
| `client_employee` | Employee | Standard user access |

#### Internal Roles
Used for Teamified internal staff:

| Role Type | Label | Description |
|-----------|-------|-------------|
| `super_admin` | Super Admin | Full system access and control |
| `internal_hr` | Internal HR | Internal HR operations |
| `internal_finance` | Internal Finance | Internal finance operations |
| `internal_account_manager` | Account Manager | Manage client accounts |
| `internal_recruiter` | Internal Recruiter | Internal recruitment |
| `internal_marketing` | Internal Marketing | Internal marketing operations |
| `internal_employee` | Internal Employee | Standard internal team member |

### Default Roles

- **Client Organizations:** `client_employee` (default for new users)
- **Internal Organization:** `internal_employee` (default for new internal staff)

### Role Assignment Rules

1. **Organization Type Validation:**
   - Client organizations can only assign client roles
   - Teamified organization can only assign internal roles
   - Backend validation enforces these constraints

2. **Role Filtering in UI:**
   - Organization Invitation Modal shows appropriate roles based on organization type
   - Internal roles displayed for Teamified organization
   - Client roles displayed for all other organizations

3. **Legacy Compatibility:**
   - `client_member` → maps to `client_employee`
   - `internal_member` → maps to `internal_employee`
   - Existing data with old role names continues to work

## Organization Management Interface

### Organization List Features

**Sorting:**
1. Teamified organization always appears first (when not filtered out)
2. Then sorted by subscription tier priority (internal > enterprise > professional > basic > free)
3. Then by member count (descending)

**Filtering:**
- Subscription tier filter dropdown in left panel
- Subscription tier filter applies to all organizations EXCEPT Teamified
- When "All Tiers" selected: Teamified appears first, followed by all other organizations
- When specific tier selected: Only organizations matching that tier are shown (Teamified excluded unless "Internal" is selected)
- Search by organization name, slug, or industry

**Subscription Tier Badges:**
- Each tier has a distinct color chip
- "Internal" tier badge: Black background with white text (light mode), White background with black text (dark mode)
- "Enterprise" tier has animated sparkle icon ✨ positioned absolutely on the badge
- "Professional" tier uses brand purple (#A16AE8) background with white text
- Other tiers use Material-UI default chip colors

### Organization Details

**Tabs Structure:**
- **For Client Organizations:** Users, Company Profile, Billing Details, Delete Organization
- **For Teamified Organization:** Users, Company Profile, Delete Organization (no Billing tab)

**Company Profile Fields:**
- Name, Slug, Industry, Company Size, Website
- Logo upload functionality
- All editable except for system-protected fields

### User Invitation

**Organization Invitation Modal:**
- Shows role selection based on organization type
- Internal roles for Teamified organization
- Client roles for all other organizations
- Supports both email invitations and shareable links
- Role assignment persists with invitation code

## Backend Implementation

### Database Schema

**Organizations Table:**
```sql
subscription_tier VARCHAR(50) CHECK (subscription_tier IN (
  'free', 'basic', 'professional', 'enterprise', 'internal'
))
```

**Invitations Table:**
```sql
role_type VARCHAR(50) CHECK (role_type IN (
  'candidate',
  'client_admin', 'client_hr', 'client_finance', 'client_recruiter', 'client_employee',
  'super_admin', 'internal_hr', 'internal_finance', 'internal_account_manager',
  'internal_recruiter', 'internal_marketing', 'internal_employee'
))
```

### API Endpoints

**Organization Management:**
- `GET /api/v1/organizations` - List all organizations with filtering
- `GET /api/v1/organizations/:id` - Get organization details
- `PUT /api/v1/organizations/:id` - Update organization
- `POST /api/v1/organizations` - Create new organization
- `DELETE /api/v1/organizations/:id` - Delete organization

**Invitation Management:**
- `POST /api/v1/invitations` - Create organization invitation (requires organizationId in body)
- `POST /api/v1/invitations/internal` - Create internal user invitation (super_admin only)
- `POST /api/v1/invitations/send-email` - Send invitation via email
- `POST /api/v1/invitations/generate-link` - Generate invitation link (client organizations)
- `POST /api/v1/invitations/internal/generate-link` - Generate invitation link (internal only)
- `GET /api/v1/invitations/preview/:code` - Preview invitation details
- `GET /api/v1/invitations/internal/:code` - Get internal invitation details
- `POST /api/v1/invitations/accept` - Accept organization invitation
- `POST /api/v1/invitations/internal/accept` - Accept internal invitation
- `GET /api/v1/invitations` - List organization invitations
- `GET /api/v1/invitations/internal` - List internal invitations (super_admin only)
- `DELETE /api/v1/invitations/:id` - Delete invitation

### Validation Rules

1. **Subscription Tier Validation:**
   - `internal` tier can only be assigned to Teamified organization
   - Client organizations cannot select `internal` tier
   - Enforced in `CreateOrganizationDto` and `UpdateOrganizationDto`

2. **Role Validation:**
   - Internal roles (`super_admin`, `internal_*`) can only be assigned to Teamified organization members
   - Client roles (`client_*`) can only be assigned to client organization members
   - Enforced in invitation creation and role assignment endpoints

3. **Organization Protection:**
   - Teamified organization (slug: `teamified-internal`) cannot be deleted
   - Subscription tier of Teamified cannot be changed from `internal`

## Frontend Implementation

### Key Components

**OrganizationManagementPage:**
- Left panel: Organization list with search and filter
- Right panel: Organization details with tabs
- Subscription tier filter dropdown
- Custom sorting logic for Teamified-first display

**OrganizationInvitationModal:**
- Role filtering based on organization type
- Supports email and link-based invitations
- Shows appropriate role descriptions
- Validates role selection before submission

### Role Display Logic

```typescript
const isInternal = subscriptionTier === 'internal';
const availableRoles = isInternal ? internalRoles : clientRoles;
```

### Tab Management

```typescript
// Hide Billing tab for internal subscription
{selectedOrg?.subscriptionTier !== 'internal' && <Tab label="Billing Details" />}

// Adjust Delete tab index based on Billing visibility
const maxTabIndex = selectedOrg.subscriptionTier === 'internal' ? 2 : 3;
```

## Migration and Compatibility

### Internal User Migration

All existing internal users were migrated to the Teamified organization through SQL migrations:
- Created Teamified organization with `internal` subscription tier
- Created organization memberships for all internal users
- Preserved existing role assignments
- Verification query included to check migration success

### Legacy Role Support

The system maintains backward compatibility with legacy role names:
- `client_member` automatically maps to `client_employee`
- `internal_member` automatically maps to `internal_employee`
- Permissions mapped in `user-roles.service.ts`

## Security Considerations

### Role-Based Access Control

1. **Permission Scoping:**
   - Each role has defined permissions in `user-roles.service.ts`
   - Scope-based access (user, organization, global)
   - Time-based role expiration supported

2. **API Protection:**
   - JWT authentication required for all endpoints
   - Role validation in guards and middleware
   - Organization membership validation before operations

3. **Data Isolation:**
   - Client organizations cannot see other organizations' data
   - Internal roles have cross-organization visibility
   - Audit logging for all sensitive operations

## Best Practices

### For Developers

1. **Creating Organizations:**
   - Always validate subscription tier constraints
   - Check organization slug uniqueness
   - Set appropriate default roles for users

2. **Assigning Roles:**
   - Validate organization type before role assignment
   - Use type-safe role enums
   - Check user's organization membership

3. **UI Development:**
   - Always filter roles based on organization type
   - Handle Teamified organization as special case
   - Maintain consistent subscription tier badge styling

### For Administrators

1. **Managing Internal Staff:**
   - Add all internal team members to Teamified organization
   - Assign appropriate internal roles based on responsibilities
   - Use `internal_employee` as default for general staff

2. **Managing Client Organizations:**
   - Choose appropriate subscription tier based on client needs
   - Assign `client_admin` role to primary contact
   - Use `client_employee` for general team members

## Troubleshooting

### Common Issues

**Issue:** User can't access organization features  
**Solution:** Check that user has appropriate role and organization membership

**Issue:** Wrong roles showing in invitation modal  
**Solution:** Verify `subscriptionTier` prop is passed correctly to modal

**Issue:** Teamified not appearing first in list  
**Solution:** Check sorting logic in `sortedOrganizations` useMemo

**Issue:** Tab navigation broken after switching organizations  
**Solution:** Verify `activeTab` reset logic in useEffect

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-22 | 2.0 | Renamed `internal_member` to `internal_employee`, added complete role documentation |
| 2025-11-22 | 1.1 | Added subscription tier system and Teamified organization |
| 2024-12-19 | 1.0 | Initial organization and role system implementation |

---

*This document is maintained by the Teamified development team and should be updated whenever organization or role-related changes are made to the system.*
