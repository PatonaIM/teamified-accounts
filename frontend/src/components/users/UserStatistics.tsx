import React from 'react';
import { Box, Paper, Typography, Skeleton } from '@mui/material';
import {
  People as TotalIcon,
  CheckCircle as ActiveIcon,
  Block as InactiveIcon,
  Archive as ArchivedIcon,
} from '@mui/icons-material';
import type { User } from '../../services/userService';

interface UserStatisticsProps {
  users: User[];
  loading?: boolean;
}

const UserStatistics: React.FC<UserStatisticsProps> = ({ users, loading = false }) => {
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const inactiveUsers = users.filter(u => u.status === 'inactive').length;
  const archivedUsers = users.filter(u => u.status === 'archived').length;

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }> = ({ title, value, icon, color, bgColor }) => (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        p: 1,
        borderRadius: 2,
        border: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 2,
          backgroundColor: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: color,
          '& .MuiSvgIcon-root': {
            fontSize: '1rem',
          },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            textTransform: 'uppercase',
            fontWeight: 600,
            letterSpacing: '0.5px',
            color: 'text.secondary',
            display: 'block',
            mb: 0.25,
            fontSize: '0.65rem',
          }}
        >
          {title}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width="80%" height={28} />
        ) : (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              lineHeight: 1,
            }}
          >
            {value.toLocaleString()}
          </Typography>
        )}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
      <StatCard
        title="Total Users"
        value={totalUsers}
        icon={<TotalIcon />}
        color="#A16AE8"
        bgColor="rgba(161, 106, 232, 0.1)"
      />
      <StatCard
        title="Active"
        value={activeUsers}
        icon={<ActiveIcon />}
        color="#10B981"
        bgColor="rgba(16, 185, 129, 0.1)"
      />
      <StatCard
        title="Inactive"
        value={inactiveUsers}
        icon={<InactiveIcon />}
        color="#F59E0B"
        bgColor="rgba(245, 158, 11, 0.1)"
      />
      <StatCard
        title="Archived"
        value={archivedUsers}
        icon={<ArchivedIcon />}
        color="#EF4444"
        bgColor="rgba(239, 68, 68, 0.1)"
      />
    </Box>
  );
};

export default UserStatistics;
