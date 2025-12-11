import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetPrimaryEmailDto {
  @ApiProperty({ 
    description: 'ID of the email to set as primary',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  emailId: string;
}
