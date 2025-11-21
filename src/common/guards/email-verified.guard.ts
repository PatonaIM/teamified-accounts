import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { JwtTokenService } from '../../auth/services/jwt.service';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  private readonly logger = new Logger(EmailVerifiedGuard.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      // Extract and validate the token
      const token = this.jwtTokenService.extractTokenFromHeader(authHeader);
      const payload = this.jwtTokenService.validateAccessToken(token);

      // Get the user from database
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        this.logger.warn(`User not found for token: ${payload.sub}`);
        throw new UnauthorizedException('User not found');
      }

      if (!user.emailVerified) {
        this.logger.warn(`Email not verified for user: ${user.email}`);
        throw new UnauthorizedException('Email verification is required to access this resource');
      }

      // Add user to request for downstream usage
      request.user = payload;
      
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      this.logger.error(`Email verification guard error: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}