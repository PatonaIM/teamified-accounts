import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Fade } from '@mui/material';
import { CheckCircle, Error as ErrorIcon, Lock } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Spinner } from '../components/ui/spinner';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (hasVerified.current) {
        return;
      }

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
        backgroundColor: '#F5F7F8',
        fontFamily: '"Nunito Sans", sans-serif',
        p: 2,
      }}
    >
      <Box
        sx={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
          p: 5,
          maxWidth: 440,
          width: '100%',
          textAlign: 'center',
        }}
      >
        {verifying && (
          <Fade in={verifying}>
            <Box>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: '#F3E8FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <Lock sx={{ fontSize: 32, color: '#9333EA' }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontWeight: 700,
                  fontSize: '24px',
                  color: '#1F2937',
                  mb: 1,
                }}
              >
                Verifying Your Email
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontSize: '14px',
                  color: '#6B7280',
                  mb: 3,
                }}
              >
                Please wait while we verify your email address...
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Spinner size="lg" />
              </Box>
            </Box>
          </Fade>
        )}

        {success && !verifying && (
          <Fade in={success && !verifying}>
            <Box>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: '#D1FAE5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <CheckCircle sx={{ fontSize: 32, color: '#10B981' }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontWeight: 700,
                  fontSize: '24px',
                  color: '#1F2937',
                  mb: 1,
                }}
              >
                Email Verified Successfully!
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontSize: '14px',
                  color: '#6B7280',
                  mb: 2,
                }}
              >
                {user 
                  ? 'Your email has been verified successfully.'
                  : 'Your email has been verified. You can now log in to your account.'
                }
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontSize: '14px',
                  color: '#6B7280',
                  mb: 3,
                  textAlign: 'center',
                }}
              >
                {user
                  ? 'Your account is now fully verified.'
                  : 'You can now log in with your credentials.'
                }
              </Typography>
              <Button
                variant="secondary"
                className="w-full"
                size="lg"
                onClick={() => navigate(user ? '/account' : '/login')}
              >
                {user ? 'Go to Profile' : 'Go to Login'}
              </Button>
            </Box>
          </Fade>
        )}

        {error && !verifying && (
          <Fade in={!!error && !verifying}>
            <Box>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <ErrorIcon sx={{ fontSize: 32, color: '#EF4444' }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontWeight: 700,
                  fontSize: '24px',
                  color: '#1F2937',
                  mb: 1,
                }}
              >
                Verification Failed
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontSize: '14px',
                  color: '#6B7280',
                  mb: 2,
                }}
              >
                {error}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontSize: '14px',
                  color: '#6B7280',
                  mb: 3,
                  textAlign: 'center',
                }}
              >
                Please request a new verification email or contact support.
              </Typography>
              <Button
                variant="secondary"
                className="w-full"
                size="lg"
                onClick={() => navigate(user ? '/account' : '/login')}
              >
                {user ? 'Go to Profile' : 'Go to Login'}
              </Button>
            </Box>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default VerifyEmailPage;
