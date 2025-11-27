import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  CircularProgress,
  TextField,
  IconButton,
  Tooltip,
  Badge,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import WarningIcon from '@mui/icons-material/Warning';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { profileService } from '../../services/profileService';
import api from '../../services/api';

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
}

export default function MyProfilePage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [primaryEmailChanged, setPrimaryEmailChanged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await profileService.getProfileData();
      console.log('MyProfilePage: Loaded profile data:', data);
      console.log('MyProfilePage: Profile roles:', data.roles);
      console.log('MyProfilePage: Profile id:', data.id);
      console.log('MyProfilePage: Secondary email from backend:', data.profileData?.secondaryEmail);
      setProfileData(data);
      setPrimaryEmail(data.emailAddress || '');
      setSecondaryEmail(data.profileData?.secondaryEmail || '');
      setProfilePicture(data.profileData?.profilePicture || null);
    } catch (error) {
      console.error('Failed to load profile:', error);
      showSnackbar('Failed to load profile data', 'error');
    } finally {
      setIsLoading(false);
    }
  };


  const handleEditClick = () => {
    setIsEditing(true);
    setPrimaryEmailChanged(false);
    setEmailError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPrimaryEmail(profileData?.emailAddress || '');
    setSecondaryEmail(profileData?.profileData?.secondaryEmail || '');
    setProfilePicture(profileData?.profileData?.profilePicture || null);
    setEmailError(null);
    setPrimaryEmailChanged(false);
  };

  const handleProfilePictureClick = () => {
    if (isEditing && fileInputRef.current) {
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

  const validateEmail = (email: string): boolean => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateEmails = (): boolean => {
    const trimmedPrimary = primaryEmail.trim();
    const trimmedSecondary = secondaryEmail.trim();

    if (!trimmedPrimary && !trimmedSecondary) {
      setEmailError('At least one email address is required');
      return false;
    }

    if (trimmedPrimary && !validateEmail(trimmedPrimary)) {
      setEmailError('Please enter a valid primary email address');
      return false;
    }

    if (trimmedSecondary && !validateEmail(trimmedSecondary)) {
      setEmailError('Please enter a valid secondary email address');
      return false;
    }

    setEmailError(null);
    return true;
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && isEditing && !isSaving) {
      event.preventDefault();
      handleSaveChanges();
    }
  };

  const handlePrimaryEmailChange = (value: string) => {
    setPrimaryEmail(value);
    const originalPrimary = profileData?.emailAddress || '';
    setPrimaryEmailChanged(value.trim() !== originalPrimary.trim());
  };

  const handleSaveChanges = async () => {
    if (!validateEmails()) {
      return;
    }

    try {
      setIsSaving(true);

      let finalPrimaryEmail = primaryEmail.trim();
      let finalSecondaryEmail = secondaryEmail.trim();

      if (!finalPrimaryEmail && finalSecondaryEmail) {
        finalPrimaryEmail = finalSecondaryEmail;
        finalSecondaryEmail = '';
      }

      const originalPrimaryEmail = profileData?.emailAddress || '';
      const isPrimaryEmailUpdated = finalPrimaryEmail !== originalPrimaryEmail;

      if (isPrimaryEmailUpdated) {
        await api.put('/v1/users/me/email', {
          email: finalPrimaryEmail,
          secondaryEmail: finalSecondaryEmail || null,
        });
      } else {
        await api.put('/v1/users/me/profile', {
          profileData: {
            secondaryEmail: finalSecondaryEmail || null,
          },
        });
      }

      setProfileData(prev => prev ? {
        ...prev,
        emailAddress: finalPrimaryEmail,
        emailVerified: isPrimaryEmailUpdated ? false : prev.emailVerified,
        profileData: {
          ...prev.profileData,
          secondaryEmail: finalSecondaryEmail || undefined,
        },
      } : prev);

      setPrimaryEmail(finalPrimaryEmail);
      setSecondaryEmail(finalSecondaryEmail);

      if (isPrimaryEmailUpdated) {
        showSnackbar('Email updated. Please check your inbox to verify your new email address.', 'success');
        if (refreshUser) {
          await refreshUser();
        }
      } else {
        showSnackbar('Profile updated successfully', 'success');
      }
      
      setIsEditing(false);
      setPrimaryEmailChanged(false);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      showSnackbar(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
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

  return (
    <Box sx={{ p: 2 }} onKeyDown={handleKeyDown}>
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
                isEditing ? (
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
                ) : null
              }
            >
              <Avatar
                src={profilePicture || undefined}
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: profilePicture ? 'transparent' : '#90CAF9',
                  fontSize: '1.75rem',
                  fontWeight: 600,
                  color: '#1E1E1E',
                  cursor: isEditing ? 'pointer' : 'default',
                }}
                onClick={isEditing ? handleProfilePictureClick : undefined}
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
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isEditing ? (
              <>
                <Tooltip title="Cancel">
                  <IconButton
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Save Changes (or press Enter)">
                  <IconButton
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'rgba(161, 106, 232, 0.08)',
                      },
                    }}
                  >
                    {isSaving ? <CircularProgress size={24} /> : <CheckIcon />}
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Edit Profile">
                <IconButton
                  onClick={handleEditClick}
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(161, 106, 232, 0.08)',
                    },
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {emailError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {emailError}
          </Alert>
        )}

        {isEditing && primaryEmailChanged && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
            Changing your primary email will require email verification. You will need to verify the new email address before you can continue using your account.
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Email Addresses
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Primary Email
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                value={primaryEmail}
                onChange={(e) => handlePrimaryEmailChange(e.target.value)}
                placeholder="Enter primary email address"
                size="small"
                variant="outlined"
                type="email"
                helperText="This is your main account email used for login"
              />
            ) : (
              <Typography variant="body1">{profileData.emailAddress}</Typography>
            )}
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Secondary Email (Optional)
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                value={secondaryEmail}
                onChange={(e) => setSecondaryEmail(e.target.value)}
                placeholder="Enter secondary email address"
                size="small"
                variant="outlined"
                type="email"
                helperText="This can be used for account recovery. If primary email is empty, this will become your primary email."
              />
            ) : (
              <Typography variant="body1" color={profileData.profileData?.secondaryEmail ? 'text.primary' : 'text.secondary'}>
                {profileData.profileData?.secondaryEmail || 'Not set'}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
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
          
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Roles
            </Typography>
            <Typography variant="body1">
              {profileData.roles && profileData.roles.length > 0 
                ? profileData.roles.join(', ') 
                : 'No roles assigned'}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
