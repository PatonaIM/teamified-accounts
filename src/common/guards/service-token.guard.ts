import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtTokenService, ServiceTokenPayload } from '../../auth/services/jwt.service';

export const REQUIRED_SCOPES_KEY = 'requiredScopes';
export const RequiredScopes = (...scopes: string[]) => SetMetadata(REQUIRED_SCOPES_KEY, scopes);

export interface ServiceRequest extends Request {
  serviceClient?: {
    clientId: string;
    clientName: string;
    scopes: string[];
  };
}

@Injectable()
export class ServiceTokenGuard implements CanActivate {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    let payload: ServiceTokenPayload;

    try {
      payload = this.jwtTokenService.validateServiceToken(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid service token');
    }

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
    };

    return true;
  }
}
