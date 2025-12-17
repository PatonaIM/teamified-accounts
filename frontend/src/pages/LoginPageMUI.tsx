import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, getAccessToken, isAuthenticated, getRefreshToken, refreshAccessToken, setAccessToken } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton';
import { getLastPath } from '../components/SessionAwareRedirect';

const LoginPageMUI: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser, user, loading } = useAuth();
  
  const searchParams = new URLSearchParams(window.location.search);
  const returnUrl = searchParams.get('returnUrl') || '/account/profile';
  
  // Extract intent from the returnUrl if it's an SSO authorize URL
  const extractIntentFromReturnUrl = (): string => {
    if (returnUrl.includes('/api/v1/sso/authorize')) {
      try {
        // Parse the returnUrl to extract query params
        const url = new URL(returnUrl, window.location.origin);
        return url.searchParams.get('intent') || '';
      } catch {
        return '';
      }
    }
    return '';
  };
  const intent = extractIntentFromReturnUrl();
  
  console.log('[LoginPageMUI] Current URL:', window.location.href);
  console.log('[LoginPageMUI] Return URL from query params:', returnUrl);
  console.log('[LoginPageMUI] Is SSO authorize URL?:', returnUrl.includes('/api/v1/sso/authorize'));
  console.log('[LoginPageMUI] Extracted intent:', intent);
  
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (loading) return;
      
      const targetUrl = returnUrl !== '/account/profile' ? returnUrl : (getLastPath() || '/account/profile');
      const isSsoAuthorizeUrl = targetUrl.includes('/api/v1/sso/authorize');
      
      if (user) {
        console.log('[LoginPageMUI] User already authenticated, redirecting...');
        
        if (isSsoAuthorizeUrl) {
          // For SSO authorize URLs, verify the COOKIE is still valid on the server
          // before redirecting, to prevent redirect loops when cookie is expired.
          // IMPORTANT: We use credentials: 'include' WITHOUT Authorization header
          // because the SSO authorize endpoint only checks cookies, not Bearer tokens.
          try {
            const verifyResponse = await fetch('/api/v1/auth/me', {
              credentials: 'include',
              // NO Authorization header - force cookie validation only
            });
            if (verifyResponse.ok) {
              console.log('[LoginPageMUI] Cookie session verified, redirecting to SSO authorize');
              window.location.href = targetUrl;
            } else {
              console.log('[LoginPageMUI] Cookie expired on server, clearing stale auth state');
              // Clear stale auth state to prevent loop
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user_cache');
              await refreshUser();
            }
          } catch (error) {
            console.log('[LoginPageMUI] Cookie verification failed, clearing stale auth state');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_cache');
            await refreshUser();
          }
        } else {
          navigate(targetUrl, { replace: true });
        }
        return;
      }
      
      if (!isAuthenticated()) {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            console.log('[LoginPageMUI] Attempting token refresh...');
            const response = await refreshAccessToken(refreshToken);
            setAccessToken(response.data.accessToken);
            await refreshUser();
            
            console.log('[LoginPageMUI] Token refreshed, redirecting to:', targetUrl);
            
            if (isSsoAuthorizeUrl) {
              window.location.href = targetUrl;
            } else {
              navigate(targetUrl, { replace: true });
            }
          } catch (error) {
            console.log('[LoginPageMUI] Token refresh failed, showing login form');
          }
        }
      }
    };
    
    checkAndRedirect();
  }, [user, loading, navigate, returnUrl, refreshUser]);
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [emailAlreadyRegistered, setEmailAlreadyRegistered] = useState(false);
  const [shakeEmail, setShakeEmail] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (field === 'email' && emailAlreadyRegistered) {
      setEmailAlreadyRegistered(false);
    }
  };

  const validateEmail = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailContinue = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/v1/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const data = await response.json();
      
      if (data.valid) {
        setStep('password');
      } else {
        // Build signup URL with email, returnUrl, and intent (if present)
        const signupParams = new URLSearchParams();
        signupParams.set('email', formData.email);
        if (returnUrl !== '/account/profile') {
          signupParams.set('returnUrl', returnUrl);
        }
        if (intent) {
          signupParams.set('intent', intent);
        }
        const signupUrl = `/signup-select?${signupParams.toString()}`;
        navigate(signupUrl);
      }
    } catch (error) {
      setErrors({ 
        general: 'Unable to check email. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setFormData(prev => ({ ...prev, password: '' }));
    setErrors({});
  };

  const handleModeToggle = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setErrors({});
    setEmailAlreadyRegistered(false);
  };

  const handleSignupContinue = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    try {
      // Check if email already exists
      const response = await fetch('/api/v1/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const data = await response.json();
      
      if (data.valid) {
        // Email exists - show error state, shake, and prompt to sign in
        setEmailAlreadyRegistered(true);
        setShakeEmail(true);
        setTimeout(() => setShakeEmail(false), 500);
      } else {
        // Email doesn't exist - proceed to signup
        const signupParams = new URLSearchParams();
        signupParams.set('email', formData.email);
        if (returnUrl !== '/account/profile') {
          signupParams.set('returnUrl', returnUrl);
        }
        if (intent) {
          signupParams.set('intent', intent);
        }
        const signupUrl = `/signup-select?${signupParams.toString()}`;
        navigate(signupUrl);
      }
    } catch (error) {
      setErrors({ 
        general: 'Unable to check email. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await login({
        email: formData.email,
        password: formData.password,
        rememberMe: false
      });
      
      await refreshUser();
      
      console.log('[LoginPageMUI] Login successful, redirecting to:', returnUrl);
      
      if (returnUrl !== '/account/profile' && returnUrl.includes('/api/v1/sso/authorize')) {
        console.log('[LoginPageMUI] SSO flow - redirecting with cookies');
        window.location.href = returnUrl;
      } else {
        console.log('[LoginPageMUI] Normal redirect');
        navigate(returnUrl);
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setErrors({ general: errorMessage });
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Panel - Purple Gradient (~63%) */}
      <Box
        sx={{
          flex: '0 0 63%',
          background: 'linear-gradient(135deg, #A16AE8 0%, #8096FD 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 6,
          color: 'white',
          position: 'relative',
          '@media (max-width: 900px)': {
            display: 'none',
          },
        }}
      >
        <Box sx={{ maxWidth: 600, textAlign: 'center' }}>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '3.5rem', md: '4.5rem' },
              letterSpacing: '-0.02em',
            }}
          >
            Teamified
          </Typography>
          <Typography
            variant="h4"
            sx={{
              opacity: 0.95,
              fontSize: { xs: '1.25rem', md: '1.75rem' },
              fontWeight: 400,
              lineHeight: 1.5,
            }}
          >
            Build Your Global Team in Days — Not Weeks
          </Typography>
        </Box>
      </Box>

      {/* Right Panel - Dark Background (~37%) */}
      <Box
        sx={{
          flex: 1,
          bgcolor: '#1E1E1E',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 4,
        }}
      >
        {/* Sign-in Form Container */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 400,
            bgcolor: '#2A2A2A',
            borderRadius: 3,
            padding: 4,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={mode === 'signin' ? handleEmailContinue : handleSignupContinue}>
              {/* Header */}
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  mb: 1,
                  textAlign: 'center',
                }}
              >
                {mode === 'signin' ? 'Sign in' : 'Create New Account'}
              </Typography>

              {/* Mode Toggle Link */}
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textAlign: 'center',
                  mb: 4,
                  fontSize: '0.9rem',
                }}
              >
                {mode === 'signin' 
                  ? 'New here? ' 
                  : emailAlreadyRegistered 
                    ? 'Are you trying to sign in? '
                    : 'Already have an account? '}
                <Box
                  component="span"
                  onClick={handleModeToggle}
                  sx={{
                    color: '#A16AE8',
                    textDecoration: 'none',
                    fontWeight: 500,
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {mode === 'signin' ? 'Create an account' : 'Sign in'}
                </Box>
              </Typography>

              {/* Error Alert */}
              {errors.general && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {errors.general}
                </Alert>
              )}
              <TextField
                fullWidth
                placeholder="Personal or Work Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email || emailAlreadyRegistered}
                helperText={errors.email || (emailAlreadyRegistered ? 'This email is already registered.' : '')}
                disabled={isLoading}
                sx={{
                  mb: 3,
                  animation: shakeEmail ? 'shake 0.5s ease-in-out' : 'none',
                  '@keyframes shake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                    '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
                  },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'transparent',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: emailAlreadyRegistered ? '#ef4444' : 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: emailAlreadyRegistered ? '#ef4444' : 'rgba(255, 255, 255, 0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: emailAlreadyRegistered ? '#ef4444' : '#A16AE8',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    '&:-webkit-autofill': {
                      WebkitBoxShadow: '0 0 0 100px #2A2A2A inset',
                      WebkitTextFillColor: 'white',
                      caretColor: 'white',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 1,
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#ef4444',
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  mb: 3,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #A16AE8 0%, #8096FD 100%)',
                  boxShadow: '0 4px 15px rgba(161, 106, 232, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8B5AE8 0%, #6B86FD 100%)',
                    boxShadow: '0 6px 20px rgba(161, 106, 232, 0.4)',
                  },
                  '&:disabled': {
                    background: 'rgba(161, 106, 232, 0.5)',
                  },
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : (mode === 'signin' ? 'Next' : 'Continue')}
              </Button>

              <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.12)' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  or
                </Typography>
              </Divider>

              <GoogleLoginButton returnUrl={returnUrl !== '/account/profile' ? returnUrl : undefined} />

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Link
                  href="/forgot-password"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: '#A16AE8',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Need help? Contact support@teamified.com
                </Link>
              </Box>
            </form>
          )}

          {/* Password Step */}
          {step === 'password' && (
            <form onSubmit={handleSubmit}>
              {/* Welcome back Header */}
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                Welcome back
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textAlign: 'center',
                  mb: 4,
                }}
              >
                {formData.email}
              </Typography>

              {/* Error Alert */}
              {errors.general && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {errors.general}
                </Alert>
              )}

              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                disabled={isLoading}
                autoFocus
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.7)',
                          zIndex: 1,
                          '&:hover': {
                            color: 'rgba(255, 255, 255, 0.9)',
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'transparent',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#A16AE8',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    '&:-webkit-autofill': {
                      WebkitBoxShadow: '0 0 0 100px #2A2A2A inset',
                      WebkitTextFillColor: 'white',
                      caretColor: 'white',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 1,
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#ef4444',
                  },
                  '& .MuiInputAdornment-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  onClick={handleBackToEmail}
                  variant="outlined"
                  disabled={isLoading}
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                    },
                    '&:disabled': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                >
                  Back
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #A16AE8 0%, #8096FD 100%)',
                    boxShadow: '0 4px 15px rgba(161, 106, 232, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8B5AE8 0%, #6B86FD 100%)',
                      boxShadow: '0 6px 20px rgba(161, 106, 232, 0.4)',
                    },
                    '&:disabled': {
                      background: 'rgba(161, 106, 232, 0.5)',
                    },
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </Button>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  href="/forgot-password"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: '#A16AE8',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Forgot password?
                </Link>
              </Box>
            </form>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPageMUI;
