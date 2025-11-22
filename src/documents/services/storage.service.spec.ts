import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadCV', () => {
    it('should upload CV and return upload result', async () => {
      const eorId = '123e4567-e89b-12d3-a456-426614174001';
      const versionId = 'v123456789-abcd';
      const fileName = 'john-doe-cv.pdf';
      const contentType = 'application/pdf';
      const fileBuffer = Buffer.from('fake pdf content');

      const result = await service.uploadCV(eorId, versionId, fileBuffer, fileName, contentType);

      expect(result).toEqual({
        filePath: `cv/${eorId}/${versionId}.pdf`,
        sha256Checksum: expect.any(String),
        fileSize: fileBuffer.length,
      });
      expect(result.sha256Checksum).toHaveLength(64);
    });

    it('should generate correct file path for DOCX files', async () => {
      const eorId = '123e4567-e89b-12d3-a456-426614174001';
      const versionId = 'v123456789-abcd';
      const fileName = 'john-doe-cv.docx';
      const contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const fileBuffer = Buffer.from('fake docx content');

      const result = await service.uploadCV(eorId, versionId, fileBuffer, fileName, contentType);

      expect(result.filePath).toBe(`cv/${eorId}/${versionId}.docx`);
    });
  });

  describe('generateSignedUrl', () => {
    it('should generate signed URL with default expiration', async () => {
      const filePath = 'cv/123e4567-e89b-12d3-a456-426614174001/v123456789-abcd.pdf';

      const result = await service.generateSignedUrl(filePath);

      expect(result).toEqual({
        downloadUrl: expect.stringContaining(filePath),
        expiresAt: expect.any(Date),
      });

      const expirationTime = result.expiresAt.getTime() - Date.now();
      expect(expirationTime).toBeGreaterThan(3590000); // Just under 1 hour
      expect(expirationTime).toBeLessThan(3610000); // Just over 1 hour
    });

    it('should generate signed URL with custom expiration', async () => {
      const filePath = 'cv/123e4567-e89b-12d3-a456-426614174001/v123456789-abcd.pdf';
      const customHours = 2;

      const result = await service.generateSignedUrl(filePath, customHours);

      const expirationTime = result.expiresAt.getTime() - Date.now();
      expect(expirationTime).toBeGreaterThan(7190000); // Just under 2 hours
      expect(expirationTime).toBeLessThan(7210000); // Just over 2 hours
    });
  });

  describe('file validation', () => {
    describe('isValidCVFileType', () => {
      it('should accept PDF files', () => {
        expect(service.isValidCVFileType('application/pdf', 'cv.pdf')).toBe(true);
      });

      it('should accept DOCX files', () => {
        expect(service.isValidCVFileType(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'cv.docx'
        )).toBe(true);
      });

      it('should reject invalid content types', () => {
        expect(service.isValidCVFileType('text/plain', 'cv.txt')).toBe(false);
        expect(service.isValidCVFileType('image/jpeg', 'cv.jpg')).toBe(false);
        expect(service.isValidCVFileType('application/msword', 'cv.doc')).toBe(false);
      });

      it('should reject invalid file extensions', () => {
        expect(service.isValidCVFileType('application/pdf', 'cv.txt')).toBe(false);
        expect(service.isValidCVFileType('application/pdf', 'cv.doc')).toBe(false);
      });

      it('should be case insensitive for extensions', () => {
        expect(service.isValidCVFileType('application/pdf', 'CV.PDF')).toBe(true);
        expect(service.isValidCVFileType(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'CV.DOCX'
        )).toBe(true);
      });
    });

    describe('isValidFileSize', () => {
      it('should accept files within 10MB limit', () => {
        expect(service.isValidFileSize(1024)).toBe(true); // 1KB
        expect(service.isValidFileSize(5 * 1024 * 1024)).toBe(true); // 5MB
        expect(service.isValidFileSize(10 * 1024 * 1024)).toBe(true); // Exactly 10MB
      });

      it('should reject files over 10MB limit', () => {
        expect(service.isValidFileSize(10 * 1024 * 1024 + 1)).toBe(false); // Just over 10MB
        expect(service.isValidFileSize(20 * 1024 * 1024)).toBe(false); // 20MB
      });
    });
  });

  describe('generateVersionId', () => {
    it('should generate unique version IDs', () => {
      const version1 = service.generateVersionId();
      const version2 = service.generateVersionId();

      expect(version1).not.toBe(version2);
      expect(version1).toMatch(/^v\d+-[a-f0-9]{8}$/);
      expect(version2).toMatch(/^v\d+-[a-f0-9]{8}$/);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const filePath = 'cv/123e4567-e89b-12d3-a456-426614174001/v123456789-abcd.pdf';

      await expect(service.deleteFile(filePath)).resolves.not.toThrow();
    });
  });
});