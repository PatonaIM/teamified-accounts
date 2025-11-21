import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateStatutoryComponentsTable1759369800001 implements MigrationInterface {
  name = 'CreateStatutoryComponentsTable1759369800001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'statutory_components',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'country_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'component_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'component_code',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'component_type',
            type: 'enum',
            enum: ['epf', 'esi', 'pt', 'tds', 'sss', 'philhealth', 'pagibig', 'superannuation', 'epf_my', 'socso', 'eis', 'cpf'],
            isNullable: false,
          },
          {
            name: 'contribution_type',
            type: 'enum',
            enum: ['employee', 'employer', 'both'],
            isNullable: false,
          },
          {
            name: 'calculation_basis',
            type: 'enum',
            enum: ['gross_salary', 'basic_salary', 'capped_amount', 'fixed_amount'],
            isNullable: false,
          },
          {
            name: 'employee_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'employer_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'minimum_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'maximum_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'wage_ceiling',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'wage_floor',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'effective_from',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'effective_to',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'is_mandatory',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'display_order',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'regulatory_reference',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['country_id'],
            referencedTableName: 'countries',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_statutory_components_country_id" ON "statutory_components" ("country_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_statutory_components_component_type" ON "statutory_components" ("component_type")`);
    await queryRunner.query(`CREATE INDEX "IDX_statutory_components_is_active" ON "statutory_components" ("is_active")`);
    await queryRunner.query(`CREATE INDEX "IDX_statutory_components_country_code" ON "statutory_components" ("country_id", "component_code")`);
    await queryRunner.query(`CREATE INDEX "IDX_statutory_components_effective_dates" ON "statutory_components" ("effective_from", "effective_to")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('statutory_components');
  }
}
