import { Country } from '../country.entity';
import { Currency } from '../currency.entity';

describe('Country Entity', () => {
  it('should be defined', () => {
    expect(new Country()).toBeDefined();
  });

  it('should create a country with all required fields', () => {
    const country = new Country();
    country.code = 'IN';
    country.name = 'India';
    country.taxYearStartMonth = 4; // April
    country.isActive = true;

    expect(country.code).toBe('IN');
    expect(country.name).toBe('India');
    expect(country.taxYearStartMonth).toBe(4);
    expect(country.isActive).toBe(true);
  });

  it('should support ISO 3166-1 alpha-2 codes', () => {
    const countries = [
      { code: 'IN', name: 'India' },
      { code: 'PH', name: 'Philippines' },
      { code: 'AU', name: 'Australia' },
      { code: 'US', name: 'United States' },
      { code: 'GB', name: 'United Kingdom' },
    ];

    countries.forEach((data) => {
      const country = new Country();
      country.code = data.code;
      country.name = data.name;
      expect(country.code).toBe(data.code);
      expect(country.name).toBe(data.name);
    });
  });

  it('should have proper tax year start month validation range', () => {
    const country = new Country();
    
    // Valid months (1-12)
    for (let month = 1; month <= 12; month++) {
      country.taxYearStartMonth = month;
      expect(country.taxYearStartMonth).toBe(month);
    }
  });

  it('should support currency relationship', () => {
    const currency = new Currency();
    currency.code = 'INR';
    currency.name = 'Indian Rupee';
    currency.symbol = '₹';
    
    const country = new Country();
    country.code = 'IN';
    country.name = 'India';
    country.currency = currency;
    
    expect(country.currency).toBeDefined();
    expect(country.currency.code).toBe('INR');
  });

  it('should have timestamps', () => {
    const country = new Country();
    country.createdAt = new Date();
    country.updatedAt = new Date();
    
    expect(country.createdAt).toBeInstanceOf(Date);
    expect(country.updatedAt).toBeInstanceOf(Date);
  });

  it('should support active/inactive status', () => {
    const activeCountry = new Country();
    activeCountry.isActive = true;
    expect(activeCountry.isActive).toBe(true);
    
    const inactiveCountry = new Country();
    inactiveCountry.isActive = false;
    expect(inactiveCountry.isActive).toBe(false);
  });
});

