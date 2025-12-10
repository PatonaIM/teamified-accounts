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
  useTheme as useMuiTheme,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { profileService } from '../../services/profileService';
import userEmailsService, { type UserEmail } from '../../services/userEmailsService';
import api from '../../services/api';
import { LinkedEmails } from '../../components/account/LinkedEmails';
import { ChangePassword } from '../../components/account/ChangePassword';

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

export default function MyProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showSnackbar } = useSnackbar();
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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const profileResult = await profileService.getProfileData();
      let emailsResult: UserEmail[] = [];
      let emailsFailed = false;
      
      try {
        emailsResult = await userEmailsService.getMyEmails();
      } catch (error) {
        console.error('Failed to load user emails:', error);
        emailsFailed = true;
      }

      try {
        const profileResponse = await api.get('/v1/auth/me/profile');
        if (profileResponse.data.passwordUpdatedAt) {
          setPasswordUpdatedAt(profileResponse.data.passwordUpdatedAt);
        }
      } catch (error) {
        console.error('Failed to load password updated date:', error);
      }
      
      console.log('MyProfilePage: Loaded profile data:', profileResult);
      console.log('MyProfilePage: Loaded user emails:', emailsResult);
      setProfileData(profileResult);
      setUserEmails(emailsResult);
      setEmailsLoadError(emailsFailed);
      setProfilePicture(profileResult.profileData?.profilePicture || null);
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
    return roleType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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

  const handleEmailsUpdated = () => {
    loadProfile();
  };

  const handlePasswordChanged = () => {
    setPasswordUpdatedAt(new Date().toISOString());
    setIsEditMode(false);
    showSnackbar('Password changed successfully', 'success');
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
  
  const workEmailsByOrg = workEmails.reduce((acc, email) => {
    const orgName = email.organization?.name || 'Unknown Organization';
    if (!acc[orgName]) {
      acc[orgName] = [];
    }
    acc[orgName].push(email);
    return acc;
  }, {} as Record<string, UserEmail[]>);

  const organizations = profileData.organizations || [];

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
          <Tooltip title={isEditMode ? 'Cancel editing' : 'Edit account'}>
            <IconButton 
              onClick={() => setIsEditMode(!isEditMode)}
              sx={{ 
                bgcolor: isEditMode ? 'error.main' : 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: isEditMode ? 'error.dark' : 'primary.dark',
                },
              }}
            >
              {isEditMode ? <CloseIcon /> : <EditIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Stack spacing={4}>
          {emailsLoadError && (
            <Alert severity="warning" onClose={() => setEmailsLoadError(false)}>
              Unable to load linked email addresses. Some email information may be incomplete.
            </Alert>
          )}

          {isEditMode ? (
            <>
              <LinkedEmails onEmailsUpdated={handleEmailsUpdated} />
              <Divider />
              <ChangePassword onPasswordChanged={handlePasswordChanged} />
            </>
          ) : (
            <>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <EmailIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Personal Email
                  </Typography>
                </Box>
                
                {personalEmails.length > 0 ? (
                  <Stack spacing={1}>
                    {personalEmails.map(email => (
                      <Box 
                        key={email.id}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        }}
                      >
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
                        {email.isVerified && (
                          <Tooltip title="Verified">
                            <VerifiedIcon color="success" sx={{ fontSize: 18 }} />
                          </Tooltip>
                        )}
                      </Box>
                    ))}
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
              </Box>

              {(workEmails.length > 0 || organizations.length > 0) && (
                <>
                  <Divider />
                  
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <WorkIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Work Emails
                      </Typography>
                    </Box>
                    
                    {Object.keys(workEmailsByOrg).length > 0 ? (
                      <Stack spacing={2}>
                        {Object.entries(workEmailsByOrg).map(([orgName, emails]) => (
                          <Box key={orgName}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {orgName}
                              </Typography>
                            </Box>
                            <Stack spacing={1} sx={{ pl: 3 }}>
                              {emails.map(email => (
                                <Box 
                                  key={email.id}
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                  }}
                                >
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
                                  {email.isVerified && (
                                    <Tooltip title="Verified">
                                      <VerifiedIcon color="success" sx={{ fontSize: 18 }} />
                                    </Tooltip>
                                  )}
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No work emails linked yet
                      </Typography>
                    )}
                  </Box>
                </>
              )}

              <Divider />

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LockIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Password
                  </Typography>
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
                  <Stack spacing={2}>
                    {organizations.map(org => (
                      <Box 
                        key={org.organizationId}
                        sx={{ 
                          p: 2,
                          borderRadius: 2,
                          bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                          border: '1px solid',
                          borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
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
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {org.organizationName}
                            </Typography>
                          </Box>
                          <Chip 
                            label={formatRoleType(org.roleType)} 
                            size="small" 
                            color="primary"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                ) : profileData.roles && profileData.roles.length > 0 ? (
                  <Box 
                    sx={{ 
                      p: 2,
                      borderRadius: 2,
                      bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    }}
                  >
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {profileData.roles.map((role, index) => (
                        <Chip 
                          key={index}
                          label={formatRoleType(role)} 
                          size="small" 
                          color="primary"
                          sx={{ fontWeight: 500 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No organizational roles assigned
                  </Typography>
                )}
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
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
