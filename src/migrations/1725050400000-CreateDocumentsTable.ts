import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateDocumentsTable1725050400000 implements MigrationInterface {
  name = 'CreateDocumentsTable1725050400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create documents table
    await queryRunner.createTable(
      new Table({
        name: 'documents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'eor_profile_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'document_type',
            type: 'enum',
            enum: ['CV', 'PAYSLIP', 'HR_DOCUMENT'],
            isNullable: false,
          },
          {
            name: 'file_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'file_path',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'content_type',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'file_size',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'sha256_checksum',
            type: 'varchar',
            length: '64',
            isNullable: false,
          },
          {
            name: 'version_id',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'is_current',
            type: 'boolean',
            default: false,
          },
          {
            name: 'uploaded_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Create foreign key constraint
    await queryRunner.createForeignKey(
      'documents',
      new TableForeignKey({
        columnNames: ['eor_profile_id'],
        referencedTableName: 'eor_profiles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Create indexes for performance
    await queryRunner.createIndex(
      'documents',
      new TableIndex({
        name: 'IDX_documents_eor_profile_id',
        columnNames: ['eor_profile_id'],
      }),
    );

    await queryRunner.createIndex(
      'documents',
      new TableIndex({
        name: 'IDX_documents_document_type',
        columnNames: ['document_type'],
      }),
    );

    await queryRunner.createIndex(
      'documents',
      new TableIndex({
        name: 'IDX_documents_version_id',
        columnNames: ['version_id'],
      }),
    );

    await queryRunner.createIndex(
      'documents',
      new TableIndex({
        name: 'IDX_documents_is_current',
        columnNames: ['is_current'],
      }),
    );

    // Composite index for current CV queries
    await queryRunner.createIndex(
      'documents',
      new TableIndex({
        name: 'IDX_documents_current_cv',
        columnNames: ['eor_profile_id', 'document_type', 'is_current'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('documents', 'IDX_documents_current_cv');
    await queryRunner.dropIndex('documents', 'IDX_documents_is_current');
    await queryRunner.dropIndex('documents', 'IDX_documents_version_id');
    await queryRunner.dropIndex('documents', 'IDX_documents_document_type');
    await queryRunner.dropIndex('documents', 'IDX_documents_eor_profile_id');

    // Drop foreign key
    const table = await queryRunner.getTable('documents');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('eor_profile_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('documents', foreignKey);
    }

    // Drop table
    await queryRunner.dropTable('documents');
  }
}