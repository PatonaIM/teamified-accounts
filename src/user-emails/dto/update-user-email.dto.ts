import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserEmailDto {
  @ApiProperty({
    description: 'The new email address',
    example: 'newemail@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
