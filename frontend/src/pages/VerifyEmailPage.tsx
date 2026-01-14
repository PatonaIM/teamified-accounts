import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Fade, Button, CircularProgress, TextField, Alert } from '@mui/material';
import { CheckCircle, Error as ErrorIcon, Lock, AccessTime } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [emailFromError, setEmailFromError] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
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
          setErrorCode(response.data.errorCode || null);
          setEmailFromError(response.data.email || null);
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to verify email. Please try again.';
        const errCode = err.response?.data?.errorCode || null;
        const errEmail = err.response?.data?.email || null;
        setError(errorMessage);
        setErrorCode(errCode);
        setEmailFromError(errEmail);
        // Pre-fill email if available
        if (errEmail) {
          setResendEmail(errEmail);
        }
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, authLoading]);

  // Handle resend verification - defined outside useEffect
  const handleResendVerification = async () => {
    const emailToResend = resendEmail || emailFromError;
    if (!emailToResend) return;
    
    setResendLoading(true);
    try {
      await axios.post('/api/v1/auth/resend-verification', {
        email: emailToResend,
      });
      setResendSuccess(true);
    } catch (err) {
      // Still show success for OWASP compliance
      setResendSuccess(true);
    } finally {
      setResendLoading(false);
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

        {error && !verifying && (
          <Fade in={!!error && !verifying}>
            <Box>
              {/* Show resend success message if applicable */}
              {resendSuccess ? (
                <>
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
                    Verification Email Sent
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
                    If an account exists with this email, we have sent a new verification link. Please check your inbox.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => navigate('/login')}
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
                    Go to Login
                  </Button>
                </>
              ) : (
                <>
                  {/* Expired token state - show orange/warning icon */}
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: errorCode === 'EXPIRED_TOKEN' ? '#FEF3C7' : '#FEE2E2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                    }}
                  >
                    {errorCode === 'EXPIRED_TOKEN' ? (
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
                    {errorCode === 'EXPIRED_TOKEN' ? 'Link Expired' : 'Verification Failed'}
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
                    {errorCode === 'EXPIRED_TOKEN' 
                      ? 'This verification link has expired. Request a new one below.'
                      : 'This verification link is invalid. It may have already been used or replaced by a newer link.'
                    }
                  </Typography>

                  {/* Resend verification form */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      sx={{
                        fontFamily: '"Nunito Sans", sans-serif',
                        fontSize: '14px',
                        color: '#374151',
                        mb: 1.5,
                        fontWeight: 500,
                      }}
                    >
                      Request a new verification email:
                    </Typography>
                    <TextField
                      fullWidth
                      type="email"
                      placeholder="Enter your email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      size="small"
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#9333EA',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#9333EA',
                          },
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={(!resendEmail && !emailFromError) || resendLoading}
                      onClick={handleResendVerification}
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
                        '&:disabled': {
                          bgcolor: 'rgba(147, 51, 234, 0.5)',
                          color: 'white',
                        },
                      }}
                    >
                      {resendLoading ? <CircularProgress size={24} color="inherit" /> : 'Send New Verification Email'}
                    </Button>
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="text"
                      onClick={() => navigate('/login')}
                      sx={{
                        color: '#6B7280',
                        textTransform: 'none',
                        fontFamily: '"Nunito Sans", sans-serif',
                        '&:hover': {
                          color: '#9333EA',
                          bgcolor: 'transparent',
                        },
                      }}
                    >
                      ← Back to Login
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default VerifyEmailPage;
