/**
 * Canonical Role Types for SSO & User Management Platform
 */
export type RoleType =
  | 'client_admin'
  | 'client_hr'
  | 'client_finance'
  | 'client_recruiter'
  | 'client_employee'
  | 'super_admin'
  | 'internal_hr'
  | 'internal_finance'
  | 'internal_account_manager'
  | 'internal_recruiter'
  | 'internal_marketing'
  | 'internal_employee';

export type RoleScope =
  | 'all'
  | 'global'
  | 'organization'
  | 'individual';

// Legacy role types for backward compatibility
export type LegacyRoleType =
  | 'admin'
  | 'account_manager'
  | 'member';

export type LegacyRoleScope =
  | 'client'
  | 'user'
  | 'group';

export const ROLE_TYPE_MIGRATION_MAP: Record<LegacyRoleType, RoleType> = {
  admin: 'client_admin',
  member: 'client_employee',
  account_manager: 'internal_account_manager',
};

export const SCOPE_MIGRATION_MAP: Record<LegacyRoleScope, RoleScope> = {
  client: 'organization',
  user: 'individual',
  group: 'organization',
};

export function migrateRoleType(legacyRole: LegacyRoleType): RoleType {
  return ROLE_TYPE_MIGRATION_MAP[legacyRole];
}

export function migrateScope(legacyScope: LegacyRoleScope): RoleScope {
  return SCOPE_MIGRATION_MAP[legacyScope];
}
