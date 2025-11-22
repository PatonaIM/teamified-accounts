# API Documentation Guidelines

## Overview
This document provides guidelines for maintaining comprehensive API documentation using Swagger/OpenAPI in the Teamified Accounts project.

## Documentation Standards

### 1. Controller Documentation
All controllers must include:
- `@ApiTags()` - Categorize endpoints by functional area
- `@ApiOperation()` - Detailed summary and description for each endpoint
- `@ApiResponse()` - Comprehensive response documentation including error cases
- `@ApiBearerAuth()` - Security requirements for protected endpoints
- `@ApiSecurity()` - Additional security context

### 2. DTO Documentation
All DTOs must include:
- `@ApiProperty()` - Detailed property descriptions with examples
- Type information and validation rules
- Format specifications where applicable
- Required vs optional field indicators

### 3. Error Response Documentation
Use standardized error response DTOs:
- `ErrorResponseDto` - Generic errors
- `ValidationErrorResponseDto` - Validation errors
- `AuthErrorResponseDto` - Authentication errors
- `BusinessErrorResponseDto` - Business logic errors

### 4. Response Documentation
Include comprehensive response documentation:
- Success responses with detailed schemas
- Error responses with specific error codes
- Headers and metadata information
- Examples where helpful

## Documentation Maintenance Process

### 1. Code Changes
When making API changes:
1. Update controller decorators immediately
2. Update DTO documentation
3. Add new error response types if needed
4. Test documentation generation locally

### 2. Review Process
Before merging API changes:
1. Verify all new endpoints are documented
2. Check that existing documentation is still accurate
3. Ensure error responses are comprehensive
4. Validate examples and descriptions

### 3. Documentation Generation
Documentation is automatically generated from code annotations:
- Swagger JSON: `/api/docs-json`
- Swagger UI: `/api/docs`
- Generated from TypeScript decorators
- No separate documentation files needed

## Versioning Strategy

### API Versioning
- Use URL versioning: `/api/v1/`
- Update version in Swagger configuration
- Maintain backward compatibility
- Document breaking changes

### Documentation Versioning
- Version follows API version
- Update `DocumentBuilder.setVersion()`
- Include version in Swagger UI
- Track changes in changelog

## Quality Checks

### Automated Checks
- TypeScript compilation validates decorators
- Build process ensures documentation generation
- CI/CD pipeline validates Swagger JSON

### Manual Checks
- Review Swagger UI for completeness
- Verify all endpoints are documented
- Check error response coverage
- Validate example data

## Best Practices

### 1. Descriptions
- Write clear, concise descriptions
- Include business context
- Explain complex workflows
- Provide use case examples

### 2. Examples
- Use realistic example data
- Include edge cases
- Show both success and error scenarios
- Keep examples up-to-date

### 3. Error Handling
- Document all possible error responses
- Use consistent error formats
- Include error codes and messages
- Provide troubleshooting guidance

### 4. Security
- Document authentication requirements
- Explain authorization rules
- Include security considerations
- Show token usage examples

## Monitoring and Maintenance

### Regular Reviews
- Monthly documentation review
- Quarterly comprehensive audit
- Annual documentation strategy review
- Continuous improvement based on feedback

### Metrics
- Track documentation completeness
- Monitor API usage patterns
- Measure developer satisfaction
- Identify documentation gaps

## Tools and Resources

### Development Tools
- Swagger UI for interactive testing
- Postman collections for API testing
- TypeScript for type safety
- NestJS decorators for documentation

### Documentation Tools
- Swagger/OpenAPI 3.0 specification
- Swagger UI for presentation
- JSON schema validation
- Automated generation from code

## Contact and Support

For questions about API documentation:
- Development Team: dev@teamified.com
- Technical Lead: tech-lead@teamified.com
- Documentation Issues: docs@teamified.com

## Changelog

### Version 1.0.0 (2024-01-15)
- Initial documentation guidelines
- Swagger/OpenAPI 3.0 implementation
- Standardized error responses
- Comprehensive controller documentation
