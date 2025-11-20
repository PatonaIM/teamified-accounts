import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Apps as AppsIcon } from '@mui/icons-material';

export default function MyAppsPage() {
  return (
    <Box sx={{ p: 4, maxWidth: 900 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        My Apps
      </Typography>

      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          bgcolor: 'background.paper',
          border: '2px dashed',
          borderColor: 'divider',
        }}
      >
        <AppsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          Apps Marketplace
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Coming Soon
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 500, mx: 'auto' }}>
          Discover and connect third-party applications to enhance your Teamified experience.
        </Typography>
      </Paper>
    </Box>
  );
}
