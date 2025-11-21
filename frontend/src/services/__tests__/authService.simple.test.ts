import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  removeTokens,
} from '../authService';

describe('Authentication Service - Core Functions', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
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

    it('should handle null tokens gracefully', () => {
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });
  });
});
