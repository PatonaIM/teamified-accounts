import React, { useState } from 'react';
import {
  Box,
  Toolbar,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as ChangesIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface BulkActionToolbarProps {
  numSelected: number;
  onBulkAction: (action: 'approve' | 'reject' | 'needs_changes', notes: string) => Promise<void>;
  onClearSelection: () => void;
}

const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  numSelected,
  onBulkAction,
  onClearSelection,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | 'needs_changes' | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenDialog = (action: 'approve' | 'reject' | 'needs_changes') => {
    setSelectedAction(action);
    setShowDialog(true);
    setError(null);
    setNotes('');
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedAction(null);
    setNotes('');
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedAction) return;

    if (notes.trim().length < 10) {
      setError('Review notes must be at least 10 characters');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onBulkAction(selectedAction, notes);
      handleCloseDialog();
      onClearSelection();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process bulk action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionLabel = () => {
    switch (selectedAction) {
      case 'approve':
        return 'Approve';
      case 'reject':
        return 'Reject';
      case 'needs_changes':
        return 'Request Changes';
      default:
        return '';
    }
  };

  const getActionColor = () => {
    switch (selectedAction) {
      case 'approve':
        return 'success';
      case 'reject':
        return 'error';
      case 'needs_changes':
        return 'warning';
      default:
        return 'primary';
    }
  };

  if (numSelected === 0) {
    return null;
  }

  return (
    <>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          background: 'linear-gradient(135deg, rgba(161, 106, 232, 0.1) 0%, rgba(128, 150, 253, 0.1) 100%)',
          borderRadius: 2,
          mb: 2,
        }}
      >
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="primary"
          variant="subtitle1"
          component="div"
          fontWeight={600}
        >
          {numSelected} document{numSelected !== 1 ? 's' : ''} selected
        </Typography>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Request changes for selected documents">
            <Button
              variant="outlined"
              color="warning"
              size="small"
              startIcon={<ChangesIcon />}
              onClick={() => handleOpenDialog('needs_changes')}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Request Changes
            </Button>
          </Tooltip>

          <Tooltip title="Reject selected documents">
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<RejectIcon />}
              onClick={() => handleOpenDialog('reject')}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Reject
            </Button>
          </Tooltip>

          <Tooltip title="Approve selected documents">
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<ApproveIcon />}
              onClick={() => handleOpenDialog('approve')}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Approve
            </Button>
          </Tooltip>

          <Tooltip title="Clear selection">
            <IconButton onClick={onClearSelection} size="small">
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog
        open={showDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Bulk {getActionLabel()}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
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

          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            You are about to <strong>{getActionLabel().toLowerCase()}</strong>{' '}
            <strong>{numSelected}</strong> document{numSelected !== 1 ? 's' : ''}. This action will
            apply the same review notes to all selected documents.
          </Alert>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Review Notes"
            placeholder="Enter your review notes (minimum 10 characters)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
            helperText={`${notes.length}/10 characters minimum`}
            error={notes.length > 0 && notes.length < 10}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ borderTop: '1px solid #E5E7EB', p: 3, gap: 2 }}>
          <Button
            onClick={handleCloseDialog}
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
            color={getActionColor() as any}
            disabled={isSubmitting || notes.trim().length < 10}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {isSubmitting ? 'Processing...' : `${getActionLabel()} ${numSelected} Document${numSelected !== 1 ? 's' : ''}`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkActionToolbar;
