import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge,
  Chip,
  Stack,
  Divider,
  Alert,
  Button,
  TextField,
  LinearProgress,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme as useMuiTheme,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import AppsIcon from '@mui/icons-material/Apps';
import HistoryIcon from '@mui/icons-material/History';
import LoginIcon from '@mui/icons-material/Login';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DevicesIcon from '@mui/icons-material/Devices';
import FilterListIcon from '@mui/icons-material/FilterList';
import TimelineIcon from '@mui/icons-material/Timeline';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { profileService } from '../../services/profileService';
import userEmailsService, { type UserEmail } from '../../services/userEmailsService';
import api from '../../services/api';

interface Organization {
  organizationId: string;
  organizationName: string;
  organizationSlug?: string;
  organizationLogoUrl?: string | null;
  roleType: string;
  joinedAt?: string;
}

interface ProfileData {
  id?: string;
  emailAddress?: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  profileData?: {
    secondaryEmail?: string;
    profilePicture?: string;
  };
  roles?: string[];
  organizations?: Organization[];
  passwordUpdatedAt?: string | null;
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
  connectedApps: Array<{
    oauthClientId: string;
    appName: string;
    firstLoginAt: string;
    lastLoginAt: string;
    loginCount: number;
    activities: Array<{
      id: string;
      action: string;
      feature?: string;
      description?: string;
      createdAt: string;
    }>;
    topFeatures: Array<{
      feature: string;
      count: number;
    }>;
  }>;
}

