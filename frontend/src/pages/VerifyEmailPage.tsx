import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Fade, Button, CircularProgress, TextField } from '@mui/material';
import { CheckCircle, Error as ErrorIcon, Lock, AccessTime, Email } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

interface VerifyResponse {
  message: string;
  verified: boolean;
  tokenStatus?: 'expired' | 'invalid' | 'already_verified';
  email?: string;
}

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenStatus, setTokenStatus] = useState<'expired' | 'invalid' | 'already_verified' | null>(null);
  const [expiredEmail, setExpiredEmail] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
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
        setTokenStatus('invalid');
        setVerifying(false);
        hasVerified.current = true;
        return;
      }

      hasVerified.current = true;

      try {
        const response = await axios.post<VerifyResponse>('/api/v1/auth/verify-email', {
          token,
        });

        if (response.data.verified) {
          setSuccess(true);
          if (response.data.tokenStatus === 'already_verified') {
            setTokenStatus('already_verified');
          }
        } else {
          setError(response.data.message || 'Email verification failed');
          setTokenStatus(response.data.tokenStatus || null);
          if (response.data.email) {
            setExpiredEmail(response.data.email);
            setResendEmail(response.data.email);
          }
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to verify email. Please try again.';
        setError(errorMessage);
        setTokenStatus(err.response?.data?.tokenStatus || 'invalid');
        if (err.response?.data?.email) {
          setExpiredEmail(err.response.data.email);
          setResendEmail(err.response.data.email);
        }
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, authLoading]);

  const handleResendVerification = async () => {
    if (!resendEmail) return;
    
    setResending(true);
    try {
      await axios.post('/api/v1/auth/resend-verification', {
        email: resendEmail,
      });
      setResendSuccess(true);
    } catch (err) {
      // Still show success for OWASP compliance
      setResendSuccess(true);
    } finally {
      setResending(false);
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
                <CircularProgress sx={{ color: '#9333EA' }} />
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
                {tokenStatus === 'already_verified' ? 'Email Already Verified' : 'Email Verified Successfully!'}
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
                variant="contained"
                fullWidth
                size="large"
                onClick={() => navigate(user ? '/account' : '/login')}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  fontFamily: '"Nunito Sans", sans-serif',
                  bgcolor: '#9333EA',
                  '&:hover': {
                    bgcolor: '#A855F7',
                  },
                  '&:active': {
                    bgcolor: '#7C3AED',
                  },
                }}
              >
                {user ? 'Go to Profile' : 'Go to Login'}
              </Button>
            </Box>
          </Fade>
        )}

        {error && !verifying && !success && (
          <Fade in={!!error && !verifying}>
            <Box>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: tokenStatus === 'expired' ? '#FEF3C7' : '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                {tokenStatus === 'expired' ? (
                  <AccessTime sx={{ fontSize: 32, color: '#F59E0B' }} />
                ) : (
                  <ErrorIcon sx={{ fontSize: 32, color: '#EF4444' }} />
                )}
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
                {tokenStatus === 'expired' ? 'Link Expired' : 'Verification Failed'}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontSize: '14px',
                  color: '#6B7280',
                  mb: 3,
                }}
              >
                {tokenStatus === 'expired' 
                  ? 'This verification link has expired. Request a new one below.'
                  : 'This verification link is invalid or has already been used.'
                }
              </Typography>

              {resendSuccess ? (
                <Box
                  sx={{
                    bgcolor: '#D1FAE5',
                    border: '1px solid #10B981',
                    borderRadius: 2,
                    p: 2,
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Email sx={{ fontSize: 20, color: '#10B981' }} />
                    <Typography
                      sx={{
                        fontFamily: '"Nunito Sans", sans-serif',
                        fontSize: '14px',
                        color: '#1F2937',
                        fontWeight: 600,
                      }}
                    >
                      Verification email sent!
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: '"Nunito Sans", sans-serif',
                      fontSize: '13px',
                      color: '#6B7280',
                      mt: 1,
                    }}
                  >
                    If this email is registered and unverified, you will receive a verification email shortly.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Email address"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={resending}
                    sx={{
                      mb: 2,
                      '& .MuiInputLabel-root': {
                        color: '#9CA3AF',
                        fontFamily: '"Nunito Sans", sans-serif',
                        '&.Mui-focused': { color: '#9333EA' },
                      },
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        borderRadius: 2,
                        fontFamily: '"Nunito Sans", sans-serif',
                        '& fieldset': { borderColor: '#E5E7EB' },
                        '&:hover fieldset': { borderColor: '#9333EA' },
                        '&.Mui-focused fieldset': { borderColor: '#9333EA', borderWidth: 2 },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleResendVerification}
                    disabled={resending || !resendEmail}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      fontFamily: '"Nunito Sans", sans-serif',
                      bgcolor: '#9333EA',
                      '&:hover': { bgcolor: '#A855F7' },
                      '&:active': { bgcolor: '#7C3AED' },
                      '&:disabled': { bgcolor: 'rgba(147, 51, 234, 0.5)', color: 'white' },
                    }}
                  >
                    {resending ? <CircularProgress size={24} color="inherit" /> : 'Resend Verification Email'}
                  </Button>
                </Box>
              )}

              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{
                  color: '#6B7280',
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontFamily: '"Nunito Sans", sans-serif',
                  '&:hover': {
                    color: '#9333EA',
                    bgcolor: 'transparent',
                  },
                }}
              >
                Back to Login
              </Button>
            </Box>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default VerifyEmailPage;
