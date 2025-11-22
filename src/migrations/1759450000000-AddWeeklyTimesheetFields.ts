import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWeeklyTimesheetFields1759450000000 implements MigrationInterface {
  name = 'AddWeeklyTimesheetFields1759450000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add weekly_hours_breakdown column to timesheets table
    await queryRunner.query(`
      ALTER TABLE timesheets 
      ADD COLUMN IF NOT EXISTS weekly_hours_breakdown JSONB NULL
    `);

    // Add comment to explain the column structure
    await queryRunner.query(`
      COMMENT ON COLUMN timesheets.weekly_hours_breakdown IS 
      'JSON structure for weekly timesheet per-day breakdown. Format: { monday: { regularHours, overtimeHours, doubleOvertimeHours, nightShiftHours }, ... }'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the weekly_hours_breakdown column
    await queryRunner.query(`
      ALTER TABLE timesheets 
      DROP COLUMN IF EXISTS weekly_hours_breakdown
    `);
  }
}

