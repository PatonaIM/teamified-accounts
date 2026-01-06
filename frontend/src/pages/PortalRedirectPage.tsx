import { useEffect, useState, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PortalRedirectPage = () => {
  const navigate = useNavigate();
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
  const hasProcessed = useRef(false);
  const redirectStarted = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }
    hasProcessed.current = true;

    const target = sessionStorage.getItem('portalRedirectTarget');
    const targetName = sessionStorage.getItem('portalRedirectName');
    
    console.log('[PortalRedirectPage] Target:', target, 'Name:', targetName);
    
    if (target && !redirectStarted.current) {
      redirectStarted.current = true;
      setRedirectTarget(targetName || 'your portal');
      
      // Clear all portal redirect flags
      sessionStorage.removeItem('portalRedirectTarget');
      sessionStorage.removeItem('portalRedirectName');
      sessionStorage.removeItem('portalRedirectPending');
      
      // Redirect immediately without setTimeout to avoid React Strict Mode issues
      console.log('[PortalRedirectPage] Redirecting to:', target);
      window.location.replace(target);
    } else if (!target && !redirectStarted.current) {
      console.log('[PortalRedirectPage] No redirect target found, going to profile');
      sessionStorage.removeItem('portalRedirectPending');
      navigate('/account/profile', { replace: true });
    }
  }, [navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <CircularProgress 
        size={60} 
        sx={{ 
          color: 'white',
          mb: 3 
        }} 
      />
      <Typography variant="h5" sx={{ fontWeight: 500, mb: 1 }}>
        Redirecting you to {redirectTarget || 'your portal'}...
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.8 }}>
        Please wait a moment
      </Typography>
    </Box>
  );
};

export default PortalRedirectPage;
