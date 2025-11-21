import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Close, Save, Security, Add, Delete } from '@mui/icons-material';
import type { User } from '../services/userService';
import roleService, { type UserRole, type AssignRoleRequest } from '../services/roleService';

interface RoleManagementDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

const RoleManagementDialog: React.FC<RoleManagementDialogProps> = ({ user, open, onClose, onSave }) => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRole, setNewRole] = useState<AssignRoleRequest>({
    userId: '',
    role: 'candidate',
    scope: 'all',
    scopeId: '',
    expiresAt: '',
  });

  useEffect(() => {
    if (user && open) {
      loadUserRoles();
      setNewRole(prev => ({ ...prev, userId: user.id }));
    }
  }, [user, open]);

  const loadUserRoles = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await roleService.getUserRoles(user.id);
      setUserRoles(response.roles);
    } catch (error) {
      console.error('Error loading user roles:', error);
      setError('Failed to load user roles');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    try {
      const roleData: AssignRoleRequest = {
        ...newRole,
        userId: user.id,
        expiresAt: newRole.expiresAt || undefined,
        scopeId: newRole.scopeId || undefined,
      };
      
      await roleService.assignRole(roleData);
      await loadUserRoles(); // Reload roles
      setShowAddForm(false);
      setNewRole({
        userId: user.id,
        role: 'candidate',
        scope: 'all',
        scopeId: '',
        expiresAt: '',
      });
    } catch (error) {
      console.error('Error adding role:', error);
      setError('Failed to add role');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    setSaving(true);
    setError(null);
    try {
      await roleService.removeRole(roleId);
      await loadUserRoles(); // Reload roles
    } catch (error) {
      console.error('Error removing role:', error);
      setError('Failed to remove role');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setShowAddForm(false);
    setError(null);
    setNewRole({
      userId: user?.id || '',
      role: 'candidate',
      scope: 'all',
      scopeId: '',
      expiresAt: '',
    });
    onClose();
  };

  const handleSave = () => {
    onSave();
    handleClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          maxHeight: '90vh',
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
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Security sx={{ color: 'primary.main' }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Manage Roles & Permissions
            </Typography>
          </Stack>
          <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
            <Close />
          </IconButton>
        </Box>
        {user && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {user.firstName} {user.lastName} ({user.email})
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading roles...
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* Current Roles */}
            <Box mb={4}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                  Current Roles
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setShowAddForm(true)}
                  size="small"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Add Role
                </Button>
              </Box>
              
              {userRoles.length > 0 ? (
                <Stack spacing={2}>
                  {userRoles.map((role) => (
                    <Card key={role.id} variant="outlined" sx={{ borderColor: 'divider' }}>
                      <CardContent sx={{ py: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box flex={1}>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" mb={1}>
                              <Chip
                                label={roleService.getRoleDisplayName(role.role)}
                                color={roleService.getRoleColor(role.role)}
                                size="small"
                              />
                              <Chip
                                label={`Scope: ${roleService.getScopeDisplayName(role.scope)}`}
                                color={roleService.getScopeColor(role.scope)}
                                variant="outlined"
                                size="small"
                              />
                              {role.scopeId && (
                                <Typography variant="caption" color="text.secondary">
                                  ID: {role.scopeId}
                                </Typography>
                              )}
                            </Stack>
                            {role.expiresAt && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Expires: {new Date(role.expiresAt).toLocaleDateString()}
                              </Typography>
                            )}
                            {role.grantedBy && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Granted by: {role.grantedBy}
                              </Typography>
                            )}
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveRole(role.id)}
                            disabled={saving}
                            title="Remove role"
                            sx={{
                              color: 'error.main',
                              '&:hover': {
                                bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                              },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No roles assigned
                </Typography>
              )}
            </Box>

            {/* Add New Role Form */}
            {showAddForm && (
              <Box mb={4}>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  Add New Role
                </Typography>
                <Card variant="outlined" sx={{ borderColor: 'divider' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Role</InputLabel>
                          <Select
                            value={newRole.role}
                            label="Role"
                            onChange={(e) => setNewRole(prev => ({ ...prev, role: e.target.value as any }))}
                            sx={{
                              '& .MuiSvgIcon-root': {
                                color: 'text.secondary',
                              },
                            }}
                          >
                            <MenuItem value="admin">Administrator</MenuItem>
                            <MenuItem value="hr">Human Resources</MenuItem>
                            <MenuItem value="client">Client</MenuItem>
                            <MenuItem value="eor">Employee of Record</MenuItem>
                            <MenuItem value="candidate">Candidate</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Scope</InputLabel>
                          <Select
                            value={newRole.scope}
                            label="Scope"
                            onChange={(e) => setNewRole(prev => ({ ...prev, scope: e.target.value as any }))}
                            sx={{
                              '& .MuiSvgIcon-root': {
                                color: 'text.secondary',
                              },
                            }}
                          >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="group">Group</MenuItem>
                            <MenuItem value="client">Client</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      {newRole.scope !== 'all' && (
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Scope ID"
                            value={newRole.scopeId}
                            onChange={(e) => setNewRole(prev => ({ ...prev, scopeId: e.target.value }))}
                            placeholder="Enter scope entity ID"
                            helperText="Required for user, group, or client scopes"
                          />
                        </Grid>
                      )}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="datetime-local"
                          label="Expires At (Optional)"
                          value={newRole.expiresAt}
                          onChange={(e) => setNewRole(prev => ({ ...prev, expiresAt: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                          helperText="Leave empty for permanent role"
                        />
                      </Grid>
                    </Grid>
                    <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                      <Button
                        variant="outlined"
                        onClick={() => setShowAddForm(false)}
                        disabled={saving}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleAddRole}
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} /> : <Add />}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        {saving ? 'Adding...' : 'Add Role'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', p: 3 }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<Save />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleManagementDialog;
