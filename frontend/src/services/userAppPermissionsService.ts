import api from './api';

export interface UserAppAccess {
  oauthClientId: string;
  oauthClientName: string;
  appKey: string;
  canAccess: boolean;
  source: 'default' | 'override';
  scope?: string;
  description?: string;
  overridePermission?: 'allow' | 'deny';
  overrideReason?: string;
}

export const userAppPermissionsService = {
  async getUserAppAccess(userId: string): Promise<UserAppAccess[]> {
    const response = await api.get(`/v1/users/${userId}/app-permissions`);
    return response.data;
  },

  async getMyAppAccess(): Promise<UserAppAccess[]> {
    const response = await api.get('/v1/users/me/app-permissions');
    return response.data;
  },
};
