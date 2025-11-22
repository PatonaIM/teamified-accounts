import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOnboardingSubmittedAtToEmploymentRecords1729665000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'employment_records',
      new TableColumn({
        name: 'onboarding_submitted_at',
        type: 'timestamp with time zone',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('employment_records', 'onboarding_submitted_at');
  }
}
