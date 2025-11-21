import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import LayoutMUI from '../components/LayoutMUI';
import CVSelection from '../components/jobs/CVSelection';
import { profileService } from '../services/profileService';
import {
  getJobDetails,
  getApplicationForm,
  submitApplication,
} from '../services/workableService';
import type {
  WorkableJob,
  WorkableApplicationForm,
  WorkableFormField,
} from '../services/workableService';
import { useAuth } from '../hooks/useAuth';

interface CV {
  id: string;
  versionId: string;
  fileName: string;
  isCurrent: boolean;
  uploadedAt: string;
}

const JobApplicationPage: React.FC = () => {
  const { shortcode } = useParams<{ shortcode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const canApply = React.useMemo(() => {
    if (!user) return false;
    const userRoles = user.roles || [];
    return userRoles.some((role: string) => 
      ['candidate', 'admin'].includes(role.toLowerCase())
    );
  }, [user]);

  if (user && !canApply) {
    return <Navigate to="/dashboard" replace />;
  }

  const [job, setJob] = useState<WorkableJob | null>(null);
  const [form, setForm] = useState<WorkableApplicationForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState<Record<string, any>>({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    cover_letter: '',
  });

  const [selectedCV, setSelectedCV] = useState<CV | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = ['Personal Information', 'Select CV', 'Additional Questions'];

  useEffect(() => {
    const loadJobAndFormAndProfile = async () => {
      if (!shortcode) {
        setError('Invalid job shortcode');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [jobData, formDataResponse, profileData] = await Promise.all([
          getJobDetails(shortcode),
          getApplicationForm(shortcode),
          profileService.getProfileData().catch(() => null),
        ]);

        setJob(jobData);
        setForm(formDataResponse);

        if (profileData) {
          setFormData((prev) => ({
            ...prev,
            firstname: profileData.firstName || prev.firstname,
            lastname: profileData.lastName || prev.lastname,
            email: profileData.emailAddress || prev.email,
            phone: profileData.workPhone || profileData.personalMobile || prev.phone,
          }));
        }
      } catch (err: any) {
        console.error('Failed to load application form:', err);
        setError(
          err.response?.data?.message ||
            'Failed to load application form. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadJobAndFormAndProfile();
  }, [shortcode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstname?.trim()) {
      newErrors.firstname = 'First name is required';
    }

    if (!formData.lastname?.trim()) {
      newErrors.lastname = 'Last name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    form?.form_fields?.forEach((field: WorkableFormField) => {
      if (field.required && !formData[field.key]?.trim()) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      const newErrors: Record<string, string> = {};
      if (!formData.firstname?.trim()) newErrors.firstname = 'First name is required';
      if (!formData.lastname?.trim()) newErrors.lastname = 'Last name is required';
      if (!formData.email?.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    } else if (activeStep === 1) {
      setError(null);
    }
    
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      let resumeUrl = '';
      if (selectedCV) {
        try {
          const token = localStorage.getItem('teamified_access_token');
          const API_BASE_URL =
            import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

          const response = await fetch(
            `${API_BASE_URL}/v1/users/me/profile/cv/${selectedCV.versionId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            resumeUrl = data.downloadUrl;
          }
        } catch (cvError) {
          console.error('Failed to get CV download URL:', cvError);
        }
      }

      const applicationData = {
        candidate: {
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          phone: formData.phone,
          cover_letter: formData.cover_letter,
          ...(resumeUrl && { resume: resumeUrl }),
        },
        answers: form?.form_fields
          ?.filter((field: WorkableFormField) => formData[field.key])
          .map((field: WorkableFormField) => ({
            question_key: field.key,
            body: formData[field.key],
          })) || [],
      };

      await submitApplication(shortcode!, applicationData);
      setSuccess(true);
    } catch (err: any) {
      console.error('Failed to submit application:', err);
      setError(
        err.response?.data?.message ||
          'Failed to submit application. Please try again.'
      );
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleSubmit(new Event('submit') as any);
  };

  if (loading) {
    return (
      <LayoutMUI>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </LayoutMUI>
    );
  }

  if (error && !job) {
    return (
      <LayoutMUI>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            onClick={() => navigate('/jobs')}
            startIcon={<ArrowBackIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Back to Jobs
          </Button>
        </Container>
      </LayoutMUI>
    );
  }

  if (success) {
    return (
      <LayoutMUI>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: 'center',
              border: '1px solid #E5E7EB',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'success.main' }}>
              Application Submitted Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Thank you for applying to <strong>{job?.title}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Application submitted on {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 3, 
                bgcolor: 'background.default', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, textAlign: 'left' }}>
                Application Summary
              </Typography>
              <Stack spacing={2} sx={{ textAlign: 'left' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formData.firstname} {formData.lastname}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formData.email}
                  </Typography>
                </Box>
                {selectedCV && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      CV Submitted
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedCV.fileName}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              What Happens Next?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Our hiring team will carefully review your application. If your experience
              matches what we're looking for, we'll reach out to schedule an
              interview. This process typically takes 5-10 business days.
            </Typography>

            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="body2">
                Keep an eye on your email inbox (including spam folder) for updates about your application status.
              </Typography>
            </Alert>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                onClick={() => navigate('/jobs')}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Browse More Jobs
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/profile')}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                View My Profile
              </Button>
            </Stack>
          </Paper>
        </Container>
      </LayoutMUI>
    );
  }

  return (
    <LayoutMUI>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          variant="text"
          onClick={() => navigate(`/jobs/${shortcode}`)}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            mb: 3,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Back to Job Details
        </Button>

        <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Apply for {job?.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Fill out the form below to submit your application
          </Typography>
        </Paper>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleRetry}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E5E7EB' }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {activeStep === 0 && (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Personal Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    We've pre-filled your information from your profile. Please verify and update if needed.
                  </Typography>

                  <TextField
                    required
                    fullWidth
                    label="First Name"
                    value={formData.firstname}
                    onChange={(e) => handleInputChange('firstname', e.target.value)}
                    error={!!errors.firstname}
                    helperText={errors.firstname}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  <TextField
                    required
                    fullWidth
                    label="Last Name"
                    value={formData.lastname}
                    onChange={(e) => handleInputChange('lastname', e.target.value)}
                    error={!!errors.lastname}
                    helperText={errors.lastname}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  <TextField
                    required
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  <TextField
                    fullWidth
                    label="Cover Letter"
                    multiline
                    rows={4}
                    value={formData.cover_letter}
                    onChange={(e) =>
                      handleInputChange('cover_letter', e.target.value)
                    }
                    error={!!errors.cover_letter}
                    helperText={errors.cover_letter || 'Optional - Tell us why you are interested in this position'}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ 
                        borderRadius: 2, 
                        minWidth: 120,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                </>
              )}

              {activeStep === 1 && (
                <>
                  <CVSelection
                    onCVSelect={setSelectedCV}
                    selectedCVId={selectedCV?.id || null}
                  />

                  {errors.cv && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                      {errors.cv}
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      sx={{ 
                        borderRadius: 2, 
                        minWidth: 120,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ 
                        borderRadius: 2, 
                        minWidth: 120,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                </>
              )}

              {activeStep === 2 && (
                <>
                  {form?.form_fields && form.form_fields.length > 0 ? (
                    <>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Additional Questions
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Please answer the following job-specific questions
                      </Typography>

                      {form.form_fields.map((field: WorkableFormField) => (
                        <TextField
                          key={field.id}
                          required={field.required}
                          fullWidth
                          label={field.label}
                          multiline={field.type === 'textarea'}
                          rows={field.type === 'textarea' ? 3 : 1}
                          value={formData[field.key] || ''}
                          onChange={(e) =>
                            handleInputChange(field.key, e.target.value)
                          }
                          error={!!errors[field.key]}
                          helperText={errors[field.key]}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      ))}
                    </>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      No additional questions for this position. You're ready to submit!
                    </Alert>
                  )}

                  <Box sx={{ pt: 3 }}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 3, 
                        bgcolor: 'action.hover', 
                        borderRadius: 2, 
                        mb: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Ready to Submit?
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Please review your information before submitting your application. Once submitted, you cannot edit your application.
                      </Typography>
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        disabled={submitting}
                        sx={{ 
                          borderRadius: 2, 
                          minWidth: 120,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={submitting}
                        sx={{ 
                          borderRadius: 2, 
                          py: 1.5, 
                          flex: 1,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        {submitting ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          'Submit Application'
                        )}
                      </Button>
                    </Box>
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textAlign: 'center', display: 'block', pt: 2 }}
                  >
                    By submitting this application, you agree to our terms and
                    conditions.
                  </Typography>
                </>
              )}
            </Stack>
          </form>
        </Paper>
      </Container>
    </LayoutMUI>
  );
};

export default JobApplicationPage;
