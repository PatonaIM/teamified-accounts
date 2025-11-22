import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Chip,
  Alert,
  Stack,
  IconButton,
  Divider,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as ChangesIcon,
  Download as DownloadIcon,
  RemoveCircle as RevokeIcon,
  History as HistoryIcon,
  Visibility as PreviewIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import RevokeVerificationDialog from './RevokeVerificationDialog';
import VerificationHistoryDialog from './VerificationHistoryDialog';
import { documentsService, type DocumentCategory } from '../../services/documentsService';

interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  category: string;
  status: string | null;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

interface DocumentReviewModalProps {
  open: boolean;
  onClose: () => void;
  document: Document | null;
  onVerify: (action: 'approve' | 'reject' | 'needs_changes', notes: string) => Promise<void>;
  onRevoke?: (reason: string) => Promise<void>;
  onDownload?: (documentId: string) => void;
  isAdmin?: boolean;
}

const DocumentReviewModal: React.FC<DocumentReviewModalProps> = ({
  open,
  onClose,
  document,
  onVerify,
  onRevoke,
  onDownload,
  isAdmin = false,
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'info'>('preview');

  useEffect(() => {
    if (document && open) {
      loadPreview();
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [document?.id, open]);

  const loadPreview = async () => {
    if (!document) return;

    setLoadingPreview(true);
    setPreviewError(null);

    try {
      const url = await documentsService.getDownloadUrl(
        document.id,
        document.category as DocumentCategory
      );
      setPreviewUrl(url);
    } catch (err: any) {
      setPreviewError(err.message || 'Failed to load document preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  if (!document) return null;

  const handleVerify = async (action: 'approve' | 'reject' | 'needs_changes') => {
    setError(null);
    setIsSubmitting(true);

    try {
      await onVerify(action, notes.trim());
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (reason: string) => {
    if (!onRevoke) return;

    try {
      await onRevoke(reason);
      onClose();
    } catch (err: any) {
      throw err; // Let the revoke dialog handle the error
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'needs_changes':
        return 'warning';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Review Document
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="preview">
                <PreviewIcon sx={{ fontSize: 18, mr: 0.5 }} />
                Preview
              </ToggleButton>
              <ToggleButton value="info">
                <InfoIcon sx={{ fontSize: 18, mr: 0.5 }} />
                Info
              </ToggleButton>
            </ToggleButtonGroup>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Document Preview/Info View */}
        {viewMode === 'preview' ? (
          <Box sx={{ mb: 3 }}>
            {loadingPreview ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, bgcolor: 'grey.50', borderRadius: 2 }}>
                <CircularProgress />
              </Box>
            ) : previewError ? (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {previewError}
              </Alert>
            ) : previewUrl ? (
              <Box sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.100', minHeight: 400 }}>
                {document.contentType === 'application/pdf' ? (
                  <iframe
                    src={previewUrl}
                    style={{
                      width: '100%',
                      height: '600px',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                    title={document.fileName}
                  />
                ) : document.contentType.startsWith('image/') ? (
                  <Box
                    component="img"
                    src={previewUrl}
                    alt={document.fileName}
                    sx={{
                      width: '100%',
                      maxHeight: 600,
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                ) : (
                  <Alert severity="info" sx={{ m: 2, borderRadius: 2 }}>
                    Preview not available for this file type. Use the download button to view the document.
                  </Alert>
                )}
              </Box>
            ) : null}
          </Box>
        ) : (
          /* Document Metadata */
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                File Name
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {document.fileName}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {document.category}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Size
                </Typography>
                <Typography variant="body2">{formatFileSize(document.fileSize)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Uploaded
                </Typography>
                <Typography variant="body2">
                  {new Date(document.uploadedAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                Current Status
              </Typography>
              <Chip
                label={document.status || 'Pending'}
                size="small"
                color={getStatusColor(document.status)}
                sx={{ fontWeight: 600, textTransform: 'capitalize' }}
              />
            </Box>

            {document.reviewNotes && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Previous Review Notes
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {document.reviewNotes}
                </Typography>
              </Box>
            )}
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            {onDownload && (
              <Button
                startIcon={<DownloadIcon />}
                onClick={() => onDownload(document.id)}
                variant="outlined"
              >
                Download Document
              </Button>
            )}
            <Button
              startIcon={<HistoryIcon />}
              onClick={() => setShowHistoryDialog(true)}
              variant="outlined"
              color="primary"
            >
              View History
            </Button>
          </Stack>
        </Box>
        )}

        {/* Review Notes */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Review Notes (Optional)"
          placeholder="Enter your review notes (optional)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          helperText="Add any notes or feedback for this document review"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #E5E7EB', p: 3 }}>
        {/* Admin Revocation Section - Only show for approved documents and admin users */}
        {isAdmin && document.status === 'approved' && onRevoke && (
          <>
            <Button
              onClick={() => setShowRevokeDialog(true)}
              variant="outlined"
              color="warning"
              startIcon={<RevokeIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
                mr: 'auto', // Push to left side
              }}
            >
              Revoke Verification
            </Button>
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
          </>
        )}

        {/* Regular Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={isSubmitting}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={() => handleVerify('needs_changes')}
            variant="outlined"
            color="warning"
            startIcon={<ChangesIcon />}
            disabled={isSubmitting}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Request Changes
          </Button>

          <Button
            onClick={() => handleVerify('reject')}
            variant="outlined"
            color="error"
            startIcon={<RejectIcon />}
            disabled={isSubmitting}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Reject
          </Button>

          <Button
            onClick={() => handleVerify('approve')}
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            disabled={isSubmitting}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {isSubmitting ? 'Approving...' : 'Approve'}
          </Button>
        </Box>
      </DialogActions>

      {/* Revoke Verification Dialog */}
      <RevokeVerificationDialog
        open={showRevokeDialog}
        onClose={() => setShowRevokeDialog(false)}
        documentFileName={document.fileName}
        onRevoke={handleRevoke}
      />

      {/* Verification History Dialog */}
      <VerificationHistoryDialog
        open={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
        documentId={document.id}
        documentFileName={document.fileName}
      />
    </Dialog>
  );
};

export default DocumentReviewModal;
