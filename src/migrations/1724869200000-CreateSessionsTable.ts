import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateSessionsTable1724869200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'refresh_token_hash',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'token_family',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'device_metadata',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'expires_at',
            type: 'timestamp with time zone',
            isNullable: false,
          },
          {
            name: 'revoked_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
    );

    // Create indexes
    await queryRunner.createIndex('sessions', new TableIndex({
      name: 'IDX_sessions_user_id',
      columnNames: ['user_id']
    }));
    await queryRunner.createIndex('sessions', new TableIndex({
      name: 'IDX_sessions_token_family',
      columnNames: ['token_family']
    }));
    await queryRunner.createIndex('sessions', new TableIndex({
      name: 'IDX_sessions_expires_at',
      columnNames: ['expires_at']
    }));

    // Create foreign key
    await queryRunner.createForeignKey('sessions', new TableForeignKey({
      columnNames: ['user_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'users',
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('sessions');
  }
}