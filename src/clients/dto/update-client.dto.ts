import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateClientDto {
  @ApiProperty({
    description: 'Client name (must be unique)',
    example: 'Acme Corporation',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Client description',
    example: 'Leading technology company specializing in innovative solutions',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Client contact information',
    example: {
      email: 'contact@acme.com',
      phone: '+1-555-0123',
      address: {
        street: '123 Business Ave',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        country: 'USA',
      },
    },
    required: false,
  })
  @IsOptional()
  contactInfo?: any;

  @ApiProperty({
    description: 'Client status',
    enum: ['active', 'inactive'],
    example: 'active',
    required: false,
  })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: 'active' | 'inactive';
}
