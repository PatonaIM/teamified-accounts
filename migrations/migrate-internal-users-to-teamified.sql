-- Data Migration: Move internal users to Teamified organization
-- Date: 2025-11-22
-- Description: Creates organization memberships for all internal users in the Teamified organization

-- Step 1: Get Teamified organization ID (store in variable for reuse)
DO $$
DECLARE
  teamified_org_id UUID;
  internal_user RECORD;
  membership_count INT := 0;
BEGIN
  -- Get Teamified organization ID
  SELECT id INTO teamified_org_id
  FROM organizations
  WHERE slug = 'teamified-internal';

  IF teamified_org_id IS NULL THEN
    RAISE EXCEPTION 'Teamified organization not found. Please run add-internal-subscription-tier-and-teamified.sql first.';
  END IF;

  RAISE NOTICE 'Found Teamified organization with ID: %', teamified_org_id;

  -- Loop through all internal users and create memberships
  FOR internal_user IN
    SELECT DISTINCT u.id, u.email, u.first_name, u.last_name
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    WHERE ur.role_type IN (
      'super_admin',
      'internal_hr',
      'internal_finance',
      'internal_account_manager',
      'internal_recruiter',
      'internal_marketing',
      'internal_member'
    )
    AND u.deleted_at IS NULL
  LOOP
    -- Insert membership if it doesn't already exist
    INSERT INTO organization_members (
      organization_id,
      user_id,
      status,
      joined_at
    )
    VALUES (
      teamified_org_id,
      internal_user.id,
      'active',
      NOW()
    )
    ON CONFLICT (organization_id, user_id) DO NOTHING;

    -- Check if row was inserted
    IF FOUND THEN
      membership_count := membership_count + 1;
      RAISE NOTICE 'Added membership for user: % % (%)', internal_user.first_name, internal_user.last_name, internal_user.email;
    ELSE
      RAISE NOTICE 'Membership already exists for user: % % (%)', internal_user.first_name, internal_user.last_name, internal_user.email;
    END IF;
  END LOOP;

  RAISE NOTICE 'Migration complete. Added % new memberships to Teamified organization.', membership_count;
END $$;

-- Verification query
SELECT 
  o.name AS organization_name,
  u.email,
  u.first_name,
  u.last_name,
  ur.role_type,
  om.status AS membership_status,
  om.joined_at
FROM organization_members om
JOIN organizations o ON om.organization_id = o.id
JOIN users u ON om.user_id = u.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE o.slug = 'teamified-internal'
ORDER BY ur.role_type, u.email;
