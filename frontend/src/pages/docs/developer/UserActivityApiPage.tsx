import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import { Timeline, Send, Apps, Warning } from '@mui/icons-material';
import DownloadMarkdownButton from '../../../components/docs/DownloadMarkdownButton';

const markdownContent = `# User Activity Tracking API

API reference for sending user activity data to Teamified Accounts. This enables centralized tracking of user behavior across all connected applications.

> **Note:** Activity data is aggregated and displayed in the user's "Connected Applications" section, showing login frequency and feature usage statistics per application.

## Record User Activity

Send user activity events to Teamified Accounts to track feature usage within your application.

\`\`\`
POST /api/v1/activity/record
Authorization: Bearer <sso_token>
Content-Type: application/json
\`\`\`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`action\` | string | Yes | The action performed (e.g., "view dashboard", "run report", "update settings") |
| \`feature\` | string | Yes | The feature category (e.g., "Dashboard", "Analytics", "Settings") |
| \`metadata\` | object | No | Optional additional data about the action (JSON object) |

### Example Request

\`\`\`json
POST /api/v1/activity/record
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "action": "view dashboard",
  "feature": "Dashboard",
  "metadata": {
    "dashboardId": "main-overview",
    "widgetsLoaded": 5
  }
}
\`\`\`

### Response

\`\`\`json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "message": "Activity recorded successfully",
  "data": {
    "id": "act_123e4567-e89b-12d3-a456-426614174000",
    "userId": "user_789",
    "applicationId": "app_456",
    "action": "view dashboard",
    "feature": "Dashboard",
    "recordedAt": "2025-12-03T10:30:00.000Z"
  }
}
\`\`\`

## Integration Examples

### JavaScript/TypeScript

\`\`\`typescript
// Activity Tracking Service
class ActivityTracker {
  private apiUrl: string;
  private ssoToken: string;

  constructor(apiUrl: string, ssoToken: string) {
    this.apiUrl = apiUrl;
    this.ssoToken = ssoToken;
  }

  async recordActivity(action: string, feature: string, metadata?: object) {
    try {
      const response = await fetch(\`\${this.apiUrl}/api/v1/activity/record\`, {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${this.ssoToken}\`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, feature, metadata }),
      });

      if (!response.ok) {
        console.error('Failed to record activity:', response.statusText);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Activity tracking error:', error);
      return null;
    }
  }
}

// Usage
const tracker = new ActivityTracker('https://accounts.teamified.com', ssoToken);

// Track page views
tracker.recordActivity('view dashboard', 'Dashboard');

// Track feature usage
tracker.recordActivity('run report', 'Analytics', {
  reportType: 'monthly-summary',
  dateRange: '2025-11'
});
\`\`\`

### React Hook Example

\`\`\`typescript
import { useCallback } from 'react';

export function useActivityTracker(ssoToken: string) {
  const trackActivity = useCallback(
    async (action: string, feature: string, metadata?: object) => {
      if (!ssoToken) return;

      try {
        await fetch('/api/v1/activity/record', {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${ssoToken}\`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action, feature, metadata }),
        });
      } catch (error) {
        console.error('Activity tracking failed:', error);
      }
    },
    [ssoToken]
  );

  return { trackActivity };
}
\`\`\`

### Python Example

\`\`\`python
import requests
from typing import Optional, Dict, Any

class TeamifiedActivityTracker:
    def __init__(self, api_url: str, sso_token: str):
        self.api_url = api_url
        self.sso_token = sso_token

    def record_activity(
        self,
        action: str,
        feature: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict]:
        try:
            response = requests.post(
                f"{self.api_url}/api/v1/activity/record",
                headers={
                    "Authorization": f"Bearer {self.sso_token}",
                    "Content-Type": "application/json",
                },
                json={
                    "action": action,
                    "feature": feature,
                    "metadata": metadata or {},
                },
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Activity tracking error: {e}")
            return None
\`\`\`

## Best Practices

- **Use Consistent Action Names:** Standardize action names across your application (e.g., "view", "create", "update", "delete") for meaningful analytics.
- **Categorize with Features:** Group related actions under feature categories (e.g., "Dashboard", "Reports", "Settings") for organized activity summaries.
- **Don't Over-Track:** Focus on meaningful user actions. Avoid tracking every mouse movement or scroll event to prevent data noise.
- **Handle Failures Gracefully:** Activity tracking should never block the main user flow. Use fire-and-forget patterns with error logging.
- **Rate Limiting:** The API allows up to 100 activity records per user per minute. For high-frequency events, consider batching or debouncing.

## Error Responses

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Missing required fields (action or feature) |
| 401 | Unauthorized | Invalid or expired SSO token |
| 403 | Forbidden | Application not authorized to track activity |
| 429 | Too Many Requests | Rate limit exceeded (100 requests/minute/user) |
| 500 | Internal Server Error | Server-side error - retry with exponential backoff |
`;

