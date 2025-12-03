import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserAppActivityTable1764700100000 implements MigrationInterface {
  name = 'CreateUserAppActivityTable1764700100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_app_activity" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "oauth_client_id" uuid NOT NULL,
        "action" varchar(100) NOT NULL,
        "feature" varchar(100),
        "description" varchar(255),
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_app_activity" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_app_activity_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_app_activity_oauth_client" FOREIGN KEY ("oauth_client_id") REFERENCES "oauth_clients"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_app_activity_user_client" ON "user_app_activity" ("user_id", "oauth_client_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_app_activity_client_created" ON "user_app_activity" ("oauth_client_id", "created_at" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_app_activity_client_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_app_activity_user_client"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_app_activity"`);
  }
}
