import React, { useState, useEffect, useRef } from 'react';
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
import { preserveMarketingSourceFromUrl, isMarketingSource } from '../services/marketingRedirectService';
import { isPortalRedirectEnabled } from '../utils/featureFlags';

const LoginPageMUI: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser, clearUser, user, loading } = useAuth();
  
  const searchParams = new URLSearchParams(window.location.search);
  const returnUrl = searchParams.get('returnUrl') || '/account/profile';
  const sourceParam = searchParams.get('source');
  
  // Ref to prevent multiple cookie verification attempts (prevents infinite loop)
  const cookieVerificationAttempted = useRef(false);

  useEffect(() => {
    if (isMarketingSource(sourceParam)) {
      preserveMarketingSourceFromUrl();
    }
  }, [sourceParam]);
  
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
  
  // Reset verification flag when user is cleared
  useEffect(() => {
    if (!user && !loading) {
      cookieVerificationAttempted.current = false;
    }
  }, [user, loading]);
  
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (loading) return;
      
      // Skip authenticated-user redirect if a portal redirect is pending
      const portalRedirectPending = sessionStorage.getItem('portalRedirectPending') === 'true';
      if (portalRedirectPending) {
        console.log('[LoginPageMUI] Portal redirect pending, skipping authenticated user redirect');
        return;
      }
      
      const targetUrl = returnUrl !== '/account/profile' ? returnUrl : (getLastPath() || '/account/profile');
      const isSsoAuthorizeUrl = targetUrl.includes('/api/v1/sso/authorize');
      
      if (user) {
        console.log('[LoginPageMUI] User already authenticated, redirecting...');
        
        if (isSsoAuthorizeUrl) {
          // Prevent infinite loop - only verify cookie once
          if (cookieVerificationAttempted.current) {
            console.log('[LoginPageMUI] Cookie verification already attempted, showing login form');
            return;
          }
          cookieVerificationAttempted.current = true;
          
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
              // Clear stale auth state - use clearUser instead of refreshUser to prevent loop
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user_cache');
              clearUser();
            }
          } catch (error) {
            console.log('[LoginPageMUI] Cookie verification failed, clearing stale auth state');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_cache');
            clearUser();
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
  }, [user, loading, navigate, returnUrl, refreshUser, clearUser]);
  
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
  const [portalRedirect, setPortalRedirect] = useState<{ url: string; name: string } | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [signupUrl, setSignupUrl] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (field === 'email') {
      if (emailAlreadyRegistered) {
        setEmailAlreadyRegistered(false);
      }
      if (isNewUser) {
        setIsNewUser(false);
      }
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
      console.log('[LoginPageMUI] Check email response:', data);
      
      if (data.valid) {
        console.log('[LoginPageMUI] Email exists, proceeding to password step');
        setStep('password');
        setIsNewUser(false);
      } else {
        console.log('[LoginPageMUI] Email not found, showing new user message');
        // Build signup URL with email, returnUrl, and intent (if present)
        const signupParams = new URLSearchParams();
        signupParams.set('email', formData.email);
        if (returnUrl !== '/account/profile') {
          signupParams.set('returnUrl', returnUrl);
        }
        if (intent) {
          signupParams.set('intent', intent);
        }
        setSignupUrl(`/signup-select?${signupParams.toString()}`);
        setIsNewUser(true);
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
    setIsNewUser(false);
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
      const loginResponse = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: false
      });
      
      const { loginEmailType, loginEmailOrganizationSlug, user } = loginResponse;
      const isSuperAdmin = user?.roles?.includes('super_admin') || false;
      
      console.log('[LoginPageMUI] Login successful');
      console.log('[LoginPageMUI] Email type:', loginEmailType, 'Org:', loginEmailOrganizationSlug);
      console.log('[LoginPageMUI] Is super admin:', isSuperAdmin);
      console.log('[LoginPageMUI] Return URL:', returnUrl);
      
      // Determine redirect target BEFORE refreshUser to set pending flag early
      let redirectUrl: string;
      let portalName: string = '';
      let isExternalRedirect = false;
      
      // If there's a specific returnUrl (e.g., SSO authorize), honor it
      if (returnUrl !== '/account/profile' && returnUrl.includes('/api/v1/sso/authorize')) {
        console.log('[LoginPageMUI] SSO flow - will redirect with cookies');
        redirectUrl = returnUrl;
      } else if (returnUrl !== '/account/profile' && returnUrl !== '/') {
        // If there's a specific non-default returnUrl, honor it
        console.log('[LoginPageMUI] Specific returnUrl requested:', returnUrl);
        redirectUrl = returnUrl;
      } else if (loginEmailType === 'work' && loginEmailOrganizationSlug === 'teamified-internal' && isSuperAdmin) {
        // Super admin logging in with Teamified Internal work email stays in Teamified Accounts
        redirectUrl = '/account/profile';
        console.log('[LoginPageMUI] Super admin with Teamified Internal email - staying in Teamified Accounts');
      } else if (!isPortalRedirectEnabled()) {
        // Portal redirects are disabled by feature flag - stay in Teamified Accounts
        redirectUrl = '/account/profile';
        console.log('[LoginPageMUI] Portal redirects disabled by feature flag - staying in Teamified Accounts');
      } else if (loginEmailType === 'personal') {
        // Personal email login - redirect to Jobseeker Portal
        redirectUrl = 'https://teamified-jobseeker.replit.app';
        portalName = 'Jobseeker Portal';
        isExternalRedirect = true;
        console.log('[LoginPageMUI] Personal email - redirecting to Jobseeker Portal');
      } else {
        // Work email login (any organization) - redirect to ATS Portal
        redirectUrl = 'https://teamified-ats.replit.app';
        portalName = 'ATS Portal';
        isExternalRedirect = true;
        console.log('[LoginPageMUI] Work email - redirecting to ATS Portal');
      }
      
      // Set pending flag BEFORE refreshUser to prevent authenticated-user redirect race
      if (isExternalRedirect) {
        sessionStorage.setItem('portalRedirectPending', 'true');
        console.log('[LoginPageMUI] Set portal redirect pending flag');
      }
      
      await refreshUser();
      
      // Now perform the redirect
      if (isExternalRedirect) {
        // Show loading overlay and do external redirect directly from this page
        // This avoids adding an intermediate route to browser history
        setPortalRedirect({ url: redirectUrl, name: portalName });
      } else if (redirectUrl.includes('/api/v1/sso/authorize')) {
        window.location.href = redirectUrl;
      } else {
        navigate(redirectUrl);
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setErrors({ general: errorMessage });
      setIsLoading(false);
    }
  };

  // Effect to perform external portal redirect
  useEffect(() => {
    if (portalRedirect) {
      console.log('[LoginPageMUI] Performing external redirect to:', portalRedirect.url);
      // Clear the pending flag
      sessionStorage.removeItem('portalRedirectPending');
      // Use window.location.replace to replace current history entry
      // This means back button from external portal won't return here
      window.location.replace(portalRedirect.url);
    }
  }, [portalRedirect]);

  // Show loading overlay when redirecting to external portal
  if (portalRedirect) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <CircularProgress 
          size={60} 
          sx={{ 
            color: 'white',
            mb: 3 
          }} 
        />
        <Typography variant="h5" sx={{ fontWeight: 500, mb: 1 }}>
          Redirecting you to {portalRedirect.name}...
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Please wait a moment
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: '#F5F7F8',
      }}
    >
      {/* Top Header Bar */}
      <Box
        sx={{
          width: '100%',
          py: 2,
          px: 3,
          bgcolor: 'white',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Box
          component="img"
          src="/assets/teamified-logo-black.png"
          alt="Teamified"
          sx={{
            height: 24,
            width: 'auto',
          }}
        />
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 4,
          gap: 4,
        }}
      >
        {/* Marketing Content Box (box1) */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 400,
            display: { xs: 'none', md: 'block' },
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              lineHeight: 1.3,
              color: '#9333EA',
            }}
          >
            Hire. Manage. Scale Globally
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 4,
              lineHeight: 1.3,
              color: '#111827',
            }}
          >
            In One Platform
          </Typography>

          <Box sx={{ borderTop: '1px solid #E5E7EB', pt: 3, textAlign: 'center' }}>
            <Typography sx={{ color: '#4a4a4a', fontSize: '0.9rem', mb: 1 }}>
              ✅ No upfront cost · ✅ No credit card required
            </Typography>
            <Typography sx={{ color: '#6b7280', fontSize: '0.85rem' }}>
              Success guarantee — replacement at no extra cost.
            </Typography>
          </Box>
        </Box>

        {/* Sign-in Form Container */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 400,
            bgcolor: 'white',
            borderRadius: 3,
            padding: 4,
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={mode === 'signin' ? handleEmailContinue : handleSignupContinue}>
              {/* Header */}
              <Typography
                variant="h4"
                sx={{
                  color: '#1a1a1a',
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
                  color: '#6b7280',
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
                label="Personal or Work Email"
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
                  '& .MuiInputLabel-root': {
                    color: '#9CA3AF',
                    '&.Mui-focused': {
                      color: '#9333EA',
                    },
                    '&.MuiInputLabel-shrink': {
                      color: '#6b7280',
                    },
                    '&.Mui-focused.MuiInputLabel-shrink': {
                      color: '#9333EA',
                    },
                    '&.Mui-error': {
                      color: '#ef4444',
                    },
                  },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: emailAlreadyRegistered ? '#ef4444' : '#E5E7EB',
                    },
                    '&:hover fieldset': {
                      borderColor: emailAlreadyRegistered ? '#ef4444' : '#9333EA',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: emailAlreadyRegistered ? '#ef4444' : '#9333EA',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#1a1a1a',
                    '&:-webkit-autofill': {
                      WebkitBoxShadow: '0 0 0 100px white inset',
                      WebkitTextFillColor: '#1a1a1a',
                      caretColor: '#1a1a1a',
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#ef4444',
                  },
                }}
              />

              {/* Friendly New User Message */}
              {isNewUser && mode === 'signin' && (
                <Box
                  sx={{
                    bgcolor: '#F3E8FF',
                    borderRadius: 2,
                    p: 2.5,
                    mb: 3,
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#1a1a1a',
                      fontWeight: 600,
                      fontSize: '1rem',
                      mb: 0.5,
                    }}
                  >
                    Looks like you're new!
                  </Typography>
                  <Typography
                    sx={{
                      color: '#4a4a4a',
                      fontSize: '0.9rem',
                    }}
                  >
                    This email isn't registered yet. Click on "Create an account" above to get started.
                  </Typography>
                </Box>
              )}

              {/* Friendly Already Registered Message */}
              {emailAlreadyRegistered && mode === 'signup' && (
                <Box
                  sx={{
                    bgcolor: '#FEF3C7',
                    borderRadius: 2,
                    p: 2.5,
                    mb: 3,
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#1a1a1a',
                      fontWeight: 600,
                      fontSize: '1rem',
                      mb: 0.5,
                    }}
                  >
                    You've signed up before using this email.
                  </Typography>
                  <Typography
                    sx={{
                      color: '#4a4a4a',
                      fontSize: '0.9rem',
                    }}
                  >
                    Try sign in instead.
                  </Typography>
                </Box>
              )}


              {!isNewUser && (
                <>
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
                      bgcolor: '#9333EA',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#A855F7',
                      },
                      '&:active': {
                        bgcolor: '#7E22CE',
                      },
                      '&:disabled': {
                        bgcolor: 'rgba(147, 51, 234, 0.5)',
                        color: 'white',
                      },
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : (mode === 'signin' ? 'Next' : 'Continue')}
                  </Button>

                  <Divider sx={{ my: 3, borderColor: '#E5E7EB' }}>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      or
                    </Typography>
                  </Divider>

                  <GoogleLoginButton returnUrl={returnUrl !== '/account/profile' ? returnUrl : undefined} />
                </>
              )}

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                  }}
                >
                  Need help? Send us an email at{' '}
                  <Link
                    href="mailto:hello@teamified.com"
                    sx={{
                      color: '#9333EA',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    hello@teamified.com
                  </Link>
                </Typography>
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
                  color: '#1a1a1a',
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
                  color: '#6b7280',
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
                label="Password"
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
                          color: '#6b7280',
                          zIndex: 1,
                          '&:hover': {
                            color: '#1a1a1a',
                            bgcolor: 'rgba(0, 0, 0, 0.05)',
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
                  '& .MuiInputLabel-root': {
                    color: '#9CA3AF',
                    '&.Mui-focused': {
                      color: '#9333EA',
                    },
                    '&.MuiInputLabel-shrink': {
                      color: '#6b7280',
                    },
                    '&.Mui-focused.MuiInputLabel-shrink': {
                      color: '#9333EA',
                    },
                    '&.Mui-error': {
                      color: '#ef4444',
                    },
                  },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: '#E5E7EB',
                    },
                    '&:hover fieldset': {
                      borderColor: '#9333EA',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#9333EA',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#1a1a1a',
                    '&:-webkit-autofill': {
                      WebkitBoxShadow: '0 0 0 100px white inset',
                      WebkitTextFillColor: '#1a1a1a',
                      caretColor: '#1a1a1a',
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#ef4444',
                  },
                  '& .MuiInputAdornment-root': {
                    color: '#6b7280',
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
                    borderColor: '#9333EA',
                    color: '#9333EA',
                    '&:hover': {
                      bgcolor: 'rgba(147, 51, 234, 0.1)',
                      borderColor: '#9333EA',
                    },
                    '&:active': {
                      bgcolor: 'rgba(147, 51, 234, 0.2)',
                    },
                    '&:disabled': {
                      borderColor: '#E5E7EB',
                      color: '#9CA3AF',
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
                    bgcolor: '#9333EA',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#A855F7',
                    },
                    '&:active': {
                      bgcolor: '#7E22CE',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(147, 51, 234, 0.5)',
                      color: 'white',
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
                    color: '#6b7280',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: '#9333EA',
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
