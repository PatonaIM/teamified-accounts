import React from 'react';
import { Box, Typography } from '@mui/material';

export default function MyAppsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">My Apps</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        OAuth applications management coming soon.
      </Typography>
    </Box>
  );
}
