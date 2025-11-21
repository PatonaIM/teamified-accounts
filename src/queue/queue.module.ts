import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SupabaseDeletionProcessor } from './processors/supabase-deletion.processor';
import { SupabaseDeletionFailure } from './entities/supabase-deletion-failure.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupabaseDeletionFailure]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL');
        
        if (redisUrl) {
          return { redis: redisUrl };
        } else {
          return {
            redis: {
              host: configService.get('REDIS_HOST', 'localhost'),
              port: configService.get('REDIS_PORT', 6379),
              password: configService.get('REDIS_PASSWORD'),
            },
          };
        }
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'supabase-user-deletion',
    }),
    AuthModule,
  ],
  providers: [SupabaseDeletionProcessor],
  exports: [BullModule],
})
export class QueueModule {}
