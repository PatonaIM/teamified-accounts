import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { salaryHistoryService } from '../services/salaryHistoryService';
import type { SalaryHistory } from '../types/salary-history.types';

interface ProfileSalaryTimelineProps {
  salaryHistory: SalaryHistory[];
  isLoading: boolean;
}

const ProfileSalaryTimeline: React.FC<ProfileSalaryTimelineProps> = ({
  salaryHistory,
  isLoading,
}) => {
  // Sort salary history by effective date (newest first)
  const sortedHistory = [...salaryHistory].sort(
    (a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
  );

  // Take only the latest 5 records for the profile view
  const recentHistory = sortedHistory.slice(0, 5);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getChangeInfo = (current: SalaryHistory, previous?: SalaryHistory) => {
    if (!previous || current.salaryCurrency !== previous.salaryCurrency) {
      return { changeAmount: 0, changePercentage: 0, isIncrease: false, isDecrease: false };
    }

    const changeAmount = current.salaryAmount - previous.salaryAmount;
    const changePercentage = salaryHistoryService.calculateChangePercentage(
      current.salaryAmount,
      previous.salaryAmount
    );

    return {
      changeAmount,
      changePercentage,
      isIncrease: changeAmount > 0,
      isDecrease: changeAmount < 0,
    };
  };

  const getTimelineIcon = (salary: SalaryHistory, changeInfo: any) => {
    const now = new Date();
    const effectiveDate = new Date(salary.effectiveDate);
    
    if (effectiveDate <= now) {
      return changeInfo.isIncrease ? <TrendingUpIcon /> : 
             changeInfo.isDecrease ? <TrendingDownIcon /> : 
             <CheckCircleIcon />;
    } else {
      return <ScheduleIcon />;
    }
  };

  const getTimelineColor = (salary: SalaryHistory, changeInfo: any) => {
    const now = new Date();
    const effectiveDate = new Date(salary.effectiveDate);
    
    if (effectiveDate > now) return 'warning.main'; // Scheduled
    if (changeInfo.isIncrease) return 'success.main';
    if (changeInfo.isDecrease) return 'error.main';
    return 'primary.main';
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (recentHistory.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <MoneyIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No Salary History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No salary records found for this profile.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Salary History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Latest {recentHistory.length} salary changes
        </Typography>
      </Box>

        <Stack spacing={2}>
          {recentHistory.map((salary, index) => {
            const previousSalary = sortedHistory[index + 1];
            const changeInfo = getChangeInfo(salary, previousSalary);
            const now = new Date();
            const effectiveDate = new Date(salary.effectiveDate);
            const isScheduled = effectiveDate > now;

            return (
              <Box key={salary.id} sx={{ display: 'flex', gap: 2, position: 'relative' }}>
                {/* Timeline dot and connector */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                  <Avatar
                    sx={{
                      bgcolor: getTimelineColor(salary, changeInfo),
                      width: 32,
                      height: 32,
                      '& .MuiSvgIcon-root': {
                        color: effectiveDate > now ? 'warning.contrastText' : 
                               changeInfo.isIncrease ? 'success.contrastText' :
                               changeInfo.isDecrease ? 'error.contrastText' : 'primary.contrastText',
                      },
                    }}
                  >
                    {getTimelineIcon(salary, changeInfo)}
                  </Avatar>
                  {index < recentHistory.length - 1 && (
                    <Box
                      sx={{
                        width: 2,
                        height: 32,
                        bgcolor: 'divider',
                        mt: 1,
                      }}
                    />
                  )}
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div">
                      {salaryHistoryService.formatCurrency(salary.salaryAmount, salary.salaryCurrency)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {isScheduled && (
                        <Chip
                          label="Scheduled"
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                      {changeInfo.changeAmount !== 0 && (
                        <Chip
                          label={`${changeInfo.isIncrease ? '+' : ''}${changeInfo.changePercentage.toFixed(1)}%`}
                          size="small"
                          color={changeInfo.isIncrease ? 'success' : 'error'}
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {salary.changeReason}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Effective: {formatDate(salary.effectiveDate)}
                    </Typography>
                    {salary.changedByName && (
                      <Typography variant="caption" color="text.secondary">
                        By: {salary.changedByName}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Stack>

      {sortedHistory.length > 5 && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Showing {recentHistory.length} of {sortedHistory.length} records
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProfileSalaryTimeline;