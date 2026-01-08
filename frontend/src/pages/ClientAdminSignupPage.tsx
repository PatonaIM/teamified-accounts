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
import CountrySelect, { countries } from '../components/CountrySelect';
import PhoneInput from '../components/PhoneInput';
import PasswordRequirements, { isPasswordValid } from '../components/PasswordRequirements';

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
  return `https://teamified.com/service-agreement?region=${region}`;
};

const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
  return urlPattern.test(url);
};

const ClientAdminSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const emailParam = searchParams.get('email') || '';
  const returnUrl = searchParams.get('returnUrl') || '/account';
  const intent = searchParams.get('intent') || '';

  const [step, setStep] = useState<'email' | 'name' | 'details'>('email');
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

  const validateEmailStep = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNameStep = () => {
    const newErrors: { [key: string]: string } = {};

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

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDetailsStep = () => {
    const newErrors: { [key: string]: string } = {};

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
    } else if (!isPasswordValid(formData.password)) {
      newErrors.password = 'Password does not meet all requirements';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmailStep()) {
      setStep('name');
    }
  };

  const handleNameContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateNameStep()) {
      setStep('details');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateDetailsStep()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const mobileDialCode = countries.find(c => c.code === formData.mobileCountryCode)?.dialCode || '';
      const phoneDialCode = countries.find(c => c.code === formData.phoneCountryCode)?.dialCode || '';

      await clientAdminSignup({
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

      navigate('/signup-success', { replace: true });
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
      setStep('name');
      return;
    }
    if (step === 'name') {
      setStep('email');
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
            {/* Step 1: Email */}
            {step === 'email' && (
              <Box component="form" onSubmit={handleEmailContinue} noValidate>
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
                    Welcome to Teamified
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    Let's get started with your email
                  </Typography>
                </Box>

                {errors.general && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.general}
                  </Alert>
                )}

                <Box sx={{ mb: 2 }}>
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
                    Email address
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    autoFocus
                    disabled={isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        borderRadius: 2,
                        '& fieldset': {
                          borderColor: '#E5E7EB',
                        },
                        '&:hover fieldset': {
                          borderColor: '#9333EA',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#9333EA',
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={isLoading}
                    startIcon={<ArrowBack />}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderColor: '#9333EA',
                      color: '#9333EA',
                      '&:hover': {
                        borderColor: '#7E22CE',
                        bgcolor: 'rgba(147, 51, 234, 0.04)',
                      },
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
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
            )}

            {/* Step 2: Name & Contact */}
            {step === 'name' && (
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

                {errors.general && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.general}
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
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
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
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
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
                    countryCode={formData.mobileCountryCode}
                    phoneNumber={formData.mobileNumber}
                    onCountryCodeChange={(value) => handleInputChange('mobileCountryCode', value)}
                    onPhoneNumberChange={(value) => handleInputChange('mobileNumber', value)}
                    error={errors.mobileNumber}
                    disabled={isLoading}
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
                    countryCode={formData.phoneCountryCode}
                    phoneNumber={formData.phoneNumber}
                    onCountryCodeChange={(value) => handleInputChange('phoneCountryCode', value)}
                    onPhoneNumberChange={(value) => handleInputChange('phoneNumber', value)}
                    disabled={isLoading}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={isLoading}
                    startIcon={<ArrowBack />}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderColor: '#9333EA',
                      color: '#9333EA',
                      '&:hover': {
                        borderColor: '#7E22CE',
                        bgcolor: 'rgba(147, 51, 234, 0.04)',
                      },
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
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
            )}

            {/* Step 3: Company Details */}
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
                          href="https://teamified.com/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          color="secondary"
                        >
                          Terms
                        </Link>
                        {' '}and{' '}
                        <Link
                          href="https://teamified.com/privacy"
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
    </Box>
  );
};

export default ClientAdminSignupPage;
