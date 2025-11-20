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
    
    // Extract token from Authorization header (primary) or cookie (fallback for browser redirects)
    let token: string | undefined;
    const authHeader = request.headers.authorization;
    
    if (authHeader) {
      token = this.jwtService.extractTokenFromHeader(authHeader);
    } else if (request.cookies?.access_token) {
      // Fallback for browser redirects (like SSO authorize endpoint)
      token = request.cookies.access_token;
    }
    
    if (!token) {
      throw new UnauthorizedException('Missing authentication credentials');
    }

    try {
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