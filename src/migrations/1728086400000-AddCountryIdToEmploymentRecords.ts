import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Migration: Add country_id to employment_records table
 * Story 7.8.2 - Create direct Country-EmploymentRecord relationship
 * 
 * This migration adds a country_id column to the employment_records table,
 * establishing a direct relationship between employment records and countries.
 * This improves data integrity and query performance for payroll operations.
 */
export class AddCountryIdToEmploymentRecords1728086400000 implements MigrationInterface {
  name = 'AddCountryIdToEmploymentRecords1728086400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Adding country_id to employment_records table...');

    // Step 1: Add country_id column (nullable initially for data population)
    await queryRunner.addColumn(
      'employment_records',
      new TableColumn({
        name: 'country_id',
        type: 'uuid',
        isNullable: true, // Temporarily nullable for data migration
      }),
    );

    console.log('✅ Added country_id column');

    // Step 2: Populate country_id from user's EOR profile country code
    // This uses a subquery to resolve country code to country UUID
    await queryRunner.query(`
      UPDATE employment_records er
      SET country_id = (
        SELECT c.id 
        FROM countries c
        JOIN eor_profiles ep ON ep.country_code = c.code
        WHERE ep.user_id = er.user_id
        LIMIT 1
      )
      WHERE EXISTS (
        SELECT 1 FROM eor_profiles ep2 
        WHERE ep2.user_id = er.user_id
      );
    `);

    console.log('✅ Populated country_id from EOR profiles');

    // Step 3: For records without EOR profiles, set a default country (optional)
    // You may want to handle these manually or set a default
    const recordsWithoutCountry = await queryRunner.query(`
      SELECT COUNT(*) as count 
      FROM employment_records 
      WHERE country_id IS NULL;
    `);

    if (recordsWithoutCountry[0].count > 0) {
      console.log(`⚠️  Warning: ${recordsWithoutCountry[0].count} employment records without country_id`);
      console.log('   These records need manual review or a default country assignment');
      
      // Optionally: Set a default country for records without EOR profile
      // Uncomment and modify if you want to set a default (e.g., India)
      // const defaultCountry = await queryRunner.query(`SELECT id FROM countries WHERE code = 'IN' LIMIT 1;`);
      // if (defaultCountry.length > 0) {
      //   await queryRunner.query(`
      //     UPDATE employment_records 
      //     SET country_id = '${defaultCountry[0].id}' 
      //     WHERE country_id IS NULL;
      //   `);
      //   console.log('✅ Set default country for records without EOR profile');
      // }
    }

    // Step 4: Make country_id NOT NULL (after data population)
    await queryRunner.changeColumn(
      'employment_records',
      'country_id',
      new TableColumn({
        name: 'country_id',
        type: 'uuid',
        isNullable: false, // Now required
      }),
    );

    console.log('✅ Made country_id NOT NULL');

    // Step 5: Add foreign key constraint
    await queryRunner.createForeignKey(
      'employment_records',
      new TableForeignKey({
        name: 'FK_employment_records_country',
        columnNames: ['country_id'],
        referencedTableName: 'countries',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT', // Prevent deletion of countries with employment records
        onUpdate: 'NO ACTION',
      }),
    );

    console.log('✅ Added foreign key constraint to countries table');

    // Step 6: Add index for performance
    await queryRunner.createIndex(
      'employment_records',
      new TableIndex({
        name: 'IDX_employment_records_country_id',
        columnNames: ['country_id'],
      }),
    );

    console.log('✅ Added index on country_id');
    console.log('🎉 Migration complete: employment_records now have direct country relationship');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Reverting country_id from employment_records table...');

    // Remove index
    await queryRunner.dropIndex('employment_records', 'IDX_employment_records_country_id');
    console.log('✅ Dropped index');

    // Remove foreign key
    await queryRunner.dropForeignKey('employment_records', 'FK_employment_records_country');
    console.log('✅ Dropped foreign key');

    // Remove column
    await queryRunner.dropColumn('employment_records', 'country_id');
    console.log('✅ Dropped country_id column');

    console.log('🎉 Rollback complete');
  }
}
