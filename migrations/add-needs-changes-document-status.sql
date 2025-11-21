-- Migration: Add 'needs_changes' to document status constraint
-- Story 6.5: HR Review Dashboard
-- Date: 2025-10-23

-- Drop the existing constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS chk_document_status;

-- Add the new constraint with 'needs_changes' included
ALTER TABLE documents ADD CONSTRAINT chk_document_status
    CHECK (status IN ('pending', 'approved', 'rejected', 'needs_changes') OR status IS NULL);

-- Comment for documentation
COMMENT ON CONSTRAINT chk_document_status ON documents IS
    'Valid document statuses: pending (awaiting review), approved (verified by HR), rejected (rejected by HR), needs_changes (HR requested changes), or null (no review status)';
