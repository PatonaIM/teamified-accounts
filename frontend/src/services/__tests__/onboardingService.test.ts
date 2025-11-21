import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onboardingService } from '../onboardingService';

describe('OnboardingService', () => {
  const mockEmploymentRecordId = 'test-employment-id';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('Step Persistence', () => {
    it('should save and retrieve step number', () => {
      onboardingService.saveStep(mockEmploymentRecordId, 2);
      const savedStep = onboardingService.getSavedStep(mockEmploymentRecordId);
      expect(savedStep).toBe(2);
    });

    it('should return 0 for unsaved step', () => {
      const savedStep = onboardingService.getSavedStep('non-existent-id');
      expect(savedStep).toBe(0);
    });

    it('should clear saved step', () => {
      onboardingService.saveStep(mockEmploymentRecordId, 2);
      onboardingService.clearSavedStep(mockEmploymentRecordId);
      const savedStep = onboardingService.getSavedStep(mockEmploymentRecordId);
      expect(savedStep).toBe(0);
    });
  });

  describe('Form Data Persistence', () => {
    const mockFormData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };

    it('should save and retrieve form data', () => {
      onboardingService.saveFormData(mockEmploymentRecordId, 0, mockFormData);
      const savedData = onboardingService.getSavedFormData(mockEmploymentRecordId, 0);
      expect(savedData).toEqual(mockFormData);
    });

    it('should return null for unsaved form data', () => {
      const savedData = onboardingService.getSavedFormData('non-existent-id', 0);
      expect(savedData).toBeNull();
    });

    it('should clear saved form data', () => {
      onboardingService.saveFormData(mockEmploymentRecordId, 0, mockFormData);
      onboardingService.clearSavedFormData(mockEmploymentRecordId, 0);
      const savedData = onboardingService.getSavedFormData(mockEmploymentRecordId, 0);
      expect(savedData).toBeNull();
    });

    it('should handle different steps independently', () => {
      const step1Data = { field1: 'value1' };
      const step2Data = { field2: 'value2' };

      onboardingService.saveFormData(mockEmploymentRecordId, 0, step1Data);
      onboardingService.saveFormData(mockEmploymentRecordId, 1, step2Data);

      expect(onboardingService.getSavedFormData(mockEmploymentRecordId, 0)).toEqual(step1Data);
      expect(onboardingService.getSavedFormData(mockEmploymentRecordId, 1)).toEqual(step2Data);
    });
  });

  describe('Clear All Onboarding Data', () => {
    it('should clear all data for an employment record', () => {
      // Save data for multiple steps
      onboardingService.saveStep(mockEmploymentRecordId, 2);
      onboardingService.saveFormData(mockEmploymentRecordId, 0, { field: 'value1' });
      onboardingService.saveFormData(mockEmploymentRecordId, 1, { field: 'value2' });

      // Clear all
      onboardingService.clearAllOnboardingData(mockEmploymentRecordId);

      // Verify everything is cleared
      expect(onboardingService.getSavedStep(mockEmploymentRecordId)).toBe(0);
      expect(onboardingService.getSavedFormData(mockEmploymentRecordId, 0)).toBeNull();
      expect(onboardingService.getSavedFormData(mockEmploymentRecordId, 1)).toBeNull();
    });
  });

  describe('LocalStorage Key Generation', () => {
    it('should use unique keys for different employment records', () => {
      const employmentId1 = 'emp-1';
      const employmentId2 = 'emp-2';

      onboardingService.saveStep(employmentId1, 1);
      onboardingService.saveStep(employmentId2, 2);

      expect(onboardingService.getSavedStep(employmentId1)).toBe(1);
      expect(onboardingService.getSavedStep(employmentId2)).toBe(2);
    });

    it('should use unique keys for different steps', () => {
      onboardingService.saveFormData(mockEmploymentRecordId, 0, { step: 0 });
      onboardingService.saveFormData(mockEmploymentRecordId, 1, { step: 1 });

      const step0Data = onboardingService.getSavedFormData(mockEmploymentRecordId, 0);
      const step1Data = onboardingService.getSavedFormData(mockEmploymentRecordId, 1);

      expect(step0Data).toEqual({ step: 0 });
      expect(step1Data).toEqual({ step: 1 });
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully when saving', () => {
      // Mock localStorage to throw error
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('Storage full');
      });

      // Should not throw
      expect(() => {
        onboardingService.saveStep(mockEmploymentRecordId, 1);
      }).not.toThrow();

      setItemSpy.mockRestore();
    });

    it('should handle localStorage errors gracefully when reading', () => {
      // Mock localStorage to throw error
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
      getItemSpy.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should return default values
      expect(onboardingService.getSavedStep(mockEmploymentRecordId)).toBe(0);
      expect(onboardingService.getSavedFormData(mockEmploymentRecordId, 0)).toBeNull();

      getItemSpy.mockRestore();
    });

    it('should handle invalid JSON in localStorage', () => {
      // Save invalid JSON
      localStorage.setItem('onboarding_data_test_step0', 'invalid json{');

      // Should return null
      const savedData = onboardingService.getSavedFormData('test', 0);
      expect(savedData).toBeNull();
    });
  });
});

