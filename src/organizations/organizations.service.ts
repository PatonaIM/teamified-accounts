import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationMember } from './entities/organization-member.entity';
import { User } from '../auth/entities/user.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
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
    private readonly auditService: AuditService,
    private readonly emailService: EmailService,
    private readonly objectStorageService: ObjectStorageService,
  ) {}

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

  async create(
    createDto: CreateOrganizationDto,
    currentUser: User,
    ip: string,
    userAgent: string,
  ): Promise<OrganizationResponseDto> {
    const existingOrg = await this.organizationRepository.findOne({
      where: { slug: createDto.slug },
    });

    if (existingOrg) {
      throw new ConflictException(`Organization with slug '${createDto.slug}' already exists`);
    }

    const organization = this.organizationRepository.create({
      ...createDto,
      subscriptionTier: createDto.subscriptionTier || 'free',
      subscriptionStatus: 'active',
      settings: {},
    });

    const savedOrg = await this.organizationRepository.save(organization);

    this.logger.log(`Organization created: ${savedOrg.name} (${savedOrg.id}) by user ${currentUser.id}`);

    const roles = this.getAllRoles(currentUser);
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
      .leftJoin('org.members', 'members')
      .addSelect('COUNT(members.id)', 'membercount')
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
    
    // Apply pagination and sort by member count descending
    queryBuilder.orderBy('membercount', 'DESC').skip(skip).take(limit);
    
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
      .leftJoin('org.members', 'members')
      .where('org.id = :id', { id })
      .andWhere('org.deletedAt IS NULL')
      .addSelect('COUNT(members.id)', 'membercount')
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
    const policy = this.buildOrgAccessPolicy(currentUser);
    
    if (policy.noAccess || policy.allowedOrgIds.length === 0) {
      throw new NotFoundException('You do not belong to any organization');
    }
    
    const organizationId = policy.allowedOrgIds[0];
    
    return this.findOne(organizationId, currentUser);
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

    if (updateDto.slug && updateDto.slug !== organization.slug) {
      const existingOrg = await this.organizationRepository.findOne({
        where: { slug: updateDto.slug },
      });

      if (existingOrg) {
        throw new ConflictException(`Organization with slug '${updateDto.slug}' already exists`);
      }
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

  async getMembers(organizationId: string, currentUser: User): Promise<OrganizationMemberResponseDto[]> {
    this.validateOrgAccess(organizationId, currentUser);

    const members = await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .where('member.organizationId = :organizationId', { organizationId })
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

    const clientRoles = [
      RoleType.CLIENT_ADMIN,
      RoleType.CLIENT_HR,
      RoleType.CLIENT_FINANCE,
      RoleType.CLIENT_RECRUITER,
      RoleType.CLIENT_EMPLOYEE,
    ];

    if (!clientRoles.includes(addMemberDto.roleType)) {
      throw new BadRequestException(`Role type must be a client role (client_*). Got: ${addMemberDto.roleType}`);
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

    const clientRoles = [
      RoleType.CLIENT_ADMIN,
      RoleType.CLIENT_HR,
      RoleType.CLIENT_FINANCE,
      RoleType.CLIENT_RECRUITER,
      RoleType.CLIENT_EMPLOYEE,
    ];

    if (!clientRoles.includes(updateRoleDto.roleType)) {
      throw new BadRequestException(`Role type must be a client role (client_*). Got: ${updateRoleDto.roleType}`);
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
        html: this.generateEmployeeWelcomeEmail(candidate, organization, dto.jobTitle, dto.startDate),
        text: this.generateEmployeeWelcomeEmailText(candidate, organization, dto.jobTitle, dto.startDate),
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
        jobTitle: dto.jobTitle,
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
    jobTitle?: string,
    startDate?: string,
  ): string {
    const jobTitleText = jobTitle ? ` as ${jobTitle}` : '';
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
                You have been hired${jobTitleText}${startDateText}.
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
    jobTitle?: string,
    startDate?: string,
  ): string {
    const jobTitleText = jobTitle ? ` as ${jobTitle}` : '';
    const startDateText = startDate ? ` starting ${new Date(startDate).toLocaleDateString()}` : '';

    return `
Congratulations ${user.firstName}!

Welcome to ${organization.name}

✅ YOUR APPLICATION WAS SUCCESSFUL!
You have been hired${jobTitleText}${startDateText}.

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

    return {
      id: member.id,
      organizationId: member.organizationId,
      userId: member.userId,
      userEmail: member.user?.email || '',
      userName: member.user ? `${member.user.firstName} ${member.user.lastName}` : '',
      profilePicture: member.user?.profileData?.profilePicture || null,
      roleType: (userRole?.roleType as RoleType) || RoleType.CLIENT_EMPLOYEE,
      status: member.status,
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
    
    // Search users (only client users)
    let userQueryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('user.organizationMembers', 'membership')
      .leftJoinAndSelect('membership.organization', 'organization')
      .where('user.deletedAt IS NULL')
      .andWhere('userRoles.roleType LIKE :clientRole', { clientRole: 'client_%' });
    
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
      
      return {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        roleType: clientRole?.roleType || 'client_employee',
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
