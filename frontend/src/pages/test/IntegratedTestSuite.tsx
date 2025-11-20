import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Alert,
  Divider,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  CheckCircle,
  Login,
  Info,
  Warning,
  ExpandMore,
  Error as ErrorIcon,
  PlayArrow,
  ContentCopy,
} from '@mui/icons-material';

interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: string[];
}

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  response?: any;
  error?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function IntegratedTestSuite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const callbackProcessedRef = useRef(false);
  const [activeTab, setActiveTab] = useState(0);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const [orgTestData, setOrgTestData] = useState({
    organizationName: 'Test Org ' + Date.now(),
    organizationSlug: 'test-org-' + Date.now(),
    industry: 'Technology',
    companySize: '11-50',
    organizationId: '',
    inviteEmail: '',
    inviteFirstName: '',
    inviteLastName: '',
    inviteRole: 'client_employee',
    updateName: '',
  });

  const [userTestData, setUserTestData] = useState({
    searchTerm: '',
    filterRole: '',
    filterStatus: 'active',
    userId: '',
  });

  const DEVELOPER_SANDBOX_CLIENT_ID = 'test-client';
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectUri = typeof window !== 'undefined' ? window.location.origin + '/test' : '';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (callbackProcessedRef.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');
    const state = urlParams.get('state');

    if (errorParam) {
      callbackProcessedRef.current = true;
      setError(`Authentication failed: ${errorParam}`);
      window.history.replaceState({}, document.title, '/test');
    } else if (code) {
      callbackProcessedRef.current = true;
      handleCallback(code, state);
    }
  }, []);

  const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const generateCodeVerifier = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const handleLoginClick = async () => {
    if (typeof window === 'undefined') return;

    setLoading(true);
    setError(null);

    try {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = Math.random().toString(36).substring(7);

      sessionStorage.setItem('pkce_code_verifier', codeVerifier);
      sessionStorage.setItem('pkce_state', state);

      const authParams = new URLSearchParams({
        client_id: DEVELOPER_SANDBOX_CLIENT_ID,
        redirect_uri: redirectUri,
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });

      const authUrl = `${apiUrl}/api/v1/sso/authorize?${authParams}`;
      window.location.href = authUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to initiate login');
      setLoading(false);
    }
  };

  const handleCallback = async (code: string, returnedState: string | null) => {
    if (typeof window === 'undefined') return;

    setLoading(true);
    setError(null);

    try {
      const savedState = sessionStorage.getItem('pkce_state');
      const codeVerifier = sessionStorage.getItem('pkce_code_verifier');

      if (returnedState !== savedState) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }

      if (!codeVerifier) {
        throw new Error('Code verifier not found');
      }

      const tokenResponse = await fetch(`${apiUrl}/api/v1/sso/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: code,
          client_id: DEVELOPER_SANDBOX_CLIENT_ID,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.message || 'Token exchange failed');
      }

      const tokenData = await tokenResponse.json();
      const token = tokenData.access_token;
      setAccessToken(token);

      const userResponse = await fetch(`${apiUrl}/api/v1/sso/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user information');
      }

      const user = await userResponse.json();
      setUserInfo(user);

      sessionStorage.removeItem('pkce_code_verifier');
      sessionStorage.removeItem('pkce_state');

      window.history.replaceState({}, document.title, '/test');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSession = async () => {
    try {
      const refreshToken = localStorage.getItem('teamified_refresh_token');
      
      await fetch(`${apiUrl}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }
    
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('pkce_state');
    localStorage.removeItem('teamified_access_token');
    localStorage.removeItem('teamified_refresh_token');
    callbackProcessedRef.current = false;
    window.location.href = '/test';
  };

  const updateTestResult = (name: string, status: 'pending' | 'running' | 'success' | 'error', message?: string, response?: any, error?: string) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        return prev.map(r => r.name === name ? { ...r, status, message, response, error } : r);
      }
      return [...prev, { name, status, message, response, error }];
    });
  };

  const runTest = async (testName: string, apiCall: () => Promise<any>) => {
    updateTestResult(testName, 'running');
    try {
      const response = await apiCall();
      updateTestResult(testName, 'success', 'Test completed successfully', response);
      return response;
    } catch (err: any) {
      updateTestResult(testName, 'error', err.message, null, err.toString());
      throw err;
    }
  };

  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${apiUrl}/api/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `API request failed with status ${response.status}`);
    }

    return data;
  };

  const runOrganizationTests = async () => {
    setTestResults([]);

    try {
      const listResult = await runTest('Fetch Organizations List', () =>
        apiRequest('v1/organizations?page=1&limit=10')
      );

      const createResult = await runTest('Create New Organization', () =>
        apiRequest('v1/organizations', {
          method: 'POST',
          body: JSON.stringify({
            name: orgTestData.organizationName,
            slug: orgTestData.organizationSlug,
            industry: orgTestData.industry,
            companySize: orgTestData.companySize,
          }),
        })
      );

      const createdOrgId = createResult?.id;
      if (createdOrgId) {
        setOrgTestData(prev => ({ ...prev, organizationId: createdOrgId }));

        await runTest('Get Organization Details', () =>
          apiRequest(`v1/organizations/${createdOrgId}`)
        );

        await runTest('Update Organization Profile', () =>
          apiRequest(`v1/organizations/${createdOrgId}`, {
            method: 'PUT',
            body: JSON.stringify({
              name: orgTestData.organizationName + ' (Updated)',
            }),
          })
        );

        if (orgTestData.inviteEmail) {
          await runTest('Send Email Invitation', () =>
            apiRequest('v1/invitations/send-email', {
              method: 'POST',
              body: JSON.stringify({
                organizationId: createdOrgId,
                email: orgTestData.inviteEmail,
                firstName: orgTestData.inviteFirstName,
                lastName: orgTestData.inviteLastName,
                roleType: orgTestData.inviteRole,
              }),
            })
          );
        }

        await runTest('Generate Shareable Invite Link', () =>
          apiRequest('v1/invitations/generate-link', {
            method: 'POST',
            body: JSON.stringify({
              organizationId: createdOrgId,
              roleType: orgTestData.inviteRole,
              maxUses: 1,
            }),
          })
        );

        await runTest('Get Organization Members', () =>
          apiRequest(`v1/organizations/${createdOrgId}/members`)
        );

        await runTest('Delete Organization', () =>
          apiRequest(`v1/organizations/${createdOrgId}`, {
            method: 'DELETE',
          })
        );
      }
    } catch (err) {
      console.error('Test suite error:', err);
    }
  };

  const runUserTests = async () => {
    setTestResults([]);

    try {
      const listResult = await runTest('Fetch Users List', () => {
        const params = new URLSearchParams({
          page: '1',
          limit: '10',
          ...(userTestData.searchTerm && { search: userTestData.searchTerm }),
          ...(userTestData.filterRole && { role: userTestData.filterRole }),
          ...(userTestData.filterStatus && { status: userTestData.filterStatus }),
        });
        return apiRequest(`v1/users?${params}`);
      });

      await runTest('Get Current User Profile', () =>
        apiRequest('v1/users/me')
      );

      if (userTestData.userId) {
        await runTest('Get Specific User Details', () =>
          apiRequest(`v1/users/${userTestData.userId}`)
        );
      }

      if (listResult?.users?.length > 0) {
        const firstUserId = listResult.users[0].id;
        setUserTestData(prev => ({ ...prev, userId: firstUserId }));

        await runTest('Get User by ID', () =>
          apiRequest(`v1/users/${firstUserId}`)
        );
      }
    } catch (err) {
      console.error('User test suite error:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderTestResults = () => {
    if (testResults.length === 0) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Test Results
        </Typography>
        <Stack spacing={2}>
          {testResults.map((result, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  {result.status === 'running' && <CircularProgress size={20} />}
                  {result.status === 'success' && <CheckCircle color="success" />}
                  {result.status === 'error' && <ErrorIcon color="error" />}
                  {result.status === 'pending' && <Info color="info" />}
                  <Typography sx={{ fontWeight: 500 }}>{result.name}</Typography>
                  <Chip 
                    label={result.status} 
                    size="small" 
                    color={
                      result.status === 'success' ? 'success' :
                      result.status === 'error' ? 'error' :
                      result.status === 'running' ? 'primary' : 'default'
                    }
                    sx={{ ml: 'auto' }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {result.message && (
                    <Typography variant="body2" color="text.secondary">
                      {result.message}
                    </Typography>
                  )}
                  {result.error && (
                    <Alert severity="error">
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {result.error}
                      </Typography>
                    </Alert>
                  )}
                  {result.response && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2">Response:</Typography>
                        <Button
                          size="small"
                          startIcon={<ContentCopy />}
                          onClick={() => copyToClipboard(JSON.stringify(result.response, null, 2))}
                        >
                          Copy
                        </Button>
                      </Box>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: 'action.hover',
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          maxHeight: 300,
                          overflow: 'auto',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                        }}
                      >
                        {JSON.stringify(result.response, null, 2)}
                      </Box>
                    </Box>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
        SSO Test Application
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        This is a demo application to test the SSO authentication flow and API endpoints.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}

      {!userInfo ? (
        <>
          <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
            <Typography variant="body2">
              Click the button below to test the SSO login flow. You'll be redirected to the SSO provider to authenticate, then redirected back here with your user information.
            </Typography>
          </Alert>

          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<Login />}
            onClick={handleLoginClick}
            disabled={loading}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              py: 2,
              fontSize: '1.1rem',
              mb: 3,
              bgcolor: '#60a5fa',
              '&:hover': { bgcolor: '#3b82f6' },
            }}
          >
            {loading ? 'Redirecting...' : 'Login with SSO'}
          </Button>

          <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              OAuth 2.0 Flow Details:
            </Typography>
            <Stack spacing={1} sx={{ pl: 2 }}>
              <Typography variant="body2" color="text.secondary">
                • Uses Authorization Code Flow with PKCE
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Client ID: {DEVELOPER_SANDBOX_CLIENT_ID}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Client Type: Public (no secret required)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Redirect URI: {redirectUri}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Code Challenge Method: S256 (SHA-256)
              </Typography>
            </Stack>
            <Alert severity="warning" icon={<Warning />} sx={{ mt: 2 }}>
              <Typography variant="body2">
                This is a public client suitable for browser-based apps. Never embed client secrets in frontend code - use PKCE instead for security.
              </Typography>
            </Alert>
          </Paper>
        </>
      ) : (
        <Stack spacing={3}>
          <Alert severity="success" icon={<CheckCircle />}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Successfully authenticated via SSO!
            </Typography>
          </Alert>

          <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              User Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  User ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {userInfo.id}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Email
                </Typography>
                <Typography variant="body1">
                  {userInfo.email}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Name
                </Typography>
                <Typography variant="body1">
                  {userInfo.firstName} {userInfo.lastName}
                </Typography>
              </Grid>
              {userInfo.roles && userInfo.roles.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Roles
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {userInfo.roles.map(role => (
                      <Chip key={role} label={role} size="small" color="primary" />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>

          {accessToken && (
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Access Token (Truncated)
              </Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'action.hover', 
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                wordBreak: 'break-all'
              }}>
                {accessToken.substring(0, 50)}...
              </Box>
            </Paper>
          )}

          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              API Endpoint Tests
            </Typography>

            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Organization Management" />
              <Tab label="User Management" />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              <Typography variant="h6" sx={{ mb: 2 }}>Organization Management Tests</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Test organization CRUD operations, invitations, and member management.
              </Typography>

              <Stack spacing={2} sx={{ mb: 3 }}>
                <TextField
                  label="Organization Name"
                  value={orgTestData.organizationName}
                  onChange={(e) => setOrgTestData(prev => ({ ...prev, organizationName: e.target.value }))}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Organization Slug"
                  value={orgTestData.organizationSlug}
                  onChange={(e) => setOrgTestData(prev => ({ ...prev, organizationSlug: e.target.value }))}
                  fullWidth
                  size="small"
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Industry</InputLabel>
                      <Select
                        value={orgTestData.industry}
                        label="Industry"
                        onChange={(e) => setOrgTestData(prev => ({ ...prev, industry: e.target.value }))}
                      >
                        <MenuItem value="Technology">Technology</MenuItem>
                        <MenuItem value="Healthcare">Healthcare</MenuItem>
                        <MenuItem value="Finance">Finance</MenuItem>
                        <MenuItem value="Education">Education</MenuItem>
                        <MenuItem value="Retail">Retail</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Company Size</InputLabel>
                      <Select
                        value={orgTestData.companySize}
                        label="Company Size"
                        onChange={(e) => setOrgTestData(prev => ({ ...prev, companySize: e.target.value }))}
                      >
                        <MenuItem value="1-10">1-10</MenuItem>
                        <MenuItem value="11-50">11-50</MenuItem>
                        <MenuItem value="51-200">51-200</MenuItem>
                        <MenuItem value="201-500">201-500</MenuItem>
                        <MenuItem value="500+">500+</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Email Invitation (Optional)
                </Typography>
                <TextField
                  label="Invite Email"
                  type="email"
                  value={orgTestData.inviteEmail}
                  onChange={(e) => setOrgTestData(prev => ({ ...prev, inviteEmail: e.target.value }))}
                  fullWidth
                  size="small"
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="First Name"
                      value={orgTestData.inviteFirstName}
                      onChange={(e) => setOrgTestData(prev => ({ ...prev, inviteFirstName: e.target.value }))}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Last Name"
                      value={orgTestData.inviteLastName}
                      onChange={(e) => setOrgTestData(prev => ({ ...prev, inviteLastName: e.target.value }))}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                </Grid>
                <FormControl fullWidth size="small">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={orgTestData.inviteRole}
                    label="Role"
                    onChange={(e) => setOrgTestData(prev => ({ ...prev, inviteRole: e.target.value }))}
                  >
                    <MenuItem value="client_employee">Employee</MenuItem>
                    <MenuItem value="client_hr">HR</MenuItem>
                    <MenuItem value="client_admin">Admin</MenuItem>
                    <MenuItem value="client_recruiter">Recruiter</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={runOrganizationTests}
                fullWidth
                sx={{ mb: 2 }}
              >
                Run All Organization Tests
              </Button>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Tests to be executed:</strong>
                  <br />• Fetch list of organizations (with filters)
                  <br />• Create new organization
                  <br />• Get organization details by ID
                  <br />• Update organization profile
                  <br />• Send email invitation (if email provided)
                  <br />• Generate shareable invite link
                  <br />• Get organization members
                  <br />• Delete organization
                </Typography>
              </Alert>

              {renderTestResults()}
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Typography variant="h6" sx={{ mb: 2 }}>User Management Tests</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Test user listing, filtering, and profile operations.
              </Typography>

              <Stack spacing={2} sx={{ mb: 3 }}>
                <TextField
                  label="Search Users"
                  placeholder="Search by name or email"
                  value={userTestData.searchTerm}
                  onChange={(e) => setUserTestData(prev => ({ ...prev, searchTerm: e.target.value }))}
                  fullWidth
                  size="small"
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Filter by Role"
                      value={userTestData.filterRole}
                      onChange={(e) => setUserTestData(prev => ({ ...prev, filterRole: e.target.value }))}
                      fullWidth
                      size="small"
                      placeholder="e.g., super_admin, client_admin"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Filter by Status</InputLabel>
                      <Select
                        value={userTestData.filterStatus}
                        label="Filter by Status"
                        onChange={(e) => setUserTestData(prev => ({ ...prev, filterStatus: e.target.value }))}
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="archived">Archived</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <TextField
                  label="User ID (Optional)"
                  value={userTestData.userId}
                  onChange={(e) => setUserTestData(prev => ({ ...prev, userId: e.target.value }))}
                  fullWidth
                  size="small"
                  placeholder="Leave empty to auto-select from list"
                />
              </Stack>

              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={runUserTests}
                fullWidth
                sx={{ mb: 2 }}
              >
                Run All User Tests
              </Button>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Tests to be executed:</strong>
                  <br />• Fetch list of users (with filters)
                  <br />• Get current user profile
                  <br />• Get specific user details (if ID provided)
                  <br />• Get user by ID (auto-selected from list)
                </Typography>
              </Alert>

              {renderTestResults()}
            </TabPanel>
          </Paper>

          <Button
            variant="outlined"
            fullWidth
            onClick={handleClearSession}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600,
              py: 1.5,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                bgcolor: 'action.hover',
              }
            }}
          >
            Clear Session & Test Again
          </Button>
        </Stack>
      )}
    </Box>
  );
}
