export { createTeamifiedAuth } from './teamifiedAuth';
export { createSupabaseClient } from './supabaseClient';
export { 
  LocalStorageStrategy, 
  MemoryStorageStrategy, 
  SessionStorageStrategy,
  CookieAwareStorageStrategy,
} from './tokenStorage';
export type {
  TeamifiedAuthConfig,
  TeamifiedAuthClient,
  PortalTokenResponse,
  TokenStorageStrategy,
  SharedSessionInfo,
} from './types';
