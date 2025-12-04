import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserAppPermissionsService } from '../services/user-app-permissions.service';
import { UserAppAccessResponseDto } from '../dto/app-permission.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('My App Permissions')
@Controller('v1/users/me/app-permissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MyAppPermissionsController {
  constructor(private readonly userAppPermissionsService: UserAppPermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user app access (defaults + overrides)' })
  @ApiResponse({
    status: 200,
    description: 'User app access retrieved successfully',
    type: [UserAppAccessResponseDto],
  })
  async getMyAppAccess(
    @CurrentUser() currentUser: any,
  ): Promise<UserAppAccessResponseDto[]> {
    const userId = currentUser.id || currentUser.sub;
    return this.userAppPermissionsService.getUserAppAccess(userId);
  }
}
