import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeLogoutUriToLogoutUris1767800000000 implements MigrationInterface {
  name = 'ChangeLogoutUriToLogoutUris1767800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if logout_uri column exists and logout_uris doesn't
    const hasLogoutUri = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'oauth_clients' AND column_name = 'logout_uri'
    `);
    
    const hasLogoutUris = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'oauth_clients' AND column_name = 'logout_uris'
    `);

    if (hasLogoutUri.length > 0 && hasLogoutUris.length === 0) {
      // Add new logout_uris column
      await queryRunner.query(`ALTER TABLE "oauth_clients" ADD "logout_uris" jsonb DEFAULT '[]'`);
      
      // Migrate existing logout_uri data to logout_uris array format
      await queryRunner.query(`
        UPDATE "oauth_clients" 
        SET "logout_uris" = CASE 
          WHEN "logout_uri" IS NOT NULL AND "logout_uri" != '' 
          THEN jsonb_build_array(jsonb_build_object('uri', "logout_uri", 'environment', 'production'))
          ELSE '[]'::jsonb 
        END
      `);
      
      // Drop the old logout_uri column
      await queryRunner.query(`ALTER TABLE "oauth_clients" DROP COLUMN "logout_uri"`);
    } else if (hasLogoutUris.length === 0) {
      // Just add the new column if neither exists
      await queryRunner.query(`ALTER TABLE "oauth_clients" ADD "logout_uris" jsonb DEFAULT '[]'`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasLogoutUris = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'oauth_clients' AND column_name = 'logout_uris'
    `);
    
    const hasLogoutUri = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'oauth_clients' AND column_name = 'logout_uri'
    `);

    if (hasLogoutUris.length > 0 && hasLogoutUri.length === 0) {
      // Add back the old logout_uri column
      await queryRunner.query(`ALTER TABLE "oauth_clients" ADD "logout_uri" text`);
      
      // Migrate first logout URI back to single string
      await queryRunner.query(`
        UPDATE "oauth_clients" 
        SET "logout_uri" = CASE 
          WHEN jsonb_array_length("logout_uris") > 0 
          THEN "logout_uris"->0->>'uri'
          ELSE NULL 
        END
      `);
      
      // Drop the logout_uris column
      await queryRunner.query(`ALTER TABLE "oauth_clients" DROP COLUMN "logout_uris"`);
    }
  }
}
