import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtTokenService } from '../../auth/services/jwt.service';
import { UserService } from '../../users/services/user.service';
import { REQUIRED_SCOPES_KEY } from './service-token.guard';

@Injectable()
export class JwtOrServiceGuard implements CanActivate {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly userService: UserService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    try {
      const decoded = this.jwtTokenService.decode(token);
      
      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }

      if ((decoded as any).type === 'service') {
        return this.handleServiceToken(context, request, token);
      }

      return this.handleUserToken(context, request, token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async handleUserToken(
    context: ExecutionContext,
    request: any,
    token: string,
  ): Promise<boolean> {
    const payload = this.jwtTokenService.validateAccessToken(token);
    
    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    request.user = {
      ...payload,
      user,
    };

    return true;
  }

  private async handleServiceToken(
    context: ExecutionContext,
    request: any,
    token: string,
  ): Promise<boolean> {
    const payload = this.jwtTokenService.validateServiceToken(token);

    const requiredScopes = this.reflector.get<string[]>(
      REQUIRED_SCOPES_KEY,
      context.getHandler(),
    ) || [];

    if (requiredScopes.length > 0) {
      const hasAllScopes = requiredScopes.every(scope => 
        payload.scopes.includes(scope)
      );

      if (!hasAllScopes) {
        throw new ForbiddenException(
          `Insufficient scopes. Required: ${requiredScopes.join(', ')}. ` +
          `Granted: ${payload.scopes.join(', ')}`
        );
      }
    }

    request.serviceClient = {
      clientId: payload.clientId,
      clientName: payload.clientName,
      scopes: payload.scopes,
      allowedOrgIds: payload.allowedOrgIds ?? null,
    };

    request.user = null;

    return true;
  }
}
