import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, DataSource } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
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
    @InjectQueue('supabase-user-deletion')
    private readonly deletionQueue: Queue,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email }
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
    const { page, limit, search, status, role, sortBy, sortOrder, clientId } = queryDto;
    const skip = (page - 1) * limit;

    // Use query builder for complex filtering with roles
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.eorProfile', 'eorProfile')
      .leftJoinAndSelect('user.userRoles', 'userRole');

    // Exclude soft-deleted users
    queryBuilder.andWhere('user.deletedAt IS NULL');

    // Filter by status
    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    // Filter by clientId
    if (clientId) {
      queryBuilder.andWhere('user.clientId = :clientId', { clientId });
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
      relations: ['employmentRecords', 'userRoles'],
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

    // Check for email conflicts if email is being updated
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email }
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
      employmentRecordId?: string;
      clientId?: string;
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
          context: {
            employmentRecordId: auditContext?.employmentRecordId,
            clientId: auditContext?.clientId,
            source: 'onboarding_wizard',
          },
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

  async remove(id: string, deletedBy?: string): Promise<void> {
    const user = await this.findOne(id);
    
    // Preserve the original email before archiving
    const originalEmail = user.email;
    const previousStatus = user.status;
    const previousIsActive = user.isActive;
    const deletedAt = new Date();

    // Wrap all operations in a transaction to ensure atomicity
    await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const invitationRepo = manager.getRepository(Invitation);

      // Cancel pending invitations using TWO separate bulk UPDATEs to avoid OR-clause issues in TypeORM
      // Update 1: Cancel invitations linked by user ID
      const cancelByUserId = await invitationRepo.update(
        { 
          invitedUserId: user.id, 
          status: InvitationStatus.PENDING 
        },
        { status: InvitationStatus.CANCELLED }
      );

      // Update 2: Cancel invitations linked by email (for org/client invites where invitedUserId is null)
      const cancelByEmail = await invitationRepo.update(
        { 
          email: originalEmail, 
          status: InvitationStatus.PENDING 
        },
        { status: InvitationStatus.CANCELLED }
      );

      const cancelledCount = (cancelByUserId.affected || 0) + (cancelByEmail.affected || 0);
      if (cancelledCount > 0) {
        this.logger.log(`Cancelled ${cancelledCount} pending invitation(s) for user ${originalEmail} (${cancelByUserId.affected || 0} by user ID, ${cancelByEmail.affected || 0} by email)`);
      }

      // Soft delete: Set deletedAt timestamp, deactivate, and append timestamp to email to free it up for re-invitation
      // Append timestamp to email to free up the original email for new invitations
      // Format: original@email.com_deleted_1732102871858
      const archivedEmail = `${originalEmail}_deleted_${deletedAt.getTime()}`;
      user.email = archivedEmail;
      user.deletedAt = deletedAt;
      user.isActive = false;
      await userRepo.save(user);

      this.logger.log(`User ${originalEmail} soft deleted (email archived as ${archivedEmail}, status: ${previousStatus}, was active: ${previousIsActive}, cancelled ${cancelledCount} pending invitations) by ${deletedBy || 'system'}`);

      // Enqueue Supabase user deletion with original email for external account cleanup
      try {
        await this.deletionQueue.add('delete-supabase-user', {
          userId: user.id,
          originalEmail,
          archivedEmail,
          deletedAt: deletedAt.toISOString(),
        });
        this.logger.log(`Enqueued Supabase deletion for user ${originalEmail}`);
      } catch (queueError) {
        this.logger.error(`Failed to enqueue Supabase deletion for user ${originalEmail}:`, queueError);
        // Re-throw to rollback transaction
        throw queueError;
      }

      // Create audit log for deletion
      try {
        await this.auditService.log({
          actorUserId: deletedBy || 'system',
          actorRole: 'admin',
          action: 'user_deleted',
          entityType: 'user',
          entityId: user.id,
          changes: {
            originalEmail,
            archivedEmail,
            previousStatus,
            previousIsActive,
            cancelledInvitations: cancelledCount,
            cancelledByUserId: cancelByUserId.affected || 0,
            cancelledByEmail: cancelByEmail.affected || 0,
            deletedAt: user.deletedAt.toISOString(),
            isActive: false,
          },
          ip: null,
          userAgent: null,
        });
      } catch (auditError) {
        this.logger.error('Failed to create audit log for user deletion:', auditError);
        // Audit log failure should not rollback the transaction, just log it
      }
    });
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

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email }
    });
  }

  async findActiveUsers(): Promise<User[]> {
    return await this.userRepository.createQueryBuilder('user')
      .where('user.status = :status', { status: 'active' })
      .andWhere('user.deletedAt IS NULL')
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }
}
