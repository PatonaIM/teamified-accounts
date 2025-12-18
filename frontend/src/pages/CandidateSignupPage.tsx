import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  Container,
  Fade,
  FormControlLabel,
  Checkbox,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { candidateSignup } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { checkAndHandleMarketingRedirect, preserveMarketingSourceFromUrl, getMarketingSource, isMarketingSource } from '../services/marketingRedirectService';

const CandidateSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  
  const searchParams = new URLSearchParams(location.search);
  const emailParam = searchParams.get('email') || '';
  const returnUrl = searchParams.get('returnUrl') || '/account';
  const intent = searchParams.get('intent') || '';
  const sourceParam = searchParams.get('source');

  React.useEffect(() => {
    if (isMarketingSource(sourceParam)) {
      preserveMarketingSourceFromUrl();
    }
  }, [sourceParam]);

  const [formData, setFormData] = useState({
    email: emailParam,
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    termsAccepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = 'First name must not exceed 50 characters';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = 'Last name must not exceed 50 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await candidateSignup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      try {
        await refreshUser();
        
        const hasMarketingSource = getMarketingSource();
        if (hasMarketingSource) {
          const redirected = await checkAndHandleMarketingRedirect();
          if (redirected) return;
        }
        
        navigate(returnUrl);
      } catch (refreshError) {
        console.error('Failed to refresh user after signup:', refreshError);
        const { removeTokens } = await import('../services/authService');
        removeTokens();
        setSuccessMessage('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Candidate signup error:', error);
      setErrors({
        general: error.message || 'Failed to create account. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (intent === 'candidate' || intent === 'client') {
      const loginParams = new URLSearchParams();
      if (returnUrl !== '/account') {
        loginParams.set('returnUrl', returnUrl);
      }
      navigate(`/login${loginParams.toString() ? `?${loginParams.toString()}` : ''}`);
    } else {
      navigate(`/signup-select?email=${encodeURIComponent(formData.email)}${returnUrl !== '/account' ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={600}>
          <Paper
            elevation={24}
            sx={{
              padding: { xs: 3, sm: 4, md: 5 },
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
            }}
          >
            <Box textAlign="center" mb={4}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                fontWeight="bold"
                color="primary"
              >
                Job Seeker Sign Up
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create your account in under 30 seconds
              </Typography>
            </Box>

            {errors.general && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errors.general}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                margin="normal"
                required
                disabled={isLoading}
              />

              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
                margin="normal"
                required
                autoFocus
                disabled={isLoading}
              />

              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
                margin="normal"
                required
                disabled={isLoading}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={!!errors.password}
                helperText={errors.password || 'At least 8 characters'}
                margin="normal"
                required
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={isLoading}
                        sx={{
                          color: isLoading ? 'rgba(0, 0, 0, 0.26)' : 'inherit',
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                margin="normal"
                required
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        disabled={isLoading}
                        sx={{
                          color: isLoading ? 'rgba(0, 0, 0, 0.26)' : 'inherit',
                        }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.termsAccepted}
                      onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                      disabled={isLoading}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      I accept the{' '}
                      <Link
                        href="https://teamified.com/legal/term"
                        target="_blank"
                        rel="noopener noreferrer"
                        color="primary"
                      >
                        Terms
                      </Link>
                      {' '}and{' '}
                      <Link
                        href="https://teamified.com/legal/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        color="primary"
                      >
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                />
                {errors.termsAccepted && (
                  <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                    {errors.termsAccepted}
                  </Typography>
                )}
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Create Account'
                )}
              </Button>

              <Box textAlign="center" mt={2}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  disabled={isLoading}
                  sx={{ textTransform: 'none' }}
                >
                  {intent === 'candidate' || intent === 'client' ? 'Back to Login' : 'Back to Selection'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default CandidateSignupPage;
