import { ApiProperty } from '@nestjs/swagger';

/**
 * Standardized success response wrapper
 */
export class ApiResponseDto<T = any> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
    minimum: 200,
    maximum: 299,
  })
  status: number;

  @ApiProperty({
    description: 'Human-readable message describing the result',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'The actual response data',
  })
  data: T;

  @ApiProperty({
    description: 'Timestamp when the response was generated',
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
 * Paginated response wrapper
 */
export class PaginatedResponseDto<T = any> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  status: number;

  @ApiProperty({
    description: 'Human-readable message describing the result',
    example: 'Data retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'The actual response data',
    type: 'array',
  })
  data: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: 'object',
    properties: {
      page: { type: 'number', example: 1, description: 'Current page number' },
      limit: { type: 'number', example: 10, description: 'Number of items per page' },
      total: { type: 'number', example: 100, description: 'Total number of items' },
      totalPages: { type: 'number', example: 10, description: 'Total number of pages' },
      hasNext: { type: 'boolean', example: true, description: 'Whether there is a next page' },
      hasPrev: { type: 'boolean', example: false, description: 'Whether there is a previous page' },
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  @ApiProperty({
    description: 'Timestamp when the response was generated',
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
 * Created resource response
 */
export class CreatedResponseDto<T = any> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'HTTP status code',
    example: 201,
  })
  status: number;

  @ApiProperty({
    description: 'Human-readable message describing the result',
    example: 'Resource created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'The created resource data',
  })
  data: T;

  @ApiProperty({
    description: 'Location header value for the created resource',
    example: '/api/v1/users/123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  location?: string;

  @ApiProperty({
    description: 'Timestamp when the response was generated',
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
 * Updated resource response
 */
export class UpdatedResponseDto<T = any> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  status: number;

  @ApiProperty({
    description: 'Human-readable message describing the result',
    example: 'Resource updated successfully',
  })
  message: string;

  @ApiProperty({
    description: 'The updated resource data',
  })
  data: T;

  @ApiProperty({
    description: 'Timestamp when the response was generated',
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
 * Deleted resource response
 */
export class DeletedResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  status: number;

  @ApiProperty({
    description: 'Human-readable message describing the result',
    example: 'Resource deleted successfully',
  })
  message: string;

  @ApiProperty({
    description: 'ID of the deleted resource',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  deletedId?: string;

  @ApiProperty({
    description: 'Timestamp when the response was generated',
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
