import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class AuthorizeDto {
  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  redirect_uri: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  code_challenge?: string;

  @IsString()
  @IsOptional()
  code_challenge_method?: string;
}
