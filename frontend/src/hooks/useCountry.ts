/**
 * Custom hook for country data and operations
 * Provides country information and lookup utilities
 */

import { useState, useEffect } from 'react';
import api from '../services/api';

interface Country {
  id: string;
  code: string;
  name: string;
  currencyId: string;
  taxYearStartMonth: number;
  isActive: boolean;
}

interface UseCountryReturn {
  countries: Country[];
  loading: boolean;
  error: string | null;
  getCountryByUUID: (uuid: string) => Country | undefined;
  getCountryByCode: (code: string) => Country | undefined;
}

export const useCountry = (): UseCountryReturn => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await api.get<Country[]>('/v1/payroll/configuration/countries');
        setCountries(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch countries:', err);
        setError(err.message || 'Failed to fetch countries');
        // Set default countries if API fails
        setCountries([
          { id: '', code: 'IN', name: 'India', currencyId: '', taxYearStartMonth: 4, isActive: true },
          { id: '', code: 'PH', name: 'Philippines', currencyId: '', taxYearStartMonth: 1, isActive: true },
          { id: '', code: 'AU', name: 'Australia', currencyId: '', taxYearStartMonth: 7, isActive: true },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const getCountryByUUID = (uuid: string): Country | undefined => {
    return countries.find(c => c.id === uuid);
  };

  const getCountryByCode = (code: string): Country | undefined => {
    return countries.find(c => c.code === code);
  };

  return {
    countries,
    loading,
    error,
    getCountryByUUID,
    getCountryByCode,
  };
};
