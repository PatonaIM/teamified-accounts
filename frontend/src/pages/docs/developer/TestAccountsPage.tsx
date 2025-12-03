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
import { Science } from '@mui/icons-material';

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

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Security Notice:</strong> These test accounts should only be used in development 
          and staging environments. Never use these credentials in production.
        </Typography>
      </Alert>

      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Internal Test Accounts
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Password</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Access Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="Super Admin" color="error" size="small" /></TableCell>
                  <TableCell><code>superadmin@test.teamified.com</code></TableCell>
                  <TableCell><code>Test@1234!</code></TableCell>
                  <TableCell>Full platform access</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="Internal HR" color="primary" size="small" /></TableCell>
                  <TableCell><code>hr@test.teamified.com</code></TableCell>
                  <TableCell><code>Test@1234!</code></TableCell>
                  <TableCell>Global HR operations</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="Internal Recruiter" color="primary" size="small" /></TableCell>
                  <TableCell><code>recruiter@test.teamified.com</code></TableCell>
                  <TableCell><code>Test@1234!</code></TableCell>
                  <TableCell>Global recruiting</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="Account Manager" color="primary" size="small" /></TableCell>
                  <TableCell><code>am@test.teamified.com</code></TableCell>
                  <TableCell><code>Test@1234!</code></TableCell>
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
            These accounts belong to the test organization "Acme Corp"
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Password</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Access Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="Client Admin" color="secondary" size="small" /></TableCell>
                  <TableCell><code>admin@acme.test.com</code></TableCell>
                  <TableCell><code>Test@1234!</code></TableCell>
                  <TableCell>Acme Corp admin</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="Client HR" color="secondary" size="small" /></TableCell>
                  <TableCell><code>hr@acme.test.com</code></TableCell>
                  <TableCell><code>Test@1234!</code></TableCell>
                  <TableCell>Acme Corp HR</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="Client Employee" color="secondary" size="small" /></TableCell>
                  <TableCell><code>employee@acme.test.com</code></TableCell>
                  <TableCell><code>Test@1234!</code></TableCell>
                  <TableCell>Acme Corp employee</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Candidate Test Account
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Password</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Access Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="Candidate" color="info" size="small" /></TableCell>
                  <TableCell><code>candidate@test.example.com</code></TableCell>
                  <TableCell><code>Test@1234!</code></TableCell>
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
