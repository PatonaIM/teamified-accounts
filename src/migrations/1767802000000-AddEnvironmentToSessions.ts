import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddEnvironmentToSessions1767802000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('sessions', new TableColumn({
      name: 'environment',
      type: 'varchar',
      length: '20',
      isNullable: true,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('sessions', 'environment');
  }
}
