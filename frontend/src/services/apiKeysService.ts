import api from './api';

export interface ApiKey {
  id: number;
  name: string;
  type: 'read_only' | 'full_access';
  keyPrefix: string;
  lastUsedAt: Date | null;
  createdAt: Date;
  isActive: boolean;
}

export interface CreateApiKeyDto {
  name: string;
  type: 'read_only' | 'full_access';
}

export interface CreateApiKeyResponse {
  key: string;
  apiKey: ApiKey;
}

export interface UpdateApiKeyDto {
  name?: string;
}

export const apiKeysService = {
  async create(dto: CreateApiKeyDto): Promise<CreateApiKeyResponse> {
    const response = await api.post('/v1/api-keys', dto);
    return response.data;
  },

  async findAll(): Promise<ApiKey[]> {
    const response = await api.get('/v1/api-keys');
    return response.data;
  },

  async findOne(id: number): Promise<ApiKey> {
    const response = await api.get(`/v1/api-keys/${id}`);
    return response.data;
  },

  async update(id: number, dto: UpdateApiKeyDto): Promise<ApiKey> {
    const response = await api.patch(`/v1/api-keys/${id}`, dto);
    return response.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/v1/api-keys/${id}`);
  },
};
