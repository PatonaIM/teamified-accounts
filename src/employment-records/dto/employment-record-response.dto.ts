import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;
}

export class ClientInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  status: string;
}

export class CountryInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;
}

export class EmploymentRecordResponseDto {
  @ApiProperty({ description: 'Employment record ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Client ID' })
  clientId: string;

  @ApiProperty({ description: 'Country ID (Story 7.8.2)' })
  countryId: string;

  @ApiProperty({ description: 'Employment start date' })
  startDate: Date;

  @ApiProperty({ description: 'Employment end date', nullable: true })
  endDate: Date | null;

  @ApiProperty({ description: 'Role in the employment' })
  role: string;

  @ApiProperty({ description: 'Employment status', enum: ['onboarding', 'active', 'inactive', 'offboarding', 'terminated', 'completed'] })
  status: 'onboarding' | 'active' | 'inactive' | 'offboarding' | 'terminated' | 'completed';

  @ApiProperty({ description: 'Whether this record was migrated from Zoho' })
  migratedFromZoho: boolean;

  @ApiProperty({ description: 'Zoho employment ID for migrated records', nullable: true })
  zohoEmploymentId: string | null;

  @ApiProperty({ description: 'Timestamp when onboarding was submitted', nullable: true })
  onboardingSubmittedAt: Date | null;

  @ApiProperty({ description: 'Record creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'User information', type: UserInfoDto, required: false })
  user?: UserInfoDto;

  @ApiProperty({ description: 'Client information', type: ClientInfoDto, required: false })
  client?: ClientInfoDto;

  @ApiProperty({ description: 'Country information', type: CountryInfoDto, required: false })
  country?: CountryInfoDto;
}
