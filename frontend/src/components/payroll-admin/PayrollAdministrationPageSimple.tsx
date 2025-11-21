/**
 * Simplified Payroll Administration Page for debugging
 */

import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const PayrollAdministrationPageSimple: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Payroll Administration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Advanced payroll processing, monitoring, and bulk operations
        </Typography>
      </Box>
      
      <Box>
        <Typography>This is a simplified test version.</Typography>
        <Typography>Backend APIs are working at: /api/v1/payroll/admin/*</Typography>
      </Box>
    </Container>
  );
};

export default PayrollAdministrationPageSimple;

