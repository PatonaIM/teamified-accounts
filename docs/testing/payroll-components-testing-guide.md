# Payroll Components Testing Guide

## Overview

This guide provides comprehensive testing strategies and examples for the Salary & Statutory Components Configuration system. It covers unit tests, integration tests, performance tests, and end-to-end testing scenarios.

## Testing Strategy

### Test Pyramid

```
                    ┌─────────────────┐
                    │   E2E Tests     │  ← Few, High-level
                    │   (Playwright)  │
                    └─────────────────┘
                   ┌─────────────────────┐
                   │  Integration Tests  │  ← Some, API-level
                   │   (Jest/Supertest)  │
                   └─────────────────────┘
                 ┌─────────────────────────┐
                 │     Unit Tests          │  ← Many, Component-level
                 │      (Jest)             │
                 └─────────────────────────┘
```

### Test Categories

1. **Unit Tests**: Individual service methods and business logic
2. **Integration Tests**: API endpoints and database interactions
3. **Performance Tests**: Large dataset handling and response times
4. **End-to-End Tests**: Complete user workflows
5. **Contract Tests**: API contract validation

## Unit Testing

### Service Layer Tests

#### SalaryComponentService Tests

```typescript
// src/payroll/services/__tests__/salary-component.service.spec.ts
describe('SalaryComponentService', () => {
  describe('create', () => {
    it('should create a salary component successfully', async () => {
      // Arrange
      const createDto = {
        countryId: 'country-id',
        componentName: 'Basic Salary',
        componentCode: 'BASIC',
        componentType: SalaryComponentType.EARNINGS,
        calculationType: CalculationType.FIXED_AMOUNT,
        calculationValue: 50000,
        isTaxable: true,
        isStatutory: false,
        isMandatory: true,
        displayOrder: 1,
        description: 'Basic salary component',
        isActive: true
      };

      const mockComponent = { id: 'component-id', ...createDto };
      
      countryRepository.findOne.mockResolvedValue(mockCountry);
      salaryComponentRepository.findOne.mockResolvedValue(null);
      salaryComponentRepository.create.mockReturnValue(mockComponent);
      salaryComponentRepository.save.mockResolvedValue(mockComponent);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.componentName).toBe('Basic Salary');
      expect(countryRepository.findOne).toHaveBeenCalledWith({ where: { id: 'country-id' } });
      expect(salaryComponentRepository.create).toHaveBeenCalledWith(createDto);
      expect(salaryComponentRepository.save).toHaveBeenCalledWith(mockComponent);
    });

    it('should throw NotFoundException when country not found', async () => {
      // Arrange
      const createDto = { /* ... */ };
      countryRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid calculation rules', async () => {
      // Arrange
      const invalidDto = {
        ...createDto,
        calculationType: CalculationType.FIXED_AMOUNT,
        calculationValue: null
      };
      countryRepository.findOne.mockResolvedValue(mockCountry);
      salaryComponentRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByCountry', () => {
    it('should return paginated salary components', async () => {
      // Arrange
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockComponent], 1])
      };
      salaryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.findByCountry('country-id', 1, 10);

      // Assert
      expect(result.components).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
});
```

#### StatutoryComponentService Tests

```typescript
// src/payroll/services/__tests__/statutory-component.service.spec.ts
describe('StatutoryComponentService', () => {
  describe('create', () => {
    it('should create a statutory component successfully', async () => {
      // Arrange
      const createDto = {
        countryId: 'country-id',
        componentName: 'Employee Provident Fund',
        componentCode: 'EPF',
        componentType: StatutoryComponentType.EPF,
        contributionType: ContributionType.BOTH,
        calculationBasis: CalculationBasis.BASIC_SALARY,
        employeePercentage: 12.0,
        employerPercentage: 12.0,
        effectiveFrom: '2024-01-01',
        isMandatory: true,
        displayOrder: 1,
        isActive: true
      };

      const mockComponent = { id: 'component-id', ...createDto };
      
      countryRepository.findOne.mockResolvedValue(mockCountry);
      statutoryComponentRepository.findOne.mockResolvedValue(null);
      statutoryComponentRepository.create.mockReturnValue(mockComponent);
      statutoryComponentRepository.save.mockResolvedValue(mockComponent);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.componentName).toBe('Employee Provident Fund');
    });

    it('should validate contribution type requirements', async () => {
      // Arrange
      const invalidDto = {
        ...createDto,
        contributionType: ContributionType.EMPLOYEE,
        employeePercentage: null
      };
      countryRepository.findOne.mockResolvedValue(mockCountry);
      statutoryComponentRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });
});
```

