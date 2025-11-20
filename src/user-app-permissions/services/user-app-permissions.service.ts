import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAppPermission } from '../entities/user-app-permission.entity';
import { OAuthClient } from '../../oauth-clients/entities/oauth-client.entity';
import { User } from '../../auth/entities/user.entity';
import { UserRole } from '../../user-roles/entities/user-role.entity';
import {
  SetAppPermissionDto,
  AppPermissionResponseDto,
  UserAppAccessResponseDto,
} from '../dto/app-permission.dto';
import {
  getDefaultAppAccess,
  getDefaultAppsForRole,
  getAppKeyFromClientId,
  hasGlobalAccess,
  type AppKey,
} from '../constants/role-app-access-matrix';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class UserAppPermissionsService {
  private readonly logger = new Logger(UserAppPermissionsService.name);

  constructor(
    @InjectRepository(UserAppPermission)
    private readonly userAppPermissionRepository: Repository<UserAppPermission>,
    @InjectRepository(OAuthClient)
    private readonly oauthClientRepository: Repository<OAuthClient>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Set app permission override for a user (grant or revoke)
   */
  async setAppPermission(
    userId: string,
    dto: SetAppPermissionDto,
    grantedBy: string,
  ): Promise<AppPermissionResponseDto> {
    // Validate user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Validate OAuth client exists
    const oauthClient = await this.oauthClientRepository.findOne({
      where: { id: dto.oauthClientId },
    });
    if (!oauthClient) {
      throw new NotFoundException(`OAuth client with ID ${dto.oauthClientId} not found`);
    }

    // Check if permission override already exists
    let permission = await this.userAppPermissionRepository.findOne({
      where: {
        user_id: userId,
        oauth_client_id: dto.oauthClientId,
      },
    });

    if (permission) {
      // Update existing permission
      permission.permission = dto.permission;
      permission.reason = dto.reason || permission.reason;
      permission.granted_by = grantedBy;
    } else {
      // Create new permission override
      permission = this.userAppPermissionRepository.create({
        user_id: userId,
        oauth_client_id: dto.oauthClientId,
        permission: dto.permission,
        reason: dto.reason,
        granted_by: grantedBy,
      });
    }

    const savedPermission = await this.userAppPermissionRepository.save(permission);

    // Audit log
    await this.auditService.log({
      actorUserId: grantedBy,
      actorRole: 'super_admin',
      action: `user_app_permission_${dto.permission}`,
      entityType: 'UserAppPermission',
      entityId: savedPermission.id,
      changes: {
        targetUserId: userId,
        oauthClientId: dto.oauthClientId,
        oauthClientName: oauthClient.name,
        permission: dto.permission,
        reason: dto.reason,
      },
    });

    this.logger.log(
      `App permission ${dto.permission} set for user ${userId} on app ${oauthClient.name} by ${grantedBy}`,
    );

    return this.mapToResponseDto(savedPermission, oauthClient);
  }

  /**
   * Remove app permission override (reset to default)
   */
  async removeAppPermission(
    userId: string,
    oauthClientId: string,
    removedBy: string,
  ): Promise<void> {
    const permission = await this.userAppPermissionRepository.findOne({
      where: {
        user_id: userId,
        oauth_client_id: oauthClientId,
      },
    });

    if (!permission) {
      throw new NotFoundException('App permission override not found');
    }

    const oauthClient = await this.oauthClientRepository.findOne({
      where: { id: oauthClientId },
    });

    await this.userAppPermissionRepository.remove(permission);

    // Audit log
    await this.auditService.log({
      actorUserId: removedBy,
      actorRole: 'super_admin',
      action: 'user_app_permission_reset',
      entityType: 'UserAppPermission',
      entityId: permission.id,
      changes: {
        targetUserId: userId,
        oauthClientId,
        oauthClientName: oauthClient?.name,
      },
    });

    this.logger.log(
      `App permission override removed for user ${userId} on app ${oauthClient?.name} by ${removedBy}`,
    );
  }

  /**
   * Get all app permissions for a user (defaults + overrides)
   */
  async getUserAppAccess(userId: string): Promise<UserAppAccessResponseDto[]> {
    // Get user's roles
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
    });

    if (userRoles.length === 0) {
      return [];
    }

    // Get all OAuth clients
    const oauthClients = await this.oauthClientRepository.find({
      where: { is_active: true },
    });

    // Get user's permission overrides
    const overrides = await this.userAppPermissionRepository.find({
      where: { user_id: userId },
      relations: ['oauthClient'],
    });

    const overrideMap = new Map<string, UserAppPermission>();
    overrides.forEach((override) => {
      overrideMap.set(override.oauth_client_id, override);
    });

    // Calculate permissions for each OAuth client
    const appAccess: UserAppAccessResponseDto[] = [];

    for (const oauthClient of oauthClients) {
      const appKey = getAppKeyFromClientId(oauthClient.client_id);
      if (!appKey) {
        // Skip OAuth clients that aren't mapped to apps
        continue;
      }

      // Check if there's an override
      const override = overrideMap.get(oauthClient.id);

      if (override) {
        // Use override permission
        appAccess.push({
          oauthClientId: oauthClient.id,
          oauthClientName: oauthClient.name,
          appKey,
          canAccess: override.permission === 'allow',
          source: 'override',
          overridePermission: override.permission,
          overrideReason: override.reason,
        });
      } else {
        // Use default permissions from role matrix
        const defaultAccess = this.calculateDefaultAccess(userRoles.map((r) => r.roleType), appKey);
        if (defaultAccess) {
          appAccess.push({
            oauthClientId: oauthClient.id,
            oauthClientName: oauthClient.name,
            appKey,
            canAccess: defaultAccess.canAccess,
            source: 'default',
            scope: defaultAccess.scope,
            description: defaultAccess.description,
          });
        }
      }
    }

    return appAccess;
  }

  /**
   * Check if user can access a specific OAuth client
   */
  async canUserAccessApp(userId: string, oauthClientId: string): Promise<boolean> {
    // Check for permission override first
    const override = await this.userAppPermissionRepository.findOne({
      where: {
        user_id: userId,
        oauth_client_id: oauthClientId,
      },
    });

    if (override) {
      return override.permission === 'allow';
    }

    // Get OAuth client to determine app key
    const oauthClient = await this.oauthClientRepository.findOne({
      where: { id: oauthClientId },
    });

    if (!oauthClient) {
      return false;
    }

    const appKey = getAppKeyFromClientId(oauthClient.client_id);
    if (!appKey) {
      // No app key mapping, allow by default (for custom OAuth clients)
      return true;
    }

    // Get user's roles
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
    });

    if (userRoles.length === 0) {
      return false;
    }

    // Calculate default access from roles
    const defaultAccess = this.calculateDefaultAccess(
      userRoles.map((r) => r.roleType),
      appKey,
    );

    return defaultAccess?.canAccess || false;
  }

  /**
   * Calculate default access based on user's roles
   * If user has multiple roles, grant access if ANY role allows it
   */
  private calculateDefaultAccess(
    roleTypes: string[],
    appKey: AppKey,
  ): { canAccess: boolean; scope?: string; description?: string } | null {
    for (const roleType of roleTypes) {
      const access = getDefaultAppAccess(roleType, appKey);
      if (access.canAccess) {
        return access;
      }
    }
    return { canAccess: false };
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(
    permission: UserAppPermission,
    oauthClient?: OAuthClient,
  ): AppPermissionResponseDto {
    return {
      id: permission.id,
      userId: permission.user_id,
      oauthClientId: permission.oauth_client_id,
      oauthClientName: oauthClient?.name || '',
      permission: permission.permission,
      status: permission.status,
      reason: permission.reason,
      grantedBy: permission.granted_by,
      createdAt: permission.created_at,
      updatedAt: permission.updated_at,
    };
  }
}
