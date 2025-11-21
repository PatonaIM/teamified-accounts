import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('user_themes')
@Index(['userId'])
export class UserTheme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'theme_name', length: 100 })
  themeName: string;

  @Column({ name: 'is_active', default: false })
  isActive: boolean;

  @Column({ name: 'theme_config', type: 'jsonb' })
  themeConfig: {
    palette: {
      primary: {
        main: string;
        light?: string;
        dark?: string;
        contrastText?: string;
      };
      secondary: {
        main: string;
        light?: string;
        dark?: string;
        contrastText?: string;
      };
      error?: {
        main: string;
        light?: string;
        dark?: string;
      };
      warning?: {
        main: string;
        light?: string;
        dark?: string;
      };
      info?: {
        main: string;
        light?: string;
        dark?: string;
      };
      success?: {
        main: string;
        light?: string;
        dark?: string;
      };
      background?: {
        default?: string;
        paper?: string;
      };
      text?: {
        primary?: string;
        secondary?: string;
      };
    };
    typography: {
      fontFamily?: string;
      fontSize?: number;
      h1?: { fontSize?: string; fontWeight?: number };
      h2?: { fontSize?: string; fontWeight?: number };
      h3?: { fontSize?: string; fontWeight?: number };
      h4?: { fontSize?: string; fontWeight?: number };
      h5?: { fontSize?: string; fontWeight?: number };
      h6?: { fontSize?: string; fontWeight?: number };
      body1?: { fontSize?: string };
      body2?: { fontSize?: string };
      button?: { textTransform?: string; fontWeight?: number };
    };
    shape?: {
      borderRadius?: number;
    };
    componentStyles?: {
      buttonVariant?: 'text' | 'outlined' | 'contained';
      buttonElevation?: boolean;
      buttonBorderRadius?: number;
      buttonTextTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
      chipVariant?: 'filled' | 'outlined';
      chipBorderRadius?: number;
      cardBorderRadius?: number;
    };
    spacing?: number;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
