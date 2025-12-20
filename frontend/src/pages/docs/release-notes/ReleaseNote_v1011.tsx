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
} from '@mui/material';
import {
  ArrowBack,
  NewReleases,
  CheckCircle,
  AutoAwesome,
  Cloud,
  Build,
  Security,
  Speed,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ReleaseNote_v1011() {
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
                  <Chip label="v1.0.11" color="primary" sx={{ fontWeight: 600 }} />
                  <Typography variant="body2" color="text.secondary">
                    December 20, 2025
                  </Typography>
                  <Chip label="3 min read" size="small" variant="outlined" />
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  Azure CI/CD Pipeline
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Alert severity="success" icon={<AutoAwesome />}>
            <Typography variant="body2">
              <strong>What's New:</strong> Automated CI/CD pipeline for Azure Container Apps deployment. 
              Push to main branch triggers automatic build, container registry push, and production deployment.
            </Typography>
          </Alert>

          <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              1-Minute Summary
            </Typography>
            <List dense disablePadding>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="GitHub Actions workflow for automated build and deploy on push to main" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Multi-stage Dockerfile (frontend + backend) with optimized production image" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Azure Container Registry (ACR) with managed identity authentication" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Automatic image backup before each deployment for easy rollback" primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Cloud color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                1. Azure Infrastructure
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              New Azure resources provisioned for production deployment:
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Resource</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Purpose</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Container App</TableCell>
                    <TableCell><code>teamified-accounts</code></TableCell>
                    <TableCell>Hosts the unified NestJS + React application</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Container Registry</TableCell>
                    <TableCell><code>tmfregistryprod.azurecr.io</code></TableCell>
                    <TableCell>Stores Docker images with version tags</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Redis Cache</TableCell>
                    <TableCell><code>tmf-redis-prod</code></TableCell>
                    <TableCell>Session storage and caching (Standard C1)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Build color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                2. Docker Build Configuration
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Unified multi-stage Dockerfile that builds both frontend and backend:
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Stage 1: Frontend Build" 
                  secondary="Vite builds React app with Supabase config injected as build args"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Stage 2: Backend Build" 
                  secondary="NestJS compiled with native module support (argon2, bcrypt)"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Stage 3: Production Image" 
                  secondary="Minimal Alpine image with dumb-init for proper signal handling"
                />
              </ListItem>
            </List>

            <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mt: 2 }}>
              <pre style={{ margin: 0, fontSize: '0.85rem' }}>
{`# Key features of Dockerfile.unified
- node:20-alpine base for small image size
- libstdc++ retained for native module runtime
- Frontend served from /app/dist/public
- Health check at /api/health
- Non-root user (nestjs) for security`}
              </pre>
            </Paper>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Speed color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                3. GitHub Actions Workflow
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Automated CI/CD pipeline triggered on push to main branch:
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Build Job" 
                  secondary="Checkout → Docker Buildx → ACR Login → Backup current image → Build & Push"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Deploy Job" 
                  secondary="Azure Login → ACR Login → Container App Update with new image"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Image Tagging" 
                  secondary="Each build tagged with :latest and :git-sha for traceability"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Automatic Backups" 
                  secondary="Previous :latest image saved as :backup-YYYYMMDD-HHMMSS before each deploy"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Security color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                4. Required GitHub Secrets
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              The following secrets must be configured in the GitHub repository:
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Secret Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Purpose</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell><code>AZURE_CLIENT_SECRET</code></TableCell>
                    <TableCell>Azure App Registration secret for ACR and Container App access</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code>VITE_SUPABASE_URL</code></TableCell>
                    <TableCell>Supabase project URL (baked into frontend at build time)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><code>VITE_SUPABASE_ANON_KEY</code></TableCell>
                    <TableCell>Supabase anonymous key (baked into frontend at build time)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Alert severity="info">
              <Typography variant="body2">
                <strong>Note:</strong> Runtime environment variables (DATABASE_URL, REDIS_URL, JWT_SECRET, etc.) 
                are configured directly in Azure Container Apps, not in GitHub Secrets.
              </Typography>
            </Alert>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Technical Details
            </Typography>
            <List dense>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="Workflow File" 
                  secondary={<><code>.github/workflows/teamified-accounts-build-and-deploy.yml</code></>}
                />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="Dockerfile" 
                  secondary={<><code>Dockerfile.unified</code> - Multi-stage build for unified deployment</>}
                />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="Port Configuration" 
                  secondary={<>Container runs on port 8080 (Azure Container Apps standard)</>}
                />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="Health Check" 
                  secondary={<><code>GET /api/health</code> every 30 seconds</>}
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