### Entity Tests

```typescript
// src/payroll/entities/__tests__/salary-component.entity.spec.ts
describe('SalaryComponent Entity', () => {
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
  });

  it('should support all calculation types', () => {
    const types = [
      CalculationType.FIXED_AMOUNT,
      CalculationType.PERCENTAGE_OF_BASIC,
      CalculationType.PERCENTAGE_OF_GROSS,
      CalculationType.PERCENTAGE_OF_NET,
      CalculationType.FORMULA
    ];

    types.forEach((type) => {
      const component = new SalaryComponent();
      component.calculationType = type;
      expect(component.calculationType).toBe(type);
    });
  });
});
```

## Integration Testing

### API Endpoint Tests

#### SalaryComponentController Tests

```typescript
// src/payroll/controllers/__tests__/salary-component.controller.integration.spec.ts
describe('SalaryComponentController Integration', () => {
  let app: INestApplication;
  let salaryComponentService: jest.Mocked<SalaryComponentService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalaryComponentController],
      providers: [
        {
          provide: SalaryComponentService,
          useValue: mockSalaryComponentService
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  describe('POST /v1/payroll/configuration/countries/:countryId/salary-components', () => {
    it('should create a salary component successfully', async () => {
      // Arrange
      const createDto = { /* ... */ };
      salaryComponentService.create.mockResolvedValue(mockComponent as any);

      // Act
      const response = await request(app.getHttpServer())
        .post('/v1/payroll/configuration/countries/country-id/salary-components')
        .send(createDto)
        .expect(201);

      // Assert
      expect(response.body).toEqual(expect.objectContaining({
        componentName: 'Basic Salary',
        componentCode: 'BASIC'
      }));
      expect(salaryComponentService.create).toHaveBeenCalledWith({
        ...createDto,
        countryId: 'country-id'
      });
    });

    it('should return 400 for invalid data', async () => {
      // Arrange
      const invalidDto = {
        componentName: '', // Invalid: empty string
        calculationValue: -100 // Invalid: negative value
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/v1/payroll/configuration/countries/country-id/salary-components')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /v1/payroll/configuration/countries/:countryId/salary-components', () => {
    it('should return paginated salary components', async () => {
      // Arrange
      const mockResponse = {
        components: [mockComponent],
        total: 1,
        page: 1,
        limit: 10
      };
      salaryComponentService.findByCountry.mockResolvedValue(mockResponse as any);

      // Act
      const response = await request(app.getHttpServer())
        .get('/v1/payroll/configuration/countries/country-id/salary-components')
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockResponse);
      expect(salaryComponentService.findByCountry).toHaveBeenCalledWith(
        'country-id', 1, 10, undefined, undefined
      );
    });
  });
});
```

### Database Integration Tests

