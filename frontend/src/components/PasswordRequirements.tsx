import React from 'react';
import { Box, Typography } from '@mui/material';
import { Check, Close } from '@mui/icons-material';

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface PasswordRequirementsProps {
  password: string;
  show?: boolean;
}

const SPECIAL_CHARS_REGEX = /[`~!@#$%^&*()_+{}\[\]:";'<>?,./\\|]/;

export const validatePasswordRequirements = (password: string): PasswordRequirement[] => {
  return [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'At least 1 uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'At least 1 lowercase letter', met: /[a-z]/.test(password) },
    { label: 'At least 1 number', met: /\d/.test(password) },
    { label: 'At least 1 special character', met: SPECIAL_CHARS_REGEX.test(password) },
  ];
};

export const isPasswordValid = (password: string): boolean => {
  return validatePasswordRequirements(password).every(req => req.met);
};

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password, show = true }) => {
  if (!show || !password) return null;

  const requirements = validatePasswordRequirements(password);

  return (
    <Box sx={{ mt: 1, mb: 1 }}>
      {requirements.map((req, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            py: 0.25,
          }}
        >
          {req.met ? (
            <Check sx={{ fontSize: 16, color: 'success.main' }} />
          ) : (
            <Close sx={{ fontSize: 16, color: 'text.disabled' }} />
          )}
          <Typography
            variant="caption"
            sx={{
              color: req.met ? 'success.main' : 'text.secondary',
              transition: 'color 0.2s ease',
            }}
          >
            {req.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default PasswordRequirements;
