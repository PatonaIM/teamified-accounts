import api from './api';

export interface UserEmail {
  id: string;
  email: string;
  emailType: 'personal' | 'work';
  organizationId: string | null;
  isPrimary: boolean;
  isVerified: boolean;
  verifiedAt: string | null;
  addedAt: string;
  organization?: {
    id: string;
    name: string;
  };
}

export interface AddEmailDto {
  email: string;
  emailType?: 'personal' | 'work';
  organizationId?: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export const userEmailsService = {
  async getMyEmails(): Promise<UserEmail[]> {
    const response = await api.get('/user-emails');
    return response.data;
  },

  async addEmail(dto: AddEmailDto): Promise<UserEmail> {
    const response = await api.post('/user-emails', dto);
    return response.data;
  },

  async removeEmail(emailId: string): Promise<void> {
    await api.delete(`/user-emails/${emailId}`);
  },

  async verifyEmail(dto: VerifyEmailDto): Promise<UserEmail> {
    const response = await api.post('/user-emails/verify', dto);
    return response.data;
  },

  async setPrimaryEmail(emailId: string): Promise<UserEmail> {
    const response = await api.put(`/user-emails/${emailId}/set-primary`);
    return response.data;
  },

  async resendVerification(emailId: string): Promise<{ message: string }> {
    const response = await api.post(`/user-emails/${emailId}/resend-verification`);
    return response.data;
  },

  async changePassword(dto: ChangePasswordDto): Promise<{ message: string }> {
    const response = await api.post('/v1/auth/change-password', dto);
    return response.data;
  },
};

export default userEmailsService;
