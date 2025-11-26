import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Stack,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { ContentCopy, CheckCircle, Devices, Timer, Security, Link as LinkIcon } from '@mui/icons-material';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`deep-linking-tabpanel-${index}`}
      aria-labelledby={`deep-linking-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function DeepLinkingGuidePage() {
  const [tabValue, setTabValue] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const apiUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-teamified-instance.com';

  const tokenStorageCode = `interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

class TokenStorage {
  private static readonly ACCESS_TOKEN_KEY = 'teamified_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'teamified_refresh_token';
  private static readonly EXPIRES_AT_KEY = 'teamified_expires_at';

  static saveTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(this.EXPIRES_AT_KEY, tokens.expiresAt.toString());
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    if (!expiresAt) return true;
    return Date.now() >= parseInt(expiresAt, 10);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
  }
}`;

  const sessionValidationCode = `class AuthService {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async validateSession(): Promise<UserInfo | null> {
    const accessToken = TokenStorage.getAccessToken();
    
    if (!accessToken) {
      return null;
    }

    try {
      const response = await fetch(\`\${this.baseUrl}/api/v1/sso/me\`, {
        method: 'GET',
        headers: {
          'Authorization': \`Bearer \${accessToken}\`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }

      if (response.status === 401) {
        return await this.tryRefreshToken();
      }

      return null;
    } catch (error) {
      console.error('Session validation failed:', error);
      return null;
    }
  }

  private async tryRefreshToken(): Promise<UserInfo | null> {
    const refreshToken = TokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      TokenStorage.clearTokens();
      return null;
    }

    try {
      const response = await fetch(\`\${this.baseUrl}/api/v1/auth/refresh\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        TokenStorage.clearTokens();
        return null;
      }

      const data = await response.json();
      
      TokenStorage.saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + 15 * 60 * 1000,
      });

      return await this.validateSession();
    } catch (error) {
      TokenStorage.clearTokens();
      return null;
    }
  }
}`;

  const reactAuthContextCode = `import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authService = new AuthService(import.meta.env.VITE_API_URL);
    
    async function checkSession() {
      const userInfo = await authService.validateSession();
      setUser(userInfo);
      setIsLoading(false);
      
      if (!userInfo) {
        const currentPath = window.location.pathname + window.location.search;
        authService.redirectToLogin(currentPath);
      }
    }
    
    checkSession();
  }, []);

  const logout = () => {
    TokenStorage.clearTokens();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated: !!user,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}`;

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LinkIcon color="primary" />
        Deep Linking & Session Persistence Guide
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Implement seamless authentication that persists across page refreshes and direct URL access
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          With proper deep linking implementation, users can bookmark any page in your app and return to it later 
          without re-authenticating, as long as their session is still valid.
        </Typography>
      </Alert>

      {/* Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Timer fontSize="small" />
          Session Timeouts
        </Typography>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Token Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Behavior</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Chip label="Access Token" size="small" color="primary" />
                </TableCell>
                <TableCell>15 minutes</TableCell>
                <TableCell>Must refresh using refresh token when expired</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Chip label="Refresh Token" size="small" color="secondary" />
                </TableCell>
                <TableCell>30 days</TableCell>
                <TableCell>Must re-authenticate after absolute expiry</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Chip label="Inactivity Timeout" size="small" color="warning" />
                </TableCell>
                <TableCell>48 hours</TableCell>
                <TableCell>Session expires if no API activity for 48 hours</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Multi-Device Support */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Devices fontSize="small" />
          Multi-Device & Browser Behavior
        </Typography>

        <TableContainer sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Scenario</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Session Behavior</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Same browser, multiple tabs</TableCell>
                <TableCell>
                  <Chip label="Shared Session" size="small" color="success" sx={{ mr: 1 }} />
                  All tabs share the same localStorage tokens
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Same browser, multiple windows</TableCell>
                <TableCell>
                  <Chip label="Shared Session" size="small" color="success" sx={{ mr: 1 }} />
                  All windows share the same session
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Different devices</TableCell>
                <TableCell>
                  <Chip label="Independent Sessions" size="small" color="info" sx={{ mr: 1 }} />
                  Each device requires login, sessions are independent
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Different browsers (Chrome/Firefox)</TableCell>
                <TableCell>
                  <Chip label="Separate Login Required" size="small" color="warning" sx={{ mr: 1 }} />
                  Browsers don't share storage
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Incognito/Private mode</TableCell>
                <TableCell>
                  <Chip label="Isolated Session" size="small" color="error" sx={{ mr: 1 }} />
                  No access to regular tokens
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Multi-Device Support:</strong> Users can be logged in on multiple devices simultaneously. 
            Each device has independent session timeouts and token expiry.
          </Typography>
        </Alert>

        <Alert severity="info">
          <Typography variant="body2">
            <strong>Logout Scope:</strong> Logging out on one device does NOT log out other devices. 
            Each session is completely independent.
          </Typography>
        </Alert>
      </Paper>

      {/* API Endpoints */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Key API Endpoints
        </Typography>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ minWidth: 200 }}>
              <strong>Validate Session:</strong>
            </Typography>
            <code style={{ fontSize: '0.875rem', flex: 1 }}>GET {apiUrl}/api/v1/sso/me</code>
            <IconButton size="small" onClick={() => handleCopy(`${apiUrl}/api/v1/sso/me`, 0)}>
              {copiedIndex === 0 ? <CheckCircle color="success" fontSize="small" /> : <ContentCopy fontSize="small" />}
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ minWidth: 200 }}>
              <strong>Refresh Token:</strong>
            </Typography>
            <code style={{ fontSize: '0.875rem', flex: 1 }}>POST {apiUrl}/api/v1/auth/refresh</code>
            <IconButton size="small" onClick={() => handleCopy(`${apiUrl}/api/v1/auth/refresh`, 1)}>
              {copiedIndex === 1 ? <CheckCircle color="success" fontSize="small" /> : <ContentCopy fontSize="small" />}
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ minWidth: 200 }}>
              <strong>SSO Authorize:</strong>
            </Typography>
            <code style={{ fontSize: '0.875rem', flex: 1 }}>GET {apiUrl}/api/v1/sso/authorize</code>
            <IconButton size="small" onClick={() => handleCopy(`${apiUrl}/api/v1/sso/authorize`, 2)}>
              {copiedIndex === 2 ? <CheckCircle color="success" fontSize="small" /> : <ContentCopy fontSize="small" />}
            </IconButton>
          </Box>
        </Stack>
      </Paper>

      {/* Session Flow Diagram */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Session Persistence Flow
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          When a user accesses a deep link (e.g., <code>/dashboard/reports</code>), your app should:
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Chip label="1" size="small" color="primary" />
            <Box>
              <Typography variant="subtitle2">Check for stored access token</Typography>
              <Typography variant="body2" color="text.secondary">
                Look in localStorage for an existing access token
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Chip label="2" size="small" color="primary" />
            <Box>
              <Typography variant="subtitle2">Validate token with /api/v1/sso/me</Typography>
              <Typography variant="body2" color="text.secondary">
                If token exists, verify it's still valid by calling the user info endpoint
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Chip label="3" size="small" color="primary" />
            <Box>
              <Typography variant="subtitle2">Handle 401 by refreshing token</Typography>
              <Typography variant="body2" color="text.secondary">
                If access token is expired, use refresh token to get a new one
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Chip label="4" size="small" color="primary" />
            <Box>
              <Typography variant="subtitle2">Redirect to login if refresh fails</Typography>
              <Typography variant="body2" color="text.secondary">
                Pass the current URL as returnUrl so user returns to the same page after login
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {/* Code Examples */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Implementation Examples
        </Typography>

        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Token Storage" />
          <Tab label="Session Validation" />
          <Tab label="React Context" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ position: 'relative' }}>
            <IconButton
              sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
              onClick={() => handleCopy(tokenStorageCode, 10)}
            >
              {copiedIndex === 10 ? <CheckCircle color="success" /> : <ContentCopy />}
            </IconButton>
            <SyntaxHighlighter language="typescript" style={docco}>
              {tokenStorageCode}
            </SyntaxHighlighter>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ position: 'relative' }}>
            <IconButton
              sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
              onClick={() => handleCopy(sessionValidationCode, 11)}
            >
              {copiedIndex === 11 ? <CheckCircle color="success" /> : <ContentCopy />}
            </IconButton>
            <SyntaxHighlighter language="typescript" style={docco}>
              {sessionValidationCode}
            </SyntaxHighlighter>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ position: 'relative' }}>
            <IconButton
              sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
              onClick={() => handleCopy(reactAuthContextCode, 12)}
            >
              {copiedIndex === 12 ? <CheckCircle color="success" /> : <ContentCopy />}
            </IconButton>
            <SyntaxHighlighter language="typescript" style={docco}>
              {reactAuthContextCode}
            </SyntaxHighlighter>
          </Box>
        </TabPanel>
      </Paper>

      {/* Security Best Practices */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security fontSize="small" />
          Security Best Practices
        </Typography>
        <Stack spacing={2}>
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>Token Rotation:</strong> Refresh tokens are single-use. Each refresh gives you a new refresh token. 
              The old one is immediately invalidated.
            </Typography>
          </Alert>
          <Typography variant="body2">
            Store tokens in localStorage for web apps, secure storage for mobile apps
          </Typography>
          <Typography variant="body2">
            Always use HTTPS - never transmit tokens over unencrypted connections
          </Typography>
          <Typography variant="body2">
            Clear all tokens on logout to prevent session fixation attacks
          </Typography>
          <Typography variant="body2">
            Handle "token reuse" errors by clearing tokens and redirecting to login
          </Typography>
          <Typography variant="body2">
            Implement proper error handling for network failures during token refresh
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
