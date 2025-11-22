import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GetApp as ExportIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import type { EmploymentStatus } from '../../types/employmentRecords';

interface EmploymentRecordActionsProps {
  selectedCount: number;
  onBulkStatusChange: (status: EmploymentStatus) => void;
  onExport: () => void;
  onRefresh: () => void;
  onClearSelection: () => void;
  disabled?: boolean;
}

const EmploymentRecordActions: React.FC<EmploymentRecordActionsProps> = ({
  selectedCount,
  onBulkStatusChange,
  onExport,
  onRefresh,
  onClearSelection,
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<EmploymentStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleBulkStatusClick = (status: EmploymentStatus) => {
    setSelectedStatus(status);
    setShowBulkStatusDialog(true);
    handleClose();
  };

  const handleConfirmBulkStatusChange = async () => {
    if (!selectedStatus) return;
    
    setLoading(true);
    try {
      await onBulkStatusChange(selectedStatus);
      setShowBulkStatusDialog(false);
      setSelectedStatus(null);
    } catch (error) {
      console.error('Failed to update employment records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBulkStatusChange = () => {
    setShowBulkStatusDialog(false);
    setSelectedStatus(null);
  };

  const getStatusIcon = (status: EmploymentStatus) => {
    switch (status) {
      case 'active': return <PlayArrowIcon />;
      case 'inactive': return <PauseIcon />;
      case 'terminated': return <CancelIcon />;
      case 'completed': return <CheckCircleIcon />;
      default: return null;
    }
  };

  const getStatusLabel = (status: EmploymentStatus) => {
    switch (status) {
      case 'active': return 'Mark as Active';
      case 'inactive': return 'Mark as Inactive';
      case 'terminated': return 'Mark as Terminated';
      case 'completed': return 'Mark as Completed';
      default: return status;
    }
  };

  const getStatusDescription = (status: EmploymentStatus) => {
    switch (status) {
      case 'active':
        return 'Mark selected employment records as active. This will resume employment status.';
      case 'inactive':
        return 'Mark selected employment records as inactive. This will temporarily suspend employment.';
      case 'terminated':
        return 'Mark selected employment records as terminated. This will end employment permanently.';
      case 'completed':
        return 'Mark selected employment records as completed. This indicates successful contract completion.';
      default:
        return `Change status to ${status}`;
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Selection Info */}
        {selectedCount > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {selectedCount} selected
            </Typography>
            <Button
              size="small"
              onClick={onClearSelection}
              disabled={disabled}
            >
              Clear
            </Button>
          </Box>
        )}

        {/* Actions Menu */}
        <Button
          variant="outlined"
          startIcon={<MoreVertIcon />}
          onClick={handleClick}
          disabled={disabled}
        >
          Actions
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {/* Bulk Status Actions */}
          {selectedCount > 0 && (
            <>
              <MenuItem onClick={() => handleBulkStatusClick('active')}>
                <ListItemIcon>
                  <PlayArrowIcon />
                </ListItemIcon>
                <ListItemText>Mark as Active</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleBulkStatusClick('inactive')}>
                <ListItemIcon>
                  <PauseIcon />
                </ListItemIcon>
                <ListItemText>Mark as Inactive</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleBulkStatusClick('terminated')}>
                <ListItemIcon>
                  <CancelIcon />
                </ListItemIcon>
                <ListItemText>Mark as Terminated</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleBulkStatusClick('completed')}>
                <ListItemIcon>
                  <CheckCircleIcon />
                </ListItemIcon>
                <ListItemText>Mark as Completed</ListItemText>
              </MenuItem>
              <Divider />
            </>
          )}

          {/* General Actions */}
          <MenuItem onClick={() => { onExport(); handleClose(); }}>
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText>Export Data</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { onRefresh(); handleClose(); }}>
            <ListItemIcon>
              <RefreshIcon />
            </ListItemIcon>
            <ListItemText>Refresh</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      {/* Bulk Status Change Dialog */}
      <Dialog
        open={showBulkStatusDialog}
        onClose={handleCancelBulkStatusChange}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Change Employment Status
        </DialogTitle>
        <DialogContent>
          {selectedStatus && (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                You are about to change the status of {selectedCount} employment record(s) to{' '}
                <strong>{selectedStatus}</strong>.
              </Alert>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {getStatusIcon(selectedStatus)}
                <Box>
                  <Typography variant="h6">
                    {getStatusLabel(selectedStatus)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getStatusDescription(selectedStatus)}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                This action will affect {selectedCount} employment record(s) and cannot be undone.
                Are you sure you want to continue?
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelBulkStatusChange}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmBulkStatusChange}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmploymentRecordActions;
