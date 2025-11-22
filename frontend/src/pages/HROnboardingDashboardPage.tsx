import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Button,
  Container,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Close, Settings, CheckCircle } from '@mui/icons-material';
import LayoutMUI from '../components/LayoutMUI';
import CandidateCard from '../components/hr/CandidateCard';
import DocumentReviewModal from '../components/hr/DocumentReviewModal';
import DocumentReviewList from '../components/hr/DocumentReviewList';
import BulkActionToolbar from '../components/hr/BulkActionToolbar';
import DashboardStatistics from '../components/hr/DashboardStatistics';
import OnboardingFilters, { type OnboardingFilterState } from '../components/hr/OnboardingFilters';
import DocumentRequirementsModal from '../components/hr/DocumentRequirementsModal';
import hrOnboardingService, { type OnboardingCandidate } from '../services/hrOnboardingService';
import { documentsService, type DocumentCategory } from '../services/documentsService';
import { useAuth } from '../hooks/useAuth';

const HROnboardingDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<OnboardingCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<OnboardingCandidate | null>(null);
  const [candidateDocuments, setCandidateDocuments] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCompleteConfirmation, setShowCompleteConfirmation] = useState(false);
  const [isCompletingOnboarding, setIsCompletingOnboarding] = useState(false);

  // Check if user is admin
  const isAdmin = user?.roles?.includes('admin') || false;

  // Filtering state
  const [filters, setFilters] = useState<OnboardingFilterState>({
    search: '',
    status: 'all',
    category: 'all',
    dateRange: 'all',
    candidateStatus: 'all',
  });

  useEffect(() => {
    loadCandidates();
  }, [filters.search]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await hrOnboardingService.getOnboardingCandidates(filters.search || undefined);
      setCandidates(response.candidates);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load onboarding candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateClick = async (candidate: OnboardingCandidate) => {
    setSelectedCandidate(candidate);
    setSelectedDocumentIds([]); // Clear selection when switching candidates
    setLoadingDocuments(true);
    try {
      const documents = await hrOnboardingService.getCandidateDocuments(candidate.userId);
      setCandidateDocuments(documents);
    } catch (err) {
      console.error('Failed to load candidate documents:', err);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleDocumentClick = (document: any) => {
    setSelectedDocument(document);
    setShowReviewModal(true);
  };

  const handleDownloadDocument = async (documentId: string) => {
    if (!selectedDocument) return;

    try {
      await documentsService.downloadDocument(
        documentId,
        selectedDocument.fileName,
        selectedDocument.category as DocumentCategory
      );
      setSnackbarMessage('Document download started');
      setSnackbarOpen(true);
    } catch (err: any) {
      setSnackbarMessage(err.message || 'Failed to download document');
      setSnackbarOpen(true);
    }
  };

  const handleVerifyDocument = async (action: 'approve' | 'reject' | 'needs_changes', notes: string) => {
    if (!selectedDocument) return;

    await hrOnboardingService.verifyDocument(selectedDocument.id, { action, notes });

    // Reload documents and candidates
    if (selectedCandidate) {
      const documents = await hrOnboardingService.getCandidateDocuments(selectedCandidate.userId);
      setCandidateDocuments(documents);

      // Reload candidates to get updated progress
      await loadCandidates();

      // Update selectedCandidate with the refreshed data
      const response = await hrOnboardingService.getOnboardingCandidates();
      const updatedCandidate = response.candidates.find(c => c.userId === selectedCandidate.userId);
      if (updatedCandidate) {
        setSelectedCandidate(updatedCandidate);
      }
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'needs_changes', notes: string) => {
    try {
      const response = await hrOnboardingService.bulkVerifyDocuments({
        documentIds: selectedDocumentIds,
        action,
        notes,
      });

      // Show success message
      setSnackbarMessage(
        `Bulk action completed: ${response.success} succeeded, ${response.failed} failed`
      );
      setSnackbarOpen(true);

      // Reload documents and candidates
      if (selectedCandidate) {
        const documents = await hrOnboardingService.getCandidateDocuments(selectedCandidate.userId);
        setCandidateDocuments(documents);

        // Reload candidates to get updated progress
        await loadCandidates();

        // Update selectedCandidate with the refreshed data
        const candidatesResponse = await hrOnboardingService.getOnboardingCandidates();
        const updatedCandidate = candidatesResponse.candidates.find(c => c.userId === selectedCandidate.userId);
        if (updatedCandidate) {
          setSelectedCandidate(updatedCandidate);
        }
      }
      setSelectedDocumentIds([]);
    } catch (err: any) {
      throw err; // Let the toolbar handle the error display
    }
  };

  const handleRevokeVerification = async (reason: string) => {
    if (!selectedDocument) return;

    await hrOnboardingService.revokeVerification(selectedDocument.id, { reason });

    // Reload documents and candidates
    if (selectedCandidate) {
      const documents = await hrOnboardingService.getCandidateDocuments(selectedCandidate.userId);
      setCandidateDocuments(documents);

      // Reload candidates to get updated progress
      await loadCandidates();

      // Update selectedCandidate with the refreshed data
      const response = await hrOnboardingService.getOnboardingCandidates();
      const updatedCandidate = response.candidates.find(c => c.userId === selectedCandidate.userId);
      if (updatedCandidate) {
        setSelectedCandidate(updatedCandidate);
      }
    }

    // Show success message
    setSnackbarMessage('Verification revoked successfully');
    setSnackbarOpen(true);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'needs_changes': return 'warning';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const calculateProgress = (candidate: OnboardingCandidate) => {
    let totalExpected = 0;
    let totalVerified = 0;
    Object.values(candidate.documentProgress).forEach((progress) => {
      totalExpected += progress.total;
      totalVerified += progress.verified;
    });
    return totalExpected > 0 ? (totalVerified / totalExpected) * 100 : 0;
  };

  const handleFilterPreset = (preset: 'all' | 'complete' | 'in_progress' | 'pending_review' | 'needs_changes') => {
    switch (preset) {
      case 'all':
        setFilters({ search: filters.search, status: 'all', category: 'all', dateRange: 'all', candidateStatus: 'all' });
        break;
      case 'complete':
        setFilters({ ...filters, candidateStatus: 'complete' });
        break;
      case 'in_progress':
        setFilters({ ...filters, candidateStatus: 'incomplete' });
        break;
      case 'pending_review':
        setFilters({ ...filters, status: 'pending' });
        break;
      case 'needs_changes':
        setFilters({ ...filters, status: 'needs_changes' });
        break;
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!selectedCandidate) return;

    setIsCompletingOnboarding(true);
    try {
      const response = await hrOnboardingService.completeOnboarding(selectedCandidate.userId);

      setSnackbarMessage(response.message || 'Onboarding completed successfully');
      setSnackbarOpen(true);
      setShowCompleteConfirmation(false);
      setSelectedCandidate(null);

      // Reload candidates list
      await loadCandidates();
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Failed to complete onboarding');
      setSnackbarOpen(true);
    } finally {
      setIsCompletingOnboarding(false);
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    // Apply candidate status filter
    if (filters.candidateStatus !== 'all') {
      const progress = calculateProgress(candidate);
      if (filters.candidateStatus === 'complete' && progress !== 100) return false;
      if (filters.candidateStatus === 'incomplete' && progress === 100) return false;
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const daysAgo = parseInt(filters.dateRange);
      const submittedDate = new Date(candidate.submittedAt);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      if (submittedDate < cutoffDate) return false;
    }

    return true;
  });

  return (
    <LayoutMUI>
      <Container maxWidth="xl">
        <Box sx={{ py: 3 }}>
          {/* Statistics */}
          <DashboardStatistics
            candidates={candidates}
            onFilterPreset={handleFilterPreset}
            loading={loading}
          />

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Filters with Document Requirements Button */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 3, 
              border: '1px solid', 
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Search & Filter
              </Typography>
              {isAdmin && (
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  onClick={() => setShowSettingsModal(true)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Document Requirements
                </Button>
              )}
            </Box>
            <OnboardingFilters
              filters={filters}
              onFiltersChange={setFilters}
              onSearchChange={(search) => setFilters({ ...filters, search })}
            />
          </Paper>

          {/* Candidates Grid */}
          {loading ? (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 8, 
                borderRadius: 3, 
                border: '1px solid', 
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CircularProgress />
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredCandidates.map((candidate) => (
                <Grid item xs={12} md={6} lg={4} key={candidate.employmentRecordId}>
                  <CandidateCard candidate={candidate} onClick={handleCandidateClick} />
                </Grid>
              ))}
              {filteredCandidates.length === 0 && (
                <Grid item xs={12}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 8, 
                      borderRadius: 3, 
                      border: '1px solid', 
                      borderColor: 'divider',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h6" color="text.secondary">
                      No candidates found matching your filters
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}

          {/* Candidate Documents Dialog */}
          <Dialog
            open={!!selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
            maxWidth="md"
            fullWidth
            PaperProps={{ 
              sx: { 
                borderRadius: 3,
                bgcolor: 'background.paper',
              } 
            }}
          >
            {selectedCandidate && (
              <>
                <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {selectedCandidate.userName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedCandidate.userEmail}
                      </Typography>
                    </Box>
                    <IconButton onClick={() => setSelectedCandidate(null)} sx={{ color: 'text.secondary' }}>
                      <Close />
                    </IconButton>
                  </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                  {loadingDocuments ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      <BulkActionToolbar
                        numSelected={selectedDocumentIds.length}
                        onBulkAction={handleBulkAction}
                        onClearSelection={() => setSelectedDocumentIds([])}
                      />
                      <DocumentReviewList
                        documents={candidateDocuments}
                        selectedDocumentIds={selectedDocumentIds}
                        onDocumentClick={handleDocumentClick}
                        onSelectionChange={setSelectedDocumentIds}
                      />
                    </>
                  )}
                </DialogContent>
                {selectedCandidate && selectedCandidate.employmentStatus !== 'active' && (
                  <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                      variant="contained"
                      startIcon={<CheckCircle />}
                      onClick={() => setShowCompleteConfirmation(true)}
                      disabled={calculateProgress(selectedCandidate) !== 100}
                      color="success"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 3,
                      }}
                    >
                      Complete Onboarding
                    </Button>
                  </DialogActions>
                )}
              </>
            )}
          </Dialog>

          {/* Complete Onboarding Confirmation Dialog */}
          <Dialog
            open={showCompleteConfirmation}
            onClose={() => !isCompletingOnboarding && setShowCompleteConfirmation(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ 
              sx: { 
                borderRadius: 3,
                bgcolor: 'background.paper',
              } 
            }}
          >
            <DialogTitle sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              pb: 2,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle sx={{ color: 'success.main', fontSize: 28 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Complete Onboarding
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3, mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to complete onboarding for <strong>{selectedCandidate?.userName}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This will change their employment status from "Onboarding" to "Active" and grant them full access to the system.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                onClick={() => setShowCompleteConfirmation(false)}
                disabled={isCompletingOnboarding}
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleCompleteOnboarding}
                disabled={isCompletingOnboarding}
                startIcon={isCompletingOnboarding ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                color="success"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                }}
              >
                {isCompletingOnboarding ? 'Completing...' : 'Complete Onboarding'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Document Review Modal */}
          <DocumentReviewModal
            open={showReviewModal}
            onClose={() => {
              setShowReviewModal(false);
              setSelectedDocument(null);
            }}
            document={selectedDocument}
            onVerify={handleVerifyDocument}
            onRevoke={handleRevokeVerification}
            onDownload={handleDownloadDocument}
            isAdmin={isAdmin}
          />

          {/* Success Snackbar */}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
            message={snackbarMessage}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          />

          {/* Document Requirements Settings Modal */}
          <DocumentRequirementsModal
            open={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            onSuccess={() => {
              setSnackbarMessage('Document requirements updated successfully');
              setSnackbarOpen(true);
            }}
          />
        </Box>
      </Container>
    </LayoutMUI>
  );
};

export default HROnboardingDashboardPage;
