import { supabase } from '../config/supabase';
import type { AuthError, Session } from '@supabase/supabase-js';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface TokenExchangeResponse {
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
      scopeId: string | null;
    }>;
  };
}

export const supabaseAuthService = {
  async signInWithGoogle(): Promise<{ error: AuthError | null }> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('[SupabaseAuth] Google sign-in error:', error);
      return { error };
    }

    return { error: null };
  },

  async exchangeSupabaseToken(supabaseToken: string): Promise<TokenExchangeResponse> {
    try {
      console.log('[SupabaseAuth] Exchanging Supabase token for Portal JWT...');
      
      const response = await axios.post<TokenExchangeResponse>(
        `${API_BASE_URL}/v1/auth/supabase/exchange`,
        { supabaseAccessToken: supabaseToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { accessToken, refreshToken, user } = response.data;

      // IMPORTANT: Use the same keys as authService.ts
      localStorage.setItem('teamified_access_token', accessToken);
      localStorage.setItem('teamified_refresh_token', refreshToken);

      console.log('[SupabaseAuth] Token exchange successful, tokens stored');
      return response.data;
    } catch (error) {
      console.error('[SupabaseAuth] Token exchange failed:', error);
      
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Failed to exchange authentication token. Please try again.');
    }
  },

  async handleCallback(): Promise<TokenExchangeResponse | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('[SupabaseAuth] Session error:', error);
        throw error;
      }

      if (!session) {
        console.warn('[SupabaseAuth] No session found in callback');
        return null;
      }

      const supabaseToken = session.access_token;
      return await this.exchangeSupabaseToken(supabaseToken);
    } catch (error) {
      console.error('[SupabaseAuth] Callback handling failed:', error);
      throw error;
    }
  },

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('teamified_access_token');
      localStorage.removeItem('teamified_refresh_token');
      console.log('[SupabaseAuth] Sign out successful');
    } catch (error) {
      console.error('[SupabaseAuth] Sign out error:', error);
      throw error;
    }
  },

  async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('[SupabaseAuth] Auth state changed:', event);
      callback(session);
    });
  },
};
