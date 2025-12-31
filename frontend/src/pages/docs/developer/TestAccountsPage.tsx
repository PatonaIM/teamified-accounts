import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { Science, ContactSupport } from '@mui/icons-material';
import DownloadMarkdownButton from '../../../components/docs/DownloadMarkdownButton';

const markdownContent = `# Test Accounts

Use these pre-configured test accounts to explore the platform's features during development and testing. These accounts are available in non-production environments only.

> **Credentials:** All test accounts use the password \`Admin123!\`

## Internal Test Accounts (Teamified Internal)

These accounts have internal Teamified roles with varying access levels.

| Name | Email | Role | Access Level |
|------|-------|------|--------------|
| Admin User | \`admin@teamified.com\` | Super Admin | Full platform access |
| Sarah Chen | \`wagtest.internalhr@teamified.com\` | Internal HR | Global HR operations |
| Marcus Johnson | \`wagtest.internalrecruiter@teamified.com\` | Internal Recruiter | Global recruiting |
| Elena Rodriguez | \`wagtest.internalaccountmanager@teamified.com\` | Internal Account Manager | Client management |
| Jennifer Liu | \`wagtest.internalfinance@teamified.com\` | Internal Finance | Financial operations |
| Kevin Park | \`wagtest.internalmarketing@teamified.com\` | Internal Marketing | Marketing operations |
| Amanda Torres | \`wagtest.internalmember@teamified.com\` | Internal Member | Basic internal access |

## Client Test Accounts (Stark Industries)

These accounts demonstrate client organization roles and permissions using Marvel Avengers heroes.

| Name | Email | Role | Access Level |
|------|-------|------|--------------|
| Tony Stark | \`wagtest.clientadmin@teamified.com\` | Client Admin | Organization admin |
| Natasha Romanoff | \`wagtest.clienthr@teamified.com\` | Client HR | Organization HR |
| Bruce Banner | \`wagtest.clientfinance@teamified.com\` | Client Finance | Organization finance |
| Clint Barton | \`wagtest.clientrecruiter@teamified.com\` | Client Recruiter | Organization recruiting |
| Thor Odinson | \`wagtest.clientemployee@teamified.com\` | Client Employee | Basic organization access |

## Candidate Test Account

| Name | Email | Role | Access Level |
|------|-------|------|--------------|
| Vikram Singh | \`wagtest.candidate@teamified.com\` | Candidate | Candidate Portal only |

## OAuth Test Client

To test SSO integration, use:
- **client_id:** \`test-client\`
- **redirect_uri:** \`http://localhost:3000/callback\`
`;

export default function TestAccountsPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Science color="primary" />
          Test Accounts
        </Typography>
        <DownloadMarkdownButton 
          filename="test-accounts" 
          content={markdownContent} 
        />
      </Box>

      <Typography variant="body1" paragraph>
        Use these pre-configured test accounts to explore the platform's features during development 
        and testing. These accounts are available in non-production environments only.
      </Typography>

      <Alert severity="info" icon={<ContactSupport />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Credentials:</strong> All test accounts use the password <code>Admin123!</code>
        </Typography>
      </Alert>

      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Internal Test Accounts (Teamified Internal)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These accounts have internal Teamified roles with varying access levels.
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Access Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Admin User</TableCell>
                  <TableCell><code>admin@teamified.com</code></TableCell>
                  <TableCell><Chip label="Super Admin" color="error" size="small" /></TableCell>
                  <TableCell>Full platform access</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Sarah Chen</TableCell>
                  <TableCell><code>wagtest.internalhr@teamified.com</code></TableCell>
                  <TableCell><Chip label="Internal HR" color="primary" size="small" /></TableCell>
                  <TableCell>Global HR operations</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Marcus Johnson</TableCell>
                  <TableCell><code>wagtest.internalrecruiter@teamified.com</code></TableCell>
                  <TableCell><Chip label="Internal Recruiter" color="primary" size="small" /></TableCell>
                  <TableCell>Global recruiting</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Elena Rodriguez</TableCell>
                  <TableCell><code>wagtest.internalaccountmanager@teamified.com</code></TableCell>
                  <TableCell><Chip label="Internal Account Manager" color="primary" size="small" /></TableCell>
                  <TableCell>Client management</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Jennifer Liu</TableCell>
                  <TableCell><code>wagtest.internalfinance@teamified.com</code></TableCell>
                  <TableCell><Chip label="Internal Finance" color="primary" size="small" /></TableCell>
                  <TableCell>Financial operations</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Kevin Park</TableCell>
                  <TableCell><code>wagtest.internalmarketing@teamified.com</code></TableCell>
                  <TableCell><Chip label="Internal Marketing" color="primary" size="small" /></TableCell>
                  <TableCell>Marketing operations</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Amanda Torres</TableCell>
                  <TableCell><code>wagtest.internalmember@teamified.com</code></TableCell>
                  <TableCell><Chip label="Internal Member" color="primary" size="small" /></TableCell>
                  <TableCell>Basic internal access</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Client Test Accounts (Stark Industries)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These accounts demonstrate client organization roles and permissions using Marvel Avengers heroes.
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Access Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Tony Stark</TableCell>
                  <TableCell><code>wagtest.clientadmin@teamified.com</code></TableCell>
                  <TableCell><Chip label="Client Admin" color="secondary" size="small" /></TableCell>
                  <TableCell>Organization admin</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Natasha Romanoff</TableCell>
                  <TableCell><code>wagtest.clienthr@teamified.com</code></TableCell>
                  <TableCell><Chip label="Client HR" color="secondary" size="small" /></TableCell>
                  <TableCell>Organization HR</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Bruce Banner</TableCell>
                  <TableCell><code>wagtest.clientfinance@teamified.com</code></TableCell>
                  <TableCell><Chip label="Client Finance" color="secondary" size="small" /></TableCell>
                  <TableCell>Organization finance</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Clint Barton</TableCell>
                  <TableCell><code>wagtest.clientrecruiter@teamified.com</code></TableCell>
                  <TableCell><Chip label="Client Recruiter" color="secondary" size="small" /></TableCell>
                  <TableCell>Organization recruiting</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Thor Odinson</TableCell>
                  <TableCell><code>wagtest.clientemployee@teamified.com</code></TableCell>
                  <TableCell><Chip label="Client Employee" color="secondary" size="small" /></TableCell>
                  <TableCell>Basic organization access</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Candidate Test Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This account represents a job candidate in the system.
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Access Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Vikram Singh</TableCell>
                  <TableCell><code>wagtest.candidate@teamified.com</code></TableCell>
                  <TableCell><Chip label="Candidate" color="info" size="small" /></TableCell>
                  <TableCell>Candidate Portal only</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Alert severity="info">
          <Typography variant="body2">
            <strong>OAuth Test Client:</strong> To test SSO integration, use client_id: <code>test-client</code> 
            with redirect_uri: <code>http://localhost:3000/callback</code>
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
}
