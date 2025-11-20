import api from './api';
import axios from 'axios'; // Keep for utility functions

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface DocumentRequirements {
  id: string;
  cvRequired: number;
  identityRequired: number;
  employmentRequired: number;
  educationRequired: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDocumentRequirementsDto {
  cvRequired: number;
  identityRequired: number;
  employmentRequired: number;
  educationRequired: number;
}

class DocumentRequirementsService {
  private getAuthHeaders() {
    const token = localStorage.getItem('teamified_access_token') || localStorage.getItem('access_token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async getRequirements(): Promise<DocumentRequirements> {
    const response = await axios.get(
      `${API_BASE_URL}/v1/onboarding/document-requirements`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async updateRequirements(dto: UpdateDocumentRequirementsDto): Promise<DocumentRequirements> {
    const response = await axios.put(
      `${API_BASE_URL}/v1/onboarding/document-requirements`,
      dto,
      this.getAuthHeaders()
    );
    return response.data;
  }
}

export const documentRequirementsService = new DocumentRequirementsService();
