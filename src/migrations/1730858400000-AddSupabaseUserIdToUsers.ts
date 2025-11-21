import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSupabaseUserIdToUsers1730858400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add Supabase user ID column
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN supabase_user_id UUID UNIQUE;
    `);

    // Add index for faster lookups
    await queryRunner.query(`
      CREATE INDEX idx_users_supabase_id
      ON users(supabase_user_id);
    `);

    // Make password_hash nullable for Supabase-only users
    await queryRunner.query(`
      ALTER TABLE users
      ALTER COLUMN password_hash DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert password_hash to NOT NULL
    await queryRunner.query(`
      ALTER TABLE users
      ALTER COLUMN password_hash SET NOT NULL;
    `);

    // Drop index
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_users_supabase_id;
    `);

    // Drop column
    await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS supabase_user_id;
    `);
  }
}
