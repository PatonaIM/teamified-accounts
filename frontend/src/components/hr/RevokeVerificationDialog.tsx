import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface RevokeVerificationDialogProps {
  open: boolean;
  onClose: () => void;
  documentFileName: string;
  onRevoke: (reason: string) => Promise<void>;
}

const RevokeVerificationDialog: React.FC<RevokeVerificationDialogProps> = ({
  open,
  onClose,
  documentFileName,
  onRevoke,
}) => {
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (reason.trim().length < 20) {
      setError('Revocation reason must be at least 20 characters for proper documentation');
      return;
    }

    if (!confirmed) {
      setError('You must confirm that you understand the impact of revoking this verification');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onRevoke(reason);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to revoke verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setConfirmed(false);
    setError(null);
    onClose();
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
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Revoke Verification
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Warning: This is a critical action
          </Typography>
          <Typography variant="body2">
            You are about to revoke the verification for <strong>{documentFileName}</strong>. This
            will:
          </Typography>
          <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
            <li>
              <Typography variant="body2">
                Change the document status from "Approved" to "Pending"
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Allow the candidate to delete or replace this document
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Create an audit trail entry with your reason
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Update the candidate's onboarding progress status
              </Typography>
            </li>
          </Box>
        </Alert>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Revocation Reason"
          placeholder="Enter a detailed reason for revoking this verification (minimum 20 characters)..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          helperText={`${reason.length}/20 characters minimum - Be specific about why this verification is being revoked`}
          error={reason.length > 0 && reason.length < 20}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              color="warning"
            />
          }
          label={
            <Typography variant="body2">
              I understand the impact of revoking this verification and have provided a valid reason
            </Typography>
          }
        />

        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
          <Typography variant="body2">
            Previous review notes will be preserved in the audit history for reference.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #E5E7EB', p: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={isSubmitting}
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          color="warning"
          disabled={isSubmitting || reason.trim().length < 20 || !confirmed}
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {isSubmitting ? 'Revoking...' : 'Revoke Verification'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RevokeVerificationDialog;
