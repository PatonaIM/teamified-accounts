/**
 * Leave Balance Widget Component
 * Displays leave balances with progress bars and by-type breakdown
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Avatar,
  Tooltip,
  Chip,
  Stack,
  CircularProgress,
} from '@mui/material';
import { Calendar, TrendingUp } from 'lucide-react';
import type { LeaveBalance } from '../../types/leave/leave.types';
import { getLeaveTypeLabel, getLeaveTypeInfo } from '../../config/countryLeaveTypeMapping';

interface LeaveBalanceWidgetProps {
  balances: LeaveBalance[];
  loading?: boolean;
  compact?: boolean;
}

const LeaveBalanceWidget: React.FC<LeaveBalanceWidgetProps> = ({
  balances,
  loading = false,
  compact = false,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const balanceArray = Array.isArray(balances) ? balances : [];

  if (balanceArray.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No leave balances found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {compact ? 'Leave Balances' : 'Leave Balance by Type'}
      </Typography>
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: compact ? '1fr' : 'repeat(2, 1fr)', 
            md: compact ? '1fr' : 'repeat(3, 1fr)', 
            lg: compact ? '1fr' : 'repeat(4, 1fr)' 
          }, 
          gap: 3 
        }}
      >
        {balanceArray.map((balance) => {
          const typeInfo = getLeaveTypeInfo(balance.leaveType);
          const totalDays = Number(balance.totalDays || 0);
          const usedDays = Number(balance.usedDays || 0);
          const availableDays = Number(balance.availableDays || 0);
          const usagePercent = totalDays > 0 ? (usedDays / totalDays) * 100 : 0;
          const isLowBalance = availableDays < totalDays * 0.2;
          const isHighUsage = usagePercent > 80;

          return (
              <Card
                key={balance.id}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  height: 320,
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: isLowBalance ? 'warning.main' : 'divider',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: isLowBalance ? 'warning.dark' : 'primary.main',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        width: 44,
                        height: 44,
                        mr: 2,
                      }}
                    >
                      <Calendar size={22} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Tooltip title={typeInfo?.description || ''}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {getLeaveTypeLabel(balance.leaveType)}
                        </Typography>
                      </Tooltip>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                        {balance.accrualRate && typeof balance.accrualRate === 'number' && balance.accrualRate > 0 && (
                          <Tooltip title={`Accrues ${balance.accrualRate.toFixed(2)} days/month`}>
                            <Chip
                              icon={<TrendingUp size={12} />}
                              label="Accruing"
                              size="small"
                              color="info"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Tooltip>
                        )}
                        {isLowBalance && (
                          <Chip 
                            label="Low" 
                            size="small" 
                            color="warning" 
                            sx={{ height: 20, fontSize: '0.7rem' }} 
                          />
                        )}
                      </Stack>
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                        <Typography 
                          variant="h4" 
                          color="primary" 
                          sx={{ fontWeight: 700, lineHeight: 1 }}
                        >
                          {availableDays}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          of {totalDays} days
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(usagePercent, 100)}
                        color={isLowBalance || isHighUsage ? 'warning' : 'primary'}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: (theme) => 
                            theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.1)' 
                              : 'rgba(0, 0, 0, 0.08)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {usedDays} used
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {availableDays} remaining
                        </Typography>
                      </Box>
                    </Box>

                    {!compact && (
                      <Box 
                        sx={{ 
                          pt: 2, 
                          mt: 'auto',
                          borderTop: '1px solid', 
                          borderColor: 'divider',
                          minHeight: '40px',
                        }}
                      >
                        {balance.accrualRate && typeof balance.accrualRate === 'number' && balance.accrualRate > 0 ? (
                          <Typography variant="caption" color="text.secondary">
                            <strong>Accrual:</strong> {balance.accrualRate.toFixed(2)} days/month
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            &nbsp;
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
          );
        })}
      </Box>

      {!compact && balanceArray.length > 0 && (
        <Box 
          sx={{ 
            mt: 4, 
            p: 2.5, 
            bgcolor: (theme) => 
              theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.02)',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> Leave balances are updated automatically when requests are approved.
            Accruing leave types accumulate monthly based on the accrual rate.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LeaveBalanceWidget;
