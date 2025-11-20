import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { UserRole } from '../entities/user-role.entity';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { UserRoleResponseDto } from '../dto/user-role-response.dto';
import { PermissionResponseDto } from '../dto/permission-response.dto';
import { EmploymentRecord } from '../../employment-records/entities/employment-record.entity';
import { RoleType, RoleScope } from '../../common/types/role-types';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(EmploymentRecord)
    private readonly employmentRecordRepository: Repository<EmploymentRecord>,
  ) {}

  async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      select: ['roleType'],
    });

    return userRoles.map(role => role.roleType);
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

  async hasRole(userId: string, roleType: string, scope?: string): Promise<boolean> {
    const query = this.userRoleRepository
      .createQueryBuilder('userRole')
      .where('userRole.userId = :userId', { userId })
      .andWhere('userRole.roleType = :roleType', { roleType });

    if (scope) {
      query.andWhere('userRole.scope = :scope', { scope });
    }

    const count = await query.getCount();
    return count > 0;
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

      const rolePerms = rolePermissions[userRole.roleType] || [];
      for (const permission of rolePerms) {
        permissions.push({
          permission,
          scope: userRole.scope,
          scopeId: userRole.scopeEntityId,
          granted: true,
          grantedBy: userRole.roleType,
          expiresAt: userRole.expiresAt,
        });
      }
    }

    return permissions;
  }

  private getRolePermissions(): Record<string, string[]> {
    const permissions = {
      // Canonical multitenancy roles
      super_admin: [
        'users.read',
        'users.create',
        'users.update',
        'users.delete',
        'roles.assign',
        'roles.manage',
        'system.admin',
        'employment.read',
        'employment.update',
        'documents.read',
        'documents.manage',
        'timesheets.read',
        'timesheets.approve',
        'payroll.read',
        'payroll.manage',
        'clients.read',
        'clients.manage',
        'organizations.read',
        'organizations.manage',
      ],
      client_admin: [
        'users.read',
        'users.create',
        'users.update',
        'users.delete',
        'roles.assign',
        'roles.manage',
        'employment.read',
        'employment.update',
        'documents.read',
        'documents.manage',
        'timesheets.read',
        'timesheets.approve',
        'payroll.read',
        'payroll.manage',
      ],
      client_hr: [
        'users.read',
        'users.create',
        'users.update',
        'employment.read',
        'employment.update',
        'documents.read',
        'documents.manage',
        'timesheets.read',
        'timesheets.approve',
        'payroll.read',
        'payroll.manage',
      ],
      internal_account_manager: [
        'users.read',
        'employment.read',
        'documents.read',
        'timesheets.read',
        'timesheets.approve',
        'clients.read',
        'clients.manage',
        'organizations.read',
      ],
      internal_recruiter: [
        'users.read',
        'users.create',
        'invitations.read',
        'invitations.create',
        'invitations.manage',
        'candidates.read',
        'candidates.manage',
      ],
      client_recruiter: [
        'users.read',
        'users.create',
        'invitations.read',
        'invitations.create',
        'invitations.manage',
        'candidates.read',
        'candidates.manage',
      ],
      client_employee: [
        'users.read',
        'employment.read',
        'employment.update',
        'documents.read',
        'documents.manage',
        'payroll.read',
        'payroll.manage',
        'timesheets.read',
        'timesheets.create',
        'leave.read',
        'leave.create',
      ],
      candidate: [
        'profile.read',
        'profile.update',
        'documents.read',
      ],
      internal_member: [
        'users.read',
        'employment.read',
        'documents.read',
      ],
      internal_hr: [
        'users.read',
        'users.create',
        'users.update',
        'employment.read',
        'employment.update',
        'documents.read',
        'documents.manage',
        'timesheets.read',
        'timesheets.approve',
        'payroll.read',
        'payroll.manage',
      ],
      client_finance: [
        'payroll.read',
        'payroll.manage',
        'timesheets.read',
        'timesheets.approve',
        'employment.read',
      ],
      internal_finance: [
        'payroll.read',
        'payroll.manage',
        'timesheets.read',
        'employment.read',
        'clients.read',
      ],
      internal_marketing: [
        'users.read',
        'clients.read',
      ],
    };

    // Add legacy role mappings for backward compatibility
    permissions['admin'] = permissions['client_admin'];
    permissions['hr'] = permissions['client_hr'];
    permissions['eor'] = permissions['client_employee'];
    permissions['account_manager'] = permissions['internal_account_manager'];
    permissions['recruiter'] = permissions['client_recruiter'];
    permissions['hr_manager_client'] = permissions['client_hr'];

    return permissions;
  }

  private mapToResponseDto(role: UserRole): UserRoleResponseDto {
    return {
      id: role.id,
      userId: role.userId,
      role: role.roleType,
      scope: role.scope,
      scopeId: role.scopeEntityId,
      grantedBy: role.grantedBy,
      expiresAt: role.expiresAt,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  /**
   * Get EOR's assigned clients from employment records
   */
  async getEORAssignedClients(eorUserId: string): Promise<string[]> {
    const activeEmployments = await this.employmentRecordRepository.find({
      where: { 
        userId: eorUserId, 
        status: 'active' 
      },
      select: ['clientId']
    });
    
    return activeEmployments.map(emp => emp.clientId);
  }

  /**
   * Check if EOR can access specific client data
   */
  async canEORAccessClientData(eorUserId: string, clientId: string): Promise<boolean> {
    const assignment = await this.employmentRecordRepository.findOne({
      where: { 
        userId: eorUserId, 
        clientId, 
        status: 'active' 
      }
    });
    
    return !!assignment;
  }

  /**
   * Get EOR data access scope based on employment records
   */
  async getEORDataAccess(userId: string, dataType: string): Promise<string[]> {
    if (dataType === 'client_data' || dataType === 'timesheets') {
      // EOR can only access data for their assigned clients
      return this.getEORAssignedClients(userId);
    }
    
    if (dataType === 'employment') {
      // EOR can access their own employment records
      return [userId];
    }
    
    return [];
  }

  /**
   * Check if user has EOR role
   */
  async isEOR(userId: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.includes('eor');
  }

  /**
   * Check if user has Account Manager role
   */
  async isAccountManager(userId: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.includes('account_manager');
  }

  /**
   * Check if user has HR Manager (teamified) role
   */
  async isHRManagerTeamified(userId: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.includes('hr');
  }

  /**
   * Check if user has HR Manager (client) role
   */
  async isHRManagerClient(userId: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.includes('hr_manager_client');
  }
}
