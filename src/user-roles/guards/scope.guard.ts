import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../services/permission.service';
import { SCOPE_KEY } from '../decorators/scope.decorator';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredScope = this.reflector.getAllAndOverride<string>(SCOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredScope) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    const request = context.switchToHttp().getRequest();
    
    // Extract scope and scopeId from request parameters or body
    const scope = request.params?.scope || request.body?.scope;
    const scopeId = request.params?.scopeId || request.body?.scopeId;
    
    // Check if user has permission for the required scope
    return this.permissionService.hasPermission(
      user.sub,
      'scope.access',
      requiredScope,
      scopeId,
    );
  }
}
