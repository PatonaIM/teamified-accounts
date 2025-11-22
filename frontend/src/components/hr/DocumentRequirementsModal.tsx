import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { documentRequirementsService, type DocumentRequirements } from '../../services/documentRequirementsService';

interface DocumentRequirementsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DocumentRequirementsModal: React.FC<DocumentRequirementsModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [cvRequired, setCvRequired] = useState(1);
  const [identityRequired, setIdentityRequired] = useState(1);
  const [employmentRequired, setEmploymentRequired] = useState(1);
  const [educationRequired, setEducationRequired] = useState(1);

  useEffect(() => {
    if (open) {
      loadRequirements();
    }
  }, [open]);

  const loadRequirements = async () => {
    try {
      setLoading(true);
      setError(null);
      const requirements = await documentRequirementsService.getRequirements();
      setCvRequired(requirements.cvRequired);
      setIdentityRequired(requirements.identityRequired);
      setEmploymentRequired(requirements.employmentRequired);
      setEducationRequired(requirements.educationRequired);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load document requirements');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      await documentRequirementsService.updateRequirements({
        cvRequired,
        identityRequired,
        employmentRequired,
        educationRequired,
      });

      setSuccess(true);
      onSuccess?.();

      // Close after short delay to show success message
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update document requirements');
    } finally {
      setSaving(false);
    }
  };

  const handleNumberChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      setter(num);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'background.paper',
        }
      }}
    >
      <DialogTitle sx={{
        bgcolor: (theme) => 
          theme.palette.mode === 'dark' 
            ? alpha(theme.palette.primary.main, 0.1) 
            : alpha(theme.palette.primary.main, 0.05),
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2,
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Document Requirements Configuration
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 4, pt: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                Document requirements updated successfully!
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Set the number of required documents for each category during onboarding
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              {/* CV and Identity Row */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    fullWidth
                    label="CV / Resume Documents Required"
                    type="number"
                    value={cvRequired}
                    onChange={(e) => handleNumberChange(e.target.value, setCvRequired)}
                    InputProps={{
                      inputProps: { min: 0, max: 10 },
                    }}
                    helperText="Number of CV/resume documents required (0-10)"
                    disabled={saving}
                    sx={{
                      '& .MuiInputBase-root': {
                        bgcolor: (theme) => 
                          theme.palette.mode === 'dark' 
                            ? alpha(theme.palette.common.white, 0.05) 
                            : 'background.paper',
                      },
                    }}
                  />
                </Box>

                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    fullWidth
                    label="Identity Documents Required"
                    type="number"
                    value={identityRequired}
                    onChange={(e) => handleNumberChange(e.target.value, setIdentityRequired)}
                    InputProps={{
                      inputProps: { min: 0, max: 10 },
                    }}
                    helperText="Number of identity documents required (0-10)"
                    disabled={saving}
                    sx={{
                      '& .MuiInputBase-root': {
                        bgcolor: (theme) => 
                          theme.palette.mode === 'dark' 
                            ? alpha(theme.palette.common.white, 0.05) 
                            : 'background.paper',
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Employment and Education Row */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    fullWidth
                    label="Employment Documents Required"
                    type="number"
                    value={employmentRequired}
                    onChange={(e) => handleNumberChange(e.target.value, setEmploymentRequired)}
                    InputProps={{
                      inputProps: { min: 0, max: 10 },
                    }}
                    helperText="Number of employment documents required (0-10)"
                    disabled={saving}
                    sx={{
                      '& .MuiInputBase-root': {
                        bgcolor: (theme) => 
                          theme.palette.mode === 'dark' 
                            ? alpha(theme.palette.common.white, 0.05) 
                            : 'background.paper',
                      },
                    }}
                  />
                </Box>

                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    fullWidth
                    label="Education Documents Required"
                    type="number"
                    value={educationRequired}
                    onChange={(e) => handleNumberChange(e.target.value, setEducationRequired)}
                    InputProps={{
                      inputProps: { min: 0, max: 10 },
                    }}
                    helperText="Number of education documents required (0-10)"
                    disabled={saving}
                    sx={{
                      '& .MuiInputBase-root': {
                        bgcolor: (theme) => 
                          theme.palette.mode === 'dark' 
                            ? alpha(theme.palette.common.white, 0.05) 
                            : 'background.paper',
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mt: 4, borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Setting a requirement to 0 makes that document type optional.
                Candidates will only be able to submit onboarding when they meet all document requirements.
              </Typography>
            </Alert>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', p: 3 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={saving}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || saving}
          startIcon={saving ? <CircularProgress size={20} /> : undefined}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentRequirementsModal;
