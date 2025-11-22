-- Migration: Add internal subscription tier and create Teamified organization
-- Date: 2025-11-22
-- Description: Adds 'internal' subscription tier, website column, and creates Teamified organization

-- Step 1: Add website column to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS website TEXT;

-- Step 2: Drop existing subscription_tier check constraint
ALTER TABLE organizations
DROP CONSTRAINT IF EXISTS organizations_subscription_tier_check;

-- Step 3: Add new subscription_tier check constraint with 'internal' included
ALTER TABLE organizations
ADD CONSTRAINT organizations_subscription_tier_check
CHECK (subscription_tier IN ('free', 'basic', 'professional', 'enterprise', 'internal'));

-- Step 4: Insert Teamified organization (with conflict handling for idempotency)
INSERT INTO organizations (
  name,
  slug,
  industry,
  website,
  subscription_tier,
  subscription_status,
  settings
)
VALUES (
  'Teamified',
  'teamified-internal',
  'Recruitment',
  'https://teamified.com/',
  'internal',
  'active',
  '{}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  industry = EXCLUDED.industry,
  website = EXCLUDED.website,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_status = EXCLUDED.subscription_status;

-- Verification queries (optional - for manual testing)
-- SELECT * FROM organizations WHERE slug = 'teamified-internal';
-- SELECT constraint_name, check_clause FROM information_schema.check_constraints WHERE constraint_name = 'organizations_subscription_tier_check';
