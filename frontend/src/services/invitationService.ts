import axios from 'axios';

// Types
export interface CreateInvitationRequest {
  firstName: string;
  lastName: string;
  email: string;
  country: 'IN' | 'LK' | 'PH';
  role: 'EOR' | 'Admin';
  clientId: string;
}

export interface Invitation {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: 'IN' | 'LK' | 'PH';
  role: 'EOR' | 'Admin';
  clientId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  createdBy: string;
  status: 'pending' | 'accepted' | 'expired';
}

export interface InvitationListResponse {
  invitations: Invitation[];
  total: number;
  page: number;
  limit: number;
}

export interface Client {
  id: string;
  name: string;
  code: string;
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://teamified-team-member-portal-backend.vercel.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('teamified_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Invitation API methods
export const invitationService = {
  // Create new invitation
  async createInvitation(data: CreateInvitationRequest): Promise<Invitation> {
    const response = await api.post('/api/v1/invitations', data);
    return response.data;
  },

  // Get all invitations
  async getInvitations(page = 1, limit = 10): Promise<InvitationListResponse> {
    const response = await api.get(`/api/v1/invitations?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Resend invitation
  async resendInvitation(id: string): Promise<void> {
    await api.post(`/api/v1/invitations/${id}/resend`);
  },

  // Delete invitation
  async deleteInvitation(id: string): Promise<void> {
    await api.delete(`/api/v1/invitations/${id}`);
  },

  // Get clients for dropdown
  async getClients(): Promise<Client[]> {
    const response = await api.get('/api/v1/clients');
    return response.data;
  },
};

export default invitationService;

