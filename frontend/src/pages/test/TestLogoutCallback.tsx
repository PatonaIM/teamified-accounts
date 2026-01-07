import { useEffect } from 'react';

export default function TestLogoutCallback() {
  useEffect(() => {
    sessionStorage.removeItem('sso_test_session');
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('pkce_state');
    
    localStorage.removeItem('teamified_access_token');
    localStorage.removeItem('teamified_refresh_token');
    localStorage.removeItem('teamified_csrf_token');
    localStorage.removeItem('teamified_user_data');
    
    console.log('[SSO Test] Front-channel logout received - tokens cleared');
  }, []);

  return <div>Logged out</div>;
}
