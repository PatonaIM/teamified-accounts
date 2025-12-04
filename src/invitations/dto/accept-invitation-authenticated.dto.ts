import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class AcceptInvitationAuthenticatedDto {
  @ApiProperty({
    description: 'Unique invitation code from the invitation link',
    example: 'abc123xyz456',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  inviteCode: string;
}
