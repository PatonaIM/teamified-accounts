import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import {
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
  isAuthenticated,
  getTokenExpirationTime,
  setupTokenRefresh,
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  removeTokens,
} from '../authService';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Authentication Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Clear localStorage mock
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Token Management', () => {
    it('should set and get access token', () => {
      const token = 'test-access-token';
      setAccessToken(token);
      expect(getAccessToken()).toBe(token);
    });

    it('should set and get refresh token', () => {
      const token = 'test-refresh-token';
      setRefreshToken(token);
      expect(getRefreshToken()).toBe(token);
    });

    it('should remove all tokens', () => {
      setAccessToken('test-access');
      setRefreshToken('test-refresh');
      removeTokens();
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe('Login', () => {
    it('should successfully login and store tokens', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        data: {
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-123',
          user: { id: '1', email: 'test@example.com', role: 'user' }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await login(credentials);

      expect(result).toEqual(mockResponse.data);
      expect(getAccessToken()).toBe('access-token-123');
      expect(getRefreshToken()).toBe('refresh-token-123');
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/auth/login', credentials);
    });

    it('should handle login failure', async () => {
      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      mockedAxios.post.mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(login(credentials)).rejects.toThrow('Login failed. Please check your credentials.');
    });
  });

  describe('Logout', () => {
    it('should call logout endpoint and remove local tokens', async () => {
      setAccessToken('test-access');
      setRefreshToken('test-refresh');
      
      mockedAxios.post.mockResolvedValueOnce({});

      await logout();

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/auth/logout');
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });

    it('should continue with local logout even if server call fails', async () => {
      setAccessToken('test-access');
      setRefreshToken('test-refresh');
      
      mockedAxios.post.mockRejectedValueOnce(new Error('Server error'));

      await logout();

      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe('Token Refresh', () => {
    it('should successfully refresh access token', async () => {
      const refreshToken = 'refresh-token-123';
      const mockResponse = {
        data: { accessToken: 'new-access-token-123' }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await refreshAccessToken(refreshToken);

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/auth/refresh', { refreshToken });
    });

    it('should handle refresh failure', async () => {
      const refreshToken = 'invalid-refresh-token';
      mockedAxios.post.mockRejectedValueOnce(new Error('Invalid refresh token'));

      await expect(refreshAccessToken(refreshToken)).rejects.toThrow('Token refresh failed');
    });
  });

  describe('Current User', () => {
    it('should successfully get current user', async () => {
      const mockUser = { id: '1', email: 'test@example.com', role: 'user' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

      const result = await getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/users/me');
    });

    it('should handle get current user failure', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(getCurrentUser()).rejects.toThrow('Failed to get current user');
    });
  });

  describe('Authentication Status', () => {
    it('should return true for valid token', () => {
      // Mock a valid JWT token (not expired)
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      setAccessToken(validToken);
      expect(isAuthenticated()).toBe(true);
    });

    it('should return false for expired token', () => {
      // Mock an expired JWT token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      setAccessToken(expiredToken);
      expect(isAuthenticated()).toBe(false);
    });

    it('should return false for no token', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('should return false for invalid token format', () => {
      setAccessToken('invalid-token-format');
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('Token Expiration', () => {
    it('should return expiration time for valid token', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      setAccessToken(validToken);
      const expirationTime = getTokenExpirationTime();
      
      expect(expirationTime).toBeGreaterThan(Date.now());
    });

    it('should return null for no token', () => {
      expect(getTokenExpirationTime()).toBeNull();
    });

    it('should return null for invalid token format', () => {
      setAccessToken('invalid-token');
      expect(getTokenExpirationTime()).toBeNull();
    });
  });

  describe('Auto Token Refresh', () => {
    it('should set up token refresh interval', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      
      setupTokenRefresh();
      
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60000);
    });
  });
});
