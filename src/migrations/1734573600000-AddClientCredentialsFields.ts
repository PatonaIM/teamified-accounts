import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientCredentialsFields1734573600000 implements MigrationInterface {
  name = 'AddClientCredentialsFields1734573600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE oauth_clients 
      ADD COLUMN IF NOT EXISTS allow_client_credentials BOOLEAN DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE oauth_clients 
      ADD COLUMN IF NOT EXISTS allowed_scopes TEXT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE oauth_clients DROP COLUMN IF EXISTS allow_client_credentials
    `);
    await queryRunner.query(`
      ALTER TABLE oauth_clients DROP COLUMN IF EXISTS allowed_scopes
    `);
  }
}
