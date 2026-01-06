import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Fade,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const REDIRECT_DELAY_SECONDS = 5;

const GoogleSignupSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(REDIRECT_DELAY_SECONDS);

  const getRedirectUrl = (): string => {
    if (!user?.roles || user.roles.length === 0) {
      return '/account/profile';
    }
    
    const userRoles = user.roles.map(r => typeof r === 'string' ? r : r.roleType);
    
    if (userRoles.includes('candidate')) {
      return '/account/profile';
    }
    
    if (userRoles.some(r => ['client_admin', 'client_hr', 'client_recruiter', 'client_hiring_manager', 'client_employee'].includes(r))) {
      return '/account/profile';
    }
    
    return '/account/profile';
  };

  const redirectUrl = getRedirectUrl();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(redirectUrl, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redirectUrl, navigate]);

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
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default GoogleSignupSuccessPage;
