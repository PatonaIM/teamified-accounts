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
  | 'data_dashboard'
  | 'alexia_ai';

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
    alexia_ai: { canAccess: true, scope: 'all_orgs', description: 'AI assistant access across all organizations' },
  },

  internal_hr: {
    candidate_portal: { canAccess: false },
    team_connect: { canAccess: true, scope: 'all_orgs', description: 'Access to all organizations' },
    hris: { canAccess: true, scope: 'all_orgs', description: 'HR operations across all organizations' },
    ats: { canAccess: false },
    finance: { canAccess: false },
    data_dashboard: { canAccess: true, scope: 'view_only', description: 'View all data across organizations' },
    alexia_ai: { canAccess: true, scope: 'all_orgs', description: 'AI assistant for HR operations' },
  },

  internal_recruiter: {
    candidate_portal: { canAccess: true, scope: 'all_orgs', description: 'Access to all organizations' },
    team_connect: { canAccess: true, scope: 'all_orgs', description: 'Access to all organizations' },
    hris: { canAccess: false },
    ats: { canAccess: true, scope: 'all_orgs', description: 'Recruiting across all organizations' },
    finance: { canAccess: false },
    data_dashboard: { canAccess: true, scope: 'view_only', description: 'View all data across organizations' },
    alexia_ai: { canAccess: true, scope: 'all_orgs', description: 'AI assistant for recruitment' },
  },

  internal_account_manager: {
    candidate_portal: { canAccess: false },
    team_connect: { canAccess: true, scope: 'all_orgs', description: 'Client support across organizations' },
    hris: { canAccess: true, scope: 'all_orgs', description: 'Client account management' },
    ats: { canAccess: false },
    finance: { canAccess: false },
    data_dashboard: { canAccess: true, scope: 'view_only', description: 'View all data across organizations' },
    alexia_ai: { canAccess: true, scope: 'all_orgs', description: 'AI assistant for account management' },
  },

  internal_finance: {
    candidate_portal: { canAccess: false },
    team_connect: { canAccess: true, scope: 'all_orgs', description: 'Access to all organizations' },
    hris: { canAccess: true, scope: 'all_orgs', description: 'HR data access for finance' },
    ats: { canAccess: false },
    finance: { canAccess: true, scope: 'all_orgs', description: 'Financial operations across all organizations' },
    data_dashboard: { canAccess: true, scope: 'view_only', description: 'View all data across organizations' },
    alexia_ai: { canAccess: true, scope: 'all_orgs', description: 'AI assistant for finance operations' },
  },

  internal_marketing: {
    candidate_portal: { canAccess: false },
    team_connect: { canAccess: true, scope: 'all_orgs', description: 'Marketing across organizations' },
    hris: { canAccess: false },
    ats: { canAccess: false },
    finance: { canAccess: false },
    data_dashboard: { canAccess: true, scope: 'view_only', description: 'View all data for marketing insights' },
    alexia_ai: { canAccess: true, scope: 'all_orgs', description: 'AI assistant for marketing insights' },
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
  'client_f994431f3a8cbacba41b47b2e20dd7ea': 'candidate_portal', // Jobseeker Portal
  'client_5fe07c29f5d8f5e5455a0c31370d8ab4': 'ats', // ATS Portal
  'client_cb45a65b7e54c6fa16a99fd61c719991': 'hris', // HRIS Portal
  'client_266b2fd552de8dd40c0414285e1b597f': 'team_connect', // Team Connect
  'client_7d22211597ed843e72660a34d3712735': 'alexia_ai', // Alexia AI
};

/**
 * Get app key from OAuth client ID
 */
export function getAppKeyFromClientId(clientId: string): AppKey | null {
  return OAUTH_CLIENT_TO_APP_MAP[clientId] || null;
}
