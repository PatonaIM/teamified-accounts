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
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface AcceptInvitationData {
  inviteCode: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

const AcceptInternalInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteCode = searchParams.get('code');

  const [formData, setFormData] = useState<AcceptInvitationData>({
    inviteCode: inviteCode || '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(true);
  const [hasPreassignedEmail, setHasPreassignedEmail] = useState(false);

  useEffect(() => {
    if (!inviteCode) {
      setError('Invalid invitation link. Please check your email for the correct link.');
      setIsLoadingInvitation(false);
      return;
    }

    // Fetch invitation details to check if email is pre-assigned
    const fetchInvitationDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/v1/invitations/internal/${inviteCode}`);
        const details = response.data;

        if (details.hasPreassignedEmail && details.email) {
          setFormData((prev) => ({
            ...prev,
            email: details.email,
          }));
          setHasPreassignedEmail(true);
        }

        if (details.isExpired) {
          setError('This invitation has expired. Please contact your administrator for a new invitation.');
        }
      } catch (err: any) {
        console.error('Error fetching invitation details:', err);
        if (err.response?.status === 404) {
          setError('Invitation not found. Please check your link and try again.');
        } else {
          setError('Failed to load invitation details. Please try again.');
        }
      } finally {
        setIsLoadingInvitation(false);
      }
    };

    fetchInvitationDetails();
  }, [inviteCode]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    } else if (!formData.email.toLowerCase().match(/@teamified\.com(\.au)?$/)) {
      errors.email = 'Email must be from @teamified.com or @teamified.com.au domain';
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
      const hasSpecial = /[@$!%*?&.]/.test(formData.password);

      if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        errors.password = 'Password must include uppercase, lowercase, number, and special character (@$!%*?&.)';
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
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/v1/invitations/internal/accept`,
        formData
      );

      setSuccess(true);

      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Account activated successfully! Please verify your email and log in.',
          },
        });
      }, 2000);
    } catch (err: any) {
      console.error('Error accepting invitation:', err);

      if (err.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          setError(err.response.data.message.join(', '));
        } else {
          setError(err.response.data.message);
        }
      } else if (err.response?.status === 404) {
        setError('Invitation not found or has expired. Please contact your administrator.');
      } else if (err.response?.status === 409) {
        setError('An account with this email already exists. Please log in instead.');
      } else {
        setError('Failed to activate account. Please try again or contact support.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof AcceptInvitationData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  if (!inviteCode || (isLoadingInvitation && !error)) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          {!inviteCode ? (
            <Alert severity="error">
              Invalid invitation link. Please check your email for the correct link.
            </Alert>
          ) : (
            <>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Loading invitation details...
              </Typography>
            </>
          )}
        </Paper>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight={700}>
            Account Activated Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Please check your email to verify your email address.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting to login...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Welcome to Teamified
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete your account setup to get started
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="First Name"
              fullWidth
              required
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              error={!!validationErrors.firstName}
              helperText={validationErrors.firstName}
              disabled={isLoading}
              autoComplete="off"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Last Name"
              fullWidth
              required
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              error={!!validationErrors.lastName}
              helperText={validationErrors.lastName}
              disabled={isLoading}
              autoComplete="off"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>

          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={formData.email}
            onChange={handleInputChange('email')}
            error={!!validationErrors.email}
            helperText={
              hasPreassignedEmail
                ? 'This email is pre-assigned for your invitation'
                : validationErrors.email ||
                  'Must be a @teamified.com or @teamified.com.au email address'
            }
            disabled={isLoading || hasPreassignedEmail}
            autoComplete="off"
            sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            value={formData.password}
            onChange={handleInputChange('password')}
            error={!!validationErrors.password}
            helperText={
              validationErrors.password ||
              'Minimum 8 characters with uppercase, lowercase, number, and special character (@$!%*?&.)'
            }
            disabled={isLoading}
            autoComplete="new-password"
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
            sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <TextField
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            required
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            error={!!validationErrors.confirmPassword}
            helperText={validationErrors.confirmPassword}
            disabled={isLoading}
            autoComplete="new-password"
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
            sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{
              borderRadius: 2,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            {isLoading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Activating Account...
              </>
            ) : (
              'Activate Account'
            )}
          </Button>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Button
              onClick={() => navigate('/login')}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Log in
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AcceptInternalInvitationPage;
