/**
 * Canonical Role Types for Multitenancy
 */
export type RoleType =
  | 'candidate'
  | 'client_admin'
  | 'client_hr'
  | 'client_finance'
  | 'client_recruiter'
  | 'client_employee'
  | 'super_admin'
  | 'internal_member'
  | 'internal_hr'
  | 'internal_recruiter'
  | 'internal_account_manager'
  | 'internal_finance'
  | 'internal_marketing';

export type RoleScope =
  | 'all'
  | 'global'
  | 'organization'
  | 'individual';

// Legacy role types for backward compatibility
export type LegacyRoleType =
  | 'admin'
  | 'eor'
  | 'hr'
  | 'account_manager'
  | 'recruiter'
  | 'hr_manager_client';

export type LegacyRoleScope =
  | 'client'
  | 'user'
  | 'group';

export const ROLE_TYPE_MIGRATION_MAP: Record<LegacyRoleType, RoleType> = {
  admin: 'client_admin',
  eor: 'client_employee',
  hr: 'client_hr',
  hr_manager_client: 'client_hr',
  recruiter: 'client_recruiter',
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
