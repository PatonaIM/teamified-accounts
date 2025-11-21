import axios from 'axios';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  emailVerified: boolean;
  roles: string[];
  hasOnboardingRecord?: boolean;
  hasEmploymentRecord?: boolean;
}

// Rate limiting configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Rate limiting state
let loginAttempts = 0;
let lockoutUntil: number | null = null;

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://teamified-team-member-portal-backend.vercel.app/api';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create separate axios instance for refresh calls (no interceptors to avoid circular loops)
const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF token management
export const setCSRFToken = (token: string): void => {
  localStorage.setItem(CSRF_TOKEN_KEY, token);
};

export const getCSRFToken = (): string | null => {
  return localStorage.getItem(CSRF_TOKEN_KEY);
};

// Request interceptor to add auth token and CSRF token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token for POST/PUT/DELETE requests
    const csrfToken = getCSRFToken();
    if (csrfToken && ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await refreshAccessToken(refreshToken);
          const { accessToken } = response.data;
          
          setAccessToken(accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Token Management
const ACCESS_TOKEN_KEY = 'teamified_access_token';
const REFRESH_TOKEN_KEY = 'teamified_refresh_token';
const CSRF_TOKEN_KEY = 'teamified_csrf_token';

export const setAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const removeTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(CSRF_TOKEN_KEY);
};

// Rate limiting functions
export const checkRateLimit = (): { allowed: boolean; remainingAttempts: number; lockoutTime?: number } => {
  const now = Date.now();
  
  // Check if currently locked out
  if (lockoutUntil && now < lockoutUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutTime: lockoutUntil
    };
  }
  
  // Reset lockout if expired
  if (lockoutUntil && now >= lockoutUntil) {
    lockoutUntil = null;
    loginAttempts = 0;
  }
  
  return {
    allowed: loginAttempts < MAX_LOGIN_ATTEMPTS,
    remainingAttempts: MAX_LOGIN_ATTEMPTS - loginAttempts
  };
};

export const recordFailedLoginAttempt = (): void => {
  loginAttempts++;
  
  if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
    lockoutUntil = Date.now() + LOCKOUT_DURATION;
  }
};

export const resetLoginAttempts = (): void => {
  loginAttempts = 0;
  lockoutUntil = null;
};

// Authentication Methods
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // Check rate limiting
  const rateLimit = checkRateLimit();
  if (!rateLimit.allowed) {
    const lockoutMinutes = Math.ceil((rateLimit.lockoutTime! - Date.now()) / (1000 * 60));
    throw new Error(`Too many failed login attempts. Please try again in ${lockoutMinutes} minutes.`);
  }
  
  try {
    const response = await api.post('/v1/auth/login', credentials);
    const { accessToken, refreshToken, user } = response.data;
    
    // Store tokens
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    
    // Reset failed attempts on successful login
    resetLoginAttempts();
    
    return { accessToken, refreshToken, user };
  } catch (error) {
    // Record failed attempt
    recordFailedLoginAttempt();
    
    // Check if we're now locked out
    const newRateLimit = checkRateLimit();
    if (!newRateLimit.allowed) {
      const lockoutMinutes = Math.ceil((newRateLimit.lockoutTime! - Date.now()) / (1000 * 60));
      throw new Error(`Too many failed login attempts. Please try again in ${lockoutMinutes} minutes.`);
    }
    
    // Regular error message
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error(`Invalid credentials. ${newRateLimit.remainingAttempts} attempts remaining.`);
    }
    
    throw new Error('Login failed. Please check your credentials.');
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint to invalidate token on server
    await api.post('/v1/auth/logout');
  } catch (error) {
    // Continue with local logout even if server call fails
    console.warn('Server logout failed, continuing with local logout');
  } finally {
    // Always remove local tokens
    removeTokens();
  }
};

