import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Link,
} from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';

const COOLDOWN_SECONDS = 60;

const CheckYourEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(cooldownRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);

  const handleResendEmail = async () => {
    if (!email || cooldownRemaining > 0) return;
    
    setIsResending(true);
    setResendSuccess(false);
    setResendError('');

    try {
      const response = await fetch('/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      if (response.ok) {
        setResendSuccess(true);
        setCooldownRemaining(COOLDOWN_SECONDS);
      } else {
        const data = await response.json();
        if (data.errorCode === 'ALREADY_VERIFIED') {
          navigate('/login');
          return;
        }
        setResendSuccess(true);
        setCooldownRemaining(COOLDOWN_SECONDS);
      }
    } catch (err) {
      setResendSuccess(true);
      setCooldownRemaining(COOLDOWN_SECONDS);
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = email ? 
    email.replace(/(.{2})(.*)(@.*)/, (_, start, middle, end) => 
      start + '*'.repeat(Math.min(middle.length, 5)) + end
    ) : '';

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
            p: 5,
            borderRadius: 3,
            backgroundColor: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#F3E8FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <EmailIcon sx={{ fontSize: 40, color: '#9333EA' }} />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontFamily: 'Nunito Sans, sans-serif',
              color: '#1a1a1a',
              mb: 2,
            }}
          >
            Check your email
          </Typography>

          <Typography
            sx={{
              fontFamily: 'Nunito Sans, sans-serif',
              color: '#666',
              fontSize: '16px',
              lineHeight: 1.6,
              mb: 4,
            }}
          >
            We sent a verification link to{' '}
            <Box component="span" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
              {email || maskedEmail}
            </Box>
            . Click it to activate your account.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{
              py: 1.5,
              mb: 2,
              borderRadius: 2,
              backgroundColor: '#9333EA',
              fontFamily: 'Nunito Sans, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#7C3AED',
              },
            }}
          >
            Go back to login
          </Button>

          <Box sx={{ mt: 3 }}>
            <Typography
              sx={{
                fontFamily: 'Nunito Sans, sans-serif',
                color: '#666',
                fontSize: '14px',
                mb: 1,
              }}
            >
              Didn't receive the email?
            </Typography>
            
            <Button
              variant="text"
              onClick={handleResendEmail}
              disabled={isResending || cooldownRemaining > 0 || !email}
              sx={{
                color: '#9333EA',
                fontFamily: 'Nunito Sans, sans-serif',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#F3E8FF',
                },
                '&:disabled': {
                  color: '#9CA3AF',
                },
              }}
            >
              {isResending 
                ? 'Sending...' 
                : cooldownRemaining > 0 
                  ? `Resend email (${cooldownRemaining}s)` 
                  : 'Resend email'}
            </Button>

            {resendSuccess && (
              <Typography
                sx={{
                  fontFamily: 'Nunito Sans, sans-serif',
                  color: '#10B981',
                  fontSize: '14px',
                  mt: 1,
                }}
              >
                Verification email resent.
              </Typography>
            )}

            {resendError && (
              <Typography
                sx={{
                  fontFamily: 'Nunito Sans, sans-serif',
                  color: '#EF4444',
                  fontSize: '14px',
                  mt: 1,
                }}
              >
                {resendError}
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CheckYourEmailPage;
