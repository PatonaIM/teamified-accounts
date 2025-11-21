import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTheme } from './entities/user-theme.entity';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';

@Injectable()
export class ThemesService {
  constructor(
    @InjectRepository(UserTheme)
    private readonly userThemeRepository: Repository<UserTheme>,
  ) {}

  async create(userId: string, createThemeDto: CreateThemeDto): Promise<UserTheme> {
    if (createThemeDto.isActive) {
      await this.userThemeRepository.update(
        { userId, isActive: true },
        { isActive: false },
      );
    }

    const theme = this.userThemeRepository.create({
      userId,
      ...createThemeDto,
    });

    return this.userThemeRepository.save(theme);
  }

  async findAll(userId: string): Promise<UserTheme[]> {
    return this.userThemeRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<UserTheme> {
    const theme = await this.userThemeRepository.findOne({
      where: { id, userId },
    });

    if (!theme) {
      throw new NotFoundException('Theme not found');
    }

    return theme;
  }

  async findActive(userId: string): Promise<UserTheme | null> {
    return this.userThemeRepository.findOne({
      where: { userId, isActive: true },
    });
  }

  async update(id: string, userId: string, updateThemeDto: UpdateThemeDto): Promise<UserTheme> {
    const theme = await this.findOne(id, userId);

    if (updateThemeDto.isActive) {
      await this.userThemeRepository.update(
        { userId, isActive: true },
        { isActive: false },
      );
    }

    Object.assign(theme, updateThemeDto);
    return this.userThemeRepository.save(theme);
  }

  async setActive(id: string, userId: string): Promise<UserTheme> {
    const theme = await this.findOne(id, userId);

    await this.userThemeRepository.update(
      { userId, isActive: true },
      { isActive: false },
    );

    theme.isActive = true;
    return this.userThemeRepository.save(theme);
  }

  async remove(id: string, userId: string): Promise<void> {
    const theme = await this.findOne(id, userId);
    
    if (theme.isActive) {
      throw new BadRequestException('Cannot delete active theme');
    }

    await this.userThemeRepository.remove(theme);
  }
}
