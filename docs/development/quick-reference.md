# Quick Reference Guide

This guide provides quick access to common patterns and solutions for the Teamified EOR Portal project.

## Common Patterns

### Controller Setup
```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Feature Name')
@Controller('v1/feature-name') // ✅ Use 'v1/' NOT 'api/v1/'
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FeatureController {
  @Post()
  @Roles('admin', 'hr')
  async create(@Body() dto: CreateFeatureDto) {
    // implementation
  }
}
```

### Module Setup
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module'; // ✅ REQUIRED for auth guards
import { FeatureEntity } from './entities/feature.entity';
import { FeatureService } from './services/feature.service';
import { FeatureController } from './controllers/feature.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeatureEntity]),
    AuthModule, // ✅ CRITICAL: Required when controllers use auth guards
  ],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],
})
export class FeatureModule {}
```

### Import Paths

#### ✅ Correct Import Paths
```typescript
// Authentication guards and decorators
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// Auth module
import { AuthModule } from '../auth/auth.module';
```

#### ❌ Incorrect Import Paths
```typescript
// Don't import from auth directory
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
```

### DTO Validation Patterns

#### ✅ Correct Validation
```typescript
import { IsUUID, IsNumber, IsString, IsDateString, Min, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFeatureDto {
  @IsUUID(4, { message: 'ID must be a valid UUID' })
  id: string;

  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsString()
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  name: string;

  @IsDateString({}, { message: 'Date must be a valid date string' })
  effectiveDate: string;
}
```

#### ❌ Problematic Validation
```typescript
// Avoid overly restrictive decorators
@IsDecimal({ decimal_digits: '0,2' }, { message: 'Too restrictive' })
amount: number; // This will fail with simple numbers like 1000
```

### Service Patterns

#### Date Handling
```typescript
// ✅ Correct date handling in services
async create(createDto: CreateFeatureDto) {
  const effectiveDate = new Date(createDto.effectiveDate); // Convert string to Date
  
  // Use Date object for comparisons
  const maxFutureDate = new Date();
  maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
  
  if (effectiveDate > maxFutureDate) {
    throw new BadRequestException('Date cannot be more than 1 year in the future');
  }
  
  // Use Date object in database queries
  const existing = await this.repository.findOne({
    where: { effectiveDate: effectiveDate }
  });
}
```

#### Error Handling
```typescript
// ✅ Proper error handling
try {
  const result = await this.repository.save(entity);
  this.logger.log(`Feature created with ID ${result.id}`);
  return result;
} catch (error) {
  this.logger.error(`Failed to create feature: ${error.message}`, error.stack);
  throw new InternalServerErrorException('Failed to create feature');
}
```

### Entity Patterns

#### Basic Entity Structure
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity('feature_table')
@Index(['frequentlyQueriedField'])
@Unique('unique_constraint_name', ['field1', 'field2'])
export class FeatureEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'field_name', type: 'varchar', length: 100, nullable: true })
  fieldName: string | null;

  @Column({ name: 'amount', type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

### API Documentation Patterns

#### Swagger Authentication Pattern
```typescript
// ✅ CORRECT - Always use @ApiBearerAuth() without parameters
@ApiBearerAuth()

// ❌ INCORRECT - Don't use parameters for consistency
@ApiBearerAuth('JWT-auth')
```

#### Controller Documentation
```typescript
@ApiTags('Feature Name')
@Controller('v1/feature-name')
@ApiBearerAuth() // CRITICAL: Always use without parameters
export class FeatureController {
  @Post()
  @ApiOperation({
    summary: 'Create feature',
    description: 'Create a new feature with validation',
  })
  @ApiResponse({
    status: 201,
    description: 'Feature created successfully',
    type: FeatureResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async create(@Body() dto: CreateFeatureDto) {
    // implementation
  }
}
```

## Common Issues & Solutions

### Issue: Routes Return 404
**Problem**: Controller routes not accessible
**Common Causes**:
- Wrong route prefix (`api/v1/` instead of `v1/`)
- Module not imported in AppModule
- Controller not declared in module

**Solution**:
```typescript
// ✅ Correct
@Controller('v1/feature-name')

// ❌ Incorrect
@Controller('api/v1/feature-name')
```

### Issue: Authentication Errors
**Problem**: "JwtTokenService not available" or "Cannot resolve dependencies"
**Common Causes**:
- Missing `AuthModule` import in feature module
- Wrong import paths for auth guards

**Solution**:
```typescript
// ✅ Correct module setup
@Module({
  imports: [
    TypeOrmModule.forFeature([Entity]),
    AuthModule, // Required for JWT guards
  ],
})

// ✅ Correct imports
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
```

### Issue: DTO Validation Failures
**Problem**: Valid data rejected by validation
**Common Causes**:
- Overly restrictive validation decorators
- Wrong data types in DTOs

**Solution**:
```typescript
// ✅ Use appropriate validation
@IsNumber({}, { message: 'Must be a valid number' })
amount: number;

// ❌ Avoid overly restrictive validation
@IsDecimal({ decimal_digits: '0,2' })
amount: number;
```

### Issue: Date Comparison Errors
**Problem**: TypeScript errors when comparing dates
**Common Causes**:
- Comparing string dates with Date objects
- Not converting DTO date strings to Date objects

**Solution**:
```typescript
// ✅ Convert string to Date object
const effectiveDate = new Date(createDto.effectiveDate);
if (effectiveDate > someDate) {
  // comparison works
}
```

## Testing Patterns

### Controller Testing
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';

describe('FeatureController', () => {
  let controller: FeatureController;
  let service: FeatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeatureController],
      providers: [
        {
          provide: FeatureService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FeatureController>(FeatureController);
    service = module.get<FeatureService>(FeatureService);
  });

  it('should create a feature', async () => {
    const createDto = { name: 'Test', amount: 100 };
    const expectedResult = { id: '1', ...createDto };
    
    jest.spyOn(service, 'create').mockResolvedValue(expectedResult);
    
    const result = await controller.create(createDto);
    expect(result).toEqual(expectedResult);
    expect(service.create).toHaveBeenCalledWith(createDto);
  });
});
```

### Service Testing
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureService } from './feature.service';
import { FeatureEntity } from './entities/feature.entity';

describe('FeatureService', () => {
  let service: FeatureService;
  let repository: Repository<FeatureEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureService,
        {
          provide: getRepositoryToken(FeatureEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FeatureService>(FeatureService);
    repository = module.get<Repository<FeatureEntity>>(getRepositoryToken(FeatureEntity));
  });

  it('should create a feature', async () => {
    const createDto = { name: 'Test', amount: 100 };
    const entity = new FeatureEntity();
    entity.id = '1';
    entity.name = createDto.name;
    entity.amount = createDto.amount;

    jest.spyOn(repository, 'create').mockReturnValue(entity);
    jest.spyOn(repository, 'save').mockResolvedValue(entity);

    const result = await service.create(createDto);
    expect(result).toEqual(entity);
    expect(repository.create).toHaveBeenCalledWith(createDto);
    expect(repository.save).toHaveBeenCalledWith(entity);
  });
});
```

## Debugging Tips

### Check Route Mapping
```bash
# Look for route mapping in backend logs
docker-compose -f docker-compose.dev.yml logs backend | grep -i "RoutesResolver\|RouterExplorer"
```

### Check Module Dependencies
```bash
# Look for dependency resolution errors
docker-compose -f docker-compose.dev.yml logs backend | grep -i "cannot resolve dependencies"
```

### Test API Endpoints
```bash
# Test with curl
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/feature-name
```

### Check Database Schema
```bash
# Connect to database
docker exec teamified_postgres_dev psql -U postgres -d teamified_portal

# Check tables
\dt

# Check specific table structure
\d table_name
```

---

**Remember**: Always refer to this guide when implementing new features to avoid common pitfalls and ensure consistency across the project.

**Last Updated**: 2025-09-12  
**Version**: 1.0
