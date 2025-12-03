import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Avatar,
  Skeleton,
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Person } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl: string | null;
}

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setErrors({ general: 'Invalid or missing reset token' });
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/v1/auth/validate-reset-token?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (data.valid && data.user) {
          setUserInfo(data.user);
          setTokenValid(true);
        } else {
          setErrors({ general: 'This password reset link is invalid or has expired. Please request a new one.' });
          setTokenValid(false);
        }
      } catch (error) {
        setErrors({ general: 'Unable to validate reset token. Please try again.' });
        setTokenValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm() || !token) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          setErrors({ 
            general: data.message || 'Invalid or expired reset token. Please request a new password reset.' 
          });
        } else {
          setErrors({ general: data.message || 'Password reset failed. Please try again.' });
        }
        return;
      }

      setSuccess(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setErrors({ 
        general: 'An error occurred. Please try again later.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default',
          position: 'fixed',
          top: 0,
          left: 0,
          overflow: 'hidden',
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: '100%',
            maxWidth: 450,
            padding: { xs: 3, sm: 4 },
            borderRadius: 3,
            bgcolor: 'background.paper',
            mx: 2,
          }}
        >
          {isValidating ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Validating your reset link...
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                {userInfo ? (
                  <>
                    <Avatar
                      src={userInfo.profilePictureUrl || undefined}
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'primary.main',
                        fontSize: '2rem',
                      }}
                    >
                      {!userInfo.profilePictureUrl && (
                        userInfo.firstName?.[0]?.toUpperCase() || userInfo.lastName?.[0]?.toUpperCase() || <Person />
                      )}
                    </Avatar>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Reset Password
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
                      {userInfo.firstName} {userInfo.lastName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {userInfo.email}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Lock sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
                      Reset Your Password
                    </Typography>
                  </>
                )}
              </Box>

              {errors.general && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.general}
                </Alert>
              )}

              {success ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Your password has been reset successfully! Redirecting to login page...
                </Alert>
              ) : tokenValid ? (
                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password || 'At least 8 characters'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'action.active' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'action.active' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={isLoading || !tokenValid}
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.5,
                      fontSize: '16px',
                      fontWeight: 600,
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Reset Password'
                    )}
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button
                      variant="text"
                      onClick={() => navigate('/login')}
                      sx={{ textTransform: 'none' }}
                    >
                      Back to Login
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/forgot-password')}
                    sx={{ mr: 2 }}
                  >
                    Request New Reset Link
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => navigate('/login')}
                    sx={{ textTransform: 'none' }}
                  >
                    Back to Login
                  </Button>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>
    </>
  );
};

export default ResetPasswordPage;
