/**
 * Country-Specific Component Type Mappings
 * 
 * This configuration defines which salary and statutory component types
 * are applicable for each country, ensuring proper multi-region compliance.
 */

import { StatutoryComponentType } from '../types/payroll/payroll.types';

/**
 * Maps country codes to their applicable statutory component types
 */
export const COUNTRY_STATUTORY_COMPONENTS: Record<string, StatutoryComponentType[]> = {
  // India - EPF, ESI, PT, TDS
  'IN': [
    StatutoryComponentType.EPF,
    StatutoryComponentType.ESI,
    StatutoryComponentType.PT,
    StatutoryComponentType.TDS,
  ],
  
  // Philippines - SSS, PhilHealth, Pag-IBIG
  'PH': [
    StatutoryComponentType.SSS,
    StatutoryComponentType.PHILHEALTH,
    StatutoryComponentType.PAGIBIG,
  ],
  
  // Australia - Superannuation
  'AU': [
    StatutoryComponentType.SUPERANNUATION,
  ],
  
  // Malaysia - EPF, SOCSO, EIS
  'MY': [
    StatutoryComponentType.EPF_MY,
    StatutoryComponentType.SOCSO,
    StatutoryComponentType.EIS,
  ],
  
  // Singapore - CPF
  'SG': [
    StatutoryComponentType.CPF,
  ],
};

/**
 * Gets the applicable statutory component types for a given country code
 * @param countryCode - ISO country code (e.g., 'IN', 'PH', 'AU')
 * @returns Array of applicable statutory component types, or empty array if country not found
 */
export const getStatutoryComponentsForCountry = (countryCode: string): StatutoryComponentType[] => {
  return COUNTRY_STATUTORY_COMPONENTS[countryCode] || [];
};

/**
 * Checks if a statutory component type is applicable for a given country
 * @param countryCode - ISO country code
 * @param componentType - Statutory component type to check
 * @returns true if the component type is applicable for the country
 */
export const isStatutoryComponentApplicable = (
  countryCode: string,
  componentType: StatutoryComponentType
): boolean => {
  const applicableComponents = getStatutoryComponentsForCountry(countryCode);
  return applicableComponents.includes(componentType);
};

/**
 * Note: Salary components (earnings, deductions, benefits, reimbursements) 
 * are generally applicable across all countries as they represent basic 
 * compensation structures. Country-specific rules are enforced at the 
 * calculation level rather than at the component type level.
 */

