import { useEffect, useRef, useState, ReactNode, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { isPortalRedirectEnabled } from '../utils/featureFlags';
import { isPortalConfigValid, getPortalName, getPortalUrl } from '../config/portalUrls';
import { computePortalRedirect, inferFallbackPortal } from '../utils/portalRedirect';
import { fetchCurrentUser } from '../services/authService';

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

type GuardState = 'loading' | 'resolving' | 'redirecting' | 'allow_accounts' | 'redirect_to_login';

interface PortalRedirectEnforcerProps {
  children: ReactNode;
}

export default function PortalRedirectEnforcer({ children }: PortalRedirectEnforcerProps): JSX.Element {
  const location = useLocation();
  const { user, loading, setUser } = useAuth();
  const fetchAttemptedRef = useRef(false);
  const redirectInitiatedRef = useRef(false);
  const [resolving, setResolving] = useState(false);
  const [redirectPortal, setRedirectPortal] = useState<string | null>(null);

  const isAllowed = useMemo(() => isAllowedPath(location.pathname), [location.pathname]);
  const portalRedirectEnabled = isPortalRedirectEnabled() && isPortalConfigValid();

  const decision = useMemo(() => {
    if (!user) return null;
    return computePortalRedirect(user);
  }, [user]);

  const guardState = useMemo((): GuardState => {
    if (isAllowed) return 'allow_accounts';
    if (loading) return 'loading';
    if (resolving) return 'resolving';
    if (redirectPortal) return 'redirecting';
    
    if (!user) return 'redirect_to_login';
    if (!portalRedirectEnabled) return 'allow_accounts';
    
    if (decision?.reason === 'super_admin') return 'allow_accounts';
    if (decision?.reason === 'accounts_portal') return 'allow_accounts';
    if (decision?.reason === 'feature_disabled') return 'allow_accounts';
    if (decision?.reason === 'config_invalid') return 'allow_accounts';
    
    if (decision?.shouldRedirect) return 'redirecting';
    if (decision?.reason === 'pending_portal_decision') return 'resolving';
    
    return 'allow_accounts';
  }, [isAllowed, loading, resolving, redirectPortal, user, portalRedirectEnabled, decision]);

  useEffect(() => {
    if (redirectInitiatedRef.current) return;
    if (loading) return;
    if (isAllowed) return;
    
    if (!user) {
      console.log('[PortalRedirectEnforcer] No user, redirecting to login');
      redirectInitiatedRef.current = true;
      window.location.replace(`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    
    if (!portalRedirectEnabled) return;

    console.log('[PortalRedirectEnforcer] Decision:', decision);

    if (decision?.reason === 'pending_portal_decision' && !fetchAttemptedRef.current && !resolving) {
      console.log('[PortalRedirectEnforcer] preferredPortal missing, force-fetching /me');
      fetchAttemptedRef.current = true;
      setResolving(true);
      
      fetchCurrentUser().then(freshUser => {
        console.log('[PortalRedirectEnforcer] Fresh user data:', freshUser);
        
        if (freshUser && setUser) {
          if (freshUser.preferredPortal && freshUser.preferredPortal !== 'accounts') {
            setUser(freshUser);
            const portalUrl = getPortalUrl(freshUser.preferredPortal);
            if (portalUrl) {
              console.log('[PortalRedirectEnforcer] Redirecting to portal from fresh data:', freshUser.preferredPortal);
              redirectInitiatedRef.current = true;
              setRedirectPortal(freshUser.preferredPortal);
              window.location.replace(portalUrl);
              return;
            }
          }
          
          const fallbackPortal = inferFallbackPortal(freshUser);
          const fallbackUrl = getPortalUrl(fallbackPortal);
          if (fallbackUrl) {
            console.log('[PortalRedirectEnforcer] Using fallback portal:', fallbackPortal);
            freshUser.preferredPortal = fallbackPortal;
            setUser(freshUser);
            redirectInitiatedRef.current = true;
            setRedirectPortal(fallbackPortal);
            window.location.replace(fallbackUrl);
            return;
          }
        }
        
        setResolving(false);
      }).catch(err => {
        console.error('[PortalRedirectEnforcer] Failed to fetch fresh user:', err);
        const fallbackPortal = inferFallbackPortal(user);
        const fallbackUrl = getPortalUrl(fallbackPortal);
        if (fallbackUrl) {
          console.log('[PortalRedirectEnforcer] Fetch failed, using fallback portal:', fallbackPortal);
          redirectInitiatedRef.current = true;
          setRedirectPortal(fallbackPortal);
          window.location.replace(fallbackUrl);
        } else {
          setResolving(false);
        }
      });
      return;
    }

    if (decision?.shouldRedirect && decision.portalUrl) {
      console.log('[PortalRedirectEnforcer] Redirecting to portal:', decision.portalType);
      redirectInitiatedRef.current = true;
      setRedirectPortal(decision.portalType);
      window.location.replace(decision.portalUrl);
    }
  }, [location.pathname, location.search, user, loading, decision, isAllowed, portalRedirectEnabled, resolving, setUser]);

  if (guardState === 'allow_accounts') {
    return <>{children}</>;
  }

  const getMessage = () => {
    switch (guardState) {
      case 'redirecting':
        return redirectPortal 
          ? `Redirecting you to ${getPortalName(redirectPortal)}...`
          : decision?.portalType 
            ? `Redirecting you to ${getPortalName(decision.portalType)}...`
            : 'Redirecting...';
      case 'resolving':
        return 'Checking your access...';
      case 'redirect_to_login':
        return 'Redirecting to login...';
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
