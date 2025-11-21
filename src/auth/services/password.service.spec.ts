import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  describe('hashPassword', () => {
    it('should hash password using Argon2id', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await service.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.startsWith('$argon2id$')).toBe(true);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await service.hashPassword(password);
      const hash2 = await service.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await service.hashPassword(password);

      const isValid = await service.verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await service.hashPassword(password);

      const isValid = await service.verifyPassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should handle invalid hash format', async () => {
      const password = 'TestPassword123!';
      const invalidHash = 'invalid-hash';

      const isValid = await service.verifyPassword(password, invalidHash);
      expect(isValid).toBe(false);
    });
  });

  describe('validatePasswordPolicy', () => {
    it('should validate strong password', () => {
      const password = 'StrongPass123!';
      const result = service.validatePasswordPolicy(password);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password too short', () => {
      const password = 'Short1!';
      const result = service.validatePasswordPolicy(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without lowercase', () => {
      const password = 'PASSWORD123!';
      const result = service.validatePasswordPolicy(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without uppercase', () => {
      const password = 'password123!';
      const result = service.validatePasswordPolicy(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without number', () => {
      const password = 'PasswordTest!';
      const result = service.validatePasswordPolicy(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
      const password = 'Password123';
      const result = service.validatePasswordPolicy(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character (@$!%*?&)');
    });

    it('should return multiple errors for weak password', () => {
      const password = 'weak';
      const result = service.validatePasswordPolicy(password);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});