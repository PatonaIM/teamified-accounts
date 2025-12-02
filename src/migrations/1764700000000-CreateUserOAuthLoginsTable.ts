import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserOAuthLoginsTable1764700000000 implements MigrationInterface {
  name = 'CreateUserOAuthLoginsTable1764700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_oauth_logins" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "oauth_client_id" uuid NOT NULL,
        "login_count" integer NOT NULL DEFAULT 1,
        "first_login_at" TIMESTAMP,
        "last_login_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_oauth_logins" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_oauth_logins_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_oauth_logins_oauth_client" FOREIGN KEY ("oauth_client_id") REFERENCES "oauth_clients"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_user_oauth_logins_user_client" ON "user_oauth_logins" ("user_id", "oauth_client_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_oauth_logins_last_login" ON "user_oauth_logins" ("last_login_at" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_oauth_logins_last_login"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_oauth_logins_user_client"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_oauth_logins"`);
  }
}
