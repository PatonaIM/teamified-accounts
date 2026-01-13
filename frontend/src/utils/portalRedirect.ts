import { isPortalRedirectEnabled } from './featureFlags';
import { getPortalUrl, isPortalConfigValid } from '../config/portalUrls';

export interface PortalRedirectDecision {
  shouldRedirect: boolean;
  portalUrl: string | null;
  portalType: 'ats' | 'jobseeker' | 'accounts' | null;
  reason: string;
}

export function computePortalRedirect(user: any): PortalRedirectDecision {
  if (!user) {
    return { shouldRedirect: false, portalUrl: null, portalType: null, reason: 'no_user' };
  }

  if (!isPortalRedirectEnabled()) {
    return { shouldRedirect: false, portalUrl: null, portalType: null, reason: 'feature_disabled' };
  }

  if (!isPortalConfigValid()) {
    return { shouldRedirect: false, portalUrl: null, portalType: null, reason: 'config_invalid' };
  }

  const isSuperAdmin = user.roles?.some((role: string) => 
    ['super_admin', 'system_admin'].includes(role.toLowerCase())
  );

  if (isSuperAdmin) {
    return { shouldRedirect: false, portalUrl: null, portalType: 'accounts', reason: 'super_admin' };
  }

  if (user.preferredPortal === 'accounts') {
    return { 
      shouldRedirect: false, 
      portalUrl: null, 
      portalType: 'accounts', 
      reason: 'accounts_portal' 
    };
  }

  if (!user.preferredPortal) {
    return { 
      shouldRedirect: false, 
      portalUrl: null, 
      portalType: null, 
      reason: 'pending_portal_decision' 
    };
  }

  const portalUrl = getPortalUrl(user.preferredPortal);
  if (!portalUrl) {
    return { shouldRedirect: false, portalUrl: null, portalType: user.preferredPortal, reason: 'no_portal_url' };
  }

  return { 
    shouldRedirect: true, 
    portalUrl, 
    portalType: user.preferredPortal,
    reason: 'redirect_required' 
  };
}

export function isPortalDecisionPending(user: any): boolean {
  if (!user) return true;
  if (!isPortalRedirectEnabled()) return false;
  if (!isPortalConfigValid()) return false;
  
  const isSuperAdmin = user.roles?.some((role: string) => 
    ['super_admin', 'system_admin'].includes(role.toLowerCase())
  );
  if (isSuperAdmin) return false;
  
  return user.preferredPortal === undefined;
}

export function inferFallbackPortal(user: any): 'ats' | 'jobseeker' {
  if (!user?.email) return 'jobseeker';
  
  const email = user.email.toLowerCase();
  const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'protonmail.com', 'mail.com'];
  const domain = email.split('@')[1];
  
  if (personalDomains.includes(domain)) {
    return 'jobseeker';
  }
  
  return 'ats';
}
