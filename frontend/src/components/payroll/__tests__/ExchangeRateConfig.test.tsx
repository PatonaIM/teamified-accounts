/**
 * Exchange Rate Configuration Component Tests
 * Tests CRUD operations, validation, currency filtering, and reverse rate calculation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExchangeRateConfig } from '../ExchangeRateConfig';
import * as payrollService from '../../../services/payroll/payrollService';
import type { Currency, ExchangeRate } from '../../../types/payroll/payroll.types';

// Mock the payroll service
vi.mock('../../../services/payroll/payrollService', () => ({
  getCurrencies: vi.fn(),
  getExchangeRatePair: vi.fn(),
  createExchangeRate: vi.fn(),
  updateExchangeRate: vi.fn(),
  deleteExchangeRate: vi.fn(),
}));

// Mock the useCountry hook (not needed for ExchangeRateConfig, but for consistency)
vi.mock('../../../contexts/CountryContext', () => ({
  useCountry: vi.fn(() => ({
    selectedCountry: null,
    countries: [],
    loading: false,
    error: null,
    setSelectedCountry: vi.fn(),
    refreshCountries: vi.fn(),
  })),
}));

describe('ExchangeRateConfig', () => {
  const mockCurrencies: Currency[] = [
    {
      id: 'curr-1',
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      decimalPlaces: 2,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'curr-2',
      code: 'INR',
      name: 'Indian Rupee',
      symbol: '₹',
      decimalPlaces: 2,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'curr-3',
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      decimalPlaces: 2,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  const mockExchangeRates: ExchangeRate[] = [
    {
      id: 'rate-1',
      fromCurrencyId: 'curr-1',
      toCurrencyId: 'curr-2',
      rate: 83.5,
      effectiveDate: '2024-01-01T00:00:00.000Z',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'rate-2',
      fromCurrencyId: 'curr-1',
      toCurrencyId: 'curr-3',
      rate: 0.92,
      effectiveDate: '2024-01-01T00:00:00.000Z',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(payrollService.getCurrencies).mockResolvedValue(mockCurrencies);
    vi.mocked(payrollService.getExchangeRatePair).mockResolvedValue([]);
  });

  it('should load and display currencies on mount', async () => {
    render(<ExchangeRateConfig />);

    await waitFor(() => {
      expect(payrollService.getCurrencies).toHaveBeenCalled();
    });
  });

  it('should load and display exchange rates', async () => {
    vi.mocked(payrollService.getExchangeRatePair)
      .mockResolvedValueOnce([mockExchangeRates[0]])
      .mockResolvedValue([]);

    render(<ExchangeRateConfig />);

    await waitFor(() => {
      expect(screen.getByText('83.500000')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should show loading state while fetching data', async () => {
    vi.mocked(payrollService.getCurrencies).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockCurrencies), 100))
    );

    render(<ExchangeRateConfig />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should open create dialog when Create button is clicked', async () => {
    render(<ExchangeRateConfig />);

    await waitFor(() => {
      expect(payrollService.getCurrencies).toHaveBeenCalled();
    });

    const createButton = screen.getByRole('button', { name: /create exchange rate/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create Exchange Rate')).toBeInTheDocument();
    });
  });

  it('should create a new exchange rate', async () => {
    vi.mocked(payrollService.createExchangeRate).mockResolvedValue(mockExchangeRates[0]);

    render(<ExchangeRateConfig />);

    await waitFor(() => {
      expect(payrollService.getCurrencies).toHaveBeenCalled();
    });

    const createButton = screen.getByRole('button', { name: /create exchange rate/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Get all select elements
    const selects = screen.getAllByRole('combobox');
    
    // Open and select from currency (first select)
    fireEvent.mouseDown(selects[0]);
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const usdOption = within(listbox).getByText(/USD - US Dollar/);
      fireEvent.click(usdOption);
    });

    // Open and select to currency (second select)
    fireEvent.mouseDown(selects[1]);
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const inrOption = within(listbox).getByText(/INR - Indian Rupee/);
      fireEvent.click(inrOption);
    });

    const rateInput = screen.getByLabelText(/exchange rate/i);
    fireEvent.change(rateInput, { target: { value: '83.5' } });

    const dateInput = screen.getByLabelText(/effective date/i);
    fireEvent.change(dateInput, { target: { value: '2024-01-01' } });

    const submitButton = screen.getByRole('button', { name: /^create$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(payrollService.createExchangeRate).toHaveBeenCalledWith({
        fromCurrencyId: 'curr-1',
        toCurrencyId: 'curr-2',
        rate: 83.5,
        effectiveDate: '2024-01-01',
      });
    });
  });

  it('should validate rate must be greater than 0', async () => {
    render(<ExchangeRateConfig />);

    await waitFor(() => {
      expect(payrollService.getCurrencies).toHaveBeenCalled();
    });

    const createButton = screen.getByRole('button', { name: /create exchange rate/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const rateInput = screen.getByLabelText(/exchange rate/i);
    fireEvent.change(rateInput, { target: { value: '0' } });

    const submitButton = screen.getByRole('button', { name: /^create$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/rate must be greater than 0/i)).toBeInTheDocument();
    });
  });

  it('should validate from and to currencies must be different', async () => {
    render(<ExchangeRateConfig />);

    await waitFor(() => {
      expect(payrollService.getCurrencies).toHaveBeenCalled();
    });

    const createButton = screen.getByRole('button', { name: /create exchange rate/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Get all select elements
    const selects = screen.getAllByRole('combobox');
    
    // Select same currency for both
    fireEvent.mouseDown(selects[0]);
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const usdOption = within(listbox).getByText(/USD - US Dollar/);
      fireEvent.click(usdOption);
    });

    fireEvent.mouseDown(selects[1]);
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const usdOption = within(listbox).getByText(/USD - US Dollar/);
      fireEvent.click(usdOption);
    });

    const rateInput = screen.getByLabelText(/exchange rate/i);
    fireEvent.change(rateInput, { target: { value: '1' } });

    const submitButton = screen.getByRole('button', { name: /^create$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/to currency must be different from from currency/i)).toBeInTheDocument();
    });
  });

  it('should display reverse rate calculation', async () => {
    render(<ExchangeRateConfig />);

    await waitFor(() => {
      expect(payrollService.getCurrencies).toHaveBeenCalled();
    });

    const createButton = screen.getByRole('button', { name: /create exchange rate/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    
    fireEvent.mouseDown(selects[0]);
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const usdOption = within(listbox).getByText(/USD - US Dollar/);
      fireEvent.click(usdOption);
    });

    fireEvent.mouseDown(selects[1]);
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const inrOption = within(listbox).getByText(/INR - Indian Rupee/);
      fireEvent.click(inrOption);
    });

    const rateInput = screen.getByLabelText(/exchange rate/i);
    fireEvent.change(rateInput, { target: { value: '83.5' } });

    await waitFor(() => {
      // Reverse rate should be displayed (1 / 83.5 = 0.011976)
      expect(screen.getByText(/reverse rate/i)).toBeInTheDocument();
    });
  });

  it('should filter exchange rates by from currency', async () => {
    vi.mocked(payrollService.getExchangeRatePair)
      .mockResolvedValueOnce([mockExchangeRates[0]])
      .mockResolvedValueOnce([mockExchangeRates[1]])
      .mockResolvedValue([]);

    render(<ExchangeRateConfig />);

    await waitFor(() => {
      expect(screen.getByText('83.500000')).toBeInTheDocument();
    }, { timeout: 3000 });

    const filterSelects = screen.getAllByRole('combobox');
    const fromCurrencyFilter = filterSelects[0];

    fireEvent.mouseDown(fromCurrencyFilter);
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const usdOption = within(listbox).getByText(/USD - US Dollar/);
      fireEvent.click(usdOption);
    });

    // Should only show rates with USD as from currency
    await waitFor(() => {
      expect(screen.getByText('83.500000')).toBeInTheDocument();
    });
  });

  it('should open edit dialog with pre-filled data', async () => {
    vi.mocked(payrollService.getExchangeRatePair)
      .mockResolvedValueOnce([mockExchangeRates[0]])
      .mockResolvedValue([]);

    render(<ExchangeRateConfig />);

    await waitFor(() => {
      expect(screen.getByText('83.500000')).toBeInTheDocument();
    }, { timeout: 3000 });

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Edit Exchange Rate')).toBeInTheDocument();
    });

    const rateInput = screen.getByLabelText(/exchange rate/i) as HTMLInputElement;
    expect(rateInput.value).toBe('83.5');
  });

  it('should update an existing exchange rate', async () => {
    vi.mocked(payrollService.getExchangeRatePair)
      .mockResolvedValueOnce([mockExchangeRates[0]])
      .mockResolvedValue([]);
    vi.mocked(payrollService.updateExchangeRate).mockResolvedValue(mockExchangeRates[0]);

    render(<ExchangeRateConfig />);

    await waitFor(() => {
      expect(screen.getByText('83.500000')).toBeInTheDocument();
    }, { timeout: 3000 });

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const rateInput = screen.getByLabelText(/exchange rate/i);
    fireEvent.change(rateInput, { target: { value: '84' } });

    const updateButton = screen.getByRole('button', { name: /update/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(payrollService.updateExchangeRate).toHaveBeenCalledWith('rate-1', expect.objectContaining({
        rate: 84,
      }));
    });
  });

  it('should delete an exchange rate', async () => {
    vi.mocked(payrollService.getExchangeRatePair)
      .mockResolvedValueOnce([mockExchangeRates[0]])
      .mockResolvedValueOnce([])
      .mockResolvedValue([]);
    vi.mocked(payrollService.deleteExchangeRate).mockResolvedValue();

    render(<ExchangeRateConfig />);

    await waitFor(() => {
      expect(screen.getByText('83.500000')).toBeInTheDocument();
    }, { timeout: 3000 });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/are you sure you want to delete this exchange rate/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /^delete$/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(payrollService.deleteExchangeRate).toHaveBeenCalledWith('rate-1');
    });
  });

  it('should show empty state when no exchange rates exist', async () => {
    render(<ExchangeRateConfig />);

    await waitFor(() => {
      expect(screen.getByText(/no exchange rates configured/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should display active status chip', async () => {
    vi.mocked(payrollService.getExchangeRatePair)
      .mockResolvedValueOnce([mockExchangeRates[0]])
      .mockResolvedValue([]);

    render(<ExchangeRateConfig />);

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

