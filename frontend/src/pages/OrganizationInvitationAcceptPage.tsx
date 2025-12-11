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
  Divider,
  Collapse,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Business, Login as LoginIcon, LinkOutlined, InfoOutlined } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

interface InvitationDetails {
  organizationName: string;
  organizationSlug: string;
  roleType: string;
  inviterName: string;
  isValid: boolean;
  validityMessage: string;
  invitedEmail?: string;
  hasCompletedSignup: boolean;
  invitedUserFirstName?: string;
  invitedUserLastName?: string;
}

interface AcceptInvitationData {
  inviteCode: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  personalEmail?: string;
}

const OrganizationInvitationAcceptPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, refreshUser, isAuthenticated, loading: authLoading } = useAuth();

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
  const [wantToLinkAccount, setWantToLinkAccount] = useState(false);
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

        if (data.invitedEmail) {
          setFormData(prev => ({ ...prev, email: data.invitedEmail }));
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

    // For account linking, name fields are optional (using existing account info)
    if (!wantToLinkAccount) {
      if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required';
      }

      if (!formData.lastName.trim()) {
        errors.lastName = 'Last name is required';
      }
    }

    if (!formData.password) {
      errors.password = wantToLinkAccount 
        ? 'Your existing password is required to verify account ownership' 
        : 'Password is required';
    } else if (!wantToLinkAccount) {
      // Only validate password complexity for new accounts
      if (formData.password.length < 8) {
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
    }

    // Confirm password required only for new accounts
    if (!wantToLinkAccount) {
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    // Personal email required when linking
    if (wantToLinkAccount) {
      if (!formData.personalEmail?.trim()) {
        errors.personalEmail = 'Personal email is required to link accounts';
      } else if (!/\S+@\S+\.\S+/.test(formData.personalEmail)) {
        errors.personalEmail = 'Invalid email format';
      } else if (formData.personalEmail.toLowerCase() === formData.email.toLowerCase()) {
        errors.personalEmail = 'Personal email must be different from your work email';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNewUserSubmit = async (e: React.FormEvent) => {
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

      try {
        await login({
          email: formData.email,
          password: formData.password,
          rememberMe: true,
        });
        
        await refreshUser();

        setTimeout(() => {
          const orgSlug = invitation?.organizationSlug;
          navigate(orgSlug ? `/organization/${orgSlug}` : '/account/profile', { replace: true });
        }, 2000);
      } catch (loginError) {
        console.error('Auto-login failed:', loginError);
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

  const handleAuthenticatedAccept = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/v1/invitations/accept-authenticated', {
        inviteCode: code,
      });

      setSuccess(true);
      await refreshUser();

      setTimeout(() => {
        const orgSlug = invitation?.organizationSlug;
        navigate(orgSlug ? `/organization/${orgSlug}` : '/account/profile', { replace: true });
      }, 2000);
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      const message = err.response?.data?.message || 'Failed to accept invitation';
      setError(message);
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

  const handleLoginRedirect = () => {
    const returnUrl = `/invitations/accept/${code}`;
    navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  const formatRoleName = (role: string) => {
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (isLoadingInvitation || authLoading) {
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
            {wantToLinkAccount ? 'Account Linked!' : 'Welcome!'}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {wantToLinkAccount 
              ? `Your work email has been linked and you've joined ${invitation?.organizationName}!`
              : `You've successfully joined ${invitation?.organizationName}!`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting you to your account...
          </Typography>
        </Paper>
      </Container>
    );
  }

  const isExistingUser = invitation?.hasCompletedSignup;
  const isLoggedIn = isAuthenticated && user;
  const emailMatches = isLoggedIn && invitation?.invitedEmail && 
    user.email.toLowerCase() === invitation.invitedEmail.toLowerCase();

  if (isExistingUser && isLoggedIn) {
    if (!emailMatches && invitation?.invitedEmail) {
      return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box textAlign="center" mb={3}>
              <Business color="primary" sx={{ fontSize: 60, mb: 1 }} />
              <Typography variant="h4" gutterBottom>
                Join {invitation?.organizationName}
              </Typography>
            </Box>
            <Alert severity="warning" sx={{ mb: 3 }}>
              This invitation was sent to <strong>{invitation.invitedEmail}</strong>, but you're logged in as <strong>{user.email}</strong>.
              Please log in with the correct account to accept this invitation.
            </Alert>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => {
                navigate('/login?returnUrl=' + encodeURIComponent(`/invitations/accept/${code}`));
              }}
            >
              Switch Account
            </Button>
          </Paper>
        </Container>
      );
    }

    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Business color="primary" sx={{ fontSize: 60, mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              Join {invitation?.organizationName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {invitation?.inviterName} has invited you to join as{' '}
              <strong>{formatRoleName(invitation?.roleType || '')}</strong>
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Logged in as:
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleAuthenticatedAccept}
            disabled={isLoading || !invitation?.isValid}
            sx={{ mb: 2 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Accept Invitation'}
          </Button>

          {!invitation?.isValid && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {invitation?.validityMessage}
            </Alert>
          )}
        </Paper>
      </Container>
    );
  }

  if (isExistingUser && !isLoggedIn) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Business color="primary" sx={{ fontSize: 60, mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              Join {invitation?.organizationName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {invitation?.inviterName} has invited you to join as{' '}
              <strong>{formatRoleName(invitation?.roleType || '')}</strong>
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }} icon={<LoginIcon />}>
            <Typography variant="body2">
              Welcome back, <strong>{invitation?.invitedUserFirstName} {invitation?.invitedUserLastName}</strong>!
              Please log in to accept this invitation.
            </Typography>
          </Alert>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            onClick={handleLoginRedirect}
            sx={{ mb: 2 }}
          >
            Log In to Accept
          </Button>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            After logging in, you'll be redirected back to accept this invitation.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Business color="primary" sx={{ fontSize: 60, mb: 1 }} />
          <Typography variant="h4" gutterBottom>
            Join {invitation?.organizationName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {invitation?.inviterName} has invited you to join as{' '}
            <strong>{formatRoleName(invitation?.roleType || '')}</strong>
          </Typography>
        </Box>

        <Stepper activeStep={0} sx={{ mb: 4 }}>
          <Step>
            <StepLabel>{wantToLinkAccount ? 'Link Work Email' : 'Create Account'}</StepLabel>
          </Step>
          <Step>
            <StepLabel>Get Started</StepLabel>
          </Step>
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleNewUserSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            disabled={isLoading || !!invitation?.invitedEmail}
            margin="normal"
            required
          />

          <Collapse in={!wantToLinkAccount}>
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
                required={!wantToLinkAccount}
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
                required={!wantToLinkAccount}
              />
            </Box>
          </Collapse>

          <TextField
            fullWidth
            label={wantToLinkAccount ? 'Your Existing Password' : 'Password'}
            type={showPassword ? 'text' : 'password'}
            autoComplete={wantToLinkAccount ? 'current-password' : 'new-password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            error={!!validationErrors.password}
            helperText={
              validationErrors.password || 
              (wantToLinkAccount 
                ? 'Enter your current password to verify account ownership' 
                : 'Min 8 chars with uppercase, lowercase, number, and special char')
            }
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

          <Collapse in={!wantToLinkAccount}>
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
              required={!wantToLinkAccount}
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
          </Collapse>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={wantToLinkAccount}
                  onChange={(e) => {
                    setWantToLinkAccount(e.target.checked);
                    if (!e.target.checked) {
                      setFormData(prev => ({ ...prev, personalEmail: '' }));
                    }
                  }}
                  disabled={isLoading}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinkOutlined fontSize="small" />
                  <Typography variant="body2">
                    I already have an account and want to link this work email
                  </Typography>
                </Box>
              }
            />
            
            <Collapse in={wantToLinkAccount}>
              <Alert severity="info" icon={<InfoOutlined />} sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2">
                  Enter your existing account's personal email below. Your work email will be linked to that account, 
                  allowing you to log in with either email using your existing password.
                </Typography>
              </Alert>
              
              <TextField
                fullWidth
                label="Your Existing Personal Email"
                type="email"
                autoComplete="email"
                value={formData.personalEmail || ''}
                onChange={(e) => handleInputChange('personalEmail', e.target.value)}
                error={!!validationErrors.personalEmail}
                helperText={validationErrors.personalEmail || 'The email you previously signed up with'}
                disabled={isLoading}
                placeholder="your.personal@email.com"
              />
            </Collapse>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading || !invitation?.isValid}
            sx={{ mt: 3, mb: 2 }}
          >
            {isLoading ? (
              <CircularProgress size={24} />
            ) : wantToLinkAccount ? (
              'Link Work Email & Accept Invitation'
            ) : (
              'Accept Invitation & Create Account'
            )}
          </Button>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Already have an account?{' '}
            <Button size="small" onClick={handleLoginRedirect}>
              Login
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrganizationInvitationAcceptPage;
