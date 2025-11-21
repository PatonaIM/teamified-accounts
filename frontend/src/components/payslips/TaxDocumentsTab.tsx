/**
 * Tax Documents Tab Component
 * Upload and manage tax documents
 * Story 7.6 - Payroll Self-Service
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/authService';

interface TaxDocument {
  id: string;
  fileName: string;
  fileSize: number;
  status: 'pending' | 'approved' | 'rejected' | null;
  reviewNotes: string | null;
  uploadedAt: string;
  reviewedAt: string | null;
}

const statusColors: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

export const TaxDocumentsTab: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<TaxDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [countryId, setCountryId] = useState('');
  const [uploading, setUploading] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchDocuments();
  }, [statusFilter]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await api.get('/v1/payroll/tax-documents', { params });
      setDocuments(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch tax documents:', err);
      setError(err.response?.data?.message || 'Failed to load tax documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !countryId) {
      setError('Please select a file and country');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('countryId', countryId);
      if (description) {
        formData.append('description', description);
      }

      await api.post('/v1/payroll/tax-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Tax document uploaded successfully!');
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setDescription('');
      setCountryId('');
      fetchDocuments();
    } catch (err: any) {
      console.error('Failed to upload tax document:', err);
      setError(err.response?.data?.message || 'Failed to upload tax document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      const response = await api.get(`/v1/payroll/tax-documents/${documentId}/download`);
      const { downloadUrl } = response.data;
      window.open(downloadUrl, '_blank');
    } catch (err: any) {
      console.error('Failed to download document:', err);
      setError(err.response?.data?.message || 'Failed to download document');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.delete(`/v1/payroll/tax-documents/${documentId}`);
      setSuccess('Document deleted successfully');
      fetchDocuments();
    } catch (err: any) {
      console.error('Failed to delete document:', err);
      setError(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="600">
            Tax Documents
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchDocuments} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="primary"
              startIcon={<UploadIcon />}
              onClick={() => setUploadDialogOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Upload Document
            </Button>
          </Box>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            select
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ 
              minWidth: 200,
              '& .MuiSvgIcon-root': {
                color: 'text.secondary',
              },
            }}
            size="small"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>File Name</strong></TableCell>
                  <TableCell><strong>Size</strong></TableCell>
                  <TableCell><strong>Uploaded</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Notes</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.fileName}</TableCell>
                    <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                    <TableCell>
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={doc.status?.toUpperCase() || 'N/A'}
                        color={doc.status ? statusColors[doc.status] : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {doc.reviewNotes ? (
                        <Tooltip title={doc.reviewNotes}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              maxWidth: 200, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}
                          >
                            {doc.reviewNotes}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Download">
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(doc.id)}
                          color="primary"
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(doc.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && documents.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No tax documents found. Upload your tax documents to get started.
            </Typography>
          </Box>
        )}
      </Paper>

      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Tax Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Country"
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                required
                sx={{
                  '& .MuiSvgIcon-root': {
                    color: 'text.secondary',
                  },
                }}
              >
                <MenuItem value="country-1">India</MenuItem>
                <MenuItem value="country-2">Philippines</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ py: 2, textTransform: 'none', fontWeight: 600 }}
              >
                {selectedFile ? selectedFile.name : 'Select File'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />
              </Button>
              {selectedFile && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Size: {formatFileSize(selectedFile.size)}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any notes about this document..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setUploadDialogOpen(false)} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            color="primary"
            disabled={!selectedFile || !countryId || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
