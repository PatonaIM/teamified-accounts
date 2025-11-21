import { Controller, Post, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('seed')
@Controller('v1/seed')
export class SeedController {
  private readonly logger = new Logger(SeedController.name);

  constructor(private readonly seedService: SeedService) {}

  @Post('database')
  @ApiOperation({
    summary: 'Seed the database with test data',
    description: 'Populates the database with comprehensive test data including users, clients, employment records, and more. This should only be run once.',
  })
  @ApiResponse({ status: 200, description: 'Database seeded successfully' })
  @ApiResponse({ status: 500, description: 'Failed to seed database' })
  async seedDatabase() {
    try {
      this.logger.log('Starting database seeding...');
      
      const result = await this.seedService.seedDatabase();
      
      this.logger.log('Database seeding completed successfully');
      
      return {
        success: true,
        message: 'Database seeded successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to seed database:', error);
      throw new HttpException(
        `Failed to seed database: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('clear')
  @ApiOperation({
    summary: 'Clear all seed data',
    description: 'Removes all seeded data from the database. Use with caution!',
  })
  @ApiResponse({ status: 200, description: 'Database cleared successfully' })
  @ApiResponse({ status: 500, description: 'Failed to clear database' })
  async clearDatabase() {
    try {
      this.logger.log('Starting database clearing...');
      
      await this.seedService.clearDatabase();
      
      this.logger.log('Database clearing completed successfully');
      
      return {
        success: true,
        message: 'Database cleared successfully',
      };
    } catch (error) {
      this.logger.error('Failed to clear database:', error);
      throw new HttpException(
        `Failed to clear database: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
