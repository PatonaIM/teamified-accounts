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
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  
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
        const signupUrl = `/signup-select?email=${encodeURIComponent(formData.email)}${returnUrl !== '/dashboard' ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`;
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
      
      if (returnUrl !== '/dashboard' && returnUrl.includes('/api/v1/sso/authorize')) {
        try {
          const url = new URL(returnUrl, window.location.origin);
          const clientId = url.searchParams.get('client_id');
          
          if (!clientId) {
            setErrors({ general: 'Invalid SSO request. Please try again.' });
            setIsLoading(false);
            return;
          }
          
          const response = await fetch(`/api/v1/sso/launch/${clientId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${getAccessToken()}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`SSO launch failed: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
            return;
          } else {
            throw new Error('No redirect URL received from SSO launch');
          }
        } catch (error) {
          console.error('SSO launch failed:', error);
          setErrors({ general: 'SSO authentication failed. Redirecting to dashboard...' });
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } else {
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
      {/* Left Panel - Purple Gradient */}
      <Box
        sx={{
          flex: 1,
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

      {/* Right Panel - Dark Background */}
      <Box
        sx={{
          flex: 1,
          bgcolor: '#1E1E1E',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 4,
          '@media (max-width: 900px)': {
            flex: 'none',
            width: '100%',
          },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
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

          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={handleEmailContinue}>
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
              <Box sx={{ mb: 3 }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={handleBackToEmail}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textTransform: 'none',
                    mb: 2,
                    '&:hover': {
                      color: '#A16AE8',
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  Back
                </Button>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {formData.email}
                </Typography>
              </Box>

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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  mb: 2,
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
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
              </Button>

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
