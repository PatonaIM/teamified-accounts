import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SalaryHistoryService } from '../services/salary-history.service';
import { CreateSalaryHistoryDto } from '../dto/create-salary-history.dto';
import { SalaryHistoryResponseDto } from '../dto/salary-history-response.dto';
import { SalaryHistorySearchDto } from '../dto/salary-history-search.dto';
import { SalaryReportResponseDto } from '../dto/salary-report-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@ApiTags('Salary History')
@Controller('v1/salary-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SalaryHistoryController {
  private readonly logger = new Logger(SalaryHistoryController.name);

  constructor(private readonly salaryHistoryService: SalaryHistoryService) {}

  @Post()
  @Roles('admin', 'hr')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOperation({
    summary: 'Create salary history record',
    description: 'Create a new salary history record for an employment. Requires admin or HR role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Salary history record created successfully',
    type: SalaryHistoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or business rule violation',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - employment record not found',
  })
  async create(
    @Body() createSalaryHistoryDto: CreateSalaryHistoryDto,
    @CurrentUser() user: any,
  ): Promise<SalaryHistoryResponseDto> {
    this.logger.log(`Creating salary history for employment ${createSalaryHistoryDto.employmentRecordId} by user ${user.id}`);
    
    return this.salaryHistoryService.create(createSalaryHistoryDto, user.id);
  }

  @Get('employment/:employmentId')
  @Roles('admin', 'hr', 'eor')
  @ApiOperation({
    summary: 'Get salary history for employment record',
    description: 'Retrieve all salary history records for a specific employment record.',
  })
  @ApiParam({
    name: 'employmentId',
    description: 'Employment record UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Salary history retrieved successfully',
    type: [SalaryHistoryResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - employment record not found',
  })
  async findByEmploymentId(
    @Param('employmentId') employmentId: string,
  ): Promise<SalaryHistoryResponseDto[]> {
    this.logger.log(`Finding salary history for employment ${employmentId}`);
    
    return this.salaryHistoryService.findByEmploymentId(employmentId);
  }

  @Get('user/:userId')
  @Roles('admin', 'hr', 'eor')
  @ApiOperation({
    summary: 'Get salary history for user',
    description: 'Retrieve all salary history records for a specific user across all employments.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Salary history retrieved successfully',
    type: [SalaryHistoryResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<SalaryHistoryResponseDto[]> {
    this.logger.log(`Finding salary history for user ${userId}`);
    
    return this.salaryHistoryService.findByUserId(userId);
  }

  @Get('search')
  @Roles('admin', 'hr', 'eor')
  @ApiOperation({
    summary: 'Search salary history records',
    description: 'Search and filter salary history records with pagination and various criteria.',
  })
  @ApiQuery({ name: 'employmentRecordId', required: false, description: 'Employment record ID' })
  @ApiQuery({ name: 'userId', required: false, description: 'User ID' })
  @ApiQuery({ name: 'currency', required: false, description: 'Currency code' })
  @ApiQuery({ name: 'minAmount', required: false, description: 'Minimum salary amount' })
  @ApiQuery({ name: 'maxAmount', required: false, description: 'Maximum salary amount' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'isScheduled', required: false, description: 'Filter by scheduled changes' })
  @ApiQuery({ name: 'sortField', required: false, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (ASC/DESC)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results (default: 50)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of results to skip (default: 0)' })
  @ApiResponse({
    status: 200,
    description: 'Paginated search results retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid search parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async search(
    @Query() searchDto: SalaryHistorySearchDto,
  ): Promise<PaginatedResponseDto<SalaryHistoryResponseDto>> {
    this.logger.log(`Searching salary history with criteria: ${JSON.stringify(searchDto)}`);
    
    return this.salaryHistoryService.search(searchDto);
  }

  @Get('reports/employment/:employmentId')
  @Roles('admin', 'hr', 'eor')
  @ApiOperation({
    summary: 'Get salary report for employment record',
    description: 'Generate comprehensive salary report for a specific employment record.',
  })
  @ApiParam({
    name: 'employmentId',
    description: 'Employment record UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Salary report generated successfully',
    type: SalaryReportResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - employment record not found',
  })
  async getEmploymentReport(
    @Param('employmentId') employmentId: string,
  ): Promise<SalaryReportResponseDto> {
    this.logger.log(`Generating salary report for employment ${employmentId}`);
    
    return this.salaryHistoryService.getEmploymentReport(employmentId);
  }

  @Get('reports/user/:userId')
  @Roles('admin', 'hr', 'eor')
  @ApiOperation({
    summary: 'Get salary report for user',
    description: 'Generate comprehensive salary report for a specific user across all employments.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Salary report generated successfully',
    type: SalaryReportResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async getUserReport(
    @Param('userId') userId: string,
  ): Promise<SalaryReportResponseDto> {
    this.logger.log(`Generating salary report for user ${userId}`);
    
    return this.salaryHistoryService.getUserReport(userId);
  }

  @Get('reports/summary')
  @Roles('admin', 'hr')
  @ApiOperation({
    summary: 'Get organization-wide salary summary',
    description: 'Generate organization-wide salary statistics across all active employment records. Admin and HR only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization summary generated successfully',
    type: SalaryReportResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async getOrganizationSummary(): Promise<SalaryReportResponseDto> {
    this.logger.log('Generating organization-wide salary summary');
    
    return this.salaryHistoryService.getOrganizationSummary();
  }

  @Get('scheduled')
  @Roles('admin', 'hr')
  @ApiOperation({
    summary: 'Get scheduled salary changes',
    description: 'Retrieve all scheduled salary changes (future effective dates). Admin and HR only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Scheduled salary changes retrieved successfully',
    type: [SalaryHistoryResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async getScheduledChanges(): Promise<SalaryHistoryResponseDto[]> {
    this.logger.log('Retrieving scheduled salary changes');
    
    return this.salaryHistoryService.getScheduledChanges();
  }
}