export default function MyProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const theme = useMuiTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userEmails, setUserEmails] = useState<UserEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [emailsLoadError, setEmailsLoadError] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [passwordUpdatedAt, setPasswordUpdatedAt] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showAddEmailInput, setShowAddEmailInput] = useState(false);
  const [newEmailAddress, setNewEmailAddress] = useState('');
  const [submittingEmail, setSubmittingEmail] = useState(false);
  
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null);
  const [editingEmailValue, setEditingEmailValue] = useState('');
  const [updatingEmail, setUpdatingEmail] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityTimeRange, setActivityTimeRange] = useState<string>('7d');
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());

  const isInitialMount = useRef(true);

  useEffect(() => {
    loadProfile();
    fetchMyActivity();
  }, []);

  useEffect(() => {
    // Skip the initial mount (already fetched above)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchMyActivity();
  }, [activityTimeRange]);

  const fetchMyActivity = async () => {
    setActivityLoading(true);
    try {
      const response = await api.get('/v1/users/me/activity', {
        params: { timeRange: activityTimeRange }
      });
      setActivity(response.data);
    } catch (err) {
      console.warn('Failed to load user activity:', err);
      setActivity({
        loginHistory: [],
        lastAppsUsed: [],
        recentActions: [],
        connectedApps: [],
      });
    } finally {
      setActivityLoading(false);
    }
  };

  const getDeviceIcon = (userAgent: string): string => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'Mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'Tablet';
    }
    if (ua.includes('windows')) {
      return 'Windows';
    }
    if (ua.includes('mac')) {
      return 'Mac';
    }
    if (ua.includes('linux')) {
      return 'Linux';
    }
    return 'Unknown';
  };

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      
      // Track whether email fetch actually failed
      let emailsFetchFailed = false;
      
      // Run all API calls in parallel for faster loading
      const [profileResult, emailsResult, passwordResult] = await Promise.all([
        profileService.getProfileData(),
        userEmailsService.getMyEmails().catch((error) => {
          console.error('Failed to load user emails:', error);
          emailsFetchFailed = true;
          return [] as UserEmail[];
        }),
        api.get('/v1/auth/me/profile').catch((error) => {
          console.error('Failed to load password updated date:', error);
          return { data: {} };
        }),
      ]);
      
      if (passwordResult.data?.passwordUpdatedAt) {
        setPasswordUpdatedAt(passwordResult.data.passwordUpdatedAt);
      }
      
      setProfileData(profileResult);
      setUserEmails(emailsResult);
      setEmailsLoadError(emailsFetchFailed);
      setProfilePicture(profileResult.profileData?.profilePicture || null);
      console.log('MyProfilePage: Loaded profile data:', profileResult);
      console.log('MyProfilePage: Loaded user emails:', emailsResult);
    } catch (error) {
      console.error('Failed to load profile:', error);
      showSnackbar('Failed to load profile data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showSnackbar('Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('Image size must be less than 5MB', 'error');
      return;
    }

    try {
      setUploadingPicture(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/v1/users/me/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newProfilePictureUrl = response.data.profilePictureUrl;
      setProfilePicture(newProfilePictureUrl);
      
      setProfileData(prev => prev ? {
        ...prev,
        profileData: {
          ...prev.profileData,
          profilePicture: newProfilePictureUrl,
        },
      } : prev);

      showSnackbar('Profile picture updated successfully', 'success');
    } catch (error: any) {
      console.error('Failed to upload profile picture:', error);
      showSnackbar(error.response?.data?.message || 'Failed to upload profile picture', 'error');
    } finally {
      setUploadingPicture(false);
    }
  };

  const formatRoleType = (roleType: string): string => {
    const acronyms = ['hr', 'it', 'ceo', 'cto', 'cfo', 'coo', 'vp', 'svp', 'evp', 'api', 'sso', 'id'];
    return roleType
      .split('_')
      .map(word => {
        const lowerWord = word.toLowerCase();
        if (acronyms.includes(lowerWord)) {
          return word.toUpperCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  const formatPasswordUpdatedDate = (dateStr: string | null): string => {
    if (!dateStr) {
      return 'Never changed';
    }
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown';
    }
  };

  const handleAddEmail = async () => {
    if (!newEmailAddress.trim()) return;
    
    try {
      setSubmittingEmail(true);
      await userEmailsService.addEmail({
        email: newEmailAddress.trim(),
        emailType: 'personal',
      });
      showSnackbar('Email added successfully. Please check your inbox for verification.', 'success');
      setNewEmailAddress('');
      setShowAddEmailInput(false);
      await loadProfile();
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to add email', 'error');
    } finally {
      setSubmittingEmail(false);
    }
  };

  const handleRemoveEmail = async (emailId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to remove ${email}?`)) return;
    
    try {
      await userEmailsService.removeEmail(emailId);
      showSnackbar('Email removed successfully', 'success');
      await loadProfile();
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to remove email', 'error');
    }
  };

  const handleSetPrimary = async (emailId: string) => {
    try {
      await userEmailsService.setPrimaryEmail(emailId);
      showSnackbar('Primary email updated successfully', 'success');
      await loadProfile();
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to set primary email', 'error');
    }
  };

  const handleResendVerification = async (emailId: string) => {
    try {
      await userEmailsService.resendVerification(emailId);
      showSnackbar('Verification email sent successfully', 'success');
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to send verification email', 'error');
    }
  };

  const handleStartEditEmail = (email: UserEmail) => {
    setEditingEmailId(email.id);
    setEditingEmailValue(email.email);
  };

  const handleCancelEditEmail = () => {
    setEditingEmailId(null);
    setEditingEmailValue('');
  };

  const handleUpdateEmail = async () => {
    if (!editingEmailId || !editingEmailValue.trim()) return;
    
    try {
      setUpdatingEmail(true);
      await userEmailsService.updateEmail(editingEmailId, editingEmailValue.trim());
      showSnackbar('Email updated successfully. Please check your inbox for verification.', 'success');
      setEditingEmailId(null);
      setEditingEmailValue('');
      await loadProfile();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || err.message || 'Failed to update email', 'error');
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleChangePassword = async (): Promise<boolean> => {
    setPasswordError(null);
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return false;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return false;
    }
    
    try {
      setChangingPassword(true);
      await api.post('/v1/auth/change-password', {
        oldPassword: currentPassword,
        newPassword: newPassword,
      });
      showSnackbar('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordUpdatedAt(new Date().toISOString());
      setPasswordModalOpen(false);
      return true;
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
      return false;
    } finally {
      setChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profileData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Failed to load profile data</Typography>
      </Box>
    );
  }

  const displayName = `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'User';
  
  const getInitials = () => {
    const firstName = profileData.firstName || '';
    const lastName = profileData.lastName || '';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    return initials || 'U';
  };

  const personalEmails = userEmails.filter(e => e.emailType === 'personal');
  const workEmails = userEmails.filter(e => e.emailType === 'work');
  
  const workEmailsByOrgId = workEmails.reduce((acc, email) => {
    const orgId = email.organization?.id || email.organizationId || 'unknown';
    if (!acc[orgId]) {
      acc[orgId] = [];
    }
    acc[orgId].push(email);
    return acc;
  }, {} as Record<string, UserEmail[]>);

  const organizations = profileData.organizations || [];

  const renderEmailRow = (email: UserEmail) => {
    const isEditing = editingEmailId === email.id;
    const isPersonalEmail = email.emailType === 'personal';
    
    if (isEditing && isPersonalEmail) {
      return (
        <Box 
          key={email.id}
          sx={{ 
            p: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'primary.main',
            bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              size="small"
              label="Email Address"
              type="email"
              value={editingEmailValue}
              onChange={(e) => setEditingEmailValue(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && editingEmailValue.trim()) {
                  handleUpdateEmail();
                } else if (e.key === 'Escape') {
                  handleCancelEditEmail();
                }
              }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleUpdateEmail}
              disabled={!editingEmailValue.trim() || updatingEmail}
              sx={{ minWidth: 80 }}
            >
              {updatingEmail ? <CircularProgress size={20} /> : 'Save'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancelEditEmail}
            >
              Cancel
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Changing the email will require re-verification.
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box 
        key={email.id}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: 1,
          p: 1.5,
          borderRadius: 2,
          bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body1">{email.email}</Typography>
          {email.isPrimary && (
            <Chip 
              icon={<StarIcon sx={{ fontSize: 14 }} />} 
              label="Primary" 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ height: 24 }}
            />
          )}
          {email.isVerified ? (
            <Tooltip title="Verified">
              <VerifiedIcon color="success" sx={{ fontSize: 18 }} />
            </Tooltip>
          ) : (
            <Chip label="Unverified" size="small" color="warning" sx={{ height: 24 }} />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isPersonalEmail && (
            <Tooltip title="Edit email">
              <IconButton size="small" onClick={() => handleStartEditEmail(email)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {!email.isVerified && (
            <Tooltip title="Resend verification email">
              <IconButton size="small" onClick={() => handleResendVerification(email.id)}>
                <SendIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {!email.isPrimary && email.isVerified && (
            <Tooltip title="Set as primary">
              <IconButton size="small" onClick={() => handleSetPrimary(email.id)}>
                <StarBorderIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {!email.isPrimary && (
            <Tooltip title="Remove email">
              <IconButton size="small" color="error" onClick={() => handleRemoveEmail(email.id, email.email)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper
        sx={{
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 6,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton
                  onClick={handleProfilePictureClick}
                  disabled={uploadingPicture}
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  {uploadingPicture ? (
                    <CircularProgress size={16} sx={{ color: 'white' }} />
                  ) : (
                    <PhotoCameraIcon sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
              }
            >
              <Avatar
                src={profilePicture || undefined}
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: profilePicture ? 'transparent' : (isDarkMode ? '#7C3AED' : '#90CAF9'),
                  fontSize: '1.75rem',
                  fontWeight: 600,
                  color: isDarkMode ? '#FFFFFF' : '#1E1E1E',
                  cursor: 'pointer',
                }}
                onClick={handleProfilePictureClick}
              >
                {!profilePicture && getInitials()}
              </Avatar>
            </Badge>
            <Box sx={{ ml: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profileData.emailAddress}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Stack spacing={4}>
          {emailsLoadError && (
            <Alert severity="warning" onClose={() => setEmailsLoadError(false)}>
              Unable to load linked email addresses. Some email information may be incomplete.
            </Alert>
          )}

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Personal Email
                </Typography>
              </Box>
              {!showAddEmailInput && (
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setShowAddEmailInput(true)}
                >
                  Add Email
                </Button>
              )}
            </Box>
            
            {personalEmails.length > 0 ? (
              <Stack spacing={1}>
                {personalEmails.map(email => renderEmailRow(email))}
              </Stack>
            ) : (
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                }}
              >
                <Typography variant="body1">{profileData.emailAddress}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Primary account email
                </Typography>
              </Box>
            )}
            
            {showAddEmailInput && (
              <Box 
                sx={{ 
                  mt: 2,
                  p: 2, 
                  borderRadius: 2, 
                  border: '1px dashed',
                  borderColor: 'primary.main',
                  bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="New Email Address"
                    type="email"
                    value={newEmailAddress}
                    onChange={(e) => setNewEmailAddress(e.target.value)}
                    placeholder="Enter email address"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newEmailAddress.trim()) {
                        handleAddEmail();
                      } else if (e.key === 'Escape') {
                        setShowAddEmailInput(false);
                        setNewEmailAddress('');
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAddEmail}
                    disabled={!newEmailAddress.trim() || submittingEmail}
                    sx={{ minWidth: 80 }}
                  >
                    {submittingEmail ? <CircularProgress size={20} /> : 'Add'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setShowAddEmailInput(false);
                      setNewEmailAddress('');
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  A verification email will be sent to confirm this address.
                </Typography>
              </Box>
            )}
          </Box>

          <Divider />

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Password
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => setPasswordModalOpen(true)}
              >
                Change Password
              </Button>
            </Box>
            
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Last updated: {formatPasswordUpdatedDate(passwordUpdatedAt)}
              </Typography>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SecurityIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Organizational Access
              </Typography>
            </Box>
            
            {organizations.length > 0 ? (
              <Stack spacing={1.5}>
                {organizations.map(org => {
                  const orgWorkEmails = workEmailsByOrgId[org.organizationId] || [];
                  const workEmail = orgWorkEmails.length > 0 ? orgWorkEmails[0].email : null;
                  return (
                    <Box 
                      key={org.organizationId}
                      onClick={() => org.organizationSlug && navigate(`/organization/${org.organizationSlug}`)}
                      sx={{ 
                        p: 2,
                        borderRadius: 2,
                        bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        cursor: org.organizationSlug ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        '&:hover': org.organizationSlug ? {
                          bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                        } : {},
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={org.organizationLogoUrl || undefined}
                            variant="circular"
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: org.organizationLogoUrl ? 'transparent' : (isDarkMode ? 'primary.dark' : 'primary.light'),
                            }}
                          >
                            {!org.organizationLogoUrl && (
                              <BusinessIcon sx={{ fontSize: 24, color: isDarkMode ? 'white' : 'primary.main' }} />
                            )}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {org.organizationName}
                            </Typography>
                            {workEmail && (
                              <Typography variant="body2" color="text.secondary">
                                {workEmail}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Chip 
                          label={formatRoleType(org.roleType)} 
                          size="small" 
                          color="primary"
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No organizational access. Accept pending invitations to join organizations.
              </Typography>
            )}
          </Box>

          <Divider />

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Activity Stats
                </Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel id="activity-time-range-label">
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <FilterListIcon fontSize="small" />
                      <span>Range</span>
                    </Stack>
                  </InputLabel>
                  <Select
                    labelId="activity-time-range-label"
                    value={activityTimeRange}
                    label="Range"
                    onChange={(e) => setActivityTimeRange(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="1h">Last 1 hour</MenuItem>
                    <MenuItem value="3h">Last 3 hours</MenuItem>
                    <MenuItem value="6h">Last 6 hours</MenuItem>
                    <MenuItem value="12h">Last 12 hours</MenuItem>
                    <MenuItem value="24h">Last 24 hours</MenuItem>
                    <MenuItem value="3d">Last 3 days</MenuItem>
                    <MenuItem value="7d">Last week</MenuItem>
                    <MenuItem value="30d">Last 30 days</MenuItem>
                  </Select>
                </FormControl>
                <IconButton
                  size="small"
                  onClick={() => fetchMyActivity()}
                  disabled={activityLoading}
                >
                  {activityLoading ? <CircularProgress size={18} /> : <RefreshIcon fontSize="small" />}
                </IconButton>
              </Stack>
            </Box>

            {activityLoading && <LinearProgress sx={{ mb: 2 }} />}

            <Stack spacing={3}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <AppsIcon fontSize="small" color="primary" />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Connected Applications
                  </Typography>
                </Stack>
                
                {activity?.connectedApps && activity.connectedApps.length > 0 ? (
                  <Stack spacing={1.5}>
                    {activity.connectedApps.map((app) => {
                      const isExpanded = expandedApps.has(app.oauthClientId);
                      const toggleExpand = () => {
                        setExpandedApps(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(app.oauthClientId)) {
                            newSet.delete(app.oauthClientId);
                          } else {
                            newSet.add(app.oauthClientId);
                          }
                          return newSet;
                        });
                      };
                      
                      return (
                        <Paper 
                          key={app.oauthClientId} 
                          variant="outlined" 
                          sx={{ 
                            overflow: 'hidden',
                            bgcolor: isDarkMode ? 'background.default' : 'grey.50',
                          }}
                        >
                          <Box
                            onClick={toggleExpand}
                            sx={{
                              p: 1.5,
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: isDarkMode ? 'action.hover' : 'grey.100',
                              },
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: 'primary.main', 
                                    width: 32, 
                                    height: 32,
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  {app.appName.charAt(0).toUpperCase()}
                                </Avatar>
                                <Stack spacing={0}>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {app.appName}
                                  </Typography>
                                  <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Typography variant="caption" color="text.secondary">
                                      {app.loginCount} login{app.loginCount !== 1 ? 's' : ''}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Last: {formatDistanceToNow(new Date(app.lastLoginAt), { addSuffix: true })}
                                    </Typography>
                                  </Stack>
                                </Stack>
                              </Stack>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                {!isExpanded && app.topFeatures && app.topFeatures.length > 0 && (
                                  <Stack direction="row" spacing={0.5}>
                                    {app.topFeatures.slice(0, 2).map((f, idx) => (
                                      <Chip
                                        key={idx}
                                        label={`${f.feature} (${f.count})`}
                                        size="small"
                                        sx={{ fontSize: '0.65rem', height: 20 }}
                                      />
                                    ))}
                                  </Stack>
                                )}
                                <IconButton size="small">
                                  {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                </IconButton>
                              </Stack>
                            </Stack>
                          </Box>
                          
                          <Collapse in={isExpanded}>
                            <Divider />
                            <Box sx={{ p: 1.5 }}>
                              <Stack direction="row" spacing={3} sx={{ mb: 1 }}>
                                <Stack>
                                  <Typography variant="caption" color="text.secondary">First Login</Typography>
                                  <Typography variant="body2">
                                    {format(new Date(app.firstLoginAt), 'MMM d, yyyy')}
                                  </Typography>
                                </Stack>
                                <Stack>
                                  <Typography variant="caption" color="text.secondary">Total Logins</Typography>
                                  <Typography variant="body2">{app.loginCount}</Typography>
                                </Stack>
                              </Stack>
                              {app.topFeatures && app.topFeatures.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Top Features
                                  </Typography>
                                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                                    {app.topFeatures.map((f, idx) => (
                                      <Chip
                                        key={idx}
                                        label={`${f.feature} (${f.count})`}
                                        size="small"
                                        sx={{ fontSize: '0.7rem' }}
                                      />
                                    ))}
                                  </Stack>
                                </Box>
                              )}
                            </Box>
                          </Collapse>
                        </Paper>
                      );
                    })}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No connected applications found in this time range.
                  </Typography>
                )}
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <LoginIcon fontSize="small" color="primary" />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Login History
                  </Typography>
                </Stack>
                
                {activity?.loginHistory && activity.loginHistory.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Date & Time</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Device</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>IP Address</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activity.loginHistory.slice(0, 10).map((login, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ fontSize: '0.75rem' }}>
                              {format(new Date(login.timestamp), 'MMM d, yyyy h:mm a')}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <DevicesIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
                                <Typography variant="caption">{getDeviceIcon(login.userAgent)}</Typography>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
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
                    No login history available in this time range.
                  </Typography>
                )}
              </Paper>

              {activity?.recentActions && activity.recentActions.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <TimelineIcon fontSize="small" color="primary" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Recent Activity
                    </Typography>
                  </Stack>
                  <Stack spacing={0.5}>
                    {activity.recentActions.slice(0, 8).map((action, index) => (
                      <Stack key={index} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.5 }}>
                        <Typography variant="caption" sx={{ flex: 1 }}>
                          {action.action.replace(/_/g, ' ')} - {action.entityType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                          {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true })}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Account Information
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                User ID
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {profileData.id}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      <Dialog 
        open={passwordModalOpen} 
        onClose={() => {
          setPasswordModalOpen(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordError(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon color="primary" />
          Change Password
        </DialogTitle>
        <DialogContent>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }} onClose={() => setPasswordError(null)}>
              {passwordError}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              size="small"
              autoFocus
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setPasswordModalOpen(false);
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setPasswordError(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
          >
            {changingPassword ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
