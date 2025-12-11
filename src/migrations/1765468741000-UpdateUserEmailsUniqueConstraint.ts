import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserEmailsUniqueConstraint1765468741000 implements MigrationInterface {
  name = 'UpdateUserEmailsUniqueConstraint1765468741000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Drop the old unique constraint on email only
    await queryRunner.query(`
      ALTER TABLE user_emails 
      DROP CONSTRAINT IF EXISTS user_emails_email_key
    `);

    // Step 2: Add new unique constraint on email + organization_id
    // This allows same email with different organization contexts
    await queryRunner.query(`
      ALTER TABLE user_emails 
      ADD CONSTRAINT user_emails_email_org_unique UNIQUE (email, organization_id)
    `);

    // Step 3: Update existing personal emails to be marked as primary
    await queryRunner.query(`
      UPDATE user_emails 
      SET is_primary = true, updated_at = NOW()
      WHERE email_type = 'personal' AND is_primary = false
    `);

    // Step 4: Add personal email records for ALL users who don't have one yet
    await queryRunner.query(`
      INSERT INTO user_emails (id, user_id, email, email_type, is_primary, is_verified, added_at, updated_at)
      SELECT 
        gen_random_uuid(),
        u.id,
        u.email,
        'personal',
        true,
        COALESCE(u.email_verified, false),
        COALESCE(u.created_at, NOW()),
        NOW()
      FROM users u
      WHERE NOT EXISTS (
        SELECT 1 FROM user_emails ue 
        WHERE ue.user_id = u.id AND ue.email_type = 'personal'
      )
      ON CONFLICT (email, organization_id) DO NOTHING
    `);

    // Step 5: Add work email records for ALL organization memberships
    await queryRunner.query(`
      INSERT INTO user_emails (id, user_id, email, email_type, organization_id, is_primary, is_verified, added_at, updated_at)
      SELECT 
        gen_random_uuid(),
        u.id,
        u.email,
        'work',
        om.organization_id,
        false,
        COALESCE(u.email_verified, false),
        COALESCE(om.joined_at, NOW()),
        NOW()
      FROM users u
      INNER JOIN organization_members om ON u.id = om.user_id
      WHERE NOT EXISTS (
        SELECT 1 FROM user_emails ue 
        WHERE ue.user_id = u.id 
          AND ue.organization_id = om.organization_id 
          AND ue.email_type = 'work'
      )
      ON CONFLICT (email, organization_id) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Remove all work email records first (they cause duplicates under old constraint)
    await queryRunner.query(`
      DELETE FROM user_emails WHERE email_type = 'work'
    `);

    // Step 2: Remove duplicate personal emails, keeping only one per email address
    // This handles the case where organization_id = NULL could create duplicates
    await queryRunner.query(`
      DELETE FROM user_emails a
      USING user_emails b
      WHERE a.email = b.email 
        AND a.email_type = 'personal' 
        AND b.email_type = 'personal'
        AND a.id > b.id
    `);

    // Step 3: Drop the new constraint
    await queryRunner.query(`
      ALTER TABLE user_emails 
      DROP CONSTRAINT IF EXISTS user_emails_email_org_unique
    `);

    // Step 4: Restore the original unique constraint
    await queryRunner.query(`
      ALTER TABLE user_emails 
      ADD CONSTRAINT user_emails_email_key UNIQUE (email)
    `);
  }
}
