-- Multitenancy Foundation Migration
-- This migration sets up the core multitenancy structure
-- IMPORTANT: Old invitation system remains functional
-- New multitenancy invitations use a separate table

-- =====================================================
-- STEP 1: Create organizations table
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  industry VARCHAR(100) DEFAULT NULL,
  company_size VARCHAR(20) DEFAULT NULL,
  logo_url TEXT DEFAULT NULL,
  settings JSONB DEFAULT '{}',
  subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'professional', 'enterprise')),
  subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- =====================================================
-- STEP 2: Create organization_members table
-- =====================================================
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  invited_by UUID DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_organization_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_status ON organization_members(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_members_unique ON organization_members(organization_id, user_id);

-- =====================================================
-- STEP 3: Create organization_invitations table
-- =====================================================
-- Note: Old 'invitations' table remains unchanged for backward compatibility
-- New invitations for multitenancy use 'organization_invitations' table
CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invite_code VARCHAR(100) UNIQUE NOT NULL,
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_type VARCHAR(50) NOT NULL CHECK (role_type IN (
    'candidate',
    'client_admin',
    'client_hr',
    'client_finance',
    'client_recruiter',
    'client_employee',
    'super_admin',
    'internal_hr',
    'internal_recruiter',
    'internal_account_manager',
    'internal_finance',
    'internal_marketing'
  )),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for organization_invitations
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_invitations_invite_code ON organization_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_org_invitations_organization_id ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invitations_status ON organization_invitations(status);
CREATE INDEX IF NOT EXISTS idx_org_invitations_expires_at ON organization_invitations(expires_at);

-- =====================================================
-- STEP 4: Create special organizations
-- =====================================================

-- Insert special organizations (idempotent - only if they don't exist)
INSERT INTO organizations (id, name, slug, industry, company_size, subscription_tier, subscription_status, settings)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'Public Tenant',
    'public-tenant',
    'Platform',
    'N/A',
    'free',
    'active',
    '{"special": true, "type": "public"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Teamified Internal',
    'teamified-internal',
    'Technology',
    'Small',
    'enterprise',
    'active',
    '{"special": true, "type": "internal"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Test Tenant',
    'test-tenant',
    'Technology',
    'Small',
    'free',
    'active',
    '{"special": true, "type": "test"}'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- STEP 5: Migrate existing users to appropriate organizations
-- =====================================================

-- Identify and setup internal users (super_admin role holders)
-- These users should belong ONLY to Teamified Internal organization
DO $$
DECLARE
  internal_org_id UUID := '00000000-0000-0000-0000-000000000002';
BEGIN
  -- Add users with super_admin role to Teamified Internal org
  INSERT INTO organization_members (organization_id, user_id, status, joined_at)
  SELECT DISTINCT 
    internal_org_id,
    ur.user_id,
    'active',
    NOW()
  FROM user_roles ur
  WHERE ur.role_type IN ('super_admin', 'internal_hr', 'internal_recruiter', 
                         'internal_account_manager', 'internal_finance', 'internal_marketing')
  ON CONFLICT (organization_id, user_id) DO NOTHING;
END $$;

-- Migrate all other existing users to Test Tenant
-- Exclude internal users (those with super_admin or internal_* roles)
DO $$
DECLARE
  test_org_id UUID := '00000000-0000-0000-0000-000000000003';
BEGIN
  INSERT INTO organization_members (organization_id, user_id, status, joined_at)
  SELECT DISTINCT
    test_org_id,
    u.id,
    'active',
    NOW()
  FROM users u
  WHERE u.id NOT IN (
    SELECT DISTINCT ur.user_id 
    FROM user_roles ur 
    WHERE ur.role_type IN ('super_admin', 'internal_hr', 'internal_recruiter', 
                           'internal_account_manager', 'internal_finance', 'internal_marketing')
  )
  ON CONFLICT (organization_id, user_id) DO NOTHING;
END $$;

-- =====================================================
-- STEP 5: Update user roles to be tenant-scoped
-- =====================================================

-- Update existing client user roles to be tenant-scoped to Test Tenant
DO $$
DECLARE
  test_org_id UUID := '00000000-0000-0000-0000-000000000003';
BEGIN
  -- Update roles for users in Test Tenant (exclude internal users)
  UPDATE user_roles ur
  SET 
    scope = 'tenant',
    scope_entity_id = test_org_id,
    role_type = CASE
      WHEN role_type = 'admin' THEN 'client_admin'
      WHEN role_type = 'hr_manager_client' THEN 'client_hr'
      WHEN role_type = 'recruiter' THEN 'client_recruiter'
      WHEN role_type = 'eor' THEN 'client_employee'
      WHEN role_type = 'hr' THEN 'client_hr'
      ELSE role_type
    END
  WHERE ur.user_id IN (
    SELECT user_id 
    FROM organization_members 
    WHERE organization_id = test_org_id
  )
  AND ur.role_type NOT IN ('super_admin', 'internal_hr', 'internal_recruiter', 
                           'internal_account_manager', 'internal_finance', 'internal_marketing');

  -- Ensure internal roles remain global scope
  UPDATE user_roles
  SET scope = 'global', scope_entity_id = NULL
  WHERE role_type IN ('super_admin', 'internal_hr', 'internal_recruiter', 
                      'internal_account_manager', 'internal_finance', 'internal_marketing');
END $$;

-- =====================================================
-- STEP 6: Verification queries (commented out - run manually if needed)
-- =====================================================

-- Verify special organizations were created
-- SELECT id, name, slug FROM organizations WHERE slug IN ('public-tenant', 'teamified-internal', 'test-tenant');

-- Verify internal users belong ONLY to Teamified Internal
-- SELECT u.email, o.name as organization_name
-- FROM organization_members om
-- JOIN users u ON om.user_id = u.id
-- JOIN organizations o ON om.organization_id = o.id
-- JOIN user_roles ur ON u.id = ur.user_id
-- WHERE ur.role_type IN ('super_admin', 'internal_hr', 'internal_recruiter', 
--                        'internal_account_manager', 'internal_finance', 'internal_marketing')
--   AND o.slug != 'teamified-internal';
-- Expected result: 0 rows

-- Verify Test Tenant has client users
-- SELECT COUNT(*) as test_tenant_members
-- FROM organization_members
-- WHERE organization_id = '00000000-0000-0000-0000-000000000003';

-- Verify user roles are properly scoped
-- SELECT role_type, scope, COUNT(*) 
-- FROM user_roles 
-- GROUP BY role_type, scope 
-- ORDER BY role_type;

-- =====================================================
-- ROLLBACK INSTRUCTIONS
-- =====================================================
-- If you need to rollback this migration:
--
-- 1. Drop the new organization_invitations table:
--    DROP TABLE organization_invitations CASCADE;
--
-- 2. Remove organization memberships created by this migration:
--    DELETE FROM organization_members 
--    WHERE organization_id IN (
--      SELECT id FROM organizations 
--      WHERE slug IN ('public-tenant', 'teamified-internal', 'test-tenant')
--    );
--
-- 3. Remove special organizations:
--    DELETE FROM organizations 
--    WHERE slug IN ('public-tenant', 'teamified-internal', 'test-tenant');
--
-- 4. Revert user roles to original scope (if any were updated):
--    UPDATE user_roles SET scope = 'all', scope_entity_id = NULL
--    WHERE scope = 'tenant' OR scope = 'global';
--
-- Note: The old 'invitations' table is unchanged and remains fully functional.
-- WARNING: Only perform rollback if no new data has been created with the new schema!
