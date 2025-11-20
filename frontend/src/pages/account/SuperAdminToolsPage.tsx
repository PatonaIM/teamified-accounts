import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function SuperAdminToolsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Super Admin Tools</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Organizations</Typography>
              <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                Manage client organizations and tenants
              </Typography>
              <Button component={Link} to="/admin/organizations" variant="contained">
                Manage Organizations
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Internal Users</Typography>
              <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                Manage Teamified internal team members
              </Typography>
              <Button component={Link} to="/admin/tools/internal-users" variant="contained">
                Manage Internal Users
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
