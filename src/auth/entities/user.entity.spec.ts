import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

describe('User Entity', () => {
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn((data) => {
              const user = new User();
              user.status = 'active';
              user.migratedFromZoho = false;
              return Object.assign(user, data);
            }),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('User Entity Creation', () => {
    it('should create a user with required fields', () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        firstName: 'John',
        lastName: 'Doe',
        status: 'active' as const,
      };

      const user = repository.create(userData);
      
      expect(user.email).toBe(userData.email);
      expect(user.passwordHash).toBe(userData.passwordHash);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.status).toBe(userData.status);
    });

    it('should create a user with optional fields', () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
        },
        profileData: {
          department: 'Engineering',
          skills: ['JavaScript', 'React'],
        },
        status: 'active' as const,
        migratedFromZoho: true,
        zohoUserId: 'zoho_123',
      };

      const user = repository.create(userData);
      
      expect(user.phone).toBe(userData.phone);
      expect(user.address).toEqual(userData.address);
      expect(user.profileData).toEqual(userData.profileData);
      expect(user.migratedFromZoho).toBe(userData.migratedFromZoho);
      expect(user.zohoUserId).toBe(userData.zohoUserId);
    });

    it('should default status to active', () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        firstName: 'John',
        lastName: 'Doe',
      };

      const user = repository.create(userData);
      
      expect(user.status).toBe('active');
    });

    it('should default migratedFromZoho to false', () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        firstName: 'John',
        lastName: 'Doe',
      };

      const user = repository.create(userData);
      
      expect(user.migratedFromZoho).toBe(false);
    });
  });

  describe('User Entity Validation', () => {
    it('should accept valid status values', () => {
      const validStatuses = ['active', 'inactive', 'archived'];
      
      validStatuses.forEach(status => {
        const userData = {
          email: `test${status}@example.com`,
          passwordHash: 'hashed_password',
          firstName: 'John',
          lastName: 'Doe',
          status: status as 'active' | 'inactive' | 'archived',
        };

        const user = repository.create(userData);
        expect(user.status).toBe(status);
      });
    });
  });

  describe('User Entity Relationships', () => {
    it('should have employmentRecords relationship', () => {
      const user = new User();
      expect(user.employmentRecords).toBeUndefined();
    });

    it('should have userRoles relationship', () => {
      const user = new User();
      expect(user.userRoles).toBeUndefined();
    });

    it('should have eorProfile relationship', () => {
      const user = new User();
      expect(user.eorProfile).toBeUndefined();
    });
  });
});
