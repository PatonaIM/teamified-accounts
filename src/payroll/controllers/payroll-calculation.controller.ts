import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PayrollCalculationService } from '../services/payroll-calculation.service';
import {
  CalculatePayrollDto,
  BulkCalculatePayrollDto,
  PayrollCalculationResponse,
  BulkPayrollCalculationResponse,
} from '../dto/payroll-calculation.dto';

/**
 * Payroll Calculation Controller
 * Handles payroll calculation requests for employees
 * 
 * @note Controller path should NOT include 'api' prefix - it's added globally in main.ts
 * @note Pattern: @Controller('v1/module/resource') → Results in /api/v1/module/resource
 */
@ApiTags('Payroll Calculation')
@Controller('v1/payroll/calculations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PayrollCalculationController {
  constructor(
    private readonly payrollCalculationService: PayrollCalculationService,
  ) {}

  /**
   * Calculate payroll for a single employee
   */
  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'hr', 'payroll_admin')
  @ApiOperation({
    summary: 'Calculate payroll for a single employee',
    description:
      'Calculates gross pay, statutory deductions, and net pay for a single employee ' +
      'based on their salary components, statutory requirements, and payroll period. ' +
      'Supports India (EPF, ESI, PT, TDS) and Philippines (SSS, PhilHealth, Pag-IBIG, Withholding Tax).',
  })
  @ApiResponse({
    status: 200,
    description: 'Payroll calculation completed successfully',
    type: PayrollCalculationResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters or missing required data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to perform calculation',
  })
  @ApiResponse({
    status: 404,
    description: 'Country, payroll period, or user not found',
  })
  async calculatePayroll(
    @Body() calculatePayrollDto: CalculatePayrollDto,
    @Request() req: any,
  ): Promise<PayrollCalculationResponse> {
    // Validate calculation access
    await this.payrollCalculationService.validateCalculationAccess(
      calculatePayrollDto.userId,
      req.user.userId,
      req.user.role,
    );

    return await this.payrollCalculationService.calculatePayroll(
      calculatePayrollDto,
    );
  }

  /**
   * Calculate payroll for multiple employees in bulk
   */
  @Post('bulk-calculate')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'hr', 'payroll_admin')
  @ApiOperation({
    summary: 'Calculate payroll for multiple employees in bulk',
    description:
      'Performs payroll calculations for multiple employees in parallel. ' +
      'Returns both successful calculations and any failures with error details. ' +
      'Useful for processing entire payroll periods efficiently.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk payroll calculation completed',
    type: BulkPayrollCalculationResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async calculateBulkPayroll(
    @Body() bulkCalculatePayrollDto: BulkCalculatePayrollDto,
    @Request() req: any,
  ): Promise<BulkPayrollCalculationResponse> {
    // Only admin and HR can perform bulk calculations
    const allowedRoles = ['admin', 'hr', 'payroll_admin'];
    if (!allowedRoles.includes(req.user.role.toLowerCase())) {
      throw new Error('Insufficient permissions for bulk payroll calculation');
    }

    return await this.payrollCalculationService.calculateBulkPayroll(
      bulkCalculatePayrollDto,
    );
  }

  /**
   * Get calculation summary for a payroll period
   */
  @Get('summary/country/:countryId/period/:periodId')
  @Roles('admin', 'hr', 'payroll_admin')
  @ApiOperation({
    summary: 'Get payroll calculation summary for a payroll period',
    description:
      'Returns aggregated payroll statistics for a specific country and payroll period, ' +
      'including total employees processed, total gross pay, total deductions, and total net pay.',
  })
  @ApiParam({
    name: 'countryId',
    description: 'Country UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'periodId',
    description: 'Payroll period UUID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({
    status: 200,
    description: 'Calculation summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalEmployees: { type: 'number', example: 150 },
        totalGrossPay: { type: 'number', example: 7500000 },
        totalStatutoryDeductions: { type: 'number', example: 1125000 },
        totalNetPay: { type: 'number', example: 6375000 },
        currencyCode: { type: 'string', example: 'INR' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Country or payroll period not found',
  })
  async getCalculationSummary(
    @Param('countryId') countryId: string,
    @Param('periodId') periodId: string,
  ): Promise<any> {
    return await this.payrollCalculationService.getCalculationSummary(
      countryId,
      periodId,
    );
  }

  /**
   * Calculate payroll for the current user (self-service)
   */
  @Post('calculate-self')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'hr', 'payroll_admin', 'eor', 'client')
  @ApiOperation({
    summary: 'Calculate own payroll (self-service)',
    description:
      'Allows employees to calculate their own payroll for a specific period. ' +
      'Useful for payroll preview and transparency.',
  })
  @ApiQuery({
    name: 'countryId',
    description: 'Country UUID',
    required: true,
  })
  @ApiQuery({
    name: 'periodId',
    description: 'Payroll period UUID',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Self payroll calculation completed successfully',
    type: PayrollCalculationResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async calculateSelfPayroll(
    @Query('countryId') countryId: string,
    @Query('periodId') periodId: string,
    @Request() req: any,
  ): Promise<PayrollCalculationResponse> {
    const calculateDto: CalculatePayrollDto = {
      countryId,
      userId: req.user.userId,
      payrollPeriodId: periodId,
    };

    return await this.payrollCalculationService.calculatePayroll(calculateDto);
  }
}

