import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
} from '@mui/material';
import { ManageAccounts } from '@mui/icons-material';
import DownloadMarkdownButton from '../../../components/docs/DownloadMarkdownButton';

const markdownContent = `# User Management API

API reference for managing users programmatically, including CRUD operations, role assignments, and organization management.

## User Endpoints

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | \`/users\` | List all users (paginated) | Super Admin, Internal HR |
| GET | \`/users/:id\` | Get user by ID | Super Admin, Internal HR, Client Admin (own org) |
| POST | \`/users\` | Create new user | Super Admin |
| PUT | \`/users/:id\` | Update user | Super Admin, Internal HR |
| DELETE | \`/users/:id\` | Deactivate user | Super Admin |
| POST | \`/users/:id/roles\` | Assign role to user | Super Admin, Client Admin (client roles only) |
| DELETE | \`/users/:id/roles/:roleId\` | Remove role from user | Super Admin, Client Admin (client roles only) |

## Create User Request

\`\`\`http
POST /users
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "email": "newuser@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-15",
  "roleId": "client_admin",
  "organizationId": "org-uuid-here",
  "sendInvitation": true
}
\`\`\`

## Update User Request

Use the PUT or PATCH endpoint to update user details like first name, last name, phone number, or other profile fields.

\`\`\`http
PUT /users/:id
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1987654321"
}
\`\`\`

### Updatable Fields

| Field | Type | Description |
|-------|------|-------------|
| \`firstName\` | string | User's first name |
| \`lastName\` | string | User's last name |
| \`phone\` | string | Phone number |
| \`dateOfBirth\` | string | Date of birth (YYYY-MM-DD) |
| \`status\` | string | User status: active, inactive |

> **Note:** Users can also update their own profile (firstName, lastName) through the self-service profile page at \`/account/profile\`.

## User Response Object

\`\`\`json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "status": "active",
  "emailVerified": true,
  "createdAt": "2025-01-15T10:30:00Z",
  "lastLoginAt": "2025-12-01T08:45:00Z",
  "roles": [
    {
      "id": "role-uuid",
      "name": "client_admin",
      "organizationId": "org-uuid"
    }
  ],
  "organizations": [
    {
      "id": "org-uuid",
      "name": "Acme Corp"
    }
  ],
  "profile": {
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-15",
    "profilePicture": "https://..."
  }
}
\`\`\`

## Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| \`page\` | number | Page number (default: 1) |
| \`limit\` | number | Items per page (default: 20, max: 100) |
| \`search\` | string | Search by name or email |
| \`status\` | string | Filter by status: active, inactive, pending |
| \`organizationId\` | string | Filter by organization |
| \`role\` | string | Filter by role name |
`;

export default function UserManagementApiPage() {
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ManageAccounts color="primary" />
          User Management API
        </Typography>
        <DownloadMarkdownButton 
          filename="user-management-api" 
          content={markdownContent} 
        />
      </Box>

      <Typography variant="body1" paragraph>
        API reference for managing users programmatically, including CRUD operations, 
        role assignments, and organization management.
      </Typography>

      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            User Endpoints
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Required Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/users</code></TableCell>
                  <TableCell>List all users (paginated)</TableCell>
                  <TableCell>Super Admin, Internal HR</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/users/:id</code></TableCell>
                  <TableCell>Get user by ID</TableCell>
                  <TableCell>Super Admin, Internal HR, Client Admin (own org)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/users</code></TableCell>
                  <TableCell>Create new user</TableCell>
                  <TableCell>Super Admin</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="PUT" color="warning" size="small" /></TableCell>
                  <TableCell><code>/users/:id</code></TableCell>
                  <TableCell>Update user</TableCell>
                  <TableCell>Super Admin, Internal HR</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="DELETE" color="error" size="small" /></TableCell>
                  <TableCell><code>/users/:id</code></TableCell>
                  <TableCell>Deactivate user</TableCell>
                  <TableCell>Super Admin</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/users/:id/roles</code></TableCell>
                  <TableCell>Assign role to user</TableCell>
                  <TableCell>Super Admin, Client Admin (client roles only)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="DELETE" color="error" size="small" /></TableCell>
                  <TableCell><code>/users/:id/roles/:roleId</code></TableCell>
                  <TableCell>Remove role from user</TableCell>
                  <TableCell>Super Admin, Client Admin (client roles only)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Create User Request
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
{`POST ${apiUrl}/users
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "email": "newuser@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-15",
  "roleId": "client_admin",
  "organizationId": "org-uuid-here",
  "sendInvitation": true
}`}
            </pre>
          </Paper>
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Update User Request
          </Typography>
          <Typography variant="body1" paragraph>
            Use the PUT or PATCH endpoint to update user details like first name, last name, 
            phone number, or other profile fields.
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`PUT ${apiUrl}/users/:id
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1987654321"
}`}
            </pre>
          </Paper>
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Updatable Fields
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Field</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>firstName</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>User's first name</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>lastName</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>User's last name</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>phone</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>Phone number</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>dateOfBirth</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>Date of birth (YYYY-MM-DD)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>status</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>User status: active, inactive</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> Users can also update their own profile (firstName, lastName) 
            through the self-service profile page at <code>/account/profile</code>.
          </Typography>
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            User Response Object
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
{`{
  "id": "user-uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "status": "active",
  "emailVerified": true,
  "createdAt": "2025-01-15T10:30:00Z",
  "lastLoginAt": "2025-12-01T08:45:00Z",
  "roles": [
    {
      "id": "role-uuid",
      "name": "client_admin",
      "organizationId": "org-uuid"
    }
  ],
  "organizations": [
    {
      "id": "org-uuid",
      "name": "Acme Corp"
    }
  ],
  "profile": {
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-15",
    "profilePicture": "https://..."
  }
}`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Query Parameters
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Parameter</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>page</code></TableCell>
                  <TableCell>number</TableCell>
                  <TableCell>Page number (default: 1)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>limit</code></TableCell>
                  <TableCell>number</TableCell>
                  <TableCell>Items per page (default: 20, max: 100)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>search</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>Search by name or email</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>status</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>Filter by status: active, inactive, pending</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>organizationId</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>Filter by organization</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>role</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>Filter by role name</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </Box>
  );
}
