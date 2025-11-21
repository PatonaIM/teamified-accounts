import { Test, TestingModule } from '@nestjs/testing';
import { CountryValidationService } from './country-validation.service';

describe('CountryValidationService', () => {
  let service: CountryValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CountryValidationService],
    }).compile();

    service = module.get<CountryValidationService>(CountryValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validatePhoneNumber', () => {
    it('should validate Indian phone numbers correctly', () => {
      expect(service.validatePhoneNumber('+919876543210', 'IN')).toBe(true);
      expect(service.validatePhoneNumber('+918765432109', 'IN')).toBe(true);
      expect(service.validatePhoneNumber('+917654321098', 'IN')).toBe(true);
      expect(service.validatePhoneNumber('+916543210987', 'IN')).toBe(true);
    });

    it('should reject invalid Indian phone numbers', () => {
      expect(service.validatePhoneNumber('+915876543210', 'IN')).toBe(false); // Invalid starting digit
      expect(service.validatePhoneNumber('9876543210', 'IN')).toBe(false); // Missing country code
      expect(service.validatePhoneNumber('+9198765432100', 'IN')).toBe(false); // Too long
      expect(service.validatePhoneNumber('+91987654321', 'IN')).toBe(false); // Too short
    });

    it('should validate Sri Lankan phone numbers correctly', () => {
      expect(service.validatePhoneNumber('+94123456789', 'LK')).toBe(true);
      expect(service.validatePhoneNumber('+94987654321', 'LK')).toBe(true);
    });

    it('should validate Philippine phone numbers correctly', () => {
      expect(service.validatePhoneNumber('+63123456789', 'PH')).toBe(true);
      expect(service.validatePhoneNumber('+63987654321', 'PH')).toBe(true);
    });

    it('should return true for empty phone numbers (optional field)', () => {
      expect(service.validatePhoneNumber('', 'IN')).toBe(true);
      expect(service.validatePhoneNumber(null as any, 'IN')).toBe(true);
    });

    it('should return true for unsupported countries', () => {
      expect(service.validatePhoneNumber('+11234567890', 'US')).toBe(true);
    });
  });

  describe('validatePostalCode', () => {
    it('should validate Indian postal codes correctly', () => {
      expect(service.validatePostalCode('400001', 'IN')).toBe(true);
      expect(service.validatePostalCode('110001', 'IN')).toBe(true);
      expect(service.validatePostalCode('560001', 'IN')).toBe(true);
    });

    it('should reject invalid Indian postal codes', () => {
      expect(service.validatePostalCode('40001', 'IN')).toBe(false); // Too short
      expect(service.validatePostalCode('4000011', 'IN')).toBe(false); // Too long
      expect(service.validatePostalCode('ABC123', 'IN')).toBe(false); // Non-numeric
    });

    it('should validate Sri Lankan postal codes correctly', () => {
      expect(service.validatePostalCode('10001', 'LK')).toBe(true);
      expect(service.validatePostalCode('80000', 'LK')).toBe(true);
    });

    it('should validate Philippine postal codes correctly', () => {
      expect(service.validatePostalCode('1001', 'PH')).toBe(true);
      expect(service.validatePostalCode('9999', 'PH')).toBe(true);
    });

    it('should return true for empty postal codes (optional field)', () => {
      expect(service.validatePostalCode('', 'IN')).toBe(true);
      expect(service.validatePostalCode(null as any, 'IN')).toBe(true);
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format Indian phone numbers correctly', () => {
      expect(service.formatPhoneNumber('9876543210', 'IN')).toBe('+919876543210');
      expect(service.formatPhoneNumber('919876543210', 'IN')).toBe('919876543210'); // Already has country code digits
    });

    it('should format Sri Lankan phone numbers correctly', () => {
      expect(service.formatPhoneNumber('123456789', 'LK')).toBe('+94123456789');
    });

    it('should format Philippine phone numbers correctly', () => {
      expect(service.formatPhoneNumber('123456789', 'PH')).toBe('+63123456789');
    });

    it('should return original number if formatting cannot be applied', () => {
      expect(service.formatPhoneNumber('+919876543210', 'IN')).toBe('+919876543210');
      expect(service.formatPhoneNumber('12345', 'IN')).toBe('12345'); // Invalid length
      expect(service.formatPhoneNumber('', 'IN')).toBe('');
    });
  });

  describe('getCountryConfig', () => {
    it('should return config for supported countries', () => {
      const config = service.getCountryConfig('IN');
      expect(config).toBeTruthy();
      expect(config?.code).toBe('IN');
      expect(config?.name).toBe('India');
      expect(config?.timezone).toBe('Asia/Kolkata');
    });

    it('should return null for unsupported countries', () => {
      const config = service.getCountryConfig('US');
      expect(config).toBeNull();
    });
  });

  describe('getSupportedCountries', () => {
    it('should return all supported countries', () => {
      const countries = service.getSupportedCountries();
      expect(countries).toHaveLength(3);
      expect(countries.map(c => c.code)).toContain('IN');
      expect(countries.map(c => c.code)).toContain('LK');
      expect(countries.map(c => c.code)).toContain('PH');
    });
  });

  describe('isCountrySupported', () => {
    it('should return true for supported countries', () => {
      expect(service.isCountrySupported('IN')).toBe(true);
      expect(service.isCountrySupported('LK')).toBe(true);
      expect(service.isCountrySupported('PH')).toBe(true);
    });

    it('should return false for unsupported countries', () => {
      expect(service.isCountrySupported('US')).toBe(false);
      expect(service.isCountrySupported('UK')).toBe(false);
    });
  });
});