import { createSupabaseClient } from './supabaseClient';
import { LocalStorageStrategy } from './tokenStorage';
import type {
  TeamifiedAuthConfig,
  TeamifiedAuthClient,
  PortalTokenResponse,
} from './types';
import axios from 'axios';

export function createTeamifiedAuth(
  config: TeamifiedAuthConfig
): TeamifiedAuthClient {
  const supabase = createSupabaseClient(config.supabaseUrl, config.supabaseAnonKey);
  const tokenStorage = config.tokenStorage || new LocalStorageStrategy();

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
  };
}
