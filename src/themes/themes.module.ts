import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThemesController } from './themes.controller';
import { ThemesService } from './themes.service';
import { UserTheme } from './entities/user-theme.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserTheme]),
    forwardRef(() => AuthModule),
  ],
  controllers: [ThemesController],
  providers: [ThemesService],
  exports: [ThemesService],
})
export class ThemesModule {}
