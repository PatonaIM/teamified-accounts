import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './user-role.entity';

describe('UserRole Entity', () => {
  let repository: Repository<UserRole>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(UserRole),
          useValue: {
            create: jest.fn((data) => Object.assign(new UserRole(), data)),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<Repository<UserRole>>(getRepositoryToken(UserRole));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('UserRole Entity Creation', () => {
    it('should create a user role with required fields', () => {
      const roleData = {
        userId: 'user-uuid-123',
        roleType: 'eor' as const,
        scope: 'client' as const,
      };

      const role = repository.create(roleData);
      
      expect(role.userId).toBe(roleData.userId);
      expect(role.roleType).toBe(roleData.roleType);
      expect(role.scope).toBe(roleData.scope);
    });

    it('should create a user role with optional fields', () => {
      const roleData = {
        userId: 'user-uuid-123',
        roleType: 'admin' as const,
        scope: 'all' as const,
        scopeEntityId: 'client-uuid-456',
        grantedBy: 'admin-uuid-789',
        expiresAt: new Date('2025-12-31'),
      };

      const role = repository.create(roleData);
      
      expect(role.scopeEntityId).toBe(roleData.scopeEntityId);
      expect(role.grantedBy).toBe(roleData.grantedBy);
      expect(role.expiresAt).toBe(roleData.expiresAt);
    });

    it('should allow null scopeEntityId for all scope', () => {
      const roleData = {
        userId: 'user-uuid-123',
        roleType: 'admin' as const,
        scope: 'all' as const,
        scopeEntityId: null,
      };

      const role = repository.create(roleData);
      expect(role.scopeEntityId).toBeNull();
    });

    it('should allow null grantedBy', () => {
      const roleData = {
        userId: 'user-uuid-123',
        roleType: 'eor' as const,
        scope: 'client' as const,
        grantedBy: null,
      };

      const role = repository.create(roleData);
      expect(role.grantedBy).toBeNull();
    });

    it('should allow null expiresAt for permanent roles', () => {
      const roleData = {
        userId: 'user-uuid-123',
        roleType: 'eor' as const,
        scope: 'client' as const,
        expiresAt: null,
      };

      const role = repository.create(roleData);
      expect(role.expiresAt).toBeNull();
    });
  });

  describe('UserRole Entity Validation', () => {
    it('should accept valid role types', () => {
      const validRoleTypes = [
        'candidate',
        'eor',
        'admin',
        'hr',
        'account_manager',
        'recruiter',
        'hr_manager_client',
      ];
      
      validRoleTypes.forEach(roleType => {
        const roleData = {
          userId: `user-uuid-${roleType}`,
          roleType: roleType as 'candidate' | 'eor' | 'admin' | 'hr' | 'account_manager' | 'recruiter' | 'hr_manager_client',
          scope: 'user' as const,
        };

        const role = repository.create(roleData);
        expect(role.roleType).toBe(roleType);
      });
    });

    it('should accept valid scope values', () => {
      const validScopes = ['user', 'group', 'client', 'all'];
      
      validScopes.forEach(scope => {
        const roleData = {
          userId: `user-uuid-${scope}`,
          roleType: 'eor' as const,
          scope: scope as 'user' | 'group' | 'client' | 'all',
        };

        const role = repository.create(roleData);
        expect(role.scope).toBe(scope);
      });
    });
  });

  describe('UserRole Entity Relationships', () => {
    it('should have user relationship', () => {
      const role = new UserRole();
      expect(role.user).toBeUndefined();
    });

    it('should have grantedByUser relationship', () => {
      const role = new UserRole();
      expect(role.grantedByUser).toBeUndefined();
    });
  });

  describe('UserRole Entity Business Logic', () => {
    it('should support client-scoped EOR role', () => {
      const roleData = {
        userId: 'user-uuid-123',
        roleType: 'eor' as const,
        scope: 'client' as const,
        scopeEntityId: 'client-uuid-456',
      };

      const role = repository.create(roleData);
      expect(role.roleType).toBe('eor');
      expect(role.scope).toBe('client');
      expect(role.scopeEntityId).toBe('client-uuid-456');
    });

    it('should support global admin role', () => {
      const roleData = {
        userId: 'user-uuid-123',
        roleType: 'admin' as const,
        scope: 'all' as const,
        scopeEntityId: null,
      };

      const role = repository.create(roleData);
      expect(role.roleType).toBe('admin');
      expect(role.scope).toBe('all');
      expect(role.scopeEntityId).toBeNull();
    });

    it('should support temporary timesheet approver role', () => {
      const roleData = {
        userId: 'user-uuid-123',
        roleType: 'hr' as const,
        scope: 'group' as const,
        scopeEntityId: 'group-uuid-789',
        expiresAt: new Date('2024-12-31'),
      };

      const role = repository.create(roleData);
      expect(role.roleType).toBe('hr');
      expect(role.scope).toBe('group');
      expect(role.scopeEntityId).toBe('group-uuid-789');
      expect(role.expiresAt).toBeDefined();
    });
  });
});
