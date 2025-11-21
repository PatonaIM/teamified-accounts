/**
 * Emergency Contacts Tab
 *
 * Emergency contact information with dynamic add/remove functionality.
 * Shared between Profile page and Onboarding wizard.
 */

import React from 'react';
import { Box, CardContent, Typography, IconButton, Tooltip, Alert } from '@mui/material';
import { Save as SaveIcon, Add as AddIcon, Delete as DeleteIcon, Info as InfoIcon } from '@mui/icons-material';
import {
  StyledCard,
  BlueCardHeader,
  StyledTextField,
  StyledButton,
  FieldRow,
  FormContainer,
  ActionButtonContainer,
  SectionPaper
} from '../shared/StyledComponents';
import type { EmergencyContactsTabProps, EmergencyContact } from '../shared/types';
import { isFieldRequired } from '../../../config/profileRequirements';

export const EmergencyContactsTab: React.FC<EmergencyContactsTabProps> = ({
  profileData,
  onSave,
  onChange,
  isLoading = false,
  isSaving = false,
  mode = 'full'
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave('Emergency Contacts');
  };

  const handleContactChange = (index: number, field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newContacts = [...(profileData.emergencyContacts || [])];
    (newContacts[index] as any)[field] = e.target.value;
    onChange('emergencyContacts', newContacts);
  };

  const handleAddContact = () => {
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: '',
      relationship: '',
      phoneNumber: '',
      address: '',
      isPrimary: false
    };
    const newContacts = [...(profileData.emergencyContacts || []), newContact];
    onChange('emergencyContacts', newContacts);
  };

  const handleRemoveContact = (index: number) => {
    const newContacts = (profileData.emergencyContacts || []).filter((_, i) => i !== index);
    onChange('emergencyContacts', newContacts);
  };

  const emergencyContacts = profileData.emergencyContacts || [];

  return (
    <StyledCard>
      <BlueCardHeader title="Emergency Contacts" />
      <CardContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <FormContainer>
            {mode === 'onboarding' && isFieldRequired('emergencyContacts', 'emergency', mode) && (
              <Alert
                severity="info"
                icon={<InfoIcon />}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: 'rgba(128, 150, 253, 0.08)',
                  '& .MuiAlert-icon': {
                    color: '#8096FD'
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  At least one emergency contact is required for onboarding completion.
                </Typography>
              </Alert>
            )}
            {emergencyContacts.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 4,
                  px: 2,
                  border: '2px dashed rgba(128, 150, 253, 0.3)',
                  borderRadius: 2,
                  backgroundColor: 'rgba(128, 150, 253, 0.05)'
                }}
              >
                <Typography variant="h6" sx={{ color: '#8096FD', fontWeight: 600, mb: 1 }}>
                  No Emergency Contacts Added
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                  Add at least one emergency contact for safety purposes
                </Typography>
                <StyledButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddContact}
                  disabled={isLoading}
                >
                  Add First Emergency Contact
                </StyledButton>
              </Box>
            ) : (
              <>
                {emergencyContacts.map((contact, index) => (
                  <SectionPaper key={contact.id || index} elevation={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#8096FD', fontWeight: 600 }}>
                        Emergency Contact {index + 1}
                      </Typography>
                      {emergencyContacts.length > 1 && (
                        <Tooltip title="Remove Contact">
                          <IconButton
                            onClick={() => handleRemoveContact(index)}
                            disabled={isLoading}
                            sx={{
                              color: '#EF4444',
                              '&:hover': {
                                backgroundColor: 'rgba(239, 68, 68, 0.1)'
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    <FormContainer>
                      <FieldRow>
                        <Box>
                          <StyledTextField
                            fullWidth
                            label="Full Name"
                            required
                            value={contact.name || ''}
                            onChange={handleContactChange(index, 'name')}
                            placeholder="Enter Full Name"
                            disabled={isLoading}
                          />
                        </Box>
                        <Box>
                          <StyledTextField
                            fullWidth
                            label="Relationship"
                            required
                            value={contact.relationship || ''}
                            onChange={handleContactChange(index, 'relationship')}
                            placeholder="e.g., Spouse, Parent, Sibling"
                            disabled={isLoading}
                          />
                        </Box>
                      </FieldRow>

                      <FieldRow>
                        <Box>
                          <StyledTextField
                            fullWidth
                            label="Phone Number"
                            required
                            value={contact.phoneNumber || ''}
                            onChange={handleContactChange(index, 'phoneNumber')}
                            placeholder="Enter Phone Number"
                            disabled={isLoading}
                          />
                        </Box>
                        <Box>
                          <StyledTextField
                            fullWidth
                            label="Address"
                            value={contact.address || ''}
                            onChange={handleContactChange(index, 'address')}
                            placeholder="Enter Address"
                            disabled={isLoading}
                          />
                        </Box>
                      </FieldRow>
                    </FormContainer>
                  </SectionPaper>
                ))}

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <StyledButton
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddContact}
                    disabled={isLoading}
                  >
                    Add Another Contact
                  </StyledButton>
                </Box>
              </>
            )}

            <ActionButtonContainer>
              <StyledButton
                type="submit"
                variant="contained"
                disabled={isLoading || isSaving || emergencyContacts.length === 0}
                startIcon={<SaveIcon />}
              >
                {isSaving ? 'Saving...' : 'Save Emergency Contacts'}
              </StyledButton>
            </ActionButtonContainer>
          </FormContainer>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default EmergencyContactsTab;
