import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { profileService } from '../services/profileService';
import { useAuth } from '../hooks/useAuth';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Paper,
  Stack,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import JobRecommendations from './dashboard/JobRecommendations';

const dashboardData = {
  timesheetProgress: {
    logged: 32.5,
    total: 40,
    status: 'draft',
    weekEnding: 'Sep 1, 2024'
  },
  leaveBalance: {
    annual: 18,
    sick: 5,
    personal: 3
  },
  latestPayslip: {
    month: 'August 2024',
    processed: 'Aug 31, 2024',
    netPay: '$4,250.00'
  },
  systemStatus: 'operational'
};

const allRecentActivity = [
  {
    id: 1,
    type: 'success',
    message: 'Timesheet for week ending Aug 25 approved',
    time: '2 days ago',
    icon: CheckCircleIcon,
    roles: ['admin', 'hr', 'account_manager', 'hr_manager_client', 'eor']
  },
  {
    id: 2,
    type: 'info',
    message: 'Profile updated - Emergency contact information',
    time: '1 week ago',
    icon: PersonIcon,
    roles: ['admin', 'hr', 'account_manager', 'recruiter', 'hr_manager_client', 'eor', 'candidate']
  },
  {
    id: 3,
    type: 'warning',
    message: 'Annual leave request approved (Sep 15-19)',
    time: '2 weeks ago',
    icon: EventIcon,
    roles: ['admin', 'hr', 'account_manager', 'hr_manager_client', 'eor']
  },
  {
    id: 4,
    type: 'info',
    message: 'CV uploaded successfully',
    time: '3 days ago',
    icon: DescriptionIcon,
    roles: ['candidate', 'eor']
  },
  {
    id: 5,
    type: 'success',
    message: 'Document verification completed',
    time: '1 week ago',
    icon: CheckCircleIcon,
    roles: ['admin', 'hr', 'account_manager', 'recruiter', 'hr_manager_client', 'eor', 'candidate']
  }
];

const allQuickActions = [
  {
    id: 1,
    title: 'Log Hours',
    icon: ScheduleIcon,
    href: '/timesheets',
    roles: ['admin', 'hr', 'account_manager', 'hr_manager_client', 'eor']
  },
  {
    id: 2,
    title: 'Request Leave',
    icon: EventIcon,
    href: '/leave',
    roles: ['admin', 'hr', 'account_manager', 'hr_manager_client', 'eor']
  },
  {
    id: 3,
    title: 'Update CV',
    icon: UploadIcon,
    href: '/cv',
    roles: ['candidate', 'eor']
  },
  {
    id: 4,
    title: 'View Documents',
    icon: DescriptionIcon,
    href: '/documents',
    roles: ['admin', 'hr', 'account_manager', 'hr_manager_client', 'eor', 'candidate']
  },
  {
    id: 5,
    title: 'View Payslips',
    icon: AccountBalanceWalletIcon,
    href: '/payslips',
    roles: ['admin', 'hr', 'payroll_admin', 'eor']
  }
];

