import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
} from '@mui/material';
import {
  ArrowBack,
  NewReleases,
  CheckCircle,
  AutoAwesome,
  Security,
  Code,
  Api,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function ReleaseNote_v1010() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <NewReleases color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label="v1.0.10" color="primary" sx={{ fontWeight: 600 }} />
                  <Typography variant="body2" color="text.secondary">
                    December 19, 2025
                  </Typography>
                  <Chip label="2 min read" size="small" variant="outlined" />
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  Unified API Endpoints & S2S Security Improvements
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Alert severity="success" icon={<AutoAwesome />}>
            <Typography variant="body2">
              <strong>What's New:</strong> S2S authentication now uses the same API endpoints as user authentication. 
              No more separate <code>/api/v1/s2s/*</code> paths. Enhanced security ensures S2S clients can only 
              access explicitly allowed endpoints with proper scope validation.
            </Typography>
          </Alert>

          <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              1-Minute Summary
            </Typography>
            <List dense disablePadding>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Unified API endpoints accept both user JWT and S2S tokens" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Removed redundant /api/v1/s2s/* paths (consolidated into main endpoints)" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="S2S blocked by default on write endpoints (403 Forbidden)" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Sensitive data sanitization for S2S responses (no password hashes exposed)" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
            </List>
          </Box>

          <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2, border: 1, borderColor: 'primary.200' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Code fontSize="small" color="primary" />
              Developer Documentation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              For complete implementation details and code examples:
            </Typography>
            <Link 
              component={RouterLink} 
              to="/docs/developer/s2s-authentication"
              sx={{ fontWeight: 600 }}
            >
              View S2S Authentication Developer Guide →
            </Link>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Api color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                1. Unified API Endpoints
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              S2S clients now use the same API endpoints as user authentication. This simplifies integration 
              and reduces the number of endpoints to maintain:
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Before (Deprecated)</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>After (Unified)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell><code>/api/v1/s2s/organizations</code></TableCell>
                    <TableCell><code>/api/v1/organizations</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code>/api/v1/s2s/users</code></TableCell>
                    <TableCell><code>/api/v1/users</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code>/api/v1/s2s/invitations</code></TableCell>
                    <TableCell><code>/api/v1/invitations</code></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Migration:</strong> If you were using <code>/api/v1/s2s/*</code> endpoints, 
                update your integration to use the unified endpoints. The authentication flow remains the same.
              </Typography>
            </Alert>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Security color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                2. Enhanced Security Model
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              S2S authentication now follows a secure-by-default approach:
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Blocked by Default" 
                  secondary="S2S calls are rejected on endpoints without explicit scope requirements"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Read-Only Access" 
                  secondary="Currently, only read:* scopes are available. Write operations require user authentication."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Response Sanitization" 
                  secondary="Sensitive fields (password hashes, reset tokens) are never exposed in S2S responses"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Scope Validation" 
                  secondary="Each endpoint validates that the S2S token has the required scope before allowing access"
                />
              </ListItem>
            </List>

            <Paper sx={{ p: 2, bgcolor: 'warning.50', border: 1, borderColor: 'warning.200', mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'warning.dark' }}>
                Security Note
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Write operations (POST, PUT, DELETE) on <code>/api/v1/organizations</code>, <code>/api/v1/users</code>, 
                and <code>/api/v1/invitations</code> are blocked for S2S clients. This prevents service accounts 
                from making unauthorized modifications.
              </Typography>
            </Paper>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Code color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                3. Example Usage
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Request users list using the unified endpoint:
            </Typography>
            
            <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 2 }}>
              <pre style={{ margin: 0, fontSize: '0.85rem' }}>
{`# Step 1: Get S2S token
curl -X POST https://accounts.teamified.com/api/v1/sso/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "client_secret=YOUR_CLIENT_SECRET" \\
  -d "scope=read:users"

# Step 2: Use the unified endpoint (same as user auth)
curl -X GET https://accounts.teamified.com/api/v1/users \\
  -H "Authorization: Bearer YOUR_S2S_TOKEN"`}
              </pre>
            </Paper>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Technical Details
            </Typography>
            <List dense>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="Dual-auth guards" 
                  secondary={<>JwtOrServiceGuard, CurrentUserOrServiceGuard, RolesOrServiceGuard</>}
                />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="Scope decorator" 
                  secondary={<><code>@RequiredScopes('read:users')</code> enables S2S for specific endpoints</>}
                />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="Request identification" 
                  secondary={<><code>req.serviceClient</code> differentiates S2S from user requests</>}
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box sx={{ pt: 1 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/docs/release-notes')}
              variant="outlined"
            >
              Back to Release Notes
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
