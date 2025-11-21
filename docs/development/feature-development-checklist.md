# Feature Development Checklist

This checklist ensures that new features are implemented correctly and avoid common pitfalls that can cause compilation errors, routing issues, and authentication problems.

## Pre-Implementation Checklist

### Route Configuration
- [ ] **Controller route prefix uses `v1/` NOT `api/`**
  - ✅ Correct: `@Controller('v1/feature-name')`
  - ❌ Incorrect: `@Controller('api/feature-name')` or `@Controller('api/v1/feature-name')`

### Authentication Setup
- [ ] **Auth guards and decorators import from `../../common/`**
  - ✅ Correct: `import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';`
  - ❌ Incorrect: `import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';`

- [ ] **Feature module imports `AuthModule` if using authentication**
  - ✅ Correct: `imports: [TypeOrmModule.forFeature([Entity]), AuthModule]`
  - ❌ Incorrect: Missing `AuthModule` when controllers use `JwtAuthGuard` or `RolesGuard`

### DTO Validation
- [ ] **Use appropriate validation decorators for data types**
  - ✅ Correct: `@IsNumber({}, { message: 'Amount must be a valid number' })`
  - ❌ Incorrect: `@IsDecimal({ decimal_digits: '0,2' })` (too restrictive)

- [ ] **Include proper error messages for validation**
  - ✅ Correct: `@IsUUID(4, { message: 'ID must be a valid UUID' })`
  - ❌ Incorrect: No custom error messages

### Module Structure
- [ ] **All required imports are present**
  - [ ] TypeORM module for entities
  - [ ] AuthModule if using authentication
  - [ ] Other feature modules as needed

- [ ] **Controllers and services are properly declared**
  - [ ] Controllers in `controllers` array
  - [ ] Services in `providers` array
  - [ ] Services exported if needed by other modules

## Implementation Phase

### Controller Implementation
- [ ] **Proper Swagger documentation**
  - [ ] `@ApiTags()` decorator
  - [ ] `@ApiBearerAuth()` for authenticated endpoints
  - [ ] `@ApiOperation()` for each endpoint
  - [ ] `@ApiResponse()` for success and error cases

- [ ] **Role-based access control**
  - [ ] `@Roles()` decorator specifies required roles
  - [ ] Guards properly applied (`JwtAuthGuard`, `RolesGuard`)

- [ ] **Input validation**
  - [ ] `@UsePipes(new ValidationPipe({ whitelist: true }))`
  - [ ] DTOs properly validated

### Service Implementation
- [ ] **Error handling**
  - [ ] Try-catch blocks for database operations
  - [ ] Appropriate NestJS exceptions thrown
  - [ ] Logging for debugging

- [ ] **Type safety**
  - [ ] Proper TypeScript types
  - [ ] Date handling (convert strings to Date objects)
  - [ ] UUID validation

### Entity Implementation
- [ ] **Database constraints**
  - [ ] Proper indexes for frequently queried fields
  - [ ] Unique constraints where needed
  - [ ] Check constraints for business rules

- [ ] **Relationships**
  - [ ] Proper foreign key relationships
  - [ ] Cascade options configured correctly

## Post-Implementation Verification

### Build and Compilation
- [ ] **No TypeScript compilation errors**
  - [ ] All imports resolve correctly
  - [ ] Type definitions are correct
  - [ ] No missing dependencies

- [ ] **No runtime dependency errors**
  - [ ] All modules can be instantiated
  - [ ] No "Cannot resolve dependencies" errors

### Route Testing
- [ ] **All routes are mapped and accessible**
  - [ ] Routes appear in NestJS startup logs
  - [ ] Routes respond correctly to HTTP requests
  - [ ] Authentication works on protected routes

### API Testing
- [ ] **Authentication works correctly**
  - [ ] JWT tokens are validated
  - [ ] Role-based access control functions
  - [ ] Unauthorized requests are rejected

- [ ] **DTO validation works**
  - [ ] Valid data is accepted
  - [ ] Invalid data is rejected with appropriate errors
  - [ ] Error messages are clear and helpful

### Database Testing
- [ ] **Database operations work**
  - [ ] CRUD operations function correctly
  - [ ] Relationships are properly handled
  - [ ] Constraints are enforced

### Documentation Testing
- [ ] **API documentation is updated**
  - [ ] New endpoints appear in Swagger UI
  - [ ] Request/response examples are accurate
  - [ ] Error responses are documented

## Common Issues to Avoid

### Route Prefix Issues
**Problem**: Using `@Controller('api/v1/feature')` instead of `@Controller('v1/feature')`
**Symptom**: Routes return 404 errors
**Solution**: Change controller decorator to use `v1/` prefix only

### Authentication Import Issues
**Problem**: Importing auth components from `../../auth/` instead of `../../common/`
**Symptom**: "Cannot find module" compilation errors
**Solution**: Update import paths to use `../../common/guards/` and `../../common/decorators/`

### Missing AuthModule Import
**Problem**: Controllers use `JwtAuthGuard` but module doesn't import `AuthModule`
**Symptom**: "JwtTokenService not available" runtime errors
**Solution**: Add `AuthModule` to module imports array

### DTO Validation Issues
**Problem**: Using overly restrictive validation decorators like `@IsDecimal({ decimal_digits: '0,2' })`
**Symptom**: Valid data is rejected during API calls
**Solution**: Use appropriate decorators like `@IsNumber()` for numeric validation

### Date Handling Issues
**Problem**: Comparing string dates with Date objects in services
**Symptom**: TypeScript compilation errors or runtime type errors
**Solution**: Convert string dates to Date objects using `new Date(dateString)`

## Testing Checklist

### Unit Tests
- [ ] **Service methods tested**
  - [ ] Success cases
  - [ ] Error cases
  - [ ] Edge cases

- [ ] **Controller endpoints tested**
  - [ ] Authentication requirements
  - [ ] Input validation
  - [ ] Response formatting

### Integration Tests
- [ ] **API endpoints tested end-to-end**
  - [ ] Database operations work
  - [ ] Authentication flows correctly
  - [ ] Error handling works

### Manual Testing
- [ ] **Swagger UI testing**
  - [ ] All endpoints accessible
  - [ ] Request/response examples work
  - [ ] Authentication flows correctly

- [ ] **Frontend integration**
  - [ ] API calls work from frontend
  - [ ] Error handling displays correctly
  - [ ] Loading states work properly

## Deployment Checklist

### Database Changes
- [ ] **Migrations created if needed**
  - [ ] New tables/columns added
  - [ ] Indexes created
  - [ ] Constraints added

- [ ] **Seed data updated**
  - [ ] New entities included in seed scripts
  - [ ] Test data created for new features

### Documentation Updates
- [ ] **API documentation updated**
  - [ ] New endpoints documented
  - [ ] Swagger tags added
  - [ ] Examples provided

- [ ] **README updated if needed**
  - [ ] New features documented
  - [ ] Setup instructions updated

---

**Remember**: This checklist should be used for every new feature implementation to ensure consistency and prevent common issues that can cause delays and bugs.

**Last Updated**: 2025-09-12  
**Version**: 1.0
