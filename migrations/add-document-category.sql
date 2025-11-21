-- Add category column to documents table for document classification
-- This allows categorization of HR_DOCUMENT types (identity, employment, education, etc.)

ALTER TABLE documents ADD COLUMN IF NOT EXISTS category VARCHAR(50);

-- Create index for category for faster filtering
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);

-- Add comment
COMMENT ON COLUMN documents.category IS 'Document category for classification (cv, identity, employment, education)';

