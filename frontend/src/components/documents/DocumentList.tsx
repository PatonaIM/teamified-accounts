import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Pending as PendingIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { documentsService, type Document, type DocumentCategory, FILE_CONSTRAINTS } from '../../services/documentsService';
import { formatBytes } from '../../utils/format';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(161, 106, 232, 0.1)',
  border: '1px solid rgba(161, 106, 232, 0.1)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  fontWeight: 600,
  padding: theme.spacing(1.5, 3),
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface DocumentListProps {
  category: DocumentCategory;
  employmentRecordId?: string;
  onDocumentChange?: () => void;
  embedded?: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({
  category,
  employmentRecordId,
  onDocumentChange,
  embedded = false,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versionHistory, setVersionHistory] = useState<Document[]>([]);

  // Load documents for category
  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await documentsService.getDocumentsByCategory(category);
      // Filter to show only current versions by default
      const currentDocs = docs.filter(d => d.isCurrent);
      setDocuments(currentDocs);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [category]);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear previous messages
    setError(null);
    setSuccess(null);

    // Validate file
    const validation = documentsService.validateFile(file, category);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      // Reset input
      event.target.value = '';
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate progress (actual progress would need backend support)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await documentsService.uploadDocument(file, category, {
        employmentRecordId,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      setSuccess(`${file.name} uploaded successfully`);
      
      // Reload documents
      await loadDocuments();
      onDocumentChange?.();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset input
      event.target.value = '';
    }
  };

  // Handle document delete
  const handleDelete = async (doc: Document) => {
    // Prevent deletion of verified documents (backend uses 'approved')
    if (doc.status === 'verified' || doc.status === 'approved') {
      setError('Verified documents cannot be deleted. Contact HR if you need to update this document.');
      setTimeout(() => setError(null), 5000);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${doc.fileName}?`)) {
      return;
    }

    try {
      await documentsService.deleteDocument(doc.id, category);
      setSuccess('Document deleted successfully');
      await loadDocuments();
      onDocumentChange?.();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Delete failed:', err);
      setError(err.message || 'Failed to delete document');
    }
  };

  // Handle document download
  const handleDownload = async (doc: Document) => {
    try {
      await documentsService.downloadDocument(doc.id, doc.fileName, category);
    } catch (err: any) {
      console.error('Download failed:', err);
      setError(err.message || 'Failed to download document');
    }
  };

  // Handle version history
  const handleViewHistory = async () => {
    try {
      setShowVersionHistory(true);
      const history = await documentsService.getVersionHistory(category);
      setVersionHistory(history);
    } catch (err: any) {
      console.error('Failed to load version history:', err);
      setError(err.message || 'Failed to load version history');
    }
  };

  // Render status badge
  const renderStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'approved':
      case 'verified':
        return (
          <Tooltip title="Document has been verified by HR">
            <Chip
              icon={<CheckCircleIcon />}
              label="Verified"
              color="success"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Tooltip>
        );
      case 'needs_changes':
        return (
          <Tooltip title="Document needs changes - see HR notes">
            <Chip
              icon={<WarningIcon />}
              label="Needs Changes"
              color="warning"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Tooltip>
        );
      case 'pending':
        return (
          <Tooltip title="Document is pending review">
            <Chip
              icon={<PendingIcon />}
              label="Pending"
              color="info"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Tooltip>
        );
      default:
        return (
          <Chip
            label="Uploaded"
            size="small"
            variant="outlined"
          />
        );
    }
  };

  // Get file constraints for current category
  const constraints = FILE_CONSTRAINTS[category];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Error/Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Uploading... {uploadProgress}%
          </Typography>
        </Box>
      )}

      {/* Upload Button & Actions */}
      <Box sx={{ mb: 3, px: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <StyledButton
          component="label"
          variant="contained"
          startIcon={<UploadIcon />}
          disabled={uploading}
        >
          Upload {category === 'cv' ? 'CV' : category.charAt(0).toUpperCase() + category.slice(1)}
          <VisuallyHiddenInput
            type="file"
            accept={constraints.allowedExtensions.join(',')}
            onChange={handleFileUpload}
          />
        </StyledButton>

        {documents.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={handleViewHistory}
            sx={{ borderRadius: 1.5 }}
          >
            Version History
          </Button>
        )}

        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            ml: 'auto',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Max size: {constraints.maxSize / (1024 * 1024)}MB | Formats: {constraints.allowedExtensions.join(', ')}
        </Typography>
      </Box>

      {/* Documents Table */}
      {documents.length === 0 ? (
        <StyledCard>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No documents uploaded yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload your first {category} document to get started
            </Typography>
          </CardContent>
        </StyledCard>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(161, 106, 232, 0.05)' }}>
                <TableCell sx={{ fontWeight: 600 }}>File Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Uploaded</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Version</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {doc.fileName}
                    </Typography>
                    {doc.reviewNotes && doc.status === 'needs_changes' && (
                      <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                        Note: {doc.reviewNotes}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatBytes(doc.fileSize)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {renderStatusBadge(doc.status)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={doc.isCurrent ? 'Current' : 'Old'}
                      size="small"
                      variant={doc.isCurrent ? 'filled' : 'outlined'}
                      color={doc.isCurrent ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Download">
                        <IconButton size="small" onClick={() => handleDownload(doc)}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={doc.status === 'verified' || doc.status === 'approved' ? 'Verified documents cannot be deleted' : 'Delete'}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(doc)}
                            disabled={doc.status === 'verified' || doc.status === 'approved'}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Version History Dialog */}
      <Dialog
        open={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Version History - {category.toUpperCase()}</DialogTitle>
        <DialogContent>
          {versionHistory.length === 0 ? (
            <Typography color="text.secondary">No version history available</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell>Uploaded</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Version</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {versionHistory.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.fileName}</TableCell>
                      <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{formatBytes(doc.fileSize)}</TableCell>
                      <TableCell>
                        <Chip
                          label={doc.isCurrent ? 'Current' : doc.versionId.substring(0, 8)}
                          size="small"
                          variant={doc.isCurrent ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>{renderStatusBadge(doc.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVersionHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentList;

