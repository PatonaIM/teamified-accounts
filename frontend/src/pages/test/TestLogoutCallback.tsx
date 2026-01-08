import { useEffect } from 'react';

export default function TestLogoutCallback() {
  useEffect(() => {
    localStorage.removeItem('teamified_access_token');
    localStorage.removeItem('teamified_refresh_token');
    localStorage.removeItem('teamified_csrf_token');
    localStorage.removeItem('teamified_user_data');
    
    localStorage.setItem('sso_logout_signal', Date.now().toString());
    
    console.log('[SSO Test] Front-channel logout received - logout signal sent');
  }, []);

  return <div>Logged out</div>;
}
