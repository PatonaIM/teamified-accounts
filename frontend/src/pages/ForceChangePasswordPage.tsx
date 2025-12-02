import React, { useState } from 'react';
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
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ForceChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('One number');
    }
    if (!/[@$!%*?&.]/.test(password)) {
      errors.push('One special character (@$!%*?&.)');
    }
    return errors;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else {
      const passwordErrors = validatePassword(formData.newPassword);
      if (passwordErrors.length > 0) {
        newErrors.newPassword = `Missing: ${passwordErrors.join(', ')}`;
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
    setErrors({});
    
    try {
      const response = await api.post('/v1/auth/force-change-password', {
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (response.status === 200) {
        setSuccess(true);
        
        updateUser({ mustChangePassword: false });
        
        const cachedUser = localStorage.getItem('teamified_user_data');
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser);
            userData.mustChangePassword = false;
            localStorage.setItem('teamified_user_data', JSON.stringify(userData));
          } catch (e) {
            console.warn('Failed to update cached user data');
          }
        }
        
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setErrors({ general: `Password does not meet requirements: ${errorData.errors.join(', ')}` });
      } else {
        const errorMessage = errorData?.message || 'Password change failed. Please try again.';
        setErrors({ general: errorMessage });
      }
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
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Warning sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
              Password Change Required
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Your password was reset by an administrator. Please create a new password to continue.
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            For security reasons, you must set a new password before accessing your account.
          </Alert>

          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general}
            </Alert>
          )}

          {success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Your password has been changed successfully! Redirecting...
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                autoComplete="new-password"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                error={!!errors.newPassword}
                helperText={errors.newPassword || 'Min 8 chars, uppercase, lowercase, number, special character (@$!%*?&.)'}
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
                color="warning"
                size="large"
                disabled={isLoading}
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
                  'Set New Password'
                )}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </>
  );
};

export default ForceChangePasswordPage;
