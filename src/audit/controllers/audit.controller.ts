import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../audit.service';
import { QueryAuditLogsDto, AuditLogResponseDto } from '../dto/audit-log.dto';

@ApiTags('Audit Logs')
@Controller('v1/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  private readonly logger = new Logger(AuditController.name);

  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @Roles('admin', 'hr', 'eor', 'candidate')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOperation({
    summary: 'Retrieve audit logs',
    description: 'Retrieve paginated audit logs with filtering. All authenticated users can access their own logs (scope=self). Admin/HR roles can access organization-wide logs (scope=all).',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return (default: 10, max: 50)',
    example: 10,
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'Opaque pagination cursor (base64 encoded) returned from previous response',
    example: 'eyJhdCI6IjIwMjQtMDEtMTVUMTA6MzA6MDAuMDAwWiIsImlkIjoiMTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDAwIn0=',
  })
  @ApiQuery({
    name: 'action',
    required: false,
    description: 'Filter by action type (e.g., "timesheet_submitted", "leave_approved")',
    example: 'timesheet_submitted',
  })
  @ApiQuery({
    name: 'entityType',
    required: false,
    description: 'Filter by entity type (e.g., "Timesheet", "LeaveRequest")',
    example: 'Timesheet',
  })
  @ApiQuery({
    name: 'scope',
    required: false,
    description: 'Scope of audit logs: "self" (default for eor/candidate), "team", "all" (admin/hr only)',
    example: 'self',
    enum: ['self', 'team', 'all'],
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    type: AuditLogResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid query parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions for requested scope',
  })
  async getLogs(
    @Query() queryDto: QueryAuditLogsDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<AuditLogResponseDto> {
    this.logger.log(`Retrieving audit logs for user ${user.id} with scope ${queryDto.scope}`);

    const scope = queryDto.scope || 'self';
    const userRole = user.role;

    if (scope === 'all' && !['admin', 'hr'].includes(userRole)) {
      throw new ForbiddenException('Only admin and HR roles can access organization-wide logs');
    }

    if (scope === 'team' && !['admin', 'hr', 'client'].includes(userRole)) {
      throw new ForbiddenException('Only admin, HR, and client roles can access team logs');
    }

    return this.auditService.findWithFilters(queryDto, user);
  }
}
