/**
 * Region Configuration Component Tests
 * Tests CRUD operations, validation, value types, JSON editing, and country context integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RegionConfigurationConfig } from '../RegionConfigurationConfig';
import * as payrollService from '../../../services/payroll/payrollService';
import * as CountryContext from '../../../contexts/CountryContext';
import type { RegionConfiguration, Country } from '../../../types/payroll/payroll.types';

// Mock the payroll service
vi.mock('../../../services/payroll/payrollService', () => ({
  getRegionConfigurations: vi.fn(),
  createRegionConfiguration: vi.fn(),
  updateRegionConfiguration: vi.fn(),
  deleteRegionConfiguration: vi.fn(),
}));

// Mock the useCountry hook
vi.mock('../../../contexts/CountryContext', () => ({
  useCountry: vi.fn(),
}));

describe('RegionConfigurationConfig', () => {
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

  const mockConfigurations: RegionConfiguration[] = [
    {
      id: '1',
      countryId: mockCountry.id,
      configKey: 'min_wage',
      configValue: { amount: 15000, currency: 'INR' },
      description: 'Minimum wage for the region',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      countryId: mockCountry.id,
      configKey: 'pf_rate',
      configValue: { employer: 0.12, employee: 0.12 },
      description: 'Provident Fund contribution rates',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
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

    render(<RegionConfigurationConfig />);
    expect(screen.getByText(/please select a country/i)).toBeInTheDocument();
  });

  it('should load and display configurations on mount', async () => {
    vi.mocked(payrollService.getRegionConfigurations).mockResolvedValue(mockConfigurations);

    render(<RegionConfigurationConfig />);

    await waitFor(() => {
      expect(payrollService.getRegionConfigurations).toHaveBeenCalledWith('IN', true);
    });

    await waitFor(() => {
      expect(screen.getByText('min_wage')).toBeInTheDocument();
      expect(screen.getByText('pf_rate')).toBeInTheDocument();
    });
  });

  it('should show loading state while fetching data', async () => {
    vi.mocked(payrollService.getRegionConfigurations).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockConfigurations), 100))
    );

    render(<RegionConfigurationConfig />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('should show error state when loading fails', async () => {
    vi.mocked(payrollService.getRegionConfigurations).mockRejectedValue(new Error('Failed to load'));

    render(<RegionConfigurationConfig />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load region configurations/i)).toBeInTheDocument();
    });
  });

  it('should open create dialog when Create button is clicked', async () => {
    vi.mocked(payrollService.getRegionConfigurations).mockResolvedValue(mockConfigurations);

    render(<RegionConfigurationConfig />);

    await waitFor(() => {
      expect(screen.getByText('min_wage')).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create configuration/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create Configuration')).toBeInTheDocument();
    });
  });

  it('should create a new string configuration', async () => {
    vi.mocked(payrollService.getRegionConfigurations)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(mockConfigurations);
    vi.mocked(payrollService.createRegionConfiguration).mockResolvedValue(mockConfigurations[0]);

    render(<RegionConfigurationConfig />);

    const createButton = screen.getByRole('button', { name: /create configuration/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const keyInput = screen.getByLabelText(/config key/i);
    const nameInput = screen.getByLabelText(/config name/i);
    const valueInput = screen.getByLabelText(/^config value/i);

    fireEvent.change(keyInput, { target: { value: 'test_config' } });
    fireEvent.change(nameInput, { target: { value: 'Test Configuration' } });
    fireEvent.change(valueInput, { target: { value: 'test value' } });

    const submitButton = screen.getByRole('button', { name: /^create$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(payrollService.createRegionConfiguration).toHaveBeenCalledWith('IN', {
        countryId: mockCountry.id,
        configKey: 'test_config',
        configValue: 'test value',
        description: '',
      });
    });
  });

  it('should validate config key format (alphanumeric + underscores only)', async () => {
    vi.mocked(payrollService.getRegionConfigurations).mockResolvedValue([]);

    render(<RegionConfigurationConfig />);

    const createButton = screen.getByRole('button', { name: /create configuration/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const keyInput = screen.getByLabelText(/config key/i);
    fireEvent.change(keyInput, { target: { value: 'invalid-key!' } });

    const nameInput = screen.getByLabelText(/config name/i);
    fireEvent.change(nameInput, { target: { value: 'Test' } });

    const valueInput = screen.getByLabelText(/^config value/i);
    fireEvent.change(valueInput, { target: { value: 'value' } });

    const submitButton = screen.getByRole('button', { name: /^create$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/config key must contain only letters, numbers, and underscores/i)).toBeInTheDocument();
    });
  });

  it('should validate config key uniqueness', async () => {
    vi.mocked(payrollService.getRegionConfigurations).mockResolvedValue(mockConfigurations);

    render(<RegionConfigurationConfig />);

    await waitFor(() => {
      expect(screen.getByText('min_wage')).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create configuration/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const keyInput = screen.getByLabelText(/config key/i);
    fireEvent.change(keyInput, { target: { value: 'min_wage' } });

    const nameInput = screen.getByLabelText(/config name/i);
    fireEvent.change(nameInput, { target: { value: 'Test' } });

    const valueInput = screen.getByLabelText(/^config value/i);
    fireEvent.change(valueInput, { target: { value: 'value' } });

    const submitButton = screen.getByRole('button', { name: /^create$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/config key already exists for this country/i)).toBeInTheDocument();
    });
  });

  it('should create a number configuration', async () => {
    vi.mocked(payrollService.getRegionConfigurations).mockResolvedValue([]);
    vi.mocked(payrollService.createRegionConfiguration).mockResolvedValue(mockConfigurations[0]);

    render(<RegionConfigurationConfig />);

    const createButton = screen.getByRole('button', { name: /create configuration/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const keyInput = screen.getByLabelText(/config key/i);
    fireEvent.change(keyInput, { target: { value: 'max_hours' } });

    const nameInput = screen.getByLabelText(/config name/i);
    fireEvent.change(nameInput, { target: { value: 'Maximum Hours' } });

    const typeSelect = screen.getByLabelText(/value type/i);
    fireEvent.mouseDown(typeSelect);
    
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const numberOption = within(listbox).getByText('Number');
      fireEvent.click(numberOption);
    });

    const valueInput = screen.getByLabelText(/^config value/i);
    fireEvent.change(valueInput, { target: { value: '40' } });

    const submitButton = screen.getByRole('button', { name: /^create$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(payrollService.createRegionConfiguration).toHaveBeenCalledWith('IN', {
        countryId: mockCountry.id,
        configKey: 'max_hours',
        configValue: 40,
        description: '',
      });
    });
  });

  it('should validate number type values', async () => {
    vi.mocked(payrollService.getRegionConfigurations).mockResolvedValue([]);

    render(<RegionConfigurationConfig />);

    const createButton = screen.getByRole('button', { name: /create configuration/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const typeSelect = screen.getByLabelText(/value type/i);
    fireEvent.mouseDown(typeSelect);
    
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const numberOption = within(listbox).getByText('Number');
      fireEvent.click(numberOption);
    });

    const keyInput = screen.getByLabelText(/config key/i);
    fireEvent.change(keyInput, { target: { value: 'test_num' } });

    const nameInput = screen.getByLabelText(/config name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Number' } });

    const valueInput = screen.getByLabelText(/^config value/i);
    fireEvent.change(valueInput, { target: { value: 'not a number' } });

    const submitButton = screen.getByRole('button', { name: /^create$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/value must be a valid number/i)).toBeInTheDocument();
    });
  });

  it('should create a JSON configuration', async () => {
    vi.mocked(payrollService.getRegionConfigurations).mockResolvedValue([]);
    vi.mocked(payrollService.createRegionConfiguration).mockResolvedValue(mockConfigurations[0]);

    render(<RegionConfigurationConfig />);

    const createButton = screen.getByRole('button', { name: /create configuration/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const keyInput = screen.getByLabelText(/config key/i);
    fireEvent.change(keyInput, { target: { value: 'complex_config' } });

    const nameInput = screen.getByLabelText(/config name/i);
    fireEvent.change(nameInput, { target: { value: 'Complex Configuration' } });

    const typeSelect = screen.getByLabelText(/value type/i);
    fireEvent.mouseDown(typeSelect);
    
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const jsonOption = within(listbox).getByText('JSON');
      fireEvent.click(jsonOption);
    });

    const valueInput = screen.getByLabelText(/^config value/i);
    fireEvent.change(valueInput, { target: { value: '{"key": "value"}' } });

    const submitButton = screen.getByRole('button', { name: /^create$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(payrollService.createRegionConfiguration).toHaveBeenCalledWith('IN', {
        countryId: mockCountry.id,
        configKey: 'complex_config',
        configValue: { key: 'value' },
        description: '',
      });
    });
  });

  it('should validate JSON syntax', async () => {
    vi.mocked(payrollService.getRegionConfigurations).mockResolvedValue([]);

    render(<RegionConfigurationConfig />);

    const createButton = screen.getByRole('button', { name: /create configuration/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const typeSelect = screen.getByLabelText(/value type/i);
    fireEvent.mouseDown(typeSelect);
    
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const jsonOption = within(listbox).getByText('JSON');
      fireEvent.click(jsonOption);
    });

    const keyInput = screen.getByLabelText(/config key/i);
    fireEvent.change(keyInput, { target: { value: 'test_json' } });

    const nameInput = screen.getByLabelText(/config name/i);
    fireEvent.change(nameInput, { target: { value: 'Test JSON' } });

    const valueInput = screen.getByLabelText(/^config value/i);
    fireEvent.change(valueInput, { target: { value: '{invalid json}' } });

    const submitButton = screen.getByRole('button', { name: /^create$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/value must be valid json/i)).toBeInTheDocument();
    });
  });

  it('should filter configurations by search term', async () => {
    vi.mocked(payrollService.getRegionConfigurations).mockResolvedValue(mockConfigurations);

    render(<RegionConfigurationConfig />);

    await waitFor(() => {
      expect(screen.getByText('min_wage')).toBeInTheDocument();
      expect(screen.getByText('pf_rate')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by config key or description/i);
    fireEvent.change(searchInput, { target: { value: 'wage' } });

    await waitFor(() => {
      expect(screen.getByText('min_wage')).toBeInTheDocument();
      expect(screen.queryByText('pf_rate')).not.toBeInTheDocument();
    });
  });

  it('should open edit dialog with pre-filled data', async () => {
    vi.mocked(payrollService.getRegionConfigurations).mockResolvedValue(mockConfigurations);

    render(<RegionConfigurationConfig />);

    await waitFor(() => {
      expect(screen.getByText('min_wage')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Edit Configuration')).toBeInTheDocument();
    });

    const keyInput = screen.getByLabelText(/config key/i) as HTMLInputElement;
    expect(keyInput.value).toBe('min_wage');
    expect(keyInput).toBeDisabled(); // Key should be disabled in edit mode
  });

  it('should update an existing configuration', async () => {
    vi.mocked(payrollService.getRegionConfigurations).mockResolvedValue(mockConfigurations);
    vi.mocked(payrollService.updateRegionConfiguration).mockResolvedValue(mockConfigurations[0]);

    render(<RegionConfigurationConfig />);

    await waitFor(() => {
      expect(screen.getByText('min_wage')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });

    const updateButton = screen.getByRole('button', { name: /update/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(payrollService.updateRegionConfiguration).toHaveBeenCalledWith('IN', '1', expect.objectContaining({
        description: 'Updated description',
      }));
    });
  });

  it('should delete a configuration', async () => {
    vi.mocked(payrollService.getRegionConfigurations)
      .mockResolvedValueOnce(mockConfigurations)
      .mockResolvedValueOnce([mockConfigurations[0]]);
    vi.mocked(payrollService.deleteRegionConfiguration).mockResolvedValue();

    render(<RegionConfigurationConfig />);

    await waitFor(() => {
      expect(screen.getByText('min_wage')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/are you sure you want to delete configuration "min_wage"/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /^delete$/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(payrollService.deleteRegionConfiguration).toHaveBeenCalledWith('IN', '1');
    });
  });

  it('should reload configurations when country changes', async () => {
    const { rerender } = render(<RegionConfigurationConfig />);

    await waitFor(() => {
      expect(payrollService.getRegionConfigurations).toHaveBeenCalledWith('IN', true);
    });

    vi.clearAllMocks();

    const newMockCountry = { ...mockCountry, code: 'US', name: 'United States' };
    vi.mocked(CountryContext.useCountry).mockReturnValue({
      ...mockCountryContextValue,
      selectedCountry: newMockCountry,
    });

    rerender(<RegionConfigurationConfig />);

    await waitFor(() => {
      expect(payrollService.getRegionConfigurations).toHaveBeenCalledWith('US', true);
    });
  });

  it('should show empty state when no configurations exist', async () => {
    vi.mocked(payrollService.getRegionConfigurations).mockResolvedValue([]);

    render(<RegionConfigurationConfig />);

    await waitFor(() => {
      expect(screen.getByText(/no configurations found/i)).toBeInTheDocument();
    });
  });
});

