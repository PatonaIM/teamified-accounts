import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LayoutMUI from '../components/LayoutMUI';
import OnboardingStepProfileContact from '../components/onboarding/OnboardingStepProfileContact';
import OnboardingStepDocuments from '../components/onboarding/OnboardingStepDocuments';
import { onboardingService } from '../services/onboardingService';
import { getCurrentUser } from '../services/authService';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(161, 106, 232, 0.1)',
  border: '1px solid rgba(161, 106, 232, 0.1)',
  marginTop: theme.spacing(3),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1.5, 3),
  '&.MuiButton-contained': {
    background: 'linear-gradient(135deg, #A16AE8 0%, #8096FD 100%)',
    boxShadow: '0 4px 15px rgba(161, 106, 232, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #8B5AE8 0%, #6B86FD 100%)',
      boxShadow: '0 6px 20px rgba(161, 106, 232, 0.4)',
    },
  },
}));

const steps = [
  { label: 'Profile & Contact', description: 'Personal information and contact details' },
  { label: 'My Documents', description: 'Upload required documents and submit' },
];

interface OnboardingWizardPageProps {}

const OnboardingWizardPage: React.FC<OnboardingWizardPageProps> = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employmentRecordId, setEmploymentRecordId] = useState<string | null>(null);
  const [hasOnboardingRecord, setHasOnboardingRecord] = useState(false);
  const [stepComplete, setStepComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  // Load onboarding state on mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user's employment records
        const userInfo = await getCurrentUser();
        const token = localStorage.getItem('teamified_access_token') || localStorage.getItem('access_token');
        const employmentResponse = await axios.get(`${API_BASE_URL}/v1/auth/me/employment`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Backend returns array directly, not wrapped in employmentRecords property
        const employmentRecords = Array.isArray(employmentResponse.data) ? employmentResponse.data : [];
        
        // Find employment record in 'onboarding' status
        const onboardingRecord = employmentRecords.find(
          (record: any) => record.status === 'onboarding'
        );

        if (!onboardingRecord) {
          setError('No onboarding record found. You may have already completed onboarding or don\'t have an active onboarding process.');
          setHasOnboardingRecord(false);
          setLoading(false);
          return;
        }

        setEmploymentRecordId(onboardingRecord.id);
        setHasOnboardingRecord(true);

        // Check if onboarding has been submitted
        if (onboardingRecord.onboardingSubmittedAt) {
          setIsAlreadySubmitted(true);
          setSubmittedAt(onboardingRecord.onboardingSubmittedAt);
        }

        // Restore last step from query params or localStorage
        const stepParam = searchParams.get('step');
        const savedStep = stepParam
          ? parseInt(stepParam, 10)
          : onboardingService.getSavedStep(onboardingRecord.id);

        if (savedStep >= 0 && savedStep < steps.length) {
          setActiveStep(savedStep);
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Error checking onboarding status:', err);
        setError(err.message || 'Failed to load onboarding status');
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Save step to localStorage and URL when it changes
  useEffect(() => {
    if (employmentRecordId && activeStep >= 0) {
      onboardingService.saveStep(employmentRecordId, activeStep);
      setSearchParams({ step: activeStep.toString() });
    }
  }, [activeStep, employmentRecordId]);

  const handleNext = () => {
    if (!stepComplete) {
      setError('Please complete all required fields before proceeding');
      return;
    }
    
    setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
    setStepComplete(false);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
    setError(null);
  };

  const handleStepComplete = (complete: boolean) => {
    setStepComplete(complete);
    if (!complete) {
      setError(null);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Your progress will be saved.')) {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async () => {
    if (!employmentRecordId) {
      setError('No employment record found');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('teamified_access_token') || localStorage.getItem('access_token');
      const response = await axios.patch(
        `${API_BASE_URL}/v1/employment-records/${employmentRecordId}/submit-onboarding`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Show success message
      setShowConfirmDialog(false);

      // Redirect to dashboard with success message
      setTimeout(() => {
        navigate('/dashboard', {
          state: {
            message: response.data.message || 'Onboarding submitted successfully!'
          }
        });
      }, 500);
    } catch (error: any) {
      console.error('Error submitting onboarding:', error);
      setError(error.response?.data?.message || 'Failed to submit onboarding. Please try again.');
      setShowConfirmDialog(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitClick = () => {
    if (!stepComplete) {
      setError('Please complete all required fields and upload required documents before submitting');
      return;
    }
    setShowConfirmDialog(true);
  };

  const renderStepContent = () => {
    if (!employmentRecordId) {
      return null;
    }

    switch (activeStep) {
      case 0:
        return (
          <OnboardingStepProfileContact
            employmentRecordId={employmentRecordId}
            onComplete={handleStepComplete}
            onError={setError}
          />
        );
      case 1:
        return (
          <OnboardingStepDocuments
            employmentRecordId={employmentRecordId}
            onComplete={handleStepComplete}
            onError={setError}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <LayoutMUI>
          <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </LayoutMUI>
    );
  }

  if (!hasOnboardingRecord) {
    return (
      <LayoutMUI>
          <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="info">
            {error || 'You don\'t have an active onboarding process. Contact your HR administrator if you believe this is an error.'}
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </Box>
        </Box>
      </LayoutMUI>
    );
  }

  return (
    <LayoutMUI>
          <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #A16AE8 0%, #8096FD 100%)', color: 'white' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Onboarding Wizard
          </Typography>
          <Typography variant="body1">
            Complete your profile to get started with Teamified
          </Typography>
        </Paper>

        {/* Stepper */}
        <StyledCard>
          <CardContent>
            {/* Already Submitted Alert */}
            {isAlreadySubmitted && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Onboarding Already Submitted
                </Typography>
                <Typography variant="body2">
                  Your onboarding was submitted on {submittedAt ? new Date(submittedAt).toLocaleDateString() : 'N/A'}.
                  HR is reviewing your information. You can view your details below but cannot make changes or resubmit.
                </Typography>
              </Alert>
            )}

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    optional={
                      <Typography variant="caption">{step.description}</Typography>
                    }
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Step Content */}
            <Box sx={{ minHeight: '400px' }}>
              {renderStepContent()}
            </Box>

            {/* Navigation Buttons - Hide if already submitted */}
            {!isAlreadySubmitted && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{ borderRadius: 1.5 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    startIcon={<ArrowBackIcon />}
                    sx={{ borderRadius: 1.5 }}
                  >
                    Back
                  </Button>
                </Box>

                <StyledButton
                  variant="contained"
                  onClick={activeStep === steps.length - 1 ? handleSubmitClick : handleNext}
                  disabled={!stepComplete || submitting}
                  endIcon={activeStep === steps.length - 1 ? <CheckIcon /> : <ArrowForwardIcon />}
                >
                  {submitting ? 'Submitting...' : activeStep === steps.length - 1 ? 'Submit for Review' : 'Next'}
                </StyledButton>
              </Box>
            )}
          </CardContent>
        </StyledCard>

        {/* Help Text */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Your progress is automatically saved. You can return to this page anytime to continue.
          </Typography>
        </Box>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onClose={() => !submitting && setShowConfirmDialog(false)}>
          <DialogTitle>Submit Onboarding?</DialogTitle>
          <DialogContent>
            <Typography>
              You're about to submit your onboarding for HR review. Please ensure all required information and documents are complete.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              After submission, your information will be reviewed by the HR team.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setShowConfirmDialog(false)}
              disabled={submitting}
              sx={{ borderRadius: 1.5 }}
            >
              Cancel
            </Button>
            <StyledButton
              onClick={handleSubmit}
              disabled={submitting}
              variant="contained"
            >
              {submitting ? 'Submitting...' : 'Confirm Submit'}
            </StyledButton>
          </DialogActions>
        </Dialog>
      </Box>
    </LayoutMUI>
  );
};

export default OnboardingWizardPage;

