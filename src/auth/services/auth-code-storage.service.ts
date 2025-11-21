import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';

interface AuthCodeData {
  code: string;
  userId: string;
  clientId: string;
  redirectUri: string;
  state?: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  expiresAt: number;
  used: boolean;
}

@Injectable()
export class AuthCodeStorageService {
  private readonly logger = new Logger(AuthCodeStorageService.name);
  private readonly codes = new Map<string, AuthCodeData>();
  private readonly CODE_TTL = 60 * 1000; // 60 seconds

  constructor() {
    // Cleanup expired codes every 30 seconds
    setInterval(() => this.cleanupExpiredCodes(), 30000);
  }

  /**
   * Generate and store a new authorization code
   */
  async createAuthCode(data: {
    userId: string;
    clientId: string;
    redirectUri: string;
    state?: string;
    codeChallenge?: string;
    codeChallengeMethod?: string;
  }): Promise<string> {
    const code = this.generateSecureCode();
    const expiresAt = Date.now() + this.CODE_TTL;

    const authCodeData: AuthCodeData = {
      code,
      userId: data.userId,
      clientId: data.clientId,
      redirectUri: data.redirectUri,
      state: data.state,
      codeChallenge: data.codeChallenge,
      codeChallengeMethod: data.codeChallengeMethod,
      expiresAt,
      used: false,
    };

    this.codes.set(code, authCodeData);

    this.logger.debug(
      `Created auth code for user ${data.userId}, client ${data.clientId}, expires in 60s`,
    );

    return code;
  }

  /**
   * Validate and consume an authorization code (single use)
   */
  async validateAndConsumeCode(code: string): Promise<AuthCodeData | null> {
    const authCodeData = this.codes.get(code);

    if (!authCodeData) {
      this.logger.warn(`Auth code not found: ${code.substring(0, 8)}...`);
      return null;
    }

    // Check if already used
    if (authCodeData.used) {
      this.logger.warn(
        `Auth code already used: ${code.substring(0, 8)}... for user ${authCodeData.userId}`,
      );
      this.codes.delete(code); // Delete to prevent further attempts
      return null;
    }

    // Check if expired
    if (Date.now() > authCodeData.expiresAt) {
      this.logger.warn(
        `Auth code expired: ${code.substring(0, 8)}... for user ${authCodeData.userId}`,
      );
      this.codes.delete(code);
      return null;
    }

    // Mark as used and return
    authCodeData.used = true;
    this.codes.set(code, authCodeData);

    this.logger.debug(
      `Auth code consumed for user ${authCodeData.userId}, client ${authCodeData.clientId}`,
    );

    // Delete after a short delay to prevent timing attacks
    setTimeout(() => this.codes.delete(code), 5000);

    return authCodeData;
  }

  /**
   * Generate a cryptographically secure authorization code
   */
  private generateSecureCode(): string {
    return randomBytes(32).toString('base64url');
  }

  /**
   * Clean up expired authorization codes
   */
  private cleanupExpiredCodes(): void {
    const now = Date.now();
    let deletedCount = 0;

    for (const [code, data] of this.codes.entries()) {
      if (now > data.expiresAt) {
        this.codes.delete(code);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      this.logger.debug(`Cleaned up ${deletedCount} expired auth codes`);
    }
  }

  /**
   * Get statistics (for monitoring/debugging)
   */
  getStats() {
    return {
      totalCodes: this.codes.size,
      activeCodes: Array.from(this.codes.values()).filter(
        (c) => !c.used && Date.now() <= c.expiresAt,
      ).length,
    };
  }
}
