import axios from 'axios';
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
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('teamified_access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getClients(params?: ClientQueryParams): Promise<ClientListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `${this.baseURL}/v1/clients${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axios.get(url, {
      headers: this.getAuthHeaders(),
    });
    
    return response.data;
  }

  async getClientById(id: string): Promise<Client> {
    const response = await axios.get(`${this.baseURL}/v1/clients/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return response.data.client;
  }

  async createClient(dto: CreateClientDto): Promise<Client> {
    const response = await axios.post(`${this.baseURL}/v1/clients`, dto, {
      headers: this.getAuthHeaders(),
    });
    return response.data.client;
  }

  async updateClient(id: string, dto: UpdateClientDto): Promise<Client> {
    const response = await axios.patch(`${this.baseURL}/v1/clients/${id}`, dto, {
      headers: this.getAuthHeaders(),
    });
    return response.data.client;
  }

  async deleteClient(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/v1/clients/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}

export const clientService = new ClientService();
