import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { HROnboardingService } from '../services/hr-onboarding.service';

@ApiTags('HR Onboarding')
@ApiBearerAuth()
@Controller('v1/hr/onboarding')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'hr')
export class HROnboardingController {
  private readonly logger = new Logger(HROnboardingController.name);

  constructor(private readonly hrOnboardingService: HROnboardingService) {}

  @Get('candidates')
  @ApiOperation({ summary: 'Get all candidates in onboarding status (HR/Admin only)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or email' })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['submittedAt', 'name', 'progress'],
    description: 'Sort candidates by field',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @ApiResponse({
    status: 200,
    description: 'List of onboarding candidates with document progress',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - requires HR or Admin role' })
  async getOnboardingCandidates(
    @Query('search') search?: string,
    @Query('sortBy') sortBy: 'submittedAt' | 'name' | 'progress' = 'submittedAt',
    @Query('order') order: 'asc' | 'desc' = 'desc',
  ) {
    this.logger.log(
      `Fetching onboarding candidates (search: ${search || 'none'}, sortBy: ${sortBy}, order: ${order})`,
    );

    return this.hrOnboardingService.getOnboardingCandidates(search, sortBy, order);
  }

  @Get('candidates/:userId/documents')
  @ApiOperation({
    summary: 'Get all documents for a specific candidate (HR/Admin only)',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by document category',
  })
  @ApiResponse({ status: 200, description: 'List of candidate documents' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires HR or Admin role' })
  async getCandidateDocuments(
    @Param('userId') userId: string,
    @Query('category') category?: string,
  ) {
    this.logger.log(
      `Fetching documents for candidate ${userId}${category ? ` (category: ${category})` : ''}`,
    );

    return this.hrOnboardingService.getCandidateDocuments(userId, category);
  }

  @Post('candidates/:userId/complete')
  @ApiOperation({
    summary: 'Complete onboarding for a candidate (HR/Admin only)',
    description: 'Changes candidate status from onboarding to active. Validates that all required documents are verified before completion.',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Not all documents verified or candidate has not submitted' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires HR or Admin role' })
  @ApiResponse({ status: 404, description: 'Not Found - No onboarding record found' })
  async completeOnboarding(@Param('userId') userId: string) {
    this.logger.log(`Completing onboarding for candidate ${userId}`);

    return this.hrOnboardingService.completeOnboarding(userId);
  }
}
