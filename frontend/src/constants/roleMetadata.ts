export type RoleColor = 'error' | 'secondary' | 'warning' | 'info' | 'success' | 'primary';

export const ROLE_PRIORITY_MAP: Record<string, number> = {
  // Internal roles (Teamified organization)
  super_admin: 1,
  internal_hr: 2,
  internal_finance: 3,
  internal_account_manager: 4,
  internal_recruiter: 5,
  internal_marketing: 6,
  internal_member: 7,
  
  // Client roles
  client_admin: 1,
  client_hr: 2,
  client_finance: 3,
  client_recruiter: 4,
  client_employee: 5,
};

export const ROLE_COLOR_MAP: Record<string, RoleColor> = {
  // Internal roles mapped to their client equivalents
  super_admin: 'error',
  internal_hr: 'secondary',
  internal_finance: 'warning',
  internal_account_manager: 'success',
  internal_recruiter: 'info',
  internal_marketing: 'success',
  internal_member: 'primary',
  
  // Client roles
  client_admin: 'error',
  client_hr: 'secondary',
  client_finance: 'warning',
  client_recruiter: 'info',
  client_employee: 'primary',
};

export const getRolePriority = (roleType: string): number => {
  return ROLE_PRIORITY_MAP[roleType] ?? 999;
};

export const getRoleColor = (roleType: string): RoleColor => {
  return ROLE_COLOR_MAP[roleType] ?? 'primary';
};

export const getRoleDisplayName = (roleType: string): string => {
  return roleType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
