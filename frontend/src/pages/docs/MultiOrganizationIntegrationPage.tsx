import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Stack,
  IconButton,
  Chip,
} from '@mui/material';
import { ContentCopy, CheckCircle } from '@mui/icons-material';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function MultiOrganizationIntegrationPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const codeExamples = {
    jwt: `// JWT Token includes client information
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "clientId": "client-organization-uuid",
  "roles": ["eor", "hr_manager_client"],
  "iat": 1234567890,
  "exp": 1234571490
}`,

    apiRequest: `// All API requests automatically scope to user's client
const response = await fetch('/api/v1/employment-records', {
  headers: {
    'Authorization': \`Bearer \${accessToken}\`
  }
});

// Backend automatically filters by clientId from JWT
// Returns only employment records for user's organization`,

    roleMatrix: `// Role-based access with client scoping
const ROLE_PERMISSIONS = {
  // Global roles (no client scoping)
  'super_admin': {
    scope: 'all_orgs',
    canManageClients: true,
    canViewAllData: true
  },
  'internal_hr': {
    scope: 'all_orgs',
    canManageClients: false,
    canViewAllData: true
  },

  // Client-scoped roles
  'hr_manager_client': {
    scope: 'own_org',
    canManageEmployees: true,
    canViewPayroll: true,
    clientId: 'required'
  },
  'eor': {
    scope: 'own_org',
    canViewOwnData: true,
    canEditProfile: true,
    clientId: 'required'
  }
};`,

    backend: `// Backend implementation (NestJS example)
@Injectable()
export class EmploymentRecordsService {
  async findAll(userId: string, clientId: string) {
    // Automatically scope queries by clientId from JWT
    const query = this.repository
      .createQueryBuilder('record')
      .where('record.clientId = :clientId', { clientId });

    // Super admins can optionally view all clients
    const user = await this.userService.findOne(userId);
    if (user.roles.includes('super_admin')) {
      // Allow cross-client access for admins
      query.orWhere('1=1');
    }

    return query.getMany();
  }
}`,

    frontend: `// Frontend: Token automatically includes clientId
// All API calls are automatically scoped
const MyComponent = () => {
  const { user } = useAuth();
  
  // user.clientId is available from JWT
  // API calls automatically filtered by backend
  
  useEffect(() => {
    fetchEmployees(); // Only returns employees from user's org
  }, []);

  return (
    <div>
      <h1>Employees for {user.organizationName}</h1>
      {/* ... */}
    </div>
  );
};`
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Multi-Organization Integration Guide
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Understanding Teamified's multi-organization architecture and client scoping
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          Teamified implements a <strong>multi-organization architecture</strong> where each client organization
          has isolated data with automatic scoping based on JWT claims.
        </Typography>
      </Alert>

      {/* Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Architecture Overview
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          The platform uses a <strong>shared database with row-level isolation</strong> approach where:
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Client Identification
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Each user is associated with a client organization via <code>clientId</code> in their JWT token.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Automatic Data Scoping
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Backend services automatically filter queries by <code>clientId</code> to ensure data isolation.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Role-Based Access Control
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Roles determine whether users have global access (super_admin) or client-scoped access (hr_manager_client, eor).
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* JWT Structure */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          JWT Token Structure
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Access tokens include client information for automatic scoping:
        </Typography>
        <Box sx={{ position: 'relative' }}>
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
            onClick={() => handleCopy(codeExamples.jwt, 0)}
          >
            {copiedIndex === 0 ? <CheckCircle color="success" /> : <ContentCopy />}
          </IconButton>
          <SyntaxHighlighter language="json" style={docco}>
            {codeExamples.jwt}
          </SyntaxHighlighter>
        </Box>
      </Paper>

      {/* Role Matrix */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Role-Based Scoping
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Different roles have different scoping levels:
        </Typography>
        
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Chip label="Global Scope" size="small" color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Internal Roles
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              <code>super_admin</code>, <code>internal_hr</code>, <code>internal_recruiter</code> - Can access data across all client organizations
            </Typography>
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Chip label="Client Scope" size="small" color="secondary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Client Roles
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              <code>hr_manager_client</code>, <code>eor</code>, <code>candidate</code> - Can only access data for their assigned client organization
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ position: 'relative' }}>
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
            onClick={() => handleCopy(codeExamples.roleMatrix, 1)}
          >
            {copiedIndex === 1 ? <CheckCircle color="success" /> : <ContentCopy />}
          </IconButton>
          <SyntaxHighlighter language="typescript" style={docco}>
            {codeExamples.roleMatrix}
          </SyntaxHighlighter>
        </Box>
      </Paper>

      {/* API Usage */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          API Usage
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          When making API requests with a valid access token, the backend automatically scopes data by the client:
        </Typography>
        <Box sx={{ position: 'relative' }}>
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
            onClick={() => handleCopy(codeExamples.apiRequest, 2)}
          >
            {copiedIndex === 2 ? <CheckCircle color="success" /> : <ContentCopy />}
          </IconButton>
          <SyntaxHighlighter language="javascript" style={docco}>
            {codeExamples.apiRequest}
          </SyntaxHighlighter>
        </Box>
      </Paper>

      {/* Backend Implementation */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Backend Implementation
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Example of how the backend implements client scoping:
        </Typography>
        <Box sx={{ position: 'relative' }}>
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
            onClick={() => handleCopy(codeExamples.backend, 3)}
          >
            {copiedIndex === 3 ? <CheckCircle color="success" /> : <ContentCopy />}
          </IconButton>
          <SyntaxHighlighter language="typescript" style={docco}>
            {codeExamples.backend}
          </SyntaxHighlighter>
        </Box>
      </Paper>

      {/* Frontend Integration */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Frontend Integration
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Frontend applications don't need to handle scoping manually:
        </Typography>
        <Box sx={{ position: 'relative' }}>
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
            onClick={() => handleCopy(codeExamples.frontend, 4)}
          >
            {copiedIndex === 4 ? <CheckCircle color="success" /> : <ContentCopy />}
          </IconButton>
          <SyntaxHighlighter language="typescript" style={docco}>
            {codeExamples.frontend}
          </SyntaxHighlighter>
        </Box>
      </Paper>

      {/* Best Practices */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Best Practices
        </Typography>
        <Stack spacing={2}>
          <Alert severity="success">
            <Typography variant="body2">
              <strong>Automatic Scoping</strong> - Let the backend handle data isolation. Don't manually filter by clientId in frontend code.
            </Typography>
          </Alert>
          <Typography variant="body2">
            • Never expose data across clients in API responses
          </Typography>
          <Typography variant="body2">
            • Always validate <code>clientId</code> from JWT, never from request parameters
          </Typography>
          <Typography variant="body2">
            • Implement row-level security at the database query level
          </Typography>
          <Typography variant="body2">
            • Use role-based guards to enforce access control
          </Typography>
          <Typography variant="body2">
            • Test cross-client data isolation thoroughly before deploying
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
