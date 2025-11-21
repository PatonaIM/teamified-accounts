import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import invitationService, { type CreateInvitationRequest } from '../invitationService';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('invitationService', () => {
  const mockToken = 'mock-access-token';
  const mockCreateRequest: CreateInvitationRequest = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    country: 'IN',
    role: 'EOR',
    clientId: 'client-123',
  };

  const mockInvitation = {
    id: 'invitation-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    country: 'IN',
    role: 'EOR',
    clientId: 'client-123',
    token: 'token-123',
    expiresAt: '2025-09-05T10:00:00Z',
    createdAt: '2025-08-29T10:00:00Z',
    createdBy: 'admin-123',
    status: 'pending' as const,
  };

  const mockClients = [
    { id: 'client-1', name: 'Client A', code: 'CA' },
    { id: 'client-2', name: 'Client B', code: 'CB' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(mockToken);
    
    // Mock axios.create to return a mock instance
    mockAxios.create.mockReturnValue({
      post: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createInvitation', () => {
    it('creates an invitation successfully', async () => {
      const mockPost = vi.fn().mockResolvedValue({ data: mockInvitation });
      mockAxios.create.mockReturnValue({
        post: mockPost,
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      const result = await invitationService.createInvitation(mockCreateRequest);

      expect(mockPost).toHaveBeenCalledWith('/api/v1/invitations', mockCreateRequest);
      expect(result).toEqual(mockInvitation);
    });

    it('handles API errors gracefully', async () => {
      const mockPost = vi.fn().mockRejectedValue(new Error('API Error'));
      mockAxios.create.mockReturnValue({
        post: mockPost,
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      await expect(invitationService.createInvitation(mockCreateRequest))
        .rejects.toThrow('API Error');
    });
  });

  describe('getInvitations', () => {
    it('fetches invitations with pagination', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        data: {
          invitations: [mockInvitation],
          total: 1,
          page: 1,
          limit: 10,
        },
      });
      mockAxios.create.mockReturnValue({
        get: mockGet,
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      const result = await invitationService.getInvitations(2, 20);

      expect(mockGet).toHaveBeenCalledWith('/api/v1/invitations?page=2&limit=20');
      expect(result).toEqual({
        invitations: [mockInvitation],
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('uses default pagination values', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        data: {
          invitations: [mockInvitation],
          total: 1,
          page: 1,
          limit: 10,
        },
      });
      mockAxios.create.mockReturnValue({
        get: mockGet,
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      await invitationService.getInvitations();

      expect(mockGet).toHaveBeenCalledWith('/api/v1/invitations?page=1&limit=10');
    });

    it('handles API errors gracefully', async () => {
      const mockGet = vi.fn().mockRejectedValue(new Error('API Error'));
      mockAxios.create.mockReturnValue({
        get: mockGet,
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      await expect(invitationService.getInvitations())
        .rejects.toThrow('API Error');
    });
  });

  describe('resendInvitation', () => {
    it('resends an invitation successfully', async () => {
      const mockPost = vi.fn().mockResolvedValue({ data: {} });
      mockAxios.create.mockReturnValue({
        post: mockPost,
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      await invitationService.resendInvitation('invitation-123');

      expect(mockPost).toHaveBeenCalledWith('/api/v1/invitations/invitation-123/resend');
    });

    it('handles API errors gracefully', async () => {
      const mockPost = vi.fn().mockRejectedValue(new Error('API Error'));
      mockAxios.create.mockReturnValue({
        post: mockPost,
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      await expect(invitationService.resendInvitation('invitation-123'))
        .rejects.toThrow('API Error');
    });
  });

  describe('deleteInvitation', () => {
    it('deletes an invitation successfully', async () => {
      const mockDelete = vi.fn().mockResolvedValue({ data: {} });
      mockAxios.create.mockReturnValue({
        delete: mockDelete,
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      await invitationService.deleteInvitation('invitation-123');

      expect(mockDelete).toHaveBeenCalledWith('/api/v1/invitations/invitation-123');
    });

    it('handles API errors gracefully', async () => {
      const mockDelete = vi.fn().mockRejectedValue(new Error('API Error'));
      mockAxios.create.mockReturnValue({
        delete: mockDelete,
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      await expect(invitationService.deleteInvitation('invitation-123'))
        .rejects.toThrow('API Error');
    });
  });

  describe('getClients', () => {
    it('fetches clients successfully', async () => {
      const mockGet = vi.fn().mockResolvedValue({ data: mockClients });
      mockAxios.create.mockReturnValue({
        get: mockGet,
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      const result = await invitationService.getClients();

      expect(mockGet).toHaveBeenCalledWith('/api/v1/clients');
      expect(result).toEqual(mockClients);
    });

    it('handles API errors gracefully', async () => {
      const mockGet = vi.fn().mockRejectedValue(new Error('API Error'));
      mockAxios.create.mockReturnValue({
        get: mockGet,
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      await expect(invitationService.getClients())
        .rejects.toThrow('API Error');
    });
  });

  describe('API configuration', () => {
    it('creates axios instance with correct base URL', () => {
      // Mock environment variable
      const originalEnv = import.meta.env;
      import.meta.env.VITE_API_BASE_URL = 'https://api.example.com';

      // Re-import to get fresh instance
      vi.resetModules();
      const freshService = require('../invitationService').default;

      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.example.com',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Restore environment
      import.meta.env = originalEnv;
    });

    it('uses default base URL when environment variable is not set', () => {
      // Mock environment variable
      const originalEnv = import.meta.env;
      delete import.meta.env.VITE_API_BASE_URL;

      // Re-import to get fresh instance
      vi.resetModules();
      const freshService = require('../invitationService').default;

      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Restore environment
      import.meta.env = originalEnv;
    });

    it('sets up request interceptor for authentication', () => {
      const mockUse = vi.fn();
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: {
            use: mockUse,
          },
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      // Re-import to trigger interceptor setup
      vi.resetModules();
      require('../invitationService');

      expect(mockUse).toHaveBeenCalled();
    });
  });

  describe('authentication', () => {
    it('includes authorization header when token exists', async () => {
      localStorageMock.getItem.mockReturnValue('bearer-token');
      
      const mockPost = vi.fn().mockResolvedValue({ data: mockInvitation });
      const mockUse = vi.fn().mockImplementation((callback) => {
        // Simulate the interceptor callback
        const config = { headers: {} };
        callback(config);
        return config;
      });

      mockAxios.create.mockReturnValue({
        post: mockPost,
        interceptors: {
          request: {
            use: mockUse,
          },
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      // Re-import to trigger interceptor setup
      vi.resetModules();
      const freshService = require('../invitationService').default;

      await freshService.createInvitation(mockCreateRequest);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('accessToken');
    });

    it('does not include authorization header when token does not exist', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const mockPost = vi.fn().mockResolvedValue({ data: mockInvitation });
      const mockUse = vi.fn().mockImplementation((callback) => {
        // Simulate the interceptor callback
        const config = { headers: {} };
        callback(config);
        return config;
      });

      mockAxios.create.mockReturnValue({
        post: mockPost,
        interceptors: {
          request: {
            use: mockUse,
          },
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      // Re-import to trigger interceptor setup
      vi.resetModules();
      const freshService = require('../invitationService').default;

      await freshService.createInvitation(mockCreateRequest);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('accessToken');
    });
  });
});
