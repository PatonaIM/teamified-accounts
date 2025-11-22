import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCurrencyDto, UpdateCurrencyDto, CurrencyConversionDto } from '../currency.dto';

describe('Currency DTOs', () => {
  describe('CreateCurrencyDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToInstance(CreateCurrencyDto, {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        decimalPlaces: 2,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid currency code format', async () => {
      const dto = plainToInstance(CreateCurrencyDto, {
        code: 'inr',
        name: 'Indian Rupee',
        symbol: '₹',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('code');
    });

    it('should accept valid ISO 4217 currency codes', async () => {
      const codes = ['INR', 'PHP', 'AUD', 'USD', 'EUR', 'GBP', 'JPY'];

      for (const code of codes) {
        const dto = plainToInstance(CreateCurrencyDto, {
          code,
          name: 'Test Currency',
          symbol: '$',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should fail with invalid decimal places (negative)', async () => {
      const dto = plainToInstance(CreateCurrencyDto, {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        decimalPlaces: -1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('decimalPlaces');
    });
  });

  describe('UpdateCurrencyDto', () => {
    it('should pass validation with partial data', async () => {
      const dto = plainToInstance(UpdateCurrencyDto, {
        name: 'Updated Rupee',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('CurrencyConversionDto', () => {
    it('should pass validation with valid conversion data', async () => {
      const dto = plainToInstance(CurrencyConversionDto, {
        fromCurrency: 'USD',
        toCurrency: 'INR',
        amount: 100,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with negative amount', async () => {
      const dto = plainToInstance(CurrencyConversionDto, {
        fromCurrency: 'USD',
        toCurrency: 'INR',
        amount: -100,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('amount');
    });
  });
});

