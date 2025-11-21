import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRolesService } from '../services/user-roles.service';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { UserRoleResponseDto } from '../dto/user-role-response.dto';
import { PermissionResponseDto } from '../dto/permission-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Roles')
@Controller('v1/roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post('assign')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiResponse({
    status: 201,
    description: 'Role assigned successfully',
    type: UserRoleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Role assignment conflict',
  })
  async assignRole(
    @Body() assignRoleDto: AssignRoleDto,
    @CurrentUser() currentUser: any,
  ): Promise<{ role: UserRoleResponseDto }> {
    const role = await this.userRolesService.assignRole(
      assignRoleDto.userId,
      assignRoleDto.role,
      assignRoleDto.scope,
      assignRoleDto.scopeId,
      currentUser.sub,
      assignRoleDto.expiresAt ? new Date(assignRoleDto.expiresAt) : undefined,
    );
    return { role };
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Get all roles for a user' })
  @ApiResponse({
    status: 200,
    description: 'User roles retrieved successfully',
    type: [UserRoleResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserRoles(@Param('userId') userId: string): Promise<{ roles: UserRoleResponseDto[] }> {
    const roles = await this.userRolesService.getUserRolesWithScope(userId);
    return { roles };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update a role assignment' })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: UserRoleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Role assignment not found',
  })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<{ role: UserRoleResponseDto }> {
    const role = await this.userRolesService.updateRole(id, updateRoleDto);
    return { role };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a role assignment' })
  @ApiResponse({
    status: 204,
    description: 'Role removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Role assignment not found',
  })
  async removeRole(@Param('id') id: string): Promise<void> {
    await this.userRolesService.removeRoleById(id);
  }

  @Get('permissions/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Get user permissions' })
  @ApiResponse({
    status: 200,
    description: 'User permissions retrieved successfully',
    type: [PermissionResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserPermissions(@Param('userId') userId: string): Promise<{ permissions: PermissionResponseDto[] }> {
    const permissions = await this.userRolesService.getUserPermissions(userId);
    return { permissions };
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  async test(): Promise<{ message: string }> {
    return { message: 'Role controller is working!' };
  }
}
