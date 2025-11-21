import { TokenStorageStrategy } from './types';

/**
 * LocalStorage strategy (simple but vulnerable to XSS)
 * Use only for development or non-sensitive apps
 */
export class LocalStorageStrategy implements TokenStorageStrategy {
  private readonly accessTokenKey = 'teamified_access_token';
  private readonly refreshTokenKey = 'teamified_refresh_token';

  setAccessToken(token: string): void {
    localStorage.setItem(this.accessTokenKey, token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }
}

/**
 * Memory-only strategy (more secure, requires re-auth on page refresh)
 * Recommended for high-security apps
 */
export class MemoryStorageStrategy implements TokenStorageStrategy {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setRefreshToken(token: string): void {
    this.refreshToken = token;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }
}

/**
 * SessionStorage strategy (cleared on tab close, more secure than localStorage)
 * Good balance between security and UX
 */
export class SessionStorageStrategy implements TokenStorageStrategy {
  private readonly accessTokenKey = 'teamified_access_token';
  private readonly refreshTokenKey = 'teamified_refresh_token';

  setAccessToken(token: string): void {
    sessionStorage.setItem(this.accessTokenKey, token);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.accessTokenKey);
  }

  setRefreshToken(token: string): void {
    sessionStorage.setItem(this.refreshTokenKey, token);
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem(this.refreshTokenKey);
  }

  clearTokens(): void {
    sessionStorage.removeItem(this.accessTokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
  }
}
