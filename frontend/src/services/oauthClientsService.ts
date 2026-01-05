import api from './api';

export type EnvironmentType = 'development' | 'staging' | 'production';

export interface RedirectUri {
  uri: string;
  environment: EnvironmentType;
}

export const AVAILABLE_SCOPES = [
  { value: 'read:users', label: 'Read Users', description: 'View user profiles and lists' },
  { value: 'write:users', label: 'Write Users', description: 'Create and update users' },
  { value: 'read:organizations', label: 'Read Organizations', description: 'View organization data and members' },
  { value: 'write:organizations', label: 'Write Organizations', description: 'Create and update organizations' },
  { value: 'read:invitations', label: 'Read Invitations', description: 'View invitation data' },
  { value: 'write:invitations', label: 'Write Invitations', description: 'Create and manage invitations' },
  { value: 'read:user-emails', label: 'Read User Emails', description: 'View user linked email addresses' },
  { value: 'write:user-emails', label: 'Write User Emails', description: 'Manage user linked email addresses' },
] as const;

export type ScopeValue = typeof AVAILABLE_SCOPES[number]['value'];

export interface OAuthClient {
  id: string;
  client_id: string;
  client_secret: string;
  name: string;
  description: string;
  redirect_uris: RedirectUri[];
  is_active: boolean;
  default_intent: 'client' | 'candidate' | 'both';
  allow_client_credentials: boolean;
  allowed_scopes: string[] | null;
  metadata: {
    app_url?: string;
    owner?: string;
    environment?: string;
  };
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateOAuthClientDto {
  name: string;
  description?: string;
  redirect_uris: RedirectUri[];
  default_intent?: 'client' | 'candidate' | 'both';
  app_url?: string;
  owner?: string;
  allow_client_credentials?: boolean;
  allowed_scopes?: string[];
}

export interface UpdateOAuthClientDto {
  name?: string;
  description?: string;
  redirect_uris?: RedirectUri[];
  default_intent?: 'client' | 'candidate' | 'both';
  app_url?: string;
  owner?: string;
  is_active?: boolean;
  allow_client_credentials?: boolean;
  allowed_scopes?: string[];
}

export const oauthClientsService = {
  async getAll(): Promise<OAuthClient[]> {
    const response = await api.get('/v1/oauth-clients');
    return response.data;
  },

  async getActive(): Promise<OAuthClient[]> {
    const response = await api.get('/v1/oauth-clients/active');
    return response.data;
  },

  async getOne(id: string): Promise<OAuthClient> {
    const response = await api.get(`/v1/oauth-clients/${id}`);
    return response.data;
  },

  async create(data: CreateOAuthClientDto): Promise<OAuthClient> {
    const response = await api.post('/v1/oauth-clients', data);
    return response.data;
  },

  async update(id: string, data: UpdateOAuthClientDto): Promise<OAuthClient> {
    const response = await api.patch(`/v1/oauth-clients/${id}`, data);
    return response.data;
  },

  async regenerateSecret(id: string): Promise<OAuthClient> {
    const response = await api.post(`/v1/oauth-clients/${id}/regenerate-secret`);
    return response.data;
  },

  async toggleActive(id: string): Promise<OAuthClient> {
    const response = await api.post(`/v1/oauth-clients/${id}/toggle`);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/v1/oauth-clients/${id}`);
  },
};
