-- Migration: Add onboarding and offboarding statuses to employment_records
-- Date: 2025-10-20
-- Description: Updates the employment status constraint to include 'onboarding' and 'offboarding' statuses

-- Drop the old constraint
ALTER TABLE employment_records DROP CONSTRAINT IF EXISTS chk_employment_status;

-- Add the new constraint with all 6 statuses
ALTER TABLE employment_records ADD CONSTRAINT chk_employment_status 
  CHECK (status IN ('onboarding', 'active', 'inactive', 'offboarding', 'terminated', 'completed'));

-- Also update the CHK_employment_status constraint (uppercase) if it exists
ALTER TABLE employment_records DROP CONSTRAINT IF EXISTS CHK_employment_status;