export default function UserActivityApiPage() {
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Timeline color="primary" />
          User Activity Tracking API
        </Typography>
        <DownloadMarkdownButton 
          filename="user-activity-api" 
          content={markdownContent} 
        />
      </Box>

      <Typography variant="body1" paragraph>
        API reference for sending user activity data to Teamified Accounts. This enables centralized 
        tracking of user behavior across all connected applications.
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          Activity data is aggregated and displayed in the user's "Connected Applications" section, 
          showing login frequency and feature usage statistics per application.
        </Typography>
      </Alert>

      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Send color="primary" fontSize="small" />
            Record User Activity
          </Typography>
          
          <Typography variant="body1" paragraph>
            Send user activity events to Teamified Accounts to track feature usage within your application.
          </Typography>

          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`POST ${apiUrl}/api/v1/activity/record
Authorization: Bearer <sso_token>
Content-Type: application/json`}
            </pre>
          </Paper>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Request Body
          </Typography>
          
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Field</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Required</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>action</code></TableCell>
                  <TableCell><Chip label="string" size="small" /></TableCell>
                  <TableCell><Chip label="Yes" color="error" size="small" /></TableCell>
                  <TableCell>The action performed (e.g., "view dashboard", "run report", "update settings")</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>feature</code></TableCell>
                  <TableCell><Chip label="string" size="small" /></TableCell>
                  <TableCell><Chip label="Yes" color="error" size="small" /></TableCell>
                  <TableCell>The feature category (e.g., "Dashboard", "Analytics", "Settings")</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>metadata</code></TableCell>
                  <TableCell><Chip label="object" size="small" /></TableCell>
                  <TableCell><Chip label="No" color="default" size="small" /></TableCell>
                  <TableCell>Optional additional data about the action (JSON object)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Example Request
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`POST ${apiUrl}/api/v1/activity/record
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "action": "view dashboard",
  "feature": "Dashboard",
  "metadata": {
    "dashboardId": "main-overview",
    "widgetsLoaded": 5
  }
}`}
            </pre>
          </Paper>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Response
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "message": "Activity recorded successfully",
  "data": {
    "id": "act_123e4567-e89b-12d3-a456-426614174000",
    "userId": "user_789",
    "applicationId": "app_456",
    "action": "view dashboard",
    "feature": "Dashboard",
    "recordedAt": "2025-12-03T10:30:00.000Z"
  }
}`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Apps color="primary" fontSize="small" />
            Integration Examples
          </Typography>
          
          <Typography variant="body1" paragraph>
            Here are examples of how to integrate activity tracking in your application.
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            JavaScript/TypeScript
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`// Activity Tracking Service
class ActivityTracker {
  private apiUrl: string;
  private ssoToken: string;

  constructor(apiUrl: string, ssoToken: string) {
    this.apiUrl = apiUrl;
    this.ssoToken = ssoToken;
  }

