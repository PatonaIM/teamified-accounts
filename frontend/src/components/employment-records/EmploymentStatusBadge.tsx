import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  PauseCircle as PauseCircleIcon,
  Cancel as CancelIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Assignment as AssignmentIcon,
  ExitToApp as ExitToAppIcon,
} from '@mui/icons-material';
import type { EmploymentStatus } from '../../types/employmentRecords';

interface EmploymentStatusBadgeProps {
  status: EmploymentStatus;
  size?: 'small' | 'medium';
  showIcon?: boolean;
  tooltip?: boolean;
}

const EmploymentStatusBadge: React.FC<EmploymentStatusBadgeProps> = ({
  status,
  size = 'small',
  showIcon = true,
  tooltip = true,
}) => {
  const getStatusConfig = (status: EmploymentStatus) => {
    switch (status) {
      case 'onboarding':
        return {
          label: 'Onboarding',
          color: 'info' as const,
          icon: <AssignmentIcon sx={{ fontSize: 16 }} />,
          tooltip: 'Employee is currently in the onboarding process',
        };
      case 'active':
        return {
          label: 'Active',
          color: 'success' as const,
          icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
          tooltip: 'Currently employed and active',
        };
      case 'inactive':
        return {
          label: 'Inactive',
          color: 'warning' as const,
          icon: <PauseCircleIcon sx={{ fontSize: 16 }} />,
          tooltip: 'Employment temporarily suspended',
        };
      case 'offboarding':
        return {
          label: 'Offboarding',
          color: 'warning' as const,
          icon: <ExitToAppIcon sx={{ fontSize: 16 }} />,
          tooltip: 'Employee is currently in the offboarding process',
        };
      case 'terminated':
        return {
          label: 'Terminated',
          color: 'error' as const,
          icon: <CancelIcon sx={{ fontSize: 16 }} />,
          tooltip: 'Employment has been terminated',
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'info' as const,
          icon: <AssignmentTurnedInIcon sx={{ fontSize: 16 }} />,
          tooltip: 'Employment contract completed',
        };
      default:
        return {
          label: 'Unknown',
          color: 'default' as const,
          icon: null,
          tooltip: 'Unknown employment status',
        };
    }
  };

  const config = getStatusConfig(status);

  const badge = (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={showIcon && config.icon ? config.icon : undefined}
      sx={{
        fontWeight: 'medium',
        '& .MuiChip-icon': {
          fontSize: 16,
        },
      }}
    />
  );

  if (tooltip) {
    return (
      <Tooltip title={config.tooltip} arrow>
        {badge}
      </Tooltip>
    );
  }

  return badge;
};

export default EmploymentStatusBadge;