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
 * Cookie-aware storage strategy for cross-app SSO
 * 
 * This strategy works with httpOnly cookies set by the Teamified Accounts server.
 * Since httpOnly cookies cannot be read by JavaScript, this strategy:
 * - Uses localStorage for client-side token access (for API calls)
 * - Relies on the server to verify the shared cookie for session detection
 * - Falls back to localStorage if no shared session is detected
 * 
 * The shared cookie is set on .teamified.com domain, allowing all Teamified
 * apps to share the same authentication session.
 */
export class CookieAwareStorageStrategy implements TokenStorageStrategy {
  private readonly accessTokenKey = 'teamified_access_token';
  private readonly refreshTokenKey = 'teamified_refresh_token';
  private readonly portalApiUrl: string;

  constructor(portalApiUrl: string) {
    this.portalApiUrl = portalApiUrl;
  }

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

  /**
   * Check if a shared SSO session exists via the httpOnly cookie
   * This calls the Accounts server which can read the httpOnly cookie
   * 
   * Returns session info if valid, null otherwise
   */
  async checkSharedSession(): Promise<{
    authenticated: boolean;
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      roles: string[];
    };
    expiresAt?: string;
  } | null> {
    try {
      const response = await fetch(`${this.portalApiUrl}/v1/sso/session`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.warn('[TeamifiedSSO] Failed to check shared session:', error);
      return null;
    }
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
