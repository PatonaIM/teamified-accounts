import { Injectable } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';

@Injectable()
export class PermissionService {
  constructor(private readonly userRolesService: UserRolesService) {}

  async hasPermission(
    userId: string,
    permission: string,
    scope?: string,
    scopeId?: string,
  ): Promise<boolean> {
    const userPermissions = await this.userRolesService.getUserPermissions(userId);
    
    return userPermissions.some(perm => {
      // Check if permission matches
      if (perm.permission !== permission) {
        return false;
      }

      // Check if permission is granted
      if (!perm.granted) {
        return false;
      }

      // Check if permission is expired
      if (perm.expiresAt && perm.expiresAt < new Date()) {
        return false;
      }

      // Check scope matching
      if (scope && perm.scope !== scope) {
        return false;
      }

      // Check scope ID matching
      if (scopeId && perm.scopeId !== scopeId) {
        return false;
      }

      return true;
    });
  }

  async hasAnyPermission(
    userId: string,
    permissions: string[],
    scope?: string,
    scopeId?: string,
  ): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.hasPermission(userId, permission, scope, scopeId)) {
        return true;
      }
    }
    return false;
  }

  async hasAllPermissions(
    userId: string,
    permissions: string[],
    scope?: string,
    scopeId?: string,
  ): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.hasPermission(userId, permission, scope, scopeId))) {
        return false;
      }
    }
    return true;
  }

  async hasRole(
    userId: string,
    role: string,
    scope?: string,
    scopeId?: string,
  ): Promise<boolean> {
    return this.userRolesService.hasRole(userId, role, scope);
  }

  async hasAnyRole(
    userId: string,
    roles: string[],
    scope?: string,
    scopeId?: string,
  ): Promise<boolean> {
    for (const role of roles) {
      if (await this.hasRole(userId, role, scope, scopeId)) {
        return true;
      }
    }
    return false;
  }
}
