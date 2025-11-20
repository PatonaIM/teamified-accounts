import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

export default function InvitationPreviewPage() {
  const { code } = useParams();
  
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading invitation preview...
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Code: {code}
        </Typography>
      </Box>
    </Box>
  );
}
