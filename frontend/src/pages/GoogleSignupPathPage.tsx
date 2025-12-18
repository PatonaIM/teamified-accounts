import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Card,
  CardContent,
  CardActions,
  Fade,
  CircularProgress,
  TextField,
  Alert,
} from '@mui/material';
import {
  PersonAdd,
  Business,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { setAccessToken, setRefreshToken, removeTokens, setUserData } from '../services/authService';
import { checkAndHandleMarketingRedirect, preserveMarketingSourceFromUrl, getMarketingSource } from '../services/marketingRedirectService';

const GoogleSignupPathPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showEmployerForm, setShowEmployerForm] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    preserveMarketingSourceFromUrl();
  }, [location.search]);

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
    setError(null);
    try {
      const response = await api.post('/v1/auth/google/assign-role', { roleType: 'candidate' });
      // Store new tokens and user data with updated roles
      if (response.data.accessToken && response.data.refreshToken) {
        setAccessToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);
        // Update cached user data with new roles from response
        if (response.data.user) {
          setUserData(response.data.user);
        }
      }
      await refreshUser();
      
      const hasMarketingSource = getMarketingSource();
      if (hasMarketingSource) {
        const redirected = await checkAndHandleMarketingRedirect();
        if (redirected) return;
      }
      
      navigate('/account/profile', { replace: true });
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
    setError(null);
    try {
      const response = await api.post('/v1/auth/google/assign-role', {
        roleType: 'client_admin',
        organizationName: orgName.trim(),
      });
      // Store new tokens and user data with updated roles
      if (response.data.accessToken && response.data.refreshToken) {
        setAccessToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);
        // Update cached user data with new roles from response
        if (response.data.user) {
          setUserData(response.data.user);
        }
      }
      await refreshUser();
      
      const hasMarketingSource = getMarketingSource();
      if (hasMarketingSource) {
        const redirected = await checkAndHandleMarketingRedirect();
        if (redirected) return;
      }
      
      navigate('/account/profile', { replace: true });
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
    }
  };

  const handleBackToLogin = () => {
    removeTokens();
    navigate('/login', { replace: true });
  };

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          gap: 3,
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
        <Button
          variant="text"
          onClick={handleBackToLogin}
          sx={{ 
            color: 'white', 
            textTransform: 'none',
            '&:hover': { textDecoration: 'underline', backgroundColor: 'transparent' }
          }}
        >
          Go back to Login
        </Button>
      </Box>
    );
  }

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
                color="primary"
              >
                Welcome to Teamified, {user.firstName}!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {showEmployerForm
                  ? 'Tell us about your organization'
                  : "Let's get you set up. Choose the option that best describes you:"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {user.email}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {showEmployerForm ? (
              <Box sx={{ maxWidth: 400, mx: 'auto' }}>
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
                  color="secondary"
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                  onClick={handleEmployerSubmit}
                  disabled={isLoading || !orgName.trim()}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    mb: 2,
                  }}
                >
                  {isLoading ? 'Setting up...' : 'Continue'}
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  onClick={() => setShowEmployerForm(false)}
                  disabled={isLoading}
                  sx={{ textTransform: 'none' }}
                >
                  Back to options
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Card
                    elevation={4}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 8,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px',
                        }}
                      >
                        <PersonAdd sx={{ fontSize: 40, color: 'white' }} />
                      </Box>
                      <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                        I'm a Candidate
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Looking for job opportunities? Get started instantly.
                      </Typography>
                      <Box component="ul" sx={{ textAlign: 'left', mt: 2, pl: 2 }}>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Browse and apply for jobs
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Track your applications
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Build your professional profile
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <PersonAdd />}
                        onClick={handleCandidateSignup}
                        disabled={isLoading}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1rem',
                        }}
                      >
                        {isLoading ? 'Setting up...' : 'Continue as Candidate'}
                      </Button>
                    </CardActions>
                  </Card>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Card
                    elevation={4}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 8,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
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
                      <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                        I'm an Employer
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Set up your organization to post jobs and manage your team.
                      </Typography>
                      <Box component="ul" sx={{ textAlign: 'left', mt: 2, pl: 2 }}>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Post job openings
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Manage your team
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Track hiring progress
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        color="secondary"
                        startIcon={<Business />}
                        onClick={handleEmployerClick}
                        disabled={isLoading}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1rem',
                        }}
                      >
                        Continue as Employer
                      </Button>
                    </CardActions>
                  </Card>
                </Box>
              </Box>
            )}

            {/* Back to Login link for users stuck in a loop */}
            <Box textAlign="center" mt={3}>
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
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Go back to Login
                </Button>
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default GoogleSignupPathPage;
