import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsInt,
  IsDateString,
  MaxLength,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { 
  StatutoryComponentType, 
  ContributionType, 
  CalculationBasis 
} from '../entities/statutory-component.entity';

export class CreateStatutoryComponentDto {
  @ApiProperty({
    description: 'Country ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  countryId: string;

  @ApiProperty({
    description: 'Component name',
    example: 'Employee Provident Fund',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  componentName: string;

  @ApiProperty({
    description: 'Component code',
    example: 'EPF',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  componentCode: string;

  @ApiProperty({
    description: 'Component type',
    enum: StatutoryComponentType,
    example: StatutoryComponentType.EPF,
  })
  @IsEnum(StatutoryComponentType)
  componentType: StatutoryComponentType;

  @ApiProperty({
    description: 'Contribution type',
    enum: ContributionType,
    example: ContributionType.BOTH,
  })
  @IsEnum(ContributionType)
  contributionType: ContributionType;

  @ApiProperty({
    description: 'Calculation basis',
    enum: CalculationBasis,
    example: CalculationBasis.BASIC_SALARY,
  })
  @IsEnum(CalculationBasis)
  calculationBasis: CalculationBasis;

  @ApiPropertyOptional({
    description: 'Employee contribution percentage',
    example: 12.0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Employee percentage must be a valid number' })
  @Min(0, { message: 'Employee percentage must be greater than or equal to 0' })
  @Max(100, { message: 'Employee percentage must be less than or equal to 100' })
  @ValidateIf((o) => o.contributionType === ContributionType.EMPLOYEE || o.contributionType === ContributionType.BOTH)
  employeePercentage?: number;

  @ApiPropertyOptional({
    description: 'Employer contribution percentage',
    example: 12.0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Employer percentage must be a valid number' })
  @Min(0, { message: 'Employer percentage must be greater than or equal to 0' })
  @Max(100, { message: 'Employer percentage must be less than or equal to 100' })
  @ValidateIf((o) => o.contributionType === ContributionType.EMPLOYER || o.contributionType === ContributionType.BOTH)
  employerPercentage?: number;

  @ApiPropertyOptional({
    description: 'Minimum contribution amount',
    example: 100.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Minimum amount must be a valid number' })
  @Min(0, { message: 'Minimum amount must be greater than or equal to 0' })
  minimumAmount?: number;

  @ApiPropertyOptional({
    description: 'Maximum contribution amount',
    example: 10000.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Maximum amount must be a valid number' })
  @Min(0, { message: 'Maximum amount must be greater than or equal to 0' })
  maximumAmount?: number;

  @ApiPropertyOptional({
    description: 'Wage ceiling for calculation',
    example: 15000.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Wage ceiling must be a valid number' })
  @Min(0, { message: 'Wage ceiling must be greater than or equal to 0' })
  wageCeiling?: number;

  @ApiPropertyOptional({
    description: 'Wage floor for calculation',
    example: 1000.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Wage floor must be a valid number' })
  @Min(0, { message: 'Wage floor must be greater than or equal to 0' })
  wageFloor?: number;

  @ApiProperty({
    description: 'Effective from date',
    example: '2024-01-01',
  })
  @IsDateString()
  effectiveFrom: string;

  @ApiPropertyOptional({
    description: 'Effective to date (null for indefinite)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional({
    description: 'Whether this component is mandatory for all employees',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @ApiPropertyOptional({
    description: 'Display order in UI',
    example: 1,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Component description',
    example: 'Employee Provident Fund contribution',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Regulatory reference',
    example: 'EPF Act 1952',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  regulatoryReference?: string;

  @ApiPropertyOptional({
    description: 'Whether this component is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateStatutoryComponentDto {
  @ApiPropertyOptional({
    description: 'Component name',
    example: 'Employee Provident Fund',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  componentName?: string;

  @ApiPropertyOptional({
    description: 'Component code',
    example: 'EPF',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  componentCode?: string;

  @ApiPropertyOptional({
    description: 'Component type',
    enum: StatutoryComponentType,
    example: StatutoryComponentType.EPF,
  })
  @IsOptional()
  @IsEnum(StatutoryComponentType)
  componentType?: StatutoryComponentType;

  @ApiPropertyOptional({
    description: 'Contribution type',
    enum: ContributionType,
    example: ContributionType.BOTH,
  })
  @IsOptional()
  @IsEnum(ContributionType)
  contributionType?: ContributionType;

  @ApiPropertyOptional({
    description: 'Calculation basis',
    enum: CalculationBasis,
    example: CalculationBasis.BASIC_SALARY,
  })
  @IsOptional()
  @IsEnum(CalculationBasis)
  calculationBasis?: CalculationBasis;

  @ApiPropertyOptional({
    description: 'Employee contribution percentage',
    example: 12.0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Employee percentage must be a valid number' })
  @Min(0, { message: 'Employee percentage must be greater than or equal to 0' })
  @Max(100, { message: 'Employee percentage must be less than or equal to 100' })
  @ValidateIf((o) => o.contributionType === ContributionType.EMPLOYEE || o.contributionType === ContributionType.BOTH)
  employeePercentage?: number;

  @ApiPropertyOptional({
    description: 'Employer contribution percentage',
    example: 12.0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Employer percentage must be a valid number' })
  @Min(0, { message: 'Employer percentage must be greater than or equal to 0' })
  @Max(100, { message: 'Employer percentage must be less than or equal to 100' })
  @ValidateIf((o) => o.contributionType === ContributionType.EMPLOYER || o.contributionType === ContributionType.BOTH)
  employerPercentage?: number;

  @ApiPropertyOptional({
    description: 'Minimum contribution amount',
    example: 100.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Minimum amount must be a valid number' })
  @Min(0, { message: 'Minimum amount must be greater than or equal to 0' })
  minimumAmount?: number;

  @ApiPropertyOptional({
    description: 'Maximum contribution amount',
    example: 10000.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Maximum amount must be a valid number' })
  @Min(0, { message: 'Maximum amount must be greater than or equal to 0' })
  maximumAmount?: number;

  @ApiPropertyOptional({
    description: 'Wage ceiling for calculation',
    example: 15000.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Wage ceiling must be a valid number' })
  @Min(0, { message: 'Wage ceiling must be greater than or equal to 0' })
  wageCeiling?: number;

  @ApiPropertyOptional({
    description: 'Wage floor for calculation',
    example: 1000.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Wage floor must be a valid number' })
  @Min(0, { message: 'Wage floor must be greater than or equal to 0' })
  wageFloor?: number;

  @ApiPropertyOptional({
    description: 'Effective from date',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @ApiPropertyOptional({
    description: 'Effective to date (null for indefinite)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional({
    description: 'Whether this component is mandatory for all employees',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @ApiPropertyOptional({
    description: 'Display order in UI',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Component description',
    example: 'Employee Provident Fund contribution',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Regulatory reference',
    example: 'EPF Act 1952',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  regulatoryReference?: string;

  @ApiPropertyOptional({
    description: 'Whether this component is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class StatutoryComponentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  countryId: string;

  @ApiProperty()
  componentName: string;

  @ApiProperty()
  componentCode: string;

  @ApiProperty({ enum: StatutoryComponentType })
  componentType: StatutoryComponentType;

  @ApiProperty({ enum: ContributionType })
  contributionType: ContributionType;

  @ApiProperty({ enum: CalculationBasis })
  calculationBasis: CalculationBasis;

  @ApiPropertyOptional()
  employeePercentage?: number;

  @ApiPropertyOptional()
  employerPercentage?: number;

  @ApiPropertyOptional()
  minimumAmount?: number;

  @ApiPropertyOptional()
  maximumAmount?: number;

  @ApiPropertyOptional()
  wageCeiling?: number;

  @ApiPropertyOptional()
  wageFloor?: number;

  @ApiProperty()
  effectiveFrom: Date;

  @ApiPropertyOptional()
  effectiveTo?: Date;

  @ApiProperty()
  isMandatory: boolean;

  @ApiProperty()
  displayOrder: number;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  regulatoryReference?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class StatutoryComponentListResponseDto {
  @ApiProperty({ type: [StatutoryComponentResponseDto] })
  components: StatutoryComponentResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
