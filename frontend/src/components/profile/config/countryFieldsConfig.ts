/**
 * Country-specific Government ID field configurations
 *
 * This file defines which government identification fields are required
 * for each country based on employment records.
 */

export interface GovernmentIDField {
  name: string;            // Field name in profile_data JSONB
  label: string;           // Display label for the field
  placeholder: string;     // Placeholder text
  required?: boolean;      // Whether field is required
  validation?: {
    pattern?: RegExp;      // Validation regex pattern
    message?: string;      // Error message for validation failure
  };
  helperText?: string;     // Additional help text
}

/**
 * Country code to Government ID fields mapping
 * Uses ISO 2-letter country codes
 */
export const COUNTRY_GOVERNMENT_IDS: Record<string, GovernmentIDField[]> = {
  // India
  IN: [
    {
      name: 'pan',
      label: 'PAN Number',
      placeholder: 'ABCDE1234F',
      required: true,
      validation: {
        pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        message: 'PAN must be in format: ABCDE1234F (5 letters, 4 digits, 1 letter)'
      },
      helperText: 'Permanent Account Number issued by Income Tax Department'
    },
    {
      name: 'aadhaar',
      label: 'Aadhaar Number',
      placeholder: '123456789012',
      required: true,
      validation: {
        pattern: /^\d{12}$/,
        message: 'Aadhaar must be exactly 12 digits'
      },
      helperText: 'Unique 12-digit identification number'
    },
    {
      name: 'pfNumber',
      label: 'PF Number',
      placeholder: 'Enter PF Number',
      helperText: 'Provident Fund Number'
    },
    {
      name: 'uan',
      label: 'UAN',
      placeholder: 'Enter UAN',
      helperText: 'Universal Account Number for EPFO'
    },
    {
      name: 'tin',
      label: 'TIN',
      placeholder: 'Enter TIN',
      helperText: 'Tax Identification Number'
    }
  ],

  // Philippines
  PH: [
    {
      name: 'sss',
      label: 'SSS Number',
      placeholder: 'XX-XXXXXXX-X',
      required: true,
      validation: {
        pattern: /^\d{2}-\d{7}-\d{1}$/,
        message: 'SSS must be in format: XX-XXXXXXX-X'
      },
      helperText: 'Social Security System number'
    },
    {
      name: 'philhealth',
      label: 'PhilHealth Number',
      placeholder: 'XX-XXXXXXXXX-X',
      required: true,
      validation: {
        pattern: /^\d{2}-\d{9}-\d{1}$/,
        message: 'PhilHealth must be in format: XX-XXXXXXXXX-X'
      },
      helperText: 'Philippine Health Insurance Corporation number'
    },
    {
      name: 'pagibig',
      label: 'Pag-IBIG Number',
      placeholder: 'XXXX-XXXX-XXXX',
      required: true,
      validation: {
        pattern: /^\d{4}-\d{4}-\d{4}$/,
        message: 'Pag-IBIG must be in format: XXXX-XXXX-XXXX'
      },
      helperText: 'Home Development Mutual Fund number'
    },
    {
      name: 'tin',
      label: 'TIN',
      placeholder: 'XXX-XXX-XXX-XXX',
      required: true,
      validation: {
        pattern: /^\d{3}-\d{3}-\d{3}-\d{3}$/,
        message: 'TIN must be in format: XXX-XXX-XXX-XXX'
      },
      helperText: 'Tax Identification Number'
    }
  ],

  // Sri Lanka
  LK: [
    {
      name: 'nic',
      label: 'NIC Number',
      placeholder: 'XXXXXXXXXV or XXXXXXXXXXXX',
      required: true,
      validation: {
        pattern: /^(\d{9}V|\d{12})$/,
        message: 'NIC must be 9 digits followed by V, or 12 digits'
      },
      helperText: 'National Identity Card number'
    },
    {
      name: 'tin',
      label: 'TIN',
      placeholder: 'Enter TIN',
      helperText: 'Tax Identification Number'
    }
  ],

  // Australia
  AU: [
    {
      name: 'tfn',
      label: 'Tax File Number (TFN)',
      placeholder: 'XXX XXX XXX',
      validation: {
        pattern: /^\d{9}$/,
        message: 'TFN must be 9 digits'
      },
      helperText: 'Nine-digit number issued by the Australian Taxation Office'
    },
    {
      name: 'abn',
      label: 'Australian Business Number (ABN)',
      placeholder: 'XX XXX XXX XXX',
      validation: {
        pattern: /^\d{11}$/,
        message: 'ABN must be 11 digits'
      },
      helperText: 'Unique identifier for businesses (if applicable)'
    }
  ],

  // United States
  US: [
    {
      name: 'ssn',
      label: 'Social Security Number (SSN)',
      placeholder: 'XXX-XX-XXXX',
      required: true,
      validation: {
        pattern: /^\d{3}-\d{2}-\d{4}$/,
        message: 'SSN must be in format: XXX-XX-XXXX'
      },
      helperText: 'Nine-digit Social Security Number'
    },
    {
      name: 'ein',
      label: 'Employer Identification Number (EIN)',
      placeholder: 'XX-XXXXXXX',
      validation: {
        pattern: /^\d{2}-\d{7}$/,
        message: 'EIN must be in format: XX-XXXXXXX'
      },
      helperText: 'Federal tax ID for businesses (if applicable)'
    }
  ],

  // United Kingdom
  UK: [
    {
      name: 'nino',
      label: 'National Insurance Number (NINO)',
      placeholder: 'AB123456C',
      required: true,
      validation: {
        pattern: /^[A-Z]{2}\d{6}[A-Z]$/,
        message: 'NINO must be in format: AB123456C'
      },
      helperText: 'Nine-character National Insurance number'
    },
    {
      name: 'utr',
      label: 'Unique Taxpayer Reference (UTR)',
      placeholder: 'XXXXXXXXXX',
      validation: {
        pattern: /^\d{10}$/,
        message: 'UTR must be 10 digits'
      },
      helperText: '10-digit Unique Taxpayer Reference'
    }
  ],

  // Canada
  CA: [
    {
      name: 'sin',
      label: 'Social Insurance Number (SIN)',
      placeholder: 'XXX-XXX-XXX',
      required: true,
      validation: {
        pattern: /^\d{3}-\d{3}-\d{3}$/,
        message: 'SIN must be in format: XXX-XXX-XXX'
      },
      helperText: 'Nine-digit Social Insurance Number'
    },
    {
      name: 'bn',
      label: 'Business Number (BN)',
      placeholder: 'XXXXXXXXX',
      validation: {
        pattern: /^\d{9}$/,
        message: 'BN must be 9 digits'
      },
      helperText: 'Canada Revenue Agency Business Number (if applicable)'
    }
  ],

  // Default fallback for any other country
  DEFAULT: [
    {
      name: 'nationalId',
      label: 'National ID',
      placeholder: 'Enter National ID',
      required: true,
      helperText: 'Government-issued national identification number'
    },
    {
      name: 'tin',
      label: 'Tax Identification Number',
      placeholder: 'Enter TIN',
      helperText: 'Tax identification or taxpayer number'
    }
  ]
};

