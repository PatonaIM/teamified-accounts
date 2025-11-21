# Payroll Components Integration Guide

## Overview

This guide provides comprehensive information for integrating the Salary & Statutory Components Configuration system into your payroll application. The system is designed to work seamlessly with the existing multi-region payroll foundation from Story 7.1.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  PayrollConfigurationPage (from Story 7.1)                 │
│  ├── CountrySelector                                        │
│  ├── CurrencyDisplay                                        │
│  ├── SalaryComponentsConfig (NEW)                          │
│  └── StatutoryComponentsConfig (NEW)                       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                │
├─────────────────────────────────────────────────────────────┤
│  SalaryComponentController                                  │
│  StatutoryComponentController                               │
│  ├── JWT Authentication                                     │
│  ├── Role-based Authorization                              │
│  └── Validation & Error Handling                           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                             │
├─────────────────────────────────────────────────────────────┤
│  SalaryComponentService                                     │
│  StatutoryComponentService                                  │
│  ├── CountryService (from Story 7.1)                       │
│  ├── RegionConfigurationService (from Story 7.1)           │
│  └── Business Rule Validation                              │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                │
├─────────────────────────────────────────────────────────────┤
│  SalaryComponent Entity                                     │
│  StatutoryComponent Entity                                  │
│  Country Entity (from Story 7.1)                           │
│  ├── PostgreSQL Database                                   │
│  ├── TypeORM ORM                                           │
│  └── Database Migrations                                   │
└─────────────────────────────────────────────────────────────┘
```

## Integration Steps

### 1. Backend Integration

#### Database Setup

1. **Run Database Migrations**
   ```bash
   # Apply the new schema changes
   npm run migration:run
   ```

2. **Verify Database Schema**
   ```sql
   -- Check new tables exist
   SELECT table_name FROM information_schema.tables 
   WHERE table_name IN ('salary_components', 'statutory_components');
   
   -- Check enums exist
   SELECT typname FROM pg_type 
   WHERE typname IN ('salary_component_type_enum', 'statutory_component_type_enum');
   ```

3. **Seed Sample Data**
   ```bash
   # Run the enhanced seed script
   npm run seed:database
   ```

#### Module Registration

The new components are automatically registered in the `PayrollModule`:

```typescript
// src/payroll/payroll.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([
      // ... existing entities
      SalaryComponent,
      StatutoryComponent,
    ]),
    AuthModule,
  ],
  controllers: [
    // ... existing controllers
    SalaryComponentController,
    StatutoryComponentController,
  ],
  providers: [
    // ... existing services
    SalaryComponentService,
    StatutoryComponentService,
  ],
  exports: [
    // ... existing services
    SalaryComponentService,
    StatutoryComponentService,
  ],
})
export class PayrollModule {}
```

### 2. Frontend Integration

#### Component Structure

```
frontend/src/components/payroll/
├── PayrollConfigurationPage.tsx (existing from Story 7.1)
├── SalaryComponentsConfig/
│   ├── SalaryComponentsConfig.tsx
│   ├── SalaryComponentForm.tsx
│   ├── SalaryComponentList.tsx
│   └── SalaryComponentTabs.tsx
└── StatutoryComponentsConfig/
    ├── StatutoryComponentsConfig.tsx
    ├── StatutoryComponentForm.tsx
    ├── StatutoryComponentList.tsx
    └── StatutoryComponentTabs.tsx
```

#### API Integration

```typescript
// frontend/src/services/payroll-api.service.ts
export class PayrollApiService {
  // Salary Components
  async getSalaryComponents(countryId: string, params?: PaginationParams) {
    return this.http.get(`/api/v1/payroll/configuration/countries/${countryId}/salary-components`, { params });
  }

  async createSalaryComponent(countryId: string, data: CreateSalaryComponentDto) {
    return this.http.post(`/api/v1/payroll/configuration/countries/${countryId}/salary-components`, data);
  }

  async updateSalaryComponent(countryId: string, id: string, data: UpdateSalaryComponentDto) {
    return this.http.put(`/api/v1/payroll/configuration/countries/${countryId}/salary-components/${id}`, data);
  }

