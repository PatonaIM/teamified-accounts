import api from './api';
import axios from 'axios'; // Keep for utility functions
import type { EmploymentStatus, EmploymentRecord, EmploymentRecordFilters, EmploymentRecordResponse, PaginatedResponse, User, Client } from '../types/employmentRecords';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class EmploymentRecordsService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/v1`;
  }

  // Get authentication headers
  private getAuthHeaders() {
    const token = localStorage.getItem('teamified_access_token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  // Get employment records with pagination and filtering
  async getEmploymentRecords(filters: EmploymentRecordFilters): Promise<PaginatedResponse<EmploymentRecord>> {
    try {
      const params = new URLSearchParams();
      
      // Add pagination parameters
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      
      // Add search and filter parameters
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.clientId) params.append('clientId', filters.clientId);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.startDateFrom) params.append('startDateFrom', filters.startDateFrom);
      if (filters.startDateTo) params.append('startDateTo', filters.startDateTo);
      if (filters.endDateFrom) params.append('endDateFrom', filters.endDateFrom);
      if (filters.endDateTo) params.append('endDateTo', filters.endDateTo);
      
      // Add sorting parameters
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.order) params.append('order', filters.order);

      const response = await axios.get(`${this.baseURL}/employment-records?${params}`, {
        headers: this.getAuthHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error('Failed to fetch employment records:', error);
      throw this.handleError(error);
    }
  }

  // Get employment record by ID
  async getEmploymentRecord(id: string): Promise<EmploymentRecord> {
    try {
      const response = await axios.get(`${this.baseURL}/employment-records/${id}`, {
        headers: this.getAuthHeaders(),
      });

      return response.data.employmentRecord;
    } catch (error) {
      console.error('Failed to fetch employment record:', error);
      throw this.handleError(error);
    }
  }

  // Create new employment record
  async createEmploymentRecord(data: Partial<EmploymentRecord>): Promise<EmploymentRecord> {
    try {
      const response = await axios.post(`${this.baseURL}/employment-records`, data, {
        headers: this.getAuthHeaders(),
      });

      return response.data.employmentRecord;
    } catch (error) {
      console.error('Failed to create employment record:', error);
      throw this.handleError(error);
    }
  }

  // Update employment record (full update)
  async updateEmploymentRecord(id: string, data: Partial<EmploymentRecord>): Promise<EmploymentRecord> {
    try {
      const response = await axios.put(`${this.baseURL}/employment-records/${id}`, data, {
        headers: this.getAuthHeaders(),
      });

      return response.data.employmentRecord;
    } catch (error) {
      console.error('Failed to update employment record:', error);
      throw this.handleError(error);
    }
  }

  // Partial update employment record
  async patchEmploymentRecord(id: string, data: Partial<EmploymentRecord>): Promise<EmploymentRecord> {
    try {
      const response = await axios.patch(`${this.baseURL}/employment-records/${id}`, data, {
        headers: this.getAuthHeaders(),
      });

      return response.data.employmentRecord;
    } catch (error) {
      console.error('Failed to patch employment record:', error);
      throw this.handleError(error);
    }
  }

  // Terminate employment record
  async terminateEmploymentRecord(id: string, terminationData: { endDate: string; reason?: string }): Promise<EmploymentRecord> {
    try {
      const response = await axios.patch(`${this.baseURL}/employment-records/${id}/terminate`, terminationData, {
        headers: this.getAuthHeaders(),
      });

      return response.data.employmentRecord;
    } catch (error) {
      console.error('Failed to terminate employment record:', error);
      throw this.handleError(error);
    }
  }

  // Delete employment record
  async deleteEmploymentRecord(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/employment-records/${id}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Failed to delete employment record:', error);
      throw this.handleError(error);
    }
  }

  // Get employment records for a specific user
  async getUserEmploymentRecords(userId: string): Promise<EmploymentRecord[]> {
    try {
      const response = await axios.get(`${this.baseURL}/employment-records/user/${userId}`, {
        headers: this.getAuthHeaders(),
      });

      return response.data.employmentRecords;
    } catch (error) {
      console.error('Failed to fetch user employment records:', error);
      throw this.handleError(error);
    }
  }

  // Get employment records for a specific client
  async getClientEmploymentRecords(clientId: string): Promise<EmploymentRecord[]> {
    try {
      const response = await axios.get(`${this.baseURL}/employment-records/client/${clientId}`, {
        headers: this.getAuthHeaders(),
      });

      return response.data.employmentRecords;
    } catch (error) {
      console.error('Failed to fetch client employment records:', error);
      throw this.handleError(error);
    }
  }

  // Get users for dropdown/autocomplete
  async getUsers(): Promise<User[]> {
    try {
      // Request maximum allowed users (backend limit is 100)
      const response = await axios.get(`${this.baseURL}/users`, {
        headers: this.getAuthHeaders(),
        params: {
          limit: 100, // Backend maximum allowed limit
          page: 1,
        },
      });

      return response.data.users || [];
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw this.handleError(error);
    }
  }

  // Get clients for dropdown/autocomplete
  async getClients(): Promise<Client[]> {
    try {
      const response = await axios.get(`${this.baseURL}/clients`, {
        headers: this.getAuthHeaders(),
      });

      return response.data.clients || [];
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      throw this.handleError(error);
    }
  }

  // Get countries for dropdown/autocomplete
  async getCountries(): Promise<Array<{ id: string; code: string; name: string }>> {
    try {
      const response = await axios.get(`${this.baseURL}/payroll/configuration/countries`, {
        headers: this.getAuthHeaders(),
      });

      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      throw this.handleError(error);
    }
  }

  // Export employment records
  async exportEmploymentRecords(filters: EmploymentRecordFilters, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      // Add filter parameters
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.clientId) params.append('clientId', filters.clientId);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.startDateFrom) params.append('startDateFrom', filters.startDateFrom);
      if (filters.startDateTo) params.append('startDateTo', filters.startDateTo);
      if (filters.endDateFrom) params.append('endDateFrom', filters.endDateFrom);
      if (filters.endDateTo) params.append('endDateTo', filters.endDateTo);
      
      params.append('format', format);

      const response = await axios.get(`${this.baseURL}/employment-records/export?${params}`, {
        headers: this.getAuthHeaders(),
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error('Failed to export employment records:', error);
      throw this.handleError(error);
    }
  }

  // Bulk update employment records
  async bulkUpdateEmploymentRecords(ids: string[], data: Partial<EmploymentRecord>): Promise<EmploymentRecord[]> {
    try {
      const response = await axios.patch(`${this.baseURL}/employment-records/bulk`, {
        ids,
        data,
      }, {
        headers: this.getAuthHeaders(),
      });

      return response.data.employmentRecords;
    } catch (error) {
      console.error('Failed to bulk update employment records:', error);
      throw this.handleError(error);
    }
  }

  // Get employment statistics
  async getEmploymentStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    terminated: number;
    completed: number;
    recentHires: number;
    recentTerminations: number;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/employment-records/statistics`, {
        headers: this.getAuthHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error('Failed to fetch employment statistics:', error);
      throw this.handleError(error);
    }
  }

  // Error handling
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
        return new Error(message);
      } else if (error.request) {
        // Request was made but no response received
        return new Error('Network error. Please check your connection.');
      }
    }
    
    // Generic error
    return new Error(error.message || 'An unexpected error occurred');
  }
}

// Create and export singleton instance
export const employmentRecordsService = new EmploymentRecordsService();
export default employmentRecordsService;
