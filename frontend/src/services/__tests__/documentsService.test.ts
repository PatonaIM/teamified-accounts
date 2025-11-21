import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { documentsService, FILE_CONSTRAINTS } from '../documentsService';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DocumentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('validateFile', () => {
    it('should validate file size correctly', () => {
      const oversizedFile = new File([''], 'test.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(oversizedFile, 'size', {
        value: 6 * 1024 * 1024, // 6MB (exceeds 5MB limit for CV)
      });

      const result = documentsService.validateFile(oversizedFile, 'cv');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('5MB');
    });

    it('should validate file type correctly', () => {
      const invalidFile = new File([''], 'test.exe', {
        type: 'application/x-msdownload',
      });
      Object.defineProperty(invalidFile, 'size', {
        value: 1024,
      });

      const result = documentsService.validateFile(invalidFile, 'cv');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('allowed');
    });

    it('should accept valid PDF file', () => {
      const validFile = new File([''], 'test.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(validFile, 'size', {
        value: 1024 * 1024, // 1MB
      });

      const result = documentsService.validateFile(validFile, 'cv');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('getDocumentCounts', () => {
    it('should return document counts by category', async () => {
      const mockDocuments = [
        { id: '1', documentType: 'CV', category: null },
        { id: '2', documentType: 'HR_DOCUMENT', category: 'identity' },
        { id: '3', documentType: 'HR_DOCUMENT', category: 'employment' },
        { id: '4', documentType: 'HR_DOCUMENT', category: 'identity' },
      ];

      mockedAxios.get
        .mockResolvedValueOnce({ data: [mockDocuments[0]] }) // CV
        .mockResolvedValueOnce({ data: [mockDocuments[1], mockDocuments[3]] }) // identity
        .mockResolvedValueOnce({ data: [mockDocuments[2]] }) // employment
        .mockResolvedValueOnce({ data: [] }); // education

      const counts = await documentsService.getDocumentCounts();

      expect(counts).toEqual({
        cv: 1,
        identity: 2,
        employment: 1,
        education: 0,
      });
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      const counts = await documentsService.getDocumentCounts();

      expect(counts).toEqual({
        cv: 0,
        identity: 0,
        employment: 0,
        education: 0,
      });
    });
  });

  describe('FILE_CONSTRAINTS', () => {
    it('should have correct constraints for CV category', () => {
      expect(FILE_CONSTRAINTS.cv.maxSize).toBe(5 * 1024 * 1024);
      expect(FILE_CONSTRAINTS.cv.allowedExtensions).toContain('.pdf');
    });

    it('should have correct constraints for identity category', () => {
      expect(FILE_CONSTRAINTS.identity.maxSize).toBe(5 * 1024 * 1024);
      expect(FILE_CONSTRAINTS.identity.allowedTypes).toContain('image/jpeg');
    });

    it('should have correct constraints for employment category', () => {
      expect(FILE_CONSTRAINTS.employment.maxSize).toBe(10 * 1024 * 1024);
    });

    it('should have correct constraints for education category', () => {
      expect(FILE_CONSTRAINTS.education.maxSize).toBe(10 * 1024 * 1024);
    });
  });
});

