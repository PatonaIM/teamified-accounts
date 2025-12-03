import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfilePictureUrlColumn1764210000000 implements MigrationInterface {
  name = 'AddProfilePictureUrlColumn1764210000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "profile_picture_url" TEXT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "profile_picture_url"
    `);
  }
}
