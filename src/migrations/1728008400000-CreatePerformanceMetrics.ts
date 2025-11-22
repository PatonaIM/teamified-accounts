import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePerformanceMetrics1728008400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create performance_metrics table
    await queryRunner.createTable(
      new Table({
        name: 'performance_metrics',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'metric_type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'metric_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'metric_value',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'metric_unit',
            type: 'varchar',
            length: '20',
            default: "'ms'",
          },
          {
            name: 'payroll_period_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'processing_log_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'country_id',
            type: 'varchar',
            length: '2',
            isNullable: true,
          },
          {
            name: 'additional_data',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'recorded_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'performance_metrics',
      new TableIndex({
        name: 'IDX_performance_metrics_metric_type_recorded_at',
        columnNames: ['metric_type', 'recorded_at'],
      }),
    );

    await queryRunner.createIndex(
      'performance_metrics',
      new TableIndex({
        name: 'IDX_performance_metrics_payroll_period_metric_type',
        columnNames: ['payroll_period_id', 'metric_type'],
      }),
    );

    await queryRunner.createIndex(
      'performance_metrics',
      new TableIndex({
        name: 'IDX_performance_metrics_processing_log_id',
        columnNames: ['processing_log_id'],
      }),
    );

    await queryRunner.createIndex(
      'performance_metrics',
      new TableIndex({
        name: 'IDX_performance_metrics_recorded_at',
        columnNames: ['recorded_at'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'performance_metrics',
      new TableForeignKey({
        columnNames: ['payroll_period_id'],
        referencedTableName: 'payroll_periods',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_performance_metrics_payroll_period',
      }),
    );

    await queryRunner.createForeignKey(
      'performance_metrics',
      new TableForeignKey({
        columnNames: ['processing_log_id'],
        referencedTableName: 'payroll_processing_logs',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_performance_metrics_processing_log',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey(
      'performance_metrics',
      'FK_performance_metrics_processing_log',
    );
    await queryRunner.dropForeignKey(
      'performance_metrics',
      'FK_performance_metrics_payroll_period',
    );

    // Drop indexes
    await queryRunner.dropIndex(
      'performance_metrics',
      'IDX_performance_metrics_recorded_at',
    );
    await queryRunner.dropIndex(
      'performance_metrics',
      'IDX_performance_metrics_processing_log_id',
    );
    await queryRunner.dropIndex(
      'performance_metrics',
      'IDX_performance_metrics_payroll_period_metric_type',
    );
    await queryRunner.dropIndex(
      'performance_metrics',
      'IDX_performance_metrics_metric_type_recorded_at',
    );

    // Drop table
    await queryRunner.dropTable('performance_metrics');
  }
}

