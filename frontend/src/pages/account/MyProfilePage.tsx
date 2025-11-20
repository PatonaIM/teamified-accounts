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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { profileService } from '../../services/profileService';
import axios from 'axios';

interface ProfileData {
  id?: string;
  emailAddress?: string;
  firstName?: string;
  lastName?: string;
  profileData?: {
    secondaryEmail?: string;
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
  
  // Form state
  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
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
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSecondaryEmail(profileData?.profileData?.secondaryEmail || '');
    setProfilePicture(profileData?.profileData?.profilePicture || null);
  };

  const handleProfilePictureClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showSnackbar('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('Image size must be less than 5MB', 'error');
      return;
    }

    try {
      setUploadingPicture(true);

      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('teamified_access_token');
      const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

      const response = await axios.post(`${baseURL}/v1/users/me/profile-picture`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const newProfilePictureUrl = response.data.profilePicture;
      setProfilePicture(newProfilePictureUrl);
      
      // Update local state
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

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);

      // Update profile via API with proper authorization
      const token = localStorage.getItem('teamified_access_token');
      const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
      
      await axios.put(`${baseURL}/v1/users/me/profile`, {
        profileData: {
          secondaryEmail: secondaryEmail || null,
        },
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Update local state without reloading the entire profile
      setProfileData(prev => prev ? {
        ...prev,
        profileData: {
          ...prev.profileData,
          secondaryEmail: secondaryEmail || undefined,
        },
      } : prev);

      showSnackbar('Profile updated successfully', 'success');
      setIsEditing(false);
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
  
  // Get initials from first and last name
  const getInitials = () => {
    const firstName = profileData.firstName || '';
    const lastName = profileData.lastName || '';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    return initials || 'U';
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
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* User Header with Edit Icons */}
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
          
          {/* Edit/Cancel/Save Icons */}
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
                <Tooltip title="Save Changes">
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

        {/* Email Addresses Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Email Addresses
          </Typography>
          
          {/* Primary Email */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Primary Email
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                value={profileData.emailAddress || ''}
                disabled
                size="small"
                variant="outlined"
                sx={{ 
                  '& .MuiInputBase-input.Mui-disabled': { 
                    WebkitTextFillColor: 'text.secondary',
                  } 
                }}
              />
            ) : (
              <Typography variant="body1">{profileData.emailAddress}</Typography>
            )}
          </Box>

          {/* Secondary Email */}
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
                helperText="This can be used for account recovery"
              />
            ) : (
              <Typography variant="body1" color={profileData.profileData?.secondaryEmail ? 'text.primary' : 'text.secondary'}>
                {profileData.profileData?.secondaryEmail || 'Not set'}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Account Information Section */}
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
