import { createTeamifiedAuth, SessionStorageStrategy } from '@teamified/sso';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const portalApiUrl = import.meta.env.VITE_PORTAL_API_URL || 'http://localhost:3000/api';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase environment variables not configured');
  console.warn('   Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

export const auth = supabaseUrl && supabaseAnonKey
  ? createTeamifiedAuth({
      supabaseUrl,
      supabaseAnonKey,
      portalApiUrl,
      tokenStorage: new SessionStorageStrategy(), // Production-recommended
    })
  : null;

export const isAuthConfigured = !!auth;
