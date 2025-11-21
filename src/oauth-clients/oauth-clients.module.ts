import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthClientsService } from './oauth-clients.service';
import { OAuthClientsController } from './oauth-clients.controller';
import { OAuthClient } from './entities/oauth-client.entity';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OAuthClient]),
    forwardRef(() => AuthModule),
    AuditModule,
  ],
  controllers: [OAuthClientsController],
  providers: [OAuthClientsService],
  exports: [OAuthClientsService],
})
export class OAuthClientsModule {}
