/**
 * Role-to-App Access Matrix
 * Based on PRD section 3.4: Access Control Matrix
 * 
 * This defines default app permissions for each role.
 * Super admins can override these defaults for individual users.
 */

export type AppKey = 
  | 'candidate_portal'
  | 'team_connect'
  | 'hris'
  | 'ats'
  | 'finance'
  | 'data_dashboard';

export interface AppAccessConfig {
  canAccess: boolean;
  scope?: 'all_orgs' | 'own_org' | 'public' | 'interviews' | 'view_only' | 'limited';
  description?: string;
}

/**
 * Role-to-App Access Matrix
 * Maps role types to their default app access permissions
 */
export const ROLE_APP_ACCESS_MATRIX: Record<string, Partial<Record<AppKey, AppAccessConfig>>> = {
  // ===== Internal Roles (Global Access) =====
  super_admin: {
    candidate_portal: { canAccess: true, scope: 'all_orgs', description: 'Full access to all organizations' },
    team_connect: { canAccess: true, scope: 'all_orgs', description: 'Full access to all organizations' },
    hris: { canAccess: true, scope: 'all_orgs', description: 'Full access to all organizations' },
    ats: { canAccess: true, scope: 'all_orgs', description: 'Full access to all organizations' },
    finance: { canAccess: true, scope: 'all_orgs', description: 'Full access to all organizations' },
    data_dashboard: { canAccess: true, scope: 'all_orgs', description: 'Full access to all organizations' },
  },

  internal_hr: {
    candidate_portal: { canAccess: false },
    team_connect: { canAccess: true, scope: 'all_orgs', description: 'Access to all organizations' },
    hris: { canAccess: true, scope: 'all_orgs', description: 'HR operations across all organizations' },
    ats: { canAccess: false },
    finance: { canAccess: false },
    data_dashboard: { canAccess: true, scope: 'view_only', description: 'View all data across organizations' },
  },

  internal_recruiter: {
    candidate_portal: { canAccess: true, scope: 'all_orgs', description: 'Access to all organizations' },
    team_connect: { canAccess: true, scope: 'all_orgs', description: 'Access to all organizations' },
    hris: { canAccess: false },
    ats: { canAccess: true, scope: 'all_orgs', description: 'Recruiting across all organizations' },
    finance: { canAccess: false },
    data_dashboard: { canAccess: true, scope: 'view_only', description: 'View all data across organizations' },
  },

  internal_account_manager: {
    candidate_portal: { canAccess: false },
    team_connect: { canAccess: true, scope: 'all_orgs', description: 'Client support across organizations' },
    hris: { canAccess: true, scope: 'all_orgs', description: 'Client account management' },
    ats: { canAccess: false },
    finance: { canAccess: false },
    data_dashboard: { canAccess: true, scope: 'view_only', description: 'View all data across organizations' },
  },

  internal_finance: {
    candidate_portal: { canAccess: false },
    team_connect: { canAccess: true, scope: 'all_orgs', description: 'Access to all organizations' },
    hris: { canAccess: true, scope: 'all_orgs', description: 'HR data access for finance' },
    ats: { canAccess: false },
    finance: { canAccess: true, scope: 'all_orgs', description: 'Financial operations across all organizations' },
    data_dashboard: { canAccess: true, scope: 'view_only', description: 'View all data across organizations' },
  },

  internal_marketing: {
    candidate_portal: { canAccess: false },
    team_connect: { canAccess: true, scope: 'all_orgs', description: 'Marketing across organizations' },
    hris: { canAccess: false },
    ats: { canAccess: false },
    finance: { canAccess: false },
    data_dashboard: { canAccess: true, scope: 'view_only', description: 'View all data for marketing insights' },
  },

  // ===== Client Roles (Organization-Scoped) =====
  client_admin: {
    candidate_portal: { canAccess: false },
    team_connect: { canAccess: true, scope: 'own_org', description: 'Access to own organization only' },
    hris: { canAccess: true, scope: 'own_org', description: 'Full HR access for own organization' },
    ats: { canAccess: true, scope: 'own_org', description: 'Recruitment management for own organization' },
    finance: { canAccess: false },
    data_dashboard: { canAccess: false },
  },

  client_recruiter: {
    candidate_portal: { canAccess: false },
    team_connect: { canAccess: true, scope: 'own_org', description: 'Collaboration for own organization' },
    hris: { canAccess: false },
    ats: { canAccess: true, scope: 'own_org', description: 'Recruitment for own organization' },
    finance: { canAccess: false },
    data_dashboard: { canAccess: false },
  },

  client_hr: {
    candidate_portal: { canAccess: false },
    team_connect: { canAccess: true, scope: 'own_org', description: 'Collaboration for own organization' },
    hris: { canAccess: true, scope: 'own_org', description: 'HR operations for own organization' },
    ats: { canAccess: false },
    finance: { canAccess: false },
    data_dashboard: { canAccess: false },
  },

  client_finance: {
    candidate_portal: { canAccess: false },
    team_connect: { canAccess: true, scope: 'own_org', description: 'Collaboration for own organization' },
    hris: { canAccess: true, scope: 'limited', description: 'Limited HR data access' },
    ats: { canAccess: false },
    finance: { canAccess: false },
    data_dashboard: { canAccess: false },
  },

  client_employee: {
    candidate_portal: { canAccess: false },
    team_connect: { canAccess: true, scope: 'own_org', description: 'Team collaboration' },
    hris: { canAccess: true, scope: 'view_only', description: 'View own HR data only' },
    ats: { canAccess: false },
    finance: { canAccess: false },
    data_dashboard: { canAccess: false },
  },

  // ===== Public Role =====
  candidate: {
    candidate_portal: { canAccess: true, scope: 'public', description: 'Public access for job applications' },
    team_connect: { canAccess: true, scope: 'interviews', description: 'Interview participation only' },
    hris: { canAccess: false },
    ats: { canAccess: false },
    finance: { canAccess: false },
    data_dashboard: { canAccess: false },
  },
};

/**
 * Check if a role has global access (internal users + super admin)
 */
export function hasGlobalAccess(roleType: string): boolean {
  return roleType.startsWith('super_admin') || roleType.startsWith('internal_');
}

/**
 * Get default app access for a role
 */
export function getDefaultAppAccess(roleType: string, appKey: AppKey): AppAccessConfig {
  const roleAccess = ROLE_APP_ACCESS_MATRIX[roleType];
  return roleAccess?.[appKey] || { canAccess: false };
}

/**
 * Get all apps a role has default access to
 */
export function getDefaultAppsForRole(roleType: string): AppKey[] {
  const roleAccess = ROLE_APP_ACCESS_MATRIX[roleType];
  if (!roleAccess) return [];

  return (Object.keys(roleAccess) as AppKey[]).filter(
    (appKey) => roleAccess[appKey]?.canAccess === true
  );
}

/**
 * Map OAuth client IDs to app keys
 * This should be configured based on actual OAuth client registrations
 */
export const OAUTH_CLIENT_TO_APP_MAP: Record<string, AppKey> = {
  // These will be populated based on actual OAuth client IDs
  // Example:
  // 'candidate-portal-client-id': 'candidate_portal',
  // 'team-connect-client-id': 'team_connect',
};

/**
 * Get app key from OAuth client ID
 */
export function getAppKeyFromClientId(clientId: string): AppKey | null {
  return OAUTH_CLIENT_TO_APP_MAP[clientId] || null;
}
