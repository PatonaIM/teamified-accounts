import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('root')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API information and health check' })
  @ApiResponse({ status: 200, description: 'API information returned successfully' })
  getRoot() {
    return {
      message: 'Teamified API',
      version: '1.0.0',
      status: 'running',
      documentation: '/api/docs',
      health: '/api/health',
      endpoints: {
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        clients: '/api/v1/clients',
        payroll: '/api/v1/payroll',
        timesheets: '/api/v1/timesheets',
        leave: '/api/v1/leave',
        documents: '/api/v1/documents',
        workable: '/api/v1/workable',
      },
      note: 'This is the backend API server. For the frontend application, please access the main Replit URL.',
    };
  }
}
