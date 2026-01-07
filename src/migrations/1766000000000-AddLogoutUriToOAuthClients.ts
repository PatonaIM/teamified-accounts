import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLogoutUriToOAuthClients1766000000000 implements MigrationInterface {
  name = 'AddLogoutUriToOAuthClients1766000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "oauth_clients" 
      ADD COLUMN IF NOT EXISTS "logout_uri" TEXT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "oauth_clients" 
      DROP COLUMN IF EXISTS "logout_uri"
    `);
  }
}
