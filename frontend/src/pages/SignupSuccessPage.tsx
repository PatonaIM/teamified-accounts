import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Fade,
} from '@mui/material';
import {
  MarkEmailRead,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SignupSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/login', { replace: true });
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
              <MarkEmailRead sx={{ fontSize: 50, color: 'white' }} />
            </Box>

            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight="bold"
              color="primary"
            >
              Check Your Email
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 2, mb: 3 }}
            >
              Your account has been created successfully! We've sent a verification email to your inbox.
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Please click the verification link in the email to activate your account. 
              You'll need to verify your email before you can log in.
            </Typography>

            <Box
              sx={{
                backgroundColor: 'grey.100',
                borderRadius: 2,
                p: 2,
                mb: 4,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Didn't receive the email? Check your spam folder or contact support if you need help.
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<ArrowBack />}
              onClick={handleBackToLogin}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Go Back to Login
            </Button>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default SignupSuccessPage;
