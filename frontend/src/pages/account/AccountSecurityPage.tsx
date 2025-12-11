import { Box, Typography, Container, Divider } from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import { LinkedEmails } from '../../components/account/LinkedEmails';
import { ChangePassword } from '../../components/account/ChangePassword';

export default function AccountSecurityPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon fontSize="large" />
          Account Security
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Manage your login credentials and linked email addresses
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <LinkedEmails />
        
        <Divider />
        
        <ChangePassword />
      </Box>
    </Container>
  );
}
