import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateInternalUsersToTeamified1732320000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get the Teamified organization ID
    const result = await queryRunner.query(`
      SELECT id FROM organizations WHERE slug = 'teamified-internal' LIMIT 1
    `);

    if (!result || result.length === 0) {
      throw new Error('Teamified organization not found. Please ensure it exists before running this migration.');
    }

    const teamifiedOrgId = result[0].id;

    console.log(`Found Teamified organization with ID: ${teamifiedOrgId}`);

    // Update all internal role entries to be organization-scoped under Teamified
    // This includes: super_admin, internal_hr, internal_finance, internal_account_manager, 
    // internal_recruiter, internal_marketing, internal_member (formerly internal_member)
    const updateResult = await queryRunner.query(`
      UPDATE user_roles 
      SET 
        scope = 'organization',
        scope_entity_id = $1,
        updated_at = NOW()
      WHERE 
        role_type IN (
          'super_admin',
          'internal_hr',
          'internal_finance',
          'internal_account_manager',
          'internal_recruiter',
          'internal_marketing',
          'internal_member',
          'internal_member'
        )
        AND scope = 'global'
    `, [teamifiedOrgId]);

    console.log(`Updated ${updateResult[1]} internal user role entries to Teamified organization`);

    // Also update any legacy 'internal_member' roles to 'internal_member'
    const renameResult = await queryRunner.query(`
      UPDATE user_roles 
      SET 
        role_type = 'internal_member',
        updated_at = NOW()
      WHERE 
        role_type = 'internal_member'
    `);

    console.log(`Renamed ${renameResult[1]} internal_member roles to internal_member`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert: Change internal organization-scoped roles back to global
    await queryRunner.query(`
      UPDATE user_roles 
      SET 
        scope = 'global',
        scope_entity_id = NULL,
        updated_at = NOW()
      WHERE 
        role_type IN (
          'super_admin',
          'internal_hr',
          'internal_finance',
          'internal_account_manager',
          'internal_recruiter',
          'internal_marketing',
          'internal_member'
        )
        AND scope = 'organization'
    `);

    console.log('Reverted internal users back to global scope');
  }
}
