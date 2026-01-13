import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isPortalRedirectEnabled } from '../utils/featureFlags';
import { getPortalUrl, isPortalConfigValid } from '../config/portalUrls';

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
];

function isAllowedPath(pathname: string): boolean {
  return ALLOWED_PATHS.some(path => pathname.startsWith(path));
}

export default function PortalRedirectEnforcer(): null {
  const location = useLocation();
  const { user, loading } = useAuth();
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (redirectingRef.current) return;
    if (loading) return;
    if (!user) return;
    if (!isPortalRedirectEnabled()) return;
    if (!isPortalConfigValid()) return;
    if (isAllowedPath(location.pathname)) return;

    const isSuperAdmin = user.roles?.some((role: string) => 
      ['super_admin', 'system_admin'].includes(role.toLowerCase())
    );
    if (isSuperAdmin) return;

    if (!user.preferredPortal || user.preferredPortal === 'accounts') return;

    const portalUrl = getPortalUrl(user.preferredPortal);
    if (!portalUrl) return;

    console.log('[PortalRedirectEnforcer] Redirecting authenticated non-super-admin to portal:', user.preferredPortal);
    redirectingRef.current = true;
    window.location.replace(portalUrl);
  }, [location.pathname, user, loading]);

  return null;
}
