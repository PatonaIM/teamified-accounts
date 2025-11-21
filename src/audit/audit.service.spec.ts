import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit-log.entity';

describe('AuditService', () => {
  let service: AuditService;
  let repository: jest.Mocked<Repository<AuditLog>>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    repository = module.get(getRepositoryToken(AuditLog));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should create and save audit log entry', async () => {
      const logEntry = {
        actorUserId: 'user-id',
        actorRole: 'Admin',
        action: 'test_action',
        entityType: 'TestEntity',
        entityId: 'entity-id',
        changes: { field: 'value' },
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };

      const mockAuditLog = { id: 'audit-id', ...logEntry };

      repository.create.mockReturnValue(mockAuditLog as any);
      repository.save.mockResolvedValue(mockAuditLog as any);

      const result = await service.log(logEntry);

      expect(result).toEqual(mockAuditLog);
      expect(repository.create).toHaveBeenCalledWith(logEntry);
      expect(repository.save).toHaveBeenCalledWith(mockAuditLog);
    });
  });

  describe('logInviteCreated', () => {
    it('should log invitation creation', async () => {
      const mockAuditLog = {
        id: 'audit-id',
        actorUserId: 'admin-id',
        actorRole: 'Admin',
        action: 'invite_created',
        entityType: 'Invitation',
        entityId: 'invitation-id',
      };

      repository.create.mockReturnValue(mockAuditLog as any);
      repository.save.mockResolvedValue(mockAuditLog as any);

      const result = await service.logInviteCreated(
        'admin-id',
        'Admin',
        'invitation-id',
        { email: 'test@example.com' },
        '127.0.0.1',
        'Mozilla/5.0',
      );

      expect(result).toEqual(mockAuditLog);
      expect(repository.create).toHaveBeenCalledWith({
        actorUserId: 'admin-id',
        actorRole: 'Admin',
        action: 'invite_created',
        entityType: 'Invitation',
        entityId: 'invitation-id',
        changes: { email: 'test@example.com' },
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });
    });
  });

  describe('logInviteResent', () => {
    it('should log invitation resend', async () => {
      const mockAuditLog = {
        id: 'audit-id',
        actorUserId: 'admin-id',
        actorRole: 'Admin',
        action: 'invite_resent',
        entityType: 'Invitation',
        entityId: 'invitation-id',
      };

      repository.create.mockReturnValue(mockAuditLog as any);
      repository.save.mockResolvedValue(mockAuditLog as any);

      const result = await service.logInviteResent(
        'admin-id',
        'Admin',
        'invitation-id',
        { oldToken: 'old', newToken: 'new' },
        '127.0.0.1',
        'Mozilla/5.0',
      );

      expect(result).toEqual(mockAuditLog);
      expect(repository.create).toHaveBeenCalledWith({
        actorUserId: 'admin-id',
        actorRole: 'Admin',
        action: 'invite_resent',
        entityType: 'Invitation',
        entityId: 'invitation-id',
        changes: { oldToken: 'old', newToken: 'new' },
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });
    });
  });
});