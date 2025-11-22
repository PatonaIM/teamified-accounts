import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateComprehensiveProfileTables1725050400001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create comprehensive_employees table
    await queryRunner.createTable(
      new Table({
        name: 'comprehensive_employees',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'employee_id',
            type: 'varchar',
            length: '20',
            isUnique: true,
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'father_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'nick_name',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'email_address',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'client_id',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'client_birthday_leave',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'department',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'location',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'employment_type',
            type: 'enum',
            enum: ['full_time', 'part_time', 'contract', 'temporary'],
          },
          {
            name: 'employee_status',
            type: 'enum',
            enum: ['active', 'inactive', 'terminated', 'on_leave'],
            default: "'active'",
          },
          {
            name: 'source_of_hire',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'date_of_joining',
            type: 'date',
          },
          {
            name: 'date_of_confirmation',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'current_experience',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'total_experience',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'reporting_manager_id',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'secondary_reporting_manager_id',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'zoho_role',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'date_of_birth',
            type: 'date',
          },
          {
            name: 'age',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'gender',
            type: 'enum',
            enum: ['male', 'female', 'other', 'prefer_not_to_say'],
          },
          {
            name: 'marital_status',
            type: 'enum',
            enum: ['single', 'married', 'divorced', 'widowed'],
          },
          {
            name: 'about_me',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'citizenship',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'blood_group',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'expertise',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'linkedin_url',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'work_phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'phone_extension',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'seating_location',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'personal_mobile',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'personal_email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'skills',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'present_address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'permanent_address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'pan_number_encrypted',
            type: 'varbinary',
            length: '255',
            isNullable: true,
          },
          {
            name: 'aadhaar_number_encrypted',
            type: 'varbinary',
            length: '255',
            isNullable: true,
          },
          {
            name: 'pf_number',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'uan_number',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'nic_sri_lanka',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'sss_philippines',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'philhealth_philippines',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'pagibig_philippines',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'tin_philippines',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'bank_account_number_encrypted',
            type: 'varbinary',
            length: '255',
            isNullable: true,
          },
          {
            name: 'ifsc_code',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'payment_mode',
            type: 'enum',
            enum: ['bank_transfer', 'check', 'cash', 'digital'],
            isNullable: true,
          },
          {
            name: 'bank_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'account_type',
            type: 'enum',
            enum: ['savings', 'checking', 'current'],
            isNullable: true,
          },
          {
            name: 'bank_holder_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'profile_completion_percentage',
            type: 'integer',
            default: 0,
          },
          {
            name: 'is_profile_complete',
            type: 'boolean',
            default: false,
          },
          {
            name: 'profile_status',
            type: 'enum',
            enum: ['incomplete', 'pending', 'complete'],
            default: "'incomplete'",
          },
          {
            name: 'country_code',
            type: 'varchar',
            length: '2',
          },
          {
            name: 'timezone',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'onboarding_status',
            type: 'enum',
            enum: ['pending', 'in_progress', 'completed', 'failed'],
            default: "'pending'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isUnique: true,
          },
        ],
      }),
      true,
    );

    // Create emergency_contacts table
    await queryRunner.createTable(
      new Table({
        name: 'emergency_contacts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'employee_id',
            type: 'uuid',
          },
          {
            name: 'contact_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'relationship',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_primary',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create employee_documents table
    await queryRunner.createTable(
      new Table({
        name: 'employee_documents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'employee_id',
            type: 'uuid',
          },
          {
            name: 'document_type',
            type: 'enum',
            enum: ['cv', 'id_proof', 'address_proof', 'bank_statement', 'other'],
          },
          {
            name: 'file_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'file_path',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'file_size',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'sha256_checksum',
            type: 'varchar',
            length: '64',
            isNullable: true,
          },
          {
            name: 'version_id',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'is_current',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'uploaded_by',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'uploaded_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for comprehensive_employees
    await queryRunner.createIndex(
      'comprehensive_employees',
      new TableIndex({
        name: 'IDX_COMPREHENSIVE_EMPLOYEES_CLIENT_ID',
        columnNames: ['client_id'],
      }),
    );

    await queryRunner.createIndex(
      'comprehensive_employees',
      new TableIndex({
        name: 'IDX_COMPREHENSIVE_EMPLOYEES_DEPARTMENT',
        columnNames: ['department'],
      }),
    );

    await queryRunner.createIndex(
      'comprehensive_employees',
      new TableIndex({
        name: 'IDX_COMPREHENSIVE_EMPLOYEES_COUNTRY_CODE',
        columnNames: ['country_code'],
      }),
    );

    await queryRunner.createIndex(
      'comprehensive_employees',
      new TableIndex({
        name: 'IDX_COMPREHENSIVE_EMPLOYEES_EMPLOYMENT_STATUS',
        columnNames: ['employee_status'],
      }),
    );

    // Create indexes for emergency_contacts
    await queryRunner.createIndex(
      'emergency_contacts',
      new TableIndex({
        name: 'IDX_EMERGENCY_CONTACTS_EMPLOYEE_ID',
        columnNames: ['employee_id'],
      }),
    );

    await queryRunner.createIndex(
      'emergency_contacts',
      new TableIndex({
        name: 'IDX_EMERGENCY_CONTACTS_IS_PRIMARY',
        columnNames: ['is_primary'],
      }),
    );

    // Create indexes for employee_documents
    await queryRunner.createIndex(
      'employee_documents',
      new TableIndex({
        name: 'IDX_EMPLOYEE_DOCUMENTS_EMPLOYEE_ID',
        columnNames: ['employee_id'],
      }),
    );

    await queryRunner.createIndex(
      'employee_documents',
      new TableIndex({
        name: 'IDX_EMPLOYEE_DOCUMENTS_DOCUMENT_TYPE',
        columnNames: ['document_type'],
      }),
    );

    await queryRunner.createIndex(
      'employee_documents',
      new TableIndex({
        name: 'IDX_EMPLOYEE_DOCUMENTS_IS_ACTIVE',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'employee_documents',
      new TableIndex({
        name: 'IDX_EMPLOYEE_DOCUMENTS_UPLOADED_AT',
        columnNames: ['uploaded_at'],
      }),
    );

    // Create foreign key constraints
    await queryRunner.createForeignKey(
      'comprehensive_employees',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'emergency_contacts',
      new TableForeignKey({
        columnNames: ['employee_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'comprehensive_employees',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'employee_documents',
      new TableForeignKey({
        columnNames: ['employee_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'comprehensive_employees',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints first
    const comprehensiveEmployeesTable = await queryRunner.getTable('comprehensive_employees');
    const emergencyContactsTable = await queryRunner.getTable('emergency_contacts');
    const employeeDocumentsTable = await queryRunner.getTable('employee_documents');

    if (emergencyContactsTable) {
      const emergencyContactsForeignKey = comprehensiveEmployeesTable?.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('employee_id') !== -1,
      );
      if (emergencyContactsForeignKey) {
        await queryRunner.dropForeignKey('emergency_contacts', emergencyContactsForeignKey);
      }
    }

    if (employeeDocumentsTable) {
      const employeeDocumentsForeignKey = comprehensiveEmployeesTable?.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('employee_id') !== -1,
      );
      if (employeeDocumentsForeignKey) {
        await queryRunner.dropForeignKey('employee_documents', employeeDocumentsForeignKey);
      }
    }

    if (comprehensiveEmployeesTable) {
      const comprehensiveEmployeesForeignKey = comprehensiveEmployeesTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('user_id') !== -1,
      );
      if (comprehensiveEmployeesForeignKey) {
        await queryRunner.dropForeignKey('comprehensive_employees', comprehensiveEmployeesForeignKey);
      }
    }

    // Drop tables
    await queryRunner.dropTable('employee_documents');
    await queryRunner.dropTable('emergency_contacts');
    await queryRunner.dropTable('comprehensive_employees');
  }
}
