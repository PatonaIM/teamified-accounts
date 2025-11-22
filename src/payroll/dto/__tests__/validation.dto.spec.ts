import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateExchangeRateDto } from '../exchange-rate.dto';
import { CreatePayrollPeriodDto } from '../payroll-period.dto';
import { CreateTaxYearDto } from '../tax-year.dto';
import { PayrollPeriodStatus } from '../../entities/payroll-period.entity';

describe('Multi-Region DTOs Validation', () => {
  describe('CreateExchangeRateDto', () => {
    it('should pass validation with valid exchange rate', async () => {
      const dto = plainToInstance(CreateExchangeRateDto, {
        fromCurrencyId: '550e8400-e29b-41d4-a716-446655440000',
        toCurrencyId: '550e8400-e29b-41d4-a716-446655440001',
        rate: 83.5,
        effectiveDate: '2024-01-01',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with zero or negative rate', async () => {
      const dto = plainToInstance(CreateExchangeRateDto, {
        fromCurrencyId: '550e8400-e29b-41d4-a716-446655440000',
        toCurrencyId: '550e8400-e29b-41d4-a716-446655440001',
        rate: 0,
        effectiveDate: '2024-01-01',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('rate');
    });
  });

  describe('CreatePayrollPeriodDto', () => {
    it('should pass validation with valid period data', async () => {
      const dto = plainToInstance(CreatePayrollPeriodDto, {
        countryId: '550e8400-e29b-41d4-a716-446655440000',
        periodName: 'January 2024',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        payDate: '2024-02-05',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept valid payroll period statuses', async () => {
      const statuses = [
        PayrollPeriodStatus.DRAFT,
        PayrollPeriodStatus.OPEN,
        PayrollPeriodStatus.PROCESSING,
        PayrollPeriodStatus.COMPLETED,
        PayrollPeriodStatus.CLOSED,
      ];

      for (const status of statuses) {
        const dto = plainToInstance(CreatePayrollPeriodDto, {
          countryId: '550e8400-e29b-41d4-a716-446655440000',
          periodName: 'January 2024',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          payDate: '2024-02-05',
          status,
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });
  });

  describe('CreateTaxYearDto', () => {
    it('should pass validation with valid tax year data', async () => {
      const dto = plainToInstance(CreateTaxYearDto, {
        countryId: '550e8400-e29b-41d4-a716-446655440000',
        year: 2024,
        startDate: '2024-04-01',
        endDate: '2025-03-31',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with year before 2000', async () => {
      const dto = plainToInstance(CreateTaxYearDto, {
        countryId: '550e8400-e29b-41d4-a716-446655440000',
        year: 1999,
        startDate: '1999-04-01',
        endDate: '2000-03-31',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('year');
    });
  });
});

