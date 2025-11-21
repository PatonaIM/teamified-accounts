/**
 * Admin Salary Dashboard Component
 * Overview dashboard for all users' salary information
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Pagination,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Assessment as ReportIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import userService from '../../services/userService';

// Define User type locally to avoid import issues
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: any;
  profileData?: any;
  status: 'active' | 'inactive' | 'archived';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
import { salaryHistoryService } from '../../services/salaryHistoryService';
import type { SalaryHistory, SalaryReport } from '../../types/salary-history.types';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(161, 106, 232, 0.1)',
  border: '1px solid rgba(161, 106, 232, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(161, 106, 232, 0.15)',
    transform: 'translateY(-2px)',
  },
}));

interface UserSalarySummary {
  user: User;
  currentSalary?: {
    amount: number;
    currency: string;
    effectiveDate: string;
  };
  lastChange?: {
    amount: number;
    currency: string;
    changeDate: string;
    changeReason: string;
  };
  totalChanges: number;
  scheduledChanges: number;
}

interface AdminSalaryDashboardProps {
  onUserSelect: (user: User) => void;
  onViewUserHistory: (user: User) => void;
}

export const AdminSalaryDashboard: React.FC<AdminSalaryDashboardProps> = ({
  onUserSelect,
  onViewUserHistory,
}) => {
  const [userSummaries, setUserSummaries] = useState<UserSalarySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSalaryChanges: 0,
    averageSalary: 0,
    scheduledChanges: 0,
  });

  const itemsPerPage = 10;

  useEffect(() => {
    loadUserSummaries();
  }, [page, searchQuery]);

  const loadUserSummaries = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('AdminSalaryDashboard: Loading user summaries...');

      // Load users with pagination
      const userResponse = await userService.getUsers({
        page,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        status: 'active',
      });
      console.log('AdminSalaryDashboard: Loaded users:', userResponse.users.length);

      // Load scheduled changes once for all users
      let allScheduledChanges = [];
      try {
        allScheduledChanges = await salaryHistoryService.getScheduledChanges();
        console.log('AdminSalaryDashboard: Loaded scheduled changes:', allScheduledChanges.length);
      } catch (err) {
        console.warn('AdminSalaryDashboard: Failed to load scheduled changes:', err);
      }

      // Load salary data for each user
      const summaries: UserSalarySummary[] = [];
      let totalSalaryChanges = 0;
      let totalSalaryAmount = 0;
      let scheduledChanges = 0;

      console.log('AdminSalaryDashboard: Processing users for salary data...');
      for (let i = 0; i < userResponse.users.length; i++) {
        const user = userResponse.users[i];
        try {
          console.log(`AdminSalaryDashboard: Loading data for user ${i + 1}/${userResponse.users.length}: ${user.email}`);
          
          // Get user's salary history and report in parallel
          const [salaryHistory, salaryReport] = await Promise.all([
            salaryHistoryService.getSalaryHistoryByUser(user.id),
            salaryHistoryService.getUserSalaryReport(user.id)
          ]);

          const userScheduled = allScheduledChanges.filter(s => 
            salaryHistory.some(sh => sh.employmentRecordId === s.employmentRecordId)
          );

          const currentSalary = salaryReport?.currentSalary;
          const lastChange = salaryHistory.length > 0 ? salaryHistory[0] : null;

          summaries.push({
            user,
            currentSalary: currentSalary ? {
              amount: currentSalary.salaryAmount,
              currency: currentSalary.salaryCurrency,
              effectiveDate: currentSalary.effectiveDate,
            } : undefined,
            lastChange: lastChange ? {
              amount: lastChange.salaryAmount,
              currency: lastChange.salaryCurrency,
              changeDate: lastChange.effectiveDate,
              changeReason: lastChange.changeReason,
            } : undefined,
            totalChanges: salaryHistory.length,
            scheduledChanges: userScheduled.length,
          });

          totalSalaryChanges += salaryHistory.length;
          if (currentSalary) {
            totalSalaryAmount += currentSalary.salaryAmount;
          }
          scheduledChanges += userScheduled.length;

        } catch (err) {
          console.warn(`AdminSalaryDashboard: Failed to load salary data for user ${user.email}:`, err);
          // Add user without salary data
          summaries.push({
            user,
            totalChanges: 0,
            scheduledChanges: 0,
          });
        }
      }
      
      console.log('AdminSalaryDashboard: Completed processing all users');

      setUserSummaries(summaries);
      setTotalPages(userResponse.pagination.totalPages);
      setStats({
        totalUsers: userResponse.pagination.total,
        totalSalaryChanges,
        averageSalary: summaries.length > 0 ? totalSalaryAmount / summaries.length : 0,
        scheduledChanges,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user salary data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && userSummaries.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#A16AE8' }}>
                    {stats.totalUsers}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: '#A16AE8' }} />
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Changes
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#8096FD' }}>
                    {stats.totalSalaryChanges}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#8096FD' }} />
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Avg. Salary
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#10B981' }}>
                    {formatCurrency(stats.averageSalary, 'USD')}
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: '#10B981' }} />
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Scheduled
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                    {stats.scheduledChanges}
                  </Typography>
                </Box>
                <ReportIcon sx={{ fontSize: 40, color: '#F59E0B' }} />
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
              <TableCell>User</TableCell>
              <TableCell>Current Salary</TableCell>
              <TableCell>Last Change</TableCell>
              <TableCell>Total Changes</TableCell>
              <TableCell>Scheduled</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userSummaries.map((summary) => (
              <TableRow key={summary.user.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        mr: 2,
                        bgcolor: '#A16AE8',
                        fontSize: '1rem',
                      }}
                    >
                      {getInitials(summary.user)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {summary.user.firstName && summary.user.lastName
                          ? `${summary.user.firstName} ${summary.user.lastName}`
                          : summary.user.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {summary.user.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {summary.currentSalary ? (
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {formatCurrency(summary.currentSalary.amount, summary.currentSalary.currency)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Since {formatDate(summary.currentSalary.effectiveDate)}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No salary data</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {summary.lastChange ? (
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {formatCurrency(summary.lastChange.amount, summary.lastChange.currency)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {summary.lastChange.changeReason}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No changes</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={summary.totalChanges}
                    size="small"
                    color={summary.totalChanges > 0 ? 'primary' : 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {summary.scheduledChanges > 0 ? (
                    <Chip
                      label={summary.scheduledChanges}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  ) : (
                    <Typography color="text.secondary">None</Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" gap={1}>
                    <Tooltip title="View Salary History">
                      <IconButton
                        size="small"
                        onClick={() => onViewUserHistory(summary.user)}
                        sx={{ color: '#A16AE8' }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Select User">
                      <IconButton
                        size="small"
                        onClick={() => onUserSelect(summary.user)}
                        sx={{ color: '#8096FD' }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default AdminSalaryDashboard;
