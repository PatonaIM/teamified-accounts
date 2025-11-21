/**
 * Address Tab
 *
 * Residential address information.
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
import type { AddressTabProps } from '../shared/types';
import { isFieldRequired, ONBOARDING_HELPER_TEXT } from '../../../config/profileRequirements';

export const AddressTab: React.FC<AddressTabProps> = ({
  profileData,
  onSave,
  onChange,
  onAddressChange,
  isLoading = false,
  isSaving = false,
  mode = 'full'
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave('Address Information');
  };

  const handleAddressFieldChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onAddressChange(field, e.target.value);
  };

  return (
    <StyledCard>
      <PurpleCardHeader title="Address Information" />
      <CardContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <FormContainer>
            <Box>
              <StyledTextField
                fullWidth
                label="Address Line 1"
                required={isFieldRequired('addressLine1', 'address', mode)}
                value={profileData.presentAddress?.addressLine1 || ''}
                onChange={handleAddressFieldChange('addressLine1')}
                placeholder="Street Address, Apartment, Suite, etc."
                disabled={isLoading}
                helperText={mode === 'onboarding' && isFieldRequired('addressLine1', 'address', mode) ? ONBOARDING_HELPER_TEXT : ''}
              />
            </Box>

            <Box>
              <StyledTextField
                fullWidth
                label="Address Line 2"
                value={profileData.presentAddress?.addressLine2 || ''}
                onChange={handleAddressFieldChange('addressLine2')}
                placeholder="Additional Address Information"
                disabled={isLoading}
              />
            </Box>

            <FieldRow>
              <Box>
                <StyledTextField
                  fullWidth
                  label="City"
                  required={isFieldRequired('city', 'address', mode)}
                  value={profileData.presentAddress?.city || ''}
                  onChange={handleAddressFieldChange('city')}
                  placeholder="City"
                  disabled={isLoading}
                  helperText={mode === 'onboarding' && isFieldRequired('city', 'address', mode) ? ONBOARDING_HELPER_TEXT : ''}
                />
              </Box>
              <Box>
                <StyledTextField
                  fullWidth
                  label="State/Province"
                  required={isFieldRequired('stateProvince', 'address', mode)}
                  value={profileData.presentAddress?.stateProvince || ''}
                  onChange={handleAddressFieldChange('stateProvince')}
                  placeholder="State or Province"
                  disabled={isLoading}
                  helperText={mode === 'onboarding' && isFieldRequired('stateProvince', 'address', mode) ? ONBOARDING_HELPER_TEXT : ''}
                />
              </Box>
            </FieldRow>

            <FieldRow>
              <Box>
                <StyledTextField
                  fullWidth
                  label="Postal Code"
                  required={isFieldRequired('postalCode', 'address', mode)}
                  value={profileData.presentAddress?.postalCode || ''}
                  onChange={handleAddressFieldChange('postalCode')}
                  placeholder="Postal Code / ZIP Code"
                  disabled={isLoading}
                  helperText={mode === 'onboarding' && isFieldRequired('postalCode', 'address', mode) ? ONBOARDING_HELPER_TEXT : ''}
                />
              </Box>
              <Box>
                <StyledTextField
                  fullWidth
                  label="Country"
                  required={isFieldRequired('country', 'address', mode)}
                  value={profileData.presentAddress?.country || ''}
                  onChange={handleAddressFieldChange('country')}
                  placeholder="Country"
                  disabled={isLoading}
                  helperText={mode === 'onboarding' && isFieldRequired('country', 'address', mode) ? ONBOARDING_HELPER_TEXT : ''}
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
                {isSaving ? 'Saving...' : 'Save Address Information'}
              </StyledButton>
            </ActionButtonContainer>
          </FormContainer>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default AddressTab;
