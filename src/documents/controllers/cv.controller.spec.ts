import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CVController } from './cv.controller';
import { CVService } from '../services/cv.service';
import { User } from '../../auth/entities/user.entity';
import { EORProfile } from '../../profiles/entities/eor-profile.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';

describe('CVController', () => {
  let controller: CVController;
  let cvService: jest.Mocked<CVService>;

  const mockEORProfile = { id: 'eor-123' } as EORProfile;
  const mockUser = {
    id: 'user-123',
    email: 'john.doe@example.com',
    passwordHash: 'hash',
    firstName: 'John',
    lastName: 'Doe',
    phone: null,
    address: null,
    profileData: null,
    clientId: null,
    status: 'active',
    isActive: true,
    emailVerified: true,
    emailVerificationToken: null,
    emailVerificationTokenExpiry: null,
    passwordResetToken: null,
    migratedFromZoho: false,
    zohoUserId: null,
    supabaseUserId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'EOR',
    eorProfile: mockEORProfile,
    employmentRecords: [],
    userRoles: [],
  } as User;

  const mockFile = {
    buffer: Buffer.from('fake pdf content'),
    originalname: 'john-doe-cv.pdf',
    mimetype: 'application/pdf',
    size: 1024000,
  } as any;

  const mockUploadResult = {
    id: 'doc-123',
    versionId: 'v123456789-abcd',
    fileName: 'john-doe-cv.pdf',
    isCurrent: true,
    uploadedAt: new Date('2025-08-28T10:00:00Z'),
  };

  const mockCVList = [
    {
      id: 'doc-123',
      versionId: 'v123456789-abcd',
      fileName: 'john-doe-cv-v2.pdf',
      isCurrent: true,
      uploadedAt: new Date('2025-08-28T10:00:00Z'),
    },
    {
      id: 'doc-122',
      versionId: 'v123456788-abcd',
      fileName: 'john-doe-cv-v1.pdf',
      isCurrent: false,
      uploadedAt: new Date('2025-08-27T10:00:00Z'),
    },
  ];

  const mockDownloadUrl = {
    downloadUrl: 'https://storage.example.com/cv/eor-123/v123456789-abcd.pdf?expires=123456789',
    expiresAt: new Date('2025-08-28T11:00:00Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CVController],
      providers: [
        {
          provide: CVService,
          useValue: {
            uploadCV: jest.fn(),
            listCVs: jest.fn(),
            getDownloadUrl: jest.fn(),
          },
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(EmailVerifiedGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<CVController>(CVController);
    cvService = module.get(CVService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadCV', () => {
    beforeEach(() => {
      cvService.uploadCV.mockResolvedValue(mockUploadResult);
    });

    it('should upload CV successfully', async () => {
      const result = await controller.uploadCV(mockUser, mockFile);

      expect(result).toEqual({
        id: 'doc-123',
        versionId: 'v123456789-abcd',
        fileName: 'john-doe-cv.pdf',
        isCurrent: true,
        uploadedAt: '2025-08-28T10:00:00.000Z',
      });

      expect(cvService.uploadCV).toHaveBeenCalledWith('eor-123', mockFile, 'user-123', 'EOR');
    });

    it('should throw HttpException when user has no EOR profile', async () => {
      const userWithoutProfile = { ...mockUser, eorProfile: null };

      await expect(controller.uploadCV(userWithoutProfile, mockFile))
        .rejects.toThrow(HttpException);

      const error = await controller.uploadCV(userWithoutProfile, mockFile)
        .catch(e => e);

      expect(error.getStatus()).toBe(HttpStatus.PRECONDITION_REQUIRED);
      expect(error.getResponse()).toEqual({
        type: 'https://teamified.com/problems/profile-required',
        title: 'EOR Profile Required',
        status: HttpStatus.PRECONDITION_REQUIRED,
        detail: 'An EOR profile is required to upload CV',
      });
    });

    it('should handle service errors and return proper HTTP exception', async () => {
      cvService.uploadCV.mockRejectedValue(new Error('Storage service unavailable'));

      const error = await controller.uploadCV(mockUser, mockFile)
        .catch(e => e);

      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(error.getResponse()).toEqual({
        type: 'https://teamified.com/problems/upload-failed',
        title: 'CV Upload Failed',
        status: HttpStatus.BAD_REQUEST,
        detail: 'Storage service unavailable',
      });
    });
  });

  describe('listCVs', () => {
    beforeEach(() => {
      cvService.listCVs.mockResolvedValue(mockCVList);
    });

    it('should list CVs successfully', async () => {
      const result = await controller.listCVs(mockUser);

      expect(result).toEqual({ 
        cvs: mockCVList.map(cv => ({
          ...cv,
          uploadedAt: cv.uploadedAt.toISOString(),
        }))
      });
      expect(cvService.listCVs).toHaveBeenCalledWith('eor-123');
    });

    it('should throw HttpException when user has no EOR profile', async () => {
      const userWithoutProfile = { ...mockUser, eorProfile: null };

      const error = await controller.listCVs(userWithoutProfile)
        .catch(e => e);

      expect(error.getStatus()).toBe(HttpStatus.PRECONDITION_REQUIRED);
      expect(error.getResponse()).toEqual({
        type: 'https://teamified.com/problems/profile-required',
        title: 'EOR Profile Required',
        status: HttpStatus.PRECONDITION_REQUIRED,
        detail: 'An EOR profile is required to access CVs',
      });
    });

    it('should handle service errors', async () => {
      cvService.listCVs.mockRejectedValue(new Error('Database connection failed'));

      const error = await controller.listCVs(mockUser)
        .catch(e => e);

      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('getDownloadUrl', () => {
    beforeEach(() => {
      cvService.getDownloadUrl.mockResolvedValue(mockDownloadUrl);
    });

    it('should get download URL successfully', async () => {
      const result = await controller.getDownloadUrl(mockUser, 'v123456789-abcd');

      expect(result).toEqual({
        downloadUrl: 'https://storage.example.com/cv/eor-123/v123456789-abcd.pdf?expires=123456789',
        expiresAt: '2025-08-28T11:00:00.000Z',
      });

      expect(cvService.getDownloadUrl).toHaveBeenCalledWith('eor-123', 'v123456789-abcd', 'user-123', 'EOR');
    });

    it('should throw HttpException when user has no EOR profile', async () => {
      const userWithoutProfile = { ...mockUser, eorProfile: null };

      const error = await controller.getDownloadUrl(userWithoutProfile, 'v123456789-abcd')
        .catch(e => e);

      expect(error.getStatus()).toBe(HttpStatus.PRECONDITION_REQUIRED);
    });

    it('should handle service errors', async () => {
      cvService.getDownloadUrl.mockRejectedValue(new Error('File not found'));

      const error = await controller.getDownloadUrl(mockUser, 'invalid-version')
        .catch(e => e);

      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});