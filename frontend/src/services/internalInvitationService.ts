import api from './api';

export interface InternalInvitation {
  id: string;
  inviteCode: string;
  invitedBy: string;
  roleType: string;
  status: string;
  expiresAt: string;
  maxUses: number | null;
  currentUses: number;
  createdAt: string;
  invitationUrl?: string;
}

export interface CreateInternalInvitationDto {
  email?: string;
  roleType: string;
  maxUses?: number;
  force?: boolean;
}

export interface InternalInvitationResponse {
  id: string;
  inviteCode: string;
  invitedBy: string;
  roleType: string;
  status: string;
  expiresAt: string;
  maxUses: number | null;
  currentUses: number;
  createdAt: string;
  invitationUrl: string;
}

class InternalInvitationService {
  async createInvitation(data: CreateInternalInvitationDto): Promise<InternalInvitationResponse> {
    const response = await api.post<InternalInvitationResponse>('/v1/invitations/internal', data);
    return response.data;
  }

  async generateShareableLink(): Promise<InternalInvitationResponse> {
    const response = await api.post<InternalInvitationResponse>('/v1/invitations/internal/generate-link');
    return response.data;
  }

  async getInternalInvitations(): Promise<InternalInvitation[]> {
    const response = await api.get<InternalInvitation[]>('/v1/invitations/internal');
    return response.data;
  }
}

export default new InternalInvitationService();
