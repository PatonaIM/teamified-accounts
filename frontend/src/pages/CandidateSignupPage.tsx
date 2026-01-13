import React, { useState, useCallback, useRef } from 'react';
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
  Login as LoginIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import PasswordRequirements, { isPasswordValid } from '../components/PasswordRequirements';
import { useNavigate, useLocation } from 'react-router-dom';
import { candidateSignup } from '../services/authService';

const CandidateSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const emailParam = searchParams.get('email') || '';
  const returnUrl = searchParams.get('returnUrl') || '/account';
  const intent = searchParams.get('intent') || '';

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
  const [emailExists, setEmailExists] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [lastCheckedEmail, setLastCheckedEmail] = useState('');
  const latestEmailRef = useRef(formData.email);
  
  // Keep ref in sync with email changes
  latestEmailRef.current = formData.email.toLowerCase().trim();

  const checkEmailExists = useCallback(async (email: string) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailExists(false);
      setEmailChecked(false);
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    setIsCheckingEmail(true);
    try {
      const response = await fetch('/api/v1/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await response.json();
      // Only update state if this response matches the CURRENT email (use ref for latest value)
      if (normalizedEmail === latestEmailRef.current) {
        // valid === true means email exists in database (user already registered)
        // valid === false means email is available for signup
        setEmailExists(data.valid === true);
        setEmailChecked(true);
        setLastCheckedEmail(normalizedEmail);
      }
    } catch (error) {
      console.error('Error checking email:', error);
      // Only update error state if email still matches
      if (normalizedEmail === latestEmailRef.current) {
        setEmailExists(false);
        setEmailChecked(false);
      }
    } finally {
      setIsCheckingEmail(false);
    }
  }, []);

  const handleEmailBlur = () => {
    if (formData.email && /\S+@\S+\.\S+/.test(formData.email)) {
      checkEmailExists(formData.email);
    }
  };

  const handleLoginRedirect = () => {
    const loginParams = new URLSearchParams();
    loginParams.set('email', formData.email);
    if (returnUrl !== '/account') {
      loginParams.set('returnUrl', returnUrl);
    }
    navigate(`/login?${loginParams.toString()}`);
  };

  const handleUseDifferentEmail = () => {
    setFormData(prev => ({ ...prev, email: '' }));
    setEmailExists(false);
    setEmailChecked(false);
    setErrors(prev => ({ ...prev, email: '' }));
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (field === 'email') {
      setEmailExists(false);
      setEmailChecked(false);
      setLastCheckedEmail('');
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
    } else if (!isPasswordValid(formData.password)) {
      newErrors.password = 'Password does not meet all requirements';
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

    // Run form validation first to show errors to user
    if (!validateForm()) {
      return;
    }

    // Compute if the email check is valid for current input
    const normalizedCurrentEmail = formData.email.toLowerCase().trim();
    const emailCheckIsValid = emailChecked && lastCheckedEmail === normalizedCurrentEmail;
    
    // Don't proceed if email check is in progress
    if (isCheckingEmail) {
      return;
    }
    
    // If email check is valid and email exists, block progression
    if (emailCheckIsValid && emailExists) {
      return;
    }
    
    // If email hasn't been checked for current input, trigger check
    if (!emailCheckIsValid && formData.email && /\S+@\S+\.\S+/.test(formData.email)) {
      checkEmailExists(formData.email);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await candidateSignup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      navigate('/signup-success', { replace: true });
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
        flexDirection: 'column',
        bgcolor: '#F5F7F8',
      }}
    >
      {/* Header with Teamified Logo */}
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
                onBlur={handleEmailBlur}
                error={!!errors.email || emailExists}
                helperText={errors.email}
                margin="normal"
                required
                autoFocus
                disabled={isLoading || isCheckingEmail}
                InputProps={{
                  endAdornment: isCheckingEmail ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null,
                }}
              />

              {/* Email Exists Inline Error */}
              {emailExists && (
                <Box
                  sx={{
                    bgcolor: '#FEF3C7',
                    border: '1px solid #FCD34D',
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                    mt: 1,
                  }}
                >
                  <Typography
                    sx={{
                      color: '#1a1a1a',
                      fontSize: '0.9rem',
                    }}
                  >
                    Account exists. Are you trying to{' '}
                    <Box
                      component="a"
                      href="/login"
                      sx={{
                        color: '#9333EA',
                        fontWeight: 600,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      login
                    </Box>
                    ?
                  </Typography>
                </Box>
              )}

              {/* Only show remaining fields if email doesn't exist - keep visible during check but disabled */}
              {!emailExists && (
                <>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    margin="normal"
                    required
                    disabled={isLoading || isCheckingEmail}
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
                disabled={isLoading || isCheckingEmail}
              />

              <Box sx={{ mb: 2, mt: 2 }}>
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
                  Password *
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#9CA3AF' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
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

              {!isPasswordValid(formData.password) && (
                <PasswordRequirements password={formData.password} />
              )}

              <Box sx={{ mb: 2, mt: 2 }}>
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
                  Confirm Password *
                </Typography>
                <TextField
                  fullWidth
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  error={!!errors.confirmPassword}
                  helperText={
                    errors.confirmPassword 
                      ? errors.confirmPassword 
                      : (formData.confirmPassword && formData.password === formData.confirmPassword 
                          ? 'Passwords match.' 
                          : '')
                  }
                  FormHelperTextProps={{
                    sx: {
                      color: (!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword) 
                        ? '#10B981' 
                        : undefined
                    }
                  }}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: '#9CA3AF' }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
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

              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.termsAccepted}
                      onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                      disabled={isLoading || isCheckingEmail}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      I accept the{' '}
                      <Link
                        href="https://teamified.com/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        color="primary"
                      >
                        Terms
                      </Link>
                      {' '}and{' '}
                      <Link
                        href="https://teamified.com/privacy"
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
                disabled={isLoading || isCheckingEmail}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  bgcolor: '#9333EA',
                  '&:hover': {
                    bgcolor: '#A855F7',
                  },
                  '&:active': {
                    bgcolor: '#7C3AED',
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Create Account'
                )}
              </Button>
                </>
              )}

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
    </Box>
  );
};

export default CandidateSignupPage;
