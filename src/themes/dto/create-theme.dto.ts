import { IsString, IsObject, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateThemeDto {
  @ApiProperty({ example: 'My Custom Theme' })
  @IsString()
  themeName: string;

  @ApiProperty({
    example: {
      palette: {
        primary: { main: '#1976d2' },
        secondary: { main: '#dc004e' },
      },
      typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
        fontSize: 14,
      },
    },
  })
  @IsObject()
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
  };

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
