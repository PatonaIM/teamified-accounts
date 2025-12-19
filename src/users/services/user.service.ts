import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, DataSource, IsNull, In } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { UserListResponseDto, PaginationInfo } from '../dto/user-list-response.dto';
import { BulkStatusUpdateDto } from '../dto/bulk-status-update.dto';
import { BulkRoleAssignmentDto } from '../dto/bulk-role-assignment.dto';
import { BulkOperationResponseDto, BulkOperationResult } from '../dto/bulk-operation-response.dto';
import { PasswordService } from '../../auth/services/password.service';
import { AuditService } from '../../audit/audit.service';
import { SupabaseService } from '../../auth/services/supabase.service';
import { Invitation, InvitationStatus } from '../../invitations/entities/invitation.entity';
import { AuditLog } from '../../audit/entities/audit-log.entity';
import { OrganizationMember } from '../../organizations/entities/organization-member.entity';
import { UserRole } from '../../user-roles/entities/user-role.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    @InjectRepository(OrganizationMember)
    private readonly memberRepository: Repository<OrganizationMember>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly passwordService: PasswordService,
    private readonly auditService: AuditService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with email already exists (ignore soft-deleted users to allow re-registration)
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email, deletedAt: IsNull() }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await this.passwordService.hashPassword(createUserDto.password);

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash,
    });

    return await this.userRepository.save(user);
  }

  async findAll(queryDto: UserQueryDto): Promise<UserListResponseDto> {
    const { page, limit, search, status, role, sortBy, sortOrder } = queryDto;
    const skip = (page - 1) * limit;

    // Use query builder for complex filtering with roles
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole');

    // Exclude soft-deleted users
    queryBuilder.andWhere('user.deletedAt IS NULL');

    // Filter by status
    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    // Filter by search (firstName, lastName, or email)
    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Filter by role(s) - support comma-separated list
    if (role) {
      const roles = role.split(',').map(r => r.trim());
      queryBuilder.andWhere('userRole.roleType IN (:...roles)', { roles });
    }

    // Add sorting
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

    // Add pagination
    queryBuilder.skip(skip).take(limit);

    // Get users and total count
    const [users, total] = await queryBuilder.getManyAndCount();

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return {
      users,
      pagination,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userRoles', 'organizationMembers', 'organizationMembers.organization'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check for email conflicts if email is being updated (ignore soft-deleted users)
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email, deletedAt: IsNull() }
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Prepare update data
    const updateData: any = { ...updateUserDto };

    // Hash password if it's being updated
    if (updateUserDto.password) {
      updateData.passwordHash = await this.passwordService.hashPassword(updateUserDto.password);
      delete updateData.password;
    }

    // Update user
    Object.assign(user, updateData);
    return await this.userRepository.save(user);
  }

  async updateProfileData(
    userId: string,
    profileData: any,
    auditContext?: {
      ip?: string;
      userAgent?: string;
    },
  ): Promise<User> {
    const user = await this.findOne(userId);
    
    // Store previous profile data for audit comparison
    const previousData = user.profileData || {};
    
    // Merge new profile data with existing
    const updatedProfileData = {
      ...previousData,
      ...profileData,
      metadata: {
        ...previousData.metadata,
        lastUpdated: new Date().toISOString(),
      },
    };
    
    // Update user profile
    user.profileData = updatedProfileData;
    const savedUser = await this.userRepository.save(user);
    
    // Create audit log entry
    try {
      await this.auditService.log({
        actorUserId: userId,
        actorRole: user.userRoles?.[0]?.roleType || 'user',
        action: 'profile_update',
        entityType: 'user_profile',
        entityId: userId,
        changes: {
          previous: previousData,
          updated: updatedProfileData,
        },
        ip: auditContext?.ip,
        userAgent: auditContext?.userAgent,
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
      // Don't fail the update if audit logging fails
    }
    
    return savedUser;
  }

  async updateProfilePictureUrl(
    userId: string,
    profilePictureUrl: string,
    auditContext?: {
      actorUserId?: string;
      actorRole?: string;
      ip?: string;
      userAgent?: string;
    },
  ): Promise<User> {
    const user = await this.findOne(userId);
    const previousUrl = user.profilePictureUrl;

    // Update the profilePictureUrl column
    user.profilePictureUrl = profilePictureUrl;
    
    // Also update the profilePicture field in the JSONB profileData column
    // This ensures consistency since some parts of the app read from profileData
    user.profileData = {
      ...user.profileData,
      profilePicture: profilePictureUrl,
    };
    
    const savedUser = await this.userRepository.save(user);

    try {
      await this.auditService.log({
        actorUserId: auditContext?.actorUserId || userId,
        actorRole: auditContext?.actorRole || user.userRoles?.[0]?.roleType || 'user',
        action: 'profile_picture_update',
        entityType: 'user',
        entityId: userId,
        changes: {
          previousUrl,
          newUrl: profilePictureUrl,
        },
        ip: auditContext?.ip,
        userAgent: auditContext?.userAgent,
      });
    } catch (auditError) {
      this.logger.error('Failed to create audit log for profile picture update:', auditError);
    }

    return savedUser;
  }

  async remove(id: string, deletedBy?: string, actorRole: string = 'admin', reason?: string): Promise<void> {
    const user = await this.findOne(id);
    
    // Capture user data snapshot before deletion
    const userEmail = user.email;
    const userStatus = user.status;
    const deletedAt = new Date();
    let cancelledCount = 0;
    let nlwfOrganizations: string[] = [];
    let removedRolesCount = 0;

    // Generate unique placeholder email to free up the original email for reuse
    const anonymizedEmail = `deleted+${user.id}@teamified-archive.local`;

    // Wrap ALL database operations in a transaction (including last admin check)
    await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const invitationRepo = manager.getRepository(Invitation);
      const memberRepo = manager.getRepository(OrganizationMember);
      const roleRepo = manager.getRepository(UserRole);

      // Step 0: Check if user is the last admin in ANY organization (inside transaction to avoid TOCTOU)
      // Find all organizations where this user has client_admin role
      const adminRoles = await roleRepo.find({
        where: {
          userId: id,
          scope: 'organization',
          roleType: 'client_admin',
        },
      });

      // For each organization where user is a client_admin, check if there's at least one other admin
      const lastAdminOrgs: string[] = [];
      
      if (adminRoles.length > 0) {
        // Get unique org IDs where this user is client_admin
        const orgIds = [...new Set(adminRoles.map(r => r.scopeEntityId).filter(Boolean) as string[])];
        
        // First, check if there are any OTHER super_admins in the system (any scope)
        // Super admins can manage all organizations, so if one exists (besides the user being deleted),
        // no organization is left without admin coverage
        const otherSuperAdminCount = await roleRepo
          .createQueryBuilder('role')
          .where('role.roleType = :roleType', { roleType: 'super_admin' })
          .andWhere('role.userId != :userId', { userId: id })
          .getCount();
        
        // If there are other super_admins, no organization is left uncovered
        if (otherSuperAdminCount === 0) {
          // No super_admins exist (other than the user being deleted), so check each org individually
          // Use a single aggregated query instead of per-org loop for efficiency
          if (orgIds.length > 0) {
            const uncoveredOrgs = await roleRepo
              .createQueryBuilder('role')
              .select('role.scopeEntityId', 'orgId')
              .addSelect('COUNT(CASE WHEN role.userId != :userId THEN 1 END)', 'otherAdminCount')
              .where('role.scope = :scope', { scope: 'organization' })
              .andWhere('role.scopeEntityId IN (:...orgIds)', { orgIds })
              .andWhere('role.roleType = :roleType', { roleType: 'client_admin' })
              .setParameter('userId', id)
              .groupBy('role.scopeEntityId')
              .getRawMany();
            
            // Find orgs where there's no other admin (otherAdminCount = 0 or org not in result means this user is the only admin)
            const orgsWithOtherAdmins = new Set(
              uncoveredOrgs
                .filter(row => parseInt(row.otherAdminCount, 10) > 0)
                .map(row => row.orgId)
            );
            
            for (const orgId of orgIds) {
              if (!orgsWithOtherAdmins.has(orgId)) {
                lastAdminOrgs.push(orgId);
              }
            }
          }
        }
      }

      if (lastAdminOrgs.length > 0) {
        throw new BadRequestException(
          `Cannot delete this user because they are the last admin in ${lastAdminOrgs.length} organization(s). Please assign another admin to these organizations before deleting this user.`
        );
      }

      // Step 1: Mark all organization memberships as 'inactive' (NLWF)
      const memberships = await memberRepo.find({
        where: { userId: user.id },
      });
      
      for (const membership of memberships) {
        await memberRepo.update(membership.id, { status: 'inactive' });
        nlwfOrganizations.push(membership.organizationId);
      }

      // Step 2: Remove all UserRole records for this user
      const userRoles = await roleRepo.find({
        where: { userId: user.id },
      });
      removedRolesCount = userRoles.length;
      
      if (userRoles.length > 0) {
        await roleRepo.remove(userRoles);
      }

      // Step 3: Cancel pending invitations to avoid blocking re-invitation with same email
      // Update 1: Cancel invitations linked by user ID
      const cancelByUserId = await invitationRepo.update(
        { 
          invitedUserId: user.id, 
          status: InvitationStatus.PENDING 
        },
        { status: InvitationStatus.CANCELLED }
      );

      // Update 2: Cancel invitations linked by email
      const cancelByEmail = await invitationRepo.update(
        { 
          email: userEmail, 
          status: InvitationStatus.PENDING 
        },
        { status: InvitationStatus.CANCELLED }
      );

      cancelledCount = (cancelByUserId.affected || 0) + (cancelByEmail.affected || 0);

      // Step 4: Create audit log for the soft delete
      const auditRepo = manager.getRepository(AuditLog);
      const auditLog = auditRepo.create({
        actorUserId: deletedBy || null,
        actorRole: actorRole,
        action: 'user_deleted',
        entityType: 'user',
        entityId: user.id,
        changes: {
          email: userEmail,
          status: userStatus,
          cancelledInvitations: cancelledCount,
          nlwfOrganizations: nlwfOrganizations,
          removedRolesCount: removedRolesCount,
          deletedAt: deletedAt.toISOString(),
          softDelete: true,
          reason: reason || 'Admin deletion',
        },
        ip: null,
        userAgent: null,
      });
      await auditRepo.save(auditLog);

      // Step 5: Soft delete - Archive user data and anonymize email to allow re-registration
      await userRepo.update(user.id, {
        deletedAt: deletedAt,
        deletedEmail: userEmail,
        deletedBy: deletedBy || null,
        deletedReason: reason || 'Admin deletion',
        email: anonymizedEmail,
        supabaseUserId: null,
        status: 'archived',
        isActive: false,
        passwordHash: null,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null,
      });
    });

    // After successful commit, attempt Supabase deletion
    // This is done asynchronously to not block the response
    if (user.supabaseUserId) {
      this.supabaseService.deleteSupabaseUser(user.supabaseUserId)
        .then(() => {
          this.logger.log(`User ${userEmail} soft deleted and email anonymized. Supabase account removed. Marked NLWF in ${nlwfOrganizations.length} org(s), removed ${removedRolesCount} role(s). (status: ${userStatus}, cancelled ${cancelledCount} pending invitations) by ${deletedBy || 'system'}`);
        })
        .catch((error) => {
          this.logger.error(`User ${userEmail} was soft deleted but Supabase deletion failed:`, error);
        });
    } else {
      this.logger.log(`User ${userEmail} soft deleted and email anonymized. Marked NLWF in ${nlwfOrganizations.length} org(s), removed ${removedRolesCount} role(s). (status: ${userStatus}, cancelled ${cancelledCount} pending invitations) by ${deletedBy || 'system'}`);
    }
  }

  async updateStatus(id: string, status: 'active' | 'inactive' | 'archived'): Promise<User> {
    const user = await this.findOne(id);
    user.status = status;
    user.isActive = status === 'active';
    return await this.userRepository.save(user);
  }

  async markEmailVerified(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpiry = null;

    const savedUser = await this.userRepository.save(user);

    // Log the action for audit trail
    try {
      await this.auditService.log({
        action: 'email_verification_marked_by_admin',
        entityType: 'User',
        entityId: user.id,
        actorUserId: null, // Admin action
        actorRole: 'admin',
        changes: { emailVerified: true },
        ip: null,
        userAgent: null,
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
    }

    return savedUser;
  }

  async bulkUpdateStatus(bulkStatusUpdateDto: BulkStatusUpdateDto): Promise<BulkOperationResponseDto> {
    const { userIds, status } = bulkStatusUpdateDto;
    const results: BulkOperationResult[] = [];
    let processed = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        const user = await this.findOne(userId);
        user.status = status;
        user.isActive = status === 'active';
        await this.userRepository.save(user);
        
        results.push({
          userId,
          success: true,
        });
        processed++;
      } catch (error) {
        results.push({
          userId,
          success: false,
          error: error.message,
        });
        failed++;
      }
    }

    return {
      processed,
      failed,
      results,
    };
  }

  async bulkAssignRole(bulkRoleAssignmentDto: BulkRoleAssignmentDto): Promise<BulkOperationResponseDto> {
    const { userIds, role, scope, scopeId } = bulkRoleAssignmentDto;
    const results: BulkOperationResult[] = [];
    let processed = 0;
    let failed = 0;

    // Note: This is a simplified implementation
    // In a real scenario, you would need to interact with the UserRole entity
    // and handle role assignment logic properly

    for (const userId of userIds) {
      try {
        const user = await this.findOne(userId);
        
        // Here you would create/update UserRole records
        // For now, we'll just mark as processed
        // TODO: Implement actual role assignment logic
        
        results.push({
          userId,
          success: true,
        });
        processed++;
      } catch (error) {
        results.push({
          userId,
          success: false,
          error: error.message,
        });
        failed++;
      }
    }

    return {
      processed,
      failed,
      results,
    };
  }

  async findByEmail(email: string, includeDeleted: boolean = false): Promise<User | null> {
    const whereClause: any = { email };
    if (!includeDeleted) {
      whereClause.deletedAt = IsNull();
    }
    return await this.userRepository.findOne({
      where: whereClause
    });
  }

  async findActiveUsers(): Promise<User[]> {
    return await this.userRepository.createQueryBuilder('user')
      .where('user.status = :status', { status: 'active' })
      .andWhere('user.deletedAt IS NULL')
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }

  async getUserType(userId: string): Promise<'client' | 'candidate'> {
    const user = await this.findOne(userId);
    
    if (!user.userRoles || user.userRoles.length === 0) {
      return 'candidate';
    }

    const roles = user.userRoles.map(r => r.roleType);
    
    const hasClientRole = roles.some(role => 
      role.startsWith('client_') || 
      role.startsWith('internal_') ||
      role === 'super_admin'
    );
    
    return hasClientRole ? 'client' : 'candidate';
  }

  classifyUserType(user: { userRoles?: Array<{ roleType: string }> }): 'client' | 'candidate' {
    if (!user.userRoles || user.userRoles.length === 0) {
      return 'candidate';
    }

    const roles = user.userRoles.map(r => r.roleType);
    
    const hasClientRole = roles.some(role => 
      role.startsWith('client_') || 
      role.startsWith('internal_') ||
      role === 'super_admin'
    );
    
    return hasClientRole ? 'client' : 'candidate';
  }

  async updatePrimaryEmail(
    userId: string,
    newEmail: string,
    secondaryEmail: string | null,
    auditContext?: {
      ip?: string;
      userAgent?: string;
    },
  ): Promise<{ user: User; verificationToken: string }> {
    const user = await this.findOne(userId);
    const previousEmail = user.email;

    if (newEmail === previousEmail) {
      throw new BadRequestException('New email is the same as the current email');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: newEmail, deletedAt: IsNull() }
    });

    if (existingUser) {
      throw new ConflictException('This email address is already in use by another account');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      throw new BadRequestException('Invalid email format');
    }

    const { v4: uuidv4 } = await import('uuid');
    const verificationToken = uuidv4();

    user.email = newEmail;
    user.emailVerified = false;
    user.emailVerificationToken = verificationToken;
    user.emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    user.profileData = {
      ...user.profileData,
      secondaryEmail: secondaryEmail || undefined,
    };

    const savedUser = await this.userRepository.save(user);

    try {
      await this.auditService.log({
        actorUserId: userId,
        actorRole: user.userRoles?.[0]?.roleType || 'user',
        action: 'email_changed',
        entityType: 'user',
        entityId: userId,
        changes: {
          previousEmail,
          newEmail,
          emailVerificationRequired: true,
        },
        ip: auditContext?.ip,
        userAgent: auditContext?.userAgent,
      });
    } catch (auditError) {
      this.logger.error('Failed to create audit log for email change:', auditError);
    }

    this.logger.log(`User ${userId} changed email from ${previousEmail} to ${newEmail}. Verification required.`);

    return { user: savedUser, verificationToken };
  }

  async generateEmailVerificationToken(userId: string): Promise<string> {
    const user = await this.findOne(userId);
    
    const { v4: uuidv4 } = await import('uuid');
    const verificationToken = uuidv4();
    
    user.emailVerificationToken = verificationToken;
    user.emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await this.userRepository.save(user);
    
    this.logger.log(`Generated new email verification token for user ${userId}`);
    
    return verificationToken;
  }

  private getTimeRangeDate(timeRange?: string): Date | null {
    if (!timeRange) return null;
    
    const now = new Date();
    switch (timeRange) {
      case '1h': return new Date(now.getTime() - 1 * 60 * 60 * 1000);
      case '3h': return new Date(now.getTime() - 3 * 60 * 60 * 1000);
      case '6h': return new Date(now.getTime() - 6 * 60 * 60 * 1000);
      case '12h': return new Date(now.getTime() - 12 * 60 * 60 * 1000);
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '3d': return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default: return null;
    }
  }

  async getUserActivity(userId: string, timeRange?: string): Promise<{
    loginHistory: Array<{
      timestamp: string;
      ip: string;
      userAgent: string;
      deviceType: string;
    }>;
    lastAppsUsed: Array<{
      appName: string;
      clientId: string;
      lastUsed: string;
      firstUsed?: string;
      loginCount?: number;
    }>;
    recentActions: Array<{
      action: string;
      entityType: string;
      timestamp: string;
      targetUserEmail?: string;
    }>;
    connectedApps: Array<{
      oauthClientId: string;
      appName: string;
      firstLoginAt: string;
      lastLoginAt: string;
      loginCount: number;
      activities: Array<{
        id: string;
        action: string;
        feature?: string;
        description?: string;
        createdAt: string;
      }>;
      topFeatures: Array<{
        feature: string;
        count: number;
      }>;
    }>;
  }> {
    // Verify user exists
    await this.findOne(userId);
    
    const timeRangeDate = this.getTimeRangeDate(timeRange);

    // Get login history from sessions
    let sessionQuery = `SELECT created_at, device_metadata, last_activity_at 
       FROM sessions 
       WHERE user_id = $1`;
    const sessionParams: any[] = [userId];
    
    if (timeRangeDate) {
      sessionQuery += ` AND created_at >= $2`;
      sessionParams.push(timeRangeDate);
    }
    sessionQuery += ` ORDER BY created_at DESC LIMIT 20`;
    
    const sessions = await this.dataSource.query(sessionQuery, sessionParams);

    const loginHistory = sessions.map((session: any) => ({
      timestamp: session.created_at?.toISOString() || new Date().toISOString(),
      ip: session.device_metadata?.ip || 'Unknown',
      userAgent: session.device_metadata?.userAgent || 'Unknown',
      deviceType: this.getDeviceType(session.device_metadata?.userAgent || ''),
    }));

    // Get connected apps from user_oauth_logins (tracks actual OAuth logins)
    const oauthLogins = await this.dataSource.query(
      `SELECT uol.oauth_client_id, uol.last_login_at, uol.first_login_at, uol.login_count, oc.name as app_name
       FROM user_oauth_logins uol
       LEFT JOIN oauth_clients oc ON uol.oauth_client_id = oc.id
       WHERE uol.user_id = $1
       ORDER BY uol.last_login_at DESC
       LIMIT 10`,
      [userId]
    );

    const lastAppsUsed = oauthLogins.map((app: any) => ({
      appName: app.app_name || 'Unknown App',
      clientId: app.oauth_client_id,
      lastUsed: app.last_login_at?.toISOString() || new Date().toISOString(),
      firstUsed: app.first_login_at?.toISOString() || null,
      loginCount: app.login_count || 1,
    }));

    // Get recent actions from audit logs (excluding login-related events since we have login history)
    const loginRelatedActions = [
      'login_success', 
      'login_failed', 
      'logout', 
      'session_created', 
      'session_expired',
      'session_invalidated',
      'token_refresh',
      'token_refreshed'
    ];
    
    let auditQuery = `SELECT action, entity_type, at, changes
       FROM audit_logs
       WHERE actor_user_id = $1
         AND action NOT IN (${loginRelatedActions.map((_, i) => `$${i + 2}`).join(', ')})`;
    const auditParams: any[] = [userId, ...loginRelatedActions];
    
    if (timeRangeDate) {
      auditQuery += ` AND at >= $${auditParams.length + 1}`;
      auditParams.push(timeRangeDate);
    }
    auditQuery += ` ORDER BY at DESC LIMIT 20`;
    
    const auditLogs = await this.dataSource.query(auditQuery, auditParams);

    const recentActions = auditLogs.map((log: any) => {
      const result: any = {
        action: log.action,
        entityType: log.entity_type,
        timestamp: log.at?.toISOString() || new Date().toISOString(),
      };
      
      // For admin password actions, include target user email
      if (log.action === 'admin_password_set' || log.action === 'admin_password_reset_sent') {
        const changes = typeof log.changes === 'string' ? JSON.parse(log.changes) : log.changes;
        if (changes?.targetUserEmail) {
          result.targetUserEmail = changes.targetUserEmail;
        }
      }
      
      return result;
    });

    // Get connected apps with grouped activity
    const connectedApps = await this.getConnectedAppsWithActivity(userId, timeRangeDate);

    return {
      loginHistory,
      lastAppsUsed,
      recentActions,
      connectedApps,
    };
  }

  private async getConnectedAppsWithActivity(userId: string, timeRangeDate?: Date | null): Promise<Array<{
    oauthClientId: string;
    appName: string;
    firstLoginAt: string;
    lastLoginAt: string;
    loginCount: number;
    activities: Array<{
      id: string;
      action: string;
      feature?: string;
      description?: string;
      createdAt: string;
    }>;
    topFeatures: Array<{
      feature: string;
      count: number;
    }>;
  }>> {
    // Get all OAuth apps the user has logged into
    const oauthLogins = await this.dataSource.query(
      `SELECT uol.oauth_client_id, uol.last_login_at, uol.first_login_at, uol.login_count, 
              oc.name as app_name, oc.client_id
       FROM user_oauth_logins uol
       LEFT JOIN oauth_clients oc ON uol.oauth_client_id = oc.id
       WHERE uol.user_id = $1
       ORDER BY uol.last_login_at DESC`,
      [userId]
    );

    if (oauthLogins.length === 0) {
      return [];
    }

    // Get recent activities for each app
    const connectedApps = await Promise.all(
      oauthLogins.map(async (login: any) => {
        // Build activities query with optional time filter
        let activitiesQuery = `SELECT id, action, feature, description, created_at
           FROM user_app_activity
           WHERE user_id = $1 AND oauth_client_id = $2`;
        const activitiesParams: any[] = [userId, login.oauth_client_id];
        
        if (timeRangeDate) {
          activitiesQuery += ` AND created_at >= $3`;
          activitiesParams.push(timeRangeDate);
        }
        activitiesQuery += ` ORDER BY created_at DESC LIMIT 50`;
        
        const activities = await this.dataSource.query(activitiesQuery, activitiesParams);

        // Build top features query with optional time filter
        let topFeaturesQuery = `SELECT feature, COUNT(*) as count
           FROM user_app_activity
           WHERE user_id = $1 AND oauth_client_id = $2 AND feature IS NOT NULL`;
        const topFeaturesParams: any[] = [userId, login.oauth_client_id];
        
        if (timeRangeDate) {
          topFeaturesQuery += ` AND created_at >= $3`;
          topFeaturesParams.push(timeRangeDate);
        }
        topFeaturesQuery += ` GROUP BY feature ORDER BY count DESC LIMIT 10`;
        
        const topFeatures = await this.dataSource.query(topFeaturesQuery, topFeaturesParams);

        return {
          oauthClientId: login.oauth_client_id,
          appName: login.app_name || 'Unknown App',
          firstLoginAt: login.first_login_at?.toISOString() || new Date().toISOString(),
          lastLoginAt: login.last_login_at?.toISOString() || new Date().toISOString(),
          loginCount: parseInt(login.login_count) || 1,
          activities: activities.map((a: any) => ({
            id: a.id,
            action: a.action,
            feature: a.feature || undefined,
            description: a.description || undefined,
            createdAt: a.created_at?.toISOString() || new Date().toISOString(),
          })),
          topFeatures: topFeatures.map((f: any) => ({
            feature: f.feature,
            count: parseInt(f.count) || 0,
          })),
        };
      })
    );

    return connectedApps;
  }

  private getDeviceType(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'Mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'Tablet';
    }
    return 'Desktop';
  }

  /**
   * S2S: Sanitize user data to remove sensitive fields
   * Used for service-to-service API responses
   */
  private sanitizeUserForS2S(user: any): any {
    const { 
      passwordHash, 
      passwordResetToken, 
      passwordResetTokenExpiry,
      emailVerificationToken,
      emailVerificationTokenExpiry,
      supabaseUserId,
      ...safeUser 
    } = user;

    return {
      ...safeUser,
      roles: user.userRoles?.map((r: any) => r.roleType) || user.roles || [],
    };
  }

  /**
   * S2S: Get paginated list of users (sanitized for machine access)
   * For service-to-service API access with read:users scope
   */
  async findAllS2S(queryDto: UserQueryDto): Promise<any> {
    const result = await this.findAll(queryDto);
    
    return {
      users: result.users.map((user: any) => this.sanitizeUserForS2S(user)),
      pagination: result.pagination,
    };
  }

  /**
   * S2S: Get user by ID (sanitized for machine access)
   * For service-to-service API access with read:users scope
   */
  async findOneS2S(id: string): Promise<any> {
    const user = await this.findOne(id);
    return this.sanitizeUserForS2S(user);
  }
}
