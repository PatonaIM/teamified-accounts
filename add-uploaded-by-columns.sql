-- Add uploaded_by and uploaded_by_role columns to documents table
-- These columns track who uploaded the document and in what capacity

-- Add uploaded_by column (references users table)
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add uploaded_by_role column (tracks the role/capacity of uploader)
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS uploaded_by_role VARCHAR(50) DEFAULT 'candidate';

-- Create index for uploaded_by for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);

-- Update existing records to set uploaded_by based on user_id or eor_profile_id
-- For documents with user_id, set uploaded_by to that user_id
UPDATE documents 
SET uploaded_by = user_id 
WHERE user_id IS NOT NULL AND uploaded_by IS NULL;

-- For documents with eor_profile_id, find the user from eor_profiles and set uploaded_by
UPDATE documents d
SET uploaded_by = ep.user_id,
    uploaded_by_role = 'EOR'
FROM eor_profiles ep
WHERE d.eor_profile_id = ep.id 
  AND d.uploaded_by IS NULL;

-- Add comment to explain the columns
COMMENT ON COLUMN documents.uploaded_by IS 'User ID of the person who uploaded the document';
COMMENT ON COLUMN documents.uploaded_by_role IS 'Role/capacity in which the document was uploaded (candidate, EOR, admin, etc.)';

