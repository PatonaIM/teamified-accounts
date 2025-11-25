import React, { useEffect } from 'react';
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
} from '@mui/material';
import {
  PersonAdd,
  Business,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const SignupPathSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email, returnUrl, and intent from query parameters
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email') || '';
  const returnUrl = searchParams.get('returnUrl') || '/account';
  const intent = searchParams.get('intent') || '';

  useEffect(() => {
    // If no email provided, redirect back to login
    if (!email) {
      navigate('/login', { replace: true });
      return;
    }

    // Build the query string for signup pages
    const buildQueryString = () => {
      const params = new URLSearchParams();
      params.set('email', email);
      if (returnUrl !== '/account') {
        params.set('returnUrl', returnUrl);
      }
      if (intent) {
        params.set('intent', intent);
      }
      return params.toString();
    };

    // Auto-redirect based on intent parameter
    if (intent === 'candidate') {
      // Candidate-only app: go directly to candidate signup
      navigate(`/signup-candidate?${buildQueryString()}`, { replace: true });
      return;
    } else if (intent === 'client') {
      // Client-only app: go directly to employer signup
      navigate(`/signup-client-admin?${buildQueryString()}`, { replace: true });
      return;
    }
    // If intent is 'both' or not specified, show the selection page
  }, [email, navigate, returnUrl, intent]);

  const handleCandidateSignup = () => {
    navigate(`/signup-candidate?email=${encodeURIComponent(email)}${returnUrl !== '/account' ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`);
  };

  const handleClientAdminSignup = () => {
    navigate(`/signup-client-admin?email=${encodeURIComponent(email)}${returnUrl !== '/account' ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`);
  };

  const handleBackToLogin = () => {
    navigate('/login');
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
                color="primary"
              >
                Welcome to Teamified
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Let's get you set up. Choose the option that best describes you:
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {email}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              {/* Candidate Signup Card */}
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
                      Join as a job seeker looking for opportunities. Quick and easy 30-second signup.
                    </Typography>
                    <Box component="ul" sx={{ textAlign: 'left', mt: 2, pl: 2 }}>
                      <Typography component="li" variant="body2" color="text.secondary">
                        Apply for jobs
                      </Typography>
                      <Typography component="li" variant="body2" color="text.secondary">
                        Track applications
                      </Typography>
                      <Typography component="li" variant="body2" color="text.secondary">
                        Build your profile
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<PersonAdd />}
                      onClick={handleCandidateSignup}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                      }}
                    >
                      Sign Up as Candidate
                    </Button>
                  </CardActions>
                </Card>
              </Box>

              {/* Client Admin Signup Card */}
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
                      Set up your organization account to post jobs and manage your team.
                    </Typography>
                    <Box component="ul" sx={{ textAlign: 'left', mt: 2, pl: 2 }}>
                      <Typography component="li" variant="body2" color="text.secondary">
                        Create organization
                      </Typography>
                      <Typography component="li" variant="body2" color="text.secondary">
                        Post job openings
                      </Typography>
                      <Typography component="li" variant="body2" color="text.secondary">
                        Manage team members
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
                      onClick={handleClientAdminSignup}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                      }}
                    >
                      Sign Up as Employer
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            </Box>

            <Box textAlign="center" mt={4}>
              <Button
                startIcon={<ArrowBack />}
                onClick={handleBackToLogin}
                sx={{ textTransform: 'none' }}
              >
                Back to Login
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default SignupPathSelectionPage;
