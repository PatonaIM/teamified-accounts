import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { UserRole } from '../entities/user-role.entity';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { UserRoleResponseDto } from '../dto/user-role-response.dto';
import { PermissionResponseDto } from '../dto/permission-response.dto';
import { 
  RoleType, 
  RoleScope, 
  LegacyRoleType,
  LegacyRoleScope,
  ROLE_TYPE_MIGRATION_MAP,
  SCOPE_MIGRATION_MAP
} from '../../common/types/role-types';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  /**
   * Get normalized canonical role types for a user
   * Automatically translates legacy roles to canonical ones
   */
  async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      select: ['roleType'],
    });

    return userRoles
      .map(role => this.normalizeRoleType(role.roleType))
      .filter(role => role !== null) as string[];
  }

  async getUserRolesWithScope(userId: string, scope?: string): Promise<UserRoleResponseDto[]> {
    const query = this.userRoleRepository
      .createQueryBuilder('userRole')
      .where('userRole.userId = :userId', { userId });

    if (scope) {
      query.andWhere('userRole.scope = :scope', { scope });
    }

    const roles = await query.getMany();
    return roles.map(role => this.mapToResponseDto(role));
  }

  /**
   * Check if user has a specific role (normalized canonical check)
   * Works with both legacy and canonical role names
   */
  async hasRole(userId: string, roleType: string, scope?: string): Promise<boolean> {
    // Normalize the requested role type to canonical
    const normalizedRequestedRole = this.normalizeRoleType(roleType);
    
    if (!normalizedRequestedRole) {
      // Invalid/unknown role type requested
      return false;
    }

    // Get all user roles
    const query = this.userRoleRepository
      .createQueryBuilder('userRole')
      .where('userRole.userId = :userId', { userId });

    if (scope) {
      // Normalize scope if provided
      const normalizedScope = this.normalizeRoleScope(scope);
      if (!normalizedScope) {
        return false;
      }
      // Check for both legacy and canonical scope values
      query.andWhere('(userRole.scope = :scope OR userRole.scope = :legacyScope)', {
        scope: normalizedScope,
        legacyScope: scope, // Check legacy value too
      });
    }

    const userRoles = await query.getMany();

    // Normalize all database roles and check if requested role exists
    return userRoles.some(role => {
      const normalizedDbRole = this.normalizeRoleType(role.roleType);
      return normalizedDbRole === normalizedRequestedRole;
    });
  }

  async assignRole(
    userId: string,
    roleType: RoleType,
    scope: RoleScope = 'global',
    scopeEntityId?: string,
    grantedBy?: string,
    expiresAt?: Date,
  ): Promise<UserRoleResponseDto> {
    // Check for existing role assignment
    const existingRole = await this.userRoleRepository.findOne({
      where: {
        userId,
        roleType,
        scope,
        scopeEntityId,
      },
    });

    if (existingRole) {
      throw new ConflictException('Role assignment already exists');
    }

    const userRole = this.userRoleRepository.create({
      userId,
      roleType,
      scope,
      scopeEntityId,
      grantedBy,
      expiresAt,
    });

    const savedRole = await this.userRoleRepository.save(userRole);
    return this.mapToResponseDto(Array.isArray(savedRole) ? savedRole[0] : savedRole);
  }

  async removeRole(userId: string, roleType: string, scope?: string): Promise<void> {
    const query = this.userRoleRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .andWhere('roleType = :roleType', { roleType });

    if (scope) {
      query.andWhere('scope = :scope', { scope });
    }

    await query.execute();
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<UserRoleResponseDto> {
    const role = await this.userRoleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role assignment not found');
    }

    // Check for conflicts if role or scope is being updated
    if (updateRoleDto.role || updateRoleDto.scope) {
      const newRole = updateRoleDto.role || role.roleType;
      const newScope = updateRoleDto.scope || role.scope;
      const newScopeId = updateRoleDto.scopeId !== undefined ? updateRoleDto.scopeId : role.scopeEntityId;

      const existingRole = await this.userRoleRepository.findOne({
        where: {
          userId: role.userId,
          roleType: newRole,
          scope: newScope,
          scopeEntityId: newScopeId,
        },
      });

      if (existingRole && existingRole.id !== id) {
        throw new ConflictException('Role assignment already exists');
      }
    }

    // Update role
    Object.assign(role, updateRoleDto);
    if (updateRoleDto.expiresAt) {
      role.expiresAt = new Date(updateRoleDto.expiresAt);
    }

    const updatedRole = await this.userRoleRepository.save(role);
    return this.mapToResponseDto(updatedRole);
  }

  async removeRoleById(id: string): Promise<void> {
    const role = await this.userRoleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role assignment not found');
    }

    await this.userRoleRepository.remove(role);
  }

  async getUserPermissions(userId: string): Promise<PermissionResponseDto[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
    });

    const permissions: PermissionResponseDto[] = [];
    const rolePermissions = this.getRolePermissions();

    for (const userRole of userRoles) {
      // Check if role is expired
      if (userRole.expiresAt && userRole.expiresAt < new Date()) {
        continue;
      }

      // Validate and normalize role type/scope
      const normalizedRole = this.normalizeRoleType(userRole.roleType);
      const normalizedScope = this.normalizeRoleScope(userRole.scope);
      
      if (!normalizedRole || !normalizedScope) {
        console.warn(`Skipping invalid role: ${userRole.roleType}/${userRole.scope} for user ${userId}`);
        continue;
      }

      const rolePerms = rolePermissions[normalizedRole] || [];
      for (const permission of rolePerms) {
        permissions.push({
          permission,
          scope: normalizedScope,
          scopeId: userRole.scopeEntityId,
          granted: true,
          grantedBy: normalizedRole,
          expiresAt: userRole.expiresAt,
        });
      }
    }

    return permissions;
  }

  private getRolePermissions(): Record<string, string[]> {
    const permissions = {
      // Super admin - Full platform access
      super_admin: [
        'users.read',
        'users.create',
        'users.update',
        'users.delete',
        'roles.assign',
        'roles.manage',
        'system.admin',
        'organizations.read',
        'organizations.manage',
        'invitations.read',
        'invitations.create',
        'invitations.manage',
        'api_keys.read',
        'api_keys.manage',
        'oauth_clients.read',
        'oauth_clients.manage',
        'audit.read',
      ],
      // Client admin - Organization admin
      client_admin: [
        'users.read',
        'users.create',
        'users.update',
        'users.delete',
        'roles.assign',
        'invitations.read',
        'invitations.create',
        'invitations.manage',
        'organizations.read',
        'api_keys.read',
        'api_keys.manage',
      ],
      // Client employee - Regular organization member
      client_employee: [
        'users.read',
        'organizations.read',
      ],
      // Internal employee - Platform team member
      internal_employee: [
        'users.read',
        'organizations.read',
        'audit.read',
      ],
      // Internal account manager - Manages client organizations
      internal_account_manager: [
        'users.read',
        'organizations.read',
        'organizations.manage',
        'invitations.read',
        'invitations.create',
        'audit.read',
      ],
    };

    // Add legacy role mappings for backward compatibility
    permissions['admin'] = permissions['client_admin'];
    permissions['account_manager'] = permissions['internal_account_manager'];
    permissions['client_member'] = permissions['client_employee']; // Legacy mapping
    permissions['internal_member'] = permissions['internal_employee']; // Legacy mapping

    return permissions;
  }

  /**
   * Normalize legacy role types to canonical ones
   * Returns null for invalid/unknown role types
   */
  private normalizeRoleType(roleType: string): RoleType | null {
    // Check if it's already a canonical role type
    const canonicalRoles: RoleType[] = [
      'client_admin',
      'client_hr',
      'client_finance',
      'client_recruiter',
      'client_employee',
      'super_admin',
      'internal_hr',
      'internal_finance',
      'internal_account_manager',
      'internal_recruiter',
      'internal_marketing',
      'internal_employee',
    ];
    
    if (canonicalRoles.includes(roleType as RoleType)) {
      return roleType as RoleType;
    }
    
    // Try to migrate legacy role type
    if (roleType in ROLE_TYPE_MIGRATION_MAP) {
      return ROLE_TYPE_MIGRATION_MAP[roleType as LegacyRoleType];
    }
    
    // Unknown role type
    return null;
  }

  /**
   * Normalize legacy scopes to canonical ones
   * Returns null for invalid/unknown scopes
   */
  private normalizeRoleScope(scope: string): RoleScope | null {
    // Check if it's already a canonical scope
    const canonicalScopes: RoleScope[] = ['all', 'global', 'organization', 'individual'];
    
    if (canonicalScopes.includes(scope as RoleScope)) {
      return scope as RoleScope;
    }
    
    // Try to migrate legacy scope
    if (scope in SCOPE_MIGRATION_MAP) {
      return SCOPE_MIGRATION_MAP[scope as LegacyRoleScope];
    }
    
    // Unknown scope
    return null;
  }

  private mapToResponseDto(role: UserRole): UserRoleResponseDto {
    const normalizedRole = this.normalizeRoleType(role.roleType);
    const normalizedScope = this.normalizeRoleScope(role.scope);
    
    if (!normalizedRole || !normalizedScope) {
      // Log error-level alert for invalid role data
      console.error(`CRITICAL: Invalid role data in database - roleType: ${role.roleType}, scope: ${role.scope}, roleId: ${role.id}, userId: ${role.userId}`);
      throw new Error(`Invalid role data: ${role.roleType}/${role.scope} for user ${role.userId}`);
    }
    
    return {
      id: role.id,
      userId: role.userId,
      role: normalizedRole,
      scope: normalizedScope,
      scopeId: role.scopeEntityId,
      grantedBy: role.grantedBy,
      expiresAt: role.expiresAt,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  /**
   * Check if user has Account Manager role
   * Checks for canonical role name (legacy 'account_manager' is auto-translated to 'internal_account_manager')
   */
  async isAccountManager(userId: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.includes('internal_account_manager');
  }
}