```typescript
// src/payroll/__tests__/database.integration.spec.ts
describe('Database Integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.TEST_DB_HOST,
          port: parseInt(process.env.TEST_DB_PORT),
          username: process.env.TEST_DB_USERNAME,
          password: process.env.TEST_DB_PASSWORD,
          database: process.env.TEST_DB_NAME,
          entities: [SalaryComponent, StatutoryComponent, Country],
          synchronize: true
        }),
        PayrollModule
      ]
    }).compile();

    app = module.createNestApplication();
    await app.init();
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('should create and retrieve salary components', async () => {
    // Arrange
    const country = await dataSource.getRepository(Country).save({
      code: 'IN',
      name: 'India',
      currencyId: 'currency-id',
      taxYearStartMonth: 4,
      isActive: true
    });

    const salaryComponent = await dataSource.getRepository(SalaryComponent).save({
      countryId: country.id,
      componentName: 'Basic Salary',
      componentCode: 'BASIC',
      componentType: SalaryComponentType.EARNINGS,
      calculationType: CalculationType.FIXED_AMOUNT,
      calculationValue: 50000,
      isTaxable: true,
      isStatutory: false,
      isMandatory: true,
      displayOrder: 1,
      isActive: true
    });

    // Act
    const retrieved = await dataSource.getRepository(SalaryComponent).findOne({
      where: { id: salaryComponent.id }
    });

    // Assert
    expect(retrieved).toBeDefined();
    expect(retrieved.componentName).toBe('Basic Salary');
    expect(retrieved.countryId).toBe(country.id);
  });
});
```

## Performance Testing

### Load Testing

```typescript
// src/payroll/services/__tests__/salary-component.performance.spec.ts
describe('SalaryComponentService Performance', () => {
  it('should handle large number of salary components efficiently', async () => {
    // Arrange
    const largeComponentList = Array.from({ length: 1000 }, (_, index) => ({
      id: `component-${index}`,
      countryId: 'country-id',
      componentName: `Component ${index}`,
      componentCode: `COMP_${index}`,
      componentType: SalaryComponentType.EARNINGS,
      calculationType: CalculationType.FIXED_AMOUNT,
      calculationValue: 1000 + index,
      isTaxable: true,
      isStatutory: false,
      isMandatory: false,
      displayOrder: index,
      description: `Description for component ${index}`,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([largeComponentList, 1000])
    };

    salaryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

    // Act
    const startTime = Date.now();
    const result = await service.findByCountry('country-id', 1, 1000);
    const endTime = Date.now();

    // Assert
    expect(result.components).toHaveLength(1000);
    expect(result.total).toBe(1000);
    expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
  });

  it('should handle concurrent requests efficiently', async () => {
    // Arrange
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0])
    };

    salaryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

    // Act
    const startTime = Date.now();
    const promises = Array.from({ length: 10 }, (_, index) => 
      service.findByCountry(`country-${index}`, 1, 10)
    );
    const results = await Promise.all(promises);
    const endTime = Date.now();

    // Assert
    expect(results).toHaveLength(10);
    expect(endTime - startTime).toBeLessThan(1000); // All requests should complete within 1 second
  });
});
```

### Memory Testing

```typescript
describe('Memory Usage', () => {
  it('should handle large result sets without memory issues', async () => {
    // Arrange
    const largeComponentList = Array.from({ length: 10000 }, (_, index) => ({
      id: `component-${index}`,
      countryId: 'country-id',
      componentName: `Component ${index}`,
      componentCode: `COMP_${index}`,
      componentType: SalaryComponentType.EARNINGS,
      calculationType: CalculationType.FIXED_AMOUNT,
      calculationValue: 1000 + index,
      isTaxable: true,
      isStatutory: false,
      isMandatory: false,
      displayOrder: index,
      description: `Description for component ${index}`,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([largeComponentList, 10000])
    };

    salaryComponentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

    // Act
    const startTime = Date.now();
    const result = await service.findByCountry('country-id', 1, 10000);
    const endTime = Date.now();

    // Assert
    expect(result.components).toHaveLength(10000);
    expect(result.total).toBe(10000);
    expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
  });
});
```

## End-to-End Testing

### Playwright Tests

