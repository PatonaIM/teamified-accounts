import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { REQUIRED_SCOPES_KEY } from './service-token.guard';

@Injectable()
export class RolesOrServiceGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (request.serviceClient) {
      const requiredScopes = this.reflector.getAllAndOverride<string[]>(
        REQUIRED_SCOPES_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (!requiredScopes || requiredScopes.length === 0) {
        throw new ForbiddenException(
          'This endpoint does not support service-to-service authentication'
        );
      }

      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = request;
    
    if (user.roles?.some((userRole: string) => userRole.toLowerCase() === 'super_admin')) {
      return true;
    }
    
    return requiredRoles.some((role) => 
      user.roles?.some((userRole: string) => 
        userRole.toLowerCase() === role.toLowerCase()
      )
    );
  }
}
