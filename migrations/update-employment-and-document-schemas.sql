-- Story 6.1 and 6.2 Database Schema Updates
-- Add onboarding/offboarding statuses to employment_records
-- Add category column to documents table

-- ============================================================
-- Employment Records: Update Status Constraint
-- ============================================================

-- Drop existing constraint if it exists
ALTER TABLE employment_records DROP CONSTRAINT IF EXISTS chk_employment_status;

-- Add new constraint with onboarding and offboarding statuses
ALTER TABLE employment_records ADD CONSTRAINT chk_employment_status
  CHECK (status IN ('onboarding', 'active', 'inactive', 'offboarding', 'terminated', 'completed'));

-- Add comment
COMMENT ON CONSTRAINT chk_employment_status ON employment_records IS 
  'Employment status constraint including onboarding and offboarding';

-- ============================================================
-- Documents: Add Category Column and Upload Tracking
-- ============================================================

-- Add category column for document classification
ALTER TABLE documents ADD COLUMN IF NOT EXISTS category VARCHAR(50);

-- Add upload tracking columns
ALTER TABLE documents ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS uploaded_by_role VARCHAR(50) DEFAULT 'candidate';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);

-- Add comments
COMMENT ON COLUMN documents.category IS 
  'Document category for classification (cv, identity, employment, education)';
COMMENT ON COLUMN documents.uploaded_by IS 
  'User ID of the person who uploaded this document';
COMMENT ON COLUMN documents.uploaded_by_role IS 
  'Role of the person who uploaded this document (candidate, eor, hr_admin, etc.)';

-- ============================================================
-- Verification Queries
-- ============================================================

-- Verify employment_records constraint
SELECT 
  'employment_records constraint' AS check_type,
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint 
WHERE conrelid = 'employment_records'::regclass 
AND conname = 'chk_employment_status';

-- Verify documents category column
SELECT 
  'documents category column' AS check_type,
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'documents' 
AND column_name = 'category';