```typescript
// tests/payroll-components.e2e.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Payroll Components E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'admin@teamified.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create salary component successfully', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll/configuration');
    
    // Select country
    await page.click('[data-testid="country-selector"]');
    await page.click('[data-testid="country-option-india"]');
    
    // Navigate to salary components tab
    await page.click('[data-testid="salary-components-tab"]');
    
    // Click create button
    await page.click('[data-testid="create-salary-component-button"]');
    
    // Fill form
    await page.fill('[data-testid="component-name"]', 'Basic Salary');
    await page.fill('[data-testid="component-code"]', 'BASIC');
    await page.selectOption('[data-testid="component-type"]', 'earnings');
    await page.selectOption('[data-testid="calculation-type"]', 'fixed_amount');
    await page.fill('[data-testid="calculation-value"]', '50000');
    await page.fill('[data-testid="description"]', 'Basic salary component');
    
    // Submit form
    await page.click('[data-testid="submit-button"]');
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="component-list"]')).toContainText('Basic Salary');
  });

  test('should create statutory component successfully', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll/configuration');
    
    // Select country
    await page.click('[data-testid="country-selector"]');
    await page.click('[data-testid="country-option-india"]');
    
    // Navigate to statutory components tab
    await page.click('[data-testid="statutory-components-tab"]');
    
    // Click create button
    await page.click('[data-testid="create-statutory-component-button"]');
    
    // Fill form
    await page.fill('[data-testid="component-name"]', 'Employee Provident Fund');
    await page.fill('[data-testid="component-code"]', 'EPF');
    await page.selectOption('[data-testid="component-type"]', 'epf');
    await page.selectOption('[data-testid="contribution-type"]', 'both');
    await page.selectOption('[data-testid="calculation-basis"]', 'basic_salary');
    await page.fill('[data-testid="employee-percentage"]', '12.0');
    await page.fill('[data-testid="employer-percentage"]', '12.0');
    await page.fill('[data-testid="effective-from"]', '2024-01-01');
    await page.fill('[data-testid="description"]', 'Employee Provident Fund contribution');
    
    // Submit form
    await page.click('[data-testid="submit-button"]');
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="component-list"]')).toContainText('Employee Provident Fund');
  });

  test('should validate form inputs', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll/configuration');
    
    // Select country
    await page.click('[data-testid="country-selector"]');
    await page.click('[data-testid="country-option-india"]');
    
    // Navigate to salary components tab
    await page.click('[data-testid="salary-components-tab"]');
    
    // Click create button
    await page.click('[data-testid="create-salary-component-button"]');
    
    // Try to submit empty form
    await page.click('[data-testid="submit-button"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="component-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="component-code-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="component-type-error"]')).toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll/configuration');
    
    // Select country
    await page.click('[data-testid="country-selector"]');
    await page.click('[data-testid="country-option-india"]');
    
    // Navigate to salary components tab
    await page.click('[data-testid="salary-components-tab"]');
    
    // Verify pagination controls
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    
    // Click next page
    await page.click('[data-testid="next-page-button"]');
    
    // Verify page changed
    await expect(page.locator('[data-testid="current-page"]')).toHaveText('2');
  });
});
```

## Contract Testing

### API Contract Tests

```typescript
// tests/contracts/payroll-components.contract.spec.ts
describe('Payroll Components API Contract', () => {
  it('should match OpenAPI specification', async () => {
    const response = await request(app.getHttpServer())
      .get('/api-json')
      .expect(200);

    const spec = response.body;
    
    // Verify salary components endpoints exist
    expect(spec.paths['/v1/payroll/configuration/countries/{countryId}/salary-components']).toBeDefined();
    expect(spec.paths['/v1/payroll/configuration/countries/{countryId}/statutory-components']).toBeDefined();
    
    // Verify schemas exist
    expect(spec.components.schemas.CreateSalaryComponentDto).toBeDefined();
    expect(spec.components.schemas.CreateStatutoryComponentDto).toBeDefined();
    expect(spec.components.schemas.SalaryComponentResponseDto).toBeDefined();
    expect(spec.components.schemas.StatutoryComponentResponseDto).toBeDefined();
  });
});
```

