import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, DataSource, IsNull } from 'typeorm';
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

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
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
    console.log('UserService.findOne: Looking for user with ID:', id);
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userRoles', 'organizationMembers', 'organizationMembers.organization'],
    });

    if (!user) {
      console.log('UserService.findOne: User not found for ID:', id);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    console.log('UserService.findOne: Found user:', { id: user.id, email: user.email, roles: user.userRoles?.map(r => r.roleType) });
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

    // Generate unique placeholder email to free up the original email for reuse
    const anonymizedEmail = `deleted+${user.id}@teamified-archive.local`;

    // Wrap database operations in a transaction
    await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const invitationRepo = manager.getRepository(Invitation);

      // Cancel pending invitations to avoid blocking re-invitation with same email
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

      // Create audit log for the soft delete
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
          deletedAt: deletedAt.toISOString(),
          softDelete: true,
          reason: reason || 'Admin deletion',
        },
        ip: null,
        userAgent: null,
      });
      await auditRepo.save(auditLog);

      // Soft delete: Archive user data and anonymize email to allow re-registration
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
          this.logger.log(`User ${userEmail} soft deleted and email anonymized. Supabase account removed. (status: ${userStatus}, cancelled ${cancelledCount} pending invitations) by ${deletedBy || 'system'}`);
        })
        .catch((error) => {
          this.logger.error(`User ${userEmail} was soft deleted but Supabase deletion failed:`, error);
        });
    } else {
      this.logger.log(`User ${userEmail} soft deleted and email anonymized (status: ${userStatus}, cancelled ${cancelledCount} pending invitations) by ${deletedBy || 'system'}`);
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

  async getUserActivity(userId: string): Promise<{
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
  }> {
    // Verify user exists
    await this.findOne(userId);

    // Get login history from sessions
    const sessions = await this.dataSource.query(
      `SELECT created_at, device_metadata, last_activity_at 
       FROM sessions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [userId]
    );

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
    
    const auditLogs = await this.dataSource.query(
      `SELECT action, entity_type, at, changes
       FROM audit_logs
       WHERE actor_user_id = $1
         AND action NOT IN (${loginRelatedActions.map((_, i) => `$${i + 2}`).join(', ')})
       ORDER BY at DESC
       LIMIT 20`,
      [userId, ...loginRelatedActions]
    );

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

    return {
      loginHistory,
      lastAppsUsed,
      recentActions,
    };
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
}
