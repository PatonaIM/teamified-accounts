import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationMember } from './entities/organization-member.entity';
import { User } from '../auth/entities/user.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { Invitation, InvitationStatus } from '../invitations/entities/invitation.entity';
import { AuditService } from '../audit/audit.service';
import { EmailService } from '../email/services/email.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { OrganizationMemberResponseDto } from './dto/organization-member-response.dto';
import { ConvertCandidateDto, ConvertCandidateResponseDto } from './dto/convert-candidate.dto';
import { RoleType } from '../invitations/dto/create-invitation.dto';
import { ObjectStorageService } from '../blob-storage/object-storage.service';
import { GlobalSearchResponseDto, UserSearchResult } from './dto/search-global.dto';
import { UserEmailsService } from '../user-emails/user-emails.service';
import { EmailType } from '../user-emails/entities/user-email.entity';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private readonly memberRepository: Repository<OrganizationMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    private readonly auditService: AuditService,
    private readonly emailService: EmailService,
    private readonly objectStorageService: ObjectStorageService,
    @Inject(forwardRef(() => UserEmailsService))
    private readonly userEmailsService: UserEmailsService,
  ) {}

  /**
   * Normalize slug: trim whitespace, convert to lowercase, collapse consecutive hyphens, remove trailing/leading hyphens
   */
  private normalizeSlug(slug: string): string {
    return slug
      .trim()
      .toLowerCase()
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Get all roles for a user from their userRoles relation
   */
  private getAllRoles(user: User): string[] {
    if (!user.userRoles || user.userRoles.length === 0) {
      return [];
    }
    
    return user.userRoles.map(ur => ur.roleType);
  }

  /**
   * Build organization access policy for a user
   * Returns lightweight policy with flags for permissions
   */
  private buildOrgAccessPolicy(currentUser: User): {
    canViewAll: boolean;
    allowedOrgIds: string[];
    noAccess: boolean;
  } {
    const roles = this.getAllRoles(currentUser);
    
    // Internal roles can view all organizations
    const internalRoles = [
      'super_admin',
      'admin',
      'internal_hr',
      'hr',
      'internal_recruiter',
      'internal_account_manager',
      'internal_finance',
      'internal_marketing',
      'timesheet_approver',
    ];
    
    const hasInternalRole = roles.some(r => internalRoles.includes(r));
    
    if (hasInternalRole) {
      return {
        canViewAll: true,
        allowedOrgIds: [],
        noAccess: false,
      };
    }
    
    // Client roles can only view organizations they're members of
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
          allowedOrgIds: [],
          noAccess: true, // No active orgs = no access
        };
      }
      
      return {
        canViewAll: false,
        allowedOrgIds: orgIds,
        noAccess: false,
      };
    }
    
    // No recognized roles = no access
    return {
      canViewAll: false,
      allowedOrgIds: [],
      noAccess: true,
    };
  }

  /**
   * Validate access to a specific organization
   * @throws ForbiddenException if user doesn't have access
   */
  private validateOrgAccess(organizationId: string, currentUser: User): void {
    const policy = this.buildOrgAccessPolicy(currentUser);
    
    if (policy.noAccess) {
      throw new ForbiddenException('You do not have permission to access organizations');
    }
    
    if (policy.canViewAll) {
      return; // Internal roles have access to all orgs
    }
    
    // Check if org is in allowed list
    if (!policy.allowedOrgIds.includes(organizationId)) {
      throw new ForbiddenException('You are not a member of this organization');
    }
  }

  /**
   * Check if a user can access another user's details
   * Client users can only access users within their shared organizations
   * Internal users can access any user
   */
  async canUserAccessUser(currentUserId: string, targetUserId: string): Promise<boolean> {
    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['userRoles', 'organizationMembers'],
    });
    
    if (!currentUser) {
      return false;
    }
    
    const roles = this.getAllRoles(currentUser);
    
    const internalRoles = [
      'super_admin',
      'admin',
      'internal_hr',
      'hr',
      'internal_recruiter',
      'internal_account_manager',
      'internal_finance',
      'internal_marketing',
      'internal_staff',
      'timesheet_approver',
    ];
    
    const hasInternalRole = roles.some(r => internalRoles.includes(r));
    
    if (hasInternalRole) {
      return true;
    }
    
    const activeMemberships = currentUser.organizationMembers?.filter(
      om => om.status === 'active'
    ) || [];
    
    const currentUserOrgIds = activeMemberships.map(om => om.organizationId);
    
    if (currentUserOrgIds.length === 0) {
      return false;
    }
    
    const sharedMembership = await this.memberRepository
      .createQueryBuilder('member')
      .where('member.userId = :targetUserId', { targetUserId })
      .andWhere('member.status = :status', { status: 'active' })
      .andWhere('member.organizationId IN (:...orgIds)', { orgIds: currentUserOrgIds })
      .getOne();
    
    return !!sharedMembership;
  }

  async create(
    createDto: CreateOrganizationDto,
    currentUser: User,
    ip: string,
    userAgent: string,
  ): Promise<OrganizationResponseDto> {
    const normalizedSlug = this.normalizeSlug(createDto.slug);
    
    // Prevent 'internal' subscription tier selection for client organizations
    // Only Teamified organization can have 'internal' tier
    if (createDto.subscriptionTier === 'internal') {
      throw new BadRequestException(
        'The "internal" subscription tier is reserved for Teamified organization only and cannot be assigned to client organizations.'
      );
    }
    
    // Check for existing org including soft-deleted ones
    const existingOrg = await this.organizationRepository.findOne({
      where: { slug: normalizedSlug },
      withDeleted: true,
    });

    const roles = this.getAllRoles(currentUser);

    // If org exists and is soft-deleted, restore it with updated info
    if (existingOrg && existingOrg.deletedAt) {
      this.logger.log(`Restoring soft-deleted organization: ${existingOrg.name} (${existingOrg.id})`);
      
      // Restore the organization with new data
      existingOrg.deletedAt = null;
      existingOrg.name = createDto.name;
      existingOrg.subscriptionTier = createDto.subscriptionTier || existingOrg.subscriptionTier || 'free';
      existingOrg.subscriptionStatus = 'active';
      
      const restoredOrg = await this.organizationRepository.save(existingOrg);
      
      this.logger.log(`Organization restored: ${restoredOrg.name} (${restoredOrg.id}) by user ${currentUser.id}`);

      await this.auditService.log({
        actorUserId: currentUser.id,
        actorRole: roles[0] || 'unknown',
        action: 'organization_restored',
        entityType: 'Organization',
        entityId: restoredOrg.id,
        changes: {
          name: restoredOrg.name,
          slug: restoredOrg.slug,
          subscriptionTier: restoredOrg.subscriptionTier,
          restoredFrom: 'soft_deleted',
        },
        ip,
        userAgent,
      });

      return { ...this.mapToResponseDto(restoredOrg), wasRestored: true };
    }

    // If org exists and is active, throw conflict error
    if (existingOrg) {
      throw new ConflictException(`Organization with slug '${normalizedSlug}' already exists`);
    }

    const organization = this.organizationRepository.create({
      ...createDto,
      slug: normalizedSlug,
      subscriptionTier: createDto.subscriptionTier || 'free',
      subscriptionStatus: 'active',
      settings: {},
    });

    const savedOrg = await this.organizationRepository.save(organization);

    this.logger.log(`Organization created: ${savedOrg.name} (${savedOrg.id}) by user ${currentUser.id}`);

    await this.auditService.log({
      actorUserId: currentUser.id,
      actorRole: roles[0] || 'unknown',
      action: 'organization_created',
      entityType: 'Organization',
      entityId: savedOrg.id,
      changes: {
        name: savedOrg.name,
        slug: savedOrg.slug,
        subscriptionTier: savedOrg.subscriptionTier,
      },
      ip,
      userAgent,
    });

    return this.mapToResponseDto(savedOrg);
  }

  async findAll(currentUser: User, queryParams?: any): Promise<any> {
    const policy = this.buildOrgAccessPolicy(currentUser);
    
    // Return empty for no access
    if (policy.noAccess) {
      return {
        organizations: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }
    
    const page = queryParams?.page || 1;
    const limit = queryParams?.limit || 20;
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.organizationRepository
      .createQueryBuilder('org')
      .leftJoin('org.members', 'members', 'members.status = :activeStatus', { activeStatus: 'active' })
      .leftJoin('members.user', 'memberUser', 'memberUser.status != :archivedStatus AND memberUser.deletedAt IS NULL', { archivedStatus: 'archived' })
      .addSelect('COUNT(memberUser.id)', 'membercount')
      .where('org.deletedAt IS NULL')
      .groupBy('org.id');
    
    // Apply org filtering for client roles
    if (!policy.canViewAll && policy.allowedOrgIds.length > 0) {
      queryBuilder.andWhere('org.id IN (:...orgIds)', { orgIds: policy.allowedOrgIds });
    }
    
    // Apply search filter
    if (queryParams?.search) {
      queryBuilder.andWhere(
        '(LOWER(org.name) LIKE LOWER(:search) OR LOWER(org.slug) LIKE LOWER(:search))',
        { search: `%${queryParams.search}%` }
      );
    }
    
    // Apply industry filter
    if (queryParams?.industry) {
      queryBuilder.andWhere('org.industry = :industry', { industry: queryParams.industry });
    }
    
    // Apply company size filter
    if (queryParams?.companySize) {
      queryBuilder.andWhere('org.companySize = :companySize', { companySize: queryParams.companySize });
    }
    
    // Apply status filter
    if (queryParams?.status) {
      queryBuilder.andWhere('org.status = :status', { status: queryParams.status });
    }
    
    // Apply subscription tier filter
    if (queryParams?.subscriptionTier) {
      queryBuilder.andWhere('org.subscriptionTier = :subscriptionTier', { subscriptionTier: queryParams.subscriptionTier });
    }
    
    // Get total count before pagination
    const totalCountQuery = queryBuilder.clone();
    const totalResult = await totalCountQuery.getRawMany();
    const total = totalResult.length;
    
    // Apply custom sorting:
    // 1. Teamified organization first (slug = 'teamified-internal')
    // 2. Then by subscription tier priority (internal > enterprise > professional > basic > free)
    // 3. Then by member count descending
    queryBuilder.addSelect(`
      CASE 
        WHEN org.slug = 'teamified-internal' THEN 0
        ELSE 1
      END
    `, 'is_teamified_order');
    
    queryBuilder.addSelect(`
      CASE org.subscription_tier
        WHEN 'internal' THEN 1
        WHEN 'enterprise' THEN 2
        WHEN 'professional' THEN 3
        WHEN 'basic' THEN 4
        WHEN 'free' THEN 5
        ELSE 6
      END
    `, 'tier_order');
    
    queryBuilder
      .orderBy('is_teamified_order', 'ASC')
      .addOrderBy('tier_order', 'ASC')
      .addOrderBy('membercount', 'DESC')
      .skip(skip)
      .take(limit);
    
    const organizations = await queryBuilder.getRawAndEntities();

    const organizationsWithCount = organizations.entities.map((org, index) => ({
      ...this.mapToResponseDto(org),
      memberCount: parseInt(organizations.raw[index].membercount, 10) || 0,
    }));

    return {
      organizations: organizationsWithCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, currentUser: User): Promise<OrganizationResponseDto> {
    this.validateOrgAccess(id, currentUser);

    const result = await this.organizationRepository
      .createQueryBuilder('org')
      .leftJoin('org.members', 'members', 'members.status = :activeStatus', { activeStatus: 'active' })
      .leftJoin('members.user', 'memberUser', 'memberUser.status != :archivedStatus AND memberUser.deletedAt IS NULL', { archivedStatus: 'archived' })
      .where('org.id = :id', { id })
      .andWhere('org.deletedAt IS NULL')
      .addSelect('COUNT(memberUser.id)', 'membercount')
      .groupBy('org.id')
      .getRawAndEntities();

    if (!result.entities.length) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    const organization = result.entities[0];
    const memberCount = parseInt(result.raw[0].membercount, 10) || 0;

    return {
      ...this.mapToResponseDto(organization),
      memberCount,
    };
  }

  async getMyOrganization(currentUser: User): Promise<OrganizationResponseDto> {
    const enrichedUser = await this.userRepository.findOne({
      where: { id: currentUser.id },
      relations: ['organizationMembers', 'organizationMembers.organization', 'userRoles'],
    });
    
    if (!enrichedUser) {
      throw new NotFoundException('User not found');
    }
    
    const policy = this.buildOrgAccessPolicy(enrichedUser);
    
    if (policy.noAccess || policy.allowedOrgIds.length === 0) {
      throw new NotFoundException('You do not belong to any organization');
    }
    
    const organizationId = policy.allowedOrgIds[0];
    
    return this.findOne(organizationId, enrichedUser);
  }

  async getMyOrganizations(currentUser: User): Promise<OrganizationResponseDto[]> {
    const enrichedUser = await this.userRepository.findOne({
      where: { id: currentUser.id },
      relations: ['organizationMembers', 'organizationMembers.organization', 'userRoles'],
    });
    
    if (!enrichedUser) {
      return [];
    }
    
    const policy = this.buildOrgAccessPolicy(enrichedUser);
    
    if (policy.noAccess || policy.allowedOrgIds.length === 0) {
      return [];
    }
    
    const organizations: OrganizationResponseDto[] = [];
    
    for (const orgId of policy.allowedOrgIds) {
      try {
        const org = await this.findOne(orgId, enrichedUser);
        organizations.push(org);
      } catch (error) {
        this.logger.warn(`Could not fetch organization ${orgId} for user ${currentUser.id}`);
      }
    }
    
    return organizations;
  }

  async getOrphanMemberCount(organizationId: string): Promise<{ totalMembers: number; willBecomeOrphans: number }> {
    const members = await this.memberRepository.find({
      where: { organizationId, status: 'active' },
      relations: ['user'],
    });
    
    let orphanCount = 0;
    
    for (const member of members) {
      const otherMemberships = await this.memberRepository.count({
        where: {
          userId: member.userId,
          status: 'active',
        },
      });
      
      if (otherMemberships <= 1) {
        orphanCount++;
      }
    }
    
    return {
      totalMembers: members.length,
      willBecomeOrphans: orphanCount,
    };
  }

  async findBySlug(slug: string): Promise<OrganizationResponseDto> {
    const organization = await this.organizationRepository.findOne({
      where: { slug },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with slug '${slug}' not found`);
    }

    return this.mapToResponseDto(organization);
  }

  async findBySlugWithAccess(slug: string, currentUser: User): Promise<OrganizationResponseDto> {
    const organization = await this.organizationRepository.findOne({
      where: { slug, deletedAt: null } as any,
    });

    if (!organization) {
      throw new NotFoundException(`Organization with slug '${slug}' not found`);
    }

    this.validateOrgAccess(organization.id, currentUser);

    const result = await this.organizationRepository
      .createQueryBuilder('org')
      .leftJoin('org.members', 'members', 'members.status = :activeStatus', { activeStatus: 'active' })
      .leftJoin('members.user', 'memberUser', 'memberUser.status != :archivedStatus AND memberUser.deletedAt IS NULL', { archivedStatus: 'archived' })
      .where('org.id = :id', { id: organization.id })
      .andWhere('org.deletedAt IS NULL')
      .addSelect('COUNT(memberUser.id)', 'membercount')
      .groupBy('org.id')
      .getRawAndEntities();

    const memberCount = parseInt(result.raw[0]?.membercount, 10) || 0;

    return {
      ...this.mapToResponseDto(organization),
      memberCount,
    };
  }

  async checkSlugAvailability(slug: string): Promise<{ available: boolean; slug: string; isSoftDeleted?: boolean }> {
    if (!slug || slug.length < 2 || slug.length > 100) {
      throw new BadRequestException('Slug must be between 2 and 100 characters');
    }

    const normalizedSlug = this.normalizeSlug(slug);
    
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
      throw new BadRequestException('Slug must be lowercase alphanumeric with hyphens only (e.g., acme-corp)');
    }

    // Check for active organizations
    const activeOrg = await this.organizationRepository.findOne({
      where: { slug: normalizedSlug },
    });

    if (activeOrg) {
      return {
        available: false,
        slug: normalizedSlug,
        isSoftDeleted: false,
      };
    }

    // Check for soft-deleted organizations
    const softDeletedOrg = await this.organizationRepository.findOne({
      where: { slug: normalizedSlug },
      withDeleted: true,
    });

    if (softDeletedOrg) {
      return {
        available: true,
        slug: normalizedSlug,
        isSoftDeleted: true,
      };
    }

    return {
      available: true,
      slug: normalizedSlug,
      isSoftDeleted: false,
    };
  }

  async update(
    id: string,
    updateDto: UpdateOrganizationDto,
    currentUser: User,
    ip: string,
    userAgent: string,
  ): Promise<OrganizationResponseDto> {
    this.validateOrgAccess(id, currentUser);

    const organization = await this.organizationRepository.findOne({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    // Prevent changing to 'internal' subscription tier
    // Only Teamified can have 'internal' tier, and it cannot be changed
    if (updateDto.subscriptionTier === 'internal' && organization.slug !== 'teamified-internal') {
      throw new BadRequestException(
        'The "internal" subscription tier is reserved for Teamified organization only and cannot be assigned to client organizations.'
      );
    }
    
    // Prevent changing Teamified's subscription tier away from 'internal'
    if (organization.slug === 'teamified-internal' && updateDto.subscriptionTier && updateDto.subscriptionTier !== 'internal') {
      throw new BadRequestException(
        'Teamified organization must maintain "internal" subscription tier.'
      );
    }

    if (updateDto.slug && updateDto.slug !== organization.slug) {
      const normalizedSlug = this.normalizeSlug(updateDto.slug);
      
      const existingOrg = await this.organizationRepository.findOne({
        where: { slug: normalizedSlug },
      });

      if (existingOrg) {
        throw new ConflictException(`Organization with slug '${normalizedSlug}' already exists`);
      }
      
      updateDto.slug = normalizedSlug;
    }

    const oldData = {
      name: organization.name,
      slug: organization.slug,
      industry: organization.industry,
      companySize: organization.companySize,
    };

    Object.assign(organization, updateDto);

    const updatedOrg = await this.organizationRepository.save(organization);

    this.logger.log(`Organization updated: ${updatedOrg.name} (${updatedOrg.id}) by user ${currentUser.id}`);

    const roles = this.getAllRoles(currentUser);
    await this.auditService.log({
      actorUserId: currentUser.id,
      actorRole: roles[0] || 'unknown',
      action: 'organization_updated',
      entityType: 'Organization',
      entityId: updatedOrg.id,
      changes: {
        old: oldData,
        new: {
          name: updatedOrg.name,
          slug: updatedOrg.slug,
          industry: updatedOrg.industry,
          companySize: updatedOrg.companySize,
        },
      },
      ip,
      userAgent,
    });

    return this.mapToResponseDto(updatedOrg);
  }

  async delete(id: string, currentUser: User, ip: string, userAgent: string): Promise<void> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    // Get all members before deletion for audit purposes
    const members = await this.memberRepository.find({
      where: { organizationId: id },
    });
    const memberUserIds = members.map(m => m.userId);
    const memberCount = members.length;

    // 1. Delete all organization members (disassociate users from organization)
    await this.memberRepository.delete({ organizationId: id });
    this.logger.log(`Removed ${memberCount} members from organization ${organization.name}`);

    // 2. Delete all user roles scoped to this organization
    const deletedRolesResult = await this.userRoleRepository.delete({ scopeEntityId: id });
    this.logger.log(`Removed ${deletedRolesResult.affected || 0} organization-scoped roles for organization ${organization.name}`);

    // 3. Cancel all pending invitations for this organization
    const cancelledInvitationsResult = await this.invitationRepository.update(
      { organizationId: id, status: InvitationStatus.PENDING },
      { status: InvitationStatus.CANCELLED }
    );
    this.logger.log(`Cancelled ${cancelledInvitationsResult.affected || 0} pending invitations for organization ${organization.name}`);

    // 4. Soft delete the organization
    await this.organizationRepository.softDelete(id);

    this.logger.log(`Organization deleted: ${organization.name} (${id}) by user ${currentUser.id}`);

    const roles = this.getAllRoles(currentUser);
    await this.auditService.log({
      actorUserId: currentUser.id,
      actorRole: roles[0] || 'unknown',
      action: 'organization_deleted',
      entityType: 'Organization',
      entityId: id,
      changes: {
        name: organization.name,
        slug: organization.slug,
        deletedAt: new Date().toISOString(),
        disassociatedUsers: memberUserIds,
        disassociatedUserCount: memberCount,
        cancelledInvitations: cancelledInvitationsResult.affected || 0,
        removedRoles: deletedRolesResult.affected || 0,
      },
      ip,
      userAgent,
    });
  }

  async getLogoUploadUrl(organizationId: string, extension: string, currentUser: User): Promise<{ uploadURL: string; objectKey: string }> {
    this.validateOrgAccess(organizationId, currentUser);

    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }

    return this.objectStorageService.getOrganizationLogoUploadURL(organizationId, extension);
  }

  async updateLogoUrl(
    organizationId: string,
    logoUrl: string,
    currentUser: User,
    ip?: string,
    userAgent?: string,
  ): Promise<Organization> {
    this.validateOrgAccess(organizationId, currentUser);

    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }

    const previousLogoUrl = organization.logoUrl;
    organization.logoUrl = logoUrl;
    const savedOrganization = await this.organizationRepository.save(organization);

    const roles = this.getAllRoles(currentUser);
    await this.auditService.log({
      actorUserId: currentUser.id,
      actorRole: roles[0] || 'unknown',
      action: 'organization_logo_updated',
      entityType: 'Organization',
      entityId: organizationId,
      changes: {
        previousLogoUrl,
        newLogoUrl: logoUrl,
      },
      ip,
      userAgent,
    });

    this.logger.log(`Organization logo updated: ${organization.name} (${organizationId}) by user ${currentUser.id}`);
    return savedOrganization;
  }

  async getMembers(organizationId: string, currentUser: User): Promise<OrganizationMemberResponseDto[]> {
    this.validateOrgAccess(organizationId, currentUser);

    const members = await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .where('member.organizationId = :organizationId', { organizationId })
      .andWhere('user.deletedAt IS NULL')
      .andWhere('user.status != :archived', { archived: 'archived' })
      .getMany();

    return members.map(member => this.mapMemberToResponseDto(member));
  }

  async addMember(
    organizationId: string,
    addMemberDto: AddMemberDto,
    currentUser: User,
    ip: string,
    userAgent: string,
  ): Promise<OrganizationMemberResponseDto> {
    this.validateOrgAccess(organizationId, currentUser);

    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }

    const user = await this.userRepository.findOne({
      where: { id: addMemberDto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${addMemberDto.userId} not found`);
    }

    // Validate role type based on organization subscription tier
    const isTeamified = organization.subscriptionTier === 'internal';
    
    const internalRoles = [
      RoleType.SUPER_ADMIN,
      RoleType.INTERNAL_HR,
      RoleType.INTERNAL_FINANCE,
      RoleType.INTERNAL_ACCOUNT_MANAGER,
      RoleType.INTERNAL_RECRUITER,
      RoleType.INTERNAL_MARKETING,
    ];
    
    const clientRoles = [
      RoleType.CLIENT_ADMIN,
      RoleType.CLIENT_HR,
      RoleType.CLIENT_FINANCE,
      RoleType.CLIENT_RECRUITER,
      RoleType.CLIENT_EMPLOYEE,
    ];

    if (isTeamified) {
      // Teamified organization can only have internal roles
      if (!internalRoles.includes(addMemberDto.roleType)) {
        throw new BadRequestException(
          `Teamified organization members must have internal roles (super_admin, internal_*). Got: ${addMemberDto.roleType}`
        );
      }
    } else {
      // Client organizations can only have client roles
      if (!clientRoles.includes(addMemberDto.roleType)) {
        throw new BadRequestException(
          `Client organization members must have client roles (client_*). Got: ${addMemberDto.roleType}`
        );
      }
    }

    const existingMember = await this.memberRepository.findOne({
      where: {
        organizationId,
        userId: addMemberDto.userId,
      },
    });

    if (existingMember) {
      throw new ConflictException(`User is already a member of this organization`);
    }

    const member = this.memberRepository.create({
      organizationId,
      userId: addMemberDto.userId,
      status: addMemberDto.status || 'active',
      joinedAt: new Date(),
      invitedBy: currentUser.id,
    });

    const savedMember = await this.memberRepository.save(member);

    const userRole = this.userRoleRepository.create({
      userId: addMemberDto.userId,
      roleType: addMemberDto.roleType,
      scope: 'organization',
      scopeEntityId: organizationId,
    });

    await this.userRoleRepository.save(userRole);

    const memberWithUser = await this.memberRepository.findOne({
      where: { id: savedMember.id },
      relations: ['user', 'user.userRoles'],
    });

    this.logger.log(`Member added to organization ${organizationId}: user ${addMemberDto.userId} with role ${addMemberDto.roleType} by user ${currentUser.id}`);

    // If a work email is provided, add it as a linked email for this organization
    if (addMemberDto.workEmail) {
      try {
        await this.userEmailsService.addWorkEmailForOrganization(
          addMemberDto.userId,
          addMemberDto.workEmail,
          organizationId,
        );
        this.logger.log(`Work email ${addMemberDto.workEmail} linked to user ${addMemberDto.userId} for organization ${organizationId}`);
      } catch (error) {
        // Log the error but don't fail the member addition
        // The work email might already exist or be invalid
        this.logger.warn(`Failed to add work email ${addMemberDto.workEmail} for user ${addMemberDto.userId}: ${error.message}`);
      }
    }

    const roles = this.getAllRoles(currentUser);
    await this.auditService.log({
      actorUserId: currentUser.id,
      actorRole: roles[0] || 'unknown',
      action: 'organization_member_added',
      entityType: 'OrganizationMember',
      entityId: savedMember.id,
      changes: {
        organizationId,
        userId: addMemberDto.userId,
        userEmail: user.email,
        workEmail: addMemberDto.workEmail || null,
        roleType: addMemberDto.roleType,
        invitedBy: currentUser.id,
      },
      ip,
      userAgent,
    });

    return this.mapMemberToResponseDto(memberWithUser);
  }

  async updateMemberRole(
    organizationId: string,
    userId: string,
    updateRoleDto: UpdateMemberRoleDto,
    currentUser: User,
    ip: string,
    userAgent: string,
  ): Promise<OrganizationMemberResponseDto> {
    this.validateOrgAccess(organizationId, currentUser);

    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }

    const member = await this.memberRepository.findOne({
      where: {
        organizationId,
        userId,
      },
      relations: ['user', 'user.userRoles'],
    });

    if (!member) {
      throw new NotFoundException(`Member not found in organization`);
    }

    // Validate role type based on organization subscription tier
    const isTeamified = organization.subscriptionTier === 'internal';
    
    const internalRoles = [
      RoleType.SUPER_ADMIN,
      RoleType.INTERNAL_HR,
      RoleType.INTERNAL_FINANCE,
      RoleType.INTERNAL_ACCOUNT_MANAGER,
      RoleType.INTERNAL_RECRUITER,
      RoleType.INTERNAL_MARKETING,
    ];
    
    const clientRoles = [
      RoleType.CLIENT_ADMIN,
      RoleType.CLIENT_HR,
      RoleType.CLIENT_FINANCE,
      RoleType.CLIENT_RECRUITER,
      RoleType.CLIENT_EMPLOYEE,
    ];

    if (isTeamified) {
      // Teamified organization can only have internal roles
      if (!internalRoles.includes(updateRoleDto.roleType)) {
        throw new BadRequestException(
          `Teamified organization members must have internal roles (super_admin, internal_*). Got: ${updateRoleDto.roleType}`
        );
      }
    } else {
      // Client organizations can only have client roles
      if (!clientRoles.includes(updateRoleDto.roleType)) {
        throw new BadRequestException(
          `Client organization members must have client roles (client_*). Got: ${updateRoleDto.roleType}`
        );
      }
    }

    const userRole = await this.userRoleRepository.findOne({
      where: {
        userId,
        scope: 'organization',
        scopeEntityId: organizationId,
      },
    });

    const oldRoleType = userRole?.roleType;

    if (userRole) {
      userRole.roleType = updateRoleDto.roleType;
      await this.userRoleRepository.save(userRole);
    } else {
      const newUserRole = this.userRoleRepository.create({
        userId,
        roleType: updateRoleDto.roleType,
        scope: 'organization',
        scopeEntityId: organizationId,
      });
      await this.userRoleRepository.save(newUserRole);
    }

    const updatedMember = await this.memberRepository.findOne({
      where: { id: member.id },
      relations: ['user', 'user.userRoles'],
    });

    this.logger.log(`Member role updated in organization ${organizationId}: user ${userId} to role ${updateRoleDto.roleType} by user ${currentUser.id}`);

    const roles = this.getAllRoles(currentUser);
    await this.auditService.log({
      actorUserId: currentUser.id,
      actorRole: roles[0] || 'unknown',
      action: 'organization_member_role_updated',
      entityType: 'OrganizationMember',
      entityId: member.id,
      changes: {
        organizationId,
        userId,
        oldRoleType,
        newRoleType: updateRoleDto.roleType,
      },
      ip,
      userAgent,
    });

    return this.mapMemberToResponseDto(updatedMember);
  }

  async removeMember(organizationId: string, userId: string, currentUser: User, ip: string, userAgent: string): Promise<void> {
    this.validateOrgAccess(organizationId, currentUser);

    const member = await this.memberRepository.findOne({
      where: {
        organizationId,
        userId,
      },
    });

    if (!member) {
      throw new NotFoundException(`Member not found in organization`);
    }

    const userRole = await this.userRoleRepository.findOne({
      where: {
        userId,
        scope: 'organization',
        scopeEntityId: organizationId,
      },
    });

    if (userRole) {
      await this.userRoleRepository.remove(userRole);
    }

    await this.memberRepository.remove(member);

    this.logger.log(`Member removed from organization ${organizationId}: user ${userId} by user ${currentUser.id}`);

    const roles = this.getAllRoles(currentUser);
    await this.auditService.log({
      actorUserId: currentUser.id,
      actorRole: roles[0] || 'unknown',
      action: 'organization_member_removed',
      entityType: 'OrganizationMember',
      entityId: member.id,
      changes: {
        organizationId,
        userId,
        removedAt: new Date().toISOString(),
      },
      ip,
      userAgent,
    });
  }

  async convertCandidateToEmployee(
    organizationId: string,
    dto: ConvertCandidateDto,
    currentUser: User,
    ip?: string,
    userAgent?: string,
  ): Promise<ConvertCandidateResponseDto> {
    this.validateOrgAccess(organizationId, currentUser);
    
    const roles = this.getAllRoles(currentUser);

    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }

    const candidate = await this.userRepository.findOne({
      where: { email: dto.candidateEmail },
      relations: ['userRoles'],
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with email ${dto.candidateEmail} not found`);
    }

    const candidateRole = candidate.userRoles?.find(
      role => role.roleType === RoleType.CANDIDATE && role.scope === 'global'
    );

    if (!candidateRole) {
      throw new BadRequestException(`User ${dto.candidateEmail} does not have a candidate role`);
    }

    const hiredByUser = await this.userRepository.findOne({
      where: { id: dto.hiredBy },
    });

    if (!hiredByUser) {
      throw new NotFoundException(`User with ID ${dto.hiredBy} not found`);
    }

    const hiredByMember = await this.memberRepository.findOne({
      where: {
        organizationId,
        userId: dto.hiredBy,
        status: 'active',
      },
    });

    if (!hiredByMember) {
      throw new BadRequestException(`User ${dto.hiredBy} is not an active member of organization ${organizationId}`);
    }

    const existingMember = await this.memberRepository.findOne({
      where: {
        organizationId,
        userId: candidate.id,
      },
    });

    if (existingMember) {
      throw new ConflictException(`Candidate is already a member of this organization`);
    }

    const member = this.memberRepository.create({
      organizationId,
      userId: candidate.id,
      status: 'active',
      joinedAt: dto.startDate ? new Date(dto.startDate) : new Date(),
      invitedBy: dto.hiredBy,
    });

    const savedMember = await this.memberRepository.save(member);

    let userRole = await this.userRoleRepository.findOne({
      where: {
        userId: candidate.id,
        scope: 'organization',
        scopeEntityId: organizationId,
      },
    });

    if (userRole) {
      userRole.roleType = RoleType.CLIENT_EMPLOYEE;
      await this.userRoleRepository.save(userRole);
    } else {
      userRole = this.userRoleRepository.create({
        userId: candidate.id,
        roleType: RoleType.CLIENT_EMPLOYEE,
        scope: 'organization',
        scopeEntityId: organizationId,
      });
      await this.userRoleRepository.save(userRole);
    }

    try {
      await this.emailService.sendEmail({
        to: candidate.email,
        subject: `Welcome to ${organization.name} - You've Been Hired!`,
        html: this.generateEmployeeWelcomeEmail(candidate, organization, dto.startDate),
        text: this.generateEmployeeWelcomeEmailText(candidate, organization, dto.startDate),
      });
    } catch (error) {
      this.logger.warn(`Failed to send welcome email to ${candidate.email}: ${error.message}`);
    }

    this.logger.log(`Candidate converted to employee: ${candidate.email} for organization ${organizationId} by user ${currentUser.id}`);

    await this.auditService.log({
      actorUserId: currentUser.id,
      actorRole: roles[0] || 'unknown',
      action: 'candidate_converted',
      entityType: 'OrganizationMember',
      entityId: savedMember.id,
      changes: {
        candidateEmail: candidate.email,
        candidateId: candidate.id,
        organizationId,
        organizationName: organization.name,
        hiredBy: dto.hiredBy,
        startDate: dto.startDate,
      },
      ip,
      userAgent,
    });

    await this.auditService.log({
      actorUserId: currentUser.id,
      actorRole: roles[0] || 'unknown',
      action: 'organization_membership_created',
      entityType: 'OrganizationMember',
      entityId: savedMember.id,
      changes: {
        organizationId,
        userId: candidate.id,
        status: 'active',
        invitedBy: dto.hiredBy,
      },
      ip,
      userAgent,
    });

    await this.auditService.log({
      actorUserId: currentUser.id,
      actorRole: roles[0] || 'unknown',
      action: 'role_upgraded',
      entityType: 'UserRole',
      entityId: userRole.id,
      changes: {
        userId: candidate.id,
        oldRole: RoleType.CANDIDATE,
        newRole: RoleType.CLIENT_EMPLOYEE,
        scope: 'organization',
        scopeEntityId: organizationId,
      },
      ip,
      userAgent,
    });

    return {
      success: true,
      user: {
        id: candidate.id,
        email: candidate.email,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
      },
      organizationMembership: {
        organizationId,
        role: RoleType.CLIENT_EMPLOYEE,
        status: 'active',
      },
      message: `Candidate ${candidate.email} successfully converted to employee of ${organization.name}`,
    };
  }

  private generateEmployeeWelcomeEmail(
    user: User,
    organization: Organization,
    startDate?: string,
  ): string {
    const startDateText = startDate ? ` starting ${new Date(startDate).toLocaleDateString()}` : '';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${organization.name}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background-color: #f8f9fa; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .success-box { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Congratulations ${user.firstName}!</h1>
        </div>
        <div class="content">
            <h2>Welcome to ${organization.name}</h2>
            
            <div class="success-box">
                <strong>✅ Your Application Was Successful!</strong><br>
                You have been hired${startDateText}.
            </div>
            
            <p>We're excited to have you join our team! Your candidate profile has been converted to an employee account, and you now have access to all employee features in the Teamified portal.</p>
            
            <h3>🚀 What's Next:</h3>
            <ul>
                <li>📊 Access your employee dashboard</li>
                <li>👤 Complete your employee profile</li>
                <li>⏰ Submit timesheets</li>
                <li>🏖️ Request leave</li>
                <li>💰 View payslips and documents</li>
            </ul>
            
            <h3>🎯 Getting Started:</h3>
            <ol>
                <li>Log in to the portal with your existing credentials</li>
                <li>Review and update your profile information</li>
                <li>Familiarize yourself with the employee portal features</li>
                <li>Contact HR if you have any questions</li>
            </ol>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our HR team.</p>
            
            <p>Welcome aboard!</p>
        </div>
        <div class="footer">
            <p>Welcome to the ${organization.name} team!</p>
            <p>© ${new Date().getFullYear()} ${organization.name}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateEmployeeWelcomeEmailText(
    user: User,
    organization: Organization,
    startDate?: string,
  ): string {
    const startDateText = startDate ? ` starting ${new Date(startDate).toLocaleDateString()}` : '';

    return `
Congratulations ${user.firstName}!

Welcome to ${organization.name}

✅ YOUR APPLICATION WAS SUCCESSFUL!
You have been hired${startDateText}.

We're excited to have you join our team! Your candidate profile has been converted to an employee account, and you now have access to all employee features in the Teamified portal.

🚀 What's Next:
- Access your employee dashboard
- Complete your employee profile
- Submit timesheets
- Request leave
- View payslips and documents

🎯 Getting Started:
1. Log in to the portal with your existing credentials
2. Review and update your profile information
3. Familiarize yourself with the employee portal features
4. Contact HR if you have any questions

If you have any questions or need assistance, please contact our HR team.

Welcome aboard!

Welcome to the ${organization.name} team!
© ${new Date().getFullYear()} ${organization.name}. All rights reserved.
`;
  }

  private mapToResponseDto(organization: Organization): OrganizationResponseDto {
    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      industry: organization.industry,
      companySize: organization.companySize,
      logoUrl: organization.logoUrl,
      website: organization.website,
      settings: organization.settings,
      subscriptionTier: organization.subscriptionTier,
      subscriptionStatus: organization.subscriptionStatus,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  }

  private mapMemberToResponseDto(member: OrganizationMember): OrganizationMemberResponseDto {
    const userRole = member.user?.userRoles?.find(
      role => role.scope === 'organization' && role.scopeEntityId === member.organizationId
    );

    // Derive status: if user is inactive, they're NLWF; otherwise use member status
    let derivedStatus: 'active' | 'invited' | 'nlwf' = 'active';
    if (member.status === 'invited') {
      derivedStatus = 'invited';
    } else if (member.user?.status === 'inactive') {
      derivedStatus = 'nlwf';
    } else {
      derivedStatus = 'active';
    }

    return {
      id: member.id,
      organizationId: member.organizationId,
      userId: member.userId,
      userEmail: member.user?.email || '',
      userName: member.user ? `${member.user.firstName} ${member.user.lastName}` : '',
      profilePicture: member.user?.profileData?.profilePicture || null,
      roleType: (userRole?.roleType as RoleType) || RoleType.CLIENT_EMPLOYEE,
      status: derivedStatus,
      joinedAt: member.joinedAt,
      invitedBy: member.invitedBy,
      createdAt: member.createdAt,
    };
  }

  async globalSearch(query: string, currentUser: User): Promise<GlobalSearchResponseDto> {
    const accessPolicy = this.buildOrgAccessPolicy(currentUser);

    if (accessPolicy.noAccess) {
      return {
        organizations: [],
        users: [],
        totalOrganizations: 0,
        totalUsers: 0,
      };
    }

    const searchTerm = `%${query.toLowerCase()}%`;

    // Search organizations
    let orgQueryBuilder = this.organizationRepository
      .createQueryBuilder('org')
      .where('org.deletedAt IS NULL')
      .andWhere(
        '(LOWER(org.name) LIKE :search OR LOWER(org.slug) LIKE :search OR LOWER(org.industry) LIKE :search)',
        { search: searchTerm }
      );

    if (!accessPolicy.canViewAll) {
      orgQueryBuilder = orgQueryBuilder.andWhere('org.id IN (:...orgIds)', {
        orgIds: accessPolicy.allowedOrgIds.length > 0 ? accessPolicy.allowedOrgIds : [''],
      });
    }

    const organizations = await orgQueryBuilder.take(10).getMany();

    // Detect full name search (e.g., "Tony Stark")
    const queryParts = query.trim().split(/\s+/);
    const isFullNameSearch = queryParts.length >= 2;
    
    // Search users (client users and orphan users without roles)
    // Exclude internal users (super_admin, internal_*, candidate)
    let userQueryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('user.organizationMembers', 'membership')
      .leftJoinAndSelect('membership.organization', 'organization')
      .where('user.deletedAt IS NULL')
      .andWhere(
        // Include users with client roles OR users with no roles (orphans)
        // Exclude internal users
        `(
          userRoles.roleType LIKE :clientRole 
          OR NOT EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = user.id 
            AND (ur.role_type LIKE :internalRole OR ur.role_type = :superAdmin OR ur.role_type = :candidate)
          )
        )`,
        { 
          clientRole: 'client_%', 
          internalRole: 'internal_%',
          superAdmin: 'super_admin',
          candidate: 'candidate'
        }
      );
    
    // Build user search conditions
    if (isFullNameSearch) {
      // Full name search: match firstName + lastName combination
      const firstNameTerm = `%${queryParts[0].toLowerCase()}%`;
      const lastNameTerm = `%${queryParts.slice(1).join(' ').toLowerCase()}%`;
      
      userQueryBuilder = userQueryBuilder.andWhere(
        '(LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search OR LOWER(user.email) LIKE :search OR (LOWER(user.firstName) LIKE :firstName AND LOWER(user.lastName) LIKE :lastName))',
        { search: searchTerm, firstName: firstNameTerm, lastName: lastNameTerm }
      );
    } else {
      // Single term search: match any field individually
      userQueryBuilder = userQueryBuilder.andWhere(
        '(LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search OR LOWER(user.email) LIKE :search)',
        { search: searchTerm }
      );
    }

    if (!accessPolicy.canViewAll) {
      userQueryBuilder = userQueryBuilder.andWhere('membership.organizationId IN (:...orgIds)', {
        orgIds: accessPolicy.allowedOrgIds.length > 0 ? accessPolicy.allowedOrgIds : [''],
      });
    }

    const users = await userQueryBuilder.take(20).getMany();

    const userResults: UserSearchResult[] = users.map(user => {
      const clientRole = user.userRoles?.find(r => r.roleType.startsWith('client_'));
      const membership = user.organizationMembers?.[0];
      const hasNoRoles = !user.userRoles || user.userRoles.length === 0;
      
      return {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        roleType: clientRole?.roleType || (hasNoRoles ? 'unassigned' : 'client_employee'),
        organization: membership?.organization ? {
          id: membership.organization.id,
          name: membership.organization.name,
          slug: membership.organization.slug,
        } : null,
        profilePicture: user.profileData?.profilePicture || null,
      };
    });

    return {
      organizations: organizations.map(org => this.mapToResponseDto(org)),
      users: userResults,
      totalOrganizations: organizations.length,
      totalUsers: userResults.length,
    };
  }
}
