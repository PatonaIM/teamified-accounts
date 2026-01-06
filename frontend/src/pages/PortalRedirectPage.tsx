import { useEffect, useState, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PortalRedirectPage = () => {
  const navigate = useNavigate();
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }
    hasProcessed.current = true;

    const target = sessionStorage.getItem('portalRedirectTarget');
    const targetName = sessionStorage.getItem('portalRedirectName');
    
    console.log('[PortalRedirectPage] Target:', target, 'Name:', targetName);
    
    if (target) {
      setRedirectTarget(targetName || 'your portal');
      sessionStorage.removeItem('portalRedirectTarget');
      sessionStorage.removeItem('portalRedirectName');
      
      const timer = setTimeout(() => {
        console.log('[PortalRedirectPage] Redirecting to:', target);
        window.location.replace(target);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      console.log('[PortalRedirectPage] No redirect target found, going to profile');
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
