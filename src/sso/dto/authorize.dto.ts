import { IsString, IsNotEmpty, IsOptional, IsUrl, IsEnum } from 'class-validator';

export class AuthorizeDto {
  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  redirect_uri: string;

  @IsString()
  @IsOptional()
  response_type?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  code_challenge?: string;

  @IsString()
  @IsOptional()
  code_challenge_method?: string;

  @IsEnum(['client', 'candidate', 'both'])
  @IsOptional()
  intent?: 'client' | 'candidate' | 'both';

  @IsString()
  @IsOptional()
  scope?: string;

  @IsEnum(['none', 'login', 'consent', 'select_account'])
  @IsOptional()
  prompt?: 'none' | 'login' | 'consent' | 'select_account';
}
