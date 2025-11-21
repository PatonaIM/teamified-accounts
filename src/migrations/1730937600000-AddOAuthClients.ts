import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOAuthClients1730937600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "oauth_clients" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "client_id" varchar NOT NULL UNIQUE,
        "client_secret" varchar NOT NULL,
        "name" varchar NOT NULL,
        "description" text,
        "redirect_uris" text NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "metadata" jsonb,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "created_by" uuid
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_oauth_clients_client_id" ON "oauth_clients"("client_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_oauth_clients_is_active" ON "oauth_clients"("is_active")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_oauth_clients_is_active"`);
    await queryRunner.query(`DROP INDEX "idx_oauth_clients_client_id"`);
    await queryRunner.query(`DROP TABLE "oauth_clients"`);
  }
}
