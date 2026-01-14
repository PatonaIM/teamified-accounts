import { useEffect, useRef, useState, useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { getPortalName, getPortalUrl, type PortalType, isPortalConfigValid, getMissingPortalVariables } from '../config/portalUrls';
import { inferFallbackPortal } from '../utils/portalRedirect';
import { fetchCurrentUser, isAuthenticated as checkIsAuthenticated } from '../services/authService';
import ConfigurationErrorPage from './ConfigurationErrorPage';

const ALLOWED_PATHS = [
  '/logout',
  '/portal-redirect',
  '/docs',
  '/signup-select',
  '/signup-candidate',
  '/signup-client-admin',
  '/signup-success',
  '/google-signup-success',
  '/verify-email',
  '/reset-password',
  '/forgot-password',
  '/invitations/preview',
  '/invitations/accept',
  '/accept-invitation',
  '/callback',
  '/auth/callback',
  '/auth/google/callback',
  '/signup/path',
  '/test',
  '/login',
];

function isAllowedPath(pathname: string): boolean {
  return ALLOWED_PATHS.some(path => pathname.startsWith(path));
}

type GuardState = 'loading' | 'resolving' | 'redirecting' | 'allow_accounts';

interface PortalRedirectEnforcerProps {
  children: ReactNode;
}

export default function PortalRedirectEnforcer({ children }: PortalRedirectEnforcerProps): React.ReactElement {
  const location = useLocation();
  const { user, loading, setUser } = useAuth();
  const fetchAttemptedRef = useRef(false);
  const redirectInitiatedRef = useRef(false);
  const [resolving, setResolving] = useState(false);
  const [redirectPortal, setRedirectPortal] = useState<string | null>(null);

  const isAllowed = useMemo(() => isAllowedPath(location.pathname), [location.pathname]);
  
  const portalConfigValid = useMemo(() => isPortalConfigValid(), []);
  const missingVariables = useMemo(() => getMissingPortalVariables(), []);
  
  if (!portalConfigValid) {
    return (
      <ConfigurationErrorPage
        title="Portal Configuration Error"
        message="The application cannot redirect users to their designated portals because required environment variables are missing."
        details={missingVariables}
      />
    );
  }

  const isSuperAdmin = useMemo(() => {
    return user?.roles?.some((role: string) => 
      ['super_admin', 'system_admin'].includes(role.toLowerCase())
    ) ?? false;
  }, [user]);

  const guardState = useMemo((): GuardState => {
    if (isAllowed) return 'allow_accounts';
    if (loading) return 'loading';
    if (resolving) return 'resolving';
    if (redirectPortal) return 'redirecting';
    
    // Check for valid authentication before making any redirect decisions
    const hasValidToken = checkIsAuthenticated();
    if (!user || !hasValidToken) return 'loading';
    
    if (isSuperAdmin) return 'allow_accounts';
    if (user.preferredPortal === 'accounts') return 'allow_accounts';
    
    if (user.preferredPortal === 'ats' || user.preferredPortal === 'jobseeker') {
      return 'redirecting';
    }
    
    return 'resolving';
  }, [isAllowed, loading, resolving, redirectPortal, user, isSuperAdmin]);

  useEffect(() => {
    if (redirectInitiatedRef.current) return;
    if (loading) return;
    if (isAllowed) return;
    
    // CRITICAL: Verify token is still valid before making any redirect decisions
    // This prevents redirect loops caused by stale localStorage user data
    const hasValidToken = checkIsAuthenticated();
    
    if (!user || !hasValidToken) {
      console.log('[PortalRedirectEnforcer] No user or invalid token, redirecting to login', { user: !!user, hasValidToken });
      redirectInitiatedRef.current = true;
      window.location.replace(`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    
    if (isSuperAdmin) {
      console.log('[PortalRedirectEnforcer] Super admin, allowing access');
      return;
    }
    
    if (user.preferredPortal === 'accounts') {
      console.log('[PortalRedirectEnforcer] preferredPortal=accounts, allowing access');
      return;
    }

    if (user.preferredPortal === 'ats' || user.preferredPortal === 'jobseeker') {
      const portalUrl = getPortalUrl(user.preferredPortal);
      console.log('[PortalRedirectEnforcer] Portal URL lookup result:', { preferredPortal: user.preferredPortal, portalUrl });
      if (portalUrl) {
        console.log('[PortalRedirectEnforcer] Initiating redirect to portal:', user.preferredPortal, portalUrl);
        redirectInitiatedRef.current = true;
        setRedirectPortal(user.preferredPortal);
        setTimeout(() => {
          console.log('[PortalRedirectEnforcer] Executing redirect to:', portalUrl);
          window.location.href = portalUrl;
        }, 100);
        return;
      } else {
        console.warn('[PortalRedirectEnforcer] Portal URL not configured for:', user.preferredPortal, '- allowing access to Accounts');
        return;
      }
    }

    if (!fetchAttemptedRef.current && !resolving) {
      console.log('[PortalRedirectEnforcer] preferredPortal missing/invalid, force-fetching /me');
      fetchAttemptedRef.current = true;
      setResolving(true);
      
      fetchCurrentUser().then(freshUser => {
        console.log('[PortalRedirectEnforcer] Fresh user data:', freshUser);
        
        if (freshUser && setUser) {
          const isFreshSuperAdmin = freshUser.roles?.some((role: string) => 
            ['super_admin', 'system_admin'].includes(role.toLowerCase())
          );
          
          if (isFreshSuperAdmin) {
            console.log('[PortalRedirectEnforcer] Fresh user is super admin, allowing access');
            setUser(freshUser);
            setResolving(false);
            return;
          }
          
          if (freshUser.preferredPortal === 'accounts') {
            console.log('[PortalRedirectEnforcer] Fresh user has preferredPortal=accounts');
            setUser(freshUser);
            setResolving(false);
            return;
          }
          
          if (freshUser.preferredPortal === 'ats' || freshUser.preferredPortal === 'jobseeker') {
            const portalUrl = getPortalUrl(freshUser.preferredPortal);
            console.log('[PortalRedirectEnforcer] Fresh data portal URL lookup:', { preferredPortal: freshUser.preferredPortal, portalUrl });
            if (portalUrl) {
              console.log('[PortalRedirectEnforcer] Redirecting to portal from fresh data:', freshUser.preferredPortal, portalUrl);
              redirectInitiatedRef.current = true;
              setRedirectPortal(freshUser.preferredPortal);
              setTimeout(() => {
                console.log('[PortalRedirectEnforcer] Executing redirect from fresh data to:', portalUrl);
                window.location.href = portalUrl;
              }, 100);
              return;
            }
          }
          
          const fallbackPortal = inferFallbackPortal(freshUser);
          const fallbackUrl = getPortalUrl(fallbackPortal);
          if (fallbackUrl) {
            console.log('[PortalRedirectEnforcer] Using fallback portal:', fallbackPortal, fallbackUrl);
            freshUser.preferredPortal = fallbackPortal;
            setUser(freshUser);
            redirectInitiatedRef.current = true;
            setRedirectPortal(fallbackPortal);
            setTimeout(() => {
              console.log('[PortalRedirectEnforcer] Executing fallback redirect to:', fallbackUrl);
              window.location.href = fallbackUrl;
            }, 100);
            return;
          }
          
          console.warn('[PortalRedirectEnforcer] No portal URL available, allowing access to Accounts');
          setResolving(false);
          return;
        }
        
        console.warn('[PortalRedirectEnforcer] Fetch returned no user, redirecting to login');
        redirectInitiatedRef.current = true;
        window.location.replace(`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`);
      }).catch(err => {
        console.error('[PortalRedirectEnforcer] Failed to fetch fresh user:', err);
        
        // If token is no longer valid, redirect to login instead of using stale fallback
        if (!checkIsAuthenticated()) {
          console.log('[PortalRedirectEnforcer] Token invalid after fetch failure, redirecting to login');
          redirectInitiatedRef.current = true;
          window.location.replace(`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`);
          return;
        }
        
        const fallbackPortal = inferFallbackPortal(user);
        const fallbackUrl = getPortalUrl(fallbackPortal);
        if (fallbackUrl) {
          console.log('[PortalRedirectEnforcer] Fetch failed, using fallback portal:', fallbackPortal, fallbackUrl);
          redirectInitiatedRef.current = true;
          setRedirectPortal(fallbackPortal);
          setTimeout(() => {
            console.log('[PortalRedirectEnforcer] Executing error fallback redirect to:', fallbackUrl);
            window.location.href = fallbackUrl;
          }, 100);
        } else {
          console.warn('[PortalRedirectEnforcer] Fetch failed and no fallback URL, allowing access to Accounts');
          setResolving(false);
        }
      });
      return;
    }
  }, [location.pathname, location.search, user, loading, isAllowed, resolving, setUser, isSuperAdmin]);

  if (guardState === 'allow_accounts') {
    return <>{children}</>;
  }

  const getMessage = () => {
    // Never show redirect message without valid authentication
    const hasValidToken = checkIsAuthenticated();
    if (!hasValidToken) {
      return 'Loading...';
    }
    
    if (redirectPortal) {
      return `Redirecting you to ${getPortalName(redirectPortal as PortalType)}...`;
    }
    switch (guardState) {
      case 'redirecting':
        return user?.preferredPortal 
          ? `Redirecting you to ${getPortalName(user.preferredPortal)}...`
          : 'Redirecting...';
      case 'resolving':
        return 'Checking your access...';
      default:
        return 'Loading...';
    }
  };

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
      <CircularProgress size={60} sx={{ color: 'white', mb: 3 }} />
      <Typography variant="h5" sx={{ fontWeight: 500, mb: 1 }}>
        {getMessage()}
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.8 }}>
        Please wait a moment
      </Typography>
    </Box>
  );
}
