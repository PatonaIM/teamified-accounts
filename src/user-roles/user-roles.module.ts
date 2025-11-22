import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from './entities/user-role.entity';
import { UserRolesService } from './services/user-roles.service';
import { PermissionService } from './services/permission.service';
import { RoleController } from './controllers/role.controller';
import { PermissionGuard } from './guards/permission.guard';
import { ScopeGuard } from './guards/scope.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRole]),
    forwardRef(() => AuthModule),
  ],
  controllers: [RoleController],
  providers: [
    UserRolesService, 
    PermissionService, 
    PermissionGuard, 
    ScopeGuard,
  ],
  exports: [UserRolesService, PermissionService, PermissionGuard, ScopeGuard],
})
export class UserRolesModule {}
