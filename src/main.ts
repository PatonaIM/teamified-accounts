import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Request, Response } from 'express';
import * as express from 'express';
import * as path from 'path';
import { getTrustedOrigins, isPublicSuffix } from './common/utils/cookie.utils';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('🚀 Starting NestJS application...');
    logger.log(`Environment: ${process.env.NODE_ENV}`);
    logger.log(`Node version: ${process.version}`);
    logger.log(`Platform: ${process.platform}`);
    
    // Database configuration logging
    logger.log('📊 Database Configuration:');
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    logger.log(`  Database URL exists: ${!!dbUrl}`);
    if (dbUrl) {
      try {
        const urlParts = dbUrl.split('@');
        if (urlParts.length > 1) {
          const hostPart = urlParts[1];
          logger.log(`  Database host: ${hostPart.split('/')[0]}`);
        }
      } catch (e) {
        logger.warn(`  Could not parse database URL: ${e.message}`);
      }
    }
    
    // Redis configuration logging
    logger.log('🔴 Redis Configuration:');
    const hasVercelKV = !!process.env.KV_URL;
    const hasRedisUrl = !!process.env.REDIS_URL;
    
    logger.log(`  Vercel KV_URL exists: ${hasVercelKV}`);
    logger.log(`  Standard REDIS_URL exists: ${hasRedisUrl}`);
    
    if (hasRedisUrl) {
      logger.log('  Using standard REDIS_URL configuration');
      try {
        const url = new URL(process.env.REDIS_URL);
        logger.log(`  Redis host: ${url.hostname}`);
        logger.log(`  Redis port: ${url.port}`);
        logger.log(`  Redis username: ${url.username || 'default'}`);
      } catch (e) {
        logger.warn(`  Could not parse REDIS_URL: ${e.message}`);
      }
    } else if (hasVercelKV) {
      logger.log('  Using Vercel KV configuration');
      logger.log(`  KV_REST_API_TOKEN exists: ${!!process.env.KV_REST_API_TOKEN}`);
      logger.log(`  KV_REST_API_URL exists: ${!!process.env.KV_REST_API_URL}`);
      if (process.env.KV_REST_API_URL) {
        logger.log(`  Redis host: ${process.env.KV_REST_API_URL.replace('https://', '')}`);
      }
    } else {
      logger.warn('  ⚠️ No Redis configuration found (neither REDIS_URL nor KV_URL)');
    }
    
    logger.log('📦 Creating NestJS application...');
    logger.log('  This step initializes all modules, connects to database, and sets up dependency injection');
    logger.log('  This may take 10-30 seconds depending on connection speed...');
    
    const appCreationStart = Date.now();
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
      abortOnError: false, // Don't immediately exit on error, let us handle it
    });
    const appCreationTime = Date.now() - appCreationStart;
    
    logger.log(`✅ NestJS application created successfully in ${appCreationTime}ms`);
    
    // Trust proxy headers to get real client IP addresses
    // This is required when running behind load balancers, reverse proxies, or cloud platforms like Replit
    // Without this, req.ip returns 127.0.0.1 instead of the actual client IP
    app.getHttpAdapter().getInstance().set('trust proxy', true);
    logger.log('✅ Trust proxy enabled for real client IP detection');
    
    const configService = app.get(ConfigService);
    logger.log('✅ ConfigService initialized');

    // Enable CORS - Dynamic configuration based on environment
    logger.log('Configuring CORS...');
    
    // On public suffix domains (staging), we use SameSite=none cookies
    // This requires restricting CORS to trusted origins for security
    const useRestrictedCors = isPublicSuffix();
    const trustedOrigins = getTrustedOrigins();
    
    if (useRestrictedCors && trustedOrigins.length > 0) {
      // Staging: Restricted CORS with allowlist (required for SameSite=none security)
      app.enableCors({
        origin: (origin, callback) => {
          // Allow requests with no origin (same-origin, server-to-server, Postman, etc)
          if (!origin) {
            callback(null, true);
            return;
          }
          
          // Check if origin is in trusted list
          if (trustedOrigins.some(trusted => origin === trusted || origin.endsWith(trusted.replace('https://', '.')))) {
            // Must pass the origin string (not boolean) when credentials: true
            callback(null, origin);
          } else {
            // For staging, also allow any .replit.app origin (all Teamified staging apps)
            if (origin.includes('.replit.app') || origin.includes('.replit.dev')) {
              // Must pass the origin string (not boolean) when credentials: true
              callback(null, origin);
            } else {
              logger.warn(`CORS blocked origin: ${origin}`);
              callback(new Error('Not allowed by CORS'));
            }
          }
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Requested-With'],
        credentials: true,
      });
      logger.log(`✅ CORS configured with trusted origins allowlist (staging mode)`);
      logger.log(`   Trusted origins: ${trustedOrigins.join(', ')}`);
      logger.log(`   Also allowing: *.replit.app, *.replit.dev`);
    } else {
      // Production: Allow all origins (cookies are protected by SameSite=lax + domain)
      app.enableCors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Requested-With'],
        credentials: true,
      });
      logger.log('✅ CORS configured to allow ALL origins (production mode)');
    }

    // Global validation pipe
    logger.log('Setting up validation pipe...');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    logger.log('✅ Validation pipe configured');

    // API versioning
    // Global prefix 'api' is prepended to all routes
    // Controllers should use pattern: @Controller('v1/module/resource')
    // This results in final route: /api/v1/module/resource
    logger.log('Setting global API prefix...');
    app.setGlobalPrefix('api');
    logger.log('✅ Global prefix set to /api');

    // Cookie parser middleware
    logger.log('Setting up cookie parser...');
    const cookieParser = require('cookie-parser');
    app.use(cookieParser());
    logger.log('✅ Cookie parser configured');

    // Serve static frontend files in production
    const isProduction = configService.get('NODE_ENV') === 'production';
    let frontendPath: string;
    
    if (isProduction) {
      logger.log('Setting up static file serving for production...');
      const expressApp = app.getHttpAdapter().getInstance();
      
      // In production, frontend files are copied to dist/public during build
      frontendPath = path.join(__dirname, 'public');
      
      logger.log(`Attempting to serve frontend from: ${frontendPath}`);
      
      // Serve static assets with proper cache headers
      expressApp.use(express.static(frontendPath, {
        maxAge: '1d',
        etag: true,
        lastModified: true,
        index: false, // Don't serve index.html automatically
      }));
      
      logger.log(`✅ Static assets middleware configured for: ${frontendPath}`);
    }

    // Swagger documentation - Always enabled, but protected by JWT
    logger.log('Setting up Swagger documentation...');
    const config = new DocumentBuilder()
      .setTitle('Teamified Accounts API')
      .setDescription(`
        # Teamified Accounts API Documentation
        
        This API provides comprehensive endpoints for SSO authentication, user management, multi-organization support, and access control for the Teamified Accounts platform.
        
        ## Key Capabilities
        
        ### 🔐 Core Platform
        - **Authentication & Authorization** - JWT-based authentication with role-based access control (RBAC)
        - **OAuth 2.0 SSO Provider** - Federated authentication for third-party applications
        - **Multi-Organization Architecture** - Client scoping with granular permission management
        - **Audit Trail** - Comprehensive logging of all critical operations for compliance
        
        ### 👥 User Operations
        - **User Management** - Complete profile management with data validation
        - **Invitation System** - Email-based invitations with role assignment
        - **Document Management** - Upload, versioning, secure download, and verification workflows
        - **Hiring Module** - Job requests, interview scheduling with calendar view, talent pool tracking
        
        ### 🎨 Developer Experience
        - **API Key Management** - Programmatic access with read-only/full-access permissions (10 keys max)
        - **Theme System** - Customizable UI with 5 preset themes and custom theme editor
        - **OpenAPI Documentation** - Interactive API exploration with this Swagger UI
        - **Health Monitoring** - System health checks and service status endpoints
        
        ## Authentication
        Most endpoints require JWT authentication. Use the \`/api/v1/auth/login\` endpoint to obtain a token, then include it in the Authorization header as \`Bearer <token>\`.
        
        ### Public Endpoints (No Authentication Required)
        The following endpoints are publicly accessible without JWT authentication:
        
        **Health Monitoring:**
        - \`GET /api/health\` - Basic health check for monitoring and load balancers
        - \`GET /api/health/detailed\` - Detailed health check with service status
        
        **Authentication:**
        - \`POST /api/v1/auth/login\` - User login to obtain access and refresh tokens
        - \`POST /api/v1/auth/accept-invitation\` - Accept invitation and create user account
        - \`POST /api/v1/auth/verify-email\` - Verify email address with verification token
        - \`POST /api/v1/auth/refresh\` - Refresh access token using refresh token
        - \`POST /api/v1/auth/logout\` - Logout and invalidate session
        - \`POST /api/v1/auth/supabase/exchange\` - Exchange Supabase token for JWT
        
        **OAuth 2.0 / SSO:**
        - \`GET /api/v1/sso/authorize\` - OAuth authorization endpoint for federated authentication
        - \`POST /api/v1/sso/token\` - Token exchange endpoint for OAuth flow
        
        ### Protected Endpoints
        All other endpoints require a valid JWT access token in the Authorization header. Protected endpoints include user management, organization management, invitations, audit logs, and administrative functions.
        
        ## Rate Limiting
        Authentication endpoints are rate-limited to prevent abuse. Please respect the rate limits and implement appropriate retry logic.
        
        ## Support
        For technical support or questions about this API, please contact the development team.
      `)
      .setVersion('1.0.0')
      .setContact('Teamified Development Team', 'https://teamified.com', 'dev@teamified.com')
      .setLicense('Proprietary', 'https://teamified.com/license')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth'
      )
      .addServer('http://localhost:3000', 'Development server')
      .addServer('https://api.teamified.com', 'Production server')
      .addServer('https://staging-api.teamified.com', 'Staging server')
      .addTag('authentication', 'Authentication and user management endpoints')
      .addTag('users', 'User profile and management endpoints')
      .addTag('invitations', 'Invitation management endpoints')
      .addTag('health', 'Health check and monitoring endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    
    // Create custom Swagger UI endpoint to avoid asset loading issues
    const expressApp = app.getHttpAdapter().getInstance();
    
    // Setup Swagger JSON endpoint (public - no authentication required)
    expressApp.get('/api/docs-json', (req: Request, res: Response) => {
      res.json(document);
    });
    
    // Setup Swagger UI endpoint (public - no authentication required)
    expressApp.get('/api/docs', (req: Request, res: Response) => {
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Teamified Accounts API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <link rel="icon" href="/favicon.ico" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #2c3e50; }
    .swagger-ui .scheme-container { background: #f8f9fa; padding: 10px; border-radius: 4px; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/api/docs-json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        persistAuthorization: true,
        displayRequestDuration: true,
        showExtensions: true,
        showCommonExtensions: true,
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true
      });
    };
  </script>
</body>
</html>`;
      res.send(html);
    });

      logger.log('✅ Swagger documentation configured at: /api/docs (public access - no authentication required)');

    // SPA fallback route - must be registered AFTER all API routes
    // This catches all non-API routes and serves the SPA index.html
    // CRITICAL: The regex /^(?!\/api).*$/ excludes /api routes so they reach NestJS controllers
    if (isProduction && frontendPath) {
      const expressApp = app.getHttpAdapter().getInstance();
      expressApp.get(/^(?!\/api).*$/, (req: Request, res: Response) => {
        // Serve index.html for all non-API routes (SPA will handle routing)
        const indexPath = path.join(frontendPath, 'index.html');
        res.sendFile(indexPath, (err) => {
          if (err) {
            logger.error(`Failed to serve index.html from ${indexPath}:`, err);
            res.status(404).send('Frontend not found');
          }
        });
      });
      logger.log('✅ SPA fallback route configured (excludes /api routes)');
    }

    // Port configuration: Check if PORT env var is explicitly set
    // Production sets PORT=5000 in .replit [userenv.production]
    // Development doesn't set PORT, so default to 3000 to avoid frontend conflict
    const portEnvVar = configService.get('PORT');
    const nodeEnv = configService.get('NODE_ENV');
    
    let port: number;
    if (portEnvVar) {
      // PORT explicitly set (production): Use the configured value
      port = Number(portEnvVar);
      logger.log(`PORT environment variable found: Using port ${port} (NODE_ENV=${nodeEnv})`);
    } else {
      // PORT not set (development): Use 3000 to avoid conflict with frontend on 5000
      port = 3000;
      logger.log(`PORT not set: Using default port 3000 for development (frontend uses 5000)`);
    }
    
    const host = configService.get('HOST', '0.0.0.0');
    
    logger.log(`Final port determination: NODE_ENV=${nodeEnv}, PORT env=${portEnvVar}, npm_lifecycle_event=${process.env.npm_lifecycle_event}, listening on port ${port}`);
    
    // Check if running in Vercel serverless environment
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
    
    // In Vercel serverless, don't call listen - return Express instance
    if (isVercel) {
      logger.log('Vercel serverless mode: Initializing app without listening...');
      await app.init();
      const expressApp = app.getHttpAdapter().getInstance();
      logger.log('✅ Express app instance ready for serverless');
      logger.log('✅ Bootstrap completed successfully');
      return expressApp;
    } else {
      // In all other environments (dev, Replit Preview, Replit Published VM), start the server normally
      logger.log(`Starting server on ${host}:${port}...`);
      await app.listen(port, host);
      logger.log(`🚀 Application is running on: http://${host}:${port}`);
      logger.log(`📚 API documentation: http://${host}:${port}/api/docs`);
      logger.log('✅ Bootstrap completed successfully');
      return app;
    }
    
  } catch (error) {
    logger.error('❌ Failed to bootstrap application');
    logger.error(`Error name: ${error.name}`);
    logger.error(`Error message: ${error.message}`);
    logger.error(`Error stack: ${error.stack}`);
    
    // Log additional error details
    if (error.code) logger.error(`Error code: ${error.code}`);
    if (error.errno) logger.error(`Error errno: ${error.errno}`);
    if (error.syscall) logger.error(`Error syscall: ${error.syscall}`);
    
    // Give time for logs to flush before exiting
    console.error('FATAL ERROR - Application failed to start:', error);
    console.error('Stack trace:', error.stack);
    
    // Force flush and wait before exit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    process.exit(1);
  }
}

// Cached app instance for Vercel
let cachedApp: any = null;

// For Vercel serverless functions
export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    const logger = new Logger('VercelHandler');
    logger.log('🥶 Cold start - initializing full app...');
    const startTime = Date.now();
    cachedApp = await bootstrap();
    const duration = Date.now() - startTime;
    logger.log(`✅ App initialized in ${duration}ms`);
  }
  
  // Handle the request with the Express app
  return cachedApp(req, res);
}

// Global error handlers for uncaught errors
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION - Application crashed:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION - Application crashed:', reason);
  console.error('Promise:', promise);
  if (reason && typeof reason === 'object' && 'stack' in reason) {
    console.error('Stack:', (reason as Error).stack);
  }
  process.exit(1);
});

// For local development and Replit (not Vercel)
if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
  const logger = new Logger('Main');
  logger.log('Running in development mode, starting bootstrap...');
  bootstrap().catch(err => {
    logger.error('Failed to start application:', err);
    console.error('BOOTSTRAP FAILED:', err);
    process.exit(1);
  });
} else {
  const logger = new Logger('Main');
  logger.log('Running in production mode (serverless)');
}