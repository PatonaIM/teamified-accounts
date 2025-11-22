import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
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
import { PayslipStorageService } from '../services/payslip-storage.service';
import { PayrollCalculationService } from '../services/payroll-calculation.service';
import {
  GeneratePayslipDto,
  PayslipResponseDto,
  PayslipListQueryDto,
} from '../dto/payslip.dto';

/**
 * Payslip Controller
 * Handles payslip storage and retrieval (calculations come from Story 7.3)
 */
@ApiTags('Payslips')
@Controller('v1/payroll/payslips')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PayslipController {
  constructor(
    private readonly payslipStorageService: PayslipStorageService,
    private readonly payrollCalculationService: PayrollCalculationService,
  ) {}

  /**
   * Generate and save payslip from Story 7.3 calculation
   * Admin/HR only
   */
  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin', 'hr', 'payroll_admin')
  @ApiOperation({
    summary: 'Generate and save payslip',
    description:
      'Generates payslip using Story 7.3 calculation engine and saves it for employee access',
  })
  @ApiResponse({
    status: 201,
    description: 'Payslip generated and saved successfully',
    type: PayslipResponseDto,
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
    description: 'Insufficient permissions',
  })
  async generatePayslip(
    @Body() generateDto: GeneratePayslipDto,
  ): Promise<PayslipResponseDto> {
    // Calculate payroll using Story 7.3 service
    const calculationResult = await this.payrollCalculationService.calculatePayroll({
      userId: generateDto.userId,
      countryId: generateDto.countryId,
      payrollPeriodId: generateDto.payrollPeriodId,
    });

    // Save calculation result as payslip
    const payslip = await this.payslipStorageService.saveCalculationResult(
      calculationResult.result,
    );

    // Mark as available
    await this.payslipStorageService.markAvailable(payslip.id);

    return payslip as PayslipResponseDto;
  }

  /**
   * Preview payslip without saving (employee self-service)
   * Uses Story 7.3 /calculate-self endpoint
   */
  @Get('preview')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'hr', 'payroll_admin', 'eor', 'candidate')
  @ApiOperation({
    summary: 'Preview payslip (self-service)',
    description:
      'Preview payslip calculation without saving (uses Story 7.3 calculate-self)',
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
    description: 'Payslip preview generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async previewPayslip(
    @Query('countryId') countryId: string,
    @Query('periodId') periodId: string,
    @Request() req: any,
  ): Promise<any> {
    // Use Story 7.3 calculate-self endpoint (preview mode)
    const calculationResult = await this.payrollCalculationService.calculatePayroll({
      userId: req.user.sub,
      countryId,
      payrollPeriodId: periodId,
    });

    return calculationResult;
  }

  /**
   * List employee payslips
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'hr', 'payroll_admin', 'eor', 'candidate')
  @ApiOperation({
    summary: 'List employee payslips',
    description: 'Get list of payslips for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Payslips retrieved successfully',
    type: [PayslipResponseDto],
  })
  async listPayslips(
    @Query() query: PayslipListQueryDto,
    @Request() req: any,
  ): Promise<PayslipResponseDto[]> {
    const userId = req.user.sub;
    const payslips = await this.payslipStorageService.findByUser(userId, query);
    return payslips as PayslipResponseDto[];
  }

  /**
   * Get single payslip by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'hr', 'payroll_admin', 'eor', 'candidate')
  @ApiOperation({
    summary: 'Get payslip by ID',
    description: 'Get detailed payslip information',
  })
  @ApiParam({
    name: 'id',
    description: 'Payslip UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Payslip retrieved successfully',
    type: PayslipResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Payslip not found',
  })
  async getPayslip(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<PayslipResponseDto> {
    const payslip = await this.payslipStorageService.findOne(id);

    // Security: employees can only view their own payslips
    const userRoles = req.user.roles || [];
    const isAdminOrHR = userRoles.some((role: string) =>
      ['admin', 'hr', 'payroll_admin'].includes(role),
    );

    if (!isAdminOrHR && payslip.userId !== req.user.sub) {
      throw new NotFoundException(`Payslip with ID ${id} not found`);
    }

    return payslip as PayslipResponseDto;
  }

  /**
   * Download payslip PDF
   */
  @Get(':id/download')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'hr', 'payroll_admin', 'eor', 'candidate')
  @ApiOperation({
    summary: 'Download payslip PDF',
    description: 'Download payslip as PDF document',
  })
  @ApiParam({
    name: 'id',
    description: 'Payslip UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Payslip PDF download URL',
  })
  @ApiResponse({
    status: 404,
    description: 'Payslip not found',
  })
  async downloadPayslip(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ downloadUrl: string }> {
    const payslip = await this.payslipStorageService.findOne(id);

    // Security: employees can only download their own payslips
    const userRoles = req.user.roles || [];
    const isAdminOrHR = userRoles.some((role: string) =>
      ['admin', 'hr', 'payroll_admin'].includes(role),
    );

    if (!isAdminOrHR && payslip.userId !== req.user.sub) {
      throw new NotFoundException(`Payslip with ID ${id} not found`);
    }

    // Mark as downloaded
    await this.payslipStorageService.markDownloaded(id);

    // TODO: Implement actual PDF generation and signed URL
    // For now, return placeholder
    return {
      downloadUrl: `/api/v1/payroll/payslips/${id}/pdf`,
    };
  }
}

