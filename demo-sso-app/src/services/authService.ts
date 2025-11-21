import { supabase, isSupabaseConfigured } from '../config/supabase';
import axios from 'axios';

const PORTAL_API_URL = import.meta.env.VITE_PORTAL_API_URL || 'http://localhost:3000/api';

interface PortalTokenResponse {
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

export const authService = {
  /**
   * Sign in with Google OAuth via Supabase
   */
  async signInWithGoogle() {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured');
    }

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

  /**
   * Handle OAuth callback - exchange Supabase token for Portal JWT
   */
  async handleCallback(): Promise<PortalTokenResponse> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured');
    }

    // Get Supabase session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      throw new Error('No authentication session found');
    }

    console.log('[Auth] Exchanging Supabase token for Portal JWT...');

    // Exchange Supabase token for Portal JWT with roles
    const response = await axios.post<PortalTokenResponse>(
      `${PORTAL_API_URL}/v1/auth/supabase/exchange`,
      { supabaseAccessToken: session.access_token }
    );

    // Store Portal tokens (with correct keys matching Portal)
    localStorage.setItem('teamified_access_token', response.data.accessToken);
    localStorage.setItem('teamified_refresh_token', response.data.refreshToken);

    console.log('[Auth] Portal JWT received with roles:', response.data.user.roles);

    return response.data;
  },

  /**
   * Check if user is authenticated with Supabase
   */
  async isAuthenticated(): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      return false;
    }

    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  /**
   * Get current user from Portal API (with roles)
   */
  async getCurrentUser() {
    const token = localStorage.getItem('teamified_access_token');
    
    if (!token) {
      return null;
    }

    try {
      const response = await axios.get(`${PORTAL_API_URL}/v1/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('[Auth] Failed to get current user:', error);
      return null;
    }
  },

  /**
   * Sign out from all apps (clears Supabase session + Portal tokens)
   */
  async signOut() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    
    localStorage.removeItem('teamified_access_token');
    localStorage.removeItem('teamified_refresh_token');
  },

  /**
   * Get current Supabase session
   */
  async getSession() {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },
};
