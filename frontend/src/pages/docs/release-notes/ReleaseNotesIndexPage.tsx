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
    version: '1.0.4',
    date: 'December 13, 2025',
    title: 'Multi-Identity SSO & Account Security',
    summary: 'Users can now link multiple email addresses (personal and work) to a single account. New Account Security page for managing linked emails and self-service password changes. Smart identity resolution enables login with any linked email using one password.',
    path: '/docs/release-notes/2025-12-13',
    isLatest: true,
  },
  {
    version: '1.0.3',
    date: 'December 5, 2025',
    title: 'Performance Optimizations & Client RBAC',
    summary: 'Theme flash prevention, instant navigation rendering, multi-organization navigation improvements, extended client admin permissions for user management, and React hooks bug fixes.',
    path: '/docs/release-notes/2025-12-05',
  },
  {
    version: '1.0.2',
    date: 'December 4, 2025',
    title: 'My Apps Launcher & Admin Tools Enhancements',
    summary: 'New My Apps dropdown for quick access to connected applications, OAuth Configuration management, improved organization deletion, and Candidate Users redesign with suspension functionality.',
    path: '/docs/release-notes/2025-12-04',
  },
  {
    version: '1.0.1',
    date: 'December 3, 2025',
    title: 'User Activity Tracking',
    summary: 'Comprehensive user activity tracking capabilities enabling connected applications to send usage data to Teamified Accounts for centralized analytics and monitoring.',
    path: '/docs/release-notes/2025-12-03',
  },
  {
    version: '1.0.0',
    date: 'December 2, 2025',
    title: 'Teamified Accounts - Patch Notes',
    summary: 'Profile pictures support, organization creation improvements, and bug fixes for My Profile, Organization Management, and Candidate Management.',
    path: '/docs/release-notes/2025-12-02',
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