const DashboardMUI: React.FC = () => {
  const { user } = useAuth();
  const [profileCompletion, setProfileCompletion] = useState<number>(0);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const quickActions = useMemo(() => {
    if (!user?.roles) return [];
    
    return allQuickActions.filter(action => {
      return action.roles.some(role => user.roles.includes(role));
    });
  }, [user?.roles]);

  const recentActivity = useMemo(() => {
    if (!user?.roles) return [];
    
    return allRecentActivity.filter(activity => {
      return activity.roles.some(role => user.roles.includes(role));
    });
  }, [user?.roles]);

  const canViewEmploymentWidgets = useMemo(() => {
    if (!user?.roles) return false;
    return user.roles.some(role => ['admin', 'hr', 'account_manager', 'hr_manager_client', 'eor', 'payroll_admin'].includes(role));
  }, [user?.roles]);

  const isCandidate = useMemo(() => {
    if (!user?.roles) return false;
    return user.roles.includes('candidate') && !canViewEmploymentWidgets;
  }, [user?.roles, canViewEmploymentWidgets]);

  useEffect(() => {
    const loadProfileCompletion = async () => {
      try {
        const completion = await profileService.getProfileCompletion();
        setProfileCompletion(completion);
      } catch (error) {
        console.error('Failed to load profile completion:', error);
        setProfileCompletion(0);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfileCompletion();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {isCandidate && (
        <Box sx={{ mb: 4 }}>
          <JobRecommendations />
        </Box>
      )}

      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #E5E7EB' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
            Overview
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Your progress, timesheets, leave and pay information
          </Typography>
        </Box>
          
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
          <Card sx={{ height: 320, borderRadius: 3, boxShadow: 2, display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title="Profile Completion"
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PersonIcon sx={{ color: 'primary.contrastText' }} />
                </Avatar>
              }
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pt: 2, pb: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {isLoadingProfile ? '...' : `${profileCompletion}%`}
                  </Typography>
                </Box>
                <LinearProgress
                  variant={isLoadingProfile ? 'indeterminate' : 'determinate'}
                  value={isLoadingProfile ? 0 : profileCompletion}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: 'primary.main',
                    },
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Complete your profile to access all features
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/profile"
                variant="contained"
                color="primary"
                size="small"
                startIcon={<PersonIcon />}
                sx={{
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Update Profile
              </Button>
            </CardContent>
          </Card>

          {canViewEmploymentWidgets && (
            <Card sx={{ height: 320, borderRadius: 3, boxShadow: 2, display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                title="Timesheet Progress"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                avatar={
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <ScheduleIcon sx={{ color: 'secondary.contrastText' }} />
                  </Avatar>
                }
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pt: 2, pb: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Hours Logged
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {dashboardData.timesheetProgress.logged} / {dashboardData.timesheetProgress.total} hrs
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(dashboardData.timesheetProgress.logged / dashboardData.timesheetProgress.total) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: 'secondary.main',
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Week ending {dashboardData.timesheetProgress.weekEnding}
                    </Typography>
                    <Chip
                      label={dashboardData.timesheetProgress.status}
                      size="small"
                      color={dashboardData.timesheetProgress.status === 'draft' ? 'warning' : 'success'}
                    />
                  </Box>
                </Box>
                <Button
                  component={Link}
                  to="/timesheets"
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<ScheduleIcon />}
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  View Timesheet
                </Button>
              </CardContent>
            </Card>
          )}

          {canViewEmploymentWidgets && (
            <Card sx={{ height: 320, borderRadius: 3, boxShadow: 2, display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                title="Leave Balance"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <EventIcon sx={{ color: 'primary.contrastText' }} />
                  </Avatar>
                }
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pt: 2, pb: 2 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Annual Leave
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="primary.main">
                      {dashboardData.leaveBalance.annual} days
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Sick Leave
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="secondary.main">
                      {dashboardData.leaveBalance.sick} days
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Personal Leave
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="text.primary">
                      {dashboardData.leaveBalance.personal} days
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  component={Link}
                  to="/leave"
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<EventIcon />}
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  Request Leave
                </Button>
              </CardContent>
            </Card>
          )}

          {canViewEmploymentWidgets && (
            <Card sx={{ height: 320, borderRadius: 3, boxShadow: 2, display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                title="Latest Payslip"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                avatar={
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <AccountBalanceWalletIcon sx={{ color: 'secondary.contrastText' }} />
                  </Avatar>
                }
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pt: 2, pb: 2 }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ mb: 1 }}>
                    {dashboardData.latestPayslip.netPay}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {dashboardData.latestPayslip.month}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Processed: {dashboardData.latestPayslip.processed}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<DownloadIcon />}
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  Download Payslip
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
            Recent Activity
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Your latest updates and notifications
          </Typography>
        </Box>
          
        <List>
          {recentActivity.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <Avatar sx={{ 
                    bgcolor: index % 2 === 0 ? 'primary.main' : 'secondary.main',
                    width: 40, 
                    height: 40 
                  }}>
                    <activity.icon sx={{ color: index % 2 === 0 ? 'primary.contrastText' : 'secondary.contrastText' }} />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={activity.message}
                  secondary={activity.time}
                  primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                  secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                />
              </ListItem>
              {index < recentActivity.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default DashboardMUI;
