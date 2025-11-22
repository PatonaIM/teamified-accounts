import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateSalaryComponentsTable1759369800000 implements MigrationInterface {
  name = 'CreateSalaryComponentsTable1759369800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'salary_components',
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
            enum: ['earnings', 'deductions', 'benefits', 'reimbursements'],
            isNullable: false,
          },
          {
            name: 'calculation_type',
            type: 'enum',
            enum: ['fixed_amount', 'percentage_of_basic', 'percentage_of_gross', 'percentage_of_net', 'formula'],
            isNullable: false,
          },
          {
            name: 'calculation_value',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'calculation_formula',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_taxable',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'is_statutory',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'is_mandatory',
            type: 'boolean',
            default: false,
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
    await queryRunner.query(`CREATE INDEX "IDX_salary_components_country_id" ON "salary_components" ("country_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_salary_components_component_type" ON "salary_components" ("component_type")`);
    await queryRunner.query(`CREATE INDEX "IDX_salary_components_is_active" ON "salary_components" ("is_active")`);
    await queryRunner.query(`CREATE INDEX "IDX_salary_components_country_code" ON "salary_components" ("country_id", "component_code")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('salary_components');
  }
}