/**
 * Get government ID fields for a specific country
 * Falls back to DEFAULT if country not found
 */
export const getCountryFields = (countryCode: string): GovernmentIDField[] => {
  return COUNTRY_GOVERNMENT_IDS[countryCode] || COUNTRY_GOVERNMENT_IDS.DEFAULT;
};

/**
 * Get merged unique fields for multiple countries
 * Removes duplicate fields by name
 */
export const getMergedCountryFields = (countryCodes: string[]): GovernmentIDField[] => {
  const allFields: GovernmentIDField[] = [];
  const seenFieldNames = new Set<string>();

  countryCodes.forEach(code => {
    const fields = getCountryFields(code);
    fields.forEach(field => {
      if (!seenFieldNames.has(field.name)) {
        seenFieldNames.add(field.name);
        allFields.push(field);
      }
    });
  });

  return allFields;
};

/**
 * Validate a field value against its validation rules
 */
export const validateField = (
  field: GovernmentIDField,
  value: string
): { valid: boolean; message?: string } => {
  // Empty value is only invalid if field is required
  if (!value || value.trim() === '') {
    if (field.required) {
      return { valid: false, message: `${field.label} is required` };
    }
    return { valid: true };
  }

  // Check pattern validation if exists
  if (field.validation?.pattern && !field.validation.pattern.test(value)) {
    return {
      valid: false,
      message: field.validation.message || `Invalid ${field.label} format`
    };
  }

  return { valid: true };
};
