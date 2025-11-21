import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import { getAccessToken } from '../services/authService';

const DebugTokenPage: React.FC = () => {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          setError('No access token found. Please log in.');
          setLoading(false);
          return;
        }

        // Call the debug endpoint
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/v1/auth/debug/token`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch token info: ${response.statusText}`);
        }

        const data = await response.json();
        setTokenInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTokenInfo();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        JWT Token Debug Info
      </Typography>
      
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Token Payload
          </Typography>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '16px', 
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '14px'
          }}>
            {JSON.stringify(tokenInfo, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {tokenInfo?.payload?.roles && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Roles
            </Typography>
            {tokenInfo.payload.roles.length > 0 ? (
              <Box>
                {tokenInfo.payload.roles.map((role: string, index: number) => (
                  <Typography key={index} variant="body1" sx={{ 
                    display: 'inline-block',
                    px: 2,
                    py: 1,
                    m: 0.5,
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: 1
                  }}>
                    {role}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Alert severity="warning">
                No roles found in token! This is why you're being redirected to login.
                <br /><br />
                Solution: Log out and sign in again with Google OAuth to get a fresh token with your roles.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {tokenInfo?.note && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {tokenInfo.note}
        </Alert>
      )}
    </Box>
  );
};

export default DebugTokenPage;
