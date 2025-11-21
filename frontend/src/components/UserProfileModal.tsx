/**
 * User Profile Modal
 *
 * Admin/HR modal for creating and editing user profiles.
 * Uses ProfileTabsManager for consistency with Profile page and Onboarding.
 * Supports both creating new users and editing existing users.
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Avatar,
  Alert,
  TextField,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Close as CloseIcon, PersonAdd as PersonAddIcon, VerifiedUser as VerifiedUserIcon } from '@mui/icons-material';
import ProfileTabsManager from './profile/ProfileTabsManager';
import userService, { type User } from '../services/userService';
import type { ProfileData } from './profile/shared/types';
import { profileService } from '../services/profileService';

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null; // null = create new user
  onProfileUpdated?: (updatedProfile?: ProfileData) => void;
  mode?: 'create' | 'edit';
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  open,
  onClose,
  user,
  onProfileUpdated,
  mode: propMode,
}) => {
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  // Form data for creating new user
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Determine mode: create or edit
  const mode = propMode || (user ? 'edit' : 'create');
  const isEditMode = mode === 'edit' && (user || newUserId);

  const handleSave = async (profileData: ProfileData, tabName: string) => {
    const targetUserId = newUserId || user?.id;
    if (!targetUserId) return;

    try {
      // Save profile data for the specific user (admin editing another user)
      const updatedProfile = await profileService.updateUserProfileData(targetUserId, profileData);

      setSaveStatus({
        type: 'success',
        message: `${tabName} updated successfully!`
      });

      // Notify parent component
      onProfileUpdated?.(updatedProfile);

      // Clear status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Failed to save user profile:', error);
      setSaveStatus({
        type: 'error',
        message: 'Failed to save changes. Please try again.'
      });
    }
  };

  const handleCreateUser = async () => {
    // Validate form
    const errors: Record<string, string> = {};
    if (!createForm.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(createForm.email)) errors.email = 'Invalid email format';

    if (!createForm.password) errors.password = 'Password is required';
    else if (createForm.password.length < 8) errors.password = 'Password must be at least 8 characters';

    if (!createForm.firstName) errors.firstName = 'First name is required';
    if (!createForm.lastName) errors.lastName = 'Last name is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setCreatingUser(true);
    try {
      const newUser = await userService.createUser(createForm);
      setNewUserId(newUser.id);
      setSaveStatus({
        type: 'success',
        message: 'User created successfully! Now complete their profile.'
      });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error: any) {
      console.error('Failed to create user:', error);
      setSaveStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to create user. Please try again.'
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!displayUser) return;

    setVerifyingEmail(true);
    try {
      await userService.markEmailVerified(displayUser.id);
      setSaveStatus({
        type: 'success',
        message: 'Email marked as verified successfully!'
      });

      // Refresh user data
      onProfileUpdated?.();

      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error: any) {
      console.error('Failed to verify email:', error);
      setSaveStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to verify email. Please try again.'
      });
    } finally {
      setVerifyingEmail(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const displayUser = user || (newUserId ? { id: newUserId, firstName: createForm.firstName, lastName: createForm.lastName, email: createForm.email, status: 'active', roles: [] } as User : null);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isEditMode ? "xl" : "md"}
      fullWidth
      PaperProps={{
        sx: {
          minHeight: isEditMode ? '90vh' : 'auto',
          borderRadius: 3,
          bgcolor: 'background.paper',
        }
      }}
    >
      <DialogTitle sx={{
        bgcolor: (theme) => 
          theme.palette.mode === 'dark' 
            ? alpha(theme.palette.primary.main, 0.1) 
            : alpha(theme.palette.primary.main, 0.05),
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isEditMode && displayUser ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 56,
                  height: 56,
                  fontSize: '1.25rem',
                  fontWeight: 600,
                }}
              >
                {getInitials(displayUser.firstName || '', displayUser.lastName || '')}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {displayUser.firstName} {displayUser.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {displayUser.email}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                  <Chip
                    label={displayUser.status}
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      bgcolor: (theme) => {
                        const statusColor = displayUser.status === 'active' ? theme.palette.success.main :
                          displayUser.status === 'inactive' ? theme.palette.warning.main : theme.palette.grey[500];
                        return theme.palette.mode === 'dark' 
                          ? alpha(statusColor, 0.2) 
                          : alpha(statusColor, 0.1);
                      },
                      color: displayUser.status === 'active' ? 'success.main' : 
                        displayUser.status === 'inactive' ? 'warning.main' : 'text.secondary',
                      border: '1px solid',
                      borderColor: displayUser.status === 'active' ? 'success.main' : 
                        displayUser.status === 'inactive' ? 'warning.main' : 'divider',
                    }}
                  />
                  {displayUser.roles?.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: 'primary.main', color: 'primary.main' }}
                    />
                  ))}
                  {displayUser.emailVerified ? (
                    <Chip
                      label="Email Verified"
                      size="small"
                      icon={<VerifiedUserIcon />}
                      sx={{ 
                        fontWeight: 600,
                        bgcolor: (theme) => 
                          theme.palette.mode === 'dark' 
                            ? alpha(theme.palette.success.main, 0.2) 
                            : alpha(theme.palette.success.main, 0.1),
                        color: 'success.main',
                        border: '1px solid',
                        borderColor: 'success.main',
                      }}
                    />
                  ) : (
                    <Button
                      onClick={handleVerifyEmail}
                      disabled={verifyingEmail}
                      size="small"
                      variant="outlined"
                      startIcon={verifyingEmail ? <CircularProgress size={16} /> : <VerifiedUserIcon />}
                      sx={{
                        borderColor: 'warning.main',
                        color: 'warning.main',
                        fontSize: '0.75rem',
                        py: 0.5,
                        px: 1.5,
                        '&:hover': {
                          borderColor: 'warning.dark',
                          bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                        },
                      }}
                    >
                      {verifyingEmail ? 'Verifying...' : 'Click to Verify Email'}
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PersonAddIcon sx={{ color: 'primary.main', fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Create New User
              </Typography>
            </Box>
          )}
          <Button
            onClick={onClose}
            sx={{ minWidth: 'auto', p: 1, color: 'text.secondary' }}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: isEditMode ? 0 : 4, pt: isEditMode ? 0 : 4, overflow: 'hidden' }}>
        {saveStatus && (
          <Alert
            severity={saveStatus.type}
            onClose={() => setSaveStatus(null)}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {saveStatus.message}
          </Alert>
        )}

        {isEditMode && displayUser ? (
          /* Edit Mode: Show ProfileTabsManager */
          <Box sx={{ p: 3 }}>
            <ProfileTabsManager
              userId={displayUser.id}
              mode="full"
              onSave={handleSave}
              showProgressIndicator={false}
            />
          </Box>
        ) : (
          /* Create Mode: Show basic form */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Email Row */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, email: e.target.value });
                    setFormErrors({ ...formErrors, email: '' });
                  }}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  placeholder="user@example.com"
                  disabled={creatingUser}
                  sx={{
                    '& .MuiInputBase-root': {
                      bgcolor: (theme) => 
                        theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.common.white, 0.05) 
                          : 'background.paper',
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Name Row */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  label="First Name"
                  required
                  value={createForm.firstName}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, firstName: e.target.value });
                    setFormErrors({ ...formErrors, firstName: '' });
                  }}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  placeholder="John"
                  disabled={creatingUser}
                  sx={{
                    '& .MuiInputBase-root': {
                      bgcolor: (theme) => 
                        theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.common.white, 0.05) 
                          : 'background.paper',
                    },
                  }}
                />
              </Box>

              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  required
                  value={createForm.lastName}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, lastName: e.target.value });
                    setFormErrors({ ...formErrors, lastName: '' });
                  }}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                  placeholder="Doe"
                  disabled={creatingUser}
                  sx={{
                    '& .MuiInputBase-root': {
                      bgcolor: (theme) => 
                        theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.common.white, 0.05) 
                          : 'background.paper',
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Password Row */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, password: e.target.value });
                    setFormErrors({ ...formErrors, password: '' });
                  }}
                  error={!!formErrors.password}
                  helperText={formErrors.password || 'Minimum 8 characters'}
                  placeholder="••••••••"
                  disabled={creatingUser}
                  sx={{
                    '& .MuiInputBase-root': {
                      bgcolor: (theme) => 
                        theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.common.white, 0.05) 
                          : 'background.paper',
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', p: 3 }}>
        {isEditMode ? (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ flex: 1, ml: 1 }}>
              Changes are saved automatically
            </Typography>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Close
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={onClose}
              variant="outlined"
              disabled={creatingUser}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              variant="contained"
              disabled={creatingUser}
              startIcon={creatingUser ? <CircularProgress size={20} /> : undefined}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              {creatingUser ? 'Creating...' : 'Create User'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UserProfileModal;
