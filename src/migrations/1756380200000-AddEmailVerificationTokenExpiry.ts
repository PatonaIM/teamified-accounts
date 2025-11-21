import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddEmailVerificationTokenExpiry1756380200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', new TableColumn({
      name: 'email_verification_token_expiry',
      type: 'timestamptz',
      isNullable: true,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'email_verification_token_expiry');
  }
}