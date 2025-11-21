// User Types

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  profileData?: {
    department?: string;
    title?: string;
    skills?: string[];
    experienceYears?: number;
    [key: string]: any;
  };
  status: 'active' | 'inactive' | 'archived';
  isActive: boolean;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpiry?: string;
  passwordResetToken?: string;
  migratedFromZoho: boolean;
  zohoUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: any;
  profileData?: any;
  status?: 'active' | 'inactive' | 'archived';
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: any;
  profileData?: any;
  status?: 'active' | 'inactive' | 'archived';
}

export interface UserResponse {
  user: User;
}

export interface PaginatedUserResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
