import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastActivityAtToSessions1763653000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sessions"
      ADD COLUMN "last_activity_at" timestamp with time zone NOT NULL DEFAULT NOW()
    `);

    await queryRunner.query(`
      UPDATE "sessions"
      SET "last_activity_at" = "created_at"
      WHERE "last_activity_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sessions"
      DROP COLUMN "last_activity_at"
    `);
  }
}
