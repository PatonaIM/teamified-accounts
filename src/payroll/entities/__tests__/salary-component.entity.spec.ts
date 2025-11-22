import { SalaryComponent, SalaryComponentType, CalculationType } from '../salary-component.entity';
import { Country } from '../country.entity';

describe('SalaryComponent Entity', () => {
  it('should be defined', () => {
    expect(new SalaryComponent()).toBeDefined();
  });

  it('should create a salary component with all required fields', () => {
    const component = new SalaryComponent();
    component.componentName = 'Basic Salary';
    component.componentCode = 'BASIC';
    component.componentType = SalaryComponentType.EARNINGS;
    component.calculationType = CalculationType.FIXED_AMOUNT;
    component.calculationValue = 50000;
    component.isTaxable = true;
    component.isStatutory = false;
    component.isMandatory = true;
    component.displayOrder = 1;
    component.isActive = true;

    expect(component.componentName).toBe('Basic Salary');
    expect(component.componentCode).toBe('BASIC');
    expect(component.componentType).toBe(SalaryComponentType.EARNINGS);
    expect(component.calculationType).toBe(CalculationType.FIXED_AMOUNT);
    expect(component.calculationValue).toBe(50000);
    expect(component.isTaxable).toBe(true);
    expect(component.isStatutory).toBe(false);
    expect(component.isMandatory).toBe(true);
    expect(component.displayOrder).toBe(1);
    expect(component.isActive).toBe(true);
  });

  it('should support country relationship', () => {
    const country = new Country();
    country.code = 'IN';
    country.name = 'India';
    
    const component = new SalaryComponent();
    component.country = country;
    component.componentName = 'Basic Salary';
    component.componentCode = 'BASIC';
    component.componentType = SalaryComponentType.EARNINGS;
    component.calculationType = CalculationType.FIXED_AMOUNT;
    
    expect(component.country).toBeDefined();
    expect(component.country.code).toBe('IN');
  });

  it('should support all salary component types', () => {
    const types = [
      SalaryComponentType.EARNINGS,
      SalaryComponentType.DEDUCTIONS,
      SalaryComponentType.BENEFITS,
      SalaryComponentType.REIMBURSEMENTS,
    ];

    types.forEach((type) => {
      const component = new SalaryComponent();
      component.componentType = type;
      component.componentName = 'Test Component';
      component.componentCode = 'TEST';
      component.calculationType = CalculationType.FIXED_AMOUNT;
      expect(component.componentType).toBe(type);
    });
  });

  it('should support all calculation types', () => {
    const calculationTypes = [
      CalculationType.FIXED_AMOUNT,
      CalculationType.PERCENTAGE_OF_BASIC,
      CalculationType.PERCENTAGE_OF_GROSS,
      CalculationType.PERCENTAGE_OF_NET,
      CalculationType.FORMULA,
    ];

    calculationTypes.forEach((calcType) => {
      const component = new SalaryComponent();
      component.calculationType = calcType;
      component.componentName = 'Test Component';
      component.componentCode = 'TEST';
      component.componentType = SalaryComponentType.EARNINGS;
      expect(component.calculationType).toBe(calcType);
    });
  });

  it('should handle formula-based calculations', () => {
    const component = new SalaryComponent();
    component.componentName = 'HRA';
    component.componentCode = 'HRA';
    component.componentType = SalaryComponentType.EARNINGS;
    component.calculationType = CalculationType.FORMULA;
    component.calculationFormula = 'BASIC * 0.4';
    component.calculationValue = null;

    expect(component.calculationFormula).toBe('BASIC * 0.4');
    expect(component.calculationValue).toBeNull();
  });

  it('should handle percentage-based calculations', () => {
    const component = new SalaryComponent();
    component.componentName = 'Provident Fund';
    component.componentCode = 'PF';
    component.componentType = SalaryComponentType.DEDUCTIONS;
    component.calculationType = CalculationType.PERCENTAGE_OF_BASIC;
    component.calculationValue = 12.0;
    component.calculationFormula = null;

    expect(component.calculationValue).toBe(12.0);
    expect(component.calculationFormula).toBeNull();
  });

  it('should handle optional fields', () => {
    const component = new SalaryComponent();
    component.componentName = 'Basic Salary';
    component.componentCode = 'BASIC';
    component.componentType = SalaryComponentType.EARNINGS;
    component.calculationType = CalculationType.FIXED_AMOUNT;
    component.description = 'Basic salary component';
    component.calculationFormula = null;

    expect(component.description).toBe('Basic salary component');
    expect(component.calculationFormula).toBeNull();
  });
});
