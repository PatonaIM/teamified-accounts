import { Box, Typography, Paper, Alert, AlertTitle } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface ConfigurationErrorPageProps {
  title?: string;
  message: string;
  details?: string[];
}

export default function ConfigurationErrorPage({ 
  title = 'Configuration Error', 
  message,
  details = []
}: ConfigurationErrorPageProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        padding: 3,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 600,
          width: '100%',
          p: 4,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <ErrorOutline 
          sx={{ 
            fontSize: 80, 
            color: 'error.main',
            mb: 2,
          }} 
        />
        
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {message}
        </Typography>
        
        {details.length > 0 && (
          <Alert severity="error" sx={{ textAlign: 'left', mt: 2 }}>
            <AlertTitle>Missing Configuration</AlertTitle>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {details.map((detail, index) => (
                <li key={index}>
                  <Typography variant="body2" component="span" sx={{ fontFamily: 'monospace' }}>
                    {detail}
                  </Typography>
                </li>
              ))}
            </Box>
          </Alert>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          Please contact your system administrator to resolve this issue.
        </Typography>
      </Paper>
    </Box>
  );
}
