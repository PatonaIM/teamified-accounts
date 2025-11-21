/**
 * Salary Dashboard Component
 * Dashboard view with current salary overview and scheduled changes
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Alert,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CurrencyExchange as CurrencyIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { salaryHistoryService } from '../../services/salaryHistoryService';
import type {
  SalaryReport,
  SalaryHistory,
  EmploymentRecord,
} from '../../types/salary-history.types';

interface SalaryDashboardProps {
  salaryReport: SalaryReport | null;
  scheduledChanges: SalaryHistory[];
  onEmploymentSelect: (employment: EmploymentRecord | null) => void;
  isLoading: boolean;
}

export const SalaryDashboard: React.FC<SalaryDashboardProps> = ({
  salaryReport,
  scheduledChanges,
  onEmploymentSelect,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (!salaryReport) {
    return (
      <Alert severity="info">
        No salary data available. Create your first salary record to view the dashboard.
      </Alert>
    );
  }

  const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const getNextScheduledChange = (): SalaryHistory | null => {
    if (scheduledChanges.length === 0) return null;
    
    const now = new Date();
    return scheduledChanges
      .filter(change => new Date(change.effectiveDate) > now)
      .sort((a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime())[0] || null;
  };

  const nextScheduledChange = getNextScheduledChange();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Salary Overview Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Current Salary Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CurrencyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Current Salary
                </Typography>
              </Box>
              
              {salaryReport.currentSalary ? (
                <Box>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {salaryHistoryService.formatCurrency(
                      salaryReport.currentSalary.salaryAmount,
                      salaryReport.currentSalary.salaryCurrency
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Effective since {formatDate(salaryReport.currentSalary.effectiveDate)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {salaryReport.currentSalary.changeReason}
                  </Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No current salary information available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Scheduled Changes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ScheduleIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Scheduled Changes
                </Typography>
              </Box>
              
              {nextScheduledChange ? (
                <Box>
                  <Typography variant="h5" color="warning.main" gutterBottom>
                    {salaryHistoryService.formatCurrency(
                      nextScheduledChange.salaryAmount,
                      nextScheduledChange.salaryCurrency
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Effective on {formatDate(nextScheduledChange.effectiveDate)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {nextScheduledChange.changeReason}
                  </Typography>
                  <Box mt={2}>
                    <Chip
                      label={`${salaryHistoryService.calculateDaysUntilEffective(
                        new Date(nextScheduledChange.effectiveDate)
                      )} days remaining`}
                      color="warning"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No scheduled salary changes
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Salary Statistics
                </Typography>
              </Box>
              
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Total Changes"
                    secondary={salaryReport.statistics.totalChanges}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Average Increase"
                    secondary={
                      salaryReport.statistics.averageIncrease > 0
                        ? salaryHistoryService.formatCurrency(
                            salaryReport.statistics.averageIncrease,
                            salaryReport.currentSalary?.salaryCurrency || 'USD'
                          )
                        : 'N/A'
                    }
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Last Increase"
                    secondary={formatDate(salaryReport.statistics.lastIncreaseDate)}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Scheduled Changes"
                    secondary={salaryReport.statistics.scheduledChanges}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Changes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Changes
              </Typography>
              
              {scheduledChanges.length > 0 ? (
                <List dense>
                  {scheduledChanges.slice(0, 3).map((change) => (
                    <ListItem key={change.id}>
                      <ListItemIcon>
                        <CalendarIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary={salaryHistoryService.formatCurrency(
                          change.salaryAmount,
                          change.salaryCurrency
                        )}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {formatDate(change.effectiveDate)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {change.changeReason}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                  {scheduledChanges.length > 3 && (
                    <ListItem>
                      <Button size="small" color="primary">
                        View All ({scheduledChanges.length - 3} more)
                      </Button>
                    </ListItem>
                  )}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No upcoming salary changes scheduled
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
