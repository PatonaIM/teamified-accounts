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
  Alert,
} from '@mui/material';
import { Image, Person, Business } from '@mui/icons-material';
import DownloadMarkdownButton from '../../../components/docs/DownloadMarkdownButton';

const markdownContent = `# Profile Pictures API

API reference for uploading and retrieving user profile pictures and organization logos. All image URLs are returned in the standard response objects.

> **Note:** Profile pictures and logos are stored in Azure Blob Storage and returned as fully-qualified URLs that can be used directly in \`<img>\` tags.

## Uploading Profile Pictures

### Upload Current User's Profile Picture

Upload a profile picture for the currently authenticated user.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | \`/v1/users/me/profile-picture\` | Bearer Token | Upload profile picture for current user |

**Request Format:** \`multipart/form-data\`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`file\` | File | Yes | Image file (JPG, PNG, GIF, WebP) - Max size: 5MB |

**Example Request (cURL):**
\`\`\`bash
curl -X POST "/v1/users/me/profile-picture" \\
  -H "Authorization: Bearer <access_token>" \\
  -F "file=@/path/to/profile.jpg"
\`\`\`

**Example Response:**
\`\`\`json
{
  "message": "Profile picture uploaded successfully",
  "profilePictureUrl": "https://tmfprdfilestorage.blob.core.windows.net/teamified-accounts/users/123e4567/profile_1701234567890.jpg"
}
\`\`\`

### Upload Profile Picture for Specific User (Admin)

Upload a profile picture for a specific user by their ID. Requires admin permissions.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | \`/objects/users/:userId/profile-picture\` | Bearer Token | Upload profile picture for specific user |

**Request Format:** \`multipart/form-data\`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`file\` | File | Yes | Image file - no size limit enforced at API level |

**Example Request (cURL):**
\`\`\`bash
curl -X POST "/objects/users/123e4567-e89b-12d3-a456-426614174000/profile-picture" \\
  -H "Authorization: Bearer <access_token>" \\
  -F "file=@/path/to/profile.jpg"
\`\`\`

**Example Response:**
\`\`\`json
{
  "success": true,
  "url": "https://tmfprdfilestorage.blob.core.windows.net/teamified-accounts/users/123e4567/profile_1701234567890.jpg",
  "path": "users/123e4567/profile_1701234567890.jpg"
}
\`\`\`

## Retrieving Profile Pictures

User profile pictures are returned in the \`profilePictureUrl\` field of user response objects.

| Field | Type | Description |
|-------|------|-------------|
| \`profilePictureUrl\` | string \\| null | Full URL to the user's profile picture in Azure Blob Storage |
| \`profilePicture\` | string \\| null | Legacy field (deprecated) - use \`profilePictureUrl\` instead |

### Endpoints That Return Profile Picture URL

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/v1/users/:id\` | Get user by ID |
| GET | \`/v1/users\` | List all users (paginated) |
| GET | \`/v1/auth/me\` | Get current authenticated user |
| GET | \`/v1/sso/me\` | Get user info via SSO token |
| GET | \`/v1/organizations/:id/members\` | List organization members |

### Example Response

\`\`\`json
GET /v1/users/123e4567-e89b-12d3-a456-426614174000

{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profilePictureUrl": "https://tmfprdfilestorage.blob.core.windows.net/teamified-accounts/users/123e4567/profile_1701234567890.jpg",
  "status": "active",
  "isActive": true,
  "emailVerified": true,
  ...
}
\`\`\`

## Uploading Organization Logos

### Upload Organization Logo (Admin)

Upload a logo for a specific organization by its ID. Requires admin permissions or organization admin role.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | \`/objects/organizations/:organizationId/logo\` | Bearer Token | Upload logo for specific organization |

**Request Format:** \`multipart/form-data\`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`file\` | File | Yes | Image file (recommended: PNG or SVG) |

**Example Request (cURL):**
\`\`\`bash
curl -X POST "/objects/organizations/456e7890-e89b-12d3-a456-426614174000/logo" \\
  -H "Authorization: Bearer <access_token>" \\
  -F "file=@/path/to/logo.png"
\`\`\`

**Example Response:**
\`\`\`json
{
  "success": true,
  "url": "https://tmfprdfilestorage.blob.core.windows.net/teamified-accounts/organizations/456e7890/logo_1701234567890.png",
  "path": "organizations/456e7890/logo_1701234567890.png"
}
\`\`\`

## Retrieving Organization Logos

Organization logos are returned in the \`logoUrl\` field of organization response objects.

| Field | Type | Description |
|-------|------|-------------|
| \`logoUrl\` | string \\| null | Full URL to the organization's logo in Azure Blob Storage |

### Endpoints That Return Logo URL

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/v1/organizations/:id\` | Get organization by ID |
| GET | \`/v1/organizations\` | List all organizations (paginated) |
| GET | \`/v1/organizations/me\` | Get current user's organization |

### Example Response

\`\`\`json
GET /v1/organizations/456e7890-e89b-12d3-a456-426614174000

{
  "id": "456e7890-e89b-12d3-a456-426614174000",
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "logoUrl": "https://tmfprdfilestorage.blob.core.windows.net/teamified-accounts/organizations/456e7890/logo_1701234567890.png",
  "industry": "Technology",
  "companySize": "51-200",
  "website": "https://acme.com",
  "subscriptionTier": "professional",
  "subscriptionStatus": "active",
  ...
}
\`\`\`

## Usage in Your Application

The URLs returned are fully-qualified and can be used directly in your frontend application.

### React Example

\`\`\`jsx
// User Avatar Component
function UserAvatar({ user }) {
  return (
    <img 
      src={user.profilePictureUrl || '/default-avatar.png'} 
      alt={\`\${user.firstName} \${user.lastName}\`}
      style={{ width: 40, height: 40, borderRadius: '50%' }}
    />
  );
}

// Organization Logo Component
function OrgLogo({ organization }) {
  return (
    <img 
      src={organization.logoUrl || '/default-logo.png'} 
      alt={organization.name}
      style={{ maxHeight: 60 }}
    />
  );
}
\`\`\`

> **Note:** Profile picture and logo URLs may be \`null\` if the user or organization hasn't uploaded an image. Always provide a fallback/default image in your application.
`;

