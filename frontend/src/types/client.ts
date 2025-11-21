// Client Types

export interface Client {
  id: string;
  name: string;
  description?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    [key: string]: any;
  };
  status: 'active' | 'inactive';
  isActive: boolean;
  migratedFromZoho: boolean;
  zohoClientId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  name: string;
  description?: string;
  contactInfo?: any;
  status?: 'active' | 'inactive';
}

export interface UpdateClientDto {
  name?: string;
  description?: string;
  contactInfo?: any;
  status?: 'active' | 'inactive';
}

export interface ClientResponse {
  client: Client;
}

export interface PaginatedClientResponse {
  clients: Client[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ClientFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
