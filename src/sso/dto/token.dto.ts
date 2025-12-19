import { IsString, IsNotEmpty, IsOptional, IsIn, IsArray } from 'class-validator';

export class TokenExchangeDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['authorization_code', 'client_credentials'])
  grant_type: 'authorization_code' | 'client_credentials';

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsOptional()
  client_secret?: string;

  @IsString()
  @IsOptional()
  redirect_uri?: string;

  @IsString()
  @IsOptional()
  code_verifier?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  scope?: string[];
}

export class ClientCredentialsTokenResponseDto {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string[];
  client: {
    id: string;
    name: string;
  };
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
