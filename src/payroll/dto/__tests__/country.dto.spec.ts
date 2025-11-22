import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCountryDto, UpdateCountryDto } from '../country.dto';

describe('Country DTOs', () => {
  describe('CreateCountryDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToInstance(CreateCountryDto, {
        code: 'IN',
        name: 'India',
        currencyId: '550e8400-e29b-41d4-a716-446655440000',
        taxYearStartMonth: 4,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid country code format', async () => {
      const dto = plainToInstance(CreateCountryDto, {
        code: 'india',
        name: 'India',
        currencyId: '550e8400-e29b-41d4-a716-446655440000',
        taxYearStartMonth: 4,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('code');
    });

    it('should fail validation with invalid tax year month', async () => {
      const dto = plainToInstance(CreateCountryDto, {
        code: 'IN',
        name: 'India',
        currencyId: '550e8400-e29b-41d4-a716-446655440000',
        taxYearStartMonth: 13,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('taxYearStartMonth');
    });

    it('should fail validation with invalid UUID for currencyId', async () => {
      const dto = plainToInstance(CreateCountryDto, {
        code: 'IN',
        name: 'India',
        currencyId: 'invalid-uuid',
        taxYearStartMonth: 4,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('currencyId');
    });

    it('should accept valid ISO 3166-1 alpha-2 codes', async () => {
      const codes = ['IN', 'PH', 'AU', 'US', 'GB'];

      for (const code of codes) {
        const dto = plainToInstance(CreateCountryDto, {
          code,
          name: 'Test Country',
          currencyId: '550e8400-e29b-41d4-a716-446655440000',
          taxYearStartMonth: 1,
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });
  });

  describe('UpdateCountryDto', () => {
    it('should pass validation with partial data', async () => {
      const dto = plainToInstance(UpdateCountryDto, {
        name: 'Updated India',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with all fields', async () => {
      const dto = plainToInstance(UpdateCountryDto, {
        name: 'India',
        currencyId: '550e8400-e29b-41d4-a716-446655440000',
        taxYearStartMonth: 4,
        isActive: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});

