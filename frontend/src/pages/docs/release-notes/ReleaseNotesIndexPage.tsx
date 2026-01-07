import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  CardActionArea,
  Chip,
} from '@mui/material';
import { NewReleases, ArrowForward } from '@mui/icons-material';

interface ReleaseNote {
  version: string;
  date: string;
  title: string;
  summary: string;
  path: string;
  isLatest?: boolean;
}

const releaseNotes: ReleaseNote[] = [
  {
    version: '1.0.14',
    date: 'January 7, 2026',
    title: 'Role-Based Login Redirects',
    summary: 'Users are now automatically redirected to the appropriate portal (Jobseeker, ATS, or Teamified Accounts) based on the email address they use to log in. Persistent portal routing ensures consistent navigation across sessions.',
    path: '/docs/release-notes/v1.0.14',
    isLatest: true,
  },
  {
    version: '1.0.13',
    date: 'January 5, 2026',
    title: 'Navigation Bar Reorganization',
    summary: 'Streamlined navigation with OAuth Configuration and Analytics & Reports promoted to main nav for quicker access to key platform features.',
    path: '/docs/release-notes/v1.0.13',
  },
  {
    version: '1.0.12',
    date: 'January 5, 2026',
    title: 'Admin User Emails API',
    summary: 'New REST API endpoints for administrators to manage user email addresses. Supports JWT and S2S authentication with role-based access control for super_admin, internal_hr, internal_account_manager, client_admin, and client_hr roles.',
    path: '/docs/release-notes/v1.0.12',
  },
  {
    version: '1.0.11',
    date: 'December 20, 2025',
    title: 'Azure CI/CD Pipeline',
    summary: 'Automated CI/CD pipeline for Azure Container Apps deployment. GitHub Actions workflow builds multi-stage Docker image, pushes to Azure Container Registry, and deploys to production on every push to main.',
    path: '/docs/release-notes/v1.0.11',
  },
  {
    version: '1.0.10',
    date: 'December 19, 2025',
    title: 'Unified API Endpoints & S2S Security Improvements',
    summary: 'S2S authentication now uses unified API endpoints (same as user auth). Removed separate /api/v1/s2s/* paths. Enhanced security blocks S2S on write endpoints by default with proper scope validation.',
    path: '/docs/release-notes/v1.0.10',
  },
  {
    version: '1.0.9',
    date: 'December 19, 2025',
    title: 'Service-to-Service (S2S) Authentication',
    summary: 'Backend systems like HRIS integrations can now authenticate directly with Teamified Accounts APIs using OAuth 2.0 Client Credentials Grant. Admin UI enables S2S per client with granular scope selection.',
    path: '/docs/release-notes/v1.0.9',
  },
  {
    version: '1.0.8',
    date: 'December 19, 2025',
    title: 'Cross-App SSO Cookie Domain Fix',
    summary: 'Fixed critical cookie domain issue that prevented successful login redirects on Replit deployments. Proper handling of Public Suffix List domains ensures OAuth SSO flows work correctly across all environments.',
    path: '/docs/release-notes/v1.0.8',
  },
  {
    version: '1.0.7',
    date: 'December 18, 2025',
    title: 'HubSpot Integration for Client User Signup Flow',
    summary: 'Automatic HubSpot CRM contact creation on client signup, AI-powered website analysis using GPT-4o for auto-filling business descriptions, redesigned 2-step signup wizard, and enhanced country/phone input components with flag icons.',
    path: '/docs/release-notes/v1.0.7',
  },
  {
    version: '1.0.6',
    date: 'December 17, 2025',
    title: 'AI-Powered Analytics & Enhanced Reporting',
    summary: 'New AI-powered analytics search with natural language queries, comprehensive date range filtering across all 10 analytics sections, and dynamically generated query suggestions based on current platform data.',
    path: '/docs/release-notes/v1.0.6',
  },
  {
    version: '1.0.5',
    date: 'December 13, 2025',
    title: 'Direct Google SSO Login Features',
    summary: 'Users can now sign in with "Continue with Google" using direct OAuth 2.0 integration - no third-party vendor dependency. Features secure one-time code exchange, httpOnly cookie token storage, and automatic account creation/linking.',
    path: '/docs/release-notes/v1.0.5',
  },
  {
    version: '1.0.4',
    date: 'December 11, 2025',
    title: 'Multi-Identity SSO & Account Security',
    summary: 'Users can link multiple emails to one account with smart identity resolution. Profile page improvements include Primary Email section, work emails in org cards, collapsible activity sections, and proper role badge formatting (HR, IT, CEO).',
    path: '/docs/release-notes/v1.0.4',
  },
  {
    version: '1.0.3',
    date: 'December 5, 2025',
    title: 'Performance Optimizations & Client RBAC',
    summary: 'Theme flash prevention, instant navigation rendering, multi-organization navigation improvements, extended client admin permissions for user management, and React hooks bug fixes.',
    path: '/docs/release-notes/v1.0.3',
  },
  {
    version: '1.0.2',
    date: 'December 4, 2025',
    title: 'My Apps Launcher & Admin Tools Enhancements',
    summary: 'New My Apps dropdown for quick access to connected applications, OAuth Configuration management, improved organization deletion, and Candidate Users redesign with suspension functionality.',
    path: '/docs/release-notes/v1.0.2',
  },
  {
    version: '1.0.1',
    date: 'December 3, 2025',
    title: 'User Activity Tracking',
    summary: 'Comprehensive user activity tracking capabilities enabling connected applications to send usage data to Teamified Accounts for centralized analytics and monitoring.',
    path: '/docs/release-notes/v1.0.1',
  },
  {
    version: '1.0.0',
    date: 'December 2, 2025',
    title: 'Teamified Accounts - Patch Notes',
    summary: 'Profile pictures support, organization creation improvements, and bug fixes for My Profile, Organization Management, and Candidate Management.',
    path: '/docs/release-notes/v1.0.0',
  },
];

export default function ReleaseNotesIndexPage() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <NewReleases color="primary" />
        Release Notes
      </Typography>

      <Typography variant="body1" paragraph color="text.secondary">
        Stay up to date with the latest features, improvements, and bug fixes in Teamified Accounts.
      </Typography>

      <Stack spacing={2}>
        {releaseNotes.map((release) => (
          <Card key={release.path} variant="outlined">
            <CardActionArea onClick={() => navigate(release.path)}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {release.title}
                      </Typography>
                      {release.isLatest && (
                        <Chip label="Latest" color="success" size="small" />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Chip label={`v${release.version}`} size="small" variant="outlined" />
                      <Typography variant="body2" color="text.secondary">
                        {release.date}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {release.summary}
                    </Typography>
                  </Box>
                  <ArrowForward color="action" sx={{ ml: 2 }} />
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>

      {releaseNotes.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
          <Typography variant="body1" color="text.secondary">
            No release notes available yet.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
