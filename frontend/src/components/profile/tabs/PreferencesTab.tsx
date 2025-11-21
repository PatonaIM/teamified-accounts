/**
 * Preferences Tab
 *
 * User preferences and settings including contact info, language, and additional details.
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
import type { PreferencesTabProps } from '../shared/types';
import { isFieldRequired, ONBOARDING_HELPER_TEXT } from '../../../config/profileRequirements';

export const PreferencesTab: React.FC<PreferencesTabProps> = ({
  profileData,
  onSave,
  onChange,
  isLoading = false,
  isSaving = false,
  mode = 'full'
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave('Preferences');
  };

  const handleFieldChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { value: unknown }>
  ) => {
    onChange(field, e.target.value);
  };

  return (
    <StyledCard>
      <PurpleCardHeader title="Preferences & Settings" />
      <CardContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <FormContainer>
            <FieldRow>
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Language Preference</InputLabel>
                  <Select
                    value={profileData.languagePreference || ''}
                    label="Language Preference"
                    onChange={handleFieldChange('languagePreference')}
                    sx={{ borderRadius: 1.5 }}
                    disabled={isLoading}
                  >
                    <MenuItem value="">Select Language</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="hi">Hindi</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                    <MenuItem value="zh">Chinese</MenuItem>
                    <MenuItem value="ja">Japanese</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <StyledTextField
                  fullWidth
                  label="Work Phone"
                  value={profileData.workPhone || ''}
                  onChange={handleFieldChange('workPhone')}
                  placeholder="Enter Work Phone"
                  disabled={isLoading}
                />
              </Box>
            </FieldRow>

            <FieldRow>
              <Box>
                <StyledTextField
                  fullWidth
                  label="Extension"
                  value={profileData.extension || ''}
                  onChange={handleFieldChange('extension')}
                  placeholder="Enter Extension"
                  disabled={isLoading}
                />
              </Box>
              <Box>
                <StyledTextField
                  fullWidth
                  label="Seating Location"
                  value={profileData.seatingLocation || ''}
                  onChange={handleFieldChange('seatingLocation')}
                  placeholder="Enter Seating Location"
                  disabled={isLoading}
                />
              </Box>
            </FieldRow>

            <FieldRow>
              <Box>
                <StyledTextField
                  fullWidth
                  label="LinkedIn URL"
                  value={profileData.linkedinUrl || ''}
                  onChange={handleFieldChange('linkedinUrl')}
                  placeholder="https://linkedin.com/in/yourprofile"
                  disabled={isLoading}
                />
              </Box>
              <Box>
                <StyledTextField
                  fullWidth
                  label="Blood Group"
                  value={profileData.bloodGroup || ''}
                  onChange={handleFieldChange('bloodGroup')}
                  placeholder="Enter Blood Group"
                  disabled={isLoading}
                />
              </Box>
            </FieldRow>

            <Box>
              <StyledTextField
                fullWidth
                label="Personal Description"
                multiline
                rows={4}
                value={profileData.personalDescription || ''}
                onChange={handleFieldChange('personalDescription')}
                placeholder="Tell us about yourself, your interests, and professional background..."
                disabled={isLoading}
              />
            </Box>

            <Box>
              <StyledTextField
                fullWidth
                label="Expertise & Skills"
                multiline
                rows={3}
                value={profileData.expertise || ''}
                onChange={handleFieldChange('expertise')}
                placeholder="List your key skills, expertise areas, and professional competencies..."
                disabled={isLoading}
              />
            </Box>

            <ActionButtonContainer>
              <StyledButton
                type="submit"
                variant="contained"
                disabled={isLoading || isSaving}
                startIcon={<SaveIcon />}
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </StyledButton>
            </ActionButtonContainer>
          </FormContainer>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default PreferencesTab;
