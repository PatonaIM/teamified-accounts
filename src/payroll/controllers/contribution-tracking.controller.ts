import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ContributionTrackingService } from '../services/contribution-tracking.service';
import {
  YtdContributionQueryDto,
  ContributionHistoryQueryDto,
  ContributionSummaryResponseDto,
  ContributionHistoryResponseDto,
  ContributionComparisonQueryDto,
  ContributionComparisonResponseDto,
} from '../dto/contribution-tracking.dto';
import { StatutoryBreakdown } from '../dto/payroll-calculation.dto';

@ApiTags('Contribution Tracking')
@Controller('v1/payroll/contributions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContributionTrackingController {
  constructor(
    private readonly contributionTrackingService: ContributionTrackingService,
  ) {}

  /**
   * Get YTD contribution summary for the authenticated employee
   */
  @Get('ytd-summary')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'hr', 'payroll_admin', 'eor', 'candidate')
  @ApiOperation({
    summary: 'Get YTD contribution summary',
    description:
      'Retrieves year-to-date contribution summary for the authenticated employee, ' +
      'aggregated from saved payslips. Shows total employee and employer contributions by type.',
  })
  @ApiResponse({
    status: 200,
    description: 'YTD contribution summary retrieved successfully.',
    type: ContributionSummaryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No payslips found for the specified period' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getYtdSummary(
    @Query() queryDto: YtdContributionQueryDto,
    @Request() req: any,
  ): Promise<ContributionSummaryResponseDto> {
    const userId = req.user.sub;
    const { countryId, startDate, endDate } = queryDto;

    const summary = await this.contributionTrackingService.getYtdContributionSummary(
      userId,
      countryId,
      new Date(startDate),
      new Date(endDate),
    );

    return summary as ContributionSummaryResponseDto;
  }

  /**
   * Get current year contribution summary (convenience endpoint)
   */
  @Get('current-year/:countryId')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'hr', 'payroll_admin', 'eor', 'candidate')
  @ApiOperation({
    summary: 'Get current year contribution summary',
    description:
      'Retrieves contribution summary for the current calendar year. ' +
      'Convenience endpoint that automatically sets start/end dates to current year.',
  })
  @ApiParam({
    name: 'countryId',
    description: 'Country ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Current year contribution summary retrieved successfully.',
    type: ContributionSummaryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No payslips found for current year' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentYearSummary(
    @Param('countryId') countryId: string,
    @Request() req: any,
  ): Promise<ContributionSummaryResponseDto> {
    const userId = req.user.sub;
    const summary = await this.contributionTrackingService.getCurrentYearSummary(
      userId,
      countryId,
    );
    return summary as ContributionSummaryResponseDto;
  }

  /**
   * Get contribution history for the authenticated employee
   */
  @Get('history')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'hr', 'payroll_admin', 'eor', 'candidate')
  @ApiOperation({
    summary: 'Get contribution history',
    description:
      'Retrieves contribution history for the authenticated employee, ' +
      'showing statutory deductions from recent payslips.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contribution history retrieved successfully.',
    type: ContributionHistoryResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getContributionHistory(
    @Query() queryDto: ContributionHistoryQueryDto,
    @Request() req: any,
  ): Promise<ContributionHistoryResponseDto> {
    const userId = req.user.sub;
    const { countryId, limit } = queryDto;

    const history = await this.contributionTrackingService.getContributionHistory(
      userId,
      countryId,
      limit,
    );

    return {
      data: history,
      total: history.length,
    };
  }

  /**
   * Get contribution breakdown for a specific payslip
   */
  @Get('payslip/:payslipId/breakdown')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'hr', 'payroll_admin', 'eor', 'candidate')
  @ApiOperation({
    summary: 'Get contribution breakdown for a payslip',
    description:
      'Retrieves detailed statutory contribution breakdown for a specific payslip. ' +
      'Employees can only access their own payslips.',
  })
  @ApiParam({
    name: 'payslipId',
    description: 'Payslip ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @ApiResponse({
    status: 200,
    description: 'Contribution breakdown retrieved successfully.',
    type: [StatutoryBreakdown],
  })
  @ApiResponse({ status: 404, description: 'Payslip not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getContributionBreakdown(
    @Param('payslipId') payslipId: string,
    @Request() req: any,
  ): Promise<StatutoryBreakdown[]> {
    const userId = req.user.sub;
    return this.contributionTrackingService.getContributionBreakdown(
      payslipId,
      userId,
    );
  }

  /**
   * Compare contributions between two periods
   */
  @Get('compare')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'hr', 'payroll_admin', 'eor', 'candidate')
  @ApiOperation({
    summary: 'Compare contributions between two periods',
    description:
      'Compares contribution totals between two specified periods. ' +
      'Useful for analyzing contribution trends and changes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contribution comparison retrieved successfully.',
    type: ContributionComparisonResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No payslips found for one or both periods' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async compareContributions(
    @Query() queryDto: ContributionComparisonQueryDto,
    @Request() req: any,
  ): Promise<ContributionComparisonResponseDto> {
    const userId = req.user.sub;
    const { countryId, period1Start, period1End, period2Start, period2End } = queryDto;

    const comparison = await this.contributionTrackingService.compareContributions(
      userId,
      countryId,
      new Date(period1Start),
      new Date(period1End),
      new Date(period2Start),
      new Date(period2End),
    );

    return comparison as ContributionComparisonResponseDto;
  }
}

