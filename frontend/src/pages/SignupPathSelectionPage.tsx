import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Fade,
  Chip,
  Avatar,
  Rating,
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
import { useNavigate, useLocation } from 'react-router-dom';
import jobSeekerImage from '../assets/images/job-seeker.png';
import businessImage from '../assets/images/business.png';
import { preserveMarketingSourceFromUrl, isMarketingSource, getMarketingSource } from '../services/marketingRedirectService';

const SignupPathSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email') || '';
  const returnUrl = searchParams.get('returnUrl') || '/account';
  const intent = searchParams.get('intent') || '';
  const sourceParam = searchParams.get('source');

  useEffect(() => {
    if (isMarketingSource(sourceParam)) {
      preserveMarketingSourceFromUrl();
    }
  }, [sourceParam]);

  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
      return;
    }

    const buildQueryString = () => {
      const params = new URLSearchParams();
      params.set('email', email);
      if (returnUrl !== '/account') {
        params.set('returnUrl', returnUrl);
      }
      if (intent) {
        params.set('intent', intent);
      }
      const marketingSource = getMarketingSource();
      if (marketingSource) {
        params.set('source', marketingSource);
      }
      return params.toString();
    };

    if (intent === 'candidate') {
      navigate(`/signup-candidate?${buildQueryString()}`, { replace: true });
      return;
    } else if (intent === 'client') {
      navigate(`/signup-client-admin?${buildQueryString()}`, { replace: true });
      return;
    }
  }, [email, navigate, returnUrl, intent]);

  const buildSignupUrl = (path: string) => {
    const params = new URLSearchParams();
    params.set('email', email);
    if (returnUrl !== '/account') {
      params.set('returnUrl', returnUrl);
    }
    const marketingSource = getMarketingSource();
    if (marketingSource) {
      params.set('source', marketingSource);
    }
    return `${path}?${params.toString()}`;
  };

  const handleCandidateSignup = () => {
    navigate(buildSignupUrl('/signup-candidate'));
  };

  const handleClientAdminSignup = () => {
    navigate(buildSignupUrl('/signup-client-admin'));
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
                  '&:hover': {
                    boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
                    transform: 'translateY(-6px)',
                  },
                }}
              >
                <CardActionArea onClick={handleCandidateSignup} sx={{ height: '100%' }}>
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
                      Get Started
                      <ArrowForward fontSize="small" />
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
                  '&:hover': {
                    boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
                    transform: 'translateY(-6px)',
                  },
                }}
              >
                <CardActionArea onClick={handleClientAdminSignup} sx={{ height: '100%' }}>
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
                onClick={() => navigate('/login')}
                sx={{
                  color: '#6b7280',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
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

            {/* TODO: Bring back client testimonial once we get a better one
            <Box
              sx={{
                textAlign: 'center',
                maxWidth: 600,
                mx: 'auto',
                mb: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                p: 3,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Rating
                value={5}
                readOnly
                icon={<Star sx={{ color: '#fbbf24' }} />}
                emptyIcon={<Star />}
                sx={{ mb: 2 }}
              />
              <Typography
                variant="body1"
                sx={{
                  fontStyle: 'italic',
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 3,
                  lineHeight: 1.7,
                }}
              >
                "Have a chat with Teamified. You will get a sense that it's much more of a relationship 
                situation where they're really wanting to understand your business."
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white', width: 40, height: 40 }}>RE</Avatar>
                <Box textAlign="left">
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'white' }}>
                    Ryan Ebert
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Founder & CEO, Innings
                  </Typography>
                </Box>
              </Box>
            </Box>
            */}

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

export default SignupPathSelectionPage;
