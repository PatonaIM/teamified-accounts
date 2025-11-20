import React, { useState, useRef } from 'react';
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
  MenuItem,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { clientAdminSignup } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001+',
];

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Consulting',
  'Real Estate',
  'Media & Entertainment',
  'Other',
];

const ClientAdminSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  
  const searchParams = new URLSearchParams(location.search);
  const emailParam = searchParams.get('email') || '';
  const returnUrl = searchParams.get('returnUrl') || '/account';

  const [formData, setFormData] = useState({
    email: emailParam,
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
    slug: '',
    industry: '',
    companySize: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const slugManuallyEditedRef = useRef(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Track manual slug edits using ref for immediate synchronous access
    if (field === 'slug') {
      slugManuallyEditedRef.current = true;
    }

    // Auto-generate slug only if user hasn't manually edited it
    if (field === 'companyName' && !slugManuallyEditedRef.current) {
      const slugValue = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 100);
      setFormData(prev => ({ ...prev, [field]: value, slug: slugValue }));
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

    if (!formData.companyName) {
      newErrors.companyName = 'Company name is required';
    } else if (formData.companyName.length > 255) {
      newErrors.companyName = 'Company name must not exceed 255 characters';
    }

    if (formData.slug && (formData.slug.length < 2 || formData.slug.length > 100)) {
      newErrors.slug = 'Slug must be between 2 and 100 characters';
    } else if (formData.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug = 'Slug must be lowercase alphanumeric with hyphens only (e.g., acme-corp)';
    }

    if (formData.industry && formData.industry.length > 100) {
      newErrors.industry = 'Industry must not exceed 100 characters';
    }

    if (formData.companySize && formData.companySize.length > 20) {
      newErrors.companySize = 'Company size must not exceed 20 characters';
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
      const result = await clientAdminSignup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName,
        slug: formData.slug || undefined,
        industry: formData.industry || undefined,
        companySize: formData.companySize || undefined,
      });

      try {
        await refreshUser();
        navigate(returnUrl);
      } catch (refreshError) {
        console.error('Failed to refresh user after signup:', refreshError);
        // Clear tokens to prevent stuck state
        const { removeTokens } = await import('../services/authService');
        removeTokens();
        setSuccessMessage('Account and organization created successfully! Redirecting to login...');
        // Redirect to login after a brief delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Client admin signup error:', error);
      setErrors({
        general: error.message || 'Failed to create account. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSelection = () => {
    navigate(`/signup-select?email=${encodeURIComponent(formData.email)}${returnUrl !== '/account' ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`);
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
      <Container maxWidth="md">
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
                color="secondary"
              >
                Employer Sign Up
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Set up your organization account
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

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 2 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
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
                  required
                  disabled={isLoading}
                />
              </Box>

              <TextField
                fullWidth
                label="Company Name"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                error={!!errors.companyName}
                helperText={errors.companyName}
                margin="normal"
                required
                disabled={isLoading}
              />

              <TextField
                fullWidth
                label="Organization Slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                error={!!errors.slug}
                helperText={errors.slug || 'URL-friendly identifier (auto-generated from company name)'}
                margin="normal"
                disabled={isLoading}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="Industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  error={!!errors.industry}
                  helperText={errors.industry}
                  disabled={isLoading}
                >
                  <MenuItem value="">
                    <em>Select industry (optional)</em>
                  </MenuItem>
                  {INDUSTRIES.map((industry) => (
                    <MenuItem key={industry} value={industry}>
                      {industry}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Company Size"
                  value={formData.companySize}
                  onChange={(e) => handleInputChange('companySize', e.target.value)}
                  error={!!errors.companySize}
                  helperText={errors.companySize}
                  disabled={isLoading}
                >
                  <MenuItem value="">
                    <em>Select size (optional)</em>
                  </MenuItem>
                  {COMPANY_SIZES.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
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
                  'Create Account & Organization'
                )}
              </Button>

              <Box textAlign="center" mt={2}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={handleBackToSelection}
                  disabled={isLoading}
                  sx={{ textTransform: 'none' }}
                >
                  Back to Selection
                </Button>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default ClientAdminSignupPage;
