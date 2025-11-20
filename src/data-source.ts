import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './auth/entities/user.entity';
import { AuditLog } from './audit/entities/audit-log.entity';
import { UserRole } from './user-roles/entities/user-role.entity';
import { Invitation } from './invitations/entities/invitation.entity';
import { Session } from './auth/entities/session.entity';
import { ApiKey } from './api-keys/entities/api-key.entity';
import { Organization } from './organizations/entities/organization.entity';
import { OrganizationMember } from './organizations/entities/organization-member.entity';

// Load environment variables
config();

const postgresUrl = process.env.POSTGRES_URL;
const nodeEnv = process.env.NODE_ENV;

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(postgresUrl ? { url: postgresUrl } : {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'teamified_portal',
  }),
  ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  entities: [
    User,
    AuditLog,
    UserRole,
    Invitation,
    Session,
    ApiKey,
    Organization,
    OrganizationMember,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: nodeEnv === 'development',
});
