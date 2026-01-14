import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  Container,
  Fade,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
  Email as EmailIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import PasswordRequirements, { isPasswordValid } from '../components/PasswordRequirements';
import { useNavigate } from 'react-router-dom';

type Step = 'email' | 'otp' | 'password' | 'success';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailMasked, setEmailMasked] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (step === 'otp' && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/auth/password-reset/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (!data.success) {
        if (data.message === 'Email not registered') {
          setError('This email isn\'t registered. Please sign up.');
        } else {
          setError(data.message || 'Failed to send verification code');
        }
        return;
      }

      setEmailMasked(data.emailMasked || email);
      setStep('otp');
      setResendTimer(60);
      setCanResend(false);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/auth/password-reset/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setResendTimer(60);
        setCanResend(false);
        setOtp('');
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/auth/password-reset/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(),
          otp: otp.trim(),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Invalid code. Please try again.');
        return;
      }

      setResetToken(data.resetToken);
      setStep('password');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password) {
      setError('Please enter a new password');
      return;
    }

    if (!isPasswordValid(password)) {
      setError('Password does not meet the requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: resetToken,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to reset password');
        return;
      }

      setStep('success');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleGoToSignup = () => {
    navigate('/signup-select');
  };

  const renderEmailStep = () => (
    <Fade in={step === 'email'}>
      <Box>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <LockIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#1a1a2e', mb: 1 }}>
            Forgot Password?
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            No worries, we'll send you a verification code
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              error.includes('sign up') ? (
                <Button color="inherit" size="small" onClick={handleGoToSignup}>
                  Sign up
                </Button>
              ) : undefined
            }
          >
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          placeholder="Enter your email"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: '#9333EA' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9333EA',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#9333EA',
            },
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleSendOtp()}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSendOtp}
          disabled={isLoading}
          sx={{
            py: 1.5,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Continue'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBackToLogin}
            sx={{
              color: '#666',
              textTransform: 'none',
              '&:hover': { color: '#9333EA', bgcolor: 'transparent' },
            }}
          >
            Back to Login
          </Button>
        </Box>
      </Box>
    </Fade>
  );

  const renderOtpStep = () => (
    <Fade in={step === 'otp'}>
      <Box>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <EmailIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#1a1a2e', mb: 1 }}>
            Check Your Email
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Enter the code sent to <strong>{emailMasked}</strong>
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Verification Code"
          value={otp}
          onChange={handleOtpChange}
          placeholder="Enter 6-digit code"
          inputRef={otpInputRef}
          inputProps={{
            maxLength: 6,
            style: { 
              textAlign: 'center', 
              fontSize: '24px', 
              fontWeight: 600,
              letterSpacing: '8px',
            },
          }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9333EA',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#9333EA',
            },
          }}
          onKeyPress={(e) => e.key === 'Enter' && otp.length === 6 && handleVerifyOtp()}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleVerifyOtp}
          disabled={isLoading || otp.length !== 6}
          sx={{
            py: 1.5,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            },
            '&.Mui-disabled': {
              background: '#E0E0E0',
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          {resendTimer > 0 ? (
            <Typography variant="body2" color="text.secondary">
              Resend code in {resendTimer}s
            </Typography>
          ) : (
            <Button
              onClick={handleResendOtp}
              disabled={isLoading}
              sx={{
                color: '#9333EA',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
              }}
            >
              Resend Code
            </Button>
          )}
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => {
              setStep('email');
              setOtp('');
              setError('');
            }}
            sx={{
              color: '#666',
              textTransform: 'none',
              '&:hover': { color: '#9333EA', bgcolor: 'transparent' },
            }}
          >
            Use Different Email
          </Button>
        </Box>
      </Box>
    </Fade>
  );

  const renderPasswordStep = () => (
    <Fade in={step === 'password'}>
      <Box>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <LockIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#1a1a2e', mb: 1 }}>
            Reset Password
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Create a new password for your account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          placeholder="Enter new password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: '#9333EA' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9333EA',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#9333EA',
            },
          }}
        />

        {!isPasswordValid(password) && (
          <Box sx={{ mb: 2 }}>
            <PasswordRequirements password={password} />
          </Box>
        )}

        <TextField
          fullWidth
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError('');
          }}
          placeholder="Confirm new password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: '#9333EA' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          error={confirmPassword !== '' && password !== confirmPassword}
          helperText={
            confirmPassword !== '' && password === confirmPassword 
              ? 'Passwords match!' 
              : (confirmPassword !== '' && password !== confirmPassword) 
                ? 'Passwords do not match' 
                : ''
          }
          FormHelperTextProps={{
            sx: {
              color: confirmPassword !== '' && password === confirmPassword 
                ? '#10B981' 
                : (confirmPassword !== '' && password !== confirmPassword)
                  ? '#EF4444'
                  : undefined
            }
          }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9333EA',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#9333EA',
            },
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleResetPassword}
          disabled={isLoading || !password || !confirmPassword || password !== confirmPassword || !isPasswordValid(password)}
          sx={{
            py: 1.5,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            },
            '&.Mui-disabled': {
              background: '#E0E0E0',
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
        </Button>
      </Box>
    </Fade>
  );

  const renderSuccessStep = () => (
    <Fade in={step === 'success'}>
      <Box sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <CheckCircleIcon sx={{ color: 'white', fontSize: 48 }} />
        </Box>
        <Typography variant="h4" fontWeight={700} sx={{ color: '#1a1a2e', mb: 1 }}>
          Password Updated!
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
          Your password has been successfully updated. You can now log in with your new password.
        </Typography>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() => navigate(`/login?email=${encodeURIComponent(email)}`)}
          sx={{
            py: 1.5,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            },
          }}
        >
          Go to Login
        </Button>
      </Box>
    </Fade>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#F5F7F8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          {step === 'email' && renderEmailStep()}
          {step === 'otp' && renderOtpStep()}
          {step === 'password' && renderPasswordStep()}
          {step === 'success' && renderSuccessStep()}
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;
