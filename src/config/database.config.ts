import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../auth/entities/user.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { Session } from '../auth/entities/session.entity';
import { UserTheme } from '../themes/entities/user-theme.entity';
import { OAuthClient } from '../oauth-clients/entities/oauth-client.entity';
import { ApiKey } from '../api-keys/entities/api-key.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { OrganizationMember } from '../organizations/entities/organization-member.entity';
import { UserAppPermission } from '../user-app-permissions/entities/user-app-permission.entity';
import { UserOAuthLogin } from '../sso/entities/user-oauth-login.entity';
import { UserAppActivity } from '../sso/entities/user-app-activity.entity';
import { UserEmail } from '../user-emails/entities/user-email.entity';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const postgresUrl = configService.get('POSTGRES_URL') || configService.get('DATABASE_URL');
  const nodeEnv = configService.get('NODE_ENV');
  
  // If POSTGRES_URL/DATABASE_URL doesn't exist, build from individual env variables
  const config: TypeOrmModuleOptions = {
    type: 'postgres',
    ...(postgresUrl ? { url: postgresUrl } : {
      host: configService.get<string>('DATABASE_HOST', 'localhost'),
      port: parseInt(configService.get<string>('DATABASE_PORT', '5432'), 10),
      username: configService.get<string>('DATABASE_USER', 'postgres'),
      password: configService.get<string>('DATABASE_PASSWORD', 'password'),
      database: configService.get<string>('DATABASE_NAME', 'teamified_portal'),
    }),
    ssl: postgresUrl ? { rejectUnauthorized: false } : false,
    entities: [
    User,
    AuditLog,
    UserRole,
    Invitation,
    Session,
    UserTheme,
    OAuthClient,
    ApiKey,
    Organization,
    OrganizationMember,
    UserAppPermission,
    UserOAuthLogin,
    UserAppActivity,
    UserEmail,
  ],
  synchronize: false, // Use SQL scripts instead of migrations
  logging: configService.get('NODE_ENV') === 'development',
  extra: {
    connectionLimit: 5,  // Reduced for serverless
    acquireTimeoutMillis: 10000,  // Faster timeout for serverless
    timeout: 10000,  // Faster query timeout
    max: 5,  // Maximum pool size
    idleTimeoutMillis: 30000,  // Close idle connections faster
    connectionTimeoutMillis: 15000,  // Timeout for establishing connection
    statement_timeout: 30000,  // PostgreSQL statement timeout (30 seconds)
  },
  // Retry logic for transient connection failures
  retryAttempts: 3,
  retryDelay: 3000,
  // Add connection lifecycle logging
  subscribers: [],
  migrations: [],
  logger: 'advanced-console',
  };
  
  return config;
};