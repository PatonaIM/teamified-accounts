import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../services/permission.service';
import { PERMISSION_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    const request = context.switchToHttp().getRequest();
    
    // Extract scope and scopeId from request parameters or body
    const scope = request.params?.scope || request.body?.scope;
    const scopeId = request.params?.scopeId || request.body?.scopeId;
    
    return this.permissionService.hasAnyPermission(
      user.sub,
      requiredPermissions,
      scope,
      scopeId,
    );
  }
}
