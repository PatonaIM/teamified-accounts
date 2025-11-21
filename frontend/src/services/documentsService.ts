import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Document categories for the tabbed interface
export type DocumentCategory = 'cv' | 'identity' | 'employment' | 'education';

// Document verification status (backend uses 'approved', frontend displays as 'verified')
export type DocumentStatus = 'pending' | 'approved' | 'verified' | 'needs_changes' | 'rejected' | null;

// Document interface matching backend Document entity
export interface Document {
  id: string;
  userId: string;
  documentType: 'CV' | 'HR_DOCUMENT' | 'TAX_DOCUMENT' | 'PAYSLIP';
  category?: DocumentCategory; // Metadata for categorizing HR_DOCUMENT
  fileName: string;
  filePath: string;
  contentType: string;
  fileSize: number;
  sha256Checksum: string;
  versionId: string;
  isCurrent: boolean;
  status: DocumentStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  uploadedBy: string;
  uploadedByRole: string;
  uploadedAt: string;
}

// Upload result from backend
export interface UploadDocumentResult {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

// File validation constraints
export const FILE_CONSTRAINTS = {
  cv: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowedExtensions: ['.pdf', '.doc', '.docx'],
  },
  identity: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
  },
  employment: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowedExtensions: ['.pdf', '.doc', '.docx'],
  },
  education: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
  },
};

class DocumentsService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('teamified_access_token') || localStorage.getItem('access_token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, category: DocumentCategory): { valid: boolean; error?: string } {
    const constraints = FILE_CONSTRAINTS[category];
    
    if (file.size > constraints.maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${constraints.maxSize / (1024 * 1024)}MB`,
      };
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!constraints.allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `Only ${constraints.allowedExtensions.join(', ')} files are allowed`,
      };
    }

    if (!constraints.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${constraints.allowedExtensions.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Upload a document
   * Uses unified /v1/documents endpoint for all categories
   */
  async uploadDocument(
    file: File,
    category: DocumentCategory,
    metadata?: {
      description?: string;
      employmentRecordId?: string;
      clientId?: string;
    }
  ): Promise<UploadDocumentResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      
      if (metadata?.description) {
        formData.append('description', metadata.description);
      }
      
      const response = await axios.post(`${this.baseURL}/v1/documents`, formData, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to upload document:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload document');
    }
  }

  /**
   * Get documents by category
   * Uses unified /v1/documents endpoint for all categories
   */
  async getDocumentsByCategory(category: DocumentCategory): Promise<Document[]> {
    try {
      const response = await axios.get(`${this.baseURL}/v1/documents`, {
        headers: this.getAuthHeaders(),
        params: {
          category,
        },
      });
      return response.data.documents || [];
    } catch (error: any) {
      console.error(`Failed to fetch ${category} documents:`, error);
      throw new Error(error.response?.data?.message || `Failed to fetch ${category} documents`);
    }
  }

  /**
   * Get all documents for current user
   */
  async getAllDocuments(): Promise<Document[]> {
    try {
      const [cvDocs, identityDocs, employmentDocs, educationDocs] = await Promise.all([
        this.getDocumentsByCategory('cv'),
        this.getDocumentsByCategory('identity'),
        this.getDocumentsByCategory('employment'),
        this.getDocumentsByCategory('education'),
      ]);

      return [...cvDocs, ...identityDocs, ...employmentDocs, ...educationDocs];
    } catch (error: any) {
      console.error('Failed to fetch all documents:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch documents');
    }
  }

  /**
   * Get document counts by category
   */
  async getDocumentCounts(): Promise<Record<DocumentCategory, number>> {
    try {
      const documents = await this.getAllDocuments();
      
      return {
        cv: documents.filter(d => d.category === 'cv').length,
        identity: documents.filter(d => d.category === 'identity').length,
        employment: documents.filter(d => d.category === 'employment').length,
        education: documents.filter(d => d.category === 'education').length,
      };
    } catch (error: any) {
      console.error('Failed to get document counts:', error);
      return { cv: 0, identity: 0, employment: 0, education: 0 };
    }
  }

  /**
   * Delete a document
   * Uses unified /v1/documents endpoint for all categories
   */
  async deleteDocument(documentId: string, category: DocumentCategory): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/v1/documents/${documentId}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error: any) {
      console.error('Failed to delete document:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete document');
    }
  }

  /**
   * Get download URL for a document
   * Uses unified /v1/documents endpoint for all categories
   */
  async getDownloadUrl(documentId: string, category: DocumentCategory): Promise<string> {
    try {
      const response = await axios.get(`${this.baseURL}/v1/documents/${documentId}/download`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.downloadUrl;
    } catch (error: any) {
      console.error('Failed to get download URL:', error);
      throw new Error(error.response?.data?.message || 'Failed to get download URL');
    }
  }

  /**
   * Download a document
   */
  async downloadDocument(documentId: string, fileName: string, category: DocumentCategory): Promise<void> {
    try {
      const url = await this.getDownloadUrl(documentId, category);
      
      // If URL is relative (starts with /), prepend the base URL
      const downloadUrl = url.startsWith('/') ? `${window.location.origin}${url}` : url;
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank'; // Open in new tab for better error handling
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error('Failed to download document:', error);
      throw new Error(error.response?.data?.message || 'Failed to download document');
    }
  }

  /**
   * Get document version history for a specific document
   * Uses unified /v1/documents endpoint for all categories
   */
  async getVersionHistory(documentId: string): Promise<Document[]> {
    try {
      const response = await axios.get(`${this.baseURL}/v1/documents/${documentId}/versions`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.versions || [];
    } catch (error: any) {
      console.error('Failed to fetch version history:', error);
      return [];
    }
  }
}

export const documentsService = new DocumentsService();
export default documentsService;

