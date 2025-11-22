import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({
    description: 'Client name (must be unique)',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

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
        postalCode: '94102',
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
    default: 'active',
  })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: 'active' | 'inactive';
}
