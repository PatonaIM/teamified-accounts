import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, In } from 'typeorm';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { Invitation, InvitationStatus } from './entities/invitation.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { CreateInternalInvitationDto } from './dto/create-internal-invitation.dto';
import { AcceptInternalInvitationDto } from './dto/accept-internal-invitation.dto';
import { InvitationResponseDto } from './dto/invitation-response.dto';
import { InvitationPreviewDto } from './dto/invitation-preview.dto';
import { InternalInvitationResponseDto } from './dto/internal-invitation-response.dto';
import { AcceptOrganizationInvitationDto } from './dto/accept-organization-invitation.dto';
import { AcceptInvitationResponseDto } from '../auth/dto/accept-invitation.dto';
import { AuditService } from '../audit/audit.service';
import { OrganizationMember } from '../organizations/entities/organization-member.entity';
import { User } from '../auth/entities/user.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { UserEmail, EmailType } from '../user-emails/entities/user-email.entity';
import { PasswordService } from '../auth/services/password.service';
import { EmailService } from '../email/services/email.service';
import { Organization } from '../organizations/entities/organization.entity';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(OrganizationMember)
    private memberRepository: Repository<OrganizationMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(UserEmail)
    private userEmailRepository: Repository<UserEmail>,
    private auditService: AuditService,
    private passwordService: PasswordService,
    private emailService: EmailService,
  ) {}

  /**
   * Extract all roleTypes from user's userRoles array
   */
  private getAllRoles(user: User): string[] {
    return user.userRoles?.map(ur => ur.roleType) || [];
  }

  /**
   * Build invitation access policy for current user
   * Returns flags indicating what invitation operations are allowed
   */
  private buildInvitationAccessPolicy(currentUser: User): {
    canViewAll: boolean;
    canManageAll: boolean;
    allowedOrgIds: string[];
    noAccess: boolean;
  } {
    const roles = this.getAllRoles(currentUser);
    
    // Internal roles have global access
    const internalRoles = ['super_admin', 'internal_hr', 'internal_recruiter', 
                           'internal_account_manager', 'internal_finance', 'internal_marketing'];
    const hasInternalRole = roles.some(r => internalRoles.includes(r));
    
    if (hasInternalRole) {
      return {
        canViewAll: true,
        canManageAll: true,
        allowedOrgIds: [],
        noAccess: false,
      };
    }
    
    // Client roles can only view/manage invitations for organizations they're members of
    const hasClientRole = roles.some(r => r.startsWith('client_'));
    
    if (hasClientRole) {
      // Filter for active memberships only
      const activeMemberships = currentUser.organizationMembers?.filter(
        om => om.status === 'active'
      ) || [];
      
      const orgIds = activeMemberships.map(om => om.organizationId);
      
      if (orgIds.length === 0) {
        return {
          canViewAll: false,
          canManageAll: false,
          allowedOrgIds: [],
          noAccess: true, // No active orgs = no access
        };
      }
      
      return {
        canViewAll: false,
        canManageAll: false,
        allowedOrgIds: orgIds,
        noAccess: false,
      };
    }
    
    // No recognized roles = no access
    return {
      canViewAll: false,
      canManageAll: false,
      allowedOrgIds: [],
      noAccess: true,
    };
  }

  /**
   * Validate organization access with granular role-based permission checks
   * @param organizationId - The organization ID to validate access for
   * @param currentUser - The full User entity with roles and memberships
   * @param requiredPermission - The specific permission needed (create, read, or revoke)
   * @throws ForbiddenException if user doesn't have access to this organization
   */
  private validateOrgAccess(
    organizationId: string, 
    currentUser: User, 
    requiredPermission: 'create' | 'read' | 'revoke' = 'read'
  ): void {
    const policy = this.buildInvitationAccessPolicy(currentUser);
    const roles = this.getAllRoles(currentUser);
    
    // No access at all
    if (policy.noAccess) {
      throw new ForbiddenException('You do not have permission to access invitations');
    }
    
    // Internal roles can access all organizations
    if (policy.canManageAll) {
      // But internal_account_manager can only read/revoke, not create internal invitations
      if (requiredPermission === 'create' && roles.includes('internal_account_manager')) {
        // Allow internal_account_manager to create client invitations
        // Only super_admin can create internal invitations (checked in controller)
      }
      return;
    }
    
    // Client roles must be members of the organization
    if (!policy.allowedOrgIds.includes(organizationId)) {
      throw new ForbiddenException('You are not a member of this organization');
    }
    
    // Granular permission checks for client roles
    if (requiredPermission === 'create') {
      // Only client_admin can create invitations
      if (!roles.includes('client_admin')) {
        throw new ForbiddenException('Only client admins can create invitations');
      }
    } else if (requiredPermission === 'revoke') {
      // Only client_admin can revoke invitations  
      if (!roles.includes('client_admin')) {
        throw new ForbiddenException('Only client admins can cancel invitations');
      }
    }
    // For 'read' permission, any member can view invitations
  }

  async create(
    createInvitationDto: CreateInvitationDto, 
    currentUser: User,
    baseUrl: string,
    ip?: string,
    userAgent?: string,
  ): Promise<InvitationResponseDto> {
    // Validate organization access with create permission
    this.validateOrgAccess(createInvitationDto.organizationId, currentUser, 'create');
    
    const roles = this.getAllRoles(currentUser);

    // Generate unique invite code with collision detection
    let inviteCode: string;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      inviteCode = this.generateInviteCode();
      const existing = await this.invitationRepository.findOne({
        where: { inviteCode },
      });
      
      if (!existing) {
        break;
      }
      
      attempts++;
      if (attempts >= maxAttempts) {
        this.logger.error(`Failed to generate unique invite code after ${maxAttempts} attempts`);
        throw new BadRequestException('Failed to generate unique invitation code. Please try again.');
      }
    } while (attempts < maxAttempts);

    const invitation = this.invitationRepository.create({
      organizationId: createInvitationDto.organizationId,
      inviteCode,
      invitedBy: currentUser.id,
      roleType: createInvitationDto.roleType,
      maxUses: createInvitationDto.maxUses || null,
      currentUses: 0,
      status: InvitationStatus.PENDING,
    });

    const savedInvitation = await this.invitationRepository.save(invitation);

    // Create audit log entry
    await this.auditService.log({
      actorUserId: currentUser.id,
      actorRole: roles[0] || 'unknown',
      action: 'invitation.created',
      entityType: 'invitation',
      entityId: savedInvitation.id,
      changes: {
        organizationId: createInvitationDto.organizationId,
        roleType: createInvitationDto.roleType,
        maxUses: createInvitationDto.maxUses,
        inviteCode,
      },
      ip,
      userAgent,
    });

    return this.toResponseDto(savedInvitation, baseUrl);
  }

  async createInternalInvitation(
    createDto: CreateInternalInvitationDto,
    currentUser: User,
    baseUrl: string,
    expirationHours?: number, // Optional expiration in hours (default 7 days = 168 hours)
    ip?: string,
    userAgent?: string,
  ): Promise<InternalInvitationResponseDto> {
    const roles = this.getAllRoles(currentUser);
    // Generate unique invite code with collision detection
    let inviteCode: string;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      inviteCode = this.generateInviteCode();
      const existing = await this.invitationRepository.findOne({
        where: { inviteCode },
      });
      
      if (!existing) {
        break;
      }
      
      attempts++;
      if (attempts >= maxAttempts) {
        this.logger.error(`Failed to generate unique invite code after ${maxAttempts} attempts`);
        throw new BadRequestException('Failed to generate unique invitation code. Please try again.');
      }
    } while (attempts < maxAttempts);

    // Set expiration time: default to 7 days (168 hours), or use custom expiration
    const expiresAt = new Date();
    const hours = expirationHours ?? 168; // Default to 7 days if not specified
    expiresAt.setHours(expiresAt.getHours() + hours);

    // Create user account immediately with status='invited' if email is provided
    let invitedUserId: string | null = null;
    if (createDto.email) {
      const email = createDto.email.toLowerCase();
      
      // First, check if user already exists
      let user = await this.userRepository.findOne({
        where: { email },
      });

      // If user exists, check for pending invitations using the user ID
      if (user) {
        const existingInvitations = await this.invitationRepository.find({
          where: {
            organizationId: null, // Internal invitations
            status: InvitationStatus.PENDING,
            invitedUserId: user.id,
          },
        });

        // If pending invitation exists and force is not true, throw error to ask for confirmation
        if (existingInvitations.length > 0 && !createDto.force) {
          throw new ConflictException({
            message: 'A pending invitation already exists for this email address',
            code: 'PENDING_INVITATION_EXISTS',
            existingInvitationId: existingInvitations[0].id,
          });
        }

        // If force is true, cancel all existing pending invitations for this email
        if (existingInvitations.length > 0 && createDto.force) {
          this.logger.log(`Force=true, cancelling ${existingInvitations.length} pending invitation(s) for ${email}`);
          for (const invite of existingInvitations) {
            invite.status = InvitationStatus.CANCELLED;
            await this.invitationRepository.save(invite);
            this.logger.log(`✓ Cancelled invitation ${invite.id}`);
          }
        }
      }

      // Now handle user creation or reuse
      if (user) {
        this.logger.log(`Found existing user for ${email}: id=${user.id}, status=${user.status}, deletedAt=${user.deletedAt}`);
        // If user exists but is not in 'invited' status, throw error
        if (user.status !== 'invited') {
          this.logger.error(`Cannot invite ${createDto.email}: user already exists with status ${user.status}`);
          throw new BadRequestException(`User with email ${createDto.email} already exists and is ${user.status}`);
        }
        // Reuse existing invited user
        invitedUserId = user.id;
        this.logger.log(`Reusing existing invited user: ${email}`);
      } else {
        // Create new user with status='invited' and no password
        user = this.userRepository.create({
          email,
          firstName: '',  // Will be set when accepting invitation
          lastName: '',   // Will be set when accepting invitation
          passwordHash: null, // No password yet - will be set when accepting invitation
          status: 'invited',
          isActive: false,
          emailVerified: false,
          migratedFromZoho: false,
        });

        const savedUser = await this.userRepository.save(user);
        invitedUserId = savedUser.id;
        this.logger.log(`Created new invited user: ${email}`);
      }

      // Assign role to invited user (new or existing) so they appear in the internal users table
      // Check if role already exists to avoid duplicates
      const existingRole = await this.userRoleRepository.findOne({
        where: { userId: invitedUserId },
      });

      if (existingRole) {
        // Update existing role if role type has changed
        if (existingRole.roleType !== createDto.roleType) {
          existingRole.roleType = createDto.roleType;
          existingRole.grantedBy = currentUser.id;
          await this.userRoleRepository.save(existingRole);
          this.logger.log(`Updated role from ${existingRole.roleType} to ${createDto.roleType} for invited user`);
        }
      } else {
        // Create new role
        const userRole = this.userRoleRepository.create({
          userId: invitedUserId,
          roleType: createDto.roleType,
          scope: 'global',
          scopeEntityId: null,
          grantedBy: currentUser.id,
        });
        await this.userRoleRepository.save(userRole);
        this.logger.log(`Assigned role ${createDto.roleType} to invited user`);
      }
    }

    const invitation = this.invitationRepository.create({
      organizationId: null, // Internal invitations don't belong to an organization
      inviteCode,
      invitedBy: currentUser.id,
      invitedUserId, // Link to the pre-created user
      roleType: createDto.roleType,
      maxUses: createDto.maxUses || 1, // Default to 1 for internal invitations
      currentUses: 0,
      status: InvitationStatus.PENDING,
      expiresAt,
    });

    const savedInvitation = await this.invitationRepository.save(invitation);

    // Build invite link for the email
    const inviteLink = `${baseUrl}/accept-invitation?code=${inviteCode}`;

    // Send internal invitation email only if email is provided
    if (createDto.email) {
      try {
        await this.emailService.sendInternalUserInvitationEmail(
          createDto.email,
          inviteLink,
          expiresAt,
        );
        this.logger.log(`Internal invitation email sent to ${createDto.email}`);
      } catch (error) {
        this.logger.error(`Failed to send internal invitation email to ${createDto.email}: ${error.message}`, error.stack);
      }
    } else {
      this.logger.log(`Internal invitation created without email - link-only invitation`);
    }

    // Create audit log entry
    await this.auditService.log({
      actorUserId: currentUser.id,
      actorRole: roles[0] || 'unknown',
      action: 'internal_invitation.created',
      entityType: 'invitation',
      entityId: savedInvitation.id,
      changes: {
        email: createDto.email,
        roleType: createDto.roleType,
        maxUses: createDto.maxUses,
        inviteCode,
        expiresAt,
      },
      ip,
      userAgent,
    });

    return this.toInternalResponseDto(savedInvitation, baseUrl);
  }

  /**
   * Generate a shareable invite link for internal members with 1-hour expiration
   * @param currentUser - The full User entity creating the link
   * @param baseUrl - Base URL for building the invite link
   * @param ip - IP address of the request
   * @param userAgent - User agent of the request
   * @returns Invitation response with the shareable link
   */
  async generateShareableInviteLink(
    currentUser: User,
    baseUrl: string,
    ip?: string,
    userAgent?: string,
  ): Promise<InternalInvitationResponseDto> {
    const roles = this.getAllRoles(currentUser);
    // Generate unique invite code with collision detection
    let inviteCode: string;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      inviteCode = this.generateInviteCode();
      const existing = await this.invitationRepository.findOne({
        where: { inviteCode },
      });
      
      if (!existing) {
        break;
      }
      
      attempts++;
      if (attempts >= maxAttempts) {
        this.logger.error(`Failed to generate unique invite code after ${maxAttempts} attempts`);
        throw new BadRequestException('Failed to generate unique invitation code. Please try again.');
      }
    } while (attempts < maxAttempts);

    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const invitation = this.invitationRepository.create({
      organizationId: null, // Internal invitations don't belong to an organization
      inviteCode,
      invitedBy: currentUser.id,
      roleType: 'internal_member', // Shareable links always assign internal_member role
      maxUses: 1, // Each link can be used once
      currentUses: 0,
      status: InvitationStatus.PENDING,
      expiresAt,
    });

    const savedInvitation = await this.invitationRepository.save(invitation);

    // Create audit log entry
    await this.auditService.log({
      actorUserId: currentUser.id,
      actorRole: roles[0] || 'unknown',
      action: 'internal_invitation.shareable_link_generated',
      entityType: 'invitation',
      entityId: savedInvitation.id,
      changes: {
        roleType: 'internal_member',
        maxUses: 1,
        inviteCode,
        expiresAt,
        linkType: 'shareable',
      },
      ip,
      userAgent,
    });

    this.logger.log(`Shareable invite link generated with 1-hour expiration: ${inviteCode}`);

    return this.toInternalResponseDto(savedInvitation, baseUrl);
  }

  async generateOrgShareableLink(
    organizationId: string,
    roleType: 
      | 'candidate'
      | 'client_admin'
      | 'client_hr'
      | 'client_finance'
      | 'client_recruiter'
      | 'client_employee',
    maxUses: number,
    currentUser: User,
    baseUrl: string,
    ip?: string,
    userAgent?: string,
  ): Promise<InvitationResponseDto> {
    // Validate organization access with create permission
    this.validateOrgAccess(organizationId, currentUser, 'create');
    
    const roles = this.getAllRoles(currentUser);

    // Generate unique invite code with collision detection
    let inviteCode: string;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      inviteCode = this.generateInviteCode();
      const existing = await this.invitationRepository.findOne({
        where: { inviteCode },
      });
      
      if (!existing) {
        break;
      }
      
      attempts++;
      if (attempts >= maxAttempts) {
        this.logger.error(`Failed to generate unique invite code after ${maxAttempts} attempts`);
        throw new BadRequestException('Failed to generate unique invitation code. Please try again.');
      }
    } while (attempts < maxAttempts);

    // Set expiration to 7 days from now (consistent with email invitations)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = this.invitationRepository.create({
      organizationId,
      inviteCode,
      invitedBy: currentUser.id,
      roleType,
      maxUses: maxUses || null,
      currentUses: 0,
      status: InvitationStatus.PENDING,
      expiresAt,
    });

    const savedInvitation = await this.invitationRepository.save(invitation);

    // Create audit log entry
    await this.auditService.log({
      actorUserId: currentUser.id,
      actorRole: roles[0] || 'unknown',
      action: 'invitation.shareable_link_generated',
      entityType: 'invitation',
      entityId: savedInvitation.id,
      changes: {
        organizationId,
        roleType,
        maxUses,
        inviteCode,
        expiresAt,
        linkType: 'shareable',
      },
      ip,
      userAgent,
    });

    this.logger.log(`Organization shareable invite link generated for org ${organizationId}: ${inviteCode}`);

    return this.toResponseDto(savedInvitation, baseUrl);
  }

  async sendOrgEmailInvitation(
    organizationId: string,
    email: string,
    roleType: 
      | 'candidate'
      | 'client_admin'
      | 'client_hr'
      | 'client_finance'
      | 'client_recruiter'
      | 'client_employee',
    firstName: string | undefined,
    lastName: string | undefined,
    currentUser: User,
    baseUrl: string,
    ip?: string,
    userAgent?: string,
  ): Promise<InvitationResponseDto> {
    this.validateOrgAccess(organizationId, currentUser, 'create');
    
    const roles = this.getAllRoles(currentUser);

    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new BadRequestException('Organization not found');
    }

    // Check if user already exists with this email
    let user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    // Check if user is already a member of this organization
    if (user) {
      const existingMembership = await this.memberRepository.findOne({
        where: { 
          organizationId, 
          userId: user.id,
        },
      });
      
      if (existingMembership && existingMembership.status !== 'invited') {
        throw new BadRequestException('User is already a member of this organization');
      }
    }

    // Create user account with 'invited' status if they don't exist
    if (!user) {
      user = this.userRepository.create({
        email: email.toLowerCase(),
        firstName: firstName || 'Invited',
        lastName: lastName || 'User',
        passwordHash: null, // No password until they accept the invitation
        status: 'invited',
        isActive: false,
        emailVerified: false,
      });
      user = await this.userRepository.save(user);
      this.logger.log(`Created invited user account for ${email}: ${user.id}`);
    }

    // Create organization membership with 'invited' status if it doesn't exist
    let membership = await this.memberRepository.findOne({
      where: { 
        organizationId, 
        userId: user.id,
      },
    });

    if (!membership) {
      membership = this.memberRepository.create({
        organizationId,
        userId: user.id,
        status: 'invited',
        invitedBy: currentUser.id,
      });
      await this.memberRepository.save(membership);
      this.logger.log(`Created invited membership for user ${user.id} in org ${organizationId}`);
    }

    // Create UserRole for the invited user
    const existingRole = await this.userRoleRepository.findOne({
      where: {
        userId: user.id,
        roleType,
        scope: 'organization',
        scopeEntityId: organizationId,
      },
    });

    if (!existingRole) {
      const userRole = this.userRoleRepository.create({
        userId: user.id,
        roleType,
        scope: 'organization',
        scopeEntityId: organizationId,
      });
      await this.userRoleRepository.save(userRole);
      this.logger.log(`Created role ${roleType} for invited user ${user.id}`);
    }

    let inviteCode: string;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      inviteCode = this.generateInviteCode();
      const existing = await this.invitationRepository.findOne({
        where: { inviteCode },
      });
      
      if (!existing) {
        break;
      }
      
      attempts++;
      if (attempts >= maxAttempts) {
        this.logger.error(`Failed to generate unique invite code after ${maxAttempts} attempts`);
        throw new BadRequestException('Failed to generate unique invitation code. Please try again.');
      }
    } while (attempts < maxAttempts);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = this.invitationRepository.create({
      organizationId,
      inviteCode,
      invitedBy: currentUser.id,
      invitedUserId: user.id,
      email: email.toLowerCase(),
      roleType,
      maxUses: 1,
      currentUses: 0,
      status: InvitationStatus.PENDING,
      expiresAt,
    });

    const savedInvitation = await this.invitationRepository.save(invitation);

    const inviteLink = `${baseUrl}/invitations/accept/${inviteCode}`;
    
    const emailSent = await this.emailService.sendOrganizationInvitationEmail(
      email,
      firstName,
      lastName,
      organization.name,
      inviteLink,
      roleType,
      expiresAt,
    );

    if (!emailSent) {
      this.logger.error(`Failed to send invitation email to ${email}`);
      throw new BadRequestException(
        'Invitation created but email could not be sent. Please check the email address or try again later. The invitation link has been generated and can be shared manually.'
      );
    }

    await this.auditService.log({
      actorUserId: currentUser.id,
      actorRole: roles[0] || 'unknown',
      action: 'invitation.email_sent',
      entityType: 'invitation',
      entityId: savedInvitation.id,
      changes: {
        organizationId,
        email,
        firstName,
        lastName,
        roleType,
        inviteCode,
        expiresAt,
        invitationType: 'email',
        invitedUserId: user.id,
      },
      ip,
      userAgent,
    });

    this.logger.log(`Organization email invitation sent to ${email} for org ${organizationId}: ${inviteCode}`);

    return this.toResponseDto(savedInvitation, baseUrl);
  }

  async findInternal(baseUrl?: string): Promise<InternalInvitationResponseDto[]> {
    const invitations = await this.invitationRepository.find({
      where: {
        organizationId: null as any,
      },
      relations: [], // Explicitly exclude all relations to prevent organization data leakage
      order: {
        createdAt: 'DESC',
      },
    });

    return invitations.map(inv => this.toInternalResponseDto(inv, baseUrl));
  }

  async findAll(
    currentUser: User,
    organizationId?: string,
    baseUrl?: string,
  ): Promise<InvitationResponseDto[]> {
    const policy = this.buildInvitationAccessPolicy(currentUser);
    
    // No access at all
    if (policy.noAccess) {
      throw new ForbiddenException('You do not have permission to access invitations');
    }
    
    const where: any = {};
    
    // Apply organization scoping for client roles
    if (!policy.canManageAll) {
      // Client roles can only see invitations for their organizations
      const memberships = await this.memberRepository.find({
        where: {
          userId: currentUser.id,
          status: 'active',
        },
      });

      const organizationIds = memberships.map(m => m.organizationId);

      if (organizationIds.length === 0) {
        // User is not a member of any organization
        return [];
      }

      // If organizationId filter is provided, validate it's in the allowed list
      if (organizationId) {
        if (!organizationIds.includes(organizationId)) {
          // Client user is trying to access invitations for an org they're not a member of
          throw new ForbiddenException('You do not have access to this organization');
        }
        // Filter to the specific organization (already validated it's allowed)
        where.organizationId = organizationId;
      } else {
        // No specific org requested - return invitations for all orgs the user is a member of
        where.organizationId = In(organizationIds);
      }
    } else {
      // Internal/super_admin roles can filter by organizationId or see all
      if (organizationId) {
        where.organizationId = organizationId;
      }
    }

    const invitations = await this.invitationRepository.find({
      where,
      relations: ['organization'],
      order: {
        createdAt: 'DESC',
      },
    });

    return invitations.map(inv => this.toResponseDto(inv, baseUrl));
  }

  async findOne(id: string, baseUrl?: string): Promise<InvitationResponseDto> {
    const invitation = await this.invitationRepository.findOne({ 
      where: { id },
      relations: ['organization'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return this.toResponseDto(invitation, baseUrl);
  }

  async findByCode(inviteCode: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { inviteCode },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Check if expired
    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    // Check if already used up
    if (invitation.maxUses && invitation.currentUses >= invitation.maxUses) {
      throw new BadRequestException('Invitation has reached maximum uses');
    }

    // Check if cancelled
    if (invitation.status === InvitationStatus.CANCELLED) {
      throw new BadRequestException('Invitation has been cancelled');
    }

    return invitation;
  }

  async acceptInvitation(inviteCode: string, userId: string): Promise<void> {
    const invitation = await this.findByCode(inviteCode);

    // Increment use count
    invitation.currentUses += 1;

    // If maxUses is set and reached, mark as accepted
    if (invitation.maxUses && invitation.currentUses >= invitation.maxUses) {
      invitation.status = InvitationStatus.ACCEPTED;
    }

    await this.invitationRepository.save(invitation);

    // Log acceptance (user accepts their own invitation)
    await this.auditService.log({
      actorUserId: userId,
      actorRole: 'user',
      action: 'invitation.accepted',
      entityType: 'invitation',
      entityId: invitation.id,
      changes: {
        inviteCode,
        organizationId: invitation.organizationId,
        roleType: invitation.roleType,
        currentUses: invitation.currentUses,
        maxUses: invitation.maxUses,
      },
    });
  }

  /**
   * Accept invitation as an authenticated user
   * For existing users who are already logged in - no password required
   */
  async acceptInvitationAuthenticated(
    inviteCode: string,
    user: User,
    ip?: string,
    userAgent?: string,
  ): Promise<{ message: string; organizationId: string; organizationName: string; role: string }> {
    this.logger.log(`[acceptInvitationAuthenticated] Starting for user ${user.email}`);

    // 1. Find and validate invitation
    const invitation = await this.invitationRepository.findOne({
      where: { inviteCode },
      relations: ['organization', 'invitedUser'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // 2. Check invitation validity
    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(`Invitation has already been ${invitation.status}`);
    }

    if (invitation.maxUses && invitation.currentUses >= invitation.maxUses) {
      throw new BadRequestException('Invitation has reached maximum uses');
    }

    // 3. Verify user's email matches the invitation
    const invitedEmail = invitation.email || invitation.invitedUser?.email;
    if (invitedEmail && user.email.toLowerCase() !== invitedEmail.toLowerCase()) {
      throw new BadRequestException(
        `This invitation was sent to ${invitedEmail}. Please log in with that email address.`
      );
    }

    // 4. Check if user is already a member of this organization
    const existingMembership = await this.memberRepository.findOne({
      where: { 
        userId: user.id, 
        organizationId: invitation.organizationId 
      },
    });

    if (existingMembership) {
      if (existingMembership.status === 'active') {
        throw new BadRequestException('You are already a member of this organization');
      }
      // Reactivate inactive membership
      existingMembership.status = 'active';
      await this.memberRepository.save(existingMembership);
    } else {
      // Create new membership
      const membership = this.memberRepository.create({
        userId: user.id,
        organizationId: invitation.organizationId,
        status: 'active',
        joinedAt: new Date(),
      });
      await this.memberRepository.save(membership);
    }

    // 4.5. Create work email association for this organization if it doesn't exist
    const existingWorkEmail = await this.userEmailRepository.findOne({
      where: { 
        userId: user.id, 
        organizationId: invitation.organizationId,
        emailType: EmailType.WORK
      }
    });

    if (!existingWorkEmail) {
      const workEmail = this.userEmailRepository.create({
        email: user.email,
        userId: user.id,
        organizationId: invitation.organizationId,
        emailType: EmailType.WORK,
        isPrimary: false,
        isVerified: user.emailVerified || false,
      });
      await this.userEmailRepository.save(workEmail);
      this.logger.log(`Created work email record for ${user.email} linked to org ${invitation.organizationId}`);
    }

    // 5. Assign role if not already assigned
    const existingRole = await this.userRoleRepository.findOne({
      where: {
        userId: user.id,
        roleType: invitation.roleType,
        scope: 'organization',
        scopeEntityId: invitation.organizationId,
      },
    });

    if (!existingRole) {
      const userRole = this.userRoleRepository.create({
        userId: user.id,
        roleType: invitation.roleType,
        scope: 'organization',
        scopeEntityId: invitation.organizationId,
        grantedBy: invitation.invitedBy,
      });
      await this.userRoleRepository.save(userRole);
    }

    // 6. Update invitation usage (directly, to avoid redundant database load)
    invitation.currentUses += 1;
    if (invitation.maxUses && invitation.currentUses >= invitation.maxUses) {
      invitation.status = InvitationStatus.ACCEPTED;
    }
    await this.invitationRepository.save(invitation);

    // 7. Log the acceptance
    await this.auditService.log({
      actorUserId: user.id,
      actorRole: invitation.roleType,
      action: 'invitation.accepted_authenticated',
      entityType: 'invitation',
      entityId: invitation.id,
      changes: {
        organizationId: invitation.organizationId,
        organizationName: invitation.organization.name,
        roleType: invitation.roleType,
        currentUses: invitation.currentUses,
        maxUses: invitation.maxUses,
        status: invitation.status,
      },
      ip,
      userAgent,
    });

    this.logger.log(`[acceptInvitationAuthenticated] User ${user.email} joined ${invitation.organization.name} (uses: ${invitation.currentUses}/${invitation.maxUses || 'unlimited'})`);

    return {
      message: 'Successfully joined organization',
      organizationId: invitation.organizationId,
      organizationName: invitation.organization.name,
      role: invitation.roleType,
    };
  }

  /**
   * Accept organization invitation - Public endpoint for new users
   * Handles complete signup + organization membership flow
   * Supports account linking via optional personalEmail field
   */
  async acceptOrganizationInvitation(
    acceptDto: AcceptOrganizationInvitationDto,
    baseUrl: string,
    ip?: string,
    userAgent?: string,
  ): Promise<AcceptInvitationResponseDto> {
    const { inviteCode, email, password, confirmPassword, firstName, lastName, personalEmail } = acceptDto;
    const workEmail = email.toLowerCase(); // This is the work email from the invitation
    const isAccountLinkingRequest = !!personalEmail;

    // 1. Validate required fields based on flow type
    if (!isAccountLinkingRequest) {
      // For new accounts: firstName, lastName, and confirmPassword are required
      if (!firstName?.trim()) {
        throw new BadRequestException('First name is required');
      }
      if (!lastName?.trim()) {
        throw new BadRequestException('Last name is required');
      }
      if (!confirmPassword) {
        throw new BadRequestException('Password confirmation is required');
      }
      if (password !== confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      // Validate password policy for new accounts
      const passwordValidation = this.passwordService.validatePasswordPolicy(password);
      if (!passwordValidation.isValid) {
        throw new BadRequestException({
          message: 'Password does not meet security requirements',
          errors: passwordValidation.errors,
        });
      }
    }
    // For account linking: password is used for verification, not creation (no policy check needed)

    // 3. Find and validate invitation using findByCode() (handles expiration, usage, status checks)
    const invitation = await this.findByCode(inviteCode);

    // 4. Check if work email is already in use
    const existingWorkEmailUser = await this.userRepository.findOne({
      where: { email: workEmail },
    });

    // Also check if work email exists in user_emails table
    const existingWorkEmailRecord = await this.userEmailRepository.findOne({
      where: { email: workEmail },
    });

    if (existingWorkEmailRecord) {
      throw new ConflictException('This work email is already linked to an account');
    }

    // 5. Handle account linking flow if personalEmail is provided
    let user: User | null = null;
    let isAccountLinking = false;

    if (personalEmail) {
      // Try to find existing user by personal email
      const existingUserByPersonalEmail = await this.userRepository.findOne({
        where: { email: personalEmail.toLowerCase() },
      });

      // Also check user_emails table for the personal email
      const existingPersonalEmailRecord = await this.userEmailRepository.findOne({
        where: { email: personalEmail.toLowerCase() },
        relations: ['user'],
      });

      const linkedUser = existingUserByPersonalEmail || existingPersonalEmailRecord?.user;

      if (linkedUser && linkedUser.isActive && linkedUser.status !== 'invited') {
        // Found an active user - verify password to prove account ownership
        const isPasswordValid = await this.passwordService.verifyPassword(
          password,
          linkedUser.passwordHash,
        );
        if (!isPasswordValid) {
          throw new BadRequestException('Invalid password for the existing account. Please enter your current password to link accounts.');
        }
        // Password verified - link the work email to this account
        user = linkedUser;
        isAccountLinking = true;
        this.logger.log(`Account linking: Found and verified existing user ${linkedUser.id} via personal email ${personalEmail}`);
      } else if (linkedUser) {
        // User exists but is not active - don't allow linking
        throw new BadRequestException('The personal email provided is associated with an inactive account. Please create a new account instead.');
      } else {
        // Personal email not found - inform user
        throw new BadRequestException('No existing account found with that personal email. Leave the field empty to create a new account.');
      }
    } else {
      // No personal email - check if work email exists as a user
      user = existingWorkEmailUser;
      
      // If user exists and is active (not invited status): throw ConflictException
      if (user && user.isActive && user.status !== 'invited') {
        throw new ConflictException('User already has an account');
      }
    }

    // Hash the password (only used for new accounts, ignored for account linking)
    const hashedPassword = await this.passwordService.hashPassword(password);

    // 6 & 7. Create or update user (skip if account linking)
    if (isAccountLinking && user) {
      // For account linking, we don't modify the existing user's password or details
      // We just add the work email and create membership
      this.logger.log(`Account linking: Skipping user creation, using existing user ${user.id}`);
    } else if (!user) {
      // Create new user with work email as primary
      user = this.userRepository.create({
        email: workEmail,
        firstName,
        lastName,
        passwordHash: hashedPassword,
        status: 'active',
        isActive: true,
        emailVerified: false,
        emailVerificationToken: uuidv4(),
        emailVerificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });
      user = await this.userRepository.save(user);
    } else {
      // Activate invited or inactive user
      user.passwordHash = hashedPassword;
      user.firstName = firstName;
      user.lastName = lastName;
      user.status = 'active';
      user.isActive = true;
      user.emailVerified = false;
      user.emailVerificationToken = uuidv4();
      user.emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      user = await this.userRepository.save(user);
    }

    const savedUser = user;

    // 7.5. Create work email record in user_emails table (linked to organization)
    const workEmailRecord = this.userEmailRepository.create({
      userId: savedUser.id,
      email: workEmail,
      emailType: EmailType.WORK,
      organizationId: invitation.organizationId,
      isPrimary: !isAccountLinking, // Primary only if this is a new account
      isVerified: false,
      verificationToken: uuidv4(),
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await this.userEmailRepository.save(workEmailRecord);
    this.logger.log(`Created work email record for ${workEmail} linked to org ${invitation.organizationId}`);

    // 8. Check for existing membership (may exist with 'invited' status) or create new one
    let membership = await this.memberRepository.findOne({
      where: {
        organizationId: invitation.organizationId,
        userId: savedUser.id,
      },
    });

    if (membership) {
      // Update existing membership to active
      membership.status = 'active';
      await this.memberRepository.save(membership);
    } else {
      // Create new membership
      membership = this.memberRepository.create({
        organizationId: invitation.organizationId,
        userId: savedUser.id,
        status: 'active',
        invitedBy: invitation.invitedBy,
      });
      await this.memberRepository.save(membership);
    }

    // 9. Check for existing user role or create new one
    let userRole = await this.userRoleRepository.findOne({
      where: {
        userId: savedUser.id,
        roleType: invitation.roleType,
        scope: 'organization',
        scopeEntityId: invitation.organizationId,
      },
    });

    if (!userRole) {
      userRole = this.userRoleRepository.create({
        userId: savedUser.id,
        roleType: invitation.roleType,
        scope: 'organization',
        scopeEntityId: invitation.organizationId,
        grantedBy: invitation.invitedBy,
      });
      await this.userRoleRepository.save(userRole);
    }

    // 10. Call acceptInvitation to increment usage counter
    await this.acceptInvitation(inviteCode, savedUser.id);

    // 11. Send email verification
    try {
      await this.sendEmailVerification(savedUser, baseUrl);
    } catch (error) {
      this.logger.warn(`Failed to send email verification to ${savedUser.email}: ${error.message}`);
    }

    // 12. Create comprehensive audit logs
    const auditLogs = [
      this.auditService.log({
        actorUserId: savedUser.id,
        actorRole: invitation.roleType,
        action: 'organization_membership_created',
        entityType: 'OrganizationMember',
        entityId: membership.id,
        changes: {
          organizationId: invitation.organizationId,
          userId: savedUser.id,
          status: 'active',
          invitedBy: invitation.invitedBy,
          isAccountLinking,
        },
        ip,
        userAgent,
      }),
      this.auditService.log({
        actorUserId: savedUser.id,
        actorRole: invitation.roleType,
        action: 'role_assigned',
        entityType: 'UserRole',
        entityId: userRole.id,
        changes: {
          userId: savedUser.id,
          roleType: invitation.roleType,
          scope: 'organization',
          scopeEntityId: invitation.organizationId,
        },
        ip,
        userAgent,
      }),
      this.auditService.log({
        actorUserId: savedUser.id,
        actorRole: invitation.roleType,
        action: 'work_email_linked',
        entityType: 'UserEmail',
        entityId: workEmailRecord.id,
        changes: {
          workEmail,
          organizationId: invitation.organizationId,
          isAccountLinking,
          personalEmail: personalEmail || null,
        },
        ip,
        userAgent,
      }),
    ];

    // Only log account creation if not account linking
    if (!isAccountLinking) {
      auditLogs.push(
        this.auditService.log({
          actorUserId: savedUser.id,
          actorRole: invitation.roleType,
          action: 'account_created',
          entityType: 'User',
          entityId: savedUser.id,
          changes: {
            email: savedUser.email,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            isActive: true,
          },
          ip,
          userAgent,
        }),
      );
    } else {
      auditLogs.push(
        this.auditService.log({
          actorUserId: savedUser.id,
          actorRole: invitation.roleType,
          action: 'account_linked',
          entityType: 'User',
          entityId: savedUser.id,
          changes: {
            workEmailLinked: workEmail,
            personalEmail: personalEmail,
            organizationId: invitation.organizationId,
          },
          ip,
          userAgent,
        }),
      );
    }

    await Promise.all(auditLogs);

    if (isAccountLinking) {
      this.logger.log(`Account linking: User ${savedUser.email} linked work email ${workEmail} and joined organization ${invitation.organizationId}`);
    } else {
      this.logger.log(`User ${savedUser.email} accepted organization invitation and joined organization ${invitation.organizationId}`);
    }

    // 13. Return response DTO with user info
    const responseMessage = isAccountLinking
      ? `Work email ${workEmail} has been linked to your existing account. You can now log in with either email.`
      : 'Account activated successfully. Please check your email to verify your email address.';

    return {
      userId: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      isActive: savedUser.isActive,
      emailVerified: savedUser.emailVerified,
      message: responseMessage,
    };
  }

  /**
   * Get internal invitation details by code - Public endpoint
   * Returns safe invitation info without sensitive data
   */
  async getInternalInvitationDetails(inviteCode: string) {
    const invitation = await this.invitationRepository.findOne({
      where: { inviteCode },
      relations: ['invitedUser'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Validate this is an internal invitation
    if (invitation.organizationId !== null) {
      throw new BadRequestException('This invitation is not for internal users');
    }

    // Return safe invitation details
    return {
      inviteCode: invitation.inviteCode,
      roleType: invitation.roleType,
      hasPreassignedEmail: !!invitation.invitedUserId,
      email: invitation.invitedUser?.email || null,
      expiresAt: invitation.expiresAt,
      isExpired: invitation.expiresAt < new Date(),
      status: invitation.status,
    };
  }

  /**
   * Accept internal invitation - Public endpoint for internal team members
   * Handles password setup + role assignment for pre-created or new users
   */
  async acceptInternalInvitation(
    acceptDto: AcceptInternalInvitationDto,
    baseUrl: string,
    ip?: string,
    userAgent?: string,
  ): Promise<AcceptInvitationResponseDto> {
    const { inviteCode, email, password, confirmPassword, firstName, lastName } = acceptDto;

    // 1. Validate passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // 2. Validate password policy
    const passwordValidation = this.passwordService.validatePasswordPolicy(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors,
      });
    }

    // 3. Find and validate invitation
    const invitation = await this.findByCode(inviteCode);

    // 4. Validate this is an internal invitation (organizationId should be null)
    if (invitation.organizationId !== null) {
      throw new BadRequestException('This invitation is not for internal users');
    }

    // 5. Validate email domain for security
    const emailLower = email.toLowerCase();
    if (!emailLower.endsWith('@teamified.com') && !emailLower.endsWith('@teamified.com.au')) {
      throw new BadRequestException('Only @teamified.com or @teamified.com.au email addresses are allowed');
    }

    // 6. Check if user was pre-created (invitedUserId exists) or if this is a shareable link
    let user: User;
    if (invitation.invitedUserId) {
      // Pre-created user - fetch and update
      user = await this.userRepository.findOne({
        where: { id: invitation.invitedUserId },
      });
      
      if (!user) {
        throw new NotFoundException('Invited user account not found');
      }

      // Verify email matches if it was pre-created
      if (user.email !== emailLower) {
        throw new BadRequestException('Email does not match the invitation');
      }
    } else {
      // Shareable link - check if user exists
      user = await this.userRepository.findOne({
        where: { email: emailLower },
      });

      if (user && user.status !== 'invited' && user.status !== 'archived') {
        throw new ConflictException('User already has an account');
      }
    }

    // 7. Hash the password
    const hashedPassword = await this.passwordService.hashPassword(password);

    // 8. Create or update user
    const isReactivation = user && user.status === 'archived';
    
    if (!user) {
      user = this.userRepository.create({
        email: emailLower,
        firstName,
        lastName,
        passwordHash: hashedPassword,
        status: 'active',
        isActive: true,
        emailVerified: false,
        emailVerificationToken: uuidv4(),
        emailVerificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        migratedFromZoho: false,
      });
    } else {
      user.firstName = firstName;
      user.lastName = lastName;
      user.passwordHash = hashedPassword;
      user.status = 'active';
      user.isActive = true;
      user.emailVerified = false;
      user.emailVerificationToken = uuidv4();
      user.emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      // Clear deletedAt for reactivation
      if (isReactivation) {
        user.deletedAt = null;
        this.logger.log(`Reactivating archived user: ${emailLower}`);
      }
    }

    const savedUser = await this.userRepository.save(user);

    // 9. Update user role (should already exist from invitation creation)
    const existingRole = await this.userRoleRepository.findOne({
      where: { userId: savedUser.id },
    });

    if (existingRole) {
      // Update role if needed (though it should already match from invitation)
      existingRole.roleType = invitation.roleType;
      existingRole.scope = 'global';
      existingRole.scopeEntityId = null;
      existingRole.grantedBy = invitation.invitedBy;
      await this.userRoleRepository.save(existingRole);
      this.logger.log(`Updated existing role for user ${savedUser.email}`);
    } else {
      // Create role if it doesn't exist (fallback for legacy invitations)
      const userRole = this.userRoleRepository.create({
        userId: savedUser.id,
        roleType: invitation.roleType,
        scope: 'global',
        scopeEntityId: null,
        grantedBy: invitation.invitedBy,
      });
      await this.userRoleRepository.save(userRole);
      this.logger.log(`Created new role for user ${savedUser.email}`);
    }

    // 10. Mark invitation as accepted
    await this.acceptInvitation(inviteCode, savedUser.id);

    // 11. Send email verification
    try {
      await this.sendEmailVerification(savedUser, baseUrl);
    } catch (error) {
      this.logger.warn(`Failed to send email verification to ${savedUser.email}: ${error.message}`);
    }

    // 12. Create audit logs
    const auditLogs = [
      this.auditService.log({
        actorUserId: savedUser.id,
        actorRole: invitation.roleType,
        action: 'internal_invitation_accepted',
        entityType: 'User',
        entityId: savedUser.id,
        changes: {
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          roleType: invitation.roleType,
        },
        ip,
        userAgent,
      }),
      this.auditService.log({
        actorUserId: savedUser.id,
        actorRole: invitation.roleType,
        action: 'role_assigned',
        entityType: 'UserRole',
        entityId: savedUser.id,
        changes: {
          userId: savedUser.id,
          roleType: invitation.roleType,
          scope: 'global',
        },
        ip,
        userAgent,
      }),
    ];
    
    // Add reactivation audit log if this was an archived user
    if (isReactivation) {
      auditLogs.push(
        this.auditService.log({
          actorUserId: savedUser.id,
          actorRole: invitation.roleType,
          action: 'user_reactivation',
          entityType: 'User',
          entityId: savedUser.id,
          changes: {
            email: savedUser.email,
            previousStatus: 'archived',
            newStatus: 'active',
            deletedAt: null,
          },
          ip,
          userAgent,
        })
      );
    }
    
    await Promise.all(auditLogs);

    if (isReactivation) {
      this.logger.log(`Archived user ${savedUser.email} was reactivated and assigned role ${invitation.roleType}`);
    } else {
      this.logger.log(`Internal user ${savedUser.email} accepted invitation and was assigned role ${invitation.roleType}`);
    }

    return {
      userId: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      isActive: savedUser.isActive,
      emailVerified: savedUser.emailVerified,
      message: isReactivation 
        ? 'Account reactivated successfully. Please check your email to verify your email address.'
        : 'Account activated successfully. Please check your email to verify your email address.',
    };
  }

  /**
   * Send email verification to user
   */
  private async sendEmailVerification(user: User, baseUrl: string): Promise<void> {
    const verificationLink = this.generateEmailVerificationLink(user.emailVerificationToken, baseUrl);
    
    const htmlTemplate = this.generateEmailVerificationHtmlTemplate(user, verificationLink);
    const textTemplate = this.generateEmailVerificationTextTemplate(user, verificationLink);

    const emailSent = await this.emailService.sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Teamified',
      html: htmlTemplate,
      text: textTemplate,
    });

    if (emailSent) {
      await this.auditService.log({
        actorUserId: user.id,
        actorRole: 'User',
        action: 'email_verification_sent',
        entityType: 'User',
        entityId: user.id,
        changes: {
          email: user.email,
          verificationToken: user.emailVerificationToken,
        },
      });
    }
  }

  private generateEmailVerificationLink(token: string, baseUrl: string): string {
    return `${baseUrl}/verify-email?token=${token}`;
  }

  private generateEmailVerificationHtmlTemplate(user: User, verificationLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Teamified</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; background-color: #f8f9fa; }
        .cta-button { 
            display: inline-block; 
            background-color: #4CAF50;
            color: white; 
            padding: 14px 36px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
            font-weight: 600;
            font-size: 16px;
        }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .expiry-warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .link-box { background-color: #e8eaf6; padding: 15px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 13px; margin: 15px 0; border-left: 4px solid #667eea; }
        .security-note { background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; border-radius: 4px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to Teamified!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.95;">Email Verification Required</p>
        </div>
        <div class="content">
            <h2 style="margin-top: 0; color: #667eea;">Hello ${user.firstName},</h2>
            
            <p style="font-size: 16px;">Thank you for joining <strong>Teamified</strong>! We're excited to have you on board.</p>
            
            <p>To complete your registration and access all features, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" class="cta-button" style="color: white !important; text-decoration: none;">Verify Email Address</a>
            </div>
            
            <div class="expiry-warning">
                <strong>⏰ Important:</strong> This verification link will expire in <strong>24 hours</strong> for security reasons. 
                Please verify your email before this time.
            </div>
            
            <p style="margin-top: 25px;"><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
            <div class="link-box">
                ${verificationLink}
            </div>
            
            <div class="security-note">
                <strong>🔒 Security Notice:</strong> This email was sent because someone created an account with this email address. If you didn't create this account, you can safely ignore this email.
            </div>
            
            <h3 style="color: #667eea; margin-top: 30px;">What's next?</h3>
            <ol style="padding-left: 20px; line-height: 1.8;">
                <li>Click the verification link above</li>
                <li>Your email will be verified automatically</li>
                <li>Start exploring Teamified!</li>
            </ol>
            
            <p style="margin-top: 30px;">If you have any questions or need assistance, please contact our support team.</p>
            
            <p style="margin-top: 25px;">Welcome aboard!</p>
        </div>
        <div class="footer">
            <p style="margin: 5px 0;">This is an automated message from Teamified.</p>
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} Teamified. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateEmailVerificationTextTemplate(user: User, verificationLink: string): string {
    return `
🎉 Welcome to Teamified!
Email Verification Required

Hello ${user.firstName},

Thank you for joining Teamified! We're excited to have you on board.

To complete your registration and access all features, please verify your email address by visiting:
${verificationLink}

IMPORTANT: This verification link will expire in 24 hours for security reasons. Please verify your email before this time.

SECURITY NOTICE: This email was sent because someone created an account with this email address. If you didn't create this account, you can safely ignore this email.

What's next:
1. Click the verification link above
2. Your email will be verified automatically
3. Start exploring Teamified!

If you have any questions or need assistance, please contact our support team.

Welcome aboard!

This is an automated message from Teamified.
© ${new Date().getFullYear()} Teamified. All rights reserved.
`;
  }

  async cancel(
    id: string,
    currentUser: User,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    const roles = this.getAllRoles(currentUser);
    
    const invitation = await this.invitationRepository.findOne({ 
      where: { id } 
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Validate organization access with revoke permission before allowing cancellation
    this.validateOrgAccess(invitation.organizationId, currentUser, 'revoke');

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Can only cancel pending invitations');
    }

    invitation.status = InvitationStatus.CANCELLED;
    await this.invitationRepository.save(invitation);

    // Log cancellation with actual actorRole
    await this.auditService.log({
      actorUserId: currentUser.id,
      actorRole: roles[0] || 'unknown',
      action: 'invitation.cancelled',
      entityType: 'invitation',
      entityId: invitation.id,
      changes: {
        organizationId: invitation.organizationId,
        roleType: invitation.roleType,
      },
      ip,
      userAgent,
    });
  }

  // Clean up expired invitations
  async cleanupExpiredInvitations(): Promise<number> {
    const result = await this.invitationRepository
      .createQueryBuilder()
      .update(Invitation)
      .set({ status: InvitationStatus.EXPIRED })
      .where('expires_at < :now', { now: new Date() })
      .andWhere('status = :status', { status: InvitationStatus.PENDING })
      .execute();

    return result.affected || 0;
  }

  /**
   * Preview an invitation without requiring authentication
   * Returns public information about the invitation
   * @param code - The invitation code
   */
  async preview(code: string): Promise<InvitationPreviewDto> {
    const invitation = await this.invitationRepository.findOne({
      where: { inviteCode: code },
      relations: ['organization', 'inviter', 'invitedUser'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const now = new Date();
    const isExpired = invitation.expiresAt < now;
    const isPending = invitation.status === InvitationStatus.PENDING;
    const isValid = isPending && !isExpired;

    // Map all invitation statuses to validity messages
    let validityMessage = '';
    switch (invitation.status) {
      case InvitationStatus.PENDING:
        if (isExpired) {
          validityMessage = 'This invitation has expired';
        } else {
          validityMessage = 'This invitation is valid and ready to accept';
        }
        break;
      case InvitationStatus.ACCEPTED:
        validityMessage = 'This invitation has already been accepted';
        break;
      case InvitationStatus.EXPIRED:
        validityMessage = 'This invitation has expired';
        break;
      case InvitationStatus.CANCELLED:
        validityMessage = 'This invitation has been cancelled';
        break;
      default:
        validityMessage = `This invitation is ${invitation.status}`;
        break;
    }

    // Check if the invited user has completed signup
    // A user has completed signup if they have a password set AND have first/last name filled in
    const invitedUser = invitation.invitedUser;
    const hasCompletedSignup = invitedUser 
      ? !!(invitedUser.passwordHash && invitedUser.firstName && invitedUser.lastName)
      : false;

    return {
      organizationName: invitation.organization.name,
      organizationSlug: invitation.organization.slug,
      roleType: invitation.roleType,
      inviterName: `${invitation.inviter.firstName} ${invitation.inviter.lastName}`.trim() || 'Team Member',
      inviterEmail: invitation.inviter.email,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      isValid,
      validityMessage,
      createdAt: invitation.createdAt,
      invitedEmail: invitation.email || invitedUser?.email,
      hasCompletedSignup,
      invitedUserFirstName: hasCompletedSignup ? invitedUser?.firstName : undefined,
      invitedUserLastName: hasCompletedSignup ? invitedUser?.lastName : undefined,
    };
  }

  private generateInviteCode(): string {
    // Generate a secure random invite code (URL-safe)
    return randomBytes(32).toString('base64url');
  }

  private toResponseDto(invitation: Invitation, baseUrl?: string): InvitationResponseDto {
    const response: InvitationResponseDto = {
      id: invitation.id,
      organizationId: invitation.organizationId,
      inviteCode: invitation.inviteCode,
      invitedBy: invitation.invitedBy,
      roleType: invitation.roleType as any,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      maxUses: invitation.maxUses,
      currentUses: invitation.currentUses,
      createdAt: invitation.createdAt,
    };

    // Add organization name if available
    if (invitation.organization) {
      response.organizationName = invitation.organization.name;
    }

    // Build invitation URL if baseUrl is provided
    if (baseUrl) {
      response.invitationUrl = `${baseUrl}/invitations/accept/${invitation.inviteCode}`;
    }

    return response;
  }

  private toInternalResponseDto(invitation: Invitation, baseUrl?: string): InternalInvitationResponseDto {
    const response: InternalInvitationResponseDto = {
      id: invitation.id,
      inviteCode: invitation.inviteCode,
      invitedBy: invitation.invitedBy,
      roleType: invitation.roleType as any,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      maxUses: invitation.maxUses,
      currentUses: invitation.currentUses,
      createdAt: invitation.createdAt,
    };

    // Build invitation URL if baseUrl is provided
    if (baseUrl) {
      response.invitationUrl = `${baseUrl}/accept-invitation?code=${invitation.inviteCode}`;
    }

    return response;
  }

  /**
   * S2S: Get all invitations (no user context required)
   * For service-to-service API access with read:invitations scope
   */
  async findAllS2S(organizationId?: string, status?: string): Promise<InvitationResponseDto[]> {
    const queryBuilder = this.invitationRepository
      .createQueryBuilder('invitation')
      .leftJoinAndSelect('invitation.organization', 'organization')
      .orderBy('invitation.createdAt', 'DESC');

    if (organizationId) {
      queryBuilder.andWhere('invitation.organizationId = :organizationId', { organizationId });
    }

    if (status) {
      queryBuilder.andWhere('invitation.status = :status', { status });
    }

    const invitations = await queryBuilder.getMany();
    return invitations.map(inv => this.toResponseDto(inv));
  }

  /**
   * S2S: Get invitation by ID (no user context required)
   * For service-to-service API access with read:invitations scope
   */
  async findOneS2S(id: string): Promise<InvitationResponseDto> {
    const invitation = await this.invitationRepository.findOne({
      where: { id },
      relations: ['organization'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return this.toResponseDto(invitation);
  }

  /**
   * S2S: Create invitation (no user context required)
   * For service-to-service API access with write:invitations scope
   */
  async createS2S(
    createDto: CreateInvitationDto,
    baseUrl: string,
    serviceClient?: { clientId: string; clientName: string; scopes: string[] },
  ): Promise<InvitationResponseDto> {
    // Verify organization exists
    const organization = await this.organizationRepository.findOne({
      where: { id: createDto.organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Generate unique invite code
    const inviteCode = randomBytes(16).toString('hex');

    // Calculate expiration date (default 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = this.invitationRepository.create({
      id: uuidv4(),
      organizationId: createDto.organizationId,
      inviteCode,
      invitedBy: `s2s:${serviceClient?.clientName || 'unknown'}`,
      roleType: createDto.roleType,
      status: InvitationStatus.PENDING,
      expiresAt,
      maxUses: createDto.maxUses || 1,
      currentUses: 0,
    });

    const savedInvitation = await this.invitationRepository.save(invitation);

    // Log audit
    await this.auditService.log({
      action: 'INVITATION_CREATED_S2S',
      entityType: 'Invitation',
      entityId: savedInvitation.id,
      actorUserId: `s2s:${serviceClient?.clientId || 'unknown'}`,
      actorRole: 'service',
      changes: {
        organizationId: createDto.organizationId,
        roleType: createDto.roleType,
        clientName: serviceClient?.clientName,
      },
    });

    return this.toResponseDto(savedInvitation, baseUrl);
  }
}