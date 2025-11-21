/**
 * Invitation Form Modal Component
 * Dialog-based form for creating new invitations
 * Updated to use theme colors and support dark mode
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { PersonAdd as PersonAddIcon, Close as CloseIcon } from '@mui/icons-material';

interface InvitationFormData {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  role: string;
  client: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  country?: string;
  role?: string;
  client?: string;
  general?: string;
}

interface InvitationFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const InvitationFormModal: React.FC<InvitationFormModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<InvitationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    role: '',
    client: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof InvitationFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSelectChange = (field: keyof InvitationFormData) => (
    event: any
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user makes selection
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.client.trim()) {
      newErrors.client = 'Client is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        country: '',
        role: '',
        client: '',
      });
      setErrors({});

      onSuccess();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create invitation'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        country: '',
        role: '',
        client: '',
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonAddIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Create New Invitation
            </Typography>
          </Box>
          <Button
            onClick={handleClose}
            sx={{ minWidth: 'auto', p: 1, color: 'text.secondary' }}
            disabled={isLoading}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4, pt: 4 }}>
        {errors.general && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {errors.general}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {/* Name Row */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px' }}>
              <TextField
                fullWidth
                label="First Name"
                required
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName}
                placeholder="Enter first name"
                disabled={isLoading}
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
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName}
                placeholder="Enter last name"
                disabled={isLoading}
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

          {/* Email Row */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px' }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                placeholder="user@example.com"
                disabled={isLoading}
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

          {/* Country and Role Row */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px' }}>
              <FormControl fullWidth required error={!!errors.country}>
                <InputLabel>Country</InputLabel>
                <Select
                  value={formData.country}
                  onChange={handleSelectChange('country')}
                  label="Country"
                  disabled={isLoading}
                  sx={{
                    bgcolor: (theme) => 
                      theme.palette.mode === 'dark' 
                        ? alpha(theme.palette.common.white, 0.05) 
                        : 'background.paper',
                    '& .MuiSvgIcon-root': {
                      color: 'text.secondary',
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Select a country</em>
                  </MenuItem>
                  <MenuItem value="india">India</MenuItem>
                  <MenuItem value="sri-lanka">Sri Lanka</MenuItem>
                  <MenuItem value="philippines">Philippines</MenuItem>
                </Select>
                {errors.country && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {errors.country}
                  </Typography>
                )}
              </FormControl>
            </Box>

            <Box sx={{ flex: '1 1 300px' }}>
              <FormControl fullWidth required error={!!errors.role}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={handleSelectChange('role')}
                  label="Role"
                  disabled={isLoading}
                  sx={{
                    bgcolor: (theme) => 
                      theme.palette.mode === 'dark' 
                        ? alpha(theme.palette.common.white, 0.05) 
                        : 'background.paper',
                    '& .MuiSvgIcon-root': {
                      color: 'text.secondary',
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Select a role</em>
                  </MenuItem>
                  <MenuItem value="EOR">EOR</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="HR">HR</MenuItem>
                </Select>
                {errors.role && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {errors.role}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </Box>

          {/* Client Row */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px' }}>
              <TextField
                fullWidth
                label="Client"
                required
                value={formData.client}
                onChange={handleInputChange('client')}
                error={!!errors.client}
                helperText={errors.client}
                placeholder="Enter client name"
                disabled={isLoading}
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
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', p: 3 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={isLoading}
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
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          {isLoading ? 'Creating...' : 'Create Invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvitationFormModal;
