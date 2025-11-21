import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface InvitationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const InvitationForm: React.FC<InvitationFormProps> = ({ onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    role: '',
    client: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    onSuccess();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      country: '',
      role: '',
      client: '',
    });
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
      {/* Form Header - Following established pattern */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
          Create New Invitation
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Send an invitation to a new EOR or Admin
        </Typography>
      </Box>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Name Fields - Two Column Layout */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter first name"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter last name"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>

          {/* Email - Single Column */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter email address"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>

          {/* Country and Role - Two Column Layout */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required disabled={isLoading}>
              <InputLabel>Country</InputLabel>
              <Select
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                label="Country"
                sx={{
                  borderRadius: 2,
                }}
              >
                <MenuItem value="india">India</MenuItem>
                <MenuItem value="sri-lanka">Sri Lanka</MenuItem>
                <MenuItem value="philippines">Philippines</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required disabled={isLoading}>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                label="Role"
                sx={{
                  borderRadius: 2,
                }}
              >
                <MenuItem value="eor">EOR</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Client - Single Column */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Client"
              value={formData.client}
              onChange={(e) => handleInputChange('client', e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter client name"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Form Actions - Following established pattern */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 2, 
          pt: 3, 
          mt: 3, 
          borderTop: '1px solid #E5E7EB' 
        }}>
          <Button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            variant="outlined"
            sx={{
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
            Reset
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            variant="outlined"
            sx={{
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
            type="submit"
            disabled={isLoading}
            variant="contained"
            sx={{
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
            {isLoading ? (
              <>
                <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
                Creating...
              </>
            ) : (
              'Create Invitation'
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default InvitationForm;