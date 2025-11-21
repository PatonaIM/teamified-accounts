/**
 * Roles & Permissions Tab
 *
 * Displays user roles and permissions information.
 * Read-only view for admin/hr users to see assigned roles and permissions.
 */

import React, { useState, useEffect } from 'react';
import { Box, CardContent, Grid, Typography, Chip, Stack, Divider, CircularProgress } from '@mui/material';
import { AccessTime as AccessTimeIcon, Person as PersonIcon } from '@mui/icons-material';
import {
  StyledCard,
  PurpleCardHeader,
  FormContainer,
  LoadingBox
} from '../shared/StyledComponents';
import roleService, { type UserRole, type Permission } from '../../../services/roleService';

interface RolesPermissionsTabProps {
  userId: string;
  isLoading?: boolean;
}

export const RolesPermissionsTab: React.FC<RolesPermissionsTabProps> = ({
  userId,
  isLoading: parentLoading = false
}) => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRolesAndPermissions();
  }, [userId]);

  const loadRolesAndPermissions = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        roleService.getUserRoles(userId),
        roleService.getUserPermissions(userId)
      ]);

      setUserRoles(rolesResponse.roles);
      setUserPermissions(permissionsResponse.permissions);
    } catch (err) {
      console.error('Error loading roles and permissions:', err);
      setError('Failed to load roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  if (loading || parentLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LoadingBox>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading roles and permissions...
          </Typography>
        </LoadingBox>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* User Roles Card */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <PurpleCardHeader title="Assigned Roles" />
            <CardContent sx={{ p: 3 }}>
              <FormContainer>
                {userRoles.length > 0 ? (
                  <Stack spacing={3}>
                    {userRoles.map((role) => (
                      <Box key={role.id}>
                        <Stack spacing={1.5}>
                          {/* Role Name */}
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Chip
                              label={roleService.getRoleDisplayName(role.role)}
                              color={roleService.getRoleColor(role.role)}
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                height: 32
                              }}
                            />
                            <Chip
                              label={`Scope: ${roleService.getScopeDisplayName(role.scope)}`}
                              color={roleService.getScopeColor(role.scope)}
                              variant="outlined"
                              sx={{
                                fontWeight: 500,
                                fontSize: '0.875rem',
                                height: 32
                              }}
                            />
                          </Stack>

                          {/* Scope ID */}
                          {role.scopeId && (
                            <Typography variant="body2" color="text.secondary">
                              <strong>Scope ID:</strong> {role.scopeId}
                            </Typography>
                          )}

                          {/* Expiry Date */}
                          {role.expiresAt && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                <strong>Expires:</strong> {new Date(role.expiresAt).toLocaleDateString()}
                              </Typography>
                            </Stack>
                          )}

                          {/* Granted By */}
                          {role.grantedBy && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                <strong>Granted by:</strong> {role.grantedBy}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                        <Divider sx={{ mt: 2 }} />
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No roles assigned
                    </Typography>
                  </Box>
                )}
              </FormContainer>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* User Permissions Card */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <PurpleCardHeader title="Permissions" />
            <CardContent sx={{ p: 3 }}>
              <FormContainer>
                {userPermissions.length > 0 ? (
                  <Stack spacing={3}>
                    {userPermissions.map((permission, index) => (
                      <Box key={index}>
                        <Stack spacing={1.5}>
                          {/* Permission Name */}
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Chip
                              label={permission.permission}
                              color={permission.granted ? 'success' : 'default'}
                              variant={permission.granted ? 'filled' : 'outlined'}
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                height: 32
                              }}
                            />
                            <Chip
                              label={`Scope: ${roleService.getScopeDisplayName(permission.scope)}`}
                              color={roleService.getScopeColor(permission.scope)}
                              variant="outlined"
                              sx={{
                                fontWeight: 500,
                                fontSize: '0.875rem',
                                height: 32
                              }}
                            />
                          </Stack>

                          {/* Status */}
                          <Typography variant="body2" color="text.secondary">
                            <strong>Status:</strong>{' '}
                            <span style={{ color: permission.granted ? '#10B981' : '#6B7280' }}>
                              {permission.granted ? 'Granted' : 'Denied'}
                            </span>
                          </Typography>

                          {/* Expiry Date */}
                          {permission.expiresAt && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                <strong>Expires:</strong> {new Date(permission.expiresAt).toLocaleDateString()}
                              </Typography>
                            </Stack>
                          )}

                          {/* Granted By */}
                          {permission.grantedBy && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                <strong>Granted by:</strong> {permission.grantedBy}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                        <Divider sx={{ mt: 2 }} />
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No permissions found
                    </Typography>
                  </Box>
                )}
              </FormContainer>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Info Note */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(161, 106, 232, 0.05)', borderRadius: 2, border: '1px solid rgba(161, 106, 232, 0.2)' }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Note:</strong> To modify roles and permissions, use the "Manage Roles" action from the user list.
        </Typography>
      </Box>
    </Box>
  );
};

export default RolesPermissionsTab;
