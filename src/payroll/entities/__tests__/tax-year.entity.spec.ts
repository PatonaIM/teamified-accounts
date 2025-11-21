import { TaxYear } from '../tax-year.entity';
import { Country } from '../country.entity';

describe('TaxYear Entity', () => {
  it('should be defined', () => {
    expect(new TaxYear()).toBeDefined();
  });

  it('should create a tax year with all required fields', () => {
    const taxYear = new TaxYear();
    taxYear.year = 2024;
    taxYear.startDate = new Date('2024-04-01');
    taxYear.endDate = new Date('2025-03-31');
    taxYear.isCurrent = true;

    expect(taxYear.year).toBe(2024);
    expect(taxYear.startDate).toEqual(new Date('2024-04-01'));
    expect(taxYear.endDate).toEqual(new Date('2025-03-31'));
    expect(taxYear.isCurrent).toBe(true);
  });

  it('should support country relationship', () => {
    const country = new Country();
    country.code = 'IN';
    country.name = 'India';
    
    const taxYear = new TaxYear();
    taxYear.country = country;
    taxYear.year = 2024;
    
    expect(taxYear.country).toBeDefined();
    expect(taxYear.country.code).toBe('IN');
  });

  it('should handle different tax year periods', () => {
    // India: April 1 to March 31
    const indiaTaxYear = new TaxYear();
    indiaTaxYear.year = 2024;
    indiaTaxYear.startDate = new Date('2024-04-01');
    indiaTaxYear.endDate = new Date('2025-03-31');
    expect(indiaTaxYear.startDate.getMonth()).toBe(3); // April (0-indexed)
    expect(indiaTaxYear.endDate.getMonth()).toBe(2); // March (0-indexed)
    
    // Australia: July 1 to June 30
    const australiaTaxYear = new TaxYear();
    australiaTaxYear.year = 2024;
    australiaTaxYear.startDate = new Date('2024-07-01');
    australiaTaxYear.endDate = new Date('2025-06-30');
    expect(australiaTaxYear.startDate.getMonth()).toBe(6); // July (0-indexed)
    expect(australiaTaxYear.endDate.getMonth()).toBe(5); // June (0-indexed)
    
    // Calendar year: January 1 to December 31
    const calendarTaxYear = new TaxYear();
    calendarTaxYear.year = 2024;
    calendarTaxYear.startDate = new Date('2024-01-01');
    calendarTaxYear.endDate = new Date('2024-12-31');
    expect(calendarTaxYear.startDate.getMonth()).toBe(0); // January (0-indexed)
    expect(calendarTaxYear.endDate.getMonth()).toBe(11); // December (0-indexed)
  });

  it('should have timestamps', () => {
    const taxYear = new TaxYear();
    taxYear.createdAt = new Date();
    taxYear.updatedAt = new Date();
    
    expect(taxYear.createdAt).toBeInstanceOf(Date);
    expect(taxYear.updatedAt).toBeInstanceOf(Date);
  });

  it('should mark current tax year', () => {
    const currentTaxYear = new TaxYear();
    currentTaxYear.isCurrent = true;
    expect(currentTaxYear.isCurrent).toBe(true);
    
    const pastTaxYear = new TaxYear();
    pastTaxYear.isCurrent = false;
    expect(pastTaxYear.isCurrent).toBe(false);
  });
});

