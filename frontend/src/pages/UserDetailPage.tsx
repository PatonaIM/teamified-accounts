import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  Button,
  Stack,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  TableContainer,
  TableHead,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Tooltip,
  Snackbar,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  Email,
  Phone,
  LocationOn,
  Person,
  Delete,
  VerifiedUser,
  Business,
  CalendarToday,
  AdminPanelSettings,
  CheckCircle,
  Cancel,
  ChevronRight,
  Warning,
  LockReset,
  History,
  ContentCopy,
  Refresh,
  Send,
  Visibility,
  VisibilityOff,
  CreditCard,
  Login,
  Devices,
  Timeline,
  Edit,
  CameraAlt,
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';
import userService, { type User } from '../services/userService';
import roleService from '../services/roleService';
import api from '../services/api';

interface UserRole {
  id: string;
  role: string;
  scope?: string;
  scopeId?: string;
  createdAt: string;
}

interface UserActivity {
  loginHistory: Array<{
    timestamp: string;
    ip: string;
    userAgent: string;
    deviceType: string;
  }>;
  lastAppsUsed: Array<{
    appName: string;
    clientId: string;
    lastUsed: string;
  }>;
  recentActions: Array<{
    action: string;
    entityType: string;
    timestamp: string;
    targetUserEmail?: string;
  }>;
}

