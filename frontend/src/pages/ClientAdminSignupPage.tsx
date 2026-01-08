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
import RolesMultiSelect from '../components/RolesMultiSelect';

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

  const [step, setStep] = useState<'email' | 'name' | 'details' | 'website' | 'business' | 'hiring' | 'review'>('email');
  const [noWebsite, setNoWebsite] = useState(false);
  const [selectedCompanySize, setSelectedCompanySize] = useState<string>('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [originalSectionData, setOriginalSectionData] = useState<Record<string, unknown> | null>(null);
  const websiteInputRef = useRef<HTMLInputElement>(null);
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

  const hasBusinessData = formData.businessDescription.trim() !== '' || 
                          formData.industry !== '' || 
                          formData.companySize !== '';

  const hasHiringData = selectedRoles.length > 0 || formData.howCanWeHelp.trim() !== '';

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateWebsiteStep = () => {
    const newErrors: { [key: string]: string } = {};

    if (!noWebsite && !formData.website) {
      newErrors.website = 'Website URL is required.';
    } else if (!noWebsite && formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (e.g., https://company.com).';
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
      if (editMode) {
        setEditMode(false);
        setEditSection(null);
        setStep('review');
      } else {
        setStep('details');
      }
    }
  };

  const handleDetailsContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDetailsStep()) {
      if (editMode) {
        setEditMode(false);
        setEditSection(null);
        setStep('review');
      } else {
        setStep('website');
      }
    }
  };

  const handleWebsiteContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateWebsiteStep()) {
      setStep('business');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

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
    if (editMode) {
      setEditMode(false);
      setEditSection(null);
      setStep('review');
      return;
    }
    if (step === 'review') {
      setStep('hiring');
      return;
    }
    if (step === 'hiring') {
      setStep('business');
      return;
    }
    if (step === 'business') {
      setStep('website');
      return;
    }
    if (step === 'website') {
      setStep('details');
      return;
    }
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

  const handleCompanySizeSelect = (size: string) => {
    setSelectedCompanySize(size);
    handleInputChange('companySize', size);
  };

  const handleBusinessContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode) {
      setEditMode(false);
      setEditSection(null);
      setStep('review');
    } else {
      setStep('hiring');
    }
  };

  const handleHiringContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode) {
      setEditMode(false);
      setEditSection(null);
      setStep('review');
    } else {
      setStep('review');
    }
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const extractSectionSnapshot = (section: string): Record<string, unknown> => {
    switch (section) {
      case 'contact':
        return {
          firstName: formData.firstName,
          lastName: formData.lastName,
          mobileCountryCode: formData.mobileCountryCode,
          mobileNumber: formData.mobileNumber,
          phoneCountryCode: formData.phoneCountryCode,
          phoneNumber: formData.phoneNumber,
        };
      case 'company':
        return {
          companyName: formData.companyName,
          country: formData.country,
        };
      case 'business':
        return {
          businessDescription: formData.businessDescription,
          industry: formData.industry,
          companySize: selectedCompanySize,
        };
      case 'hiring':
        return {
          selectedRoles: [...selectedRoles],
          howCanWeHelp: formData.howCanWeHelp,
        };
      default:
        return {};
    }
  };

  const arraysEqual = (a: string[], b: string[]): boolean => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  };

  const hasSectionChanged = (): boolean => {
    if (!originalSectionData || !editSection) return false;
    const current = extractSectionSnapshot(editSection);
    
    for (const key of Object.keys(originalSectionData)) {
      const origVal = originalSectionData[key];
      const currVal = current[key];
      
      if (Array.isArray(origVal) && Array.isArray(currVal)) {
        if (!arraysEqual(origVal as string[], currVal as string[])) return true;
      } else if (origVal !== currVal) {
        return true;
      }
    }
    return false;
  };

  const handleEditSection = (section: string) => {
    const snapshot = extractSectionSnapshot(section);
    setOriginalSectionData(snapshot);
    setEditMode(true);
    setEditSection(section);
    switch (section) {
      case 'contact':
        setStep('name');
        break;
      case 'company':
        setStep('details');
        break;
      case 'business':
        setStep('business');
        break;
      case 'hiring':
        setStep('hiring');
        break;
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditSection(null);
    setOriginalSectionData(null);
    setStep('review');
  };

  const handleUpdateSection = (e: React.FormEvent) => {
    e.preventDefault();
    setEditMode(false);
    setEditSection(null);
    setOriginalSectionData(null);
    setStep('review');
  };

  const handleNoWebsiteToggle = () => {
    setNoWebsite(true);
    handleInputChange('website', '');
  };

  const handleHaveWebsiteToggle = () => {
    setNoWebsite(false);
    setTimeout(() => {
      websiteInputRef.current?.focus();
    }, 100);
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
                    onCountryChange={(value) => handleInputChange('mobileCountryCode', value)}
                    onPhoneChange={(value) => handleInputChange('mobileNumber', value)}
                    error={!!errors.mobileNumber}
                    helperText={errors.mobileNumber}
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
                    onCountryChange={(value) => handleInputChange('phoneCountryCode', value)}
                    onPhoneChange={(value) => handleInputChange('phoneNumber', value)}
                    disabled={isLoading}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  {!editMode && (
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
                  )}
                  {editMode && !hasSectionChanged() ? (
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
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
                      Back to Review
                    </Button>
                  ) : (
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
                      {editMode ? 'Update' : 'Next'}
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            {/* Step 3: Company Details */}
            {step === 'details' && (
              <Box component="form" onSubmit={handleDetailsContinue} noValidate>
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
                    Your company details?
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    Tell us about your organization
                  </Typography>
                </Box>

                {errors.general && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.general}
                  </Alert>
                )}

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
                    Company Name
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Your company name"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    error={!!errors.companyName}
                    helperText={errors.companyName}
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
                    Country
                  </Typography>
                  <CountrySelect
                    value={formData.country}
                    onChange={(value) => handleInputChange('country', value)}
                    disabled={isLoading}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  {!editMode && (
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
                  )}
                  {editMode && !hasSectionChanged() ? (
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
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
                      Back to Review
                    </Button>
                  ) : (
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
                      {editMode ? 'Update' : 'Next'}
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            {/* Step 4: Website */}
            {step === 'website' && (
              <Box component="form" onSubmit={handleWebsiteContinue} noValidate>
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
                    Welcome to Teamified, {formData.firstName}!
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    We'll use AI to understand your business and create a tailored job description
                  </Typography>
                </Box>

                {errors.general && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.general}
                  </Alert>
                )}

                {!noWebsite ? (
                  <>
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
                        Website URL
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="www.example.com"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        error={!!errors.website}
                        helperText={errors.website}
                        disabled={isLoading}
                        inputRef={websiteInputRef}
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

                    <Box sx={{ mb: 3 }}>
                      <Link
                        component="button"
                        type="button"
                        onClick={handleNoWebsiteToggle}
                        sx={{
                          color: '#9333EA',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        I don't have a website
                      </Link>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ mb: 3, p: 3, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                    <Typography sx={{ color: '#6b7280', mb: 2 }}>
                      No problem! We'll help you create a great job description without it.
                    </Typography>
                    <Link
                      component="button"
                      type="button"
                      onClick={handleHaveWebsiteToggle}
                      sx={{
                        color: '#9333EA',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Actually, I have website
                    </Link>
                  </Box>
                )}

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

            {/* Step 5: Business Information */}
            {step === 'business' && (
              <Box component="form" onSubmit={handleBusinessContinue} noValidate>
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
                    Tell us about your business
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    This helps us match you with the right candidates
                  </Typography>
                </Box>

                {errors.general && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.general}
                  </Alert>
                )}

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
                    Business Description
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Tell us what your company does..."
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
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
                    Industry
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    disabled={isLoading}
                    SelectProps={{
                      displayEmpty: true,
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
                  >
                    <MenuItem value="" disabled>
                      <Typography sx={{ color: '#9CA3AF' }}>Select your industry</Typography>
                    </MenuItem>
                    {INDUSTRIES.map((industry) => (
                      <MenuItem key={industry} value={industry}>
                        {industry}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.5, display: 'block' }}>
                    Select the industry your company operates in
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    component="label"
                    sx={{
                      display: 'block',
                      mb: 1.5,
                      fontWeight: 500,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                    }}
                  >
                    Company Size
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                    {COMPANY_SIZES.map((size) => (
                      <Box
                        key={size}
                        onClick={() => !isLoading && handleCompanySizeSelect(size)}
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: selectedCompanySize === size ? '#9333EA' : '#E5E7EB',
                          borderRadius: 2,
                          cursor: isLoading ? 'default' : 'pointer',
                          bgcolor: selectedCompanySize === size ? 'rgba(147, 51, 234, 0.04)' : 'white',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: isLoading ? undefined : '#9333EA',
                            bgcolor: isLoading ? undefined : 'rgba(147, 51, 234, 0.02)',
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: selectedCompanySize === size ? 600 : 400,
                            color: selectedCompanySize === size ? '#9333EA' : '#1a1a1a',
                            fontSize: '0.875rem',
                          }}
                        >
                          {size}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  {!editMode && (
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
                  )}
                  {editMode && !hasSectionChanged() ? (
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
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
                      Back to Review
                    </Button>
                  ) : (
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
                      {isLoading ? <CircularProgress size={24} color="inherit" /> : editMode ? 'Update' : hasBusinessData ? 'Next' : 'Skip'}
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            {/* Step 6: What are you looking for? */}
            {step === 'hiring' && (
              <Box component="form" onSubmit={handleHiringContinue} noValidate>
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
                    What are you looking for?
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    Help us understand your hiring needs
                  </Typography>
                </Box>

                {errors.general && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.general}
                  </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                  <Typography
                    component="label"
                    sx={{
                      display: 'block',
                      mb: 1.5,
                      fontWeight: 500,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                    }}
                  >
                    What role/s do you need?
                  </Typography>
                  <RolesMultiSelect
                    selectedRoles={selectedRoles}
                    onChange={setSelectedRoles}
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
                    How can we help you?
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Tell us about your hiring goals, timeline, or any specific requirements..."
                    value={formData.howCanWeHelp}
                    onChange={(e) => handleInputChange('howCanWeHelp', e.target.value)}
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

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  {!editMode && (
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
                  )}
                  {editMode && !hasSectionChanged() ? (
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
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
                      Back to Review
                    </Button>
                  ) : (
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
                      {isLoading ? <CircularProgress size={24} color="inherit" /> : editMode ? 'Update' : hasHiringData ? 'Next' : 'Skip'}
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            {/* Step 7: Review Your Information */}
            {step === 'review' && (
              <Box>
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
                    Review Your Information
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    Please confirm your details and accept our terms
                  </Typography>
                </Box>

                {errors.general && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.general}
                  </Alert>
                )}

                <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                  <Box sx={{ mb: 2, p: 2, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>Contact Details</Typography>
                      <Link
                        component="button"
                        type="button"
                        onClick={() => handleEditSection('contact')}
                        sx={{ color: '#9333EA', fontSize: '0.875rem', cursor: 'pointer' }}
                      >
                        Edit
                      </Link>
                    </Box>
                    <Box sx={{ display: 'grid', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Name</Typography>
                        <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>{formData.firstName} {formData.lastName}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Email</Typography>
                        <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>{formData.email}</Typography>
                      </Box>
                      {formData.mobileNumber && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Mobile</Typography>
                          <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>
                            {countries.find(c => c.code === formData.mobileCountryCode)?.dialCode} {formData.mobileNumber}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2, p: 2, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>Company Details</Typography>
                      <Link
                        component="button"
                        type="button"
                        onClick={() => handleEditSection('company')}
                        sx={{ color: '#9333EA', fontSize: '0.875rem', cursor: 'pointer' }}
                      >
                        Edit
                      </Link>
                    </Box>
                    <Box sx={{ display: 'grid', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Company</Typography>
                        <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>{formData.companyName || 'Not provided'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Country</Typography>
                        <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>
                          {countries.find(c => c.code === formData.country)?.name || formData.country}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2, p: 2, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>Business Details</Typography>
                      <Link
                        component="button"
                        type="button"
                        onClick={() => handleEditSection('business')}
                        sx={{ color: '#9333EA', fontSize: '0.875rem', cursor: 'pointer' }}
                      >
                        Edit
                      </Link>
                    </Box>
                    <Box sx={{ display: 'grid', gap: 0.5 }}>
                      {formData.businessDescription && (
                        <Box>
                          <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Description</Typography>
                          <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem', mt: 0.5 }}>
                            {formData.businessDescription}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Industry</Typography>
                        <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>{formData.industry || 'Not specified'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Size</Typography>
                        <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>{formData.companySize || 'Not specified'}</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2, p: 2, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>Hiring Needs</Typography>
                      <Link
                        component="button"
                        type="button"
                        onClick={() => handleEditSection('hiring')}
                        sx={{ color: '#9333EA', fontSize: '0.875rem', cursor: 'pointer' }}
                      >
                        Edit
                      </Link>
                    </Box>
                    {selectedRoles.length > 0 ? (
                      <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>
                        {selectedRoles.join(', ')}
                      </Typography>
                    ) : (
                      <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem', fontStyle: 'italic' }}>
                        No hiring needs specified
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ mt: 3, p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>Legal Agreement</Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.termsAccepted}
                        onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                        disabled={isLoading}
                        sx={{
                          color: '#D1D5DB',
                          '&.Mui-checked': {
                            color: '#9333EA',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: '0.875rem', color: '#1a1a1a' }}>
                        I accept the{' '}
                        <Link
                          href={getServiceAgreementUrl(formData.country)}
                          target="_blank"
                          sx={{ color: '#9333EA' }}
                        >
                          Service Agreement (AU)
                        </Link>
                        ,{' '}
                        <Link href="https://teamified.com/terms" target="_blank" sx={{ color: '#9333EA' }}>
                          Terms
                        </Link>
                        , and{' '}
                        <Link href="https://teamified.com/privacy" target="_blank" sx={{ color: '#9333EA' }}>
                          Privacy Policy
                        </Link>
                      </Typography>
                    }
                  />
                  {errors.terms && (
                    <Typography sx={{ color: '#DC2626', fontSize: '0.75rem', mt: 1 }}>
                      {errors.terms}
                    </Typography>
                  )}
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
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isLoading || !formData.termsAccepted}
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
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create My Account'}
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
