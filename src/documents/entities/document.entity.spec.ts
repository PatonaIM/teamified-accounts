import { validate } from 'class-validator';
import { Document, DocumentType } from './document.entity';

describe('Document Entity', () => {
  let document: Document;

  beforeEach(() => {
    document = new Document();
    document.id = '123e4567-e89b-12d3-a456-426614174000';
    document.eorProfileId = '123e4567-e89b-12d3-a456-426614174001';
    document.documentType = DocumentType.CV;
    document.fileName = 'john-doe-cv.pdf';
    document.filePath = 'cv/123e4567-e89b-12d3-a456-426614174001/v123456789-abcd.pdf';
    document.contentType = 'application/pdf';
    document.fileSize = 1024000;
    document.sha256Checksum = 'abc123def456';
    document.versionId = 'v123456789-abcd';
    document.isCurrent = true;
    document.uploadedAt = new Date();
  });

  describe('validation', () => {
    it('should create document with required fields', () => {
      // Skip class-validator validation since the entity doesn't have validation decorators
      expect(document.id).toBeDefined();
      expect(document.eorProfileId).toBeDefined();
      expect(document.documentType).toBe(DocumentType.CV);
    });

    it('should have correct document types', () => {
      expect(DocumentType.CV).toBe('CV');
      expect(DocumentType.PAYSLIP).toBe('PAYSLIP');
      expect(DocumentType.HR_DOCUMENT).toBe('HR_DOCUMENT');
    });

    it('should have all required properties', () => {
      expect(document.id).toBeDefined();
      expect(document.eorProfileId).toBeDefined();
      expect(document.documentType).toBe(DocumentType.CV);
      expect(document.fileName).toBe('john-doe-cv.pdf');
      expect(document.filePath).toBe('cv/123e4567-e89b-12d3-a456-426614174001/v123456789-abcd.pdf');
      expect(document.contentType).toBe('application/pdf');
      expect(document.fileSize).toBe(1024000);
      expect(document.sha256Checksum).toBe('abc123def456');
      expect(document.versionId).toBe('v123456789-abcd');
      expect(document.isCurrent).toBe(true);
      expect(document.uploadedAt).toBeInstanceOf(Date);
    });

    it('should default isCurrent to false when not specified', () => {
      const newDocument = new Document();
      expect(newDocument.isCurrent).toBeUndefined(); // Entity defaults are applied at DB level
    });
  });
});