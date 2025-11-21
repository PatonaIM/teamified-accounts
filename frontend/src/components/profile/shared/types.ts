/**
 * Shared TypeScript types for profile components
 *
 * Centralized type definitions for Profile page and Onboarding wizard
 */

import type { ProfileData as BaseProfileData } from '../../../utils/profileCompletion';

/**
 * Re-export ProfileData from utility
 */
export type ProfileData = BaseProfileData;

/**
 * Address information
 */
export interface Address {
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
}

/**
 * Emergency Contact
 */
export interface EmergencyContact {
  id?: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  address: string;
  isPrimary?: boolean;
}

/**
 * Government ID values stored in profile_data JSONB
 * Keys match field names from countryFieldsConfig
 */
export interface GovernmentIDValues {
  // India
  pan?: string;
  aadhaar?: string;
  pfNumber?: string;
  uan?: string;

  // Philippines
  sss?: string;
  philhealth?: string;
  pagibig?: string;

  // Sri Lanka
  nic?: string;

  // Australia
  tfn?: string;
  abn?: string;

  // United States
  ssn?: string;
  ein?: string;

  // United Kingdom
  nino?: string;
  utr?: string;

  // Canada
  sin?: string;
  bn?: string;

  // Common
  tin?: string;
  nationalId?: string;

  // Any other dynamic fields
  [key: string]: string | undefined;
}

/**
 * Banking information
 */
export interface BankingInfo {
  bankAccountNumber: string;
  ifscCode: string;
  paymentMode: string;
  bankName: string;
  accountType: string;
  bankHolderName: string;
  iban?: string;
  swiftCode?: string;
  routingNumber?: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
  languagePreference: string;
  communicationPreferences: string[];
  notificationSettings: string[];
  workPhone: string;
  extension: string;
  seatingLocation: string;
  personalMobile: string;
  personalEmail: string;
  linkedinUrl: string;
  bloodGroup: string;
  personalDescription: string;
  expertise: string;
}

/**
 * Tab names for profile sections
 */
export type ProfileTabName =
  | 'core'
  | 'personal'
  | 'address'
  | 'governmentIds'
  | 'emergency'
  | 'banking'
  | 'documents'
  | 'preferences'
  | 'rolesPermissions';

/**
 * Mode for ProfileTabsManager
 */
export type ProfileMode = 'full' | 'onboarding';

/**
 * Configuration for which tabs to show
 */
export interface TabConfiguration {
  includeTabs?: ProfileTabName[];
  excludeTabs?: ProfileTabName[];
}

/**
 * Common props for all tab components
 */
export interface BaseTabProps {
  profileData: ProfileData;
  onSave: (tabName: string) => Promise<void>;
  onChange: (field: string, value: any) => void;
  isLoading?: boolean;
  isSaving?: boolean;
  mode?: ProfileMode;
}

/**
 * Core Information Tab props
 */
export interface CoreInformationTabProps extends BaseTabProps {
  // No additional props beyond base
}

/**
 * Personal Details Tab props
 */
export interface PersonalDetailsTabProps extends BaseTabProps {
  // No additional props beyond base
}

/**
 * Address Tab props
 */
export interface AddressTabProps extends BaseTabProps {
  onAddressChange: (field: string, value: string) => void;
}

/**
 * Government IDs Tab props
 */
export interface GovernmentIDsTabProps extends BaseTabProps {
  countryCodes: string[];
  isLoadingCountries?: boolean;
  countryError?: string | null;
}

/**
 * Emergency Contacts Tab props
 */
export interface EmergencyContactsTabProps extends BaseTabProps {
  // No additional props beyond base (uses emergencyContacts from profileData)
}

/**
 * Banking Tab props
 */
export interface BankingTabProps extends BaseTabProps {
  // No additional props beyond base
}

/**
 * Preferences Tab props
 */
export interface PreferencesTabProps extends BaseTabProps {
  // No additional props beyond base
}

/**
 * ProfileTabsManager props
 */
export interface ProfileTabsManagerProps {
  userId: string;
  employmentRecordId?: string;
  mode?: ProfileMode;
  includeTabs?: ProfileTabName[];
  excludeTabs?: ProfileTabName[];
  onSave?: (profileData: ProfileData, tabName: string) => Promise<void>;
  onComplete?: () => void;
  initialTab?: number;
  showProgressIndicator?: boolean;
}

/**
 * Save handler context for audit logging
 */
export interface SaveContext {
  employmentRecordId?: string;
  clientId?: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Profile save response
 */
export interface ProfileSaveResponse {
  success: boolean;
  message: string;
  profileData?: ProfileData;
  errors?: Record<string, string>;
}

/**
 * Profile change handler
 * Updates a specific field in profile data
 */
export type ProfileChangeHandler = (field: string, value: any) => void;

/**
 * Profile save handler
 * Saves profile data for a specific tab
 */
export type ProfileSaveHandler = (tabName: string) => Promise<void>;

/**
 * Address change handler
 * Updates a specific field in address
 */
export type AddressChangeHandler = (field: string, value: string) => void;

/**
 * Emergency contact change handler
 * Updates an emergency contact at a specific index
 */
export type EmergencyContactChangeHandler = (
  index: number,
  field: string,
  value: string
) => void;

/**
 * Tab change handler
 * Handles tab selection changes
 */
export type TabChangeHandler = (event: React.SyntheticEvent, newValue: number) => void;

/**
 * Government ID field error state
 */
export interface GovernmentIDErrors {
  [fieldName: string]: string;
}

/**
 * Tab metadata for rendering
 */
export interface TabMetadata {
  name: ProfileTabName;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
  visible: boolean;
}

/**
 * Profile completion info
 */
export interface ProfileCompletionInfo {
  percentage: number;
  status: 'complete' | 'almost-complete' | 'in-progress' | 'incomplete';
  message: string;
  color: 'success' | 'info' | 'warning' | 'error';
}

/**
 * Auto-save status
 */
export interface AutoSaveStatus {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Form submission result
 */
export interface FormSubmissionResult {
  success: boolean;
  errors: ValidationError[];
  data?: ProfileData;
}

/**
 * Tab visibility rules
 * Used to determine which tabs should be shown based on conditions
 */
export interface TabVisibilityRules {
  governmentIds?: {
    requiresEmployment: boolean;
  };
  documents?: {
    showInProfile: boolean;
    showInOnboarding: boolean;
  };
}

/**
 * Onboarding step completion
 */
export interface OnboardingStepCompletion {
  stepNumber: number;
  isComplete: boolean;
  completedAt?: Date;
}

/**
 * Profile audit log entry
 */
export interface ProfileAuditLog {
  userId: string;
  action: 'create' | 'update' | 'view';
  section: ProfileTabName;
  timestamp: Date;
  changes?: Record<string, any>;
  employmentRecordId?: string;
  clientId?: string;
  ip?: string;
  userAgent?: string;
}
