import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsInt,
  MaxLength,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { SalaryComponentType, CalculationType } from '../entities/salary-component.entity';

export class CreateSalaryComponentDto {
  @ApiProperty({
    description: 'Country ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  countryId: string;

  @ApiProperty({
    description: 'Component name',
    example: 'Basic Salary',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  componentName: string;

  @ApiProperty({
    description: 'Component code',
    example: 'BASIC',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  componentCode: string;

  @ApiProperty({
    description: 'Component type',
    enum: SalaryComponentType,
    example: SalaryComponentType.EARNINGS,
  })
  @IsEnum(SalaryComponentType)
  componentType: SalaryComponentType;

  @ApiProperty({
    description: 'Calculation type',
    enum: CalculationType,
    example: CalculationType.FIXED_AMOUNT,
  })
  @IsEnum(CalculationType)
  calculationType: CalculationType;

  @ApiPropertyOptional({
    description: 'Calculation value (for fixed amounts or percentages)',
    example: 50000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Calculation value must be a valid number' })
  @Min(0, { message: 'Calculation value must be greater than or equal to 0' })
  @ValidateIf((o) => o.calculationType !== CalculationType.FORMULA)
  calculationValue?: number;

  @ApiPropertyOptional({
    description: 'Calculation formula (for formula-based calculations)',
    example: 'BASIC * 0.4',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ValidateIf((o) => o.calculationType === CalculationType.FORMULA)
  calculationFormula?: string;

  @ApiPropertyOptional({
    description: 'Whether this component is taxable',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this is a statutory component',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isStatutory?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this component is mandatory for all employees',
    example: false,
    default: false,
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
    example: 'Basic salary component',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether this component is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSalaryComponentDto {
  @ApiPropertyOptional({
    description: 'Component name',
    example: 'Basic Salary',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  componentName?: string;

  @ApiPropertyOptional({
    description: 'Component code',
    example: 'BASIC',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  componentCode?: string;

  @ApiPropertyOptional({
    description: 'Component type',
    enum: SalaryComponentType,
    example: SalaryComponentType.EARNINGS,
  })
  @IsOptional()
  @IsEnum(SalaryComponentType)
  componentType?: SalaryComponentType;

  @ApiPropertyOptional({
    description: 'Calculation type',
    enum: CalculationType,
    example: CalculationType.FIXED_AMOUNT,
  })
  @IsOptional()
  @IsEnum(CalculationType)
  calculationType?: CalculationType;

  @ApiPropertyOptional({
    description: 'Calculation value (for fixed amounts or percentages)',
    example: 50000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Calculation value must be a valid number' })
  @Min(0, { message: 'Calculation value must be greater than or equal to 0' })
  @ValidateIf((o) => o.calculationType !== CalculationType.FORMULA)
  calculationValue?: number;

  @ApiPropertyOptional({
    description: 'Calculation formula (for formula-based calculations)',
    example: 'BASIC * 0.4',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ValidateIf((o) => o.calculationType === CalculationType.FORMULA)
  calculationFormula?: string;

  @ApiPropertyOptional({
    description: 'Whether this component is taxable',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this is a statutory component',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isStatutory?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this component is mandatory for all employees',
    example: false,
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
    example: 'Basic salary component',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether this component is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SalaryComponentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  countryId: string;

  @ApiProperty()
  componentName: string;

  @ApiProperty()
  componentCode: string;

  @ApiProperty({ enum: SalaryComponentType })
  componentType: SalaryComponentType;

  @ApiProperty({ enum: CalculationType })
  calculationType: CalculationType;

  @ApiPropertyOptional()
  calculationValue?: number;

  @ApiPropertyOptional()
  calculationFormula?: string;

  @ApiProperty()
  isTaxable: boolean;

  @ApiProperty()
  isStatutory: boolean;

  @ApiProperty()
  isMandatory: boolean;

  @ApiProperty()
  displayOrder: number;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class SalaryComponentListResponseDto {
  @ApiProperty({ type: [SalaryComponentResponseDto] })
  components: SalaryComponentResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
