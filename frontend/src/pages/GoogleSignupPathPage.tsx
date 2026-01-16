import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Fade,
  CircularProgress,
  TextField,
  Alert,
} from '@mui/material';
import {
  Public,
  AutoAwesome,
  Verified,
  TrendingUp,
  Videocam,
  Groups,
  Language,
  CalendarToday,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { setAccessToken, setRefreshToken, removeTokens, setUserData } from '../services/authService';
import jobSeekerImage from '../assets/images/job-seeker-hero.jpg';
import businessImage from '../assets/images/business-hero.jpg';

const GoogleSignupPathPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'candidate' | 'employer' | null>(null);
  const [showEmployerForm, setShowEmployerForm] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.roles && user.roles.length > 0) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleCandidateSignup = async () => {
    setIsLoading(true);
    setLoadingType('candidate');
    setError(null);
    try {
      const response = await api.post('/v1/auth/google/assign-role', { roleType: 'candidate' });
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

  const handleEmployerClick = () => {
    setShowEmployerForm(true);
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

  const jobSeekerBenefits = [
    { icon: <Public sx={{ fontSize: 18, color: '#9333EA' }} />, text: 'Global opportunities' },
    { icon: <AutoAwesome sx={{ fontSize: 18, color: '#9333EA' }} />, text: 'AI job matching' },
    { icon: <Verified sx={{ fontSize: 18, color: '#9333EA' }} />, text: 'Verified employers' },
    { icon: <TrendingUp sx={{ fontSize: 18, color: '#9333EA' }} />, text: 'Career growth' },
  ];

  const businessBenefits = [
    { icon: <Videocam sx={{ fontSize: 18, color: '#9333EA' }} />, text: 'AI video screening' },
    { icon: <Groups sx={{ fontSize: 18, color: '#9333EA' }} />, text: '250,000+ candidates' },
    { icon: <Language sx={{ fontSize: 18, color: '#9333EA' }} />, text: 'Hire in 50+ countries' },
    { icon: <CalendarToday sx={{ fontSize: 18, color: '#9333EA' }} />, text: 'Hire in days, not weeks' },
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
          backgroundColor: '#f5f5f5',
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

  if (showEmployerForm) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          padding: 3,
        }}
      >
        <Container maxWidth="sm">
          <Fade in timeout={400}>
            <Card
              elevation={0}
              sx={{
                padding: { xs: 3, sm: 4 },
                borderRadius: 3,
                backgroundColor: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
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
                onClick={() => {
                  setShowEmployerForm(false);
                  setError(null);
                }}
                disabled={isLoading}
                sx={{ textTransform: 'none', color: '#666' }}
              >
                Back to options
              </Button>
            </Card>
          </Fade>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: 3,
      }}
    >
      <Container maxWidth="lg">
        <Fade in timeout={600}>
          <Box>
            <Box textAlign="center" mb={5}>
              <Typography
                variant="h3"
                component="h1"
                fontWeight="bold"
                sx={{ 
                  color: '#1a1a1a',
                  mb: 1,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                }}
              >
                Let's get started
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#666',
                  fontWeight: 400,
                }}
              >
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
                alignItems: 'stretch',
              }}
            >
              <Card
                elevation={0}
                sx={{
                  flex: 1,
                  maxWidth: { md: 400 },
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box
                  sx={{
                    height: 200,
                    backgroundImage: `url(${jobSeekerImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    fontWeight="bold"
                    sx={{ color: '#1a1a1a', mb: 1 }}
                  >
                    I'm a Job Seeker
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ color: '#666', mb: 3 }}
                  >
                    Find your next global opportunity with AI-powered matching
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1.5,
                      mb: 3,
                    }}
                  >
                    {jobSeekerBenefits.map((benefit, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          backgroundColor: '#f8f5ff',
                          borderRadius: 2,
                          px: 1.5,
                          py: 0.75,
                        }}
                      >
                        {benefit.icon}
                        <Typography variant="body2" sx={{ color: '#1a1a1a', fontSize: '0.85rem' }}>
                          {benefit.text}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Button
                    onClick={handleCandidateSignup}
                    disabled={isLoading}
                    sx={{
                      color: '#9333EA',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                      p: 0,
                      '&:hover': { 
                        backgroundColor: 'transparent',
                        textDecoration: 'none',
                      },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    {loadingType === 'candidate' ? (
                      <>
                        <CircularProgress size={16} sx={{ color: '#9333EA' }} />
                        Setting up...
                      </>
                    ) : (
                      <>
                        Get Started
                        <ArrowForward sx={{ fontSize: 18 }} />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card
                elevation={0}
                sx={{
                  flex: 1,
                  maxWidth: { md: 400 },
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box
                  sx={{
                    height: 200,
                    backgroundImage: `url(${businessImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    fontWeight="bold"
                    sx={{ color: '#1a1a1a', mb: 1 }}
                  >
                    We're a Business
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ color: '#666', mb: 3 }}
                  >
                    Build your dream team with pre-screened global talent
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1.5,
                      mb: 3,
                    }}
                  >
                    {businessBenefits.map((benefit, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          backgroundColor: '#f8f5ff',
                          borderRadius: 2,
                          px: 1.5,
                          py: 0.75,
                        }}
                      >
                        {benefit.icon}
                        <Typography variant="body2" sx={{ color: '#1a1a1a', fontSize: '0.85rem' }}>
                          {benefit.text}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Button
                    onClick={handleEmployerClick}
                    disabled={isLoading}
                    sx={{
                      color: '#9333EA',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                      p: 0,
                      '&:hover': { 
                        backgroundColor: 'transparent',
                        textDecoration: 'none',
                      },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    {loadingType === 'employer' ? (
                      <>
                        <CircularProgress size={16} sx={{ color: '#9333EA' }} />
                        Setting up...
                      </>
                    ) : (
                      <>
                        Get Started
                        <ArrowForward sx={{ fontSize: 18 }} />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </Box>

            <Box textAlign="center" mt={4}>
              <Typography variant="body2" color="text.secondary">
                Having trouble?{' '}
                <Button
                  variant="text"
                  size="small"
                  onClick={handleBackToLogin}
                  sx={{ 
                    textTransform: 'none', 
                    p: 0, 
                    minWidth: 'auto',
                    verticalAlign: 'baseline',
                    color: '#9333EA',
                    '&:hover': { textDecoration: 'underline', backgroundColor: 'transparent' }
                  }}
                >
                  Go back to Login
                </Button>
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default GoogleSignupPathPage;
