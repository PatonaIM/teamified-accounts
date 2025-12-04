import { useMemo } from 'react';

export interface OrganizationPermissions {
  canViewUserDetails: boolean;
  canViewSensitiveInfo: boolean;
  canInviteUsers: boolean;
  canRemoveUsers: boolean;
  canChangeRoles: boolean;
  canMarkNLWF: boolean;
  canSendPasswordReset: boolean;
  canSuspendUser: boolean;
  canEditOrgProfile: boolean;
  canViewBilling: boolean;
  canDeleteOrg: boolean;
  canViewAllOrgs: boolean;
  isInternalUser: boolean;
  isClientUser: boolean;
  isSuperAdmin: boolean;
}

export interface UseOrganizationPermissionsOptions {
  userRoles: string[];
  isOwnOrganization?: boolean;
}

export function useOrganizationPermissions({
  userRoles,
  isOwnOrganization = true,
}: UseOrganizationPermissionsOptions): OrganizationPermissions {
  return useMemo(() => {
    const roles = userRoles.map(r => r.toLowerCase());
    
    const isSuperAdmin = roles.some(r => 
      ['super_admin', 'system_admin'].includes(r)
    );
    
    const isInternalUser = roles.some(r => 
      r.startsWith('internal_') || isSuperAdmin
    );
    
    const isClientUser = roles.some(r => r.startsWith('client_'));
    
    const isClientAdmin = roles.includes('client_admin');
    const isClientHR = roles.includes('client_hr');
    const isClientFinance = roles.includes('client_finance');
    const isInternalHR = roles.includes('internal_hr');
    const isInternalStaff = roles.includes('internal_staff');

    if (isSuperAdmin) {
      return {
        canViewUserDetails: true,
        canViewSensitiveInfo: true,
        canInviteUsers: true,
        canRemoveUsers: true,
        canChangeRoles: true,
        canMarkNLWF: true,
        canSendPasswordReset: true,
        canSuspendUser: true,
        canEditOrgProfile: true,
        canViewBilling: true,
        canDeleteOrg: true,
        canViewAllOrgs: true,
        isInternalUser: true,
        isClientUser: false,
        isSuperAdmin: true,
      };
    }

    if (isInternalUser) {
      return {
        canViewUserDetails: true,
        canViewSensitiveInfo: true,
        canInviteUsers: true,
        canRemoveUsers: isInternalHR || isSuperAdmin,
        canChangeRoles: isInternalHR || isSuperAdmin,
        canMarkNLWF: isInternalHR || isSuperAdmin,
        canSendPasswordReset: isInternalHR || isSuperAdmin,
        canSuspendUser: isInternalHR || isSuperAdmin,
        canEditOrgProfile: true,
        canViewBilling: true,
        canDeleteOrg: isSuperAdmin,
        canViewAllOrgs: true,
        isInternalUser: true,
        isClientUser: false,
        isSuperAdmin: false,
      };
    }

    if (isClientUser && isOwnOrganization) {
      return {
        canViewUserDetails: true,
        canViewSensitiveInfo: isClientAdmin || isClientHR,
        canInviteUsers: isClientAdmin || isClientHR,
        canRemoveUsers: isClientAdmin || isClientHR,
        canChangeRoles: isClientAdmin,
        canMarkNLWF: isClientAdmin || isClientHR,
        canSendPasswordReset: isClientAdmin,
        canSuspendUser: isClientAdmin,
        canEditOrgProfile: isClientAdmin,
        canViewBilling: isClientAdmin || isClientFinance,
        canDeleteOrg: isClientAdmin,
        canViewAllOrgs: false,
        isInternalUser: false,
        isClientUser: true,
        isSuperAdmin: false,
      };
    }

    return {
      canViewUserDetails: false,
      canViewSensitiveInfo: false,
      canInviteUsers: false,
      canRemoveUsers: false,
      canChangeRoles: false,
      canMarkNLWF: false,
      canSendPasswordReset: false,
      canSuspendUser: false,
      canEditOrgProfile: false,
      canViewBilling: false,
      canDeleteOrg: false,
      canViewAllOrgs: false,
      isInternalUser: false,
      isClientUser: false,
      isSuperAdmin: false,
    };
  }, [userRoles, isOwnOrganization]);
}

export function getHighestClientRole(roles: string[]): string {
  const clientRoles = roles.filter(r => r.startsWith('client_'));
  if (clientRoles.includes('client_admin')) return 'client_admin';
  if (clientRoles.includes('client_hr')) return 'client_hr';
  if (clientRoles.includes('client_finance')) return 'client_finance';
  if (clientRoles.includes('client_recruiter')) return 'client_recruiter';
  if (clientRoles.includes('client_employee')) return 'client_employee';
  return clientRoles[0] || 'client_employee';
}

export function getHighestInternalRole(roles: string[]): string {
  if (roles.some(r => ['super_admin', 'system_admin'].includes(r.toLowerCase()))) {
    return 'super_admin';
  }
  const internalRoles = roles.filter(r => r.startsWith('internal_'));
  if (internalRoles.includes('internal_hr')) return 'internal_hr';
  if (internalRoles.includes('internal_staff')) return 'internal_staff';
  return internalRoles[0] || 'internal_staff';
}
