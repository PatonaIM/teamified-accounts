import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { QueryAuditLogsDto, AuditLogResponseDto, AuditLogDto } from './dto/audit-log.dto';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

export interface AuditLogEntry {
  actorUserId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly SENSITIVE_KEYS = [
    'password',
    'passwordHash',
    'password_hash',
    'salary',
    'salaryAmount',
    'salary_amount',
    'bankAccount',
    'bank_account',
    'accountNumber',
    'account_number',
    'taxId',
    'tax_id',
    'ssn',
    'socialSecurityNumber',
    'social_security_number',
    'routingNumber',
    'routing_number',
    'iban',
    'swift',
    'bic',
    'apiKey',
    'api_key',
    'secret',
    'token',
    'refreshToken',
    'refresh_token',
    'accessToken',
    'access_token',
  ];

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(entry: AuditLogEntry): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(entry);
    return this.auditLogRepository.save(auditLog);
  }

  async logInviteCreated(
    actorUserId: string,
    actorRole: string,
    invitationId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'invite_created',
      entityType: 'Invitation',
      entityId: invitationId,
      changes,
      ip,
      userAgent,
    });
  }

  async logInviteResent(
    actorUserId: string,
    actorRole: string,
    invitationId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'invite_resent',
      entityType: 'Invitation',
      entityId: invitationId,
      changes,
      ip,
      userAgent,
    });
  }

  async logProfileCreated(
    actorUserId: string,
    actorRole: string,
    profileId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'profile_created',
      entityType: 'EORProfile',
      entityId: profileId,
      changes,
      ip,
      userAgent,
    });
  }

  async logProfileUpdated(
    actorUserId: string,
    actorRole: string,
    profileId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'profile_updated',
      entityType: 'EORProfile',
      entityId: profileId,
      changes,
      ip,
      userAgent,
    });
  }

  async logProfileCompleted(
    actorUserId: string,
    actorRole: string,
    profileId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'profile_completed',
      entityType: 'EORProfile',
      entityId: profileId,
      changes,
      ip,
      userAgent,
    });
  }

  async logEmploymentRecordCreated(
    actorUserId: string,
    actorRole: string,
    employmentRecordId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'employment_record_created',
      entityType: 'EmploymentRecord',
      entityId: employmentRecordId,
      changes,
      ip,
      userAgent,
    });
  }

  async logEmploymentRecordUpdated(
    actorUserId: string,
    actorRole: string,
    employmentRecordId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'employment_record_updated',
      entityType: 'EmploymentRecord',
      entityId: employmentRecordId,
      changes,
      ip,
      userAgent,
    });
  }

  async logEmploymentRecordTerminated(
    actorUserId: string,
    actorRole: string,
    employmentRecordId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'employment_record_terminated',
      entityType: 'EmploymentRecord',
      entityId: employmentRecordId,
      changes,
      ip,
      userAgent,
    });
  }

  async logEmploymentRecordDeleted(
    actorUserId: string,
    actorRole: string,
    employmentRecordId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'employment_record_deleted',
      entityType: 'EmploymentRecord',
      entityId: employmentRecordId,
      changes,
      ip,
      userAgent,
    });
  }

  async logOAuthClientCreated(
    actorUserId: string,
    actorRole: string,
    clientId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'oauth_client_created',
      entityType: 'OAuthClient',
      entityId: clientId,
      changes,
      ip,
      userAgent,
    });
  }

  async logOAuthClientUpdated(
    actorUserId: string,
    actorRole: string,
    clientId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'oauth_client_updated',
      entityType: 'OAuthClient',
      entityId: clientId,
      changes,
      ip,
      userAgent,
    });
  }

  async logOAuthClientSecretRegenerated(
    actorUserId: string,
    actorRole: string,
    clientId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'oauth_client_secret_regenerated',
      entityType: 'OAuthClient',
      entityId: clientId,
      changes,
      ip,
      userAgent,
    });
  }

  async logOAuthClientToggled(
    actorUserId: string,
    actorRole: string,
    clientId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'oauth_client_toggled',
      entityType: 'OAuthClient',
      entityId: clientId,
      changes,
      ip,
      userAgent,
    });
  }

  async logOAuthClientDeleted(
    actorUserId: string,
    actorRole: string,
    clientId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'oauth_client_deleted',
      entityType: 'OAuthClient',
      entityId: clientId,
      changes,
      ip,
      userAgent,
    });
  }

  async logUserCreated(
    actorUserId: string,
    actorRole: string,
    userId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'user_created',
      entityType: 'User',
      entityId: userId,
      changes,
      ip,
      userAgent,
    });
  }

  async logUserEmailVerified(
    actorUserId: string,
    actorRole: string,
    userId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'user_email_verified',
      entityType: 'User',
      entityId: userId,
      changes,
      ip,
      userAgent,
    });
  }

  async logInvitationAccepted(
    actorUserId: string,
    actorRole: string,
    invitationId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'invitation_accepted',
      entityType: 'Invitation',
      entityId: invitationId,
      changes,
      ip,
      userAgent,
    });
  }

  async logUserDeleted(
    actorUserId: string,
    actorRole: string,
    userId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'user_deleted',
      entityType: 'User',
      entityId: userId,
      changes,
      ip,
      userAgent,
    });
  }

  async logUserReactivated(
    actorUserId: string,
    actorRole: string,
    userId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'user_reactivated',
      entityType: 'User',
      entityId: userId,
      changes,
      ip,
      userAgent,
    });
  }

  async logUserProfilePictureUpdated(
    actorUserId: string,
    actorRole: string,
    userId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'user_profile_picture_updated',
      entityType: 'User',
      entityId: userId,
      changes,
      ip,
      userAgent,
    });
  }

  async logUserProfileUpdated(
    actorUserId: string,
    actorRole: string,
    userId: string,
    changes: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      actorRole,
      action: 'user_profile_updated',
      entityType: 'User',
      entityId: userId,
      changes,
      ip,
      userAgent,
    });
  }

  async findWithFilters(
    queryDto: QueryAuditLogsDto,
    user: CurrentUserData,
  ): Promise<AuditLogResponseDto> {
    const limit = queryDto.limit || 10;
    const scope = queryDto.scope || 'self';

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.actorUser', 'actorUser')
      .select([
        'audit.id',
        'audit.at',
        'audit.actorUserId',
        'audit.actorRole',
        'audit.action',
        'audit.entityType',
        'audit.entityId',
        'audit.changes',
        'audit.ip',
        'audit.userAgent',
        'actorUser.id',
        'actorUser.email',
        'actorUser.firstName',
        'actorUser.lastName',
      ])
      .orderBy('audit.at', 'DESC')
      .addOrderBy('audit.id', 'DESC');

    if (scope === 'self') {
      queryBuilder.andWhere('audit.actorUserId = :userId', { userId: user.id });
    } else if (scope === 'team' || scope === 'all') {
      if (user['clientId']) {
        queryBuilder
          .leftJoin('actorUser.client', 'client')
          .andWhere('client.id = :clientId', { clientId: user['clientId'] });
      } else {
        queryBuilder.andWhere('audit.actorUserId = :userId', { userId: user.id });
      }
    }

    if (queryDto.action) {
      queryBuilder.andWhere('audit.action = :action', { action: queryDto.action });
    }

    if (queryDto.entityType) {
      queryBuilder.andWhere('audit.entityType = :entityType', { entityType: queryDto.entityType });
    }

    if (queryDto.cursor) {
      try {
        const cursorData = JSON.parse(Buffer.from(queryDto.cursor, 'base64').toString());
        const cursorAt = new Date(cursorData.at);
        const cursorId = cursorData.id;
        
        queryBuilder.andWhere(
          '(audit.at < :cursorAt OR (audit.at = :cursorAt AND audit.id < :cursorId))',
          { cursorAt, cursorId }
        );
      } catch (error) {
        queryBuilder.andWhere('audit.at < :cursor', { cursor: new Date(queryDto.cursor) });
      }
    }

    queryBuilder.take(limit + 1);

    const results = await queryBuilder.getMany();

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    const sanitizedData: AuditLogDto[] = data.map((log) => ({
      id: log.id,
      at: log.at,
      actorUserId: log.actorUserId,
      actorUser: log.actorUser
        ? {
            id: log.actorUser.id,
            email: log.actorUser.email,
            firstName: log.actorUser.firstName,
            lastName: log.actorUser.lastName,
          }
        : null,
      actorRole: log.actorRole,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      changes: log.changes ? this.sanitizeObject(log.changes) : null,
      ip: log.ip,
      userAgent: log.userAgent,
    }));

    let nextCursor: string | null = null;
    if (hasMore && data.length > 0) {
      const lastRecord = data[data.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({
          at: lastRecord.at.toISOString(),
          id: lastRecord.id,
        })
      ).toString('base64');
    }

    return {
      data: sanitizedData,
      nextCursor,
      hasMore,
    };
  }

  async getUserAuditHistory(
    userId: string,
    limit: number = 50,
    cursor?: string,
  ): Promise<AuditLogResponseDto> {
    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.actorUser', 'actorUser')
      .select([
        'audit.id',
        'audit.at',
        'audit.actorUserId',
        'audit.actorRole',
        'audit.action',
        'audit.entityType',
        'audit.entityId',
        'audit.changes',
        'audit.ip',
        'audit.userAgent',
        'actorUser.id',
        'actorUser.email',
        'actorUser.firstName',
        'actorUser.lastName',
      ])
      .where('audit.entityId = :userId', { userId })
      .andWhere('audit.entityType = :entityType', { entityType: 'User' })
      .orderBy('audit.at', 'DESC')
      .addOrderBy('audit.id', 'DESC');

    if (cursor) {
      try {
        const cursorData = JSON.parse(Buffer.from(cursor, 'base64').toString());
        const cursorAt = new Date(cursorData.at);
        const cursorId = cursorData.id;
        
        queryBuilder.andWhere(
          '(audit.at < :cursorAt OR (audit.at = :cursorAt AND audit.id < :cursorId))',
          { cursorAt, cursorId }
        );
      } catch (error) {
        queryBuilder.andWhere('audit.at < :cursor', { cursor: new Date(cursor) });
      }
    }

    queryBuilder.take(limit + 1);

    const results = await queryBuilder.getMany();

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    const sanitizedData: AuditLogDto[] = data.map((log) => ({
      id: log.id,
      at: log.at,
      actorUserId: log.actorUserId,
      actorUser: log.actorUser
        ? {
            id: log.actorUser.id,
            email: log.actorUser.email,
            firstName: log.actorUser.firstName,
            lastName: log.actorUser.lastName,
          }
        : null,
      actorRole: log.actorRole,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      changes: log.changes ? this.sanitizeObject(log.changes) : null,
      ip: log.ip,
      userAgent: log.userAgent,
    }));

    let nextCursor: string | null = null;
    if (hasMore && data.length > 0) {
      const lastRecord = data[data.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({
          at: lastRecord.at.toISOString(),
          id: lastRecord.id,
        })
      ).toString('base64');
    }

    return {
      data: sanitizedData,
      nextCursor,
      hasMore,
    };
  }

  private sanitizeObject(obj: any, depth = 0): any {
    if (depth > 10) {
      return '[Max depth]';
    }
    
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, depth + 1));
    }

    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (this.SENSITIVE_KEYS.some(sk => lowerKey.includes(sk.toLowerCase()))) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = this.sanitizeObject(value, depth + 1);
      }
    }
    return result;
  }
}