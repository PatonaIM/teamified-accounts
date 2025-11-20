import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  CircularProgress,
  TextField,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [secondaryEmail, setSecondaryEmail] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await profileService.getProfileData();
      setProfileData(data);
      setSecondaryEmail(data.profileData?.secondaryEmail || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };


  const handleEditClick = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSecondaryEmail(profileData?.profileData?.secondaryEmail || '');
    setError(null);
    setSuccess(null);
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      // Update profile via API with proper authorization
      const token = localStorage.getItem('teamified_access_token');
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      
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

      // Reload profile data
      await loadProfile();
      await refreshUser();

      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
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

  return (
    <Box sx={{ p: 2 }}>
      <Paper
        sx={{
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 6,
        }}
      >
        {/* User Header with Edit Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: '#90CAF9',
                fontSize: '1.75rem',
                fontWeight: 600,
                color: '#1E1E1E',
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
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

        {/* Success/Error Messages */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

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
