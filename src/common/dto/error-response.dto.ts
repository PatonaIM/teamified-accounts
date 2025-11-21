import { ApiProperty } from '@nestjs/swagger';

/**
 * Standardized error response following RFC 7807 Problem Details for HTTP APIs
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'A URI reference that identifies the problem type',
    example: 'https://api.teamified.com/problems/validation-error',
    format: 'uri',
  })
  type: string;

  @ApiProperty({
    description: 'A short, human-readable summary of the problem type',
    example: 'Validation Error',
  })
  title: string;

  @ApiProperty({
    description: 'The HTTP status code',
    example: 400,
    minimum: 100,
    maximum: 599,
  })
  status: number;

  @ApiProperty({
    description: 'A human-readable explanation specific to this occurrence of the problem',
    example: 'The request body contains invalid data. Please check the validation errors for details.',
  })
  detail: string;

  @ApiProperty({
    description: 'A URI reference that identifies the specific occurrence of the problem',
    example: 'https://api.teamified.com/errors/123e4567-e89b-12d3-a456-426614174000',
    format: 'uri',
    required: false,
  })
  instance?: string;

  @ApiProperty({
    description: 'Additional details about the error',
    example: {
      field: 'email',
      message: 'Invalid email format',
      value: 'invalid-email',
    },
    required: false,
  })
  errors?: Record<string, any>;

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2025-01-08T10:30:00.000Z',
    format: 'date-time',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request ID for tracking and debugging',
    example: 'req_123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  requestId?: string;
}

/**
 * Validation error response for field-specific validation failures
 */
export class ValidationErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'Array of field-specific validation errors',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        field: { type: 'string', example: 'email' },
        message: { type: 'string', example: 'Invalid email format' },
        value: { type: 'string', example: 'invalid-email' },
        constraint: { type: 'string', example: 'isEmail' },
      },
    },
    example: [
      {
        field: 'email',
        message: 'Invalid email format',
        value: 'invalid-email',
        constraint: 'isEmail',
      },
      {
        field: 'password',
        message: 'Password must be at least 8 characters long',
        value: '123',
        constraint: 'minLength',
      },
    ],
  })
  errors: Array<{
    field: string;
    message: string;
    value: any;
    constraint: string;
  }>;
}

/**
 * Authentication error response
 */
export class AuthErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'Error code for authentication failures',
    example: 'INVALID_CREDENTIALS',
    enum: [
      'INVALID_CREDENTIALS',
      'TOKEN_EXPIRED',
      'TOKEN_INVALID',
      'ACCESS_DENIED',
      'ACCOUNT_LOCKED',
      'EMAIL_NOT_VERIFIED',
    ],
  })
  code: string;

  @ApiProperty({
    description: 'Additional authentication context',
    example: {
      remainingAttempts: 2,
      lockoutExpiresAt: '2025-01-08T11:00:00.000Z',
    },
    required: false,
  })
  context?: Record<string, any>;
}

/**
 * Business logic error response
 */
export class BusinessErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'Business error code',
    example: 'USER_NOT_FOUND',
    enum: [
      'USER_NOT_FOUND',
      'INVITATION_EXPIRED',
      'INSUFFICIENT_PERMISSIONS',
      'RESOURCE_CONFLICT',
      'OPERATION_NOT_ALLOWED',
    ],
  })
  code: string;

  @ApiProperty({
    description: 'Additional business context',
    example: {
      resourceId: '123e4567-e89b-12d3-a456-426614174000',
      resourceType: 'user',
      suggestedAction: 'Please check the user ID and try again',
    },
    required: false,
  })
  context?: Record<string, any>;
}
