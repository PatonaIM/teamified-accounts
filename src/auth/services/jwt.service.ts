import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { UserRolesService } from '../../user-roles/services/user-roles.service';
import * as crypto from 'crypto';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  clientId?: string;
  clientName?: string;
  mustChangePassword?: boolean;
  iat: number;
  exp: number;
  jti: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
    private readonly userRolesService: UserRolesService,
  ) {}

  async generateAccessToken(user: User, clientName?: string): Promise<string> {
    // Load user roles from database
    const userRoles = await this.userRolesService.getUserRoles(user.id);
    
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      roles: userRoles.length > 0 ? userRoles : ['client_employee'], // Use actual roles or default to client_employee
      ...(clientName && { clientName }), // Include clientName for multi-organization apps
      ...(user.mustChangePassword && { mustChangePassword: true }), // Include forced password change flag
      jti: crypto.randomUUID(),
    };

    return this.nestJwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '72h',
    });
  }

  generateRefreshToken(user: User, tokenFamily: string): string {
    const payload = {
      sub: user.id,
      tokenFamily,
      type: 'refresh',
      jti: crypto.randomUUID(),
    };

    return this.nestJwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '30d',
    });
  }

  async generateTokenPair(user: User, tokenFamily?: string, clientName?: string): Promise<TokenPair> {
    const family = tokenFamily || crypto.randomUUID();
    
    return {
      accessToken: await this.generateAccessToken(user, clientName),
      refreshToken: this.generateRefreshToken(user, family),
    };
  }

  validateAccessToken(token: string): JwtPayload {
    try {
      return this.nestJwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  validateRefreshToken(token: string): any {
    try {
      return this.nestJwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  extractTokenFromHeader(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }
    return authHeader.substring(7);
  }

  generateTokenFamily(): string {
    return crypto.randomUUID();
  }

  hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}