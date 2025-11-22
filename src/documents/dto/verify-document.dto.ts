import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum VerificationAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  NEEDS_CHANGES = 'needs_changes',
}

export class VerifyDocumentDto {
  @ApiProperty({
    description: 'Verification action to perform',
    enum: VerificationAction,
    example: VerificationAction.APPROVE,
  })
  @IsEnum(VerificationAction)
  @IsNotEmpty()
  action: VerificationAction;

  @ApiProperty({
    description: 'Review notes or reason for the action (optional)',
    example: 'Document verified successfully. All information is accurate and complete.',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes: string;
}
