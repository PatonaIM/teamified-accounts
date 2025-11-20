import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsUUID, IsOptional, IsString, IsDateString } from 'class-validator';

export class ConvertCandidateDto {
  @ApiProperty({ 
    description: 'Email address of the candidate to convert',
    example: 'candidate@example.com' 
  })
  @IsEmail()
  candidateEmail: string;
  
  @ApiProperty({ 
    description: 'User ID of the recruiter/HR who hired this candidate',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @IsUUID()
  hiredBy: string;
  
  @ApiProperty({ 
    description: 'Expected start date for the employee (ISO 8601 format)',
    example: '2025-01-15', 
    required: false 
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;
  
  @ApiProperty({ 
    description: 'Job title for the employee',
    example: 'Software Engineer', 
    required: false 
  })
  @IsString()
  @IsOptional()
  jobTitle?: string;
}

export class ConvertCandidateResponseDto {
  @ApiProperty({
    description: 'Indicates if the conversion was successful',
    example: true
  })
  success: boolean;
  
  @ApiProperty({
    description: 'Converted user information',
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      firstName: { type: 'string' },
      lastName: { type: 'string' }
    }
  })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  
  @ApiProperty({
    description: 'Organization membership details',
    type: 'object',
    properties: {
      organizationId: { type: 'string', format: 'uuid' },
      role: { type: 'string' },
      status: { type: 'string' }
    }
  })
  organizationMembership: {
    organizationId: string;
    role: string;
    status: string;
  };
  
  @ApiProperty({ 
    description: 'Additional information or success message',
    required: false,
    example: 'Candidate successfully converted to employee'
  })
  message?: string;
}
