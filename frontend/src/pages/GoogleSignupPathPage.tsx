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
  MenuItem,
  Link,
  FormControlLabel,
  Checkbox,
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
import { setAccessToken, setRefreshToken, removeTokens, setUserData, analyzeWebsite } from '../services/authService';
import jobSeekerImage from '../assets/images/job-seeker.png';
import businessImage from '../assets/images/business.png';
import PhoneInput from '../components/PhoneInput';
import CountrySelect, { countries } from '../components/CountrySelect';
import RolesMultiSelect from '../components/RolesMultiSelect';

type BusinessStep = 'name' | 'details' | 'website' | 'business' | 'hiring' | 'review';
type SignupFlow = 'selection' | 'candidate' | 'business';

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

const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
  return urlPattern.test(url);
};

const getServiceAgreementUrl = (countryCode: string): string => {
  const regionMap: Record<string, string> = {
    AU: 'au',
    GB: 'uk',
    US: 'us',
  };
  const region = regionMap[countryCode] || 'au';
  return `https://teamified.com/service-agreement?region=${region}`;
};

const getServiceAgreementLabel = (countryCode: string): string => {
  const labelMap: Record<string, string> = {
    AU: 'Service Agreement (AU)',
    GB: 'Service Agreement (UK)',
    US: 'Service Agreement (US)',
  };
  return labelMap[countryCode] || 'Service Agreement (AU)';
};

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
  
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  
  const [website, setWebsite] = useState('');
  const [noWebsite, setNoWebsite] = useState(false);
  
  const [businessDescription, setBusinessDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [selectedCompanySize, setSelectedCompanySize] = useState('');
  
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [howCanWeHelp, setHowCanWeHelp] = useState('');
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [isAnalyzingWebsite, setIsAnalyzingWebsite] = useState(false);
  const [websiteAnalyzed, setWebsiteAnalyzed] = useState(false);
  
  const [editMode, setEditMode] = useState(false);
  const [originalValues, setOriginalValues] = useState<{
    firstName: string;
    lastName: string;
    mobileCountryCode: string;
    mobileNumber: string;
    phoneCountryCode: string;
    phoneNumber: string;
    companyName: string;
    country: string;
    website: string;
    noWebsite: boolean;
    businessDescription: string;
    industry: string;
    selectedCompanySize: string;
    selectedRoles: string[];
    howCanWeHelp: string;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.roles && user.roles.length > 0) {
      navigate('/dashboard', { replace: true });
    }
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
    const newErrors: { [key: string]: string } = {};
    
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
    const newErrors: { [key: string]: string } = {};
    
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
      if (editMode) {
        handleEditComplete();
      } else {
        setBusinessStep('details');
      }
      setError(null);
    }
  };

  const validateDetailsStep = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    } else if (companyName.length > 255) {
      newErrors.companyName = 'Company name must not exceed 255 characters';
    }
    
    if (!country) {
      newErrors.country = 'Country is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDetailsContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDetailsStep()) {
      if (editMode) {
        handleEditComplete();
      } else {
        setBusinessStep('website');
      }
      setError(null);
    }
  };

  const validateWebsiteStep = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!noWebsite && !website) {
      newErrors.website = 'Website URL is required.';
    } else if (!noWebsite && website && !isValidUrl(website)) {
      newErrors.website = 'Please enter a valid website URL (e.g., https://company.com).';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleWebsiteContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateWebsiteStep()) {
      if (editMode) {
        handleEditComplete();
      } else {
        setBusinessStep('business');
      }
      setError(null);
    }
  };

  const handleBusinessContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode) {
      handleEditComplete();
    } else {
      setBusinessStep('hiring');
    }
    setError(null);
  };

  const handleHiringContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode) {
      handleEditComplete();
    } else {
      setBusinessStep('review');
    }
    setError(null);
  };

  const handleCompanySizeSelect = (size: string) => {
    setSelectedCompanySize(size);
  };

  const handleNoWebsiteToggle = () => {
    setNoWebsite(true);
    setWebsite('');
    setErrors(prev => ({ ...prev, website: '' }));
  };

  const handleHaveWebsiteToggle = () => {
    setNoWebsite(false);
  };
  
  const handleWebsiteBlur = async () => {
    if (!website.trim() || websiteAnalyzed || isAnalyzingWebsite) return;
    
    if (!isValidUrl(website)) {
      setErrors(prev => ({ ...prev, website: 'Please enter a valid website URL' }));
      return;
    }
    
    setIsAnalyzingWebsite(true);
    setErrors(prev => ({ ...prev, website: '' }));
    
    try {
      const result = await analyzeWebsite(website);
      if (result.success && result.businessDescription) {
        setBusinessDescription(result.businessDescription);
        setWebsiteAnalyzed(true);
      } else if (!result.success && result.error) {
        setErrors(prev => ({ ...prev, website: result.error || 'Unable to analyze website' }));
      }
    } catch {
      // Silently fail - don't show error to user
    } finally {
      setIsAnalyzingWebsite(false);
    }
  };

  const handleEditSection = (section: string) => {
    setEditMode(true);
    setOriginalValues({
      firstName,
      lastName,
      mobileCountryCode,
      mobileNumber,
      phoneCountryCode,
      phoneNumber,
      companyName,
      country,
      website,
      noWebsite,
      businessDescription,
      industry,
      selectedCompanySize,
      selectedRoles,
      howCanWeHelp,
    });
    
    if (section === 'contact') {
      setBusinessStep('name');
    } else if (section === 'company') {
      setBusinessStep('details');
    } else if (section === 'business') {
      setBusinessStep('business');
    } else if (section === 'hiring') {
      setBusinessStep('hiring');
    }
  };
  
  const hasChangesInSection = (section: string): boolean => {
    if (!originalValues) return false;
    
    if (section === 'name') {
      return firstName !== originalValues.firstName ||
        lastName !== originalValues.lastName ||
        mobileCountryCode !== originalValues.mobileCountryCode ||
        mobileNumber !== originalValues.mobileNumber ||
        phoneCountryCode !== originalValues.phoneCountryCode ||
        phoneNumber !== originalValues.phoneNumber;
    } else if (section === 'details') {
      return companyName !== originalValues.companyName ||
        country !== originalValues.country;
    } else if (section === 'website') {
      return website !== originalValues.website ||
        noWebsite !== originalValues.noWebsite;
    } else if (section === 'business') {
      return businessDescription !== originalValues.businessDescription ||
        industry !== originalValues.industry ||
        selectedCompanySize !== originalValues.selectedCompanySize;
    } else if (section === 'hiring') {
      return howCanWeHelp !== originalValues.howCanWeHelp ||
        JSON.stringify(selectedRoles) !== JSON.stringify(originalValues.selectedRoles);
    }
    return false;
  };
  
  const handleEditComplete = () => {
    setEditMode(false);
    setOriginalValues(null);
    setBusinessStep('review');
  };

  const handleEmployerSubmit = async () => {
    if (!termsAccepted) {
      setErrors(prev => ({ ...prev, terms: 'You must accept the terms to continue' }));
      return;
    }
    
    setIsLoading(true);
    setLoadingType('employer');
    setError(null);
    try {
      const mobileDialCode = countries.find(c => c.code === mobileCountryCode)?.dialCode || '';
      const phoneDialCode = countries.find(c => c.code === phoneCountryCode)?.dialCode || '';
      
      const response = await api.post('/v1/auth/google/assign-role', {
        roleType: 'client_admin',
        organizationName: companyName.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobileCountryCode,
        mobileNumber: mobileNumber.trim() ? `${mobileDialCode}${mobileNumber.replace(/\s/g, '')}` : undefined,
        phoneCountryCode: phoneNumber.trim() ? phoneCountryCode : undefined,
        phoneNumber: phoneNumber.trim() ? `${phoneDialCode}${phoneNumber.replace(/\s/g, '')}` : undefined,
        country: country || undefined,
        website: website || undefined,
        businessDescription: businessDescription || undefined,
        industry: industry || undefined,
        companySize: selectedCompanySize || undefined,
        rolesNeeded: selectedRoles.join(', ') || undefined,
        howCanWeHelp: howCanWeHelp || undefined,
      });
      if (response.data.accessToken && response.data.refreshToken) {
        setAccessToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);
        if (response.data.user) {
          setUserData(response.data.user);
        }
      }
      await refreshUser();
      const atsPortalUrl = import.meta.env.VITE_PORTAL_URL_ATS;
      if (atsPortalUrl) {
        window.location.href = atsPortalUrl;
      } else {
        navigate('/google-signup-success', { replace: true });
      }
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

  const handleBack = () => {
    setError(null);
    setErrors({});
    
    if (businessStep === 'name') {
      handleBackToSelection();
    } else if (businessStep === 'details') {
      setBusinessStep('name');
    } else if (businessStep === 'website') {
      setBusinessStep('details');
    } else if (businessStep === 'business') {
      setBusinessStep('website');
    } else if (businessStep === 'hiring') {
      setBusinessStep('business');
    } else if (businessStep === 'review') {
      setBusinessStep('hiring');
    }
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

  const hasBusinessData = businessDescription.trim() !== '' || industry !== '' || selectedCompanySize !== '';
  const hasHiringData = selectedRoles.length > 0 || howCanWeHelp.trim() !== '';

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
                            setErrors(prev => ({ ...prev, firstName: '' }));
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
                            setErrors(prev => ({ ...prev, lastName: '' }));
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
                            setErrors(prev => ({ ...prev, firstName: '' }));
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
                            setErrors(prev => ({ ...prev, lastName: '' }));
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
                          setErrors(prev => ({ ...prev, mobileNumber: '' }));
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

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {editMode && !hasChangesInSection('name') ? (
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleEditComplete}
                        disabled={isLoading}
                        startIcon={<ArrowBack />}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          backgroundColor: '#9333EA',
                          textTransform: 'none',
                          fontWeight: 600,
                          boxShadow: 'none',
                          '&:hover': {
                            backgroundColor: '#A855F7',
                          },
                        }}
                      >
                        Back to Review
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={editMode ? handleEditComplete : handleBackToSelection}
                          disabled={isLoading}
                          startIcon={<ArrowBack />}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            borderColor: '#9333EA',
                            color: '#9333EA',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: '#7E22CE',
                              bgcolor: 'rgba(147, 51, 234, 0.04)',
                            },
                          }}
                        >
                          {editMode ? 'Back to Review' : 'Back'}
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          disabled={isLoading || !firstName.trim() || !lastName.trim() || !mobileNumber.trim()}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            backgroundColor: '#9333EA',
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: 'none',
                            '&:hover': {
                              backgroundColor: '#A855F7',
                            },
                            '&.Mui-disabled': {
                              backgroundColor: 'rgba(147, 51, 234, 0.5)',
                              color: 'white',
                            },
                          }}
                        >
                          {editMode ? 'Update' : 'Next'}
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </Card>
            </Fade>
          </Container>
        </Box>
      </Box>
    );
  }

  if (showBusinessFlow && businessStep === 'details') {
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

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
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
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        if (errors.companyName) {
                          setErrors(prev => ({ ...prev, companyName: '' }));
                        }
                      }}
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
                      Country <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <CountrySelect
                      value={country}
                      onChange={(value) => {
                        setCountry(value);
                        if (errors.country) {
                          setErrors(prev => ({ ...prev, country: '' }));
                        }
                      }}
                      disabled={isLoading}
                      error={!!errors.country}
                    />
                    {errors.country && (
                      <Typography sx={{ color: '#d32f2f', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>
                        {errors.country}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    {editMode && !hasChangesInSection('details') ? (
                      <Button
                        variant="contained"
                        onClick={handleEditComplete}
                        disabled={isLoading}
                        startIcon={<ArrowBack />}
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
                        }}
                      >
                        Back to Review
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          onClick={editMode ? handleEditComplete : handleBack}
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
                          {editMode ? 'Back to Review' : 'Back'}
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
                            '&:disabled': {
                              bgcolor: 'rgba(147, 51, 234, 0.5)',
                              color: 'white',
                            },
                          }}
                        >
                          {editMode ? 'Update' : 'Next'}
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </Card>
            </Fade>
          </Container>
        </Box>
      </Box>
    );
  }

  if (showBusinessFlow && businessStep === 'website') {
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
                      Welcome to Teamified, {firstName}!
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6b7280' }}>
                      We'll use AI to understand your business and create a tailored job description
                    </Typography>
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
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
                          value={website}
                          onChange={(e) => {
                            setWebsite(e.target.value);
                            setWebsiteAnalyzed(false);
                            if (errors.website) {
                              setErrors(prev => ({ ...prev, website: '' }));
                            }
                          }}
                          onBlur={handleWebsiteBlur}
                          error={!!errors.website}
                          helperText={errors.website}
                          disabled={isLoading || isAnalyzingWebsite}
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
                        Actually, I have a website
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
                      disabled={isLoading || isAnalyzingWebsite || (!noWebsite && website.trim() && (!isValidUrl(website) || !websiteAnalyzed))}
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
                        '&:disabled': {
                          bgcolor: 'rgba(147, 51, 234, 0.5)',
                          color: 'white',
                        },
                      }}
                    >
                      {isAnalyzingWebsite ? 'Analyzing...' : 'Next'}
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

  if (showBusinessFlow && businessStep === 'business') {
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

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
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
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
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
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
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
                      {INDUSTRIES.map((ind) => (
                        <MenuItem key={ind} value={ind}>
                          {ind}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Typography sx={{ mt: 0.5, fontSize: '0.75rem', color: '#9CA3AF' }}>
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
                    {editMode && !hasChangesInSection('business') ? (
                      <Button
                        variant="contained"
                        onClick={handleEditComplete}
                        disabled={isLoading}
                        startIcon={<ArrowBack />}
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
                        }}
                      >
                        Back to Review
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          onClick={editMode ? handleEditComplete : handleBack}
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
                          {editMode ? 'Back to Review' : 'Back'}
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
                            '&:disabled': {
                              bgcolor: 'rgba(147, 51, 234, 0.5)',
                              color: 'white',
                            },
                          }}
                        >
                          {editMode ? 'Update' : (hasBusinessData ? 'Next' : 'Skip')}
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </Card>
            </Fade>
          </Container>
        </Box>
      </Box>
    );
  }

  if (showBusinessFlow && businessStep === 'hiring') {
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

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
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
                      value={howCanWeHelp}
                      onChange={(e) => setHowCanWeHelp(e.target.value)}
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
                    {editMode && !hasChangesInSection('hiring') ? (
                      <Button
                        variant="contained"
                        onClick={handleEditComplete}
                        disabled={isLoading}
                        startIcon={<ArrowBack />}
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
                        }}
                      >
                        Back to Review
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          onClick={editMode ? handleEditComplete : handleBack}
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
                          {editMode ? 'Back to Review' : 'Back'}
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
                            '&:disabled': {
                              bgcolor: 'rgba(147, 51, 234, 0.5)',
                              color: 'white',
                            },
                          }}
                        >
                          {editMode ? 'Update' : (hasHiringData ? 'Next' : 'Skip')}
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </Card>
            </Fade>
          </Container>
        </Box>
      </Box>
    );
  }

  if (showBusinessFlow && businessStep === 'review') {
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

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
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
                          <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>{firstName} {lastName}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Email</Typography>
                          <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>{user?.email}</Typography>
                        </Box>
                        {mobileNumber && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Mobile</Typography>
                            <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>
                              {countries.find(c => c.code === mobileCountryCode)?.dialCode} {mobileNumber}
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
                          <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>{companyName || 'Not provided'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Country</Typography>
                          <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>
                            {countries.find(c => c.code === country)?.name || country}
                          </Typography>
                        </Box>
                        {website && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Website</Typography>
                            <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>{website}</Typography>
                          </Box>
                        )}
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Industry</Typography>
                          <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>{industry || 'Not specified'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Size</Typography>
                          <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>{selectedCompanySize || 'Not specified'}</Typography>
                        </Box>
                        {businessDescription && (
                          <Box sx={{ mt: 1 }}>
                            <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', mb: 0.5 }}>Business Description</Typography>
                            <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                              {businessDescription.length > 150 ? `${businessDescription.substring(0, 150)}...` : businessDescription}
                            </Typography>
                          </Box>
                        )}
                        {selectedRoles.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', mb: 0.5 }}>Roles Looking For</Typography>
                            <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>
                              {selectedRoles.join(', ')}
                            </Typography>
                          </Box>
                        )}
                        {howCanWeHelp && (
                          <Box sx={{ mt: 1 }}>
                            <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', mb: 0.5 }}>How Can We Help</Typography>
                            <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                              {howCanWeHelp.length > 150 ? `${howCanWeHelp.substring(0, 150)}...` : howCanWeHelp}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3, p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                    <Typography sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>Legal Agreement</Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={termsAccepted}
                          onChange={(e) => {
                            setTermsAccepted(e.target.checked);
                            if (errors.terms) {
                              setErrors(prev => ({ ...prev, terms: '' }));
                            }
                          }}
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
                            href={getServiceAgreementUrl(country)}
                            target="_blank"
                            sx={{ color: '#9333EA' }}
                          >
                            {getServiceAgreementLabel(country)}
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
                      onClick={handleEmployerSubmit}
                      disabled={isLoading || !termsAccepted}
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
              </Card>
            </Fade>
          </Container>
        </Box>
      </Box>
    );
  }

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
        <Container maxWidth="lg">
          <Fade in timeout={600}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ mb: 6 }}>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                    color: '#1a1a1a',
                  }}
                >
                  How would you like to use Teamified?
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#666',
                    fontWeight: 400,
                    maxWidth: 600,
                    mx: 'auto',
                  }}
                >
                  Choose your path to get started with the global talent platform
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 3,
                  justifyContent: 'center',
                  mb: 6,
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
