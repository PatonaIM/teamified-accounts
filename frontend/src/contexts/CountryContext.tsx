/**
 * Country Context
 * Manages selected country for multi-region payroll
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Country } from '../types/payroll/payroll.types';
import { getCountries } from '../services/payroll/payrollService';
import { useAuth } from '../hooks/useAuth';

interface CountryContextType {
  selectedCountry: Country | null;
  countries: Country[];
  setSelectedCountry: (country: Country | null) => void;
  loading: boolean;
  error: string | null;
  refreshCountries: () => Promise<void>;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
};

interface CountryProviderProps {
  children: ReactNode;
}

export const CountryProvider: React.FC<CountryProviderProps> = ({ children }) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Check if user has payroll access (only admin, hr, account_manager roles)
  const hasPayrollAccess = user?.roles?.some(role =>
    ['admin', 'hr', 'account_manager'].includes(role)
  ) || false;

  const loadCountries = async () => {
    try {
      setLoading(true);
      setError(null);

      // Only load countries if user has payroll access
      if (!hasPayrollAccess) {
        console.log('User does not have payroll access, skipping countries load');
        setCountries([]);
        setLoading(false);
        return;
      }

      const data = await getCountries();
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.warn('Countries data is not an array:', data);
        setCountries([]);
        setError('Invalid countries data format');
        return;
      }
      
      setCountries(data);
      
      // Auto-select first country if none selected
      if (!selectedCountry && data.length > 0) {
        const savedCountryCode = localStorage.getItem('selectedCountryCode');
        const countryToSelect = savedCountryCode
          ? data.find(c => c.code === savedCountryCode) || data[0]
          : data[0];
        setSelectedCountry(countryToSelect);
      }
    } catch (err: any) {
      // Don't show error for 403 (user might not have access to payroll config)
      if (err?.response?.status === 403) {
        console.log('User does not have access to payroll configuration');
        setCountries([]);
      } else {
        setError('Failed to load countries');
        console.error('Error loading countries:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshCountries = async () => {
    await loadCountries();
  };

  useEffect(() => {
    // Only load countries if user is authenticated and has payroll access
    const token = localStorage.getItem('teamified_access_token');
    if (token && user && hasPayrollAccess) {
      loadCountries();
    }
  }, [user]);

  // Save selected country to localStorage
  useEffect(() => {
    if (selectedCountry) {
      localStorage.setItem('selectedCountryCode', selectedCountry.code);
    }
  }, [selectedCountry]);

  return (
    <CountryContext.Provider
      value={{
        selectedCountry,
        countries,
        setSelectedCountry,
        loading,
        error,
        refreshCountries,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
};

