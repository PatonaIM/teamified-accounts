/**
 * Field validation utilities for profile forms
 *
 * Provides comprehensive validation functions for profile data,
 * including government IDs, contact information, and custom field types.
 */

import { GovernmentIDField, validateField } from './countryFieldsConfig';

/**
 * Validation result for a single field
 */
export interface FieldValidationResult {
  field: string;
  valid: boolean;
  message?: string;
}

/**
 * Validation result for multiple fields
 */
export interface FormValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  fieldResults: FieldValidationResult[];
}

/**
 * Validate multiple government ID fields at once
 */
export const validateGovernmentIDFields = (
  fields: GovernmentIDField[],
  values: Record<string, string>
): FormValidationResult => {
  const errors: Record<string, string> = {};
  const fieldResults: FieldValidationResult[] = [];

  fields.forEach(field => {
    const value = values[field.name] || '';
    const result = validateField(field, value);

    fieldResults.push({
      field: field.name,
      valid: result.valid,
      message: result.message
    });

    if (!result.valid && result.message) {
      errors[field.name] = result.message;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    fieldResults
  };
};

/**
 * Email validation
 */
export const validateEmail = (email: string): FieldValidationResult => {
  if (!email || email.trim() === '') {
    return {
      field: 'email',
      valid: false,
      message: 'Email is required'
    };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return {
      field: 'email',
      valid: false,
      message: 'Invalid email format'
    };
  }

  return {
    field: 'email',
    valid: true
  };
};

/**
 * Phone number validation (international format)
 */
export const validatePhoneNumber = (phone: string, required: boolean = false): FieldValidationResult => {
  if (!phone || phone.trim() === '') {
    if (required) {
      return {
        field: 'phone',
        valid: false,
        message: 'Phone number is required'
      };
    }
    return {
      field: 'phone',
      valid: true
    };
  }

  // Accept various international phone formats
  // This is a permissive pattern that accepts most valid formats
  const phonePattern = /^[\d\s\-\+\(\)]+$/;
  if (!phonePattern.test(phone)) {
    return {
      field: 'phone',
      valid: false,
      message: 'Invalid phone number format'
    };
  }

  // Check minimum length (at least 7 digits)
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 7) {
    return {
      field: 'phone',
      valid: false,
      message: 'Phone number too short'
    };
  }

  return {
    field: 'phone',
    valid: true
  };
};

/**
 * Date of birth validation
 */
export const validateDateOfBirth = (dob: string | Date, required: boolean = true): FieldValidationResult => {
  if (!dob) {
    if (required) {
      return {
        field: 'dateOfBirth',
        valid: false,
        message: 'Date of birth is required'
      };
    }
    return {
      field: 'dateOfBirth',
      valid: true
    };
  }

  const date = typeof dob === 'string' ? new Date(dob) : dob;

  if (isNaN(date.getTime())) {
    return {
      field: 'dateOfBirth',
      valid: false,
      message: 'Invalid date format'
    };
  }

  // Check if date is in the past
  if (date > new Date()) {
    return {
      field: 'dateOfBirth',
      valid: false,
      message: 'Date of birth cannot be in the future'
    };
  }

  // Check minimum age (e.g., 16 years)
  const minAge = 16;
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - minAge);

  if (date > minDate) {
    return {
      field: 'dateOfBirth',
      valid: false,
      message: `Must be at least ${minAge} years old`
    };
  }

  // Check maximum age (e.g., 100 years)
  const maxAge = 100;
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - maxAge);

  if (date < maxDate) {
    return {
      field: 'dateOfBirth',
      valid: false,
      message: 'Invalid date of birth'
    };
  }

  return {
    field: 'dateOfBirth',
    valid: true
  };
};

/**
 * Required field validation
 */
export const validateRequired = (
  fieldName: string,
  value: any,
  label?: string
): FieldValidationResult => {
  const displayLabel = label || fieldName;

  if (value === null || value === undefined || value === '') {
    return {
      field: fieldName,
      valid: false,
      message: `${displayLabel} is required`
    };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return {
      field: fieldName,
      valid: false,
      message: `${displayLabel} is required`
    };
  }

  return {
    field: fieldName,
    valid: true
  };
};

/**
 * Postal/ZIP code validation
 */
export const validatePostalCode = (
  postalCode: string,
  countryCode?: string,
  required: boolean = false
): FieldValidationResult => {
  if (!postalCode || postalCode.trim() === '') {
    if (required) {
      return {
        field: 'postalCode',
        valid: false,
        message: 'Postal code is required'
      };
    }
    return {
      field: 'postalCode',
      valid: true
    };
  }

  // Country-specific postal code patterns
  const patterns: Record<string, { pattern: RegExp; message: string }> = {
    US: {
      pattern: /^\d{5}(-\d{4})?$/,
      message: 'US ZIP code must be in format: 12345 or 12345-6789'
    },
    UK: {
      pattern: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
      message: 'UK postcode must be in format: SW1A 1AA'
    },
    CA: {
      pattern: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
      message: 'Canadian postal code must be in format: K1A 0B1'
    },
    IN: {
      pattern: /^\d{6}$/,
      message: 'Indian PIN code must be 6 digits'
    },
    AU: {
      pattern: /^\d{4}$/,
      message: 'Australian postcode must be 4 digits'
    },
    PH: {
      pattern: /^\d{4}$/,
      message: 'Philippines postal code must be 4 digits'
    },
    LK: {
      pattern: /^\d{5}$/,
      message: 'Sri Lankan postal code must be 5 digits'
    }
  };

  if (countryCode && patterns[countryCode]) {
    const { pattern, message } = patterns[countryCode];
    if (!pattern.test(postalCode)) {
      return {
        field: 'postalCode',
        valid: false,
        message
      };
    }
  }

  return {
    field: 'postalCode',
    valid: true
  };
};

