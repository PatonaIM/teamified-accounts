import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TokenExchangeDto {
  @IsString()
  @IsNotEmpty()
  grant_type: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsOptional()
  client_secret?: string;

  @IsString()
  @IsNotEmpty()
  redirect_uri: string;

  @IsString()
  @IsOptional()
  code_verifier?: string;
}

export class TokenResponseDto {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    clientId?: string;
  };
}
