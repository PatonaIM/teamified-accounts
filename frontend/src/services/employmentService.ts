/**
 * Employment Service
 * API communication service for employment record operations
 */

import axios from 'axios';
import api from './api';
import type {
  EmploymentRecord,
  EmploymentRecordSearchResponse,
  EmploymentRecordFilters,
} from '../types/employmentRecords';

class EmploymentService {
  private readonly baseUrl = '/v1/employment-records';

  /**
   * Search employment records with filters
   */
  async searchEmploymentRecords(params: EmploymentRecordFilters): Promise<EmploymentRecord[]> {
    try {
      // Convert params to URL search params
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });

      const queryString = searchParams.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
      
      const response = await api.get<EmploymentRecordSearchResponse>(url);
      
      // Return the employment records array from the response
      return response.data.employmentRecords || [];
    } catch (error) {
      this.handleError(error, 'Failed to search employment records');
    }
  }

  /**
   * Get employment record by ID
   */
  async getEmploymentRecordById(id: string): Promise<EmploymentRecord> {
    try {
      const response = await api.get<{ employmentRecord: EmploymentRecord }>(`${this.baseUrl}/${id}`);
      return response.data.employmentRecord;
    } catch (error) {
      this.handleError(error, 'Failed to fetch employment record');
    }
  }

  /**
   * Format employment record for display
   * Format: "Employee Name - Role at Client Name (Status)"
   */
  formatEmploymentRecordLabel(record: EmploymentRecord): string {
    const employeeName = record.user 
      ? `${record.user.firstName} ${record.user.lastName}`.trim()
      : 'Unknown Employee';
    
    const clientName = record.client?.name || 'Unknown Client';
    const status = this.formatStatus(record.status);
    
    return `${employeeName} - ${record.role} at ${clientName} (${status})`;
  }

  /**
   * Format status for display
   */
  private formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  /**
   * Handle API errors
   */
  private handleError(error: any, defaultMessage: string): never {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || defaultMessage;
      throw new Error(message);
    }
    throw new Error(defaultMessage);
  }
}

// Export singleton instance
export const employmentService = new EmploymentService();
