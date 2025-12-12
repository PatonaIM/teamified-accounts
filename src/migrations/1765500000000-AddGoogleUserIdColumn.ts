import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleUserIdColumn1765500000000 implements MigrationInterface {
  name = 'AddGoogleUserIdColumn1765500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_user_id" VARCHAR(100) UNIQUE
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_google_user_id" ON "users" ("google_user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_google_user_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "google_user_id"`);
  }
}
