import React from 'react';
import { Box, Typography, Paper, Stack, Grid } from '@mui/material';
import { Dashboard, People, Business, VpnKey } from '@mui/icons-material';

export default function HomePage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
        Welcome to Teamified Accounts
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Centralized authentication and user management platform
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              height: '100%',
            }}
          >
            <Dashboard color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overview of your account and activities
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              height: '100%',
            }}
          >
            <People color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Users
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage users and permissions
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              height: '100%',
            }}
          >
            <Business color="primary" sx={{ fontSize: 48, mb: 2 }}  />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Organizations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage client organizations
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              height: '100%',
            }}
          >
            <VpnKey color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              SSO
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Single Sign-On authentication
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Quick Links
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            • <a href="/admin/users" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>User Management</a> - Create and manage user accounts
          </Typography>
          <Typography variant="body2">
            • <a href="/admin/organizations" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>Organizations</a> - Manage client organizations
          </Typography>
          <Typography variant="body2">
            • <a href="/settings" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>Settings</a> - Configure OAuth clients and API keys
          </Typography>
          <Typography variant="body2">
            • <a href="/docs" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>Documentation</a> - Integration guides and API documentation
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
