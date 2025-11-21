import React from 'react';
import { Box, Paper, Typography, Skeleton } from '@mui/material';
import {
  Business as TotalIcon,
  CheckCircle as ActiveIcon,
  Block as InactiveIcon,
  People as UsersIcon,
} from '@mui/icons-material';
import type { ClientStatistics as ClientStats } from '../../services/clientService';

interface ClientStatisticsProps {
  statistics: ClientStats | null;
  loading?: boolean;
}

const ClientStatistics: React.FC<ClientStatisticsProps> = ({ statistics, loading = false }) => {
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
            {value?.toLocaleString() || 0}
          </Typography>
        )}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
      <StatCard
        title="Total Clients"
        value={statistics?.totalClients || 0}
        icon={<TotalIcon />}
        color="#A16AE8"
        bgColor="rgba(161, 106, 232, 0.1)"
      />
      <StatCard
        title="Active"
        value={statistics?.activeClients || 0}
        icon={<ActiveIcon />}
        color="#10B981"
        bgColor="rgba(16, 185, 129, 0.1)"
      />
      <StatCard
        title="Inactive"
        value={statistics?.inactiveClients || 0}
        icon={<InactiveIcon />}
        color="#F59E0B"
        bgColor="rgba(245, 158, 11, 0.1)"
      />
      <StatCard
        title="Total Users"
        value={statistics?.totalUsers || 0}
        icon={<UsersIcon />}
        color="#3B82F6"
        bgColor="rgba(59, 130, 246, 0.1)"
      />
    </Box>
  );
};

export default ClientStatistics;
