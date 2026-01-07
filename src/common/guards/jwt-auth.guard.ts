import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  CanActivate,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtTokenService } from '../../auth/services/jwt.service';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtTokenService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
      
      // Check global logout timestamp - if token was issued before user's global logout, reject it
      // This enables true SSO logout across all clients
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        select: ['id', 'globalLogoutAt'],
      });
      
      if (user?.globalLogoutAt) {
        const tokenIssuedAt = new Date(payload.iat * 1000);
        if (tokenIssuedAt < user.globalLogoutAt) {
          throw new UnauthorizedException('Session has been terminated. Please log in again.');
        }
      }
      
      // Attach JWT payload to request with userId mapped from sub for convenience
      request.user = {
        ...payload,
        userId: payload.sub, // Map sub to userId for controller convenience
      };
      
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
