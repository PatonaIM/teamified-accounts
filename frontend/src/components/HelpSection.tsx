import React, { useState } from 'react';
import {
  Box,
  Typography,
  Collapse,
  Link,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  LockReset,
  MarkEmailRead,
  ContactSupport,
  HelpOutline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface HelpSectionProps {
  variant?: 'login' | 'signup';
}

const HelpSection: React.FC<HelpSectionProps> = ({ variant = 'login' }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const helpOptions = [
    {
      id: 'forgot-password',
      label: 'I forgot my password',
      icon: <LockReset sx={{ fontSize: 20, color: '#9333EA' }} />,
      action: () => navigate('/forgot-password'),
      disabled: false,
    },
    {
      id: 'resend-verification',
      label: 'Resend Email Verification',
      icon: <MarkEmailRead sx={{ fontSize: 20, color: '#9333EA' }} />,
      action: () => navigate('/resend-verification'),
      disabled: false,
    },
    {
      id: 'contact-support',
      label: 'Contact Support',
      icon: <ContactSupport sx={{ fontSize: 20, color: '#9333EA' }} />,
      action: () => window.location.href = 'mailto:hello@teamified.com',
      disabled: false,
    },
  ];

  return (
    <Box sx={{ mt: 3, textAlign: 'center' }}>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          color: '#666',
          transition: 'color 0.2s',
          '&:hover': {
            color: '#9333EA',
          },
        }}
      >
        <HelpOutline sx={{ fontSize: 18 }} />
        <Typography
          sx={{
            fontFamily: 'Nunito Sans, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          Having trouble accessing your account?
        </Typography>
        {expanded ? (
          <ExpandLess sx={{ fontSize: 20 }} />
        ) : (
          <ExpandMore sx={{ fontSize: 20 }} />
        )}
      </Box>

      <Collapse in={expanded}>
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: '#F9FAFB',
            borderRadius: 2,
            textAlign: 'left',
          }}
        >
          {helpOptions.map((option) => (
            <Box
              key={option.id}
              onClick={option.disabled ? undefined : option.action}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 1.5,
                px: 2,
                borderRadius: 1.5,
                cursor: option.disabled ? 'not-allowed' : 'pointer',
                opacity: option.disabled ? 0.5 : 1,
                transition: 'all 0.2s',
                '&:hover': option.disabled
                  ? {}
                  : {
                      backgroundColor: '#F3E8FF',
                    },
              }}
            >
              {option.icon}
              <Typography
                sx={{
                  fontFamily: 'Nunito Sans, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: option.disabled ? '#999' : '#333',
                }}
              >
                {option.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default HelpSection;