type TabType = 'basic' | 'organizations' | 'billing' | 'activity' | 'reset-password' | 'delete';

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Reset password modal state
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendingResetLink, setSendingResetLink] = useState(false);
  const [settingPassword, setSettingPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Activity state
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Profile picture upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verification email state
  const [sendingVerification, setSendingVerification] = useState(false);

  const navigationState = location.state as { 
    organizationId?: string; 
    organizationName?: string;
  } | null;

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'activity' && userId && !activity) {
      fetchUserActivity();
    }
  }, [activeTab, userId]);

  const fetchUserDetails = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const userData = await userService.getUserById(userId);
      setUser(userData);

      try {
        const rolesResponse = await roleService.getUserRoles(userId);
        setRoles(rolesResponse.roles || []);
      } catch (roleErr) {
        console.warn('Failed to load user roles:', roleErr);
        setRoles([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load user details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivity = async () => {
    if (!userId) return;
    
    setActivityLoading(true);
    try {
      const response = await api.get(`/v1/users/${userId}/activity`);
      setActivity(response.data);
    } catch (err) {
      console.warn('Failed to load user activity:', err);
      setActivity({
        loginHistory: [],
        lastAppsUsed: [],
        recentActions: [],
      });
    } finally {
      setActivityLoading(false);
    }
  };

  const handleSendResetLink = async () => {
    if (!user) return;
    
    setSendingResetLink(true);
    try {
      await api.post('/v1/auth/admin/send-password-reset', { userId: user.id });
      setResetSuccess('Password reset link has been sent to the user\'s email.');
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to send reset link', severity: 'error' });
    } finally {
      setSendingResetLink(false);
    }
  };

  const handleSetPassword = async () => {
    if (!user || !newPassword) return;
    
    setSettingPassword(true);
    try {
      const response = await api.post('/v1/auth/admin/set-password', { 
        userId: user.id, 
        password: newPassword 
      });
      const successMsg = response.data?.message || 'Password has been set successfully.';
      setResetSuccess(successMsg);
      setSnackbar({ open: true, message: 'Password set successfully. Make sure to share the password securely with the user.', severity: 'success' });
      
      // Close modal after a brief delay to allow user to see success message
      setTimeout(() => {
        handleCloseResetPasswordModal();
      }, 2000);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to set password', severity: 'error' });
    } finally {
      setSettingPassword(false);
    }
  };

  const generateStrongPassword = () => {
    const length = 16;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = uppercase + lowercase + numbers + symbols;
    
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    setNewPassword(password);
  };

  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(newPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  const handleOpenResetPasswordModal = () => {
    setShowResetPasswordModal(true);
    setNewPassword('');
    setResetSuccess(null);
  };

  const handleCloseResetPasswordModal = () => {
    setShowResetPasswordModal(false);
    setNewPassword('');
    setResetSuccess(null);
  };

  const handleOpenDeleteDialog = () => {
    setShowDeleteDialog(true);
    setDeleteConfirmEmail('');
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteConfirmEmail('');
  };

  const handleConfirmDelete = async () => {
    if (!userId || !user) return;

    if (deleteConfirmEmail.trim() !== user.email) {
      return;
    }

    setDeleting(true);
    try {
      await userService.deleteUser(userId);
      const isCandidateUser = roles.some(r => r.role === 'candidate');
      navigate(isCandidateUser ? '/admin/tools/candidate-users' : '/admin/organizations');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete user');
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setSnackbar({ open: true, message: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)', severity: 'error' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({ open: true, message: 'Image size must be less than 5MB', severity: 'error' });
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/objects/users/${userId}/profile-picture`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.url && user) {
        setUser({ ...user, profilePictureUrl: response.data.url });
      }
      setSnackbar({ open: true, message: 'Profile picture updated successfully', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to update profile picture', severity: 'error' });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResendVerification = async () => {
    if (!userId || !user) return;
    
    setSendingVerification(true);
    try {
      await api.post(`/v1/users/${userId}/resend-verification`);
      setSnackbar({ open: true, message: 'Verification email sent successfully', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to send verification email', severity: 'error' });
    } finally {
      setSendingVerification(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  const formatLastLogin = (lastLoginAt: string | null | undefined) => {
    if (!lastLoginAt) return 'Never';
    try {
      return formatDistanceToNow(new Date(lastLoginAt), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getStatusColor = (status: string): 'success' | 'default' | 'info' | 'warning' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'invited':
        return 'info';
      case 'nlwf':
      case 'inactive':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getDisplayStatus = (status: string): string => {
    switch (status) {
      case 'active':
        return 'ACTIVE';
      case 'invited':
        return 'INVITED';
      case 'nlwf':
      case 'inactive':
        return 'NLWF';
      default:
        return status.toUpperCase();
    }
  };

  const getRoleBadgeColor = (role: string) => {
    if (role.includes('admin')) return '#A16AE8';
    if (role.includes('hr')) return '#4CAF50';
    if (role.includes('client')) return '#2196F3';
    return '#757575';
  };

  const getRoleDisplayColor = (roleType: string): { bgcolor: string; color: string; fontWeight: number } => {
    switch (true) {
      case roleType.includes('super_admin'):
        return { bgcolor: '#c62828', color: 'white', fontWeight: 600 };
      case roleType.includes('admin'):
        return { bgcolor: '#A16AE8', color: 'white', fontWeight: 600 };
      case roleType.includes('hr'):
        return { bgcolor: '#4CAF50', color: 'white', fontWeight: 600 };
      case roleType.includes('finance'):
        return { bgcolor: '#FF9800', color: 'white', fontWeight: 600 };
      case roleType.includes('recruiter'):
        return { bgcolor: '#2196F3', color: 'white', fontWeight: 600 };
      case roleType.includes('employee'):
        return { bgcolor: '#607D8B', color: 'white', fontWeight: 600 };
      default:
        return { bgcolor: '#757575', color: 'white', fontWeight: 600 };
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'Mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'Tablet';
    }
    return 'Desktop';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ p: 4 }}>
        <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            User Details
          </Typography>
        </Stack>
        <Alert severity="error">{error || 'User not found'}</Alert>
        <Button
          variant="outlined"
          onClick={() => navigate('/admin/users')}
          sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  const userFullName = `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`;
  const isCandidate = roles.some(r => r.role === 'candidate');

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'basic', label: 'Basic Information', icon: <Person /> },
    { id: 'organizations', label: 'Organizations', icon: <Business /> },
    { id: 'billing', label: 'Billing Details', icon: <CreditCard /> },
    { id: 'activity', label: 'User Activity', icon: <History /> },
    { id: 'reset-password', label: 'Reset Password', icon: <LockReset /> },
    { id: 'delete', label: 'Delete User', icon: <Delete /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <VerifiedUser color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Profile Information
              </Typography>
            </Stack>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: '30%', border: 'none' }}>User ID</TableCell>
                  <TableCell sx={{ border: 'none' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {user.id}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, border: 'none' }}>Email</TableCell>
                  <TableCell sx={{ border: 'none' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2">{user.email}</Typography>
                      {user.emailVerified ? (
                        <Tooltip title="Email verified">
                          <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                        </Tooltip>
                      ) : (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip 
                            label="Needs Verification" 
                            size="small" 
                            color="warning"
                            sx={{ height: 24 }}
                          />
                          <Button
                            size="small"
                            variant="text"
                            startIcon={sendingVerification ? <CircularProgress size={14} /> : <Send />}
                            onClick={handleResendVerification}
                            disabled={sendingVerification}
                            sx={{ textTransform: 'none', minWidth: 'auto' }}
                          >
                            {sendingVerification ? 'Sending...' : 'Resend'}
                          </Button>
                        </Stack>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, border: 'none' }}>Status</TableCell>
                  <TableCell sx={{ border: 'none' }}>
                    <Chip
                      label={getDisplayStatus(user.status || 'active')}
                      color={(['nlwf', 'inactive'] as string[]).includes(user.status || '') ? undefined : getStatusColor(user.status || 'active')}
                      size="small"
                      sx={(['nlwf', 'inactive'] as string[]).includes(user.status || '') ? {
                        bgcolor: '#757575',
                        color: 'white',
                        fontWeight: 600
                      } : undefined}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, border: 'none' }}>Created</TableCell>
                  <TableCell sx={{ border: 'none' }}>{formatDate(user.createdAt)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, border: 'none' }}>Last Login</TableCell>
                  <TableCell sx={{ border: 'none' }}>{formatLastLogin(user.lastLoginAt)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        );

      case 'organizations':
        return (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <Business color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Organization Memberships
              </Typography>
            </Stack>

            {user.organizations && user.organizations.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: isDarkMode ? 'action.hover' : 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Organization</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {user.organizations.map((org) => (
                      <TableRow key={org.organizationId} hover>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {org.organizationName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {org.organizationSlug}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={org.roleType}
                            size="small"
                            sx={getRoleDisplayColor(org.roleType)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {org.joinedAt ? formatDate(org.joinedAt) : 'Unknown'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => navigate('/admin/organizations', {
                              state: { selectedOrganizationId: org.organizationId }
                            })}
                            sx={{ textTransform: 'none' }}
                          >
                            View Org
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                This user is not a member of any organizations.
              </Alert>
            )}
          </Box>
        );

      case 'billing':
        return (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CreditCard sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Billing Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Billing information and payment history will be available here in a future update.
            </Typography>
          </Box>
        );

      case 'activity':
        return (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <History color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                User Activity
              </Typography>
            </Stack>

            {activityLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={4}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Login fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Login History
                    </Typography>
                  </Stack>
                  
                  {activity?.loginHistory && activity.loginHistory.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Device</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {activity.loginHistory.slice(0, 10).map((login, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {format(new Date(login.timestamp), 'MMM d, yyyy h:mm a')}
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Devices fontSize="small" color="action" />
                                  <Typography variant="body2">{getDeviceIcon(login.userAgent)}</Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {login.ip}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No login history available. Last login: {formatLastLogin(user.lastLoginAt)}
                    </Typography>
                  )}
                </Paper>

                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Devices fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Connected Applications
                    </Typography>
                  </Stack>
                  
                  {activity?.lastAppsUsed && activity.lastAppsUsed.length > 0 ? (
                    <Stack spacing={2}>
                      {activity.lastAppsUsed.map((app, index) => (
                        <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                          <Stack>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {app.appName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Client ID: {app.clientId}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            Last used: {formatDistanceToNow(new Date(app.lastUsed), { addSuffix: true })}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No connected applications found.
                    </Typography>
                  )}
                </Paper>

                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Timeline fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Recent Activity
                    </Typography>
                  </Stack>
                  
                  {activity?.recentActions && activity.recentActions.length > 0 ? (
                    <Stack spacing={1}>
                      {activity.recentActions.slice(0, 10).map((action, index) => {
                        const formatActionLabel = (act: typeof action) => {
                          const baseAction = act.action.replace(/_/g, ' ');
                          if ((act.action === 'admin_password_set' || act.action === 'admin_password_reset_sent') && act.targetUserEmail) {
                            return `${baseAction} for ${act.targetUserEmail}`;
                          }
                          return `${baseAction} - ${act.entityType}`;
                        };
                        
                        return (
                          <Stack key={index} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.5 }}>
                            <Typography variant="body2" sx={{ flex: 1, mr: 2 }}>
                              {formatActionLabel(action)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                              {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true })}
                            </Typography>
                          </Stack>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No recent activity recorded.
                    </Typography>
                  )}
                </Paper>
              </Stack>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => navigate(isCandidate ? '/admin/tools/candidate-users' : '/admin/organizations')}
          sx={{ 
            mr: 2,
            color: 'primary.main',
            '&:hover': { 
              bgcolor: 'rgba(161, 106, 232, 0.08)' 
            }
          }}
        >
          <ArrowBack />
        </IconButton>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: 'text.secondary',
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' }
            }}
            onClick={() => navigate(isCandidate ? '/admin/tools/candidate-users' : '/admin/organizations')}
          >
            {isCandidate ? 'Candidate User' : 'Organization Management'}
          </Typography>
          <ChevronRight sx={{ color: 'text.secondary' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {userFullName}
          </Typography>
        </Stack>
      </Box>

      {/* Main Content - Two Column Layout */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar - Profile + Navigation */}
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: isDarkMode ? 'background.paper' : 'grey.50',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {/* Profile Section */}
          <Box sx={{ p: 3, textAlign: 'center' }}>
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfilePictureChange}
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: 'none' }}
            />
            
            {/* Avatar with camera overlay */}
            <Box
              sx={{
                position: 'relative',
                width: 100,
                height: 100,
                mx: 'auto',
                mb: 2,
                cursor: 'pointer',
                '&:hover .camera-overlay': {
                  opacity: 1,
                },
              }}
              onClick={handleProfilePictureClick}
            >
              <Avatar
                src={
                  user.profilePictureUrl 
                    ? (user.profilePictureUrl.startsWith('/api/') ? user.profilePictureUrl : `/api/objects${user.profilePictureUrl.replace('/api/objects', '')}`)
                    : user.profileData?.profilePicture 
                      ? `/api/objects${user.profileData.profilePicture.replace('/api/objects', '')}`
                      : undefined
                }
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: '#A16AE8',
                  fontSize: '2.5rem',
                  fontWeight: 600,
                }}
              >
                {(user.firstName?.[0] || '?').toUpperCase()}{(user.lastName?.[0] || '?').toUpperCase()}
              </Avatar>
              
              {/* Camera icon overlay */}
              <Box
                className="camera-overlay"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid',
                  borderColor: 'background.paper',
                  boxShadow: 1,
                  transition: 'opacity 0.2s ease',
                  opacity: 0.9,
                  '&:hover': {
                    opacity: 1,
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                {uploadingPhoto ? (
                  <CircularProgress size={16} sx={{ color: 'white' }} />
                ) : (
                  <CameraAlt sx={{ fontSize: 16, color: 'white' }} />
                )}
              </Box>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {user.firstName || 'Unknown'} {user.lastName || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>

          <Divider />

          {/* Navigation Tabs */}
          <List sx={{ py: 1, flex: 1 }}>
            {tabs.map((tab) => (
              <ListItemButton
                key={tab.id}
                selected={activeTab === tab.id && tab.id !== 'reset-password' && tab.id !== 'delete'}
                onClick={() => {
                  if (tab.id === 'reset-password') {
                    handleOpenResetPasswordModal();
                  } else if (tab.id === 'delete') {
                    handleOpenDeleteDialog();
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderLeft: activeTab === tab.id && tab.id !== 'reset-password' && tab.id !== 'delete' ? 3 : 0,
                  borderColor: 'primary.main',
                  bgcolor: activeTab === tab.id && tab.id !== 'reset-password' && tab.id !== 'delete'
                    ? (isDarkMode ? 'rgba(124, 58, 237, 0.15)' : 'rgba(124, 58, 237, 0.08)') 
                    : 'transparent',
                  '&:hover': {
                    bgcolor: activeTab === tab.id && tab.id !== 'reset-password' && tab.id !== 'delete'
                      ? (isDarkMode ? 'rgba(124, 58, 237, 0.15)' : 'rgba(124, 58, 237, 0.08)') 
                      : 'action.hover',
                  },
                  ...(tab.id === 'delete' && {
                    color: 'error.main',
                    '& .MuiListItemIcon-root': { color: 'error.main' },
                  }),
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {tab.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={tab.label}
                  primaryTypographyProps={{
                    fontWeight: activeTab === tab.id && tab.id !== 'reset-password' && tab.id !== 'delete' ? 600 : 400,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>

        {/* Right Content Area */}
        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', p: 4 }}>
          {renderTabContent()}
        </Box>
      </Box>

      {/* Reset Password Modal */}
      <Dialog
        open={showResetPasswordModal}
        onClose={handleCloseResetPasswordModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockReset color="primary" />
          Reset Password
        </DialogTitle>
        <DialogContent>
          {resetSuccess && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setResetSuccess(null)}>
              {resetSuccess}
            </Alert>
          )}

          <Stack spacing={3}>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Option 1: Send Password Reset Link
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Send a secure password reset link to {user.email}
              </Typography>
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={sendingResetLink ? <CircularProgress size={16} color="inherit" /> : <Send />}
                onClick={handleSendResetLink}
                disabled={sendingResetLink}
                sx={{ textTransform: 'none' }}
              >
                {sendingResetLink ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </Paper>

            <Divider>
              <Typography variant="body2" color="text.secondary">OR</Typography>
            </Divider>

            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Option 2: Set Password Directly
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Set a new password and securely communicate it to the user.
              </Typography>
              
              {newPassword && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Important: Copy and save this password now!
                  </Typography>
                  <Typography variant="body2">
                    The password will not be shown again after you close this dialog. You must share it securely with the user (e.g., in person, phone call, or encrypted message).
                  </Typography>
                </Alert>
              )}
              
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {newPassword && (
                          <Tooltip title={passwordCopied ? 'Copied!' : 'Copy to clipboard'}>
                            <IconButton onClick={copyPasswordToClipboard} edge="end" size="small">
                              <ContentCopy fontSize="small" color={passwordCopied ? 'success' : 'inherit'} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  helperText="Min 8 chars with uppercase, lowercase, number, and symbol"
                />
                
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={generateStrongPassword}
                    sx={{ textTransform: 'none' }}
                  >
                    Generate
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={settingPassword ? <CircularProgress size={16} color="inherit" /> : <LockReset />}
                    onClick={handleSetPassword}
                    disabled={settingPassword || !newPassword || newPassword.length < 8}
                    sx={{ textTransform: 'none' }}
                  >
                    {settingPassword ? 'Setting...' : 'Set Password'}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseResetPasswordModal} sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <Warning color="error" />
          Delete User Account
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 3 }}>
            This action will permanently delete the user and all associated data. This cannot be undone.
          </Alert>
          
          <DialogContentText sx={{ mb: 2 }}>
            You are about to permanently delete <strong>{userFullName}</strong>.
          </DialogContentText>
          
          <Typography variant="body2" sx={{ mb: 1 }}>
            To confirm deletion, please type the user's email address:
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 600, fontFamily: 'monospace' }}>
            {user.email}
          </Typography>
          
          <TextField
            fullWidth
            label="Confirm email address"
            value={deleteConfirmEmail}
            onChange={(e) => setDeleteConfirmEmail(e.target.value)}
            placeholder={user.email}
            error={deleteConfirmEmail !== '' && deleteConfirmEmail !== user.email}
            helperText={
              deleteConfirmEmail !== '' && deleteConfirmEmail !== user.email
                ? 'Email does not match'
                : ''
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelDelete} disabled={deleting} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting || deleteConfirmEmail.trim() !== user.email}
            startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
            sx={{ textTransform: 'none' }}
          >
            {deleting ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
