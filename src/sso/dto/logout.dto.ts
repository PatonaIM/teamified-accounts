import { IsString, IsOptional, IsUrl } from 'class-validator';

export class LogoutDto {
  @IsUrl({ require_tld: false })
  @IsOptional()
  post_logout_redirect_uri?: string;

  @IsString()
  @IsOptional()
  id_token_hint?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  client_id?: string;
}
