import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('health')
@Controller('health')
@ApiSecurity('public')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Health check endpoint',
    description: `
      Basic health check endpoint for monitoring and load balancer health checks.
      
      ## Purpose:
      - Verify application is running and responsive
      - Provide basic system information
      - Support load balancer health checks
      - Monitor application uptime and version
      
      ## Response Information:
      - Application status (ok/error)
      - Current timestamp
      - Application uptime in seconds
      - Environment (development/staging/production)
      - Application version
      
      ## Monitoring Integration:
      - Suitable for basic uptime monitoring
      - Lightweight response for frequent checks
      - No authentication required
      - Fast response time expected
      
      ## Use Cases:
      - Load balancer health checks
      - Basic uptime monitoring
      - Application status verification
      - CI/CD pipeline health checks
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Application is healthy and running',
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          example: 'ok',
          description: 'Application health status',
          enum: ['ok', 'error']
        },
        timestamp: { 
          type: 'string', 
          example: '2025-08-31T23:51:59.123Z',
          description: 'Current UTC timestamp',
          format: 'date-time'
        },
        uptime: { 
          type: 'number', 
          example: 123.456,
          description: 'Application uptime in seconds'
        },
        environment: { 
          type: 'string', 
          example: 'development',
          description: 'Current environment',
          enum: ['development', 'staging', 'production']
        },
        version: { 
          type: 'string', 
          example: '1.0.0',
          description: 'Application version'
        }
      },
      required: ['status', 'timestamp', 'uptime', 'environment', 'version']
    },
    headers: {
      'X-Response-Time': {
        description: 'Response time in milliseconds',
        schema: { type: 'number', example: 15 }
      }
    }
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Service Unavailable - Application is unhealthy',
    type: ErrorResponseDto,
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        timestamp: { type: 'string', example: '2025-08-31T23:51:59.123Z' },
        uptime: { type: 'number', example: 123.456 },
        environment: { type: 'string', example: 'development' },
        version: { type: 'string', example: '1.0.0' },
        error: { type: 'string', example: 'Database connection failed' }
      }
    }
  })
  async check() {
    return this.healthService.check();
  }

  @Get('detailed')
  @ApiOperation({ 
    summary: 'Detailed health check with service status',
    description: `
      Comprehensive health check endpoint that verifies all critical services and dependencies.
      
      ## Purpose:
      - Verify all critical services are operational
      - Check database connectivity and performance
      - Validate Redis cache connectivity
      - Monitor external service dependencies
      - Provide detailed system diagnostics
      
      ## Service Checks:
      - Database connectivity and query performance
      - Redis cache connectivity and response time
      - External API dependencies (if any)
      - File system access and permissions
      - Memory and CPU usage metrics
      
      ## Monitoring Integration:
      - Suitable for comprehensive monitoring systems
      - Provides detailed service status information
      - Includes performance metrics and response times
      - Supports alerting and notification systems
      
      ## Use Cases:
      - Comprehensive system monitoring
      - Service dependency verification
      - Performance monitoring and alerting
      - Troubleshooting and diagnostics
      - SLA monitoring and reporting
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'All services are healthy and operational',
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          example: 'ok',
          description: 'Overall system health status',
          enum: ['ok', 'error', 'degraded']
        },
        timestamp: { 
          type: 'string', 
          example: '2025-08-31T23:51:59.123Z',
          description: 'Current UTC timestamp',
          format: 'date-time'
        },
        uptime: { 
          type: 'number', 
          example: 123.456,
          description: 'Application uptime in seconds'
        },
        environment: { 
          type: 'string', 
          example: 'development',
          description: 'Current environment',
          enum: ['development', 'staging', 'production']
        },
        version: { 
          type: 'string', 
          example: '1.0.0',
          description: 'Application version'
        },
        services: {
          type: 'object',
          description: 'Status of all critical services',
          properties: {
            database: { 
              type: 'string', 
              example: 'ok',
              description: 'Database connectivity status',
              enum: ['ok', 'error', 'degraded']
            },
            redis: { 
              type: 'string', 
              example: 'ok',
              description: 'Redis cache status',
              enum: ['ok', 'error', 'degraded']
            }
          },
          required: ['database', 'redis']
        },
        metrics: {
          type: 'object',
          description: 'Performance and system metrics',
          properties: {
            responseTime: { 
              type: 'number', 
              example: 15.5,
              description: 'Health check response time in milliseconds'
            },
            memoryUsage: { 
              type: 'number', 
              example: 45.2,
              description: 'Memory usage percentage'
            },
            cpuUsage: { 
              type: 'number', 
              example: 12.8,
              description: 'CPU usage percentage'
            }
          }
        }
      },
      required: ['status', 'timestamp', 'uptime', 'environment', 'version', 'services']
    },
    headers: {
      'X-Response-Time': {
        description: 'Total response time in milliseconds',
        schema: { type: 'number', example: 25 }
      },
      'X-Service-Count': {
        description: 'Number of services checked',
        schema: { type: 'integer', example: 2 }
      }
    }
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Service Unavailable - One or more critical services are unhealthy',
    type: ErrorResponseDto,
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        timestamp: { type: 'string', example: '2025-08-31T23:51:59.123Z' },
        uptime: { type: 'number', example: 123.456 },
        environment: { type: 'string', example: 'development' },
        version: { type: 'string', example: '1.0.0' },
        services: {
          type: 'object',
          properties: {
            database: { type: 'string', example: 'error' },
            redis: { type: 'string', example: 'ok' }
          }
        },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              service: { type: 'string', example: 'database' },
              error: { type: 'string', example: 'Connection timeout' },
              timestamp: { type: 'string', example: '2025-08-31T23:51:59.123Z' }
            }
          }
        }
      }
    }
  })
  async detailedCheck() {
    return this.healthService.detailedCheck();
  }
}


