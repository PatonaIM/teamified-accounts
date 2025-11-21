import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateApiKeysTable1762580000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "api_keys" (
        "id" SERIAL PRIMARY KEY,
        "name" varchar(100) NOT NULL,
        "keyPrefix" varchar(10) NOT NULL,
        "keyHash" varchar(255) NOT NULL UNIQUE,
        "type" varchar(20) NOT NULL DEFAULT 'read-only',
        "userId" integer NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "lastUsedAt" timestamp,
        "isActive" boolean NOT NULL DEFAULT true
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_API_KEY_PREFIX" ON "api_keys"("keyPrefix")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_API_KEY_HASH" ON "api_keys"("keyHash")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_API_KEY_USER" ON "api_keys"("userId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_API_KEY_USER"`);
    await queryRunner.query(`DROP INDEX "IDX_API_KEY_HASH"`);
    await queryRunner.query(`DROP INDEX "IDX_API_KEY_PREFIX"`);
    await queryRunner.query(`DROP TABLE "api_keys"`);
  }
}
