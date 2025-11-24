import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultIntentToOAuthClients1732436400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "oauth_client_intent_enum" AS ENUM ('client', 'candidate', 'both')
    `);

    await queryRunner.query(`
      ALTER TABLE "oauth_clients"
      ADD COLUMN "default_intent" "oauth_client_intent_enum" NOT NULL DEFAULT 'both'
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_oauth_clients_default_intent" ON "oauth_clients"("default_intent")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_oauth_clients_default_intent"`);
    await queryRunner.query(`ALTER TABLE "oauth_clients" DROP COLUMN "default_intent"`);
    await queryRunner.query(`DROP TYPE "oauth_client_intent_enum"`);
  }
}
