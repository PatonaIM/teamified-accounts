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

export default function TestAccountsPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Science color="primary" />
        Test Accounts
      </Typography>

      <Typography variant="body1" paragraph>
        Use these pre-configured test accounts to explore the platform's features during development 
        and testing. These accounts are available in non-production environments only.
      </Typography>

      <Alert severity="info" icon={<ContactSupport />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Credentials:</strong> Contact Admin for test account credentials. 
          All test accounts use a shared password that is provided separately for security purposes.
        </Typography>
      </Alert>

      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Internal Test Accounts
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
                  <TableCell><code>sarah.chen@teamified.com</code></TableCell>
                  <TableCell><Chip label="Internal HR" color="primary" size="small" /></TableCell>
                  <TableCell>Global HR operations</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Marcus Johnson</TableCell>
                  <TableCell><code>marcus.johnson@teamified.com</code></TableCell>
                  <TableCell><Chip label="Internal Recruiter" color="primary" size="small" /></TableCell>
                  <TableCell>Global recruiting</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Elena Rodriguez</TableCell>
                  <TableCell><code>elena.rodriguez@teamified.com</code></TableCell>
                  <TableCell><Chip label="Account Manager" color="primary" size="small" /></TableCell>
                  <TableCell>Client management</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Client Test Accounts
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These accounts demonstrate client organization roles and permissions.
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
                  <TableCell>Amit Sharma</TableCell>
                  <TableCell><code>user1@teamified.com</code></TableCell>
                  <TableCell><Chip label="Client Admin" color="secondary" size="small" /></TableCell>
                  <TableCell>Organization admin</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Sneha Patel</TableCell>
                  <TableCell><code>user2@teamified.com</code></TableCell>
                  <TableCell><Chip label="Client Admin" color="secondary" size="small" /></TableCell>
                  <TableCell>Organization admin</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Deepa Singh</TableCell>
                  <TableCell><code>user3@teamified.com</code></TableCell>
                  <TableCell><Chip label="Client HR" color="secondary" size="small" /></TableCell>
                  <TableCell>Organization HR</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Anita Gupta</TableCell>
                  <TableCell><code>user5@teamified.com</code></TableCell>
                  <TableCell><Chip label="Client Recruiter" color="secondary" size="small" /></TableCell>
                  <TableCell>Organization recruiting</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Candidate Test Accounts
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These accounts represent job candidates in the system.
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
                  <TableCell><code>user13@teamified.com</code></TableCell>
                  <TableCell><Chip label="Candidate" color="info" size="small" /></TableCell>
                  <TableCell>Candidate Portal only</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Meera Kumar</TableCell>
                  <TableCell><code>user14@teamified.com</code></TableCell>
                  <TableCell><Chip label="Candidate" color="info" size="small" /></TableCell>
                  <TableCell>Candidate Portal only</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Anita Gupta</TableCell>
                  <TableCell><code>user15@teamified.com</code></TableCell>
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
