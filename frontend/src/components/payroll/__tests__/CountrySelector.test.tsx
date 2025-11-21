import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CountrySelector from '../CountrySelector';
import { CountryProvider } from '../../../contexts/CountryContext';
import * as payrollService from '../../../services/payroll/payrollService';

// Mock the payroll service
vi.mock('../../../services/payroll/payrollService', () => ({
  getAllCountries: vi.fn(),
}));

const mockCountries = [
  {
    id: 'india-id',
    code: 'IN',
    name: 'India',
    currencyId: 'inr-id',
    taxYearStartMonth: 4,
    isActive: true,
    currency: { id: 'inr-id', code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalPlaces: 2, isActive: true },
  },
  {
    id: 'philippines-id',
    code: 'PH',
    name: 'Philippines',
    currencyId: 'php-id',
    taxYearStartMonth: 1,
    isActive: true,
    currency: { id: 'php-id', code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimalPlaces: 2, isActive: true },
  },
  {
    id: 'australia-id',
    code: 'AU',
    name: 'Australia',
    currencyId: 'aud-id',
    taxYearStartMonth: 7,
    isActive: true,
    currency: { id: 'aud-id', code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalPlaces: 2, isActive: true },
  },
];

describe('CountrySelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(payrollService.getAllCountries).mockResolvedValue(mockCountries);
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<CountryProvider>{component}</CountryProvider>);
  };

  it('should render country selector', async () => {
    renderWithProvider(<CountrySelector />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/select country/i)).toBeInTheDocument();
    });
  });

  it('should load and display countries', async () => {
    renderWithProvider(<CountrySelector />);
    
    await waitFor(() => {
      expect(payrollService.getAllCountries).toHaveBeenCalled();
    });

    const select = screen.getByLabelText(/select country/i);
    fireEvent.mouseDown(select);

    await waitFor(() => {
      expect(screen.getByText('India')).toBeInTheDocument();
      expect(screen.getByText('Philippines')).toBeInTheDocument();
      expect(screen.getByText('Australia')).toBeInTheDocument();
    });
  });

  it('should select first country by default', async () => {
    renderWithProvider(<CountrySelector />);
    
    await waitFor(() => {
      expect(screen.getByText('India')).toBeInTheDocument();
    });
  });

  it('should change selected country on selection', async () => {
    renderWithProvider(<CountrySelector />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/select country/i)).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/select country/i);
    fireEvent.mouseDown(select);

    await waitFor(() => {
      expect(screen.getByText('Philippines')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Philippines'));

    await waitFor(() => {
      expect(screen.getByDisplayValue('philippines-id')).toBeInTheDocument();
    });
  });

  it('should persist selected country to localStorage', async () => {
    renderWithProvider(<CountrySelector />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/select country/i)).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/select country/i);
    fireEvent.mouseDown(select);

    await waitFor(() => {
      expect(screen.getByText('Philippines')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Philippines'));

    await waitFor(() => {
      const stored = localStorage.getItem('selectedCountryId');
      expect(stored).toBe('philippines-id');
    });
  });

  it('should restore country from localStorage on mount', async () => {
    localStorage.setItem('selectedCountryId', 'australia-id');

    renderWithProvider(<CountrySelector />);
    
    await waitFor(() => {
      expect(screen.getByText('Australia')).toBeInTheDocument();
    });
  });

  it('should show country flag icons', async () => {
    renderWithProvider(<CountrySelector />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/select country/i)).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/select country/i);
    fireEvent.mouseDown(select);

    await waitFor(() => {
      // Check for flag emojis or icons
      expect(screen.getByText(/🇮🇳/)).toBeInTheDocument(); // India
      expect(screen.getByText(/🇵🇭/)).toBeInTheDocument(); // Philippines
      expect(screen.getByText(/🇦🇺/)).toBeInTheDocument(); // Australia
    });
  });

  it('should display currency code with country name', async () => {
    renderWithProvider(<CountrySelector />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/select country/i)).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/select country/i);
    fireEvent.mouseDown(select);

    await waitFor(() => {
      expect(screen.getByText(/INR/)).toBeInTheDocument();
      expect(screen.getByText(/PHP/)).toBeInTheDocument();
      expect(screen.getByText(/AUD/)).toBeInTheDocument();
    });
  });

  it('should handle API error gracefully', async () => {
    vi.mocked(payrollService.getAllCountries).mockRejectedValue(new Error('API Error'));

    renderWithProvider(<CountrySelector />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading countries/i)).toBeInTheDocument();
    });
  });

  it('should show loading state while fetching countries', () => {
    vi.mocked(payrollService.getAllCountries).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithProvider(<CountrySelector />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should disable selector when disabled prop is true', async () => {
    renderWithProvider(<CountrySelector disabled={true} />);
    
    await waitFor(() => {
      const select = screen.getByLabelText(/select country/i);
      expect(select).toBeDisabled();
    });
  });

  it('should apply custom className', async () => {
    const { container } = renderWithProvider(<CountrySelector className="custom-class" />);
    
    await waitFor(() => {
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  it('should show only active countries', async () => {
    const countriesWithInactive = [
      ...mockCountries,
      {
        id: 'inactive-id',
        code: 'XX',
        name: 'Inactive Country',
        currencyId: 'xxx-id',
        taxYearStartMonth: 1,
        isActive: false,
        currency: { id: 'xxx-id', code: 'XXX', name: 'Inactive Currency', symbol: 'X', decimalPlaces: 2, isActive: false },
      },
    ];

    vi.mocked(payrollService.getAllCountries).mockResolvedValue(countriesWithInactive);

    renderWithProvider(<CountrySelector />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/select country/i)).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/select country/i);
    fireEvent.mouseDown(select);

    await waitFor(() => {
      expect(screen.getByText('India')).toBeInTheDocument();
      expect(screen.queryByText('Inactive Country')).not.toBeInTheDocument();
    });
  });

  it('should trigger onChange callback when country changes', async () => {
    const onChangeMock = vi.fn();
    
    renderWithProvider(<CountrySelector onChange={onChangeMock} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/select country/i)).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/select country/i);
    fireEvent.mouseDown(select);

    await waitFor(() => {
      expect(screen.getByText('Philippines')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Philippines'));

    await waitFor(() => {
      expect(onChangeMock).toHaveBeenCalledWith(mockCountries[1]);
    });
  });
});

