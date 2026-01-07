import { PartialType } from '@nestjs/mapped-types';
import { CreateOAuthClientDto, RedirectUriDto, LogoutUriDto } from './create-oauth-client.dto';
import { IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class UpdateOAuthClientDto extends PartialType(CreateOAuthClientDto) {
  @ApiProperty({
    description: 'Whether the client is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({
    description: 'Allowed redirect URIs for OAuth flow with environment tags',
    example: [
      { uri: 'https://app.teamified.com/auth/callback', environment: 'production' },
    ],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((item: any) => {
        if (item instanceof RedirectUriDto) return item;
        return new RedirectUriDto(item);
      });
    }
    return value;
  })
  @Type(() => RedirectUriDto)
  redirect_uris?: RedirectUriDto[];

  @ApiProperty({
    description: 'Logout URIs for front-channel Single Sign-Out with environment tags.',
    example: [
      { uri: 'https://app.teamified.com/auth/logout/callback', environment: 'production' },
    ],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((item: any) => {
        if (item instanceof LogoutUriDto) return item;
        return new LogoutUriDto(item);
      });
    }
    return value;
  })
  @Type(() => LogoutUriDto)
  logout_uris?: LogoutUriDto[];
}
