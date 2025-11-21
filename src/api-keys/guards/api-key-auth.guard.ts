import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeysService } from '../services/api-keys.service';
import { ApiKeyType } from '../entities/api-key.entity';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Try to get API key from headers
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    try {
      // Validate the key and get user info
      const { userId, type } = await this.apiKeysService.validateKey(apiKey);

      // Check if read-only key is trying to access non-GET endpoints
      const method = request.method;
      if (type === ApiKeyType.READ_ONLY && method !== 'GET') {
        throw new UnauthorizedException(
          'Read-only API keys can only access GET endpoints',
        );
      }

      // Attach user info to request (same format as JWT auth)
      request.user = { id: userId.toString(), apiKeyType: type };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired API key');
    }
  }

  private extractApiKey(request: any): string | null {
    // Check Authorization header: "Bearer tmf_..."
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer tmf_')) {
      return authHeader.substring(7); // Remove 'Bearer '
    }

    // Check X-API-Key header
    const apiKeyHeader = request.headers['x-api-key'];
    if (apiKeyHeader) {
      return apiKeyHeader;
    }

    return null;
  }
}