  async deleteSalaryComponent(countryId: string, id: string) {
    return this.http.delete(`/api/v1/payroll/configuration/countries/${countryId}/salary-components/${id}`);
  }

  // Statutory Components
  async getStatutoryComponents(countryId: string, params?: PaginationParams) {
    return this.http.get(`/api/v1/payroll/configuration/countries/${countryId}/statutory-components`, { params });
  }

  async createStatutoryComponent(countryId: string, data: CreateStatutoryComponentDto) {
    return this.http.post(`/api/v1/payroll/configuration/countries/${countryId}/statutory-components`, data);
  }

  async updateStatutoryComponent(countryId: string, id: string, data: UpdateStatutoryComponentDto) {
    return this.http.put(`/api/v1/payroll/configuration/countries/${countryId}/statutory-components/${id}`, data);
  }

  async deleteStatutoryComponent(countryId: string, id: string) {
    return this.http.delete(`/api/v1/payroll/configuration/countries/${countryId}/statutory-components/${id}`);
  }

  async getActiveStatutoryComponentsByDate(countryId: string, date: string) {
    return this.http.get(`/api/v1/payroll/configuration/countries/${countryId}/statutory-components/active-by-date`, {
      params: { date }
    });
  }
}
```

### 3. Configuration Integration

#### Environment Variables

Add the following environment variables to your `.env` file:

```env
# Payroll Components Configuration
PAYROLL_COMPONENTS_MAX_PERCENTAGE=100
PAYROLL_COMPONENTS_DEFAULT_PAGE_SIZE=10
PAYROLL_COMPONENTS_MAX_PAGE_SIZE=100

# Country-specific overrides
PAYROLL_INDIA_MAX_PERCENTAGE=100
PAYROLL_PHILIPPINES_MAX_PERCENTAGE=100
PAYROLL_AUSTRALIA_MAX_PERCENTAGE=100
```

#### Feature Flags

```typescript
// src/config/feature-flags.config.ts
export const featureFlags = {
  PAYROLL_COMPONENTS_ENABLED: process.env.PAYROLL_COMPONENTS_ENABLED === 'true',
  SALARY_COMPONENTS_ENABLED: process.env.SALARY_COMPONENTS_ENABLED === 'true',
  STATUTORY_COMPONENTS_ENABLED: process.env.STATUTORY_COMPONENTS_ENABLED === 'true',
};
```

## API Usage Examples

### 1. Creating Salary Components

```typescript
// Basic Salary Component
const basicSalary = {
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
};

// Percentage-based Component
const hra = {
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
};

// Formula-based Component
const transportAllowance = {
  countryId: 'india-country-id',
  componentName: 'Transport Allowance',
  componentCode: 'TA',
  componentType: 'benefits',
  calculationType: 'formula',
  calculationFormula: 'BASIC * 0.1 + 2000',
  isTaxable: true,
  isStatutory: false,
  isMandatory: false,
  displayOrder: 3,
  description: 'Transport allowance with complex calculation',
  isActive: true
};
```

### 2. Creating Statutory Components

```typescript
// EPF Component (India)
const epf = {
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
};

// SSS Component (Philippines)
const sss = {
  countryId: 'philippines-country-id',
  componentName: 'Social Security System',
  componentCode: 'SSS',
  componentType: 'sss',
  contributionType: 'both',
  calculationBasis: 'gross_salary',
  employeePercentage: 4.5,
  employerPercentage: 8.5,
  minimumAmount: 100,
  maximumAmount: 2000,
  wageCeiling: 25000,
  wageFloor: 1000,
  effectiveFrom: '2024-01-01',
  isMandatory: true,
  displayOrder: 1,
  description: 'Social Security System contribution',
  regulatoryReference: 'SSS Act of 2018',
  isActive: true
};
```

### 3. Retrieving Components

```typescript
// Get all salary components for a country
const salaryComponents = await payrollApiService.getSalaryComponents('india-country-id', {
  page: 1,
  limit: 10,
  componentType: 'earnings',
  isActive: true
});

// Get all statutory components for a country
const statutoryComponents = await payrollApiService.getStatutoryComponents('india-country-id', {
  page: 1,
  limit: 10,
  componentType: 'epf',
  isActive: true
});