export const refreshAccessToken = async (refreshToken: string): Promise<{ data: { accessToken: string } }> => {
  try {
    const response = await refreshApi.post('/v1/auth/refresh', { refreshToken });
    return response;
  } catch (error) {
    throw new Error('Token refresh failed');
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    console.log('authService.getCurrentUser: Making request to /v1/users/me');
    const response = await api.get('/v1/users/me');
    console.log('authService.getCurrentUser: Response:', response.data);
    console.log('authService.getCurrentUser: Response type:', typeof response.data);
    console.log('authService.getCurrentUser: Response keys:', Object.keys(response.data || {}));
    
    // Check if response is HTML (nginx routing issue)
    if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
      console.log('authService.getCurrentUser: Received HTML response, trying JWT fallback');
      
      // Fallback to JWT token parsing
      const token = getAccessToken();
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('authService.getCurrentUser: JWT payload:', payload);
          
          const fallbackUser: User = {
            id: payload.sub || '',
            email: payload.email || '',
            firstName: payload.firstName || '',
            lastName: payload.lastName || '',
            isActive: true,
            emailVerified: true,
            roles: payload.roles || []
          };
          
          console.log('authService.getCurrentUser: Using JWT fallback user:', fallbackUser);
          return fallbackUser;
        } catch (jwtError) {
          console.error('authService.getCurrentUser: JWT parsing failed:', jwtError);
          throw new Error('Failed to parse JWT token');
        }
      }
      
      throw new Error('No valid user data available');
    }
    
    // Check if response has user wrapped in user property
    if (response.data && response.data.user) {
      console.log('authService.getCurrentUser: Extracting user from response.data.user');
      const user = response.data.user;
      console.log('authService.getCurrentUser: Raw user object:', user);
      console.log('authService.getCurrentUser: User userRoles:', user.userRoles);
      
      // Transform userRoles to roles array of strings
      if (user.userRoles && Array.isArray(user.userRoles)) {
        console.log('authService.getCurrentUser: userRoles structure:', JSON.stringify(user.userRoles, null, 2));
        user.roles = user.userRoles.map(roleObj => {
          console.log('authService.getCurrentUser: Processing role object:', roleObj);
          // The backend returns roleType directly in the userRoles array
          const roleName = roleObj.roleType || roleObj.role?.name || roleObj.role || roleObj.name || String(roleObj);
          console.log('authService.getCurrentUser: Extracted role name:', roleName);
          return roleName;
        });
        console.log('authService.getCurrentUser: Mapped roles:', user.roles);
      } else {
        user.roles = [];
        console.log('authService.getCurrentUser: No userRoles found, setting empty roles array');
      }
      
      return user;
    }
    
    return response.data;
  } catch (error) {
    console.error('authService.getCurrentUser: Error:', error);
    throw new Error('Failed to get current user');
  }
};

export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  
  try {
    // Check if token is expired (JWT tokens contain expiration time)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    return payload.exp > currentTime;
  } catch (error) {
    // If token parsing fails, consider it invalid
    return false;
  }
};

export const getTokenExpirationTime = (): number | null => {
  const token = getAccessToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    return null;
  }
};

// Enhanced session management across tabs
export const setupTokenRefresh = (): void => {
  const checkAndRefreshToken = () => {
    const expirationTime = getTokenExpirationTime();
    if (!expirationTime) return;
    
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    
    // Refresh token 5 minutes before expiration
    if (timeUntilExpiry <= 5 * 60 * 1000 && timeUntilExpiry > 0) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        refreshAccessToken(refreshToken)
          .then((response) => {
            setAccessToken(response.data.accessToken);
            // Broadcast token update to other tabs
            window.dispatchEvent(new CustomEvent('tokenRefreshed', { 
              detail: { accessToken: response.data.accessToken } 
            }));
          })
          .catch((error) => {
            console.error('Auto token refresh failed:', error);
            logout();
          });
      }
    }
  };
  
  // Check every minute
  setInterval(checkAndRefreshToken, 60 * 1000);
  
  // Initial check
  checkAndRefreshToken();
  
  // Listen for token updates from other tabs
  window.addEventListener('tokenRefreshed', (event: Event) => {
    const customEvent = event as CustomEvent;
    const { accessToken } = customEvent.detail;
    setAccessToken(accessToken);
  });
  
  // Listen for storage changes (other tabs logging out)
  window.addEventListener('storage', (event) => {
    if (event.key === ACCESS_TOKEN_KEY && !event.newValue) {
      // Token was removed in another tab, logout here too
      logout();
    }
  });
};

export default api;
