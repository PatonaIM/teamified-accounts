import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

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
}