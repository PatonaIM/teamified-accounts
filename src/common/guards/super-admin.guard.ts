import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    // Normalize roles to array (handle both array and string formats)
    let roles: string[] = [];
    
    if (Array.isArray(user.roles)) {
      roles = user.roles;
    } else if (typeof user.role === 'string') {
      roles = [user.role];
    } else if (typeof user.roles === 'string') {
      roles = [user.roles];
    }

    // Check if user has super admin privileges
    const isSuperAdmin = roles.some((role: string) => {
      if (!role) return false;
      const normalizedRole = role.toLowerCase().trim();
      return ['super_admin', 'system_admin'].includes(normalizedRole);
    });

    if (!isSuperAdmin) {
      throw new ForbiddenException(
        'Access denied. Super admin privileges required.'
      );
    }

    return true;
  }
}
