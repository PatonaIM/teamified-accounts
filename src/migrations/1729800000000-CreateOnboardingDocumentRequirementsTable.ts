import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateOnboardingDocumentRequirementsTable1729800000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'onboarding_document_requirements',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'cv_required',
            type: 'integer',
            default: 1,
          },
          {
            name: 'identity_required',
            type: 'integer',
            default: 1,
          },
          {
            name: 'employment_required',
            type: 'integer',
            default: 1,
          },
          {
            name: 'education_required',
            type: 'integer',
            default: 1,
          },
          {
            name: 'updated_by',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'NOW()',
          },
        ],
      }),
      true
    );

    // Insert default configuration row
    await queryRunner.query(`
      INSERT INTO onboarding_document_requirements (cv_required, identity_required, employment_required, education_required)
      VALUES (1, 1, 1, 1);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('onboarding_document_requirements');
  }
}
