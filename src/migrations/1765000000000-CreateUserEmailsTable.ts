import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserEmailsTable1765000000000 implements MigrationInterface {
  name = 'CreateUserEmailsTable1765000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_emails (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL UNIQUE,
        email_type VARCHAR(20) NOT NULL DEFAULT 'personal',
        organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        verification_token VARCHAR(255),
        verification_token_expiry TIMESTAMPTZ,
        verified_at TIMESTAMPTZ,
        added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_emails_user_id ON user_emails(user_id);
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_emails_email ON user_emails(email);
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_emails_organization_id ON user_emails(organization_id);
    `);

    await queryRunner.query(`
      INSERT INTO user_emails (user_id, email, email_type, is_primary, is_verified, verified_at)
      SELECT id, email, 'personal', true, email_verified, 
             CASE WHEN email_verified THEN updated_at ELSE NULL END
      FROM users
      WHERE email IS NOT NULL AND deleted_at IS NULL
      ON CONFLICT (email) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS user_emails CASCADE;`);
  }
}
