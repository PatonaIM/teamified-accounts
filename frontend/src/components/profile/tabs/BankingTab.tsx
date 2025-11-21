/**
 * Banking Tab
 *
 * Banking and payment information.
 * Shared between Profile page and Onboarding wizard.
 */

import React from 'react';
import { Box, CardContent, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
import type { BankingTabProps } from '../shared/types';

export const BankingTab: React.FC<BankingTabProps> = ({
  profileData,
  onSave,
  onChange,
  isLoading = false,
  isSaving = false,
  mode = 'full'
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave('Banking Information');
  };

  const handleFieldChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    onChange(field, e.target.value);
  };

  return (
    <StyledCard>
      <PurpleCardHeader title="Banking Information" />
      <CardContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <FormContainer>
            <FieldRow>
              <Box>
                <StyledTextField
                  fullWidth
                  label="Bank Name"
                  value={profileData.bankName || ''}
                  onChange={handleFieldChange('bankName')}
                  placeholder="Enter Bank Name"
                  disabled={isLoading}
                />
              </Box>
              <Box>
                <StyledTextField
                  fullWidth
                  label="Account Number"
                  value={profileData.bankAccountNumber || ''}
                  onChange={handleFieldChange('bankAccountNumber')}
                  placeholder="Enter Account Number"
                  disabled={isLoading}
                />
              </Box>
            </FieldRow>

            <FieldRow>
              <Box>
                <StyledTextField
                  fullWidth
                  label="IFSC Code"
                  value={profileData.ifscCode || ''}
                  onChange={handleFieldChange('ifscCode')}
                  placeholder="Enter IFSC Code"
                  helperText="Required for Indian bank accounts"
                  disabled={isLoading}
                />
              </Box>
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Account Type</InputLabel>
                  <Select
                    value={profileData.accountType || ''}
                    label="Account Type"
                    onChange={handleFieldChange('accountType')}
                    sx={{ borderRadius: 1.5 }}
                    disabled={isLoading}
                  >
                    <MenuItem value="">Select Account Type</MenuItem>
                    <MenuItem value="savings">Savings</MenuItem>
                    <MenuItem value="current">Current</MenuItem>
                    <MenuItem value="salary">Salary</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </FieldRow>

            <FieldRow>
              <Box>
                <StyledTextField
                  fullWidth
                  label="Account Holder Name"
                  value={profileData.bankHolderName || ''}
                  onChange={handleFieldChange('bankHolderName')}
                  placeholder="Enter Account Holder Name"
                  helperText="Name as per bank records"
                  disabled={isLoading}
                />
              </Box>
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Payment Mode</InputLabel>
                  <Select
                    value={profileData.paymentMode || ''}
                    label="Payment Mode"
                    onChange={handleFieldChange('paymentMode')}
                    sx={{ borderRadius: 1.5 }}
                    disabled={isLoading}
                  >
                    <MenuItem value="">Select Payment Mode</MenuItem>
                    <MenuItem value="bank-transfer">Bank Transfer</MenuItem>
                    <MenuItem value="cheque">Cheque</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
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
                {isSaving ? 'Saving...' : 'Save Banking Information'}
              </StyledButton>
            </ActionButtonContainer>
          </FormContainer>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default BankingTab;