## Test Data Management

### Test Fixtures

```typescript
// tests/fixtures/payroll-components.fixtures.ts
export const salaryComponentFixtures = {
  basicSalary: {
    countryId: 'india-country-id',
    componentName: 'Basic Salary',
    componentCode: 'BASIC',
    componentType: 'earnings',
    calculationType: 'fixed_amount',
    calculationValue: 50000,
    isTaxable: true,
    isStatutory: false,
    isMandatory: true,
    displayOrder: 1,
    description: 'Basic salary component',
    isActive: true
  },
  hra: {
    countryId: 'india-country-id',
    componentName: 'Housing Rent Allowance',
    componentCode: 'HRA',
    componentType: 'benefits',
    calculationType: 'percentage_of_basic',
    calculationValue: 40,
    isTaxable: true,
    isStatutory: false,
    isMandatory: false,
    displayOrder: 2,
    description: 'HRA at 40% of basic salary',
    isActive: true
  }
};

export const statutoryComponentFixtures = {
  epf: {
    countryId: 'india-country-id',
    componentName: 'Employee Provident Fund',
    componentCode: 'EPF',
    componentType: 'epf',
    contributionType: 'both',
    calculationBasis: 'basic_salary',
    employeePercentage: 12.0,
    employerPercentage: 12.0,
    minimumAmount: 100,
    maximumAmount: 1800,
    wageCeiling: 15000,
    wageFloor: 1000,
    effectiveFrom: '2024-01-01',
    isMandatory: true,
    displayOrder: 1,
    description: 'Employee Provident Fund contribution',
    regulatoryReference: 'EPF Act 1952',
    isActive: true
  }
};
```

### Test Database Setup

```typescript
// tests/setup/test-database.setup.ts
export async function setupTestDatabase() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.TEST_DB_HOST,
    port: parseInt(process.env.TEST_DB_PORT),
    username: process.env.TEST_DB_USERNAME,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_NAME,
    entities: [SalaryComponent, StatutoryComponent, Country],
    synchronize: true
  });

  await dataSource.initialize();
  return dataSource;
}

export async function seedTestData(dataSource: DataSource) {
  const countryRepository = dataSource.getRepository(Country);
  const salaryComponentRepository = dataSource.getRepository(SalaryComponent);
  const statutoryComponentRepository = dataSource.getRepository(StatutoryComponent);

  // Create test country
  const country = await countryRepository.save({
    code: 'IN',
    name: 'India',
    currencyId: 'currency-id',
    taxYearStartMonth: 4,
    isActive: true
  });

  // Create test salary components
  await salaryComponentRepository.save([
    { ...salaryComponentFixtures.basicSalary, countryId: country.id },
    { ...salaryComponentFixtures.hra, countryId: country.id }
  ]);

  // Create test statutory components
  await statutoryComponentRepository.save([
    { ...statutoryComponentFixtures.epf, countryId: country.id }
  ]);

  return { country };
}
```

## Running Tests

### Test Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run performance tests only
npm run test:performance

# Run E2E tests only
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Configuration

```json
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts']
};
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          TEST_DB_HOST: localhost
          TEST_DB_PORT: 5432
          TEST_DB_USERNAME: postgres
          TEST_DB_PASSWORD: postgres
          TEST_DB_NAME: test_db
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Test Data
- Use factories for test data generation
- Keep test data minimal and focused
- Use realistic test data

### 3. Mocking
- Mock external dependencies
- Use partial mocks when possible
- Verify mock interactions

### 4. Assertions
- Use specific assertions
- Test both positive and negative cases
- Verify error conditions

### 5. Performance
- Set reasonable performance thresholds
- Test with realistic data volumes
- Monitor memory usage

### 6. Maintenance
- Keep tests up to date with code changes
- Remove obsolete tests
- Refactor tests for clarity
