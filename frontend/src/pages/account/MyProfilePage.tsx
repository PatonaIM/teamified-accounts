import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Button,
  CircularProgress,
  TextField,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../services/authService';
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

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
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

      // Update profile via API
      await axios.put('/api/v1/users/me/profile', {
        profileData: {
          secondaryEmail: secondaryEmail || null,
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
        {/* User Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
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
              {isEditing 
                ? 'Click "Save Changes" to update profile details' 
                : profileData.emailAddress}
            </Typography>
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

        {/* Action Buttons */}
        {isEditing ? (
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              onClick={handleCancelEdit}
              disabled={isSaving}
              sx={{
                flex: 1,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                borderColor: 'rgba(161, 106, 232, 0.5)',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(161, 106, 232, 0.04)',
                  boxShadow: '0 2px 8px rgba(161, 106, 232, 0.2)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveChanges}
              disabled={isSaving}
              sx={{
                flex: 1,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #A16AE8 0%, #8096FD 100%)',
                boxShadow: '0 4px 15px rgba(161, 106, 232, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8B5AE8 0%, #6B86FD 100%)',
                  boxShadow: '0 6px 20px rgba(161, 106, 232, 0.4)',
                },
              }}
            >
              {isSaving ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Save Changes'}
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              onClick={handleEditClick}
              sx={{
                flex: 1,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #A16AE8 0%, #8096FD 100%)',
                boxShadow: '0 4px 15px rgba(161, 106, 232, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8B5AE8 0%, #6B86FD 100%)',
                  boxShadow: '0 6px 20px rgba(161, 106, 232, 0.4)',
                },
              }}
            >
              Edit Profile
            </Button>
            <Button
              variant="outlined"
              onClick={handleSignOut}
              sx={{
                flex: 1,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                borderColor: '#f44336',
                color: '#f44336',
                '&:hover': {
                  borderColor: '#d32f2f',
                  bgcolor: 'rgba(244, 67, 54, 0.04)',
                  boxShadow: '0 2px 8px rgba(244, 67, 54, 0.2)',
                },
              }}
            >
              Sign Out
            </Button>
          </Box>
        )}

        {/* Footer Note */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            textAlign: 'center',
            fontStyle: 'italic',
          }}
        >
          This account is used for authentication across multiple applications
        </Typography>
      </Paper>
    </Box>
  );
}
