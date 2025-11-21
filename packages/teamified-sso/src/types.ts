export interface TeamifiedAuthConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  portalApiUrl: string;
  tokenStorage?: TokenStorageStrategy;
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

export interface TeamifiedAuthClient {
  signInWithGoogle(): Promise<void>;
  handleCallback(): Promise<PortalTokenResponse>;
  isAuthenticated(): Promise<boolean>;
  getCurrentUser(): Promise<any>;
  signOut(): Promise<void>;
  getSession(): Promise<any>;
}
