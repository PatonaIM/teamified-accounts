import api from './authService';

const API_BASE_URL = '/v1/organizations';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  companySize?: string;
  website?: string;
  logoUrl?: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  settings: any;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  userEmail: string;
  userName: string;
  profilePicture?: string | null;
  roleType: string;
  status: string;
  joinedAt: string;
  invitedBy?: string;
  createdAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  slug: string;
  industry?: string;
  companySize?: string;
  website?: string;
  subscriptionTier?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  slug?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  logoUrl?: string;
  settings?: any;
}

export interface OrganizationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  companySize?: string;
  status?: string;
  subscriptionTier?: string;
}

export interface PaginatedOrganizationResponse {
  organizations: Organization[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateSubscriptionDto {
  subscriptionTier?: string;
  subscriptionStatus?: string;
}

export interface OrganizationMetrics {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  lastActivity?: string;
}

export interface AddMemberDto {
  userId: string;
  roleType: string;
  status?: string;
}

export interface UpdateMemberRoleDto {
  roleType: string;
}

export interface UserSearchResult {
  id: string;
  email: string;
  name: string;
  roleType: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  } | null;
  profilePicture: string | null;
}

export interface GlobalSearchResponse {
  organizations: Organization[];
  users: UserSearchResult[];
  totalOrganizations: number;
  totalUsers: number;
}

class OrganizationsService {
  // Organization CRUD
  async getAll(params?: OrganizationQueryParams): Promise<PaginatedOrganizationResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.industry) queryParams.append('industry', params.industry);
    if (params?.companySize) queryParams.append('companySize', params.companySize);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.subscriptionTier) queryParams.append('subscriptionTier', params.subscriptionTier);

    const url = queryParams.toString() ? `${API_BASE_URL}?${queryParams}` : API_BASE_URL;
    const response = await api.get(url);
    
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response.data)) {
      return {
        organizations: response.data,
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || response.data.length,
          total: response.data.length,
          totalPages: 1,
        }
      };
    }
    
    // Validate paginated response structure
    if (!response.data.organizations || !response.data.pagination) {
      throw new Error('Invalid response format from server');
    }
    
    return response.data;
  }

  async getById(id: string): Promise<Organization> {
    const response = await api.get(`${API_BASE_URL}/${id}`);
    return response.data;
  }

  async getMyOrganization(): Promise<Organization> {
    const response = await api.get(`${API_BASE_URL}/me`);
    return response.data;
  }

  async create(data: CreateOrganizationDto): Promise<Organization> {
    const response = await api.post(API_BASE_URL, data);
    return response.data;
  }

  async update(id: string, data: UpdateOrganizationDto): Promise<Organization> {
    const response = await api.put(`${API_BASE_URL}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${API_BASE_URL}/${id}`);
  }

  // Logo upload - Direct upload to Azure Blob Storage
  async uploadLogo(organizationId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`${API_BASE_URL}/${organizationId}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.logoUrl;
  }

  // Member management
  async getMembers(organizationId: string): Promise<OrganizationMember[]> {
    const response = await api.get(`${API_BASE_URL}/${organizationId}/members`);
    return response.data;
  }

  async addMember(organizationId: string, data: AddMemberDto): Promise<OrganizationMember> {
    const response = await api.post(`${API_BASE_URL}/${organizationId}/members`, data);
    return response.data;
  }

  async updateMemberRole(
    organizationId: string,
    userId: string,
    data: UpdateMemberRoleDto
  ): Promise<OrganizationMember> {
    const response = await api.put(
      `${API_BASE_URL}/${organizationId}/members/${userId}/role`,
      data
    );
    return response.data;
  }

  async removeMember(organizationId: string, userId: string): Promise<void> {
    await api.delete(`${API_BASE_URL}/${organizationId}/members/${userId}`);
  }

  // Candidate conversion
  async convertCandidate(organizationId: string, userId: string): Promise<void> {
    await api.post(`${API_BASE_URL}/${organizationId}/convert-candidate`, { userId });
  }

  async convertCandidateToEmployee(
    organizationId: string,
    data: {
      candidateEmail: string;
      hiredBy: string;
      jobTitle?: string;
      startDate?: string;
    }
  ): Promise<{
    success: boolean;
    user: { id: string; email: string; firstName: string; lastName: string };
    organizationMembership: { organizationId: string; role: string; status: string };
    message?: string;
  }> {
    const response = await api.post(`${API_BASE_URL}/${organizationId}/convert-candidate`, data);
    return response.data;
  }

  // Subscription management
  async updateSubscription(organizationId: string, data: UpdateSubscriptionDto): Promise<Organization> {
    const response = await api.patch(`${API_BASE_URL}/${organizationId}/subscription`, data);
    return response.data;
  }

  // Metrics
  async getMetrics(organizationId: string): Promise<OrganizationMetrics> {
    const response = await api.get(`${API_BASE_URL}/${organizationId}/metrics`);
    return response.data;
  }

  // Global search
  async globalSearch(query: string): Promise<GlobalSearchResponse> {
    if (!query || query.trim().length === 0) {
      return {
        organizations: [],
        users: [],
        totalOrganizations: 0,
        totalUsers: 0,
      };
    }
    const response = await api.get(`${API_BASE_URL}/search/global?q=${encodeURIComponent(query)}`);
    return response.data;
  }
}

export default new OrganizationsService();
