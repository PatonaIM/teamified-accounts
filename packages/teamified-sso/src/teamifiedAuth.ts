import { createSupabaseClient } from './supabaseClient';
import { LocalStorageStrategy, CookieAwareStorageStrategy } from './tokenStorage';
import type {
  TeamifiedAuthConfig,
  TeamifiedAuthClient,
  PortalTokenResponse,
  SharedSessionInfo,
} from './types';
import axios from 'axios';

export function createTeamifiedAuth(
  config: TeamifiedAuthConfig
): TeamifiedAuthClient {
  const supabase = createSupabaseClient(config.supabaseUrl, config.supabaseAnonKey);
  
  // Token storage for local token management
  // Uses provided strategy, or CookieAwareStorageStrategy if enableCookieSSO, or defaults to LocalStorageStrategy
  const tokenStorage = config.tokenStorage || 
    (config.enableCookieSSO 
      ? new CookieAwareStorageStrategy(config.portalApiUrl) 
      : new LocalStorageStrategy());
  
  // Separate CookieAwareStorageStrategy instance for shared session checking
  // This is always created to provide checkSharedSession() capability
  // regardless of what token storage strategy is being used
  const sessionChecker = new CookieAwareStorageStrategy(config.portalApiUrl);

  return {
    async signInWithGoogle() {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }
    },

    async handleCallback(): Promise<PortalTokenResponse> {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        throw new Error('No authentication session found');
      }

      console.log('[TeamifiedSSO] Exchanging Supabase token for Portal JWT...');

      const response = await axios.post<PortalTokenResponse>(
        `${config.portalApiUrl}/v1/auth/supabase/exchange`,
        { supabaseAccessToken: session.access_token }
      );

      tokenStorage.setAccessToken(response.data.accessToken);
      tokenStorage.setRefreshToken(response.data.refreshToken);

      console.log('[TeamifiedSSO] Portal JWT received with roles:', response.data.user.roles);

      return response.data;
    },

    async isAuthenticated(): Promise<boolean> {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    },

    async getCurrentUser() {
      const token = tokenStorage.getAccessToken();

      if (!token) {
        return null;
      }

      try {
        const response = await axios.get(`${config.portalApiUrl}/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        return response.data;
      } catch (error) {
        console.error('[TeamifiedSSO] Failed to get current user:', error);
        return null;
      }
    },

    async signOut() {
      await supabase.auth.signOut();
      tokenStorage.clearTokens();
    },

    async getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },

    async checkSharedSession(): Promise<SharedSessionInfo | null> {
      // Always use the dedicated session checker (CookieAwareStorageStrategy)
      // This works regardless of what token storage strategy is configured
      return sessionChecker.checkSharedSession();
    },
  };
}
