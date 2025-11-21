import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Grid,
  Alert
} from '@mui/material';
import {
  Upload as UploadIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import LayoutMUI from '../components/LayoutMUI';

interface Document {
  id: string;
  name: string;
  type: 'payslip' | 'contract' | 'policy' | 'form' | 'other';
  category: 'hr' | 'finance' | 'legal' | 'training';
  uploadedAt: string;
  size: string;
  status: 'active' | 'archived' | 'expired';
  description?: string;
}

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Payslip - August 2025',
      type: 'payslip',
      category: 'finance',
      uploadedAt: '2025-08-31',
      size: '245 KB',
      status: 'active',
      description: 'Monthly payslip for August 2025'
    },
    {
      id: '2',
      name: 'Employment Contract',
      type: 'contract',
      category: 'hr',
      uploadedAt: '2025-01-15',
      size: '1.2 MB',
      status: 'active',
      description: 'Signed employment contract and terms'
    },
    {
      id: '3',
      name: 'Employee Handbook',
      type: 'policy',
      category: 'hr',
      uploadedAt: '2025-01-10',
      size: '3.8 MB',
      status: 'active',
      description: 'Company policies and procedures'
    },
    {
      id: '4',
      name: 'Payslip - July 2025',
      type: 'payslip',
      category: 'finance',
      uploadedAt: '2025-07-31',
      size: '238 KB',
      status: 'active',
      description: 'Monthly payslip for July 2025'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'other' as Document['type'],
    category: 'hr' as Document['category'],
    description: ''
  });

  const documentTypeLabels = {
    payslip: 'Payslip',
    contract: 'Contract',
    policy: 'Policy',
    form: 'Form',
    other: 'Other'
  };

  const categoryLabels = {
    hr: 'Human Resources',
    finance: 'Finance',
    legal: 'Legal',
    training: 'Training'
  };

  const statusColors = {
    active: 'badge--success',
    archived: 'badge--secondary',
    expired: 'badge--error'
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUploadDocument = async () => {
    if (!newDocument.name || !newDocument.type || !newDocument.category) {
      alert('Please fill in all required fields');
      return;
    }

    const document: Document = {
      id: Date.now().toString(),
      ...newDocument,
      uploadedAt: new Date().toISOString().split('T')[0],
      size: '0 KB', // Would be calculated from actual file
      status: 'active'
    };

    try {
      // TODO: Connect to backend API - POST /api/v1/documents
      console.log('Uploading document:', document);
      
      setDocuments(prev => [document, ...prev]);
      setNewDocument({
        name: '',
        type: 'other',
        category: 'hr',
        description: ''
      });
      setShowUploadForm(false);
      
      // Show success toast
    } catch (error) {
      console.error('Failed to upload document:', error);
      // Show error toast
    }
  };

  const handleDownloadDocument = async (documentId: string) => {
    try {
      // TODO: Connect to backend API - GET /api/v1/documents/{id}/download
      console.log('Downloading document:', documentId);
      
      // Simulate download
      const doc = documents.find(d => d.id === documentId);
      if (doc) {
        const link = document.createElement('a');
        link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(doc.name)}`;
        link.download = doc.name;
        link.click();
      }
      
      // Show success toast
    } catch (error) {
      console.error('Failed to download document:', error);
      // Show error toast
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      // TODO: Connect to backend API - DELETE /api/v1/documents/{id}
      console.log('Deleting document:', documentId);
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      // Show success toast
    } catch (error) {
      console.error('Failed to delete document:', error);
      // Show error toast
    }
  };

  const getDocumentIcon = (type: Document['type']) => {
    switch (type) {
      case 'payslip':
        return (
          <svg className="icon icon-32" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'contract':
        return (
          <svg className="icon icon-32" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'policy':
        return (
          <svg className="icon icon-32" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      default:
        return (
          <svg className="icon icon-32" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
    }
  };

  return (
    <LayoutMUI>
      <Box>
        {/* Header Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(161, 106, 232, 0.05) 0%, rgba(128, 150, 253, 0.05) 100%)',
            border: '1px solid rgba(161, 106, 232, 0.1)'
          }}
        >
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                color: 'primary.main',
                mb: 2,
                fontFamily: 'Plus Jakarta Sans, sans-serif'
              }}
            >
              Documents
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 400,
                lineHeight: 1.6,
                mb: 2
              }}
            >
              Access and manage your HR documents, payslips, and company policies. 
              Keep all your important employment documents organized and easily accessible.
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> This page currently shows sample data. For CV management, please visit the{' '}
                <a href="/cv" style={{ color: '#A16AE8', textDecoration: 'underline' }}>CV Management page</a>.
                Tax documents and payslips will be integrated in a future update.
              </Typography>
            </Alert>
          </Box>
        </Paper>

        {/* Documents Content */}
        <Box sx={{ mb: 4 }}>
          {/* Search and Filters */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                  Document Management
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Search, filter, and manage your documents
                </Typography>
              </Box>
              <Button
                onClick={() => setShowUploadForm(!showUploadForm)}
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                sx={{
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                {showUploadForm ? 'Cancel' : 'Upload Document'}
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 300, maxWidth: 400 }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Paper>

          {/* Upload Form */}
          {showUploadForm && (
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Upload New Document
              </Typography>
              <Stack spacing={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Document Name"
                      value={newDocument.name}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter document name"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Document Type</InputLabel>
                      <Select
                        value={newDocument.type}
                        onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value as Document['type'] }))}
                        label="Document Type"
                      >
                        {Object.entries(documentTypeLabels).map(([value, label]) => (
                          <MenuItem key={value} value={value}>{label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={newDocument.category}
                        onChange={(e) => setNewDocument(prev => ({ ...prev, category: e.target.value as Document['category'] }))}
                        label="Category"
                      >
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <MenuItem key={value} value={value}>{label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<UploadIcon />}
                      sx={{ height: '56px' }}
                    >
                      Choose File
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      />
                    </Button>
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  multiline
                  rows={3}
                  value={newDocument.description}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the document"
                  inputProps={{ maxLength: 500 }}
                  helperText={`${newDocument.description.length}/500 characters`}
                />
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    onClick={() => setShowUploadForm(false)}
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUploadDocument}
                    variant="contained"
                    startIcon={<UploadIcon />}
                  >
                    Upload Document
                  </Button>
                </Box>
              </Stack>
            </Paper>
          )}

          {/* Documents List */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Documents ({filteredDocuments.length})
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Your uploaded and shared documents
            </Typography>
            
            {filteredDocuments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No documents found matching your criteria
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {filteredDocuments.map((document) => (
                  <Paper key={document.id} elevation={0} sx={{ p: 3, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ color: 'primary.main', mt: 0.5 }}>
                          <DescriptionIcon />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {document.name}
                            </Typography>
                            <Chip
                              label={document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                              color={document.status === 'active' ? 'success' : document.status === 'archived' ? 'default' : 'error'}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {documentTypeLabels[document.type]} • {categoryLabels[document.category]}
                          </Typography>
                          {document.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {document.description}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Uploaded: {document.uploadedAt} • Size: {document.size}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={() => handleDownloadDocument(document.id)}
                          color="primary"
                          size="small"
                        >
                          <DownloadIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteDocument(document.id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Box>
      </Box>
    </LayoutMUI>
  );
};

export default DocumentsPage;
