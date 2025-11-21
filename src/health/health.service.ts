import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: 0,
      environment: 'development',
      version: '1.0.0',
    };
  }

  async detailedCheck() {
    return {
      ...await this.check(),
      services: {
        database: 'ok',
        redis: 'ok',
      },
    };
  }
}
