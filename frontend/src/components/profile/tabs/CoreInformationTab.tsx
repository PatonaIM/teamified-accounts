/**
 * Core Information Tab
 *
 * Basic employee information including name, email, employee ID, etc.
 * Shared between Profile page and Onboarding wizard.
 */

import React from 'react';
import { Box, CardContent } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import {
  StyledCard,
  PurpleCardHeader,
  StyledTextField,
  StyledButton,
  FieldRow,
  FormContainer,
  ActionButtonContainer
} from '../shared/StyledComponents';
import type { CoreInformationTabProps } from '../shared/types';
import { useAuth } from '../../../hooks/useAuth';
import { isFieldRequired, ONBOARDING_HELPER_TEXT } from '../../../config/profileRequirements';

export const CoreInformationTab: React.FC<CoreInformationTabProps> = ({
  profileData,
  onSave,
  onChange,
  isLoading = false,
  isSaving = false,
  mode = 'full'
}) => {
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave('Basic Information');
  };

  const handleFieldChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(field, e.target.value);
  };

  // Only admin and hr can edit Employee ID
  const canEditEmployeeId = user?.roles?.some((role: string) =>
    ['admin', 'hr'].includes(role)
  ) ?? false;

  return (
    <StyledCard>
      <PurpleCardHeader title="Basic Employee Information" />
      <CardContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <FormContainer>
            <FieldRow>
              <Box>
                <StyledTextField
                  fullWidth
                  label="Employee ID"
                  required
                  value={profileData.employeeId || ''}
                  onChange={handleFieldChange('employeeId')}
                  placeholder="Enter Employee ID"
                  disabled={isLoading || !canEditEmployeeId}
                  InputProps={{
                    readOnly: !canEditEmployeeId
                  }}
                  helperText={!canEditEmployeeId ? 'Read-only: Contact HR to update' : ''}
                />
              </Box>
              <Box>
                <StyledTextField
                  fullWidth
                  label="First Name"
                  required={isFieldRequired('firstName', 'core', mode)}
                  value={profileData.firstName || ''}
                  onChange={handleFieldChange('firstName')}
                  placeholder="Enter First Name"
                  disabled={isLoading}
                  helperText={mode === 'onboarding' && isFieldRequired('firstName', 'core', mode) ? ONBOARDING_HELPER_TEXT : ''}
                />
              </Box>
            </FieldRow>

            <FieldRow>
              <Box>
                <StyledTextField
                  fullWidth
                  label="Last Name"
                  required={isFieldRequired('lastName', 'core', mode)}
                  value={profileData.lastName || ''}
                  onChange={handleFieldChange('lastName')}
                  placeholder="Enter Last Name"
                  disabled={isLoading}
                  helperText={mode === 'onboarding' && isFieldRequired('lastName', 'core', mode) ? ONBOARDING_HELPER_TEXT : ''}
                />
              </Box>
              <Box>
                <StyledTextField
                  fullWidth
                  label="Father's Name"
                  value={profileData.fathersName || ''}
                  onChange={handleFieldChange('fathersName')}
                  placeholder="Enter Father's Name"
                  disabled={isLoading}
                />
              </Box>
            </FieldRow>

            <FieldRow>
              <Box>
                <StyledTextField
                  fullWidth
                  label="Nick Name"
                  value={profileData.nickName || ''}
                  onChange={handleFieldChange('nickName')}
                  placeholder="Enter Nick Name"
                  disabled={isLoading}
                />
              </Box>
              <Box>
                <StyledTextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  required
                  value={profileData.emailAddress || ''}
                  onChange={handleFieldChange('emailAddress')}
                  placeholder="Enter Email Address"
                  disabled={isLoading}
                />
              </Box>
            </FieldRow>

            <ActionButtonContainer>
              <StyledButton
                type="submit"
                variant="contained"
                disabled={isLoading || isSaving}
                startIcon={<SaveIcon />}
              >
                {isSaving ? 'Saving...' : 'Save Basic Information'}
              </StyledButton>
            </ActionButtonContainer>
          </FormContainer>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default CoreInformationTab;
