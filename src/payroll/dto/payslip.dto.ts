import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsEnum, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for generating payslip from Story 7.3 calculation result
 */
export class GeneratePayslipDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Country ID' })
  @IsUUID()
  countryId: string;

  @ApiProperty({ description: 'Payroll period ID' })
  @IsUUID()
  payrollPeriodId: string;

  @ApiProperty({ description: 'Story 7.3 calculation ID' })
  calculationId: string;
}

/**
 * DTO for bulk payslip generation
 */
export class BulkGeneratePayslipDto {
  @ApiProperty({ description: 'Payroll period ID' })
  @IsUUID()
  payrollPeriodId: string;

  @ApiProperty({ description: 'Country ID' })
  @IsUUID()
  countryId: string;

  @ApiProperty({ description: 'User IDs to generate payslips for', type: [String] })
  @IsUUID('4', { each: true })
  userIds: string[];
}

/**
 * DTO for payslip response
 */
export class PayslipResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  countryId: string;

  @ApiProperty()
  payrollPeriodId: string;

  @ApiProperty()
  calculationId: string;

  @ApiProperty()
  calculatedAt: Date;

  @ApiProperty()
  grossPay: number;

  @ApiProperty()
  basicSalary: number;

  @ApiProperty()
  totalEarnings: number;

  @ApiProperty({ required: false })
  overtimePay?: number;

  @ApiProperty({ required: false })
  nightShiftPay?: number;

  @ApiProperty()
  totalStatutoryDeductions: number;

  @ApiProperty()
  totalOtherDeductions: number;

  @ApiProperty()
  totalDeductions: number;

  @ApiProperty()
  netPay: number;

  @ApiProperty()
  currencyCode: string;

  @ApiProperty()
  salaryComponents: any[];

  @ApiProperty()
  statutoryDeductions: any[];

  @ApiProperty()
  otherDeductions: any[];

  @ApiProperty({ required: false })
  metadata?: any;

  @ApiProperty({ enum: ['draft', 'processing', 'available', 'downloaded'] })
  status: string;

  @ApiProperty({ required: false })
  pdfPath?: string;

  @ApiProperty({ required: false })
  pdfGeneratedAt?: Date;

  @ApiProperty({ required: false })
  firstDownloadedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

/**
 * DTO for payslip list query
 */
export class PayslipListQueryDto {
  @ApiProperty({ description: 'Payroll period ID', required: false })
  @IsOptional()
  @IsUUID()
  payrollPeriodId?: string;

  @ApiProperty({ description: 'Country ID', required: false })
  @IsOptional()
  @IsUUID()
  countryId?: string;

  @ApiProperty({ 
    description: 'Payslip status', 
    enum: ['draft', 'processing', 'available', 'downloaded'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['draft', 'processing', 'available', 'downloaded'])
  status?: 'draft' | 'processing' | 'available' | 'downloaded';

  @ApiProperty({ description: 'From date', required: false })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({ description: 'To date', required: false })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({ description: 'Page number for pagination', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ description: 'Items per page', required: false, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

/**
 * DTO for tax document upload
 */
export class UploadTaxDocumentDto {
  @ApiProperty({ description: 'Document type', example: 'TAX_DOCUMENT' })
  documentType: string;

  @ApiProperty({ description: 'Tax document category', example: 'TDS_PROOF' })
  category: string;

  @ApiProperty({ description: 'Tax year', example: '2024-2025' })
  taxYear: string;

  @ApiProperty({ description: 'Country code', example: 'IN' })
  countryCode: string;
}

/**
 * DTO for tax document status update
 */
export class UpdateTaxDocumentStatusDto {
  @ApiProperty({ description: 'Document status', enum: ['pending', 'approved', 'rejected'] })
  @IsEnum(['pending', 'approved', 'rejected'])
  status: 'pending' | 'approved' | 'rejected';

  @ApiProperty({ description: 'Review notes', required: false })
  @IsOptional()
  reviewNotes?: string;
}

