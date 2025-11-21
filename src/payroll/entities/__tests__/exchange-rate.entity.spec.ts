import { ExchangeRate } from '../exchange-rate.entity';
import { Currency } from '../currency.entity';

describe('ExchangeRate Entity', () => {
  it('should be defined', () => {
    expect(new ExchangeRate()).toBeDefined();
  });

  it('should create an exchange rate with all required fields', () => {
    const exchangeRate = new ExchangeRate();
    exchangeRate.rate = 83.5;
    exchangeRate.effectiveDate = new Date('2024-01-01');
    exchangeRate.isActive = true;

    expect(exchangeRate.rate).toBe(83.5);
    expect(exchangeRate.effectiveDate).toEqual(new Date('2024-01-01'));
    expect(exchangeRate.isActive).toBe(true);
  });

  it('should support currency relationships', () => {
    const usd = new Currency();
    usd.code = 'USD';
    usd.name = 'US Dollar';
    usd.symbol = '$';
    
    const inr = new Currency();
    inr.code = 'INR';
    inr.name = 'Indian Rupee';
    inr.symbol = '₹';
    
    const exchangeRate = new ExchangeRate();
    exchangeRate.fromCurrency = usd;
    exchangeRate.toCurrency = inr;
    exchangeRate.rate = 83.5;
    
    expect(exchangeRate.fromCurrency.code).toBe('USD');
    expect(exchangeRate.toCurrency.code).toBe('INR');
    expect(exchangeRate.rate).toBe(83.5);
  });

  it('should handle different exchange rate precision', () => {
    const highPrecisionRate = new ExchangeRate();
    highPrecisionRate.rate = 0.012345;
    expect(highPrecisionRate.rate).toBe(0.012345);
    
    const lowPrecisionRate = new ExchangeRate();
    lowPrecisionRate.rate = 100.5;
    expect(lowPrecisionRate.rate).toBe(100.5);
  });

  it('should have timestamps', () => {
    const exchangeRate = new ExchangeRate();
    exchangeRate.createdAt = new Date();
    exchangeRate.updatedAt = new Date();
    
    expect(exchangeRate.createdAt).toBeInstanceOf(Date);
    expect(exchangeRate.updatedAt).toBeInstanceOf(Date);
  });

  it('should support active/inactive status', () => {
    const activeRate = new ExchangeRate();
    activeRate.isActive = true;
    expect(activeRate.isActive).toBe(true);
    
    const inactiveRate = new ExchangeRate();
    inactiveRate.isActive = false;
    expect(inactiveRate.isActive).toBe(false);
  });

  it('should support effective date for historical rates', () => {
    const rate1 = new ExchangeRate();
    rate1.effectiveDate = new Date('2024-01-01');
    rate1.rate = 83.0;
    
    const rate2 = new ExchangeRate();
    rate2.effectiveDate = new Date('2024-06-01');
    rate2.rate = 83.5;
    
    expect(rate1.effectiveDate.getTime()).toBeLessThan(rate2.effectiveDate.getTime());
  });
});

