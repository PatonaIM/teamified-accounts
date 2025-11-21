# API Rate Limiting Documentation

## Overview
The Teamified EOR Portal API implements comprehensive rate limiting to prevent abuse and ensure fair usage across all endpoints.

## Rate Limiting Strategy

### Global Rate Limits
- **Default**: 100 requests per minute per IP
- **Burst**: 20 requests per 10 seconds
- **Window**: Sliding window with 1-minute intervals

### Endpoint-Specific Limits

#### Authentication Endpoints
- **Login**: 5 attempts per minute per IP
- **Refresh Token**: 10 requests per minute per user
- **Password Reset**: 3 attempts per hour per email

#### Invitation Endpoints
- **Create Invitation**: 10 invitations per minute per user
- **Resend Invitation**: 5 resends per 5 minutes per user
- **List Invitations**: 30 requests per minute per user

#### User Management Endpoints
- **Profile Updates**: 20 requests per minute per user
- **Bulk Operations**: 5 operations per minute per user
- **User Search**: 50 requests per minute per user

#### Document Endpoints
- **File Upload**: 10 uploads per hour per user
- **File Download**: 100 downloads per hour per user
- **File List**: 30 requests per minute per user

## Rate Limiting Headers

### Response Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 60
```

### Header Descriptions
- **X-RateLimit-Limit**: Maximum requests allowed in the current window
- **X-RateLimit-Remaining**: Number of requests remaining in the current window
- **X-RateLimit-Reset**: Unix timestamp when the rate limit window resets
- **X-RateLimit-Window**: Duration of the rate limit window in seconds

## Rate Limit Exceeded Response

### HTTP Status: 429 Too Many Requests
```json
{
  "type": "https://teamified.com/errors/rate-limit-exceeded",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Rate limit exceeded. Please try again later.",
  "instance": "/api/v1/auth/login",
  "retryAfter": 60,
  "rateLimitInfo": {
    "limit": 100,
    "remaining": 0,
    "reset": 1640995200,
    "window": 60
  }
}
```

## Rate Limiting Implementation

### Redis-Based Storage
- Uses Redis for distributed rate limiting
- Supports multiple server instances
- Persistent across server restarts

### IP-Based Limiting
- Primary limiting by client IP address
- Supports IPv4 and IPv6 addresses
- Handles proxy and load balancer scenarios

### User-Based Limiting
- Additional limiting by authenticated user ID
- Applied to user-specific endpoints
- Works in conjunction with IP-based limiting

## Best Practices

### For API Consumers
1. **Implement Exponential Backoff**: Wait progressively longer between retries
2. **Respect Rate Limit Headers**: Monitor remaining requests and reset times
3. **Cache Responses**: Reduce API calls by caching frequently accessed data
4. **Batch Requests**: Combine multiple operations into single requests when possible

### For API Providers
1. **Monitor Rate Limit Usage**: Track which endpoints are most frequently rate-limited
2. **Adjust Limits**: Modify limits based on usage patterns and business needs
3. **Provide Clear Documentation**: Document rate limits for each endpoint
4. **Implement Graceful Degradation**: Provide alternative responses when rate limited

## Monitoring and Alerting

### Metrics Tracked
- Rate limit violations per endpoint
- Average requests per minute per IP
- Peak usage times and patterns
- Geographic distribution of rate limits

### Alerting Thresholds
- **Warning**: 80% of rate limit capacity used
- **Critical**: Rate limit exceeded for 5+ consecutive minutes
- **Emergency**: Rate limit exceeded for 15+ consecutive minutes

## Rate Limit Exceptions

### Whitelisted IPs
- Internal monitoring systems
- CI/CD pipelines
- Load balancer health checks

### Emergency Override
- Available for critical system operations
- Requires special authentication
- Logged for audit purposes

## Troubleshooting

### Common Issues
1. **Rate Limit Exceeded**: Wait for the reset window or implement backoff
2. **Inconsistent Limits**: Check for multiple IP addresses or user sessions
3. **Slow Performance**: Consider caching or request batching

### Debug Information
- Check response headers for rate limit information
- Monitor application logs for rate limit violations
- Use API analytics to identify usage patterns

## Contact and Support

For rate limiting questions or issues:
- **Technical Support**: tech-support@teamified.com
- **API Issues**: api-support@teamified.com
- **Emergency**: emergency@teamified.com

## Changelog

### Version 1.0.0 (2024-01-15)
- Initial rate limiting implementation
- Global and endpoint-specific limits
- Redis-based distributed limiting
- Comprehensive monitoring and alerting
