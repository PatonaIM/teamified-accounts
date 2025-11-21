import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[AuthCallback] Processing OAuth callback...');
        
        const tokenData = await authService.handleCallback();
        
        console.log('[AuthCallback] Success! User:', tokenData.user.email);
        console.log('[AuthCallback] Roles:', tokenData.user.roles);
        
        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('[AuthCallback] Error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        
        // Redirect to login after 3 seconds
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2 style={{ color: 'red' }}>Authentication Error</h2>
        <p>{error}</p>
        <p style={{ color: '#666', marginTop: '20px' }}>Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2>Completing sign-in...</h2>
      <p>Please wait while we authenticate your account</p>
      <div style={{ marginTop: '20px' }}>
        <div style={{ 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
      </div>
    </div>
  );
};
