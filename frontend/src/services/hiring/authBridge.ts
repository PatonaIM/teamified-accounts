/**
 * Authentication Bridge for TMFNUI Hiring APIs
 *
 * This service bridges portal authentication with TMFNUI backend APIs.
 * It handles:
 * - Adding portal auth tokens to hiring API requests
 * - Guest token management for unauthenticated endpoints
 * - Token refresh on 401 errors
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const HIRING_AUTH_API = import.meta.env.VITE_HIRING_AUTH_URL;

// Portal authentication token keys (must match authService.ts)
const PORTAL_ACCESS_TOKEN_KEY = 'teamified_access_token';
const PORTAL_REFRESH_TOKEN_KEY = 'teamified_refresh_token';

class HiringAuthBridge {
  private guestToken: string | null = null;
  private guestTokenExpiry: number = 0;
  private hiringUserToken: string | null = null;
  private hiringUserTokenExpiry: number = 0;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];
  private requestInterceptorId: number | null = null;
  private responseInterceptorId: number | null = null;

  /**
   * Initialize Axios interceptors for hiring API authentication
   * Call this once when the app starts
   */
  setupInterceptors() {
    // Prevent duplicate interceptor registration
    if (this.requestInterceptorId !== null || this.responseInterceptorId !== null) {
      console.log('[Hiring Auth Bridge] Interceptors already initialized, skipping');
      return;
    }
    // Request interceptor - adds auth token to hiring API requests
    this.requestInterceptorId = axios.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Only process hiring API requests (but skip auth API to prevent recursion)
        const isAuthRequest = config.url?.startsWith('/hiring-api/auth');
        if (config.url?.startsWith('/hiring-api') && !isAuthRequest) {
          console.log('[Hiring Auth Bridge] Processing hiring API request:', config.url);

          // Check if user is logged into portal
          const portalAuthToken = localStorage.getItem(PORTAL_ACCESS_TOKEN_KEY);
          const portalRefreshToken = localStorage.getItem(PORTAL_REFRESH_TOKEN_KEY);
          const isLoggedIn = !!(portalAuthToken && portalRefreshToken);

          console.log('[Hiring Auth Bridge] Portal login status:', {
            isLoggedIn,
            hasAccessToken: !!portalAuthToken,
            hasRefreshToken: !!portalRefreshToken
          });

          let token: string | null = null;

          if (isLoggedIn) {
            // User is authenticated - get hiring user token
            console.log('[Hiring Auth Bridge] User is logged in, attempting to get hiring user token');
            token = await this.getHiringUserToken();
            console.log('[Hiring Auth Bridge] Hiring user token result:', token ? 'RECEIVED' : 'FAILED/NULL');
          }

          if (!token) {
            // Fall back to guest token for unauthenticated users or if user token fails
            console.log('[Hiring Auth Bridge] Falling back to guest token (user token not available)');
            token = await this.getGuestToken();
          }

          console.log('[Hiring Auth Bridge] Token result:', token ? 'TOKEN RECEIVED' : 'NULL');

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`[Hiring Auth Bridge] ✓ ${config.method?.toUpperCase()} ${config.url} (Authorization header set)`);
          } else {
            console.error('[Hiring Auth Bridge] ✗ Failed to get token, request will fail');
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handles 401 errors and token refresh
    this.responseInterceptorId = axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized from hiring API
        if (
          originalRequest?.url?.startsWith('/hiring-api') &&
          error.response?.status === 401 &&
          !originalRequest._retry
        ) {
          console.log('[Hiring Auth Bridge] 401 error received from:', originalRequest.url);
          console.log('[Hiring Auth Bridge] Response data:', error.response?.data);
          console.log('[Hiring Auth Bridge] Attempting token refresh...');

          if (this.isRefreshing) {
            // If already refreshing, wait for the new token
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(axios(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Clear cached hiring user token to force refresh
            this.hiringUserToken = null;
            this.hiringUserTokenExpiry = 0;

            // Check if user is logged in
            const isLoggedIn = !!(localStorage.getItem(PORTAL_ACCESS_TOKEN_KEY) && localStorage.getItem(PORTAL_REFRESH_TOKEN_KEY));
            let newToken: string | null = null;

            if (isLoggedIn) {
              // Try to get fresh hiring user token
              console.log('[Hiring Auth Bridge] Getting fresh hiring user token');
              newToken = await this.getHiringUserToken();
            }

            if (!newToken) {
              // Fall back to guest token
              console.log('[Hiring Auth Bridge] Falling back to guest token');
              this.guestToken = null; // Clear cached guest token
              this.guestTokenExpiry = 0;
              newToken = await this.getGuestToken();
            }

            if (newToken) {
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${newToken}`;

              // Notify all waiting requests
              this.refreshSubscribers.forEach((callback) => callback(newToken));
              this.refreshSubscribers = [];

              this.isRefreshing = false;
              return axios(originalRequest);
            } else {
              // Refresh failed - DO NOT redirect to login for hiring API errors
              // The hiring API is separate from portal authentication
              console.error('[Hiring Auth Bridge] Token refresh failed, request will fail');
              this.isRefreshing = false;
              return Promise.reject(error);
            }
          } catch (refreshError) {
            console.error('[Hiring Auth Bridge] Token refresh error:', refreshError);
            this.isRefreshing = false;
            // Don't redirect to login for hiring API auth failures
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );

    console.log('[Hiring Auth Bridge] Interceptors initialized');
  }

  /**
   * Get guest token from TMFNUI auth service
   * Used for unauthenticated endpoints (e.g., candidate-facing interview booking)
   */
  async getGuestToken(): Promise<string | null> {
    // Check if we have a valid cached guest token
    if (this.guestToken && Date.now() < this.guestTokenExpiry) {
      console.log('[Hiring Auth Bridge] Using cached guest token');
      return this.guestToken;
    }

    console.log('[Hiring Auth Bridge] Fetching new guest token from:', `${HIRING_AUTH_API}/auth`);

    try {
      const response = await axios.post(`${HIRING_AUTH_API}/auth`, {}, {
        timeout: 5000, // 5 second timeout for auth requests
      });

      console.log('[Hiring Auth Bridge] Guest token response received:', response.data);

      // Check if response is successful (status 200, userMessage 'success', and has token)
      if (response.data.token && (response.data.status === 200 || response.data.userMessage === 'success')) {
        this.guestToken = response.data.token;

        // Guest tokens expire after 10 minutes (600 seconds)
        // Set expiry to 9 minutes to be safe
        this.guestTokenExpiry = Date.now() + (9 * 60 * 1000);

        console.log('[Hiring Auth Bridge] ✓ Guest token obtained successfully');
        return this.guestToken;
      }

      console.error('[Hiring Auth Bridge] Invalid guest token response format:', response.data);
      throw new Error('Failed to get guest token - invalid response');
    } catch (error: any) {
      console.error('[Hiring Auth Bridge] Failed to get guest token:', error.message);
      console.error('[Hiring Auth Bridge] Guest token error code:', error.code);
      return null;
    }
  }

  /**
   * Get hiring API user token by signing in with credentials
   * Used for authenticated endpoints
   *
   * DEV ONLY: Uses hardcoded credentials for testing
   * TODO: Replace with proper portal credential integration
   */
  async getHiringUserToken(): Promise<string | null> {
    // Check if we have a valid cached hiring user token
    if (this.hiringUserToken && Date.now() < this.hiringUserTokenExpiry) {
      console.log('[Hiring Auth Bridge] Using cached hiring user token');
      return this.hiringUserToken;
    }

    console.log('[Hiring Auth Bridge] Signing in to hiring API with dev credentials');

    try {
      // Step 1: Get guest token (required to authenticate the signin request)
      const guestToken = await this.getGuestToken();

      if (!guestToken) {
        console.error('[Hiring Auth Bridge] Failed to get guest token for signin');
        return null;
      }

      // Step 2: Sign in with credentials to get user access token
      // DEV ONLY: Using hardcoded credentials for testing
      const response = await axios.post(
        `${HIRING_AUTH_API}/signin`,
        {
          email: 'globaladmin@teamified.com',
          password: 'Team@123456',
        },
        {
          headers: {
            Authorization: `Bearer ${guestToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('[Hiring Auth Bridge] Signin response:', response.data);
      console.log('[Hiring Auth Bridge] Signin response.data.data:', response.data.data);

      // Check response format and extract token
      // The token is nested inside response.data.data.accessTokens
      const data = response.data.data || {};
      const accessTokens = data.accessTokens || {};

      console.log('[Hiring Auth Bridge] accessTokens object:', accessTokens);

      const token = accessTokens.token || accessTokens.accessToken ||
                    accessTokens.Token || accessTokens.AccessToken ||
                    data.token || data.accessToken;

      console.log('[Hiring Auth Bridge] Extracted token:', token ? 'TOKEN FOUND' : 'NO TOKEN');

      if (token && response.data.successful) {
        this.hiringUserToken = token;

        // Tokens typically expire after 10 minutes
        // Set expiry to 9 minutes to be safe
        this.hiringUserTokenExpiry = Date.now() + (9 * 60 * 1000);

        console.log('[Hiring Auth Bridge] ✓ Hiring user token obtained successfully via signin');
        return this.hiringUserToken;
      }

      console.error('[Hiring Auth Bridge] Invalid signin response format or missing token');
      console.error('[Hiring Auth Bridge] Response data:', JSON.stringify(response.data));
      return null;
    } catch (error: any) {
      console.error('[Hiring Auth Bridge] Failed to sign in to hiring API:', error.message);
      console.error('[Hiring Auth Bridge] Error response:', error.response?.data);
      return null;
    }
  }

  /**
   * Refresh portal auth token using refresh token
   * This uses the portal's refresh token mechanism
   */
  private async refreshPortalToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem(PORTAL_REFRESH_TOKEN_KEY);
      const currentToken = localStorage.getItem(PORTAL_ACCESS_TOKEN_KEY);

      if (!refreshToken) {
        console.error('[Hiring Auth Bridge] No refresh token available');
        return null;
      }

      // Get guest token first (required by TMFNUI auth API)
      const guestToken = await this.getGuestToken();

      if (!guestToken) {
        console.error('[Hiring Auth Bridge] Failed to get guest token for refresh');
        return null;
      }

      // Use guest token to refresh user token via TMFNUI auth API
      const response = await axios.post(
        `${HIRING_AUTH_API}/refreshtoken`,
        {
          token: currentToken,
          refreshToken: refreshToken,
        },
        {
          headers: {
            Authorization: `Bearer ${guestToken}`,
          },
        }
      );

      if (response.data.success && response.data.token) {
        console.log('[Hiring Auth Bridge] Token refreshed successfully');

        // Also update refresh token if provided
        if (response.data.refreshToken) {
          localStorage.setItem(PORTAL_REFRESH_TOKEN_KEY, response.data.refreshToken);
        }

        return response.data.token;
      }

      throw new Error('Token refresh failed - invalid response');
    } catch (error) {
      console.error('[Hiring Auth Bridge] Token refresh error:', error);
      return null;
    }
  }

  /**
   * Clear cached tokens (call on logout)
   */
  clearTokens() {
    this.guestToken = null;
    this.guestTokenExpiry = 0;
    this.hiringUserToken = null;
    this.hiringUserTokenExpiry = 0;
    console.log('[Hiring Auth Bridge] Tokens cleared');
  }

  /**
   * Check if user is authenticated for hiring features
   */
  isAuthenticated(): boolean {
    return !!(localStorage.getItem(PORTAL_ACCESS_TOKEN_KEY) && localStorage.getItem(PORTAL_REFRESH_TOKEN_KEY));
  }
}

// Export singleton instance
export default new HiringAuthBridge();
