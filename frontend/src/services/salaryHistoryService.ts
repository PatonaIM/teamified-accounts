/**
 * Salary History Service
 * API communication service for salary history management
 */

import axios from 'axios';
import type {
  SalaryHistory,
  CreateSalaryHistoryRequest,
  SalaryHistorySearchParams,
  SalaryReport,
} from '../types/salary-history.types';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('teamified_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class SalaryHistoryService {
  private readonly baseUrl = '/v1/salary-history';

  /**
   * Create a new salary history record
   */
  async createSalaryHistory(data: CreateSalaryHistoryRequest): Promise<SalaryHistory> {
    try {
      const response = await api.post<SalaryHistory>(`${this.baseUrl}`, data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to create salary history');
    }
  }

  /**
   * Get salary history for a specific employment record
   */
  async getSalaryHistoryByEmployment(employmentId: string): Promise<SalaryHistory[]> {
    try {
      const response = await api.get<SalaryHistory[]>(`${this.baseUrl}/employment/${employmentId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch salary history for employment');
    }
  }

  /**
   * Get salary history for a specific user
   */
  async getSalaryHistoryByUser(userId: string): Promise<SalaryHistory[]> {
    try {
      const response = await api.get<SalaryHistory[]>(`${this.baseUrl}/user/${userId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch salary history for user');
    }
  }

  /**
   * Search salary history records with pagination
   */
  async searchSalaryHistory(params: SalaryHistorySearchParams): Promise<{
    items: SalaryHistory[];
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      // Convert params to URL search params
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const queryString = searchParams.toString();
      const url = queryString ? `${this.baseUrl}/search?${queryString}` : `${this.baseUrl}/search`;
      
      const response = await api.get<{
        items: SalaryHistory[];
        totalCount: number;
        pageSize: number;
        currentPage: number;
        totalPages: number;
      }>(url);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to search salary history');
    }
  }

  /**
   * Get salary report for employment record
   */
  async getEmploymentSalaryReport(employmentId: string): Promise<SalaryReport> {
    try {
      const response = await api.get<SalaryReport>(`${this.baseUrl}/reports/employment/${employmentId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to generate employment salary report');
    }
  }

  /**
   * Get salary report for user
   */
  async getUserSalaryReport(userId: string): Promise<SalaryReport> {
    try {
      const response = await api.get<SalaryReport>(`${this.baseUrl}/reports/user/${userId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to generate user salary report');
    }
  }

  /**
   * Get organization-wide salary summary (admin/hr only)
   */
  async getOrganizationSummary(): Promise<SalaryReport> {
    try {
      const response = await api.get<SalaryReport>(`${this.baseUrl}/reports/summary`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to generate organization summary');
    }
  }

  /**
   * Get scheduled salary changes
   */
  async getScheduledChanges(): Promise<SalaryHistory[]> {
    try {
      const response = await api.get<SalaryHistory[]>(`${this.baseUrl}/scheduled`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch scheduled salary changes');
    }
  }

  /**
   * Check if salary history exists for employment and date
   */
  async checkSalaryHistoryExists(employmentId: string, effectiveDate: string): Promise<boolean> {
    try {
      const params: SalaryHistorySearchParams = {
        employmentRecordId: employmentId,
        startDate: effectiveDate,
        endDate: effectiveDate,
        limit: 1,
      };
      
      const results = await this.searchSalaryHistory(params);
      return results.items.length > 0;
    } catch (error) {
      this.handleError(error, 'Failed to check salary history existence');
    }
  }

  /**
   * Get current salary for employment
   */
  async getCurrentSalary(employmentId: string): Promise<SalaryHistory | null> {
    try {
      const salaryHistory = await this.getSalaryHistoryByEmployment(employmentId);
      
      // Find the most recent salary that's effective today or in the past
      const now = new Date();
      const currentSalary = salaryHistory.find(salary => new Date(salary.effectiveDate) <= now);
      
      return currentSalary || null;
    } catch (error) {
      this.handleError(error, 'Failed to get current salary');
    }
  }

  /**
   * Get next scheduled salary change
   */
  async getNextScheduledChange(employmentId: string): Promise<SalaryHistory | null> {
    try {
      const salaryHistory = await this.getSalaryHistoryByEmployment(employmentId);
      
      // Find the next scheduled salary change
      const now = new Date();
      const scheduledChanges = salaryHistory
        .filter(salary => new Date(salary.effectiveDate) > now)
        .sort((a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime());
      
      return scheduledChanges[0] || null;
    } catch (error) {
      this.handleError(error, 'Failed to get next scheduled salary change');
    }
  }

  /**
   * Delete a salary history record
   */
  async deleteSalaryHistory(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      this.handleError(error, 'Failed to delete salary history');
    }
  }

  /**
   * Update a salary history record
   */
  async updateSalaryHistory(id: string, data: Partial<CreateSalaryHistoryRequest>): Promise<SalaryHistory> {
    try {
      const response = await api.patch<SalaryHistory>(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to update salary history');
    }
  }

  /**
   * Format currency amount for display
   */
  formatCurrency(amount: number, currency: string): string {
    const currencySymbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'C$',
      AUD: 'A$',
      JPY: '¥',
      CHF: 'CHF',
      CNY: '¥',
      INR: '₹',
      BRL: 'R$',
    };

    const symbol = currencySymbols[currency] || currency;
    
    // Format number with appropriate decimal places
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    }).format(amount);

    return `${symbol}${formattedAmount}`;
  }

  /**
   * Calculate salary change percentage
   */
  calculateChangePercentage(currentAmount: number, previousAmount: number): number {
    if (previousAmount === 0) return 0;
    return ((currentAmount - previousAmount) / previousAmount) * 100;
  }

  /**
   * Calculate days until effective date
   */
  calculateDaysUntilEffective(effectiveDate: Date): number {
    const now = new Date();
    const diffTime = effectiveDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Validate salary history form data
   */
  validateSalaryHistoryData(data: CreateSalaryHistoryRequest): string[] {
    const errors: string[] = [];

    if (!data.employmentRecordId) {
      errors.push('Employment record ID is required');
    }

    if (!data.salaryAmount || data.salaryAmount <= 0) {
      errors.push('Salary amount must be greater than 0');
    }

    if (!data.salaryCurrency) {
      errors.push('Currency is required');
    }

    if (!data.effectiveDate) {
      errors.push('Effective date is required');
    } else {
      const effectiveDate = new Date(data.effectiveDate);
      const now = new Date();
      const maxFutureDate = new Date();
      maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);

      if (effectiveDate > maxFutureDate) {
        errors.push('Effective date cannot be more than 1 year in the future');
      }
    }

    if (!data.changeReason || data.changeReason.trim().length === 0) {
      errors.push('Change reason is required');
    } else if (data.changeReason.length > 100) {
      errors.push('Change reason cannot exceed 100 characters');
    }

    return errors;
  }

  /**
   * Handle API errors
   */
  private handleError(error: any, defaultMessage: string): never {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error(defaultMessage);
    }
  }
}

export const salaryHistoryService = new SalaryHistoryService();
