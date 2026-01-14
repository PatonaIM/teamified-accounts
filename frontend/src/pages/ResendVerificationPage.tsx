import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Link,
} from '@mui/material';
import { ArrowBack, Email as EmailIcon, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ResendVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F7F8',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Link
              component="button"
              onClick={() => navigate('/login')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: '#666',
                textDecoration: 'none',
                fontSize: '14px',
                '&:hover': { color: '#9333EA' },
              }}
            >
              <ArrowBack sx={{ fontSize: 18, mr: 0.5 }} />
              Back to login
            </Link>
          </Box>

          {!submitted ? (
            <>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: '#F3E8FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <EmailIcon sx={{ fontSize: 32, color: '#9333EA' }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    fontFamily: 'Nunito Sans, sans-serif',
                    color: '#1a1a1a',
                    mb: 1,
                  }}
                >
                  Resend Email Verification
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Nunito Sans, sans-serif',
                    color: '#666',
                    fontSize: '14px',
                  }}
                >
                  Enter your email address and we'll send you a new verification link.
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 3, borderRadius: 1.5 }}
                >
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    '&:hover fieldset': {
                      borderColor: '#9333EA',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#9333EA',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#9333EA',
                  },
                }}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleSubmit}
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  borderRadius: 1.5,
                  backgroundColor: '#9333EA',
                  fontFamily: 'Nunito Sans, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#7C3AED',
                  },
                  '&:disabled': {
                    backgroundColor: '#D8B4FE',
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Resend Verification'
                )}
              </Button>
            </>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: '#D1FAE5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CheckCircle sx={{ fontSize: 32, color: '#10B981' }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontFamily: 'Nunito Sans, sans-serif',
                  color: '#1a1a1a',
                  mb: 2,
                }}
              >
                Check Your Email
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'Nunito Sans, sans-serif',
                  color: '#666',
                  fontSize: '15px',
                  lineHeight: 1.6,
                  mb: 3,
                }}
              >
                We have sent a verification link to this email address. Please check your email.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 1.5,
                  borderColor: '#9333EA',
                  color: '#9333EA',
                  fontFamily: 'Nunito Sans, sans-serif',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#7C3AED',
                    backgroundColor: '#F3E8FF',
                  },
                }}
              >
                Back to Login
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ResendVerificationPage;
