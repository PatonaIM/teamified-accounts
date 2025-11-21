import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class ApiAnalyticsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ApiAnalyticsInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    const { method, url, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const ip = request.ip || 'Unknown';

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Log API usage for analytics
          this.logger.log(
            `API Call: ${method} ${url} - ${statusCode} - ${duration}ms - ${ip} - ${userAgent}`,
          );

          // Add response headers for analytics
          response.setHeader('X-Response-Time', `${duration}ms`);
          response.setHeader('X-API-Version', '1.0.0');
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          this.logger.error(
            `API Error: ${method} ${url} - ${statusCode} - ${duration}ms - ${ip} - ${userAgent} - ${error.message}`,
          );
        },
      }),
    );
  }
}
