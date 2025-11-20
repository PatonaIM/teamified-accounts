import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Business } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

interface InvitationDetails {
  organizationName: string;
  organizationSlug: string;
  roleType: string;
  inviterName: string;
  isValid: boolean;
  validityMessage: string;
}

interface AcceptInvitationData {
  inviteCode: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

const OrganizationInvitationAcceptPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [formData, setFormData] = useState<AcceptInvitationData>({
    inviteCode: code || '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!code) {
        setError('Invalid invitation link');
        setIsLoadingInvitation(false);
        return;
      }

      try {
        const response = await fetch(`/api/v1/invitations/preview/${code}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Invitation not found');
          } else {
            const data = await response.json();
            setError(data.message || 'Failed to load invitation');
          }
          setIsLoadingInvitation(false);
          return;
        }

        const data = await response.json();
        setInvitation(data);

        if (!data.isValid) {
          setError(data.validityMessage);
        }
      } catch (err) {
        console.error('Error fetching invitation:', err);
        setError('Failed to load invitation details');
      } finally {
        setIsLoadingInvitation(false);
      }
    };

    fetchInvitation();
  }, [code]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else {
      const hasUppercase = /[A-Z]/.test(formData.password);
      const hasLowercase = /[a-z]/.test(formData.password);
      const hasNumber = /[0-9]/.test(formData.password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
      
      if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        errors.password = 'Password must include uppercase, lowercase, number, and special character';
      }
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to accept invitation');
        setIsLoading(false);
        return;
      }

      setSuccess(true);

      // Auto-login after accepting invitation
      try {
        await login({
          email: formData.email,
          password: formData.password,
          rememberMe: true,
        });
        
        await refreshUser();

        // Navigate to account page after successful login
        setTimeout(() => {
          navigate('/account', { replace: true });
        }, 2000);
      } catch (loginError) {
        console.error('Auto-login failed:', loginError);
        // Still show success, but redirect to login
        setTimeout(() => {
          navigate(`/login?email=${encodeURIComponent(formData.email)}`, { replace: true });
        }, 2000);
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Network error. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof AcceptInvitationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (isLoadingInvitation) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Loading invitation...</Typography>
        </Paper>
      </Container>
    );
  }

  if (error && !invitation) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button variant="outlined" onClick={() => navigate('/login')} fullWidth>
            Go to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Welcome!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You've successfully joined {invitation?.organizationName}!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting you to your account...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Business color="primary" sx={{ fontSize: 60, mb: 1 }} />
          <Typography variant="h4" gutterBottom>
            Join {invitation?.organizationName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {invitation?.inviterName} has invited you to join as{' '}
            <strong>{invitation?.roleType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</strong>
          </Typography>
        </Box>

        {/* Progress Stepper */}
        <Stepper activeStep={0} sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Create Account</StepLabel>
          </Step>
          <Step>
            <StepLabel>Get Started</StepLabel>
          </Step>
        </Stepper>

        {/* Error Alert - Show for both invalid invitations AND submission errors */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            disabled={isLoading}
            margin="normal"
            required
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              type="text"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              error={!!validationErrors.firstName}
              helperText={validationErrors.firstName}
              disabled={isLoading}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Last Name"
              type="text"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              error={!!validationErrors.lastName}
              helperText={validationErrors.lastName}
              disabled={isLoading}
              margin="normal"
              required
            />
          </Box>

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            error={!!validationErrors.password}
            helperText={validationErrors.password || 'Min 8 chars with uppercase, lowercase, number, and special char'}
            disabled={isLoading}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
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
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            error={!!validationErrors.confirmPassword}
            helperText={validationErrors.confirmPassword}
            disabled={isLoading}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
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
            size="large"
            disabled={isLoading || !invitation?.isValid}
            sx={{ mt: 3, mb: 2 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Accept Invitation & Create Account'}
          </Button>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Already have an account?{' '}
            <Button size="small" onClick={() => navigate('/login')}>
              Login
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrganizationInvitationAcceptPage;
