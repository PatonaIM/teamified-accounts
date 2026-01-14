import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisRateLimiterService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisRateLimiterService.name);
  private redis: Redis | null = null;
  private readonly fallbackStore = new Map<string, { count: number; expiry: number }>();

  constructor(private configService: ConfigService) {
    this.initRedis();
  }

  private initRedis(): void {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    
    if (!redisUrl) {
      this.logger.warn('REDIS_URL not configured. Using in-memory fallback for rate limiting.');
      return;
    }

    try {
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      let errorLogged = false;
      this.redis.on('error', (err) => {
        if (!errorLogged) {
          this.logger.warn(`Redis rate limiter unavailable: ${err.message}. Using in-memory fallback.`);
          errorLogged = true;
        }
      });

      this.redis.on('connect', () => {
        this.logger.log('Redis connected for rate limiting');
      });

      this.redis.connect().catch((err) => {
        this.logger.warn(`Failed to connect to Redis: ${err.message}. Using in-memory fallback.`);
        this.redis = null;
      });
    } catch (error) {
      this.logger.warn(`Failed to initialize Redis: ${error.message}. Using in-memory fallback.`);
      this.redis = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  async checkRateLimit(
    key: string,
    maxAttempts: number,
    windowMs: number,
  ): Promise<{ allowed: boolean; currentCount: number }> {
    const fullKey = `rate_limit:${key}`;
    const windowSeconds = Math.ceil(windowMs / 1000);

    if (this.redis) {
      try {
        const current = await this.redis.incr(fullKey);
        
        if (current === 1) {
          await this.redis.expire(fullKey, windowSeconds);
        }

        return {
          allowed: current <= maxAttempts,
          currentCount: current,
        };
      } catch (error) {
        this.logger.error(`Redis rate limit check failed: ${error.message}`);
      }
    }

    return this.checkRateLimitFallback(fullKey, maxAttempts, windowMs);
  }

  private checkRateLimitFallback(
    key: string,
    maxAttempts: number,
    windowMs: number,
  ): { allowed: boolean; currentCount: number } {
    const now = Date.now();
    const entry = this.fallbackStore.get(key);

    if (!entry || now > entry.expiry) {
      this.fallbackStore.set(key, { count: 1, expiry: now + windowMs });
      this.cleanupFallbackStore();
      return { allowed: true, currentCount: 1 };
    }

    entry.count += 1;
    return {
      allowed: entry.count <= maxAttempts,
      currentCount: entry.count,
    };
  }

  private cleanupFallbackStore(): void {
    const now = Date.now();
    for (const [key, entry] of this.fallbackStore.entries()) {
      if (now > entry.expiry) {
        this.fallbackStore.delete(key);
      }
    }
  }
}