export default function ProfilePicturesApiPage() {
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Image color="primary" />
          Profile Pictures API
        </Typography>
        <DownloadMarkdownButton 
          filename="profile-pictures-api" 
          content={markdownContent} 
        />
      </Box>

      <Typography variant="body1" paragraph>
        API reference for uploading and retrieving user profile pictures and organization logos. 
        All image URLs are returned in the standard response objects.
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          Profile pictures and logos are stored in Azure Blob Storage and returned as fully-qualified URLs 
          that can be used directly in <code>&lt;img&gt;</code> tags.
        </Typography>
      </Alert>

      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person color="primary" fontSize="small" />
            Uploading Profile Pictures
          </Typography>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Upload Current User's Profile Picture
          </Typography>
          
          <Typography variant="body1" paragraph>
            Upload a profile picture for the currently authenticated user.
          </Typography>

          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Auth</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/v1/users/me/profile-picture</code></TableCell>
                  <TableCell>Bearer Token</TableCell>
                  <TableCell>Upload profile picture for current user</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Request Format:</strong> <code>multipart/form-data</code> with a <code>file</code> field. 
              Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB.
            </Typography>
          </Alert>

          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`# Example Request (cURL)
curl -X POST "${apiUrl}/v1/users/me/profile-picture" \\
  -H "Authorization: Bearer <access_token>" \\
  -F "file=@/path/to/profile.jpg"

# Example Response
{
  "message": "Profile picture uploaded successfully",
  "profilePictureUrl": "https://tmfprdfilestorage.blob.core.windows.net/..."
}`}
            </pre>
          </Paper>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Upload Profile Picture for Specific User (Admin)
          </Typography>
          
          <Typography variant="body1" paragraph>
            Upload a profile picture for a specific user by their ID. Requires admin permissions.
          </Typography>

          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Auth</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/objects/users/:userId/profile-picture</code></TableCell>
                  <TableCell>Bearer Token</TableCell>
                  <TableCell>Upload profile picture for specific user</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`# Example Response
{
  "success": true,
  "url": "https://tmfprdfilestorage.blob.core.windows.net/...",
  "path": "users/123e4567/profile_1701234567890.jpg"
}`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person color="primary" fontSize="small" />
            Retrieving Profile Pictures
          </Typography>
          
          <Typography variant="body1" paragraph>
            User profile pictures are returned in the <code>profilePictureUrl</code> field of user response objects.
          </Typography>

          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Field</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>profilePictureUrl</code></TableCell>
                  <TableCell><Chip label="string | null" size="small" /></TableCell>
                  <TableCell>Full URL to the user's profile picture in Azure Blob Storage</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>profilePicture</code></TableCell>
                  <TableCell><Chip label="string | null" size="small" color="warning" /></TableCell>
                  <TableCell>Legacy field (deprecated) - use <code>profilePictureUrl</code> instead</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Endpoints That Return Profile Picture URL
          </Typography>
          
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/v1/users/:id</code></TableCell>
                  <TableCell>Get user by ID</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/v1/users</code></TableCell>
                  <TableCell>List all users (paginated)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/v1/auth/me</code></TableCell>
                  <TableCell>Get current authenticated user</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/v1/sso/me</code></TableCell>
                  <TableCell>Get user info via SSO token</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/v1/organizations/:id/members</code></TableCell>
                  <TableCell>List organization members</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Example Response
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
{`GET ${apiUrl}/v1/users/123e4567-e89b-12d3-a456-426614174000

{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profilePictureUrl": "https://tmfprdfilestorage.blob.core.windows.net/teamified-accounts/users/123e4567/profile_1701234567890.jpg",
  "status": "active",
  "isActive": true,
  "emailVerified": true,
  ...
}`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business color="primary" fontSize="small" />
            Organization Logos
          </Typography>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Upload Organization Logo (Admin)
          </Typography>
          
          <Typography variant="body1" paragraph>
            Upload a logo for a specific organization. Requires admin permissions or organization admin role.
          </Typography>

          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Auth</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="POST" color="primary" size="small" /></TableCell>
                  <TableCell><code>/objects/organizations/:organizationId/logo</code></TableCell>
                  <TableCell>Bearer Token</TableCell>
                  <TableCell>Upload logo for specific organization</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Request Format:</strong> <code>multipart/form-data</code> with a <code>file</code> field. 
              Recommended formats: PNG or SVG.
            </Typography>
          </Alert>

          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`# Example Response
{
  "success": true,
  "url": "https://tmfprdfilestorage.blob.core.windows.net/...",
  "path": "organizations/456e7890/logo_1701234567890.png"
}`}
            </pre>
          </Paper>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Retrieving Organization Logos
          </Typography>

          <Typography variant="body1" paragraph>
            Organization logos are returned in the <code>logoUrl</code> field of organization response objects.
          </Typography>

          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Field</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>logoUrl</code></TableCell>
                  <TableCell><Chip label="string | null" size="small" /></TableCell>
                  <TableCell>Full URL to the organization's logo in Azure Blob Storage</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Endpoints That Return Logo URL
          </Typography>
          
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/v1/organizations/:id</code></TableCell>
                  <TableCell>Get organization by ID</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/v1/organizations</code></TableCell>
                  <TableCell>List all organizations (paginated)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="GET" color="success" size="small" /></TableCell>
                  <TableCell><code>/v1/organizations/me</code></TableCell>
                  <TableCell>Get current user's organization</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Example Response
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
{`GET ${apiUrl}/v1/organizations/456e7890-e89b-12d3-a456-426614174000

{
  "id": "456e7890-e89b-12d3-a456-426614174000",
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "logoUrl": "https://tmfprdfilestorage.blob.core.windows.net/teamified-accounts/organizations/456e7890/logo_1701234567890.png",
  "industry": "Technology",
  "companySize": "51-200",
  "website": "https://acme.com",
  "subscriptionTier": "professional",
  "subscriptionStatus": "active",
  ...
}`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Usage in Your Application
          </Typography>
          
          <Typography variant="body1" paragraph>
            The URLs returned are fully-qualified and can be used directly in your frontend application.
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            React Example
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`// User Avatar Component
function UserAvatar({ user }) {
  return (
    <img 
      src={user.profilePictureUrl || '/default-avatar.png'} 
      alt={\`\${user.firstName} \${user.lastName}\`}
      style={{ width: 40, height: 40, borderRadius: '50%' }}
    />
  );
}

// Organization Logo Component
function OrgLogo({ organization }) {
  return (
    <img 
      src={organization.logoUrl || '/default-logo.png'} 
      alt={organization.name}
      style={{ maxHeight: 60 }}
    />
  );
}`}
            </pre>
          </Paper>

          <Alert severity="warning">
            <Typography variant="body2">
              <strong>Note:</strong> Profile picture and logo URLs may be <code>null</code> if the user or organization 
              hasn't uploaded an image. Always provide a fallback/default image in your application.
            </Typography>
          </Alert>
        </Box>
      </Stack>
    </Box>
  );
}
