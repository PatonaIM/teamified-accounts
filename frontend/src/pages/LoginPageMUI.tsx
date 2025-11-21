import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  Link,
  Paper,
  Avatar,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Business,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { login, getAccessToken } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { SupabaseLoginButton } from '../components/auth/SupabaseLoginButton';
import { isSupabaseConfigured } from '../config/supabase';

const LoginPageMUI: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  // Check for returnUrl query parameter for SSO flows
  const searchParams = new URLSearchParams(window.location.search);
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Call the actual authentication service
      await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      
      // Refresh user data in AuthContext before navigation
      await refreshUser();
      
      // For SSO flows, extract client_id and use the SSO launch API
      if (returnUrl !== '/dashboard' && returnUrl.includes('/api/v1/sso/authorize')) {
        console.log('SSO flow detected, using launch API');
        console.log('Original SSO URL:', returnUrl);
        
        try {
          // Extract client_id from the authorize URL
          const url = new URL(returnUrl, window.location.origin);
          const clientId = url.searchParams.get('client_id');
          
          if (!clientId) {
            console.error('No client_id found in SSO URL');
            setErrors({ general: 'Invalid SSO request. Please try again.' });
            setIsLoading(false);
            return;
          }
          
          console.log('Calling SSO launch API for client:', clientId);
          
          // Use the SSO launch endpoint which returns the redirect URL as JSON
          // This endpoint is authenticated and will generate the auth code and return the redirect URL
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
          console.log('SSO launch response:', data);
          
          if (data.redirectUrl) {
            console.log('Redirecting to:', data.redirectUrl);
            window.location.href = data.redirectUrl;
            return;
          } else {
            throw new Error('No redirect URL received from SSO launch');
          }
        } catch (error) {
          console.error('SSO launch failed:', error);
          setErrors({ general: 'SSO redirect failed. Please try again.' });
          setIsLoading(false);
          return;
        }
      } else if (returnUrl !== '/dashboard') {
        console.log('Non-SSO redirect after login to:', returnUrl);
        window.location.href = returnUrl;
      } else {
        navigate(returnUrl);
      }
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Login failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {/* Global styles to prevent scrollbars */}
      <style>
        {`
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: 100vh !important;
            width: 100vw !important;
            overflow: hidden !important;
          }
          #root {
            margin: 0 !important;
            padding: 0 !important;
            height: 100vh !important;
            width: 100vw !important;
            overflow: hidden !important;
          }
        `}
      </style>
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          bgcolor: 'background.default',
          position: 'fixed',
          top: 0,
          left: 0,
          overflow: 'hidden',
          margin: 0,
          padding: 0,
          // Ensure no scrollbars
          '& *': {
            boxSizing: 'border-box',
          },
        }}
      >
        {/* Left Panel - Branding (Desktop Only) */}
        <Box
          sx={{
            display: { xs: 'none', lg: 'flex' },
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'background.paper',
            color: 'text.primary',
            padding: 4,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h1" sx={{ mb: 2, fontWeight: 600 }}>
              teamified
            </Typography>
          </Box>

          {/* Hero Content */}
          <Box sx={{ maxWidth: 400, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, lineHeight: 1.6 }}>
              Welcome to the teamified portal. Handle all your employment needs in one secure platform.
            </Typography>
          </Box>
        </Box>

        {/* Right Panel - Login Form */}
        <Box
          sx={{
            flex: { xs: 1, lg: 0.6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: { xs: 2, sm: 4 },
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Mobile Header (Mobile Only) */}
          <Box
            sx={{
              display: { xs: 'block', lg: 'none' },
              textAlign: 'center',
              mb: 4,
              color: 'text.primary',
            }}
          >
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
              teamified
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Team Member Portal
            </Typography>
          </Box>

          {/* Login Form Card */}
          <Paper
            elevation={8}
            sx={{
              width: '100%',
              maxWidth: 400,
              padding: { xs: 3, sm: 4 },
              borderRadius: 3,
              bgcolor: 'background.paper',
            }}
          >
            {/* Form Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                Welcome Back
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Sign in to your account
              </Typography>
            </Box>

            {/* Error Alert */}
            {errors.general && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errors.general}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Email Field */}
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end" sx={{ width: 48 }}>
                      {/* Empty space to match password field height */}
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {/* Password Field */}
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {/* Remember Me Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    value="remember"
                    color="primary"
                    checked={formData.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  />
                }
                label="Remember me"
                sx={{ mb: 2 }}
              />

              {/* Sign In Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={isLoading}
                sx={{
                  mt: 2,
                  mb: 3,
                  py: 1.5,
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Links */}
              <Grid container>
                <Grid size={{ xs: 12 }}>
                  <Link
                    href="/forgot-password"
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Forgot password?
                  </Link>
                </Grid>
              </Grid>
            </Box>

            {/* SSO Section */}
            {isSupabaseConfigured() && (
              <>
                {/* Divider */}
                <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                  <Typography variant="body2" sx={{ mx: 2, color: 'text.secondary' }}>
                    or continue with
                  </Typography>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                </Box>

                {/* Google Sign-In Button */}
                <SupabaseLoginButton 
                  onError={(error) => setErrors({ general: error })}
                />
              </>
            )}

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Need help? Contact support@teamified.com
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default LoginPageMUI;
