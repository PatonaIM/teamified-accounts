import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserAppPermissionsService } from '../services/user-app-permissions.service';
import { SetAppPermissionDto, UserAppAccessResponseDto, AppPermissionResponseDto } from '../dto/app-permission.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('User App Permissions')
@Controller('v1/users/:userId/app-permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@ApiBearerAuth()
export class UserAppPermissionsController {
  constructor(private readonly userAppPermissionsService: UserAppPermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user app access (defaults + overrides)' })
  @ApiResponse({
    status: 200,
    description: 'User app access retrieved successfully',
    type: [UserAppAccessResponseDto],
  })
  async getUserAppAccess(
    @Param('userId') userId: string,
  ): Promise<UserAppAccessResponseDto[]> {
    return this.userAppPermissionsService.getUserAppAccess(userId);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set app permission override (grant or revoke)' })
  @ApiResponse({
    status: 200,
    description: 'App permission set successfully',
    type: AppPermissionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User or OAuth client not found',
  })
  async setAppPermission(
    @Param('userId') userId: string,
    @Body() dto: SetAppPermissionDto,
    @CurrentUser() currentUser: any,
  ): Promise<AppPermissionResponseDto> {
    return this.userAppPermissionsService.setAppPermission(userId, dto, currentUser.sub);
  }

  @Delete(':oauthClientId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove app permission override (reset to default)' })
  @ApiResponse({
    status: 204,
    description: 'App permission override removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Permission override not found',
  })
  async removeAppPermission(
    @Param('userId') userId: string,
    @Param('oauthClientId') oauthClientId: string,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    await this.userAppPermissionsService.removeAppPermission(userId, oauthClientId, currentUser.sub);
  }
}
