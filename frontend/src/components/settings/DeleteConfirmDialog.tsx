import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmationName?: string;
  loading?: boolean;
}

const DeleteConfirmDialog: React.FC<Props> = ({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmationName,
  loading = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!open) {
      setInputValue('');
    }
  }, [open]);

  const isConfirmEnabled = confirmationName 
    ? inputValue === confirmationName 
    : true;

  const handleClose = () => {
    if (!loading) {
      setInputValue('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
        {confirmationName && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Type <strong>{confirmationName}</strong> to confirm deletion:
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={confirmationName}
              disabled={loading}
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: inputValue === confirmationName ? 'error.main' : undefined,
                  },
                },
              }}
            />
            {inputValue === confirmationName && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                You are about to delete this OAuth client. This action cannot be undone.
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          disabled={!isConfirmEnabled || loading}
          sx={{ minWidth: 80 }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
