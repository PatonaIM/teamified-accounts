import React from 'react';
import { Box, Typography } from '@mui/material';

export default function AuditLogsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Audit Logs</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        System audit logs coming soon.
      </Typography>
    </Box>
  );
}
