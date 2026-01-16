import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Fade,
  Chip,
  CircularProgress,
  TextField,
  Alert,
  CardActionArea,
  Button,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Public,
  AutoAwesome,
  Verified,
  TrendingUp,
  Videocam,
  Groups,
  Language,
  CalendarToday,
  Psychology,
  BarChart,
  Favorite,
  CheckCircle,
  Star,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { setAccessToken, setRefreshToken, removeTokens, setUserData } from '../services/authService';
import jobSeekerImage from '../assets/images/job-seeker.png';
import businessImage from '../assets/images/business.png';
import PhoneInput from '../components/PhoneInput';

type BusinessStep = 'name' | 'organization';
type SignupFlow = 'selection' | 'candidate' | 'business';

const GoogleSignupPathPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'candidate' | 'employer' | null>(null);
  const [showBusinessFlow, setShowBusinessFlow] = useState(false);
  const [businessStep, setBusinessStep] = useState<BusinessStep>('name');
  const [currentFlow, setCurrentFlow] = useState<SignupFlow>('selection');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileCountryCode, setMobileCountryCode] = useState('AU');
  const [mobileNumber, setMobileNumber] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('AU');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; mobileNumber?: string }>({});

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.roles && user.roles.length > 0) {
      navigate('/dashboard', { replace: true });
    }
    // Pre-fill name from Google profile
    if (user.firstName) {
      setFirstName(user.firstName);
    }
    if (user.lastName) {
      setLastName(user.lastName);
    }
  }, [user, navigate]);

  const handleCandidateClick = () => {
    setCurrentFlow('candidate');
    setError(null);
    setErrors({});
  };

  const validateCandidateNameStep = (): boolean => {
    const newErrors: { firstName?: string; lastName?: string } = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCandidateNameStep()) return;

    setIsLoading(true);
    setLoadingType('candidate');
    setError(null);
    try {
      const response = await api.post('/v1/auth/google/assign-role', {
        roleType: 'candidate',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      if (response.data.accessToken && response.data.refreshToken) {
        setAccessToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);
        if (response.data.user) {
          setUserData(response.data.user);
        }
      }
      await refreshUser();
      navigate('/google-signup-success', { replace: true });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to complete signup';
      if (err?.response?.status === 401) {
        setError('Your session has expired. Please sign in again.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } else {
        setError(errorMessage);
      }
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  const handleBusinessClick = () => {
    setCurrentFlow('business');
    setShowBusinessFlow(true);
    setBusinessStep('name');
    setError(null);
  };

  const validateNameStep = (): boolean => {
    const newErrors: { firstName?: string; lastName?: string; mobileNumber?: string } = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNameContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateNameStep()) {
      setBusinessStep('organization');
      setError(null);
    }
  };

  const handleEmployerSubmit = async () => {
    if (!orgName.trim()) {
      setError('Please enter your organization name');
      return;
    }
    setIsLoading(true);
    setLoadingType('employer');
    setError(null);
    try {
      const response = await api.post('/v1/auth/google/assign-role', {
        roleType: 'client_admin',
        organizationName: orgName.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobileCountryCode,
        mobileNumber: mobileNumber.trim(),
        phoneCountryCode: phoneNumber.trim() ? phoneCountryCode : undefined,
        phoneNumber: phoneNumber.trim() || undefined,
      });
      if (response.data.accessToken && response.data.refreshToken) {
        setAccessToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);
        if (response.data.user) {
          setUserData(response.data.user);
        }
      }
      await refreshUser();
      navigate('/google-signup-success', { replace: true });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to complete signup';
      if (err?.response?.status === 401) {
        setError('Your session has expired. Please sign in again.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } else {
        setError(errorMessage);
      }
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  const handleBackToLogin = () => {
    removeTokens();
    navigate('/login', { replace: true });
  };

  const handleBackToSelection = () => {
    setCurrentFlow('selection');
    setShowBusinessFlow(false);
    setBusinessStep('name');
    setError(null);
    setErrors({});
  };

  const handleBackToNameStep = () => {
    setBusinessStep('name');
    setError(null);
  };

  const jobSeekerFeatures = [
    { icon: <Public fontSize="small" />, text: 'Global opportunities' },
    { icon: <AutoAwesome fontSize="small" />, text: 'AI job matching' },
    { icon: <Verified fontSize="small" />, text: 'Verified employers' },
    { icon: <TrendingUp fontSize="small" />, text: 'Career growth' },
  ];

  const businessFeatures = [
    { icon: <Videocam fontSize="small" />, text: 'AI video screening' },
    { icon: <Groups fontSize="small" />, text: '250,000+ candidates' },
    { icon: <Language fontSize="small" />, text: 'Hire in 50+ countries' },
    { icon: <CalendarToday fontSize="small" />, text: 'Hire in days, not weeks' },
  ];

  const stats = [
    { icon: <Psychology />, text: '5,000+ AI Interviews' },
    { icon: <BarChart />, text: '1,000+ Roles Filled' },
    { icon: <Favorite />, text: '50+ Countries' },
  ];

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#F5F7F8',
          gap: 3,
        }}
      >
        <CircularProgress sx={{ color: '#9333EA' }} />
        <Button
          variant="text"
          onClick={handleBackToLogin}
          sx={{ 
            color: '#9333EA', 
            textTransform: 'none',
            '&:hover': { textDecoration: 'underline', backgroundColor: 'transparent' }
          }}
        >
          Go back to Login
        </Button>
      </Box>
    );
  }

  // Candidate flow - Name step (no phone numbers)
  if (currentFlow === 'candidate') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#F5F7F8',
        }}
      >
        <Box
          sx={{
            width: '100%',
            py: 2,
            px: 4,
            bgcolor: 'white',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#1a1a1a',
              letterSpacing: '-0.02em',
            }}
          >
            teamified
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: { xs: 2, md: 4 },
          }}
        >
          <Container maxWidth="sm">
            <Fade in timeout={400}>
              <Card
                elevation={8}
                sx={{
                  padding: { xs: 3, sm: 4 },
                  borderRadius: 3,
                  backgroundColor: 'white',
                }}
              >
                <Box component="form" onSubmit={handleCandidateSubmit} noValidate>
                  <Box mb={4}>
                    <Typography
                      variant="h4"
                      component="h1"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        color: '#1a1a1a',
                      }}
                    >
                      What's your name?
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6b7280' }}>
                      We'd love to know who we're working with
                    </Typography>
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 4 }}>
                    <Box>
                      <Typography
                        component="label"
                        sx={{
                          display: 'block',
                          mb: 1,
                          fontWeight: 500,
                          color: '#1a1a1a',
                          fontSize: '0.875rem',
                        }}
                      >
                        First Name
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (errors.firstName) {
                            setErrors(prev => ({ ...prev, firstName: undefined }));
                          }
                        }}
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                        disabled={isLoading}
                        autoFocus
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'white',
                            borderRadius: 2,
                            '& fieldset': { borderColor: '#E5E7EB' },
                            '&:hover fieldset': { borderColor: '#9333EA' },
                            '&.Mui-focused fieldset': { borderColor: '#9333EA', borderWidth: 2 },
                          },
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography
                        component="label"
                        sx={{
                          display: 'block',
                          mb: 1,
                          fontWeight: 500,
                          color: '#1a1a1a',
                          fontSize: '0.875rem',
                        }}
                      >
                        Last Name
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Smith"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          if (errors.lastName) {
                            setErrors(prev => ({ ...prev, lastName: undefined }));
                          }
                        }}
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                        disabled={isLoading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'white',
                            borderRadius: 2,
                            '& fieldset': { borderColor: '#E5E7EB' },
                            '&:hover fieldset': { borderColor: '#9333EA' },
                            '&.Mui-focused fieldset': { borderColor: '#9333EA', borderWidth: 2 },
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleBackToSelection}
                      disabled={isLoading}
                      startIcon={<ArrowBack />}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        borderColor: '#E5E7EB',
                        color: '#9333EA',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#9333EA',
                          bgcolor: '#F5F7F8',
                        },
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={isLoading || !firstName.trim() || !lastName.trim()}
                      endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        backgroundColor: '#9333EA',
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: '0 4px 14px rgba(147, 51, 234, 0.4)',
                        '&:hover': {
                          backgroundColor: '#7C3AED',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#D8B4FE',
                          color: 'white',
                        },
                      }}
                    >
                      {isLoading ? 'Creating account...' : 'Get Started'}
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Fade>
          </Container>
        </Box>
      </Box>
    );
  }

  // Business flow - Step 1: Name
  if (showBusinessFlow && businessStep === 'name') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#F5F7F8',
        }}
      >
        <Box
          sx={{
            width: '100%',
            py: 2,
            px: 4,
            bgcolor: 'white',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#1a1a1a',
              letterSpacing: '-0.02em',
            }}
          >
            teamified
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: { xs: 2, md: 4 },
          }}
        >
          <Container maxWidth="sm">
            <Fade in timeout={400}>
              <Card
                elevation={8}
                sx={{
                  padding: { xs: 3, sm: 4 },
                  borderRadius: 3,
                  backgroundColor: 'white',
                }}
              >
                <Box component="form" onSubmit={handleNameContinue} noValidate>
                  <Box mb={4}>
                    <Typography
                      variant="h4"
                      component="h1"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        color: '#1a1a1a',
                      }}
                    >
                      What's your name?
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6b7280' }}>
                      We'd love to know who we're working with
                    </Typography>
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                    <Box>
                      <Typography
                        component="label"
                        sx={{
                          display: 'block',
                          mb: 1,
                          fontWeight: 500,
                          color: '#1a1a1a',
                          fontSize: '0.875rem',
                        }}
                      >
                        First Name
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (errors.firstName) {
                            setErrors(prev => ({ ...prev, firstName: undefined }));
                          }
                        }}
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                        disabled={isLoading}
                        autoFocus
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'white',
                            borderRadius: 2,
                            '& fieldset': { borderColor: '#E5E7EB' },
                            '&:hover fieldset': { borderColor: '#9333EA' },
                            '&.Mui-focused fieldset': { borderColor: '#9333EA', borderWidth: 2 },
                          },
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography
                        component="label"
                        sx={{
                          display: 'block',
                          mb: 1,
                          fontWeight: 500,
                          color: '#1a1a1a',
                          fontSize: '0.875rem',
                        }}
                      >
                        Last Name
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Smith"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          if (errors.lastName) {
                            setErrors(prev => ({ ...prev, lastName: undefined }));
                          }
                        }}
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                        disabled={isLoading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'white',
                            borderRadius: 2,
                            '& fieldset': { borderColor: '#E5E7EB' },
                            '&:hover fieldset': { borderColor: '#9333EA' },
                            '&.Mui-focused fieldset': { borderColor: '#9333EA', borderWidth: 2 },
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography
                      component="label"
                      sx={{
                        display: 'block',
                        mb: 1,
                        fontWeight: 500,
                        color: '#1a1a1a',
                        fontSize: '0.875rem',
                      }}
                    >
                      Mobile Number
                    </Typography>
                    <PhoneInput
                      countryCode={mobileCountryCode}
                      phoneNumber={mobileNumber}
                      onCountryChange={setMobileCountryCode}
                      onPhoneChange={(value) => {
                        setMobileNumber(value);
                        if (errors.mobileNumber) {
                          setErrors(prev => ({ ...prev, mobileNumber: undefined }));
                        }
                      }}
                      label=""
                      error={!!errors.mobileNumber}
                      helperText={errors.mobileNumber}
                      disabled={isLoading}
                      required
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography
                      component="label"
                      sx={{
                        display: 'block',
                        mb: 1,
                        fontWeight: 500,
                        color: '#1a1a1a',
                        fontSize: '0.875rem',
                      }}
                    >
                      Phone Number{' '}
                      <Typography component="span" sx={{ color: '#9CA3AF', fontWeight: 400 }}>
                        (optional)
                      </Typography>
                    </Typography>
                    <PhoneInput
                      countryCode={phoneCountryCode}
                      phoneNumber={phoneNumber}
                      onCountryChange={setPhoneCountryCode}
                      onPhoneChange={setPhoneNumber}
                      label=""
                      disabled={isLoading}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    <Button
                      variant="outlined"
                      onClick={handleBackToSelection}
                      disabled={isLoading}
                      startIcon={<ArrowBack />}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderColor: '#E5E7EB',
                        color: '#1a1a1a',
                        '&:hover': {
                          borderColor: '#9333EA',
                          bgcolor: 'rgba(147, 51, 234, 0.04)',
                        },
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading || !firstName.trim() || !lastName.trim() || !mobileNumber.trim()}
                      endIcon={<ArrowForward />}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        bgcolor: '#9333EA',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#A855F7',
                        },
                        '&:active': {
                          bgcolor: '#7E22CE',
                        },
                        '&:disabled': {
                          bgcolor: 'rgba(147, 51, 234, 0.5)',
                          color: 'white',
                        },
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Fade>
          </Container>
        </Box>
      </Box>
    );
  }

  // Business flow - Step 2: Organization
  if (showBusinessFlow && businessStep === 'organization') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#F5F7F8',
        }}
      >
        <Box
          sx={{
            width: '100%',
            py: 2,
            px: 4,
            bgcolor: 'white',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#1a1a1a',
              letterSpacing: '-0.02em',
            }}
          >
            teamified
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: { xs: 2, md: 4 },
          }}
        >
          <Container maxWidth="sm">
            <Fade in timeout={400}>
              <Card
                elevation={8}
                sx={{
                  padding: { xs: 3, sm: 4 },
                  borderRadius: 3,
                  backgroundColor: 'white',
                }}
              >
                <Box textAlign="center" mb={3}>
                  <Typography
                    variant="h4"
                    component="h1"
                    fontWeight="bold"
                    sx={{ color: '#1a1a1a', mb: 1 }}
                  >
                    Tell us about your organization
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    This helps us set up your hiring workspace
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Organization Name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g., Acme Corporation"
                  sx={{ mb: 3 }}
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                  onClick={handleEmployerSubmit}
                  disabled={isLoading || !orgName.trim()}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    mb: 2,
                    backgroundColor: '#9333EA',
                    '&:hover': { backgroundColor: '#7C3AED' },
                  }}
                >
                  {isLoading ? 'Setting up...' : 'Continue'}
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  startIcon={<ArrowBack />}
                  onClick={handleBackToNameStep}
                  disabled={isLoading}
                  sx={{ 
                    textTransform: 'none', 
                    color: '#9333EA',
                    '&:hover': { backgroundColor: 'rgba(147, 51, 234, 0.08)' },
                  }}
                >
                  Back
                </Button>
              </Card>
            </Fade>
          </Container>
        </Box>
      </Box>
    );
  }

  // Main selection screen
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F5F7F8',
      }}
    >
      <Box
        sx={{
          width: '100%',
          py: 2,
          px: 4,
          bgcolor: 'white',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '1.25rem',
            color: '#1a1a1a',
            letterSpacing: '-0.02em',
          }}
        >
          teamified
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: { xs: 2, md: 4 },
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={600}>
            <Box>
              <Box textAlign="center" mb={5}>
                <Typography
                  variant="h3"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: '#1a1a1a',
                    fontSize: { xs: '2rem', md: '2.75rem' },
                  }}
                >
                  Let's get started
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 400, color: '#6b7280' }}>
                  Tell us who you are
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                  {error}
                </Alert>
              )}

              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' }, 
                  gap: 4,
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <Card
                  elevation={8}
                  sx={{
                    flex: 1,
                    maxWidth: { md: 420 },
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    opacity: isLoading && loadingType !== 'candidate' ? 0.6 : 1,
                    pointerEvents: isLoading ? 'none' : 'auto',
                    '&:hover': {
                      boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
                      transform: 'translateY(-6px)',
                    },
                  }}
                >
                  <CardActionArea onClick={handleCandidateClick} sx={{ height: '100%' }} disabled={isLoading}>
                    <Box
                      sx={{
                        position: 'relative',
                        height: 200,
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: 6,
                          height: '100%',
                          backgroundColor: '#7c3aed',
                          zIndex: 1,
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={jobSeekerImage}
                        alt="Job Seeker"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                        I'm a Job Seeker
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Find your next global opportunity with AI-powered matching
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, justifyContent: 'center' }}>
                        {jobSeekerFeatures.map((feature, index) => (
                          <Chip
                            key={index}
                            icon={feature.icon}
                            label={feature.text}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: '#e0e0e0',
                              backgroundColor: '#f5f5f5',
                              '& .MuiChip-icon': { color: '#666' },
                            }}
                          />
                        ))}
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          color: '#7c3aed',
                          fontWeight: 600,
                          fontSize: '1rem',
                        }}
                      >
                        {loadingType === 'candidate' ? (
                          <>
                            <CircularProgress size={16} sx={{ color: '#7c3aed' }} />
                            Setting up...
                          </>
                        ) : (
                          <>
                            Get Started
                            <ArrowForward fontSize="small" />
                          </>
                        )}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>

                <Card
                  elevation={8}
                  sx={{
                    flex: 1,
                    maxWidth: { md: 420 },
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    opacity: isLoading && loadingType !== 'employer' ? 0.6 : 1,
                    pointerEvents: isLoading ? 'none' : 'auto',
                    '&:hover': {
                      boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
                      transform: 'translateY(-6px)',
                    },
                  }}
                >
                  <CardActionArea onClick={handleBusinessClick} sx={{ height: '100%' }} disabled={isLoading}>
                    <Box
                      sx={{
                        position: 'relative',
                        height: 200,
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: 6,
                          height: '100%',
                          backgroundColor: '#7c3aed',
                          zIndex: 1,
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={businessImage}
                        alt="Business"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                        We're a Business
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Build your dream team with pre-screened global talent
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, justifyContent: 'center' }}>
                        {businessFeatures.map((feature, index) => (
                          <Chip
                            key={index}
                            icon={feature.icon}
                            label={feature.text}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: '#e0e0e0',
                              backgroundColor: '#f5f5f5',
                              '& .MuiChip-icon': { color: '#666' },
                            }}
                          />
                        ))}
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          color: '#7c3aed',
                          fontWeight: 600,
                          fontSize: '1rem',
                        }}
                      >
                        Get Started
                        <ArrowForward fontSize="small" />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>

              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={handleBackToLogin}
                  sx={{
                    color: '#9333EA',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    backgroundColor: 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(147, 51, 234, 0.08)',
                    },
                  }}
                >
                  Back to Login
                </Button>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                  flexWrap: 'wrap',
                  mb: 5,
                }}
              >
                {stats.map((stat, index) => (
                  <Chip
                    key={index}
                    icon={stat.icon}
                    label={stat.text}
                    variant="filled"
                    sx={{
                      backgroundColor: 'white',
                      color: '#1a1a1a',
                      px: 1,
                      py: 2.5,
                      borderRadius: 10,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      '& .MuiChip-icon': { color: '#9333EA' },
                      '& .MuiChip-label': { fontWeight: 500 },
                    }}
                  />
                ))}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 4,
                  flexWrap: 'wrap',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircle sx={{ fontSize: 18, color: '#9333EA' }} />
                  <Typography variant="body2" sx={{ color: '#4a4a4a' }}>
                    500+ Companies Trust Us
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Star sx={{ fontSize: 18, color: '#fbbf24' }} />
                  <Typography variant="body2" sx={{ color: '#4a4a4a' }}>
                    4.9/5 Average Rating
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>
    </Box>
  );
};

export default GoogleSignupPathPage;
