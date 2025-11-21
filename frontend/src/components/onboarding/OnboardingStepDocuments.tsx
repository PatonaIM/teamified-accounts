import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import DocumentTabs from '../documents/DocumentTabs';
import { documentsService } from '../../services/documentsService';

interface OnboardingStepDocumentsProps {
  employmentRecordId: string;
  onComplete: (complete: boolean) => void;
  onError: (error: string | null) => void;
}

const OnboardingStepDocuments: React.FC<OnboardingStepDocumentsProps> = ({
  employmentRecordId,
  onComplete,
  onError,
}) => {
  const [loading, setLoading] = useState(true);
  const [documentCounts, setDocumentCounts] = useState({
    cv: 0,
    identity: 0,
    employment: 0,
    education: 0,
  });

  // Check if step is complete (at least one document uploaded)
  const checkCompletion = (counts: typeof documentCounts) => {
    const totalDocuments = counts.cv + counts.identity + counts.employment + counts.education;
    const isComplete = totalDocuments > 0;
    onComplete(isComplete);
    return isComplete;
  };

  // Load document counts
  const loadDocumentCounts = async () => {
    try {
      setLoading(true);
      const counts = await documentsService.getDocumentCounts();
      setDocumentCounts(counts);
      checkCompletion(counts);
      onError(null);
    } catch (error: any) {
      console.error('Failed to load document counts:', error);
      onError(error.message || 'Failed to load documents');
      onComplete(false);
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadDocumentCounts();
  }, []);

  // Handle document changes (upload/delete)
  const handleDocumentsChange = () => {
    loadDocumentCounts();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalDocuments = documentCounts.cv + documentCounts.identity + documentCounts.employment + documentCounts.education;

  return (
    <Box>
      {/* Step Instructions */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1A1A1A', mb: 2 }}>
          Upload Required Documents
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Please upload the necessary documents for your onboarding process. At least one document is required to proceed.
        </Typography>
        
        {/* Progress Indicator */}
        {totalDocuments === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Required:</strong> Upload at least one document to continue. We recommend starting with your CV.
            </Typography>
          </Alert>
        ) : (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Great!</strong> You've uploaded {totalDocuments} document{totalDocuments !== 1 ? 's' : ''}. 
              You can continue to the next step or upload additional documents.
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Document Tabs */}
      <DocumentTabs
        employmentRecordId={employmentRecordId}
        onDocumentsChange={handleDocumentsChange}
        embedded={true}
      />

      {/* Help Text */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(161, 106, 232, 0.05)', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Tip:</strong> You can upload multiple versions of the same document type. 
          The most recent upload will be marked as the current version. 
          Verified documents cannot be deleted - contact HR if changes are needed.
        </Typography>
      </Box>
    </Box>
  );
};

export default OnboardingStepDocuments;

