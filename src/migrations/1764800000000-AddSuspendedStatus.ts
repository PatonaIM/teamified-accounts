import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSuspendedStatus1764800000000 implements MigrationInterface {
  name = 'AddSuspendedStatus1764800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "CHK_users_status"
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "CHK_8a0f52e6c79e5e8e3c5e5e8e3c"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "CHK_users_status" 
      CHECK ("status" IN ('active', 'inactive', 'archived', 'invited', 'suspended'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "CHK_users_status"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "CHK_users_status" 
      CHECK ("status" IN ('active', 'inactive', 'archived', 'invited'))
    `);
  }
}
