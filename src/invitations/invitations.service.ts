import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Invitation, InvitationStatus } from './entities/invitation.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationResponseDto } from './dto/invitation-response.dto';
import { AuditService } from '../audit/audit.service';
import { EmailService } from '../email/services/email.service';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    private auditService: AuditService,
    private emailService: EmailService,
  ) {}

  async create(
    createInvitationDto: CreateInvitationDto, 
    createdBy: string,
    actorRole: string,
    ip?: string,
    userAgent?: string,
    idempotencyKey?: string
  ): Promise<InvitationResponseDto> {
    // Check for existing pending invitation for same email and client
    const existingInvitation = await this.invitationRepository.findOne({
      where: {
        email: createInvitationDto.email,
        clientId: createInvitationDto.clientId,
        status: InvitationStatus.PENDING,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (existingInvitation) {
      throw new ConflictException(
        'An active invitation already exists for this email and client'
      );
    }

    // Generate secure token and calculate expiry (7 days from now)
    const token = this.generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = this.invitationRepository.create({
      ...createInvitationDto,
      token,
      expiresAt,
      createdBy,
      status: InvitationStatus.PENDING,
    });

    const savedInvitation = await this.invitationRepository.save(invitation);

    // Send invitation email
    try {
      const emailSent = await this.emailService.sendInvitationEmail(savedInvitation);
      if (!emailSent) {
        this.logger.warn(`Failed to send invitation email to ${savedInvitation.email} for invitation ${savedInvitation.id}`);
      }
    } catch (error) {
      this.logger.error(`Error sending invitation email: ${error.message}`, error.stack);
      // Don't throw error - invitation is created, email failure shouldn't block the process
    }

    // Create audit log entry
    await this.auditService.logInviteCreated(
      createdBy,
      actorRole,
      savedInvitation.id,
      {
        email: createInvitationDto.email,
        firstName: createInvitationDto.firstName,
        lastName: createInvitationDto.lastName,
        country: createInvitationDto.country,
        role: createInvitationDto.role,
        clientId: createInvitationDto.clientId,
        expiresAt: expiresAt.toISOString(),
      },
      ip,
      userAgent,
    );

    return this.toResponseDto(savedInvitation);
  }

  async resend(
    id: string,
    actorUserId: string,
    actorRole: string,
    ip?: string,
    userAgent?: string,
  ): Promise<InvitationResponseDto> {
    const invitation = await this.invitationRepository.findOne({ 
      where: { id } 
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Can only resend pending invitations');
    }

    // Generate new token and extend expiry by 7 days
    const oldToken = invitation.token;
    const newToken = this.generateSecureToken();
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    invitation.token = newToken;
    invitation.expiresAt = newExpiresAt;

    const updatedInvitation = await this.invitationRepository.save(invitation);

    // Send new invitation email
    try {
      const emailSent = await this.emailService.sendInvitationEmail(updatedInvitation);
      if (!emailSent) {
        this.logger.warn(`Failed to send resent invitation email to ${updatedInvitation.email} for invitation ${updatedInvitation.id}`);
      }
    } catch (error) {
      this.logger.error(`Error sending resent invitation email: ${error.message}`, error.stack);
      // Don't throw error - invitation is updated, email failure shouldn't block the process
    }

    // Create audit log entry for resend
    await this.auditService.logInviteResent(
      actorUserId,
      actorRole,
      invitation.id,
      {
        oldToken,
        newToken,
        newExpiresAt: newExpiresAt.toISOString(),
      },
      ip,
      userAgent,
    );

    return this.toResponseDto(updatedInvitation);
  }

  async findAll(): Promise<InvitationResponseDto[]> {
    const invitations = await this.invitationRepository.find({
      where: {
        deletedAt: null, // Exclude soft-deleted invitations
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return invitations.map(inv => this.toResponseDto(inv));
  }

  async findOne(id: string): Promise<InvitationResponseDto> {
    const invitation = await this.invitationRepository.findOne({ 
      where: { id, deletedAt: null } 
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return this.toResponseDto(invitation);
  }

  async remove(id: string): Promise<void> {
    const invitation = await this.invitationRepository.findOne({ 
      where: { id, deletedAt: null } 
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status === InvitationStatus.ACCEPTED) {
      throw new BadRequestException('Cannot delete accepted invitations');
    }

    invitation.deletedAt = new Date();
    await this.invitationRepository.save(invitation);
  }

  // Clean up expired invitations (soft delete after 30 days)
  async cleanupExpiredInvitations(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.invitationRepository
      .createQueryBuilder()
      .update(Invitation)
      .set({ deletedAt: new Date() })
      .where('expires_at < :date', { date: thirtyDaysAgo })
      .andWhere('status = :status', { status: InvitationStatus.PENDING })
      .andWhere('deleted_at IS NULL')
      .execute();

    return result.affected || 0;
  }

  private generateSecureToken(): string {
    // Generate a secure random token
    return uuidv4() + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2);
  }

  private toResponseDto(invitation: Invitation): InvitationResponseDto {
    return {
      id: invitation.id,
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      email: invitation.email,
      country: invitation.country,
      role: invitation.role,
      clientId: invitation.clientId,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      createdBy: invitation.createdBy,
    };
  }
}