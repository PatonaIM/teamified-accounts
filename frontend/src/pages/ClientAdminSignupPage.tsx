import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  FormControlLabel,
  Checkbox,
  Link,
  keyframes,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
  AutoAwesome,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { clientAdminSignup, analyzeWebsite } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import CountrySelect, { countries } from '../components/CountrySelect';
import PhoneInput from '../components/PhoneInput';
import { checkAndHandleMarketingRedirect, preserveMarketingSourceFromUrl, getMarketingSource, isMarketingSource } from '../services/marketingRedirectService';

const COMPANY_SIZES = [
  '1-20 employees',
  '21-50 employees',
  '51-100 employees',
  '101-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees',
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

const sparkle = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
`;

const getServiceAgreementUrl = (countryCode: string): string => {
  const regionMap: Record<string, string> = {
    AU: 'au',
    GB: 'uk',
    US: 'us',
  };
  const region = regionMap[countryCode] || 'us';
  return `https://teamified.com/legal/service-agreement?region=${region}`;
};

const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
  return urlPattern.test(url);
};

const ClientAdminSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  
  const searchParams = new URLSearchParams(location.search);
  const emailParam = searchParams.get('email') || '';
  const returnUrl = searchParams.get('returnUrl') || '/account';
  const intent = searchParams.get('intent') || '';
  const sourceParam = searchParams.get('source');

  useEffect(() => {
    if (isMarketingSource(sourceParam)) {
      preserveMarketingSourceFromUrl();
    }
  }, [sourceParam]);

  const [step, setStep] = useState<'basic' | 'details'>('basic');
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
    country: 'US',
    mobileCountryCode: 'AU',
    mobileNumber: '',
    phoneCountryCode: 'AU',
    phoneNumber: '',
    website: '',
    businessDescription: '',
    rolesNeeded: '',
    howCanWeHelp: '',
    termsAccepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzingWebsite, setIsAnalyzingWebsite] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const slugManuallyEditedRef = useRef(false);

  const handleAnalyzeWebsite = useCallback(async () => {
    if (!isValidUrl(formData.website) || isAnalyzingWebsite) return;
    
    setIsAnalyzingWebsite(true);
    try {
      const result = await analyzeWebsite(formData.website);
      if (result.success && result.businessDescription) {
        setFormData(prev => ({
          ...prev,
          businessDescription: result.businessDescription || '',
        }));
      }
    } catch (error) {
      console.error('Website analysis failed:', error);
    } finally {
      setIsAnalyzingWebsite(false);
    }
  }, [formData.website, isAnalyzingWebsite]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    if (field === 'slug') {
      slugManuallyEditedRef.current = true;
    }

    if (field === 'companyName' && !slugManuallyEditedRef.current && typeof value === 'string') {
      const slugValue = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 100);
      setFormData(prev => ({ ...prev, [field]: value, slug: slugValue }));
    }
  };

  const validateStep1 = () => {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep('details');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const mobileDialCode = countries.find(c => c.code === formData.mobileCountryCode)?.dialCode || '';
      const phoneDialCode = countries.find(c => c.code === formData.phoneCountryCode)?.dialCode || '';

      const result = await clientAdminSignup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName,
        slug: formData.slug || undefined,
        industry: formData.industry || undefined,
        companySize: formData.companySize || undefined,
        country: formData.country || undefined,
        mobileCountryCode: formData.mobileCountryCode || undefined,
        mobileNumber: formData.mobileNumber ? `${mobileDialCode}${formData.mobileNumber.replace(/\s/g, '')}` : undefined,
        phoneCountryCode: formData.phoneCountryCode || undefined,
        phoneNumber: formData.phoneNumber ? `${phoneDialCode}${formData.phoneNumber.replace(/\s/g, '')}` : undefined,
        website: formData.website || undefined,
        businessDescription: formData.businessDescription || undefined,
        rolesNeeded: formData.rolesNeeded || undefined,
        howCanWeHelp: formData.howCanWeHelp || undefined,
        termsAccepted: formData.termsAccepted,
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
        setSuccessMessage('Account and organization created successfully! Redirecting to login...');
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

  const handleBack = () => {
    if (step === 'details') {
      setStep('basic');
      return;
    }
    
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
      <Container maxWidth="md">
        <Fade in key={step} timeout={400}>
          <Paper
            elevation={24}
            sx={{
              padding: { xs: 3, sm: 4, md: 5 },
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              overflow: 'hidden',
            }}
          >
            {/* Step 1: Basic Information */}
            {step === 'basic' && (
              <Box component="form" onSubmit={handleContinue} noValidate>
                <Box textAlign="center" mb={4}>
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    fontWeight="bold"
                    color="secondary"
                  >
                    Business Sign Up
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Let's get started with the basics
                  </Typography>
                </Box>

                {errors.general && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.general}
                  </Alert>
                )}

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
                  autoFocus
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
                  Continue
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
            )}

            {/* Step 2: Company Details */}
            {step === 'details' && (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Box textAlign="center" mb={4}>
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    fontWeight="bold"
                    color="secondary"
                  >
                    Tell us more about {formData.companyName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Help us understand your business better
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

                <Box sx={{ mt: 2 }}>
                  <CountrySelect
                    value={formData.country}
                    onChange={(value) => handleInputChange('country', value)}
                    label="Country"
                    disabled={isLoading}
                  />
                </Box>

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

                <Box sx={{ mt: 3 }}>
                  <PhoneInput
                    countryCode={formData.mobileCountryCode}
                    phoneNumber={formData.mobileNumber}
                    onCountryChange={(code) => handleInputChange('mobileCountryCode', code)}
                    onPhoneChange={(number) => handleInputChange('mobileNumber', number)}
                    label="Mobile Number"
                    disabled={isLoading}
                  />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <PhoneInput
                    countryCode={formData.phoneCountryCode}
                    phoneNumber={formData.phoneNumber}
                    onCountryChange={(code) => handleInputChange('phoneCountryCode', code)}
                    onPhoneChange={(number) => handleInputChange('phoneNumber', number)}
                    label="Phone Number (optional)"
                    disabled={isLoading}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Company Website (optional)"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  error={!!errors.website}
                  helperText={errors.website}
                  margin="normal"
                  disabled={isLoading}
                  placeholder="https://example.com"
                />

                <Box sx={{ position: 'relative', mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Business Description"
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    error={!!errors.businessDescription}
                    helperText={errors.businessDescription}
                    multiline
                    rows={5}
                    disabled={isLoading || isAnalyzingWebsite}
                    placeholder="Tell us about your business..."
                  />
                  {isValidUrl(formData.website) && !isAnalyzingWebsite && (
                    <Tooltip title="Analyze my website" arrow placement="left">
                      <IconButton
                        onClick={handleAnalyzeWebsite}
                        disabled={isLoading}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          opacity: 0.6,
                          transition: 'opacity 0.2s, transform 0.2s',
                          '&:hover': {
                            opacity: 1,
                            transform: 'scale(1.1)',
                            backgroundColor: 'rgba(124, 58, 237, 0.1)',
                          },
                        }}
                      >
                        <AutoAwesome sx={{ color: '#7c3aed', fontSize: 26 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {isAnalyzingWebsite && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 22,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 1,
                        gap: 1,
                      }}
                    >
                      <AutoAwesome
                        sx={{
                          color: '#7c3aed',
                          fontSize: 32,
                          animation: `${sparkle} 1s ease-in-out infinite`,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Analyzing your website...
                      </Typography>
                    </Box>
                  )}
                </Box>

                <TextField
                  fullWidth
                  label="What roles do you need? (optional)"
                  value={formData.rolesNeeded}
                  onChange={(e) => handleInputChange('rolesNeeded', e.target.value)}
                  error={!!errors.rolesNeeded}
                  helperText={errors.rolesNeeded}
                  margin="normal"
                  disabled={isLoading}
                  placeholder="e.g., Software Engineers, Product Managers"
                />

                <TextField
                  fullWidth
                  label="How can we help you? (optional)"
                  value={formData.howCanWeHelp}
                  onChange={(e) => handleInputChange('howCanWeHelp', e.target.value)}
                  error={!!errors.howCanWeHelp}
                  helperText={errors.howCanWeHelp}
                  margin="normal"
                  multiline
                  rows={2}
                  disabled={isLoading}
                  placeholder="Tell us how we can assist your hiring needs..."
                />

                <Box sx={{ mt: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.termsAccepted}
                        onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                        disabled={isLoading}
                        color="secondary"
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        I accept the{' '}
                        <Link
                          href={getServiceAgreementUrl(formData.country)}
                          target="_blank"
                          rel="noopener noreferrer"
                          color="secondary"
                        >
                          Service Agreement
                        </Link>
                        ,{' '}
                        <Link
                          href="https://teamified.com/legal/term"
                          target="_blank"
                          rel="noopener noreferrer"
                          color="secondary"
                        >
                          Terms
                        </Link>
                        {' '}and{' '}
                        <Link
                          href="https://teamified.com/legal/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          color="secondary"
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
                    onClick={handleBack}
                    disabled={isLoading}
                    sx={{ textTransform: 'none' }}
                  >
                    Back
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default ClientAdminSignupPage;
