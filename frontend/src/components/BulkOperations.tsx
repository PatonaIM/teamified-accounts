import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  InputLabel,
  Typography,
  Box,
  Stack,
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { 
  ExpandMore, 
  People, 
  Security, 
  Archive, 
  Delete
} from '@mui/icons-material';

interface BulkOperationsProps {
  selectedCount: number;
  onOperation: (operation: string, data: any) => void;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({ selectedCount, onOperation }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | 'archived'>('active');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedScope, setSelectedScope] = useState('user');

  const handleStatusUpdate = () => {
    onOperation('status', { status: selectedStatus });
    setShowStatusModal(false);
  };

  const handleRoleAssignment = () => {
    onOperation('role', { 
      role: selectedRole, 
      scope: selectedScope,
      scopeId: selectedScope !== 'all' ? undefined : undefined
    });
    setShowRoleModal(false);
  };

  const bulkActions = [
    {
      id: 'status',
      label: 'Change Status',
      icon: <People />,
      onClick: () => setShowStatusModal(true),
    },
    {
      id: 'role',
      label: 'Assign Role',
      icon: <Security />,
      onClick: () => setShowRoleModal(true),
    },
    {
      id: 'archive',
      label: 'Archive Users',
      icon: <Archive />,
      onClick: () => onOperation('status', { status: 'archived' }),
    },
    {
      id: 'delete',
      label: 'Delete Users',
      icon: <Delete />,
      onClick: () => {
        if (window.confirm(`Are you sure you want to delete ${selectedCount} users? This action cannot be undone.`)) {
          onOperation('delete', {});
        }
      },
    },
  ];

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<People />}
        endIcon={<ExpandMore />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ 
          minWidth: 'auto',
          textTransform: 'none',
          fontWeight: 600,
        }}
      >
        <Chip 
          label={`${selectedCount} selected`} 
          size="small" 
          color="primary" 
          sx={{ ml: 1 }}
        />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {bulkActions.map((action) => (
          <MenuItem
            key={action.id}
            onClick={() => {
              action.onClick();
              setAnchorEl(null);
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              {action.icon}
              <Typography variant="body2">{action.label}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>

      {/* Status Update Modal */}
      <Dialog 
        open={showStatusModal} 
        onClose={() => setShowStatusModal(false)} 
        maxWidth="sm" 
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
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Change Status for {selectedCount} Users
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend">Select Status</FormLabel>
            <RadioGroup
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'active' | 'inactive' | 'archived')}
            >
              <FormControlLabel
                value="active"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Active
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Users can log in and access the system
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                value="inactive"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Inactive
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Users cannot log in but data is preserved
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                value="archived"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Archived
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Users are archived and hidden from active lists
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        
        <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', p: 3 }}>
          <Button 
            onClick={() => setShowStatusModal(false)} 
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleStatusUpdate} 
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Assignment Modal */}
      <Dialog 
        open={showRoleModal} 
        onClose={() => setShowRoleModal(false)} 
        maxWidth="sm" 
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
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Assign Role to {selectedCount} Users
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole}
                label="Role"
                onChange={(e) => setSelectedRole(e.target.value)}
                sx={{
                  '& .MuiSvgIcon-root': {
                    color: 'text.secondary',
                  },
                }}
              >
                <MenuItem value="">Select a role</MenuItem>
                <MenuItem value="candidate">Candidate</MenuItem>
                <MenuItem value="eor">EOR (Employee of Record)</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="timesheet_approver">Timesheet Approver</MenuItem>
                <MenuItem value="leave_approver">Leave Approver</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Scope</InputLabel>
              <Select
                value={selectedScope}
                label="Scope"
                onChange={(e) => setSelectedScope(e.target.value)}
                sx={{
                  '& .MuiSvgIcon-root': {
                    color: 'text.secondary',
                  },
                }}
              >
                <MenuItem value="user">User Level</MenuItem>
                <MenuItem value="group">Group Level</MenuItem>
                <MenuItem value="client">Client Level</MenuItem>
                <MenuItem value="all">All</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', p: 3 }}>
          <Button 
            onClick={() => setShowRoleModal(false)} 
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRoleAssignment} 
            variant="contained"
            disabled={!selectedRole}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Assign Role
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkOperations;
