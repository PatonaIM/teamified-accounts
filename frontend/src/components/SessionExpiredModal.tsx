import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { LogoutOutlined as LogoutIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SessionExpiredModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpired = () => {
      setOpen(true);
    };

    window.addEventListener('sessionExpired', handleSessionExpired);

    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired);
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
    navigate('/login');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
            }}
          >
            <LogoutIcon sx={{ fontSize: 24, color: 'warning.main' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            You've Been Logged Out
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
          Your session has expired due to inactivity. Please log in again to continue.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={handleClose}
          variant="contained"
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          Log In
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionExpiredModal;
