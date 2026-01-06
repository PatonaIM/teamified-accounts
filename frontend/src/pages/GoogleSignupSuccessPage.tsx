import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Fade,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const REDIRECT_DELAY_SECONDS = 5;

const GoogleSignupSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(REDIRECT_DELAY_SECONDS);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [isLoadingRedirect, setIsLoadingRedirect] = useState(true);

  useEffect(() => {
    const fetchRedirectUrl = async () => {
      try {
        const response = await api.get('/v1/sso/marketing-redirect', {
          params: { source: 'marketing' },
        });

        if (response.data.shouldRedirect && response.data.redirectUrl) {
          setRedirectUrl(response.data.redirectUrl);
        } else {
          setRedirectUrl('/account/profile');
        }
      } catch (error) {
        console.error('Failed to get redirect URL:', error);
        setRedirectUrl('/account/profile');
      } finally {
        setIsLoadingRedirect(false);
      }
    };

    fetchRedirectUrl();
  }, []);

  useEffect(() => {
    if (isLoadingRedirect || !redirectUrl) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (redirectUrl.startsWith('http')) {
            window.location.href = redirectUrl;
          } else {
            navigate(redirectUrl, { replace: true });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoadingRedirect, redirectUrl, navigate]);

  const progress = ((REDIRECT_DELAY_SECONDS - countdown) / REDIRECT_DELAY_SECONDS) * 100;

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
      <Container maxWidth="sm">
        <Fade in timeout={600}>
          <Paper
            elevation={24}
            sx={{
              padding: { xs: 3, sm: 4, md: 5 },
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                backgroundColor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <CheckCircle sx={{ fontSize: 60, color: 'white' }} />
            </Box>

            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight="bold"
              color="primary"
            >
              Welcome to Teamified{user?.firstName ? `, ${user.firstName}` : ''}!
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 2, mb: 4 }}
            >
              Your account has been created successfully. You're all set to get started!
            </Typography>

            {isLoadingRedirect ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 3 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                      },
                    }} 
                  />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Redirecting you in {countdown} second{countdown !== 1 ? 's' : ''}...
                </Typography>
              </>
            )}
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default GoogleSignupSuccessPage;
