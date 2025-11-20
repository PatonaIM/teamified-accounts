import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasVerified = useRef(false);

  // Effect 1: Verify email once
  useEffect(() => {
    const verifyEmail = async () => {
      // Only verify once
      if (hasVerified.current) {
        return;
      }

      // Wait for auth to finish loading before proceeding
      if (authLoading) {
        return;
      }

      const token = searchParams.get('token');

      if (!token) {
        setError('No verification token provided');
        setVerifying(false);
        hasVerified.current = true;
        return;
      }

      hasVerified.current = true;

      try {
        const response = await axios.post('/api/v1/auth/verify-email', {
          token,
        });

        if (response.data.verified) {
          setSuccess(true);
        } else {
          setError(response.data.message || 'Email verification failed');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to verify email. Please try again.';
        setError(errorMessage);
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, authLoading]);


  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #A16AE8 0%, #8096FD 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          p: 4,
          borderRadius: '24px',
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
        }}
      >
        {verifying && (
          <>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Verifying Your Email
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we verify your email address...
            </Typography>
          </>
        )}

        {success && !verifying && (
          <>
            <CheckCircle
              sx={{
                fontSize: 80,
                color: '#4CAF50',
                mb: 3,
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Email Verified Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {user 
                ? 'Your email has been verified successfully.'
                : 'Your email has been verified. You can now log in to your account.'
              }
            </Typography>
            <Alert severity="success" sx={{ mb: 2 }}>
              {user
                ? 'Your account is now fully verified.'
                : 'You can now log in with your credentials.'
              }
            </Alert>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate(user ? '/account' : '/login')}
              sx={{
                mt: 2,
                py: 1.5,
                background: 'linear-gradient(135deg, #A16AE8 0%, #8096FD 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7B3FD6 0%, #5A7AFC 100%)',
                },
              }}
            >
              {user ? 'Go to Profile' : 'Go to Login'}
            </Button>
          </>
        )}

        {error && !verifying && (
          <>
            <Error
              sx={{
                fontSize: 80,
                color: '#f44336',
                mb: 3,
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Verification Failed
            </Typography>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The verification link may have expired or is invalid. Please request a new verification email or contact support.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate(user ? '/account' : '/login')}
              sx={{
                mt: 2,
                py: 1.5,
                background: 'linear-gradient(135deg, #A16AE8 0%, #8096FD 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7B3FD6 0%, #5A7AFC 100%)',
                },
              }}
            >
              {user ? 'Go to Profile' : 'Go to Login'}
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default VerifyEmailPage;
