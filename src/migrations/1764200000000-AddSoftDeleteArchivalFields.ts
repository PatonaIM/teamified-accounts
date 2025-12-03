import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSoftDeleteArchivalFields1764200000000 implements MigrationInterface {
  name = 'AddSoftDeleteArchivalFields1764200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'deleted_email',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'deleted_by',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'deleted_reason',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'deleted_reason');
    await queryRunner.dropColumn('users', 'deleted_by');
    await queryRunner.dropColumn('users', 'deleted_email');
  }
}
