import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmploymentRecordService } from '../services/employment-record.service';
import { CreateEmploymentRecordDto } from '../dto/create-employment-record.dto';
import { UpdateEmploymentRecordDto } from '../dto/update-employment-record.dto';
import { TerminateEmploymentRecordDto } from '../dto/terminate-employment-record.dto';
import { EmploymentRecordResponseDto } from '../dto/employment-record-response.dto';
import { EmploymentRecordSearchDto } from '../dto/employment-record-search.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { DocumentRequirementsService } from '../../documents/services/document-requirements.service';
import { DocumentService } from '../../documents/services/document.service';

@ApiTags('Employment Records')
@Controller('v1/employment-records')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmploymentRecordController {
  constructor(
    private readonly employmentRecordService: EmploymentRecordService,
    private readonly documentRequirementsService: DocumentRequirementsService,
    private readonly documentService: DocumentService,
  ) {}

  @Post()
  @Roles('admin', 'hr')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create a new employment record' })
  @ApiResponse({ 
    status: 201, 
    description: 'Employment record created successfully',
    type: EmploymentRecordResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Conflict - overlapping employment exists' })
  async create(
    @Body() createEmploymentRecordDto: CreateEmploymentRecordDto,
    @CurrentUser() currentUser: CurrentUserData
  ): Promise<{ employmentRecord: EmploymentRecordResponseDto }> {
    const employmentRecord = await this.employmentRecordService.create(createEmploymentRecordDto, currentUser);
    return { employmentRecord };
  }

  @Get()
  @Roles('admin', 'hr', 'hr_manager_client', 'account_manager', 'eor')
  @ApiOperation({ summary: 'Get employment records with search and filtering' })
  @ApiResponse({ 
    status: 200, 
    description: 'Employment records retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        employmentRecords: {
          type: 'array',
          items: { $ref: '#/components/schemas/EmploymentRecordResponseDto' }
        },
        total: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findAll(
    @Query() searchDto: EmploymentRecordSearchDto,
    @Request() req: any
  ) {
    const userRoles: string[] = req.user.roles || [];
    
    // Client-scoping for hr_manager_client role
    // hr_manager_client users can only see employment records for their assigned client
    if (userRoles.includes('hr_manager_client') && req.user.clientId) {
      searchDto.clientId = req.user.clientId; // Force override - prevents query parameter bypass
      // Note: This filters by employment_records.client_id (which client the employee works for)
    }
    
    // EOR users can only see their own employment record
    const isEorOnly = userRoles.includes('eor') && !userRoles.some(r => ['admin', 'hr'].includes(r));
    if (isEorOnly) {
      searchDto.userId = req.user.sub;
    }
    
    return await this.employmentRecordService.findAll(searchDto);
  }

  @Get('user/:userId')
  @Roles('admin', 'hr', 'candidate', 'eor')
  @ApiOperation({ summary: 'Get employment records for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'User employment records retrieved successfully',
    type: [EmploymentRecordResponseDto]
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findByUserId(
    @Param('userId') userId: string,
    @Request() req: any
  ): Promise<{ employmentRecords: EmploymentRecordResponseDto[] }> {
    const userRoles: string[] = req.user.roles || [];
    const currentUserId = req.user.sub;

    // Users can only access their own employment records unless they're admin/hr
    const isAdminOrHr = userRoles.some(r => ['admin', 'hr'].includes(r));
    if (!isAdminOrHr && userId !== currentUserId) {
      throw new HttpException('Forbidden - can only access own employment records', HttpStatus.FORBIDDEN);
    }

    const employmentRecords = await this.employmentRecordService.findByUserId(userId);
    return { employmentRecords };
  }

  @Get('client/:clientId')
  @Roles('admin', 'hr', 'client')
  @ApiOperation({ summary: 'Get employment records for a specific client' })
  @ApiResponse({ 
    status: 200, 
    description: 'Client employment records retrieved successfully',
    type: [EmploymentRecordResponseDto]
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findByClientId(@Param('clientId') clientId: string): Promise<{ employmentRecords: EmploymentRecordResponseDto[] }> {
    const employmentRecords = await this.employmentRecordService.findByClientId(clientId);
    return { employmentRecords };
  }

  @Get('statistics')
  @Roles('admin', 'hr', 'client')
  @ApiOperation({ summary: 'Get employment statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Employment statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        active: { type: 'number' },
        inactive: { type: 'number' },
        terminated: { type: 'number' },
        completed: { type: 'number' },
        recentHires: { type: 'number' },
        recentTerminations: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getStatistics() {
    return await this.employmentRecordService.getStatistics();
  }

  @Get(':id')
  @Roles('admin', 'hr', 'client')
  @ApiOperation({ summary: 'Get a specific employment record by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Employment record retrieved successfully',
    type: EmploymentRecordResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Employment record not found' })
  async findOne(@Param('id') id: string): Promise<{ employmentRecord: EmploymentRecordResponseDto }> {
    const employmentRecord = await this.employmentRecordService.findOne(id);
    return { employmentRecord };
  }

  @Put(':id')
  @Roles('admin', 'hr')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Update an employment record (full update)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Employment record updated successfully',
    type: EmploymentRecordResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Employment record not found' })
  async updateFull(
    @Param('id') id: string, 
    @Body() updateEmploymentRecordDto: UpdateEmploymentRecordDto,
    @CurrentUser() currentUser: CurrentUserData
  ): Promise<{ employmentRecord: EmploymentRecordResponseDto }> {
    const employmentRecord = await this.employmentRecordService.update(id, updateEmploymentRecordDto, currentUser);
    return { employmentRecord };
  }

  @Patch(':id')
  @Roles('admin', 'hr')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Update an employment record (partial update)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Employment record updated successfully',
    type: EmploymentRecordResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Employment record not found' })
  async update(
    @Param('id') id: string, 
    @Body() updateEmploymentRecordDto: UpdateEmploymentRecordDto,
    @CurrentUser() currentUser: CurrentUserData
  ): Promise<{ employmentRecord: EmploymentRecordResponseDto }> {
    const employmentRecord = await this.employmentRecordService.update(id, updateEmploymentRecordDto, currentUser);
    return { employmentRecord };
  }

  @Patch(':id/terminate')
  @Roles('admin', 'hr')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Terminate an employment record' })
  @ApiResponse({ 
    status: 200, 
    description: 'Employment record terminated successfully',
    type: EmploymentRecordResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Employment record not found' })
  async terminate(
    @Param('id') id: string, 
    @Body() terminateDto: TerminateEmploymentRecordDto,
    @CurrentUser() currentUser: CurrentUserData
  ): Promise<{ employmentRecord: EmploymentRecordResponseDto }> {
    const employmentRecord = await this.employmentRecordService.terminate(id, terminateDto, currentUser);
    return { employmentRecord };
  }

  @Patch(':id/submit-onboarding')
  @Roles('candidate', 'eor')
  @ApiOperation({ summary: 'Submit onboarding for review (candidate/eor only)' })
  @ApiResponse({
    status: 200,
    description: 'Onboarding submitted successfully',
    type: EmploymentRecordResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - onboarding not complete or already submitted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only submit own onboarding' })
  @ApiResponse({ status: 404, description: 'Employment record not found' })
  async submitOnboarding(
    @Param('id') id: string,
    @Request() req: any,
    @CurrentUser() currentUser: CurrentUserData
  ): Promise<{ employmentRecord: EmploymentRecordResponseDto; message: string }> {
    const currentUserId = req.user.sub;

    // Get the employment record to verify ownership
    const employmentRecord = await this.employmentRecordService.findOne(id);

    // Verify that the user is submitting their own onboarding
    if (employmentRecord.userId !== currentUserId) {
      throw new HttpException('Forbidden - can only submit own onboarding', HttpStatus.FORBIDDEN);
    }

    // Verify the employment record is in onboarding status
    if (employmentRecord.status !== 'onboarding') {
      throw new HttpException('This employment record is not in onboarding status', HttpStatus.BAD_REQUEST);
    }

    // Check if already submitted
    if (employmentRecord.onboardingSubmittedAt) {
      throw new HttpException('Onboarding has already been submitted', HttpStatus.BAD_REQUEST);
    }

    // Validate document requirements
    const documents = await this.documentService.findByUserId(currentUserId);
    const documentCounts = {
      cv: documents.filter(doc => doc.category === 'cv').length,
      identity: documents.filter(doc => doc.category === 'identity').length,
      employment: documents.filter(doc => doc.category === 'employment').length,
      education: documents.filter(doc => doc.category === 'education').length,
    };

    const validation = await this.documentRequirementsService.validateDocumentCounts(documentCounts);
    if (!validation.valid) {
      throw new HttpException(
        `Missing required documents: ${validation.missingCategories.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Mark onboarding as submitted (but keep status as 'onboarding' for HR to review)
    const updateDto: UpdateEmploymentRecordDto = {
      onboardingSubmittedAt: new Date(),
    };

    const updatedRecord = await this.employmentRecordService.update(id, updateDto, currentUser);

    return {
      employmentRecord: updatedRecord,
      message: 'Onboarding submitted successfully. HR will review your information.'
    };
  }

  @Delete(':id')
  @Roles('admin', 'hr')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an employment record' })
  @ApiResponse({ status: 204, description: 'Employment record deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Employment record not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserData
  ): Promise<void> {
    await this.employmentRecordService.remove(id, currentUser);
  }
}
