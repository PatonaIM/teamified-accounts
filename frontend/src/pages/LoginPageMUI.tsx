import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { login, getAccessToken } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { SupabaseLoginButton } from '../components/auth/SupabaseLoginButton';
import { isSupabaseConfigured } from '../config/supabase';

const LoginPageMUI: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  const searchParams = new URLSearchParams(window.location.search);
  const returnUrl = searchParams.get('returnUrl') || '/account/profile';
  
  console.log('[LoginPageMUI] Current URL:', window.location.href);
  console.log('[LoginPageMUI] Return URL from query params:', returnUrl);
  console.log('[LoginPageMUI] Is SSO authorize URL?:', returnUrl.includes('/api/v1/sso/authorize'));
  
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
        const signupUrl = `/signup-select?email=${encodeURIComponent(formData.email)}${returnUrl !== '/account/profile' ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`;
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
      console.log('[LoginPageMUI] Using window.location.href?:', returnUrl !== '/account/profile' && returnUrl.includes('/api/v1/sso/authorize'));
      
      if (returnUrl !== '/account/profile' && returnUrl.includes('/api/v1/sso/authorize')) {
        console.log('[LoginPageMUI] Redirecting via window.location.href to:', returnUrl);
        window.location.href = returnUrl;
      } else {
        console.log('[LoginPageMUI] Redirecting via navigate() to:', returnUrl);
        navigate(returnUrl);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErrors({ general: 'Invalid email or password. Please try again.' });
      } else {
        setErrors({ general: 'Login failed. Please try again.' });
      }
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
        <Box sx={{ maxWidth: 500, textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 1,
              fontSize: '3rem',
              letterSpacing: '-0.02em',
            }}
          >
            teamified
          </Typography>
          <Typography
            variant="body1"
            sx={{
              opacity: 0.95,
              fontSize: '0.875rem',
              mb: 4,
              fontWeight: 400,
            }}
          >
            Employ with us.
          </Typography>
          
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 2,
              fontSize: '1.5rem',
            }}
          >
            Welcome to Teamified Accounts
          </Typography>
          <Typography
            variant="body1"
            sx={{
              opacity: 0.9,
              lineHeight: 1.6,
            }}
          >
            One account for all Teamified apps: Recruits, events, and seamless employment.
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
            <form onSubmit={handleEmailContinue}>
              {/* Sign in Header */}
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  mb: 4,
                  textAlign: 'center',
                }}
              >
                Sign in
              </Typography>

              {/* Error Alert */}
              {errors.general && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {errors.general}
                </Alert>
              )}
              <TextField
                fullWidth
                placeholder="Email or phone"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                disabled={isLoading}
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
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Next'}
              </Button>

              {isSupabaseConfigured() && (
                <>
                  <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.12)' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      or
                    </Typography>
                  </Divider>

                  <SupabaseLoginButton />
                </>
              )}

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
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
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