/**
 * Bank account number validation (basic format check)
 */
export const validateBankAccountNumber = (
  accountNumber: string,
  required: boolean = false
): FieldValidationResult => {
  if (!accountNumber || accountNumber.trim() === '') {
    if (required) {
      return {
        field: 'accountNumber',
        valid: false,
        message: 'Account number is required'
      };
    }
    return {
      field: 'accountNumber',
      valid: true
    };
  }

  // Basic validation - alphanumeric, minimum 4 characters
  const pattern = /^[A-Z0-9]{4,}$/i;
  if (!pattern.test(accountNumber)) {
    return {
      field: 'accountNumber',
      valid: false,
      message: 'Invalid account number format (minimum 4 alphanumeric characters)'
    };
  }

  return {
    field: 'accountNumber',
    valid: true
  };
};

/**
 * IBAN validation
 */
export const validateIBAN = (iban: string, required: boolean = false): FieldValidationResult => {
  if (!iban || iban.trim() === '') {
    if (required) {
      return {
        field: 'iban',
        valid: false,
        message: 'IBAN is required'
      };
    }
    return {
      field: 'iban',
      valid: true
    };
  }

  // Remove spaces and convert to uppercase
  const ibanNormalized = iban.replace(/\s/g, '').toUpperCase();

  // Basic IBAN pattern (2 letters + 2 digits + up to 30 alphanumeric)
  const ibanPattern = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/;
  if (!ibanPattern.test(ibanNormalized)) {
    return {
      field: 'iban',
      valid: false,
      message: 'Invalid IBAN format'
    };
  }

  return {
    field: 'iban',
    valid: true
  };
};

/**
 * SWIFT/BIC code validation
 */
export const validateSwiftCode = (swift: string, required: boolean = false): FieldValidationResult => {
  if (!swift || swift.trim() === '') {
    if (required) {
      return {
        field: 'swiftCode',
        valid: false,
        message: 'SWIFT/BIC code is required'
      };
    }
    return {
      field: 'swiftCode',
      valid: true
    };
  }

  // SWIFT/BIC pattern: 8 or 11 characters (4 letters + 2 letters + 2 alphanumeric + optional 3 alphanumeric)
  const swiftPattern = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
  if (!swiftPattern.test(swift.toUpperCase())) {
    return {
      field: 'swiftCode',
      valid: false,
      message: 'Invalid SWIFT/BIC code format (8 or 11 characters)'
    };
  }

  return {
    field: 'swiftCode',
    valid: true
  };
};

/**
 * Validate entire profile data object
 */
export const validateProfileData = (
  profileData: Record<string, any>,
  requiredFields: string[] = []
): FormValidationResult => {
  const errors: Record<string, string> = {};
  const fieldResults: FieldValidationResult[] = [];

  // Validate required fields
  requiredFields.forEach(fieldName => {
    const result = validateRequired(fieldName, profileData[fieldName]);
    fieldResults.push(result);
    if (!result.valid && result.message) {
      errors[fieldName] = result.message;
    }
  });

  // Validate email if present
  if (profileData.email) {
    const result = validateEmail(profileData.email);
    fieldResults.push(result);
    if (!result.valid && result.message) {
      errors.email = result.message;
    }
  }

  // Validate phone if present
  if (profileData.phone || profileData.phoneNumber) {
    const phone = profileData.phone || profileData.phoneNumber;
    const result = validatePhoneNumber(phone);
    fieldResults.push(result);
    if (!result.valid && result.message) {
      errors.phone = result.message;
    }
  }

  // Validate date of birth if present
  if (profileData.dateOfBirth) {
    const result = validateDateOfBirth(profileData.dateOfBirth);
    fieldResults.push(result);
    if (!result.valid && result.message) {
      errors.dateOfBirth = result.message;
    }
  }

  // Validate postal code if present
  if (profileData.postalCode) {
    const result = validatePostalCode(profileData.postalCode, profileData.countryCode);
    fieldResults.push(result);
    if (!result.valid && result.message) {
      errors.postalCode = result.message;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    fieldResults
  };
};

/**
 * Sanitize input string (remove leading/trailing whitespace, normalize spaces)
 */
export const sanitizeInput = (value: string): string => {
  if (!value) return '';
  return value.trim().replace(/\s+/g, ' ');
};

/**
 * Normalize phone number (remove non-digit characters except + at start)
 */
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const trimmed = phone.trim();
  if (trimmed.startsWith('+')) {
    return '+' + trimmed.substring(1).replace(/\D/g, '');
  }
  return trimmed.replace(/\D/g, '');
};

/**
 * Check if all required fields in a field list are filled
 */
export const hasAllRequiredFields = (
  fields: GovernmentIDField[],
  values: Record<string, string>
): boolean => {
  return fields
    .filter(field => field.required)
    .every(field => {
      const value = values[field.name];
      return value && value.trim() !== '';
    });
};

/**
 * Get list of missing required fields
 */
export const getMissingRequiredFields = (
  fields: GovernmentIDField[],
  values: Record<string, string>
): string[] => {
  return fields
    .filter(field => field.required)
    .filter(field => {
      const value = values[field.name];
      return !value || value.trim() === '';
    })
    .map(field => field.label);
};
