import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OnboardingStepProfileContact from '../OnboardingStepProfileContact';
import { onboardingService } from '../../../services/onboardingService';
import { authService } from '../../../services/authService';

// Mock services
vi.mock('../../../services/onboardingService');
vi.mock('../../../services/authService');

describe('OnboardingStepProfileContact', () => {
  const mockEmploymentRecordId = 'test-employment-id';
  const mockOnComplete = vi.fn();
  const mockOnError = vi.fn();

  const mockUserInfo = {
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
  };

  const mockEmploymentData = {
    employmentRecords: [
      {
        id: mockEmploymentRecordId,
        clientId: 'test-client-id',
        status: 'onboarding',
      },
    ],
  };

  const mockProfileData = {
    dateOfBirth: '1990-01-01',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
    },
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+0987654321',
      email: 'jane@example.com',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock implementations
    (authService.getUserInfo as any).mockResolvedValue(mockUserInfo);
    (authService.getUserEmployment as any).mockResolvedValue(mockEmploymentData);
    (onboardingService.getProfileData as any).mockResolvedValue(mockProfileData);
    (onboardingService.getSavedFormData as any).mockReturnValue(null);
    (onboardingService.updateProfileData as any).mockResolvedValue(undefined);
  });

  it('should render all form sections', async () => {
    render(
      <OnboardingStepProfileContact
        employmentRecordId={mockEmploymentRecordId}
        onComplete={mockOnComplete}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Residential Address')).toBeInTheDocument();
      expect(screen.getByText('Emergency Contact')).toBeInTheDocument();
    });
  });

  it('should load and display user data', async () => {
    render(
      <OnboardingStepProfileContact
        employmentRecordId={mockEmploymentRecordId}
        onComplete={mockOnComplete}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
      const lastNameInput = screen.getByLabelText(/last name/i) as HTMLInputElement;
      
      expect(firstNameInput.value).toBe('John');
      expect(lastNameInput.value).toBe('Doe');
    });
  });

  it('should validate required fields', async () => {
    render(
      <OnboardingStepProfileContact
        employmentRecordId={mockEmploymentRecordId}
        onComplete={mockOnComplete}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    });

    // Clear first name field
    const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
    fireEvent.change(firstNameInput, { target: { value: '' } });
    fireEvent.blur(firstNameInput);

    // Should trigger validation
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(false);
    });
  });

  it('should validate email format', async () => {
    render(
      <OnboardingStepProfileContact
        employmentRecordId={mockEmploymentRecordId}
        onComplete={mockOnComplete}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
    
    // Invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('should validate phone number format', async () => {
    render(
      <OnboardingStepProfileContact
        employmentRecordId={mockEmploymentRecordId}
        onComplete={mockOnComplete}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^phone number/i)).toBeInTheDocument();
    });

    const phoneInput = screen.getByLabelText(/^phone number/i) as HTMLInputElement;
    
    // Invalid phone
    fireEvent.change(phoneInput, { target: { value: 'invalid' } });
    fireEvent.blur(phoneInput);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument();
    });
  });

  it('should validate date of birth (age requirement)', async () => {
    render(
      <OnboardingStepProfileContact
        employmentRecordId={mockEmploymentRecordId}
        onComplete={mockOnComplete}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    });

    const dobInput = screen.getByLabelText(/date of birth/i) as HTMLInputElement;
    
    // Age < 18 (born yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = yesterday.toISOString().split('T')[0];
    
    fireEvent.change(dobInput, { target: { value: dateString } });
    fireEvent.blur(dobInput);

    await waitFor(() => {
      expect(screen.getByText(/you must be at least 18 years old/i)).toBeInTheDocument();
    });
  });

  it('should call updateProfileData with correct parameters on blur', async () => {
    render(
      <OnboardingStepProfileContact
        employmentRecordId={mockEmploymentRecordId}
        onComplete={mockOnComplete}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    });

    const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.blur(firstNameInput);

    await waitFor(() => {
      expect(onboardingService.updateProfileData).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Jane',
        }),
        mockEmploymentRecordId,
        'test-client-id',
      );
    }, { timeout: 3000 });
  });

  it('should save form data to localStorage on change', async () => {
    vi.useFakeTimers();
    
    render(
      <OnboardingStepProfileContact
        employmentRecordId={mockEmploymentRecordId}
        onComplete={mockOnComplete}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    });

    const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

    // Fast-forward debounce timer
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(onboardingService.saveFormData).toHaveBeenCalledWith(
        mockEmploymentRecordId,
        0,
        expect.objectContaining({
          firstName: 'Jane',
        }),
      );
    });

    vi.useRealTimers();
  });

  it('should mark form as complete when all fields are valid', async () => {
    render(
      <OnboardingStepProfileContact
        employmentRecordId={mockEmploymentRecordId}
        onComplete={mockOnComplete}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    });

    // All fields should be pre-filled with valid data
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(true);
    });
  });
});

