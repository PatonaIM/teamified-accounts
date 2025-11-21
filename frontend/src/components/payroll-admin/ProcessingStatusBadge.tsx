/**
 * Processing Status Badge Component
 * Displays payroll period or processing status with color coding
 * Story 7.8 - Payroll Administration
 */

import React from 'react';
import { Chip } from '@mui/material';
import Circle from '@mui/icons-material/Circle';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Lock from '@mui/icons-material/Lock';
import PlayCircle from '@mui/icons-material/PlayCircle';
import Refresh from '@mui/icons-material/Refresh';
import Error from '@mui/icons-material/Error';
import Cancel from '@mui/icons-material/Cancel';

interface ProcessingStatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

const ProcessingStatusBadge: React.FC<ProcessingStatusBadgeProps> = ({ status, size = 'small' }) => {
  const getStatusConfig = (
    status: string
  ): {
    color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    icon: React.ReactElement;
    label: string;
  } => {
    const lowerStatus = status?.toLowerCase() || '';

    switch (lowerStatus) {
      case 'draft':
        return {
          color: 'default',
          icon: <Circle />,
          label: 'Draft',
        };
      case 'open':
        return {
          color: 'info',
          icon: <PlayCircle />,
          label: 'Open',
        };
      case 'processing':
      case 'in_progress':
      case 'started':
        return {
          color: 'warning',
          icon: <Refresh />,
          label: 'Processing',
        };
      case 'completed':
        return {
          color: 'success',
          icon: <CheckCircle />,
          label: 'Completed',
        };
      case 'closed':
        return {
          color: 'default',
          icon: <Lock />,
          label: 'Closed',
        };
      case 'failed':
        return {
          color: 'error',
          icon: <Error />,
          label: 'Failed',
        };
      case 'cancelled':
        return {
          color: 'default',
          icon: <Cancel />,
          label: 'Cancelled',
        };
      default:
        return {
          color: 'default',
          icon: <Circle />,
          label: status || 'Unknown',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      size={size}
      sx={{
        fontWeight: 500,
        '& .MuiChip-icon': {
          fontSize: size === 'small' ? '16px' : '20px',
        },
      }}
    />
  );
};

export default ProcessingStatusBadge;

