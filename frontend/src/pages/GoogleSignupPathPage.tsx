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

  if (showEmployerForm) {
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
                  onClick={() => {
                    setShowEmployerForm(false);
                    setError(null);
                  }}
                  disabled={isLoading}
                  sx={{ 
                    textTransform: 'none', 
                    color: '#9333EA',
                    '&:hover': { backgroundColor: 'rgba(147, 51, 234, 0.08)' },
                  }}
                >
                  Back to options
                </Button>
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
                  <CardActionArea onClick={handleCandidateSignup} sx={{ height: '100%' }} disabled={isLoading}>
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
                  <CardActionArea onClick={handleEmployerClick} sx={{ height: '100%' }} disabled={isLoading}>
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
