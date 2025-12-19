export interface TeamifiedAuthConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  portalApiUrl: string;
  /**
   * Custom token storage strategy. Defaults to LocalStorageStrategy.
   * If enableCookieSSO is true and no custom storage is provided,
   * CookieAwareStorageStrategy will be used instead.
   * 
   * Note: Custom storage strategies work alongside cookie SSO -
   * checkSharedSession() always uses the Accounts API to verify
   * shared sessions regardless of this setting.
   */
  tokenStorage?: TokenStorageStrategy;
  /**
   * Enable cookie-based cross-app SSO.
   * When true and no custom tokenStorage is provided, the SDK uses
   * CookieAwareStorageStrategy for token storage.
   * 
   * The checkSharedSession() method is always available regardless
   * of this setting - it calls the Accounts API to check for
   * shared httpOnly cookies set by the server.
   */
  enableCookieSSO?: boolean;
}

export interface TokenStorageStrategy {
  setAccessToken(token: string): void;
  getAccessToken(): string | null;
  setRefreshToken(token: string): void;
  getRefreshToken(): string | null;
  clearTokens(): void;
}

export interface PortalTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: Array<{
      roleType: string;
      scope: string;
    }>;
  };
}

export interface SharedSessionInfo {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
  expiresAt?: string;
}

export interface TeamifiedAuthClient {
  signInWithGoogle(): Promise<void>;
  handleCallback(): Promise<PortalTokenResponse>;
  isAuthenticated(): Promise<boolean>;
  getCurrentUser(): Promise<any>;
  signOut(): Promise<void>;
  getSession(): Promise<any>;
  /**
   * Check if user has a shared SSO session from another Teamified app
   * This enables true cross-app SSO where logging into one app
   * automatically logs you into all apps
   */
  checkSharedSession(): Promise<SharedSessionInfo | null>;
}
