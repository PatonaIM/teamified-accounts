import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../services/authService';
import { profileService } from '../../services/profileService';

interface ProfileData {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileData?: {
    secondaryEmail?: string;
  };
  roles?: string[];
}

export default function MyProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const data = await profileService.getProfileData();
        setProfileData(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const handleEditProfile = () => {
    // Navigate to edit profile page (to be implemented)
    console.log('Edit profile clicked');
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
  const secondaryEmail = profileData.profileData?.secondaryEmail;

  return (
    <Box sx={{ p: 4, maxWidth: 900 }}>
      {/* User Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: '#90CAF9',
            fontSize: '2rem',
            fontWeight: 600,
            color: '#1E1E1E',
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ ml: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {profileData.email}
          </Typography>
        </Box>
      </Box>

      {/* Email Addresses Section */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Email Addresses
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Primary Email
          </Typography>
          <Typography variant="body1">{profileData.email}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Secondary Email
          </Typography>
          <Typography variant="body1" color={secondaryEmail ? 'text.primary' : 'text.secondary'}>
            {secondaryEmail || 'Not set'}
          </Typography>
        </Box>
      </Paper>

      {/* Account Information Section */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Account Information
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            User ID
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
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
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={handleEditProfile}
          sx={{
            flex: 1,
            bgcolor: '#90CAF9',
            color: '#000',
            '&:hover': {
              bgcolor: '#64B5F6',
            },
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Edit Profile
        </Button>
        <Button
          variant="outlined"
          onClick={handleSignOut}
          sx={{
            flex: 1,
            borderColor: '#f44336',
            color: '#f44336',
            '&:hover': {
              borderColor: '#d32f2f',
              bgcolor: 'rgba(244, 67, 54, 0.04)',
            },
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Sign Out
        </Button>
      </Box>

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
    </Box>
  );
}
