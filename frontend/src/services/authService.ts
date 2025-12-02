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
  themePreference?: 'light' | 'dark' | 'teamified' | 'custom' | null;
  hasOnboardingRecord?: boolean;
  hasEmploymentRecord?: boolean;
  mustChangePassword?: boolean;
}

// Rate limiting configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Rate limiting state
let loginAttempts = 0;
let lockoutUntil: number | null = null;

// API Configuration
// Use /api for production (same-origin) or VITE_API_BASE_URL for custom backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests for SSO cookie management
  timeout: 30000, // 30 second timeout to prevent indefinite hangs
});

// Create separate axios instance for refresh calls (no interceptors to avoid circular loops)
const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
  timeout: 15000, // 15 second timeout for refresh token calls
});

// CSRF token management
export const setCSRFToken = (token: string): void => {
  localStorage.setItem(CSRF_TOKEN_KEY, token);
};

export const getCSRFToken = (): string | null => {
  return localStorage.getItem(CSRF_TOKEN_KEY);
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
        } else {
          // No refresh token available - session expired
          logoutDueToSessionExpiry();
          return Promise.reject(new Error('No refresh token available'));
        }
      } catch (refreshError: any) {
        // Refresh failed - handle various error cases
        // Token not found, expired, or any other refresh error
        logoutDueToSessionExpiry();
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
const USER_DATA_KEY = 'teamified_user_data';

export const setAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const setUserData = (user: User): void => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
};

export const getUserData = (): User | null => {
  const userData = localStorage.getItem(USER_DATA_KEY);
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
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
  localStorage.removeItem(USER_DATA_KEY);
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
    
    // Store user data for offline access
    if (user) {
      setUserData(user);
      
      // Cache theme preference immediately to prevent flash of wrong theme
      if (user.themePreference) {
        try {
          localStorage.setItem('teamified_theme_auth', user.themePreference);
        } catch (error) {
          console.warn('Failed to cache theme preference:', error);
        }
      }
    }
    
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
    
    // Clear last visited path and associated user ID
    localStorage.removeItem('teamified_last_path');
    localStorage.removeItem('teamified_last_path_user');
    
    // Clear theme preferences on logout
    try {
      const { clearThemePreferences } = await import('../contexts/ThemeContext');
      clearThemePreferences();
    } catch (error) {
      console.warn('Failed to clear theme preferences:', error);
    }
  }
};

export const logoutDueToSessionExpiry = async (): Promise<void> => {
  await logout();
  
  // Dispatch custom event to notify the app that session has expired
  window.dispatchEvent(new CustomEvent('sessionExpired', {
    detail: { reason: 'token_refresh_failed' }
  }));
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
  console.log('authService.getCurrentUser: Starting user retrieval');
  
  // First, try to get cached user data from localStorage (NO API CALL NEEDED!)
  const cachedUser = getUserData();
  if (cachedUser) {
    console.log('authService.getCurrentUser: Using cached user data:', cachedUser);
    return cachedUser;
  }
  
  console.log('authService.getCurrentUser: No cached data, trying JWT fallback');
  
  // Second fallback: Parse JWT token to get user info (NO API CALL NEEDED!)
  const token = getAccessToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('authService.getCurrentUser: JWT payload:', payload);
      
      const jwtUser: User = {
        id: payload.sub || '',
        email: payload.email || '',
        firstName: payload.firstName || '',
        lastName: payload.lastName || '',
        isActive: true,
        emailVerified: true,
        roles: payload.roles || []
      };
      
      console.log('authService.getCurrentUser: Using JWT-based user:', jwtUser);
      
      // Cache for future use
      setUserData(jwtUser);
      
      return jwtUser;
    } catch (jwtError) {
      console.error('authService.getCurrentUser: JWT parsing failed:', jwtError);
    }
  }
  
  // Third fallback: Try API call to /me endpoint (only if previous methods failed)
  console.log('authService.getCurrentUser: Attempting API call to /v1/users/me as last resort');
  try {
    const response = await api.get('/v1/users/me');
    console.log('authService.getCurrentUser: API Response:', response.data);
    
    let user = response.data;
    
    // Check if response has user wrapped in user property
    if (response.data && response.data.user) {
      user = response.data.user;
      
      // Transform userRoles to roles array of strings
      if (user.userRoles && Array.isArray(user.userRoles)) {
        user.roles = user.userRoles.map(roleObj => {
          return roleObj.roleType || roleObj.role?.name || roleObj.role || roleObj.name || String(roleObj);
        });
      } else {
        user.roles = [];
      }
    }
    
    // Cache for future use
    setUserData(user);
    
    return user;
  } catch (error) {
    console.error('authService.getCurrentUser: All methods failed:', error);
    throw new Error('Failed to get current user - no cached data, JWT parsing failed, and API call failed');
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

// Signup Methods
export interface CandidateSignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ClientAdminSignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  slug?: string;
  industry?: string;
  companySize?: string;
}

export interface SignupResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
  organization?: {
    id: string;
    name: string;
    slug: string;
    industry: string | null;
    companySize: string | null;
  };
  message: string;
}

export const candidateSignup = async (data: CandidateSignupData): Promise<SignupResponse> => {
  try {
    const response = await api.post('/v1/auth/signup/candidate', data);
    const { accessToken, refreshToken, user, message } = response.data;
    
    // Store tokens
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    
    return { accessToken, refreshToken, user, message };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const message = error.response.data?.message || 'Signup failed';
      throw new Error(message);
    }
    throw new Error('Signup failed. Please try again.');
  }
};

export const clientAdminSignup = async (data: ClientAdminSignupData): Promise<SignupResponse> => {
  try {
    const response = await api.post('/v1/auth/signup/client-admin', data);
    const { accessToken, refreshToken, user, organization, message } = response.data;
    
    // Store tokens
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    
    return { accessToken, refreshToken, user, organization, message };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const message = error.response.data?.message || 'Signup failed';
      throw new Error(message);
    }
    throw new Error('Signup failed. Please try again.');
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
            logoutDueToSessionExpiry();
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
