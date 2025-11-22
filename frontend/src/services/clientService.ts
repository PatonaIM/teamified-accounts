import api from './api';
import type { Client, CreateClientDto, UpdateClientDto } from '../types/client';

export interface ClientQueryParams {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  page?: number;
  limit?: number;
}

export interface ClientStatistics {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  totalUsers: number;
}

export interface ClientListResponse {
  clients: Client[];
  statistics: ClientStatistics;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ClientService {
  async getClients(params?: ClientQueryParams): Promise<ClientListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/v1/clients${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    
    return response.data;
  }

  async getClientById(id: string): Promise<Client> {
    const response = await api.get(`/v1/clients/${id}`);
    return response.data.client;
  }

  async createClient(dto: CreateClientDto): Promise<Client> {
    const response = await api.post(`/v1/clients`, dto);
    return response.data.client;
  }

  async updateClient(id: string, dto: UpdateClientDto): Promise<Client> {
    const response = await api.patch(`/v1/clients/${id}`, dto);
    return response.data.client;
  }

  async deleteClient(id: string): Promise<void> {
    await api.delete(`/v1/clients/${id}`);
  }
}

export const clientService = new ClientService();
