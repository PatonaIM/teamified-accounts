import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Alert,
  CircularProgress,
  Fade,
  InputAdornment,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Business,
  ArrowBack,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

const ClientAdminSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  
  // Get email and returnUrl from query parameters
  const searchParams = new URLSearchParams(location.search);
  const prefilledEmail = searchParams.get('email') || '';
  const returnUrl = searchParams.get('returnUrl') || '/account';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: prefilledEmail,
    password: '',
    confirmPassword: '',
    companyName: '',
    slug: '',
    industry: '',
    companySize: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState('');
  const [slugCheckLoading, setSlugCheckLoading] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    // If no email provided, redirect back to login
    if (!prefilledEmail) {
      navigate('/login', { replace: true });
    }
  }, [prefilledEmail, navigate]);

  const generateSlugFromName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 100);
  };

  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 2) {
      setSlugAvailable(null);
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setSlugAvailable(null);
      return;
    }

    setSlugCheckLoading(true);
    try {
      const response = await fetch(`/api/v1/organizations/check-slug/${encodeURIComponent(slug)}`);
      const data = await response.json();
      setSlugAvailable(data.available);
    } catch (error) {
      console.error('Slug availability check failed:', error);
      setSlugAvailable(null);
    } finally {
      setSlugCheckLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Handle slug field changes
    if (field === 'slug') {
      // Reset manual edit flag if slug is cleared, allowing auto-generation to resume
      if (!value.trim()) {
        setSlugManuallyEdited(false);
      } else {
        setSlugManuallyEdited(true);
        checkSlugAvailability(value);
      }
      setFormData(prev => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
      if (serverError) {
        setServerError('');
      }
      return;
    }
    
    // Auto-generate slug from company name only if slug hasn't been manually edited
    if (field === 'companyName' && !slugManuallyEdited) {
      const suggestedSlug = generateSlugFromName(value);
      setFormData(prev => ({ ...prev, companyName: value, slug: suggestedSlug }));
      if (suggestedSlug) {
        checkSlugAvailability(suggestedSlug);
      }
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
      if (serverError) {
        setServerError('');
      }
      return;
    }
    
    // Standard field update
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    handleInputChange(name, value);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else {
      // Validate password complexity to match backend policy
      const hasUppercase = /[A-Z]/.test(formData.password);
      const hasLowercase = /[a-z]/.test(formData.password);
      const hasNumber = /[0-9]/.test(formData.password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
      
      if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        newErrors.password = 'Password must include uppercase, lowercase, number, and special character';
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Organization slug is required';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug = 'Slug must be lowercase alphanumeric with hyphens only (e.g., acme-corp)';
    } else if (formData.slug.length < 2 || formData.slug.length > 100) {
      newErrors.slug = 'Slug must be between 2 and 100 characters';
    } else if (slugAvailable === false) {
      newErrors.slug = 'This slug is already taken. Please choose a different one.';
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
    setServerError('');

    try {
      // Call client admin signup endpoint
      const response = await fetch('/api/v1/auth/signup/client-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          slug: formData.slug || undefined,
          industry: formData.industry || undefined,
          companySize: formData.companySize || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message || 'Signup failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Success! Auto-login using authService
      try {
        await login({
          email: formData.email,
          password: formData.password,
          rememberMe: true
        });
        
        // Refresh user data in AuthContext
        await refreshUser();
        
        // Navigate to returnUrl
        navigate(returnUrl, { replace: true });
      } catch (loginError) {
        console.error('Auto-login after signup failed:', loginError);
        // Fallback: redirect to login page with success message
        navigate(`/login?email=${encodeURIComponent(formData.email)}&signupSuccess=true${returnUrl !== '/account' ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`, { replace: true });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setServerError('Network error. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  const handleBackToPathSelection = () => {
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
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'secondary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Business sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                fontWeight="bold"
                color="primary"
              >
                Set Up Your Organization
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your employer account and organization
              </Typography>
            </Box>

            {serverError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {serverError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                Your Information
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  autoComplete="given-name"
                  autoFocus
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  disabled={isLoading}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  disabled={isLoading}
                />
              </Box>

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                disabled={true} // Email is prefilled from path selection
                sx={{ '& .MuiInputBase-input.Mui-disabled': { color: 'text.primary' } }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={!!errors.password}
                helperText={errors.password || 'Min 8 chars with uppercase, lowercase, number, and special char'}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1 }}>
                Organization Details
              </Typography>

              <TextField
                margin="normal"
                required
                fullWidth
                id="companyName"
                label="Company Name"
                name="companyName"
                autoComplete="organization"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                error={!!errors.companyName}
                helperText={errors.companyName}
                disabled={isLoading}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="slug"
                label="Organization Slug (URL)"
                name="slug"
                placeholder="acme-corp"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                error={!!errors.slug}
                helperText={
                  errors.slug || 
                  (slugAvailable === true && !errors.slug ? '✓ Slug is available' : '') ||
                  (slugAvailable === false && !errors.slug ? '✗ Slug is already taken' : '') ||
                  'Lowercase letters, numbers, and hyphens only. Used in your organization URL.'
                }
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {slugCheckLoading && <CircularProgress size={20} />}
                      {!slugCheckLoading && slugAvailable === true && (
                        <CheckCircle sx={{ color: 'success.main' }} />
                      )}
                      {!slugCheckLoading && slugAvailable === false && (
                        <Cancel sx={{ color: 'error.main' }} />
                      )}
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel id="industry-label">Industry (Optional)</InputLabel>
                <Select
                  labelId="industry-label"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  label="Industry (Optional)"
                  onChange={handleSelectChange}
                  disabled={isLoading}
                >
                  <MenuItem value="">
                    <em>Select an industry</em>
                  </MenuItem>
                  <MenuItem value="Technology">Technology</MenuItem>
                  <MenuItem value="Healthcare">Healthcare</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Retail">Retail</MenuItem>
                  <MenuItem value="Manufacturing">Manufacturing</MenuItem>
                  <MenuItem value="Education">Education</MenuItem>
                  <MenuItem value="Hospitality">Hospitality</MenuItem>
                  <MenuItem value="Construction">Construction</MenuItem>
                  <MenuItem value="Transportation">Transportation</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel id="company-size-label">Company Size (Optional)</InputLabel>
                <Select
                  labelId="company-size-label"
                  id="companySize"
                  name="companySize"
                  value={formData.companySize}
                  label="Company Size (Optional)"
                  onChange={handleSelectChange}
                  disabled={isLoading}
                >
                  <MenuItem value="">
                    <em>Select company size</em>
                  </MenuItem>
                  <MenuItem value="1-10">1-10 employees</MenuItem>
                  <MenuItem value="11-50">11-50 employees</MenuItem>
                  <MenuItem value="51-200">51-200 employees</MenuItem>
                  <MenuItem value="201-500">201-500 employees</MenuItem>
                  <MenuItem value="501+">501+ employees</MenuItem>
                </Select>
              </FormControl>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                color="secondary"
                disabled={isLoading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Create Organization'
                )}
              </Button>

              <Box textAlign="center" mt={2}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={handleBackToPathSelection}
                  disabled={isLoading}
                  sx={{ textTransform: 'none' }}
                >
                  Back to Options
                </Button>
              </Box>

              <Box textAlign="center" mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Button
                    onClick={() => navigate('/login')}
                    disabled={isLoading}
                    sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                  >
                    Sign In
                  </Button>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default ClientAdminSignupPage;
