import api from './api';

export interface OAuthClient {
  id: string;
  client_id: string;
  client_secret: string;
  name: string;
  description: string;
  redirect_uris: string[];
  is_active: boolean;
  metadata: {
    app_url?: string;
    owner?: string;
    environment?: 'development' | 'staging' | 'production';
  };
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateOAuthClientDto {
  name: string;
  description?: string;
  redirect_uris: string[];
  app_url?: string;
  owner?: string;
  environment?: 'development' | 'staging' | 'production';
}

export interface UpdateOAuthClientDto {
  name?: string;
  description?: string;
  redirect_uris?: string[];
  app_url?: string;
  owner?: string;
  environment?: 'development' | 'staging' | 'production';
  is_active?: boolean;
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
