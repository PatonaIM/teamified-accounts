/**
 * Hook to fetch and manage employment countries for the current user
 *
 * This hook fetches the user's employment records and extracts unique countries,
 * which is used to determine which government ID fields should be displayed.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { employmentRecordsService } from '../../../services/employmentRecordsService';
import type { EmploymentRecord } from '../../../types/employmentRecords';

/**
 * Country information extracted from employment records
 */
export interface EmploymentCountry {
  id: string;
  code: string;
  name: string;
  employmentStatus: string;
}

/**
 * Hook return type
 */
export interface UseEmploymentCountriesResult {
  countries: EmploymentCountry[];
  countryCodes: string[];
  isLoading: boolean;
  error: string | null;
  hasEmploymentRecords: boolean;
  hasOnboardingRecord: boolean;
  refetch: () => Promise<void>;
}

/**
 * Extended employment record type with country information
 * (Backend should return this structure after Story 6.1.1 Task 8 completion)
 */
interface EmploymentRecordWithCountry extends EmploymentRecord {
  countryId?: string;
  country?: {
    id: string;
    code: string;
    name: string;
  };
}

/**
 * Fetch and extract unique countries from user's employment records
 *
 * Only includes records with status: 'onboarding', 'active', or 'offboarding'
 * Excludes: 'inactive', 'terminated', 'completed'
 *
 * @param targetUserId - Optional user ID to fetch records for (defaults to logged-in user)
 */
export const useEmploymentCountries = (targetUserId?: string): UseEmploymentCountriesResult => {
  const { user } = useAuth();
  const [countries, setCountries] = useState<EmploymentCountry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use targetUserId if provided, otherwise use logged-in user's ID
  const userIdToFetch = targetUserId || user?.id;

  const fetchEmploymentCountries = async () => {
    if (!userIdToFetch) {
      setIsLoading(false);
      setError('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch user's employment records
      console.log('useEmploymentCountries: Fetching employment records for user:', userIdToFetch);
      const employmentRecords = await employmentRecordsService.getUserEmploymentRecords(
        userIdToFetch
      ) as EmploymentRecordWithCountry[];

      console.log('useEmploymentCountries: Received employment records:', employmentRecords);
      console.log('useEmploymentCountries: Number of records:', employmentRecords.length);

      // Filter for active/onboarding/offboarding records only
      const relevantRecords = employmentRecords.filter(record =>
        ['onboarding', 'active', 'offboarding'].includes(record.status)
      );

      console.log('useEmploymentCountries: Relevant records (onboarding/active/offboarding):', relevantRecords);
      console.log('useEmploymentCountries: Number of relevant records:', relevantRecords.length);

      // Extract unique countries
      const countryMap = new Map<string, EmploymentCountry>();

      relevantRecords.forEach(record => {
        // Check if country information is available (backend update may be pending)
        if (record.country && record.country.code) {
          const { id, code, name } = record.country;

          // Use country code as the key to ensure uniqueness
          if (!countryMap.has(code)) {
            countryMap.set(code, {
              id,
              code,
              name,
              employmentStatus: record.status
            });
          } else {
            // If country already exists, prefer 'active' over 'onboarding' over 'offboarding'
            const existing = countryMap.get(code)!;
            const statusPriority = { active: 3, onboarding: 2, offboarding: 1 };
            const existingPriority = statusPriority[existing.employmentStatus as keyof typeof statusPriority] || 0;
            const currentPriority = statusPriority[record.status as keyof typeof statusPriority] || 0;

            if (currentPriority > existingPriority) {
              countryMap.set(code, {
                id,
                code,
                name,
                employmentStatus: record.status
              });
            }
          }
        }
      });

      const uniqueCountries = Array.from(countryMap.values());
      setCountries(uniqueCountries);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch employment countries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch employment countries');
      setCountries([]);
      setIsLoading(false);
    }
  };

  // Fetch on mount and when target user changes
  useEffect(() => {
    fetchEmploymentCountries();
  }, [userIdToFetch]);

  // Derived values
  const countryCodes = countries.map(c => c.code);
  const hasEmploymentRecords = countries.length > 0;
  const hasOnboardingRecord = countries.some(c => c.employmentStatus === 'onboarding');

  return {
    countries,
    countryCodes,
    isLoading,
    error,
    hasEmploymentRecords,
    hasOnboardingRecord,
    refetch: fetchEmploymentCountries
  };
};

/**
 * Hook variant for a specific employment record ID
 * Useful in onboarding context where we know the specific employment record
 */
export const useEmploymentCountry = (employmentRecordId?: string): {
  country: EmploymentCountry | null;
  isLoading: boolean;
  error: string | null;
} => {
  const [country, setCountry] = useState<EmploymentCountry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountry = async () => {
      if (!employmentRecordId) {
        setCountry(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const record = await employmentRecordsService.getEmploymentRecord(
          employmentRecordId
        ) as EmploymentRecordWithCountry;

        if (record.country && record.country.code) {
          setCountry({
            id: record.country.id,
            code: record.country.code,
            name: record.country.name,
            employmentStatus: record.status
          });
        } else {
          setCountry(null);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch employment record country:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch country information');
        setCountry(null);
        setIsLoading(false);
      }
    };

    fetchCountry();
  }, [employmentRecordId]);

  return { country, isLoading, error };
};
