/**
 * Tax Year Configuration Component Tests
 * Tests CRUD operations, validation, error handling, and country context integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaxYearConfig } from '../TaxYearConfig';
import * as payrollService from '../../../services/payroll/payrollService';
import * as CountryContext from '../../../contexts/CountryContext';
import type { TaxYear, Country } from '../../../types/payroll/payroll.types';

// Mock the payroll service
vi.mock('../../../services/payroll/payrollService', () => ({
  getTaxYears: vi.fn(),
  createTaxYear: vi.fn(),
  updateTaxYear: vi.fn(),
  deleteTaxYear: vi.fn(),
}));

// Mock the useCountry hook
vi.mock('../../../contexts/CountryContext', () => ({
  useCountry: vi.fn(),
}));

describe('TaxYearConfig', () => {
  const mockCountry: Country = {
    id: '650e8400-e29b-41d4-a716-ac814163053b',
    code: 'IN',
    name: 'India',
    currencyId: '750e8400-e29b-41d4-a716-ac814163053b',
    currency: {
      id: '750e8400-e29b-41d4-a716-ac814163053b',
      code: 'INR',
      name: 'Indian Rupee',
      symbol: '₹',
      decimalPlaces: 2,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    taxYearStartMonth: 4,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockTaxYears: TaxYear[] = [
    {
      id: '1',
      countryId: mockCountry.id,
      year: 2024,
      startDate: '2024-04-01T00:00:00.000Z',
      endDate: '2025-03-31T00:00:00.000Z',
      isCurrent: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      countryId: mockCountry.id,
      year: 2023,
      startDate: '2023-04-01T00:00:00.000Z',
      endDate: '2024-03-31T00:00:00.000Z',
      isCurrent: false,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    },
  ];

  const mockCountryContextValue = {
    selectedCountry: mockCountry,
    countries: [mockCountry],
    loading: false,
    error: null,
    setSelectedCountry: vi.fn(),
    refreshCountries: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CountryContext.useCountry).mockReturnValue(mockCountryContextValue);
  });

  it('should show info message when no country is selected', () => {
    vi.mocked(CountryContext.useCountry).mockReturnValue({
      ...mockCountryContextValue,
      selectedCountry: null,
    });

    render(<TaxYearConfig />);
    expect(screen.getByText(/please select a country/i)).toBeInTheDocument();
  });

  it('should load and display tax years on mount', async () => {
    vi.mocked(payrollService.getTaxYears).mockResolvedValue(mockTaxYears);

    render(<TaxYearConfig />);

    await waitFor(() => {
      expect(payrollService.getTaxYears).toHaveBeenCalledWith('IN');
    });

    await waitFor(() => {
      expect(screen.getByText('2024')).toBeInTheDocument();
      expect(screen.getByText('2023')).toBeInTheDocument();
    });
  });

  it('should display current tax year indicator', async () => {
    vi.mocked(payrollService.getTaxYears).mockResolvedValue(mockTaxYears);

    render(<TaxYearConfig />);

    await waitFor(() => {
      expect(screen.getByText('Current')).toBeInTheDocument();
    });
  });

  it('should show loading state while fetching data', async () => {
    vi.mocked(payrollService.getTaxYears).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockTaxYears), 100))
    );

    render(<TaxYearConfig />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('should show error state when loading fails', async () => {
    vi.mocked(payrollService.getTaxYears).mockRejectedValue(new Error('Failed to load'));

    render(<TaxYearConfig />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load tax years/i)).toBeInTheDocument();
    });
  });

  it('should open create dialog when Create button is clicked', async () => {
    vi.mocked(payrollService.getTaxYears).mockResolvedValue(mockTaxYears);

    render(<TaxYearConfig />);

    await waitFor(() => {
      expect(screen.getByText('2024')).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create tax year/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create Tax Year')).toBeInTheDocument();
    });
  });

  it('should create a new tax year', async () => {
    vi.mocked(payrollService.getTaxYears)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(mockTaxYears);
    vi.mocked(payrollService.createTaxYear).mockResolvedValue(mockTaxYears[0]);

    render(<TaxYearConfig />);

    const createButton = screen.getByRole('button', { name: /create tax year/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const yearInput = screen.getByLabelText(/year/i);
    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    fireEvent.change(yearInput, { target: { value: '2025' } });
    fireEvent.change(startDateInput, { target: { value: '2025-04-01' } });
    fireEvent.change(endDateInput, { target: { value: '2026-03-31' } });

    const submitButton = screen.getByRole('button', { name: /^create$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(payrollService.createTaxYear).toHaveBeenCalledWith('IN', {
        countryId: mockCountry.id,
        year: 2025,
        startDate: '2025-04-01',
        endDate: '2026-03-31',
        isCurrent: false,
      });
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should validate year must be >= current year', async () => {
    vi.mocked(payrollService.getTaxYears).mockResolvedValue([]);

    render(<TaxYearConfig />);

    const createButton = screen.getByRole('button', { name: /create tax year/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const yearInput = screen.getByLabelText(/year/i);
    fireEvent.change(yearInput, { target: { value: '2020' } });

    const submitButton = screen.getByRole('button', { name: /^create$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(payrollService.createTaxYear).not.toHaveBeenCalled();
    });
  });

  it('should validate end date must be after start date', async () => {
    vi.mocked(payrollService.getTaxYears).mockResolvedValue([]);

    render(<TaxYearConfig />);

    const createButton = screen.getByRole('button', { name: /create tax year/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    fireEvent.change(startDateInput, { target: { value: '2025-12-31' } });
    fireEvent.change(endDateInput, { target: { value: '2025-01-01' } });

    const submitButton = screen.getByRole('button', { name: /^create$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/end date must be after start date/i)).toBeInTheDocument();
    });
  });

  it('should open edit dialog with pre-filled data', async () => {
    vi.mocked(payrollService.getTaxYears).mockResolvedValue(mockTaxYears);

    render(<TaxYearConfig />);

    await waitFor(() => {
      expect(screen.getByText('2024')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Edit Tax Year')).toBeInTheDocument();
    });

    const yearInput = screen.getByLabelText(/year/i) as HTMLInputElement;
    expect(yearInput.value).toBe('2024');
  });

  it('should update an existing tax year', async () => {
    vi.mocked(payrollService.getTaxYears).mockResolvedValue(mockTaxYears);
    vi.mocked(payrollService.updateTaxYear).mockResolvedValue(mockTaxYears[0]);

    render(<TaxYearConfig />);

    await waitFor(() => {
      expect(screen.getByText('2024')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const yearInput = screen.getByLabelText(/year/i);
    fireEvent.change(yearInput, { target: { value: '2025' } });

    const updateButton = screen.getByRole('button', { name: /update/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(payrollService.updateTaxYear).toHaveBeenCalledWith('IN', '1', expect.objectContaining({
        year: 2025,
      }));
    });
  });

  it('should open delete confirmation dialog', async () => {
    vi.mocked(payrollService.getTaxYears).mockResolvedValue(mockTaxYears);

    render(<TaxYearConfig />);

    await waitFor(() => {
      expect(screen.getByText('2023')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[1]); // Click delete for 2023 (not current)

    await waitFor(() => {
      expect(screen.getByText(/are you sure you want to delete tax year 2023/i)).toBeInTheDocument();
    });
  });

  it('should delete a tax year', async () => {
    vi.mocked(payrollService.getTaxYears)
      .mockResolvedValueOnce(mockTaxYears)
      .mockResolvedValueOnce([mockTaxYears[0]]);
    vi.mocked(payrollService.deleteTaxYear).mockResolvedValue();

    render(<TaxYearConfig />);

    await waitFor(() => {
      expect(screen.getByText('2023')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[1]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /^delete$/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(payrollService.deleteTaxYear).toHaveBeenCalledWith('IN', '2');
    });
  });

  it('should disable delete button for current tax year', async () => {
    vi.mocked(payrollService.getTaxYears).mockResolvedValue(mockTaxYears);

    render(<TaxYearConfig />);

    await waitFor(() => {
      expect(screen.getByText('2024')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons[0]).toBeDisabled(); // First row is current year
  });

  it('should reload tax years when country changes', async () => {
    const { rerender } = render(<TaxYearConfig />);

    await waitFor(() => {
      expect(payrollService.getTaxYears).toHaveBeenCalledWith('IN');
    });

    vi.clearAllMocks();

    const newMockCountry = { ...mockCountry, code: 'US', name: 'United States' };
    vi.mocked(CountryContext.useCountry).mockReturnValue({
      ...mockCountryContextValue,
      selectedCountry: newMockCountry,
    });

    rerender(<TaxYearConfig />);

    await waitFor(() => {
      expect(payrollService.getTaxYears).toHaveBeenCalledWith('US');
    });
  });

  it('should show empty state when no tax years exist', async () => {
    vi.mocked(payrollService.getTaxYears).mockResolvedValue([]);

    render(<TaxYearConfig />);

    await waitFor(() => {
      expect(screen.getByText(/no tax years configured/i)).toBeInTheDocument();
    });
  });
});