// Get active statutory components for a specific date
const activeComponents = await payrollApiService.getActiveStatutoryComponentsByDate(
  'india-country-id',
  '2024-06-01'
);
```

## Error Handling

### Common Error Scenarios

1. **Validation Errors**
   ```typescript
   try {
     await payrollApiService.createSalaryComponent(countryId, invalidData);
   } catch (error) {
     if (error.status === 400) {
       console.error('Validation failed:', error.response.data.details);
     }
   }
   ```

2. **Authorization Errors**
   ```typescript
   try {
     await payrollApiService.createSalaryComponent(countryId, data);
   } catch (error) {
     if (error.status === 403) {
       console.error('Insufficient permissions');
     }
   }
   ```

3. **Not Found Errors**
   ```typescript
   try {
     await payrollApiService.getSalaryComponent(countryId, 'non-existent-id');
   } catch (error) {
     if (error.status === 404) {
       console.error('Component not found');
     }
   }
   ```

## Testing Integration

### Unit Tests

```typescript
// Test salary component service
describe('SalaryComponentService', () => {
  it('should create salary component successfully', async () => {
    const createDto = { /* ... */ };
    const result = await salaryComponentService.create(createDto);
    expect(result).toBeDefined();
    expect(result.componentName).toBe(createDto.componentName);
  });
});
```

### Integration Tests

```typescript
// Test API endpoints
describe('SalaryComponentController Integration', () => {
  it('should create salary component via API', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/payroll/configuration/countries/country-id/salary-components')
      .send(validData)
      .expect(201);
    
    expect(response.body.componentName).toBe(validData.componentName);
  });
});
```

### Performance Tests

```typescript
// Test with large datasets
describe('SalaryComponentService Performance', () => {
  it('should handle large number of components efficiently', async () => {
    const startTime = Date.now();
    const result = await service.findByCountry('country-id', 1, 1000);
    const endTime = Date.now();
    
    expect(result.components).toHaveLength(1000);
    expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
  });
});
```

## Monitoring and Logging

### Application Logs

```typescript
// Service logging
this.logger.log(`Salary component created: ${component.componentName} (${component.componentCode}) for country ${component.countryId}`);
this.logger.error(`Failed to create salary component: ${error.message}`, error.stack);
```

### Metrics

```typescript
// Performance metrics
const metrics = {
  salaryComponentsCreated: 0,
  statutoryComponentsCreated: 0,
  averageResponseTime: 0,
  errorRate: 0
};
```

## Security Considerations

### Authentication
- All endpoints require JWT authentication
- Token validation on every request
- Token expiration handling

### Authorization
- Role-based access control
- Admin and HR roles for write operations
- EOR role for read-only access

### Data Validation
- Input validation on all endpoints
- SQL injection prevention through TypeORM
- XSS protection through proper encoding

### Rate Limiting
- 100 requests per minute for write operations
- 1000 requests per minute for read operations
- Per-user rate limiting

## Deployment Considerations

### Database Migrations
1. Run migrations in production
2. Verify data integrity
3. Test rollback procedures

### Environment Configuration
1. Set appropriate environment variables
2. Configure feature flags
3. Set up monitoring and logging

### Performance Optimization
1. Database indexing for large datasets
2. Caching for frequently accessed data
3. Pagination for large result sets

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check database credentials
   - Verify network connectivity
   - Check database server status

2. **Validation Errors**
   - Review input data format
   - Check required fields
   - Validate business rules

3. **Performance Issues**
   - Check database query performance
   - Review indexing strategy
   - Monitor memory usage

### Debug Tools

```typescript
// Enable debug logging
process.env.LOG_LEVEL = 'debug';

// Database query logging
TypeOrmModule.forRoot({
  logging: true,
  logger: 'advanced-console'
});
```

## Support and Maintenance

### Regular Maintenance
- Monitor performance metrics
- Review error logs
- Update business rules as needed
- Apply security patches

### Backup and Recovery
- Regular database backups
- Test recovery procedures
- Document rollback processes

### Documentation Updates
- Keep API documentation current
- Update integration guides
- Maintain troubleshooting guides
