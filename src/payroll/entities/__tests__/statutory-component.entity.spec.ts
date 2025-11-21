import { 
  StatutoryComponent, 
  StatutoryComponentType, 
  ContributionType, 
  CalculationBasis 
} from '../statutory-component.entity';
import { Country } from '../country.entity';

describe('StatutoryComponent Entity', () => {
  it('should be defined', () => {
    expect(new StatutoryComponent()).toBeDefined();
  });

  it('should create a statutory component with all required fields', () => {
    const component = new StatutoryComponent();
    component.componentName = 'Employee Provident Fund';
    component.componentCode = 'EPF';
    component.componentType = StatutoryComponentType.EPF;
    component.contributionType = ContributionType.BOTH;
    component.calculationBasis = CalculationBasis.BASIC_SALARY;
    component.employeePercentage = 12.0;
    component.employerPercentage = 12.0;
    component.effectiveFrom = new Date('2024-01-01');
    component.isMandatory = true;
    component.displayOrder = 1;
    component.isActive = true;

    expect(component.componentName).toBe('Employee Provident Fund');
    expect(component.componentCode).toBe('EPF');
    expect(component.componentType).toBe(StatutoryComponentType.EPF);
    expect(component.contributionType).toBe(ContributionType.BOTH);
    expect(component.calculationBasis).toBe(CalculationBasis.BASIC_SALARY);
    expect(component.employeePercentage).toBe(12.0);
    expect(component.employerPercentage).toBe(12.0);
    expect(component.effectiveFrom).toEqual(new Date('2024-01-01'));
    expect(component.isMandatory).toBe(true);
    expect(component.displayOrder).toBe(1);
    expect(component.isActive).toBe(true);
  });

  it('should support country relationship', () => {
    const country = new Country();
    country.code = 'IN';
    country.name = 'India';
    
    const component = new StatutoryComponent();
    component.country = country;
    component.componentName = 'EPF';
    component.componentCode = 'EPF';
    component.componentType = StatutoryComponentType.EPF;
    component.contributionType = ContributionType.BOTH;
    component.calculationBasis = CalculationBasis.BASIC_SALARY;
    component.effectiveFrom = new Date('2024-01-01');
    
    expect(component.country).toBeDefined();
    expect(component.country.code).toBe('IN');
  });

  it('should support all statutory component types', () => {
    const types = [
      StatutoryComponentType.EPF,
      StatutoryComponentType.ESI,
      StatutoryComponentType.PT,
      StatutoryComponentType.TDS,
      StatutoryComponentType.SSS,
      StatutoryComponentType.PHILHEALTH,
      StatutoryComponentType.PAGIBIG,
      StatutoryComponentType.SUPERANNUATION,
      StatutoryComponentType.EPF_MY,
      StatutoryComponentType.SOCSO,
      StatutoryComponentType.EIS,
      StatutoryComponentType.CPF,
    ];

    types.forEach((type) => {
      const component = new StatutoryComponent();
      component.componentType = type;
      component.componentName = 'Test Component';
      component.componentCode = 'TEST';
      component.contributionType = ContributionType.EMPLOYEE;
      component.calculationBasis = CalculationBasis.BASIC_SALARY;
      component.effectiveFrom = new Date('2024-01-01');
      expect(component.componentType).toBe(type);
    });
  });

  it('should support all contribution types', () => {
    const contributionTypes = [
      ContributionType.EMPLOYEE,
      ContributionType.EMPLOYER,
      ContributionType.BOTH,
    ];

    contributionTypes.forEach((contribType) => {
      const component = new StatutoryComponent();
      component.contributionType = contribType;
      component.componentName = 'Test Component';
      component.componentCode = 'TEST';
      component.componentType = StatutoryComponentType.EPF;
      component.calculationBasis = CalculationBasis.BASIC_SALARY;
      component.effectiveFrom = new Date('2024-01-01');
      expect(component.contributionType).toBe(contribType);
    });
  });

  it('should support all calculation basis types', () => {
    const calculationBasis = [
      CalculationBasis.GROSS_SALARY,
      CalculationBasis.BASIC_SALARY,
      CalculationBasis.CAPPED_AMOUNT,
      CalculationBasis.FIXED_AMOUNT,
    ];

    calculationBasis.forEach((basis) => {
      const component = new StatutoryComponent();
      component.calculationBasis = basis;
      component.componentName = 'Test Component';
      component.componentCode = 'TEST';
      component.componentType = StatutoryComponentType.EPF;
      component.contributionType = ContributionType.EMPLOYEE;
      component.effectiveFrom = new Date('2024-01-01');
      expect(component.calculationBasis).toBe(basis);
    });
  });

  it('should handle wage ceiling and floor', () => {
    const component = new StatutoryComponent();
    component.componentName = 'EPF';
    component.componentCode = 'EPF';
    component.componentType = StatutoryComponentType.EPF;
    component.contributionType = ContributionType.BOTH;
    component.calculationBasis = CalculationBasis.CAPPED_AMOUNT;
    component.wageCeiling = 15000;
    component.wageFloor = 1000;
    component.effectiveFrom = new Date('2024-01-01');

    expect(component.wageCeiling).toBe(15000);
    expect(component.wageFloor).toBe(1000);
  });

  it('should handle effective date range', () => {
    const component = new StatutoryComponent();
    component.componentName = 'Temporary Component';
    component.componentCode = 'TEMP';
    component.componentType = StatutoryComponentType.EPF;
    component.contributionType = ContributionType.EMPLOYEE;
    component.calculationBasis = CalculationBasis.BASIC_SALARY;
    component.effectiveFrom = new Date('2024-01-01');
    component.effectiveTo = new Date('2024-12-31');

    expect(component.effectiveFrom).toEqual(new Date('2024-01-01'));
    expect(component.effectiveTo).toEqual(new Date('2024-12-31'));
  });

  it('should handle optional fields', () => {
    const component = new StatutoryComponent();
    component.componentName = 'EPF';
    component.componentCode = 'EPF';
    component.componentType = StatutoryComponentType.EPF;
    component.contributionType = ContributionType.BOTH;
    component.calculationBasis = CalculationBasis.BASIC_SALARY;
    component.effectiveFrom = new Date('2024-01-01');
    component.description = 'Employee Provident Fund contribution';
    component.regulatoryReference = 'EPF Act 1952';
    component.effectiveTo = null;

    expect(component.description).toBe('Employee Provident Fund contribution');
    expect(component.regulatoryReference).toBe('EPF Act 1952');
    expect(component.effectiveTo).toBeNull();
  });
});
