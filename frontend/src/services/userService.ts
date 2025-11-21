import axios from 'axios';

// Types for user management
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: any;
  profileData?: any;
  clientId?: string;
  status: 'active' | 'inactive' | 'archived';
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  eorProfile?: {
    employeeId: string | null;
    jobTitle?: string | null;
    department?: string | null;
  };
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: any;
  profileData?: any;
  clientId?: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: any;
  profileData?: any;
  clientId?: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  sort?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserListResponse {
  users: User[];
  pagination: PaginationInfo;
}

export interface BulkStatusUpdateRequest {
  userIds: string[];
  status: 'active' | 'inactive' | 'archived';
}

export interface BulkRoleAssignmentRequest {
  userIds: string[];
  role: string;
  scope: string;
  scopeId?: string;
}

export interface BulkOperationResult {
  userId: string;
  success: boolean;
  error?: string;
}

export interface BulkOperationResponse {
  processed: number;
  failed: number;
  results: BulkOperationResult[];
}

class UserService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://teamified-team-member-portal-backend.vercel.app/api';
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('teamified_access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // User CRUD operations
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await axios.post(`${this.baseURL}/v1/users`, userData, {
      headers: this.getAuthHeaders(),
    });
    return response.data.user;
  }

  async getUsers(params: UserQueryParams = {}): Promise<UserListResponse> {
    const response = await axios.get(`${this.baseURL}/v1/users`, {
      headers: this.getAuthHeaders(),
      params,
    });
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await axios.get(`${this.baseURL}/v1/users/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return response.data.user;
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await axios.put(`${this.baseURL}/v1/users/${id}`, userData, {
      headers: this.getAuthHeaders(),
    });
    return response.data.user;
  }

  async updateUserPartial(id: string, userData: Partial<UpdateUserRequest>): Promise<User> {
    const response = await axios.patch(`${this.baseURL}/v1/users/${id}`, userData, {
      headers: this.getAuthHeaders(),
    });
    return response.data.user;
  }

  async deleteUser(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/v1/users/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // User status management
  async updateUserStatus(id: string, status: 'active' | 'inactive' | 'archived'): Promise<User> {
    const response = await axios.patch(`${this.baseURL}/v1/users/${id}/status`, { status }, {
      headers: this.getAuthHeaders(),
    });
    return response.data.user;
  }

  // Bulk operations
  async bulkUpdateStatus(request: BulkStatusUpdateRequest): Promise<BulkOperationResponse> {
    const response = await axios.post(`${this.baseURL}/v1/users/bulk/status`, request, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async bulkAssignRole(request: BulkRoleAssignmentRequest): Promise<BulkOperationResponse> {
    const response = await axios.post(`${this.baseURL}/v1/users/bulk/assign-role`, request, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Utility methods
  async searchUsers(query: string, params: Omit<UserQueryParams, 'search'> = {}): Promise<UserListResponse> {
    return this.getUsers({ ...params, search: query });
  }

  async getActiveUsers(params: Omit<UserQueryParams, 'status'> = {}): Promise<UserListResponse> {
    return this.getUsers({ ...params, status: 'active' });
  }

  async getInactiveUsers(params: Omit<UserQueryParams, 'status'> = {}): Promise<UserListResponse> {
    return this.getUsers({ ...params, status: 'inactive' });
  }

  async getArchivedUsers(params: Omit<UserQueryParams, 'status'> = {}): Promise<UserListResponse> {
    return this.getUsers({ ...params, status: 'archived' });
  }

  async markEmailVerified(userId: string): Promise<User> {
    const response = await axios.patch(
      `${this.baseURL}/v1/users/${userId}/verify-email`,
      {},
      { headers: this.getAuthHeaders() }
    );
    return response.data.user;
  }
}

export default new UserService();
