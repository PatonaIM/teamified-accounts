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

  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  const [fetchOrgsFilters, setFetchOrgsFilters] = useState({
    page: '1',
    limit: '10',
    search: '',
    industry: '',
    companySize: '',
    status: '',
  });

  const [getOrgId, setGetOrgId] = useState('');
  
  const [createOrgData, setCreateOrgData] = useState({
    name: 'Test Org ' + Date.now(),
    slug: 'test-org-' + Date.now(),
    industry: 'Technology',
    companySize: '11-50',
  });

  const [deleteOrgId, setDeleteOrgId] = useState('');

  const [emailInviteData, setEmailInviteData] = useState({
    organizationId: '',
    email: '',
    firstName: '',
    lastName: '',
    roleType: 'client_employee',
  });

  const [linkInviteData, setLinkInviteData] = useState({
    organizationId: '',
    roleType: 'client_employee',
    maxUses: 1,
  });

  const [removeUserData, setRemoveUserData] = useState({
    organizationId: '',
    userId: '',
  });

  const [editProfileData, setEditProfileData] = useState({
    organizationId: '',
    name: '',
    industry: '',
    companySize: '',
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

  const updateTestResult = (key: string, result: TestResult) => {
    setTestResults(prev => ({ ...prev, [key]: result }));
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

  const runTest = async (key: string, apiCall: () => Promise<any>) => {
    updateTestResult(key, { status: 'running' });
    try {
      const response = await apiCall();
      updateTestResult(key, { 
        status: 'success', 
        message: 'Test completed successfully', 
        response 
      });
      return response;
    } catch (err: any) {
      updateTestResult(key, { 
        status: 'error', 
        message: err.message, 
        error: err.toString() 
      });
      throw err;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderTestResult = (key: string) => {
    const result = testResults[key];
    if (!result) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              {result.status === 'running' && <CircularProgress size={20} />}
              {result.status === 'success' && <CheckCircle color="success" />}
              {result.status === 'error' && <ErrorIcon color="error" />}
              <Typography sx={{ fontWeight: 500 }}>Test Result</Typography>
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
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  User ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {userInfo.id}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Email
                </Typography>
                <Typography variant="body1">
                  {userInfo.email}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Name
                </Typography>
                <Typography variant="body1">
                  {userInfo.firstName} {userInfo.lastName}
                </Typography>
              </Box>
              {userInfo.roles && userInfo.roles.length > 0 && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Roles
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {userInfo.roles.map(role => (
                      <Chip key={role} label={role} size="small" color="primary" />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
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
              <Stack spacing={4}>
                {/* 1. Fetch List of Organizations */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      1. Fetch List of Organizations
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      GET /api/v1/organizations
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <TextField
                          label="Page"
                          type="number"
                          value={fetchOrgsFilters.page}
                          onChange={(e) => setFetchOrgsFilters(prev => ({ ...prev, page: e.target.value }))}
                          size="small"
                        />
                        <TextField
                          label="Limit"
                          type="number"
                          value={fetchOrgsFilters.limit}
                          onChange={(e) => setFetchOrgsFilters(prev => ({ ...prev, limit: e.target.value }))}
                          size="small"
                        />
                      </Box>
                      <TextField
                        label="Search"
                        placeholder="Search by name or slug"
                        value={fetchOrgsFilters.search}
                        onChange={(e) => setFetchOrgsFilters(prev => ({ ...prev, search: e.target.value }))}
                        size="small"
                      />
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                        <TextField
                          label="Industry"
                          value={fetchOrgsFilters.industry}
                          onChange={(e) => setFetchOrgsFilters(prev => ({ ...prev, industry: e.target.value }))}
                          size="small"
                        />
                        <TextField
                          label="Company Size"
                          value={fetchOrgsFilters.companySize}
                          onChange={(e) => setFetchOrgsFilters(prev => ({ ...prev, companySize: e.target.value }))}
                          size="small"
                        />
                        <FormControl size="small">
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={fetchOrgsFilters.status}
                            label="Status"
                            onChange={(e) => setFetchOrgsFilters(prev => ({ ...prev, status: e.target.value }))}
                          >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => runTest('fetchOrgs', () => {
                        const params = new URLSearchParams({
                          page: fetchOrgsFilters.page,
                          limit: fetchOrgsFilters.limit,
                          ...(fetchOrgsFilters.search && { search: fetchOrgsFilters.search }),
                          ...(fetchOrgsFilters.industry && { industry: fetchOrgsFilters.industry }),
                          ...(fetchOrgsFilters.companySize && { companySize: fetchOrgsFilters.companySize }),
                          ...(fetchOrgsFilters.status && { status: fetchOrgsFilters.status }),
                        });
                        return apiRequest(`v1/organizations?${params}`);
                      })}
                    >
                      Test Endpoint
                    </Button>
                  </CardActions>
                  {renderTestResult('fetchOrgs')}
                </Card>

                {/* 2. Get Organization Details */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      2. Get Organization Details
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      GET /api/v1/organizations/:id
                    </Typography>
                    <TextField
                      label="Organization ID"
                      placeholder="Enter organization UUID"
                      value={getOrgId}
                      onChange={(e) => setGetOrgId(e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => runTest('getOrgDetails', () => 
                        apiRequest(`v1/organizations/${getOrgId}`)
                      )}
                      disabled={!getOrgId}
                    >
                      Test Endpoint
                    </Button>
                  </CardActions>
                  {renderTestResult('getOrgDetails')}
                </Card>

                {/* 3. Create New Organization */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      3. Create New Organization
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      POST /api/v1/organizations
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="Organization Name"
                        value={createOrgData.name}
                        onChange={(e) => setCreateOrgData(prev => ({ ...prev, name: e.target.value }))}
                        size="small"
                      />
                      <TextField
                        label="Organization Slug"
                        value={createOrgData.slug}
                        onChange={(e) => setCreateOrgData(prev => ({ ...prev, slug: e.target.value }))}
                        size="small"
                      />
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <FormControl size="small">
                          <InputLabel>Industry</InputLabel>
                          <Select
                            value={createOrgData.industry}
                            label="Industry"
                            onChange={(e) => setCreateOrgData(prev => ({ ...prev, industry: e.target.value }))}
                          >
                            <MenuItem value="Technology">Technology</MenuItem>
                            <MenuItem value="Healthcare">Healthcare</MenuItem>
                            <MenuItem value="Finance">Finance</MenuItem>
                            <MenuItem value="Education">Education</MenuItem>
                            <MenuItem value="Retail">Retail</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl size="small">
                          <InputLabel>Company Size</InputLabel>
                          <Select
                            value={createOrgData.companySize}
                            label="Company Size"
                            onChange={(e) => setCreateOrgData(prev => ({ ...prev, companySize: e.target.value }))}
                          >
                            <MenuItem value="1-10">1-10</MenuItem>
                            <MenuItem value="11-50">11-50</MenuItem>
                            <MenuItem value="51-200">51-200</MenuItem>
                            <MenuItem value="201-500">201-500</MenuItem>
                            <MenuItem value="500+">500+</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => runTest('createOrg', () => 
                        apiRequest('v1/organizations', {
                          method: 'POST',
                          body: JSON.stringify(createOrgData),
                        })
                      )}
                    >
                      Test Endpoint
                    </Button>
                  </CardActions>
                  {renderTestResult('createOrg')}
                </Card>

                {/* 4. Delete Organization */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      4. Delete Organization
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      DELETE /api/v1/organizations/:id
                    </Typography>
                    <TextField
                      label="Organization ID"
                      placeholder="Enter organization UUID to delete"
                      value={deleteOrgId}
                      onChange={(e) => setDeleteOrgId(e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      This action cannot be undone. All associated data will be permanently deleted.
                    </Alert>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<PlayArrow />}
                      onClick={() => runTest('deleteOrg', () => 
                        apiRequest(`v1/organizations/${deleteOrgId}`, {
                          method: 'DELETE',
                        })
                      )}
                      disabled={!deleteOrgId}
                    >
                      Test Endpoint
                    </Button>
                  </CardActions>
                  {renderTestResult('deleteOrg')}
                </Card>

                {/* 5. Invite User via Email */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      5. Invite User to Organization via Email
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      POST /api/v1/invitations/send-email
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="Organization ID"
                        placeholder="Enter organization UUID"
                        value={emailInviteData.organizationId}
                        onChange={(e) => setEmailInviteData(prev => ({ ...prev, organizationId: e.target.value }))}
                        size="small"
                      />
                      <TextField
                        label="Email"
                        type="email"
                        placeholder="user@example.com"
                        value={emailInviteData.email}
                        onChange={(e) => setEmailInviteData(prev => ({ ...prev, email: e.target.value }))}
                        size="small"
                      />
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <TextField
                          label="First Name"
                          value={emailInviteData.firstName}
                          onChange={(e) => setEmailInviteData(prev => ({ ...prev, firstName: e.target.value }))}
                          size="small"
                        />
                        <TextField
                          label="Last Name"
                          value={emailInviteData.lastName}
                          onChange={(e) => setEmailInviteData(prev => ({ ...prev, lastName: e.target.value }))}
                          size="small"
                        />
                      </Box>
                      <FormControl size="small">
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={emailInviteData.roleType}
                          label="Role"
                          onChange={(e) => setEmailInviteData(prev => ({ ...prev, roleType: e.target.value }))}
                        >
                          <MenuItem value="client_employee">Employee</MenuItem>
                          <MenuItem value="client_hr">HR</MenuItem>
                          <MenuItem value="client_admin">Admin</MenuItem>
                          <MenuItem value="client_recruiter">Recruiter</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => runTest('inviteEmail', () => 
                        apiRequest('v1/invitations/send-email', {
                          method: 'POST',
                          body: JSON.stringify(emailInviteData),
                        })
                      )}
                      disabled={!emailInviteData.organizationId || !emailInviteData.email}
                    >
                      Test Endpoint
                    </Button>
                  </CardActions>
                  {renderTestResult('inviteEmail')}
                </Card>

                {/* 6. Invite User via Link */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      6. Invite User to Organization via Generated Link
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      POST /api/v1/invitations/generate-link
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="Organization ID"
                        placeholder="Enter organization UUID"
                        value={linkInviteData.organizationId}
                        onChange={(e) => setLinkInviteData(prev => ({ ...prev, organizationId: e.target.value }))}
                        size="small"
                      />
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <FormControl size="small">
                          <InputLabel>Role</InputLabel>
                          <Select
                            value={linkInviteData.roleType}
                            label="Role"
                            onChange={(e) => setLinkInviteData(prev => ({ ...prev, roleType: e.target.value }))}
                          >
                            <MenuItem value="client_employee">Employee</MenuItem>
                            <MenuItem value="client_hr">HR</MenuItem>
                            <MenuItem value="client_admin">Admin</MenuItem>
                            <MenuItem value="client_recruiter">Recruiter</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          label="Max Uses"
                          type="number"
                          value={linkInviteData.maxUses}
                          onChange={(e) => setLinkInviteData(prev => ({ ...prev, maxUses: parseInt(e.target.value) || 1 }))}
                          size="small"
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => runTest('inviteLink', () => 
                        apiRequest('v1/invitations/generate-link', {
                          method: 'POST',
                          body: JSON.stringify(linkInviteData),
                        })
                      )}
                      disabled={!linkInviteData.organizationId}
                    >
                      Test Endpoint
                    </Button>
                  </CardActions>
                  {renderTestResult('inviteLink')}
                </Card>

                {/* 7. Remove User from Organization */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      7. Remove User from Organization
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      DELETE /api/v1/organizations/:id/members/:userId
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="Organization ID"
                        placeholder="Enter organization UUID"
                        value={removeUserData.organizationId}
                        onChange={(e) => setRemoveUserData(prev => ({ ...prev, organizationId: e.target.value }))}
                        size="small"
                      />
                      <TextField
                        label="User ID"
                        placeholder="Enter user UUID to remove"
                        value={removeUserData.userId}
                        onChange={(e) => setRemoveUserData(prev => ({ ...prev, userId: e.target.value }))}
                        size="small"
                      />
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<PlayArrow />}
                      onClick={() => runTest('removeUser', () => 
                        apiRequest(`v1/organizations/${removeUserData.organizationId}/members/${removeUserData.userId}`, {
                          method: 'DELETE',
                        })
                      )}
                      disabled={!removeUserData.organizationId || !removeUserData.userId}
                    >
                      Test Endpoint
                    </Button>
                  </CardActions>
                  {renderTestResult('removeUser')}
                </Card>

                {/* 8. Edit Company Profile */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      8. Edit Company Profile Details
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      PUT /api/v1/organizations/:id
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="Organization ID"
                        placeholder="Enter organization UUID"
                        value={editProfileData.organizationId}
                        onChange={(e) => setEditProfileData(prev => ({ ...prev, organizationId: e.target.value }))}
                        size="small"
                      />
                      <TextField
                        label="New Name (Optional)"
                        value={editProfileData.name}
                        onChange={(e) => setEditProfileData(prev => ({ ...prev, name: e.target.value }))}
                        size="small"
                      />
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <TextField
                          label="New Industry (Optional)"
                          value={editProfileData.industry}
                          onChange={(e) => setEditProfileData(prev => ({ ...prev, industry: e.target.value }))}
                          size="small"
                        />
                        <TextField
                          label="New Company Size (Optional)"
                          value={editProfileData.companySize}
                          onChange={(e) => setEditProfileData(prev => ({ ...prev, companySize: e.target.value }))}
                          size="small"
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => {
                        const updateData: any = {};
                        if (editProfileData.name) updateData.name = editProfileData.name;
                        if (editProfileData.industry) updateData.industry = editProfileData.industry;
                        if (editProfileData.companySize) updateData.companySize = editProfileData.companySize;
                        
                        return runTest('editProfile', () => 
                          apiRequest(`v1/organizations/${editProfileData.organizationId}`, {
                            method: 'PUT',
                            body: JSON.stringify(updateData),
                          })
                        );
                      }}
                      disabled={!editProfileData.organizationId}
                    >
                      Test Endpoint
                    </Button>
                  </CardActions>
                  {renderTestResult('editProfile')}
                </Card>
              </Stack>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Alert severity="info">
                <Typography variant="body2">
                  User Management tests will be added here in the future.
                </Typography>
              </Alert>
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
