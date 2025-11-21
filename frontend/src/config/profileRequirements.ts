/**
 * Profile Requirements Configuration
 *
 * Defines which fields are required in different contexts:
 * - Onboarding: Strict requirements for new candidates
 * - Profile: Lenient requirements for existing users editing their profile
 */

export interface RequiredFieldsConfig {
  core: string[];
  personal: string[];
  address: string[];
  emergency: string[];
  governmentIds: string[];
  banking: string[];
}

/**
 * Required fields for onboarding completion
 * Candidates must complete all these fields before proceeding to document upload
 */
export const ONBOARDING_REQUIRED_FIELDS: RequiredFieldsConfig = {
  core: [
    'firstName',
    'lastName',
    'dateOfBirth',
  ],
  personal: [
    'personalMobile',
    'personalEmail',
  ],
  address: [
    'addressLine1',
    'city',
    'stateProvince',
    'postalCode',
    'country',
  ],
  emergency: [
    'emergencyContacts', // At least one emergency contact required
  ],
  governmentIds: [], // Optional during onboarding
  banking: [], // Optional during onboarding
};

/**
 * Required fields for regular profile editing
 * Minimal requirements for existing users
 */
export const PROFILE_REQUIRED_FIELDS: RequiredFieldsConfig = {
  core: [
    'firstName',
    'lastName',
  ],
  personal: [],
  address: [],
  emergency: [],
  governmentIds: [],
  banking: [],
};

/**
 * Check if a field is required based on the current mode
 */
export const isFieldRequired = (
  fieldName: string,
  tabName: keyof RequiredFieldsConfig,
  mode: 'onboarding' | 'full' = 'full'
): boolean => {
  const config = mode === 'onboarding' ? ONBOARDING_REQUIRED_FIELDS : PROFILE_REQUIRED_FIELDS;
  return config[tabName]?.includes(fieldName) || false;
};

/**
 * Get all required fields for a specific tab and mode
 */
export const getRequiredFieldsForTab = (
  tabName: keyof RequiredFieldsConfig,
  mode: 'onboarding' | 'full' = 'full'
): string[] => {
  const config = mode === 'onboarding' ? ONBOARDING_REQUIRED_FIELDS : PROFILE_REQUIRED_FIELDS;
  return config[tabName] || [];
};

/**
 * Helper text to show in onboarding mode
 */
export const ONBOARDING_HELPER_TEXT = 'Required for onboarding completion';
export const PROFILE_HELPER_TEXT = 'Recommended';
