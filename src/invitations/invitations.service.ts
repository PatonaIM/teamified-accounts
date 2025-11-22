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
      roleType,
      maxUses: 1,
      currentUses: 0,
      status: InvitationStatus.PENDING,
      expiresAt,
    });

    const savedInvitation = await this.invitationRepository.save(invitation);

    const inviteLink = `${baseUrl}/invitations/accept/${inviteCode}`;
    
    await this.emailService.sendOrganizationInvitationEmail(
      email,
      firstName,
      lastName,
      organization.name,
      inviteLink,
      roleType,
      expiresAt,
    );

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
   * Accept organization invitation - Public endpoint for new users
   * Handles complete signup + organization membership flow
   */
  async acceptOrganizationInvitation(
    acceptDto: AcceptOrganizationInvitationDto,
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

    // 3. Find and validate invitation using findByCode() (handles expiration, usage, status checks)
    const invitation = await this.findByCode(inviteCode);

    // 4. Check if user exists with this email
    let user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    // 5. If user exists and is active: throw ConflictException
    if (user && user.isActive) {
      throw new ConflictException('User already has an account');
    }

    // Hash the password
    const hashedPassword = await this.passwordService.hashPassword(password);

    // 6 & 7. Create or update user
    if (!user) {
      // Create new user
      user = this.userRepository.create({
        email: email.toLowerCase(),
        firstName,
        lastName,
        passwordHash: hashedPassword,
        isActive: true,
        emailVerified: false,
        emailVerificationToken: uuidv4(),
        emailVerificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });
    } else {
      // Reactivate inactive user
      user.passwordHash = hashedPassword;
      user.firstName = firstName;
      user.lastName = lastName;
      user.isActive = true;
      user.emailVerified = false;
      user.emailVerificationToken = uuidv4();
      user.emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    const savedUser = await this.userRepository.save(user);

    // 8. Create organization membership
    const membership = this.memberRepository.create({
      organizationId: invitation.organizationId,
      userId: savedUser.id,
      status: 'active',
      invitedBy: invitation.invitedBy,
    });

    await this.memberRepository.save(membership);

    // 9. Create user role
    const userRole = this.userRoleRepository.create({
      userId: savedUser.id,
      roleType: invitation.roleType,
      scope: 'organization',
      scopeEntityId: invitation.organizationId,
      grantedBy: invitation.invitedBy,
    });

    await this.userRoleRepository.save(userRole);

    // 10. Call acceptInvitation to increment usage counter
    await this.acceptInvitation(inviteCode, savedUser.id);

    // 11. Send email verification
    try {
      await this.sendEmailVerification(savedUser, baseUrl);
    } catch (error) {
      this.logger.warn(`Failed to send email verification to ${savedUser.email}: ${error.message}`);
    }

    // 12. Create comprehensive audit logs
    await Promise.all([
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
    ]);

    this.logger.log(`User ${savedUser.email} accepted organization invitation and joined organization ${invitation.organizationId}`);

    // 13. Return response DTO with user info
    return {
      userId: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      isActive: savedUser.isActive,
      emailVerified: savedUser.emailVerified,
      message: 'Account activated successfully. Please check your email to verify your email address.',
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
      relations: ['organization', 'inviter'],
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
}