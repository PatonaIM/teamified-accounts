import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { WorkableApiService } from '../services/workable-api.service';

@ApiTags('Workable Integration')
@Controller('v1/workable')
export class WorkableController {
  constructor(private readonly workableService: WorkableApiService) {}

  /**
   * Get list of published jobs
   * GET /v1/workable/jobs
   */
  @Get('jobs')
  @ApiOperation({
    summary: 'Get list of published jobs',
    description: 'Fetch live job postings from Workable ATS with pagination and search support',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Pagination offset',
    example: '0',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of jobs to return (max 100)',
    example: '12',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search query for job title or description',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved job listings',
  })
  @ApiResponse({
    status: 502,
    description: 'Bad Gateway - Failed to communicate with Workable API',
  })
  async listJobs(
    @Query('offset') offset: string = '0',
    @Query('limit') limit: string = '12',
    @Query('search') search?: string,
  ) {
    return this.workableService.getJobs({ offset, limit, search });
  }

  /**
   * Get job details by shortcode
   * GET /v1/workable/jobs/:shortcode
   */
  @Get('jobs/:shortcode')
  @ApiOperation({
    summary: 'Get job details',
    description: 'Fetch complete job information including description, requirements, and benefits',
  })
  @ApiParam({
    name: 'shortcode',
    description: 'Job shortcode from Workable',
    example: 'ABCD1234',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved job details',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid shortcode',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Job not found',
  })
  @ApiResponse({
    status: 502,
    description: 'Bad Gateway - Failed to communicate with Workable API',
  })
  async getJobDetails(@Param('shortcode') shortcode: string) {
    return this.workableService.getJobDetails(shortcode);
  }

  /**
   * Get application form for a job
   * GET /v1/workable/jobs/:shortcode/form
   */
  @Get('jobs/:shortcode/form')
  @ApiOperation({
    summary: 'Get application form',
    description: 'Fetch dynamic application form fields for a specific job',
  })
  @ApiParam({
    name: 'shortcode',
    description: 'Job shortcode from Workable',
    example: 'ABCD1234',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved application form',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid shortcode',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Job not found',
  })
  @ApiResponse({
    status: 502,
    description: 'Bad Gateway - Failed to communicate with Workable API',
  })
  async getApplicationForm(@Param('shortcode') shortcode: string) {
    return this.workableService.getApplicationForm(shortcode);
  }

  /**
   * Submit job application
   * POST /v1/workable/jobs/:shortcode/apply
   */
  @Post('jobs/:shortcode/apply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit job application',
    description: 'Submit a candidate application to Workable ATS',
  })
  @ApiParam({
    name: 'shortcode',
    description: 'Job shortcode from Workable',
    example: 'ABCD1234',
  })
  @ApiBody({
    description: 'Application data including candidate information and answers',
    schema: {
      type: 'object',
      properties: {
        candidate: {
          type: 'object',
          properties: {
            firstname: { type: 'string', example: 'John' },
            lastname: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            phone: { type: 'string', example: '+1234567890' },
            resume: { type: 'string', description: 'Resume file URL or content' },
            cover_letter: { type: 'string', description: 'Cover letter text' },
          },
          required: ['firstname', 'lastname', 'email'],
        },
        answers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question_key: { type: 'string' },
              body: { type: 'string' },
            },
          },
        },
      },
      required: ['candidate'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Application submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid application data',
  })
  @ApiResponse({
    status: 502,
    description: 'Bad Gateway - Failed to communicate with Workable API',
  })
  async submitApplication(
    @Param('shortcode') shortcode: string,
    @Body() applicationData: any,
  ) {
    const result = await this.workableService.submitApplication(
      shortcode,
      applicationData,
    );
    
    return {
      success: true,
      message: 'Application submitted successfully',
      result,
    };
  }
}