  async recordActivity(action: string, feature: string, metadata?: object) {
    try {
      const response = await fetch(\`\${this.apiUrl}/api/v1/activity/record\`, {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${this.ssoToken}\`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, feature, metadata }),
      });

      if (!response.ok) {
        console.error('Failed to record activity:', response.statusText);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Activity tracking error:', error);
      return null;
    }
  }
}

// Usage
const tracker = new ActivityTracker('${apiUrl}', ssoToken);

// Track page views
tracker.recordActivity('view dashboard', 'Dashboard');

// Track feature usage
tracker.recordActivity('run report', 'Analytics', {
  reportType: 'monthly-summary',
  dateRange: '2025-11'
});

// Track settings changes
tracker.recordActivity('update settings', 'Settings', {
  setting: 'notifications',
  newValue: 'enabled'
});`}
            </pre>
          </Paper>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            React Hook Example
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`import { useCallback } from 'react';

// Custom hook for activity tracking
export function useActivityTracker(ssoToken: string) {
  const trackActivity = useCallback(
    async (action: string, feature: string, metadata?: object) => {
      if (!ssoToken) return;

      try {
        await fetch('${apiUrl}/api/v1/activity/record', {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${ssoToken}\`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action, feature, metadata }),
        });
      } catch (error) {
        console.error('Activity tracking failed:', error);
      }
    },
    [ssoToken]
  );

  return { trackActivity };
}

// Usage in a component
function DashboardPage() {
  const { trackActivity } = useActivityTracker(ssoToken);

  useEffect(() => {
    // Track page view on mount
    trackActivity('view dashboard', 'Dashboard');
  }, [trackActivity]);

  const handleRunReport = () => {
    trackActivity('run report', 'Analytics');
    // ... run report logic
  };

  return (
    <div>
      <button onClick={handleRunReport}>Run Report</button>
    </div>
  );
}`}
            </pre>
          </Paper>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Python Example
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', overflow: 'auto', mb: 3 }}>
            <pre style={{ margin: 0 }}>
{`import requests
from typing import Optional, Dict, Any

class TeamifiedActivityTracker:
    def __init__(self, api_url: str, sso_token: str):
        self.api_url = api_url
        self.sso_token = sso_token

    def record_activity(
        self,
        action: str,
        feature: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict]:
        """Record user activity to Teamified Accounts."""
        try:
            response = requests.post(
                f"{self.api_url}/api/v1/activity/record",
                headers={
                    "Authorization": f"Bearer {self.sso_token}",
                    "Content-Type": "application/json",
                },
                json={
                    "action": action,
                    "feature": feature,
                    "metadata": metadata or {},
                },
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Activity tracking error: {e}")
            return None

# Usage
tracker = TeamifiedActivityTracker("${apiUrl}", sso_token)

# Track various activities
tracker.record_activity("view dashboard", "Dashboard")
tracker.record_activity("run report", "Analytics", {"report_type": "monthly"})
tracker.record_activity("update settings", "Settings", {"setting": "theme"})`}
            </pre>
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" fontSize="small" />
            Best Practices
          </Typography>
          
          <Stack spacing={2}>
            <Alert severity="success">
              <Typography variant="body2">
                <strong>Use Consistent Action Names:</strong> Standardize action names across your application 
                (e.g., "view", "create", "update", "delete") for meaningful analytics.
              </Typography>
            </Alert>

            <Alert severity="success">
              <Typography variant="body2">
                <strong>Categorize with Features:</strong> Group related actions under feature categories 
                (e.g., "Dashboard", "Reports", "Settings") for organized activity summaries.
              </Typography>
            </Alert>

            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Don't Over-Track:</strong> Focus on meaningful user actions. Avoid tracking every 
                mouse movement or scroll event to prevent data noise.
              </Typography>
            </Alert>

            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Handle Failures Gracefully:</strong> Activity tracking should never block the main 
                user flow. Use fire-and-forget patterns with error logging.
              </Typography>
            </Alert>

            <Alert severity="info">
              <Typography variant="body2">
                <strong>Rate Limiting:</strong> The API allows up to 100 activity records per user per minute. 
                For high-frequency events, consider batching or debouncing.
              </Typography>
            </Alert>
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Error Responses
          </Typography>
          
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Status Code</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Error</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="400" color="warning" size="small" /></TableCell>
                  <TableCell>Bad Request</TableCell>
                  <TableCell>Missing required fields (action or feature)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="401" color="error" size="small" /></TableCell>
                  <TableCell>Unauthorized</TableCell>
                  <TableCell>Invalid or expired SSO token</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="403" color="error" size="small" /></TableCell>
                  <TableCell>Forbidden</TableCell>
                  <TableCell>Application not authorized to track activity</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="429" color="warning" size="small" /></TableCell>
                  <TableCell>Too Many Requests</TableCell>
                  <TableCell>Rate limit exceeded (100 requests/minute/user)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="500" color="error" size="small" /></TableCell>
                  <TableCell>Internal Server Error</TableCell>
                  <TableCell>Server-side error - retry with exponential backoff</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </Box>
  );
}
