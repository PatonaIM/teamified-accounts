import api from './api';
import axios from 'axios'; // Keep for utility functions

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface OnboardingCandidate {
  employmentRecordId: string;
  userId: string;
  userName: string;
  userEmail: string;
  submittedAt: string;
  employmentStatus: string;
  onboardingCompletedAt?: string;
  documentProgress: {
    cv: { uploaded: number; verified: number; total: number };
    identity: { uploaded: number; verified: number; total: number };
    employment: { uploaded: number; verified: number; total: number };
    education: { uploaded: number; verified: number; total: number };
  };
}

export interface VerifyDocumentRequest {
  action: 'approve' | 'reject' | 'needs_changes';
  notes: string;
}

export interface BulkVerifyRequest {
  documentIds: string[];
  action: 'approve' | 'reject' | 'needs_changes';
  notes: string;
}

export interface RevokeVerificationRequest {
  reason: string;
}

export interface VerificationResponse {
  id: string;
  status: string;
  reviewedBy: string;
  reviewedAt: string;
  reviewNotes: string;
}

export interface BulkVerificationResponse {
  success: number;
  failed: number;
  errors: Array<{ documentId: string; error: string }>;
}

class HROnboardingService {
  private getAuthHeaders() {
    const token = localStorage.getItem('teamified_access_token') || localStorage.getItem('access_token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Get all candidates in onboarding status
   */
  async getOnboardingCandidates(
    search?: string,
    sortBy: 'submittedAt' | 'name' | 'progress' = 'submittedAt',
    order: 'asc' | 'desc' = 'desc',
  ): Promise<{ candidates: OnboardingCandidate[] }> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('sortBy', sortBy);
    params.append('order', order);

    const response = await axios.get(
      `${API_BASE_URL}/v1/hr/onboarding/candidates?${params.toString()}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Get all documents for a specific candidate
   */
  async getCandidateDocuments(userId: string, category?: string): Promise<any[]> {
    const params = category ? `?category=${category}` : '';
    const response = await axios.get(
      `${API_BASE_URL}/v1/hr/onboarding/candidates/${userId}/documents${params}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Verify a single document
   */
  async verifyDocument(
    documentId: string,
    request: VerifyDocumentRequest,
  ): Promise<VerificationResponse> {
    const response = await axios.patch(
      `${API_BASE_URL}/v1/documents/${documentId}/verify`,
      request,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Verify multiple documents at once
   */
  async bulkVerifyDocuments(
    request: BulkVerifyRequest,
  ): Promise<BulkVerificationResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/v1/documents/bulk-verify`,
      request,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Revoke verification for a document (admin only)
   */
  async revokeVerification(
    documentId: string,
    request: RevokeVerificationRequest,
  ): Promise<VerificationResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/v1/documents/${documentId}/revoke-verification`,
      request,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Complete onboarding for a candidate (changes status from 'onboarding' to 'active')
   */
  async completeOnboarding(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await axios.post(
      `${API_BASE_URL}/v1/hr/onboarding/candidates/${userId}/complete`,
      {},
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }
}

export const hrOnboardingService = new HROnboardingService();
export default hrOnboardingService;
