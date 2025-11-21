import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateEORProfilesTable1724869300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'eor_profiles',
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
            isUnique: true,
          },
          // Personal Information
          {
            name: 'date_of_birth',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'address_line1',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'address_line2',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'state_province',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'postal_code',
            type: 'varchar',
            isNullable: true,
          },
          // Professional Information
          {
            name: 'job_title',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'department',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'employee_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'employment_type',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'manager_name',
            type: 'varchar',
            isNullable: true,
          },
          // CV Information
          {
            name: 'skills',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'experience_years',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'education',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'certifications',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'languages',
            type: 'jsonb',
            isNullable: true,
          },
          // Profile Completion
          {
            name: 'profile_completion_percentage',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'is_profile_complete',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'profile_status',
            type: 'varchar',
            default: "'incomplete'",
            isNullable: false,
          },
          // Country Configuration
          {
            name: 'country_code',
            type: 'varchar',
            length: '2',
            isNullable: false,
          },
          {
            name: 'timezone',
            type: 'varchar',
            isNullable: true,
          },
          // Emergency Contact
          {
            name: 'emergency_contact_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'emergency_contact_phone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'emergency_contact_relationship',
            type: 'varchar',
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
    await queryRunner.createIndex('eor_profiles', new TableIndex({
      name: 'IDX_eor_profiles_user_id',
      columnNames: ['user_id'],
      isUnique: true,
    }));
    await queryRunner.createIndex('eor_profiles', new TableIndex({
      name: 'IDX_eor_profiles_country_code',
      columnNames: ['country_code'],
    }));
    await queryRunner.createIndex('eor_profiles', new TableIndex({
      name: 'IDX_eor_profiles_profile_status',
      columnNames: ['profile_status'],
    }));

    // Create foreign key
    await queryRunner.createForeignKey('eor_profiles', new TableForeignKey({
      columnNames: ['user_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'users',
      onDelete: 'CASCADE',
    }));

    // Add check constraint for profile_status
    await queryRunner.query(`
      ALTER TABLE eor_profiles 
      ADD CONSTRAINT CHK_eor_profiles_profile_status 
      CHECK (profile_status IN ('incomplete', 'pending', 'complete'))
    `);

    // Add check constraint for profile_completion_percentage
    await queryRunner.query(`
      ALTER TABLE eor_profiles 
      ADD CONSTRAINT CHK_eor_profiles_completion_percentage 
      CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('eor_profiles');
  }
}