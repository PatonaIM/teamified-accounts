import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  CanActivate,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtTokenService } from '../../auth/services/jwt.service';

// Updated: Fixed user.id mapping from JWT payload.sub
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtTokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    try {
      const token = this.jwtService.extractTokenFromHeader(authHeader);
      const payload = this.jwtService.validateAccessToken(token);
      
      // Attach JWT payload to request
      // Note: Controllers should use payload.sub for user ID, not payload.id
      request.user = payload;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}