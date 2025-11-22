import axios from 'axios';

// Types for role management
export interface UserRole {
  id: string;
  userId: string;
  role: 'admin' | 'hr' | 'client' | 'eor' | 'candidate';
  scope: 'user' | 'group' | 'client' | 'all';
  scopeId?: string;
  grantedBy?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRoleResponse {
  roles: UserRole[];
}

export interface Permission {
  permission: string;
  scope: string;
  scopeId?: string;
  granted: boolean;
  grantedBy: string;
  expiresAt?: string;
}

export interface PermissionResponse {
  permissions: Permission[];
}

export interface AssignRoleRequest {
  userId: string;
  role: 'admin' | 'hr' | 'client' | 'eor' | 'candidate';
  scope: 'user' | 'group' | 'client' | 'all';
  scopeId?: string;
  expiresAt?: string;
}

export interface UpdateRoleRequest {
  role?: 'admin' | 'hr' | 'client' | 'eor' | 'candidate';
  scope?: 'user' | 'group' | 'client' | 'all';
  scopeId?: string;
  expiresAt?: string;
}

class RoleService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('teamified_access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Get all roles for a user
  async getUserRoles(userId: string): Promise<UserRoleResponse> {
    const response = await axios.get(`${this.baseURL}/v1/roles/user/${userId}`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Get user permissions
  async getUserPermissions(userId: string): Promise<PermissionResponse> {
    const response = await axios.get(`${this.baseURL}/v1/roles/permissions/${userId}`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Assign a role to a user
  async assignRole(request: AssignRoleRequest): Promise<UserRole> {
    const response = await axios.post(`${this.baseURL}/v1/roles/assign`, request, {
      headers: this.getAuthHeaders(),
    });
    return response.data.role;
  }

  // Update a role
  async updateRole(roleId: string, request: UpdateRoleRequest): Promise<UserRole> {
    const response = await axios.put(`${this.baseURL}/v1/roles/${roleId}`, request, {
      headers: this.getAuthHeaders(),
    });
    return response.data.role;
  }

  // Remove a role
  async removeRole(roleId: string): Promise<void> {
    await axios.delete(`${this.baseURL}/v1/roles/${roleId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Utility methods
  getRoleDisplayName(role: string): string {
    const roleNames: Record<string, string> = {
      admin: 'Administrator',
      hr: 'Human Resources',
      client: 'Client',
      eor: 'Employee of Record',
      candidate: 'Candidate',
    };
    return roleNames[role] || role;
  }

  getScopeDisplayName(scope: string): string {
    const scopeNames: Record<string, string> = {
      user: 'User',
      group: 'Group',
      client: 'Client',
      all: 'All',
    };
    return scopeNames[scope] || scope;
  }

  getRoleColor(role: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
    const roleColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      admin: 'error',
      hr: 'primary',
      client: 'info',
      eor: 'success',
      candidate: 'default',
    };
    return roleColors[role] || 'default';
  }

  getScopeColor(scope: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
    const scopeColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      user: 'default',
      group: 'primary',
      client: 'info',
      all: 'success',
    };
    return scopeColors[scope] || 'default';
  }
}

export default new RoleService();
