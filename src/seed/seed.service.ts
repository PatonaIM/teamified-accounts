import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async seedDatabase() {
    try {
      this.logger.log('Starting database seeding process...');

      // Get database connection details from environment
      const dbUrl = process.env.POSTGRES_URL;
      if (!dbUrl) {
        throw new Error('POSTGRES_URL environment variable is not set');
      }

      // Set environment variable for the seed script
      process.env.DATABASE_URL = dbUrl;

      // Run the seed script
      this.logger.log('Executing seed-database.js script...');
      const { stdout, stderr } = await execAsync('node scripts/seed-database.js', {
        cwd: process.cwd(),
        env: {
          ...process.env,
          DATABASE_URL: dbUrl,
        },
      });

      if (stderr) {
        this.logger.warn('Seed script warnings:', stderr);
      }

      this.logger.log('Seed script output:', stdout);

      return {
        message: 'Database seeded successfully',
        output: stdout,
        warnings: stderr,
      };
    } catch (error) {
      this.logger.error('Failed to seed database:', error);
      throw error;
    }
  }

  async clearDatabase() {
    try {
      this.logger.log('Starting database clearing process...');

      // Get database connection details from environment
      const dbUrl = process.env.POSTGRES_URL;
      if (!dbUrl) {
        throw new Error('POSTGRES_URL environment variable is not set');
      }

      // Set environment variable for the seed script
      process.env.DATABASE_URL = dbUrl;

      // Run the seed script with clear flag
      this.logger.log('Executing seed-database.js script with clear flag...');
      const { stdout, stderr } = await execAsync('node scripts/seed-database.js --clear', {
        cwd: process.cwd(),
        env: {
          ...process.env,
          DATABASE_URL: dbUrl,
        },
      });

      if (stderr) {
        this.logger.warn('Seed script warnings:', stderr);
      }

      this.logger.log('Seed script output:', stdout);

      return {
        message: 'Database cleared successfully',
        output: stdout,
        warnings: stderr,
      };
    } catch (error) {
      this.logger.error('Failed to clear database:', error);
      throw error;
    }
  }
}
