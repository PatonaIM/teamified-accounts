import { Currency } from '../currency.entity';

describe('Currency Entity', () => {
  it('should be defined', () => {
    expect(new Currency()).toBeDefined();
  });

  it('should create a currency with all required fields', () => {
    const currency = new Currency();
    currency.code = 'INR';
    currency.name = 'Indian Rupee';
    currency.symbol = '₹';
    currency.decimalPlaces = 2;
    currency.isActive = true;

    expect(currency.code).toBe('INR');
    expect(currency.name).toBe('Indian Rupee');
    currency.symbol = '₹';
    expect(currency.decimalPlaces).toBe(2);
    expect(currency.isActive).toBe(true);
  });

  it('should support ISO 4217 currency codes', () => {
    const currencies = [
      { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimal: 2 },
      { code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimal: 2 },
      { code: 'AUD', name: 'Australian Dollar', symbol: '$', decimal: 2 },
      { code: 'USD', name: 'US Dollar', symbol: '$', decimal: 2 },
      { code: 'EUR', name: 'Euro', symbol: '€', decimal: 2 },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimal: 0 },
    ];

    currencies.forEach((data) => {
      const currency = new Currency();
      currency.code = data.code;
      currency.name = data.name;
      currency.symbol = data.symbol;
      currency.decimalPlaces = data.decimal;
      
      expect(currency.code).toBe(data.code);
      expect(currency.name).toBe(data.name);
      expect(currency.symbol).toBe(data.symbol);
      expect(currency.decimalPlaces).toBe(data.decimal);
    });
  });

  it('should support different decimal places', () => {
    const currencyWith2Decimals = new Currency();
    currencyWith2Decimals.decimalPlaces = 2;
    expect(currencyWith2Decimals.decimalPlaces).toBe(2);
    
    const currencyWith0Decimals = new Currency();
    currencyWith0Decimals.decimalPlaces = 0;
    expect(currencyWith0Decimals.decimalPlaces).toBe(0);
  });

  it('should have timestamps', () => {
    const currency = new Currency();
    currency.createdAt = new Date();
    currency.updatedAt = new Date();
    
    expect(currency.createdAt).toBeInstanceOf(Date);
    expect(currency.updatedAt).toBeInstanceOf(Date);
  });

  it('should support active/inactive status', () => {
    const activeCurrency = new Currency();
    activeCurrency.isActive = true;
    expect(activeCurrency.isActive).toBe(true);
    
    const inactiveCurrency = new Currency();
    inactiveCurrency.isActive = false;
    expect(inactiveCurrency.isActive).toBe(false);
  });
});

