const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface GoogleOAuthStatusResponse {
  configured: boolean;
}

export interface GoogleAuthCallbackResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    emailVerified: boolean;
    roles: string[];
    themePreference: string;
    mustChangePassword: boolean;
  };
  returnUrl?: string;
}

export const googleAuthService = {
  async getStatus(): Promise<GoogleOAuthStatusResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/google/status`);
      if (!response.ok) {
        return { configured: false };
      }
      return response.json();
    } catch (error) {
      console.error('[GoogleAuth] Failed to get status:', error);
      return { configured: false };
    }
  },

  initiateLogin(returnUrl?: string): void {
    const params = new URLSearchParams();
    if (returnUrl) {
      params.set('returnUrl', returnUrl);
    }
    
    const url = `${API_BASE_URL}/v1/auth/google${params.toString() ? '?' + params.toString() : ''}`;
    window.location.href = url;
  },

  async exchangeCode(code: string): Promise<GoogleAuthCallbackResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/auth/google/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Authentication failed' }));
      throw new Error(errorData.message || 'Failed to exchange authentication code');
    }

    return response.json();
  },

  getCallbackParams(): { code: string | null; returnUrl: string | null; error: string | null } {
    const params = new URLSearchParams(window.location.search);
    return {
      code: params.get('code'),
      returnUrl: params.get('returnUrl'),
      error: params.get('error'),
    };
  },

  storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('teamified_access_token', accessToken);
    localStorage.setItem('teamified_refresh_token', refreshToken);
    console.log('[GoogleAuth] Tokens stored successfully');
  },
};
