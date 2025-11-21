import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Migration: Add client_id to users table
 * Story CLIENT-SCOPE-1 - Client-Scoped Data Access for HR Manager Client Role
 * 
 * This migration adds a client_id column to the users table to store which client
 * an hr_manager_client user MANAGES (not which client they work for).
 * 
 * Important: Regular employees do NOT get client_id set - their client relationship
 * comes from employment_records.client_id. This field is ONLY for hr_manager_client users
 * to indicate which client they manage.
 */
export class AddClientIdToUsers1728346800000 implements MigrationInterface {
  name = 'AddClientIdToUsers1728346800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Adding client_id to users table for hr_manager_client role...');

    // Step 1: Add client_id column (nullable - only hr_manager_client users will have this set)
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'client_id',
        type: 'uuid',
        isNullable: true, // Nullable - most users won't have this
      }),
    );

    console.log('✅ Added client_id column to users table');

    // Step 2: Backfill client_id for hr_manager_client users
    // NOTE: This requires a mapping of hr_manager_client users to their assigned clients
    // The mapping should be provided by Product Owner before running this migration
    
    // OPTION 1: Manual backfill (comment out if using SQL script)
    // await queryRunner.query(`
    //   UPDATE users u
    //   SET client_id = '...' -- Replace with actual client UUID
    //   WHERE u.id IN (
    //     SELECT user_id FROM user_roles WHERE role_type = 'hr_manager_client'
    //   );
    // `);

    // OPTION 2: Backfill from employment records (if hr_manager_client users have their own employment record)
    // This approach assumes hr_manager_client users have an employment record with the client they manage
    await queryRunner.query(`
      UPDATE users u
      SET client_id = (
        SELECT DISTINCT er.client_id
        FROM employment_records er
        WHERE er.user_id = u.id
        LIMIT 1
      )
      WHERE u.id IN (
        SELECT user_id FROM user_roles WHERE role_type = 'hr_manager_client'
      )
      AND EXISTS (
        SELECT 1 FROM employment_records er2 WHERE er2.user_id = u.id
      );
    `);

    console.log('✅ Backfilled client_id for hr_manager_client users from employment records');

    // Step 3: Check for hr_manager_client users without client assignment
    const usersWithoutClient = await queryRunner.query(`
      SELECT u.id, u.email, u.first_name, u.last_name
      FROM users u
      INNER JOIN user_roles ur ON ur.user_id = u.id
      WHERE ur.role_type = 'hr_manager_client'
      AND u.client_id IS NULL
      LIMIT 10;
    `);

    if (usersWithoutClient.length > 0) {
      console.log('⚠️  Warning: hr_manager_client users without client assignment:');
      usersWithoutClient.forEach((user: any) => {
        console.log(`   - ${user.email} (${user.first_name} ${user.last_name}) [ID: ${user.id}]`);
      });
      console.log('   These users need manual client assignment via User Management UI');
    } else {
      console.log('✅ All hr_manager_client users have client assignments');
    }

    // Step 4: Add foreign key constraint
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        name: 'FK_users_client',
        columnNames: ['client_id'],
        referencedTableName: 'clients',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL', // If client is deleted, set user's client_id to NULL
        onUpdate: 'NO ACTION',
      }),
    );

    console.log('✅ Added foreign key constraint to clients table');

    // Step 5: Add index for performance
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_client_id',
        columnNames: ['client_id'],
      }),
    );

    console.log('✅ Added index on client_id');
    console.log('🎉 Migration complete: users table now supports client assignment for hr_manager_client role');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Reverting client_id from users table...');

    // Remove index
    await queryRunner.dropIndex('users', 'IDX_users_client_id');
    console.log('✅ Dropped index');

    // Remove foreign key
    await queryRunner.dropForeignKey('users', 'FK_users_client');
    console.log('✅ Dropped foreign key');

    // Remove column
    await queryRunner.dropColumn('users', 'client_id');
    console.log('✅ Dropped client_id column');

    console.log('🎉 Rollback complete');
  }
}
