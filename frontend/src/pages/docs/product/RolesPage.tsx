import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { People, AdminPanelSettings } from '@mui/icons-material';

export default function RolesPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <People color="primary" />
        Roles & Permissions
      </Typography>

      <Typography variant="body1" paragraph>
        Teamified Accounts implements a hierarchical role-based access control system with three main categories: 
        Internal Roles, Client Roles, and Candidate Roles.
      </Typography>

      <Stack spacing={4}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Access Level</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell><Chip label="Super Admin" color="error" size="small" /></TableCell>
                <TableCell>Internal</TableCell>
                <TableCell>Global</TableCell>
                <TableCell>Full platform access across all organizations, system configuration, and user management</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="Internal HR" color="primary" size="small" /></TableCell>
                <TableCell>Internal</TableCell>
                <TableCell>Global</TableCell>
                <TableCell>HR operations across all organizations with access to HRIS and Team Connect. Can create, update, and delete organizations and manage organization members.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="Internal Recruiter" color="primary" size="small" /></TableCell>
                <TableCell>Internal</TableCell>
                <TableCell>Global</TableCell>
                <TableCell>Recruiting operations across all organizations with access to ATS and Candidate Portal</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="Internal Account Manager" color="primary" size="small" /></TableCell>
                <TableCell>Internal</TableCell>
                <TableCell>Global</TableCell>
                <TableCell>Manage client organizations including create, update, and delete. Can manage organization members, view data, and support operations.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="Internal Finance" color="primary" size="small" /></TableCell>
                <TableCell>Internal</TableCell>
                <TableCell>Global</TableCell>
                <TableCell>Financial operations across all organizations with access to Finance and HRIS data</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="Internal Marketing" color="primary" size="small" /></TableCell>
                <TableCell>Internal</TableCell>
                <TableCell>Global</TableCell>
                <TableCell>Marketing operations with view-only access to data dashboard across organizations</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="Client Admin" color="secondary" size="small" /></TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Organization-Scoped</TableCell>
                <TableCell>Full access to their organization's data, manage team members and settings</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="Client Recruiter" color="secondary" size="small" /></TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Organization-Scoped</TableCell>
                <TableCell>Recruitment management for their organization with access to ATS and Team Connect</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="Client HR" color="secondary" size="small" /></TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Organization-Scoped</TableCell>
                <TableCell>HR operations for their organization with access to HRIS and Team Connect</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="Client Finance" color="secondary" size="small" /></TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Organization-Scoped</TableCell>
                <TableCell>Limited HR data access for financial operations within their organization</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="Client Employee" color="secondary" size="small" /></TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Organization-Scoped</TableCell>
                <TableCell>Team collaboration with view-only access to own HR data</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="Candidate" color="info" size="small" /></TableCell>
                <TableCell>Public</TableCell>
                <TableCell>Limited</TableCell>
                <TableCell>Public access to Candidate Portal for job applications and interview participation</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Organization Data Isolation:</strong> Client roles can only access data from their assigned organization. 
            Internal roles have cross-organization visibility for support and management purposes.
          </Typography>
        </Alert>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdminPanelSettings color="primary" />
            Permission Matrix
          </Typography>

          <Typography variant="body1" paragraph>
            The platform uses granular permissions to control access to specific features and actions. 
            Permissions are automatically assigned based on user roles.
          </Typography>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Permission</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Available To</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>users:read</code></TableCell>
                  <TableCell>View user profiles and information</TableCell>
                  <TableCell>All roles</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>users:write</code></TableCell>
                  <TableCell>Create, update, and delete users</TableCell>
                  <TableCell>Super Admin, Client Admin</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>organizations:read</code></TableCell>
                  <TableCell>View organization details</TableCell>
                  <TableCell>All internal roles, Client Admin</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>organizations:write</code></TableCell>
                  <TableCell>Create, update, and delete organizations</TableCell>
                  <TableCell>Super Admin, Internal HR, Internal Account Manager</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>organizations:members</code></TableCell>
                  <TableCell>Add, update, and remove organization members</TableCell>
                  <TableCell>Super Admin, Internal HR, Internal Account Manager, Client Admin (own org)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>invitations:send</code></TableCell>
                  <TableCell>Send user invitations</TableCell>
                  <TableCell>Super Admin, Client Admin</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>oauth_clients:manage</code></TableCell>
                  <TableCell>Manage SSO client applications</TableCell>
                  <TableCell>Super Admin only</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>api_keys:manage</code></TableCell>
                  <TableCell>Generate and revoke API keys</TableCell>
                  <TableCell>Super Admin only</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>audit_logs:read</code></TableCell>
                  <TableCell>View audit logs and system activity</TableCell>
                  <TableCell>Super Admin, Internal Account Manager</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <People color="primary" />
            Capability Comparison: Internal vs Client Users
          </Typography>

          <Typography variant="body1" paragraph>
            This table compares the capabilities between internal Teamified staff roles and external client organization roles.
          </Typography>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Capability</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Super Admin</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Internal HR</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Internal Acct Mgr</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Internal Recruiter</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Client Admin</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Client HR</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} sx={{ bgcolor: 'action.hover', fontWeight: 600 }}>Organization Management</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Create organizations</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Update organizations</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ Own</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Delete organizations</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>View all organizations</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Upload organization logo</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ Own</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={7} sx={{ bgcolor: 'action.hover', fontWeight: 600 }}>Member Management</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>View organization members</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ Own</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ Own</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Add members to organization</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ Own</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Update member roles</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ Own</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Remove members from organization</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ Own</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={7} sx={{ bgcolor: 'action.hover', fontWeight: 600 }}>User Management</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>View all users</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Create users</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Update users</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Delete/archive users</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={7} sx={{ bgcolor: 'action.hover', fontWeight: 600 }}>Invitations</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Send organization invitations</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ All</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅ Own</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Send internal staff invitations</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={7} sx={{ bgcolor: 'action.hover', fontWeight: 600 }}>System Administration</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Manage OAuth clients</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>View audit logs</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Manage API keys</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Access platform analytics</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>✅</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>❌</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Scope Legend:</strong> "All" means access to all organizations across the platform. 
              "Own" means access is limited to the user's assigned organization only.
            </Typography>
          </Alert>
        </Box>
      </Stack>
    </Box>
  );
}
