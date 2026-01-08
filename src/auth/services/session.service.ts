import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';
import { User } from '../entities/user.entity';
import { JwtTokenService } from './jwt.service';
import * as crypto from 'crypto';

export interface DeviceMetadata {
  ip: string;
  userAgent: string;
  deviceFingerprint?: string;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtTokenService,
  ) {}

  async createSession(
    user: User,
    refreshToken: string,
    deviceMetadata: DeviceMetadata,
    existingTokenFamily?: string,
    environment?: string,
  ): Promise<Session> {
    const tokenFamily = existingTokenFamily || this.jwtService.generateTokenFamily();
    const refreshTokenHash = this.jwtService.hashRefreshToken(refreshToken);
    const now = new Date();
    
    const session = this.sessionRepository.create({
      userId: user.id,
      refreshTokenHash,
      tokenFamily,
      deviceMetadata,
      environment: environment || null,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      lastActivityAt: now,
    });

    return await this.sessionRepository.save(session);
  }

  async rotateRefreshToken(
    oldRefreshToken: string,
    user: User,
    deviceMetadata: DeviceMetadata,
  ): Promise<{ session: Session; newTokens: { accessToken: string; refreshToken: string } }> {
    const payload = this.jwtService.validateRefreshToken(oldRefreshToken);
    const oldTokenHash = this.jwtService.hashRefreshToken(oldRefreshToken);

    // Find the session with this token
    const session = await this.sessionRepository.findOne({
      where: {
        userId: user.id,
        refreshTokenHash: oldTokenHash,
        tokenFamily: payload.tokenFamily,
        revokedAt: null,
      },
    });

    if (!session) {
      // Token reuse detected - revoke entire token family
      await this.revokeTokenFamily(payload.tokenFamily);
      this.logger.warn(`Token reuse detected for user ${user.id}, family ${payload.tokenFamily}`);
      throw new UnauthorizedException('Token reuse detected');
    }

    if (session.expiresAt < new Date()) {
      await this.revokeSession(session.id);
      throw new UnauthorizedException('Refresh token expired');
    }

    // Check for 72-hour inactivity timeout
    const now = new Date();
    const hoursSinceLastActivity = (now.getTime() - session.lastActivityAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastActivity >= 72) {
      await this.revokeSession(session.id);
      this.logger.log(`Session expired due to 72 hours of inactivity for user ${user.id}`);
      throw new UnauthorizedException('Session expired due to inactivity. Please log in again.');
    }

    // Generate new tokens with same family
    const newTokens = await this.jwtService.generateTokenPair(user, payload.tokenFamily);
    const newTokenHash = this.jwtService.hashRefreshToken(newTokens.refreshToken);

    // Update session with new token hash and reset activity timer
    session.refreshTokenHash = newTokenHash;
    session.deviceMetadata = deviceMetadata;
    session.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Extend expiry
    session.lastActivityAt = now; // Reset activity timer

    await this.sessionRepository.save(session);

    return { session, newTokens };
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      revokedAt: new Date(),
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    const now = new Date();
    
    // Revoke all sessions
    await this.sessionRepository.update(
      { userId, revokedAt: null },
      { revokedAt: now },
    );
    
    // Set global logout timestamp to invalidate all access tokens issued before this time
    // This ensures true SSO logout across all clients
    await this.userRepository.update(userId, { globalLogoutAt: now });
    
    this.logger.log(`Global logout: Revoked all sessions and set globalLogoutAt for user ${userId}`);
  }

  async revokeTokenFamily(tokenFamily: string): Promise<void> {
    await this.sessionRepository.update(
      { tokenFamily, revokedAt: null },
      { revokedAt: new Date() },
    );
  }

  async revokeSessionByRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = this.jwtService.hashRefreshToken(refreshToken);
    
    const session = await this.sessionRepository.findOne({
      where: { refreshTokenHash: tokenHash, revokedAt: null },
    });

    if (session) {
      await this.revokeSession(session.id);
    }
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.sessionRepository.delete({
      expiresAt: new Date(),
    });
  }

  async getUserActiveSessions(userId: string): Promise<Session[]> {
    return await this.sessionRepository.find({
      where: {
        userId,
        revokedAt: null,
        expiresAt: new Date(),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getMostRecentSessionEnvironment(userId: string): Promise<string | null> {
    const session = await this.sessionRepository.findOne({
      where: {
        userId,
        revokedAt: null,
      },
      order: { lastActivityAt: 'DESC' },
    });
    
    return session?.environment || null;
  }
}