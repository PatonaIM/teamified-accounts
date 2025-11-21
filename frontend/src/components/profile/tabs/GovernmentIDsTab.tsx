/**
 * Government IDs Tab
 *
 * Dynamic government identification fields based on employment record countries.
 * Only visible when user has employment records.
 * Shared between Profile page and Onboarding wizard.
 */

import React, { useState, useEffect } from 'react';
import { Box, CardContent, Typography, Chip, Alert, CircularProgress } from '@mui/material';
import { Save as SaveIcon, Public as GlobeIcon, Info as InfoIcon } from '@mui/icons-material';
import {
  StyledCard,
  PurpleCardHeader,
  StyledTextField,
  StyledButton,
  FieldRow,
  FormContainer,
  ActionButtonContainer,
  InfoBox,
  CountryBadgeContainer,
  EmptyStateBox
} from '../shared/StyledComponents';
import {
  getMergedCountryFields,
  validateField,
  type GovernmentIDField
} from '../config/countryFieldsConfig';
import type { GovernmentIDsTabProps, GovernmentIDErrors } from '../shared/types';

export const GovernmentIDsTab: React.FC<GovernmentIDsTabProps> = ({
  profileData,
  onSave,
  onChange,
  countryCodes,
  isLoading = false,
  isSaving = false,
  isLoadingCountries = false,
  countryError = null,
  mode = 'full'
}) => {
  const [validationErrors, setValidationErrors] = useState<GovernmentIDErrors>({});
  const [fields, setFields] = useState<GovernmentIDField[]>([]);

  // Get merged fields when country codes change
  useEffect(() => {
    if (countryCodes && countryCodes.length > 0) {
      const mergedFields = getMergedCountryFields(countryCodes);
      setFields(mergedFields);
    } else {
      setFields([]);
    }
  }, [countryCodes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before saving
    const errors: GovernmentIDErrors = {};
    fields.forEach(field => {
      const value = (profileData as any)[field.name] || '';
      const validation = validateField(field, value);
      if (!validation.valid && validation.message) {
        errors[field.name] = validation.message;
      }
    });

    setValidationErrors(errors);

    // Only save if no errors
    if (Object.keys(errors).length === 0) {
      await onSave('Government IDs');
    }
  };

  const handleFieldChange = (field: GovernmentIDField) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    onChange(field.name, value);

    // Validate on change
    const validation = validateField(field, value);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (!validation.valid && validation.message) {
        newErrors[field.name] = validation.message;
      } else {
        delete newErrors[field.name];
      }
      return newErrors;
    });
  };

  // Loading state
  if (isLoadingCountries) {
    return (
      <StyledCard>
        <PurpleCardHeader title="Government Identification" />
        <CardContent sx={{ p: 3 }}>
          <EmptyStateBox>
            <CircularProgress size={40} sx={{ color: '#A16AE8', mb: 2 }} />
            <Typography variant="body1" color="textSecondary">
              Loading country information...
            </Typography>
          </EmptyStateBox>
        </CardContent>
      </StyledCard>
    );
  }

  // Error state
  if (countryError) {
    return (
      <StyledCard>
        <PurpleCardHeader title="Government Identification" />
        <CardContent sx={{ p: 3 }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {countryError}
          </Alert>
        </CardContent>
      </StyledCard>
    );
  }

  // No employment records state
  if (!countryCodes || countryCodes.length === 0) {
    return (
      <StyledCard>
        <PurpleCardHeader title="Government Identification" />
        <CardContent sx={{ p: 3 }}>
          <EmptyStateBox>
            <InfoIcon sx={{ fontSize: 60, color: '#A16AE8', mb: 2, opacity: 0.6 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1A1A1A', mb: 1 }}>
              No Employment Record Found
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 500 }}>
              Government ID fields will appear once you have an active employment record.
              Please contact your administrator or HR team if you believe this is an error.
            </Typography>
          </EmptyStateBox>
        </CardContent>
      </StyledCard>
    );
  }

  // Get country names for display (you could enhance this with a country name lookup)
  const getCountryName = (code: string): string => {
    const countryNames: Record<string, string> = {
      IN: 'India',
      PH: 'Philippines',
      LK: 'Sri Lanka',
      AU: 'Australia',
      US: 'United States',
      UK: 'United Kingdom',
      CA: 'Canada'
    };
    return countryNames[code] || code;
  };

  return (
    <StyledCard>
      <PurpleCardHeader title="Government Identification" />
      <CardContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <FormContainer>
            {/* Dynamic Government ID Fields */}
            {fields.map((field, index) => {
              const isEven = index % 2 === 0;
              const nextField = fields[index + 1];

              // Group fields in pairs for responsive layout
              if (isEven) {
                return (
                  <FieldRow key={field.name}>
                    <Box>
                      <StyledTextField
                        fullWidth
                        label={field.label}
                        required={field.required}
                        value={(profileData as any)[field.name] || ''}
                        onChange={handleFieldChange(field)}
                        placeholder={field.placeholder}
                        helperText={
                          validationErrors[field.name] || field.helperText || ''
                        }
                        error={!!validationErrors[field.name]}
                        disabled={isLoading}
                      />
                    </Box>
                    {nextField && (
                      <Box>
                        <StyledTextField
                          fullWidth
                          label={nextField.label}
                          required={nextField.required}
                          value={(profileData as any)[nextField.name] || ''}
                          onChange={handleFieldChange(nextField)}
                          placeholder={nextField.placeholder}
                          helperText={
                            validationErrors[nextField.name] || nextField.helperText || ''
                          }
                          error={!!validationErrors[nextField.name]}
                          disabled={isLoading}
                        />
                      </Box>
                    )}
                  </FieldRow>
                );
              }
              return null;
            }).filter(Boolean)}

            {/* Validation Summary */}
            {Object.keys(validationErrors).length > 0 && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Please correct the following errors:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {Object.entries(validationErrors).map(([field, message]) => (
                    <li key={field}>
                      <Typography variant="body2">{message}</Typography>
                    </li>
                  ))}
                </ul>
              </Alert>
            )}

            <ActionButtonContainer>
              <StyledButton
                type="submit"
                variant="contained"
                disabled={isLoading || isSaving}
                startIcon={<SaveIcon />}
              >
                {isSaving ? 'Saving...' : 'Save Government IDs'}
              </StyledButton>
            </ActionButtonContainer>
          </FormContainer>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default GovernmentIDsTab;
