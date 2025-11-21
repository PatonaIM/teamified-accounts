/**
 * Personal Details Tab
 *
 * Personal information including date of birth, age, gender, marital status.
 * Shared between Profile page and Onboarding wizard.
 */

import React from 'react';
import { Box, CardContent, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import {
  StyledCard,
  BlueCardHeader,
  StyledTextField,
  StyledButton,
  FieldRow,
  FormContainer,
  ActionButtonContainer
} from '../shared/StyledComponents';
import type { PersonalDetailsTabProps } from '../shared/types';
import { isFieldRequired, ONBOARDING_HELPER_TEXT } from '../../../config/profileRequirements';

export const PersonalDetailsTab: React.FC<PersonalDetailsTabProps> = ({
  profileData,
  onSave,
  onChange,
  isLoading = false,
  isSaving = false,
  mode = 'full'
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave('Personal Information');
  };

  const handleFieldChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const value = e.target.value;
    if (field === 'age') {
      onChange(field, parseInt(value as string) || 0);
    } else {
      onChange(field, value);
    }
  };

  return (
    <StyledCard>
      <BlueCardHeader title="Personal Information" />
      <CardContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <FormContainer>
            <FieldRow>
              <Box>
                <StyledTextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  required={isFieldRequired('dateOfBirth', 'core', mode)}
                  value={profileData.dateOfBirth || ''}
                  onChange={handleFieldChange('dateOfBirth')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={isLoading}
                  helperText={mode === 'onboarding' && isFieldRequired('dateOfBirth', 'core', mode) ? ONBOARDING_HELPER_TEXT : ''}
                />
              </Box>
              <Box>
                <StyledTextField
                  fullWidth
                  label="Age"
                  type="number"
                  value={profileData.age || ''}
                  onChange={handleFieldChange('age')}
                  placeholder="Age"
                  inputProps={{ min: 0, max: 120 }}
                  disabled={isLoading}
                />
              </Box>
            </FieldRow>

            <FieldRow>
              <Box>
                <StyledTextField
                  fullWidth
                  label="Personal Mobile"
                  required={isFieldRequired('personalMobile', 'personal', mode)}
                  value={profileData.personalMobile || ''}
                  onChange={handleFieldChange('personalMobile')}
                  placeholder="Enter mobile number"
                  disabled={isLoading}
                  helperText={mode === 'onboarding' && isFieldRequired('personalMobile', 'personal', mode) ? ONBOARDING_HELPER_TEXT : ''}
                />
              </Box>
              <Box>
                <StyledTextField
                  fullWidth
                  label="Personal Email"
                  type="email"
                  required={isFieldRequired('personalEmail', 'personal', mode)}
                  value={profileData.personalEmail || ''}
                  onChange={handleFieldChange('personalEmail')}
                  placeholder="Enter email address"
                  disabled={isLoading}
                  helperText={mode === 'onboarding' && isFieldRequired('personalEmail', 'personal', mode) ? ONBOARDING_HELPER_TEXT : ''}
                />
              </Box>
            </FieldRow>

            <FieldRow>
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={profileData.gender || ''}
                    label="Gender"
                    onChange={handleFieldChange('gender')}
                    sx={{ borderRadius: 1.5 }}
                    disabled={isLoading}
                  >
                    <MenuItem value="">Select Gender</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Marital Status</InputLabel>
                  <Select
                    value={profileData.maritalStatus || ''}
                    label="Marital Status"
                    onChange={handleFieldChange('maritalStatus')}
                    sx={{ borderRadius: 1.5 }}
                    disabled={isLoading}
                  >
                    <MenuItem value="">Select Marital Status</MenuItem>
                    <MenuItem value="single">Single</MenuItem>
                    <MenuItem value="married">Married</MenuItem>
                    <MenuItem value="divorced">Divorced</MenuItem>
                    <MenuItem value="widowed">Widowed</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </FieldRow>

            <ActionButtonContainer>
              <StyledButton
                type="submit"
                variant="contained"
                disabled={isLoading || isSaving}
                startIcon={<SaveIcon />}
              >
                {isSaving ? 'Saving...' : 'Save Personal Information'}
              </StyledButton>
            </ActionButtonContainer>
          </FormContainer>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default PersonalDetailsTab;
