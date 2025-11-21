/**
 * Salary Components Configuration Component
 * Manages salary components (earnings, deductions, benefits, reimbursements)
 * Styled following Material-UI 3 Expressive Design System
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Fab,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AttachMoney as EarningsIcon,
  Remove as DeductionsIcon,
  CardGiftcard as BenefitsIcon,
  Receipt as ReimbursementsIcon,
} from '@mui/icons-material';
import { useCountry } from '../../contexts/CountryContext';
import {
  getSalaryComponents,
  createSalaryComponent,
  updateSalaryComponent,
  deleteSalaryComponent,
} from '../../services/payroll/payrollService';
import type {
  SalaryComponent,
  CreateSalaryComponentDto,
  UpdateSalaryComponentDto,
} from '../../types/payroll/payroll.types';
import {
  SalaryComponentType,
  CalculationType,
} from '../../types/payroll/payroll.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

interface SalaryComponentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSalaryComponentDto | UpdateSalaryComponentDto) => void;
  component?: SalaryComponent;
  componentType: SalaryComponentType;
}

const SalaryComponentForm: React.FC<SalaryComponentFormProps> = ({
  open,
  onClose,
  onSubmit,
  component,
  componentType,
}) => {
  const [formData, setFormData] = useState<CreateSalaryComponentDto>({
    countryId: '',
    componentName: '',
    componentCode: '',
    componentType: componentType,
    calculationType: CalculationType.FIXED_AMOUNT,
    calculationValue: 0,
    isTaxable: true,
    isStatutory: false,
    isMandatory: false,
    displayOrder: 0,
    description: '',
    isActive: true,
  });

  useEffect(() => {
    if (component) {
      setFormData({
        countryId: component.countryId,
        componentName: component.componentName,
        componentCode: component.componentCode,
        componentType: component.componentType,
        calculationType: component.calculationType,
        calculationValue: component.calculationValue || 0,
        calculationFormula: component.calculationFormula,
        isTaxable: component.isTaxable,
        isStatutory: component.isStatutory,
        isMandatory: component.isMandatory,
        displayOrder: component.displayOrder,
        description: component.description || '',
        isActive: component.isActive,
      });
    } else {
      setFormData({
        countryId: '',
        componentName: '',
        componentCode: '',
        componentType: componentType,
        calculationType: CalculationType.FIXED_AMOUNT,
        calculationValue: 0,
        isTaxable: true,
        isStatutory: false,
        isMandatory: false,
        displayOrder: 0,
        description: '',
        isActive: true,
      });
    }
  }, [component, componentType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof CreateSalaryComponentDto) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: any } }
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSwitchChange = (field: keyof CreateSalaryComponentDto) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {component ? 'Edit Salary Component' : 'Create Salary Component'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Component Name"
                value={formData.componentName}
                onChange={handleChange('componentName')}
                required
                data-testid="component-name"
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.common.white, 0.09)
                        : 'background.paper',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Component Code"
                value={formData.componentCode}
                onChange={handleChange('componentCode')}
                required
                data-testid="component-code"
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.common.white, 0.09)
                        : 'background.paper',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Calculation Type</InputLabel>
                <Select
                  value={formData.calculationType}
                  onChange={handleChange('calculationType')}
                  label="Calculation Type"
                  data-testid="calculation-type"
                  sx={{
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.common.white, 0.09)
                        : 'background.paper',
                  }}
                >
                  <MenuItem value={CalculationType.FIXED_AMOUNT}>Fixed Amount</MenuItem>
                  <MenuItem value={CalculationType.PERCENTAGE_OF_BASIC}>Percentage of Basic</MenuItem>
                  <MenuItem value={CalculationType.PERCENTAGE_OF_GROSS}>Percentage of Gross</MenuItem>
                  <MenuItem value={CalculationType.PERCENTAGE_OF_NET}>Percentage of Net</MenuItem>
                  <MenuItem value={CalculationType.FORMULA}>Formula</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              {formData.calculationType !== CalculationType.FORMULA ? (
                <TextField
                  fullWidth
                  label="Calculation Value"
                  type="number"
                  value={formData.calculationValue}
                  onChange={handleChange('calculationValue')}
                  required
                  data-testid="calculation-value"
                  sx={{
                    '& .MuiInputBase-root': {
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.common.white, 0.09)
                          : 'background.paper',
                    },
                  }}
                />
              ) : (
                <TextField
                  fullWidth
                  label="Calculation Formula"
                  value={formData.calculationFormula || ''}
                  onChange={handleChange('calculationFormula')}
                  required
                  data-testid="calculation-formula"
                  sx={{
                    '& .MuiInputBase-root': {
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.common.white, 0.09)
                          : 'background.paper',
                    },
                  }}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Display Order"
                type="number"
                value={formData.displayOrder}
                onChange={handleChange('displayOrder')}
                data-testid="display-order"
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.common.white, 0.09)
                        : 'background.paper',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange('description')}
                data-testid="description"
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.common.white, 0.09)
                        : 'background.paper',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" gap={2} flexWrap="wrap">
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isTaxable}
                      onChange={handleSwitchChange('isTaxable')}
                      data-testid="is-taxable"
                    />
                  }
                  label="Taxable"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isStatutory}
                      onChange={handleSwitchChange('isStatutory')}
                      data-testid="is-statutory"
                    />
                  }
                  label="Statutory"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isMandatory}
                      onChange={handleSwitchChange('isMandatory')}
                      data-testid="is-mandatory"
                    />
                  }
                  label="Mandatory"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleSwitchChange('isActive')}
                      data-testid="is-active"
                    />
                  }
                  label="Active"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" data-testid="submit-button">
            {component ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export const SalaryComponentsConfig: React.FC = () => {
  const { selectedCountry } = useCountry();
  const [activeTab, setActiveTab] = useState(0);
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<SalaryComponent | undefined>();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Salary component types (earnings, deductions, benefits, reimbursements) are 
  // applicable across all countries as they represent basic compensation structures.
  // Country-specific rules are enforced at the calculation level via backend services.
  const componentTypes: { type: SalaryComponentType; label: string; icon: React.ReactNode }[] = [
    { type: SalaryComponentType.EARNINGS, label: 'Earnings', icon: <EarningsIcon /> },
    { type: SalaryComponentType.DEDUCTIONS, label: 'Deductions', icon: <DeductionsIcon /> },
    { type: SalaryComponentType.BENEFITS, label: 'Benefits', icon: <BenefitsIcon /> },
    { type: SalaryComponentType.REIMBURSEMENTS, label: 'Reimbursements', icon: <ReimbursementsIcon /> },
  ];

  const loadComponents = async (componentType?: SalaryComponentType) => {
    if (!selectedCountry) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getSalaryComponents(
        selectedCountry.id,
        page,
        10,
        componentType,
        true
      );
      setComponents(response.components);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (err) {
      console.error('Error loading salary components:', err);
      setError('Failed to load salary components');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCountry) {
      loadComponents();
    }
  }, [selectedCountry, page]);

  useEffect(() => {
    if (selectedCountry) {
      const componentType = componentTypes[activeTab]?.type;
      loadComponents(componentType);
    }
  }, [activeTab, selectedCountry]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(1);
  };

  const handleCreate = () => {
    setEditingComponent(undefined);
    setFormOpen(true);
  };

  const handleEdit = (component: SalaryComponent) => {
    setEditingComponent(component);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateSalaryComponentDto | UpdateSalaryComponentDto) => {
    if (!selectedCountry) return;

    try {
      if (editingComponent) {
        await updateSalaryComponent(selectedCountry.id, editingComponent.id, data as UpdateSalaryComponentDto);
      } else {
        await createSalaryComponent(selectedCountry.id, { ...data, countryId: selectedCountry.id } as CreateSalaryComponentDto);
      }
      setFormOpen(false);
      loadComponents(componentTypes[activeTab]?.type);
    } catch (err) {
      console.error('Error saving salary component:', err);
      setError('Failed to save salary component');
    }
  };

  const handleDelete = async (id: string) => {
    if (!selectedCountry) return;

    if (window.confirm('Are you sure you want to delete this component?')) {
      try {
        await deleteSalaryComponent(selectedCountry.id, id);
        loadComponents(componentTypes[activeTab]?.type);
      } catch (err) {
        console.error('Error deleting salary component:', err);
        setError('Failed to delete salary component');
      }
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  if (!selectedCountry) {
    return (
      <Card elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" color="text.secondary">
          Please select a country to configure salary components
        </Typography>
      </Card>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Salary Components Configuration
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          data-testid="create-salary-component-button"
        >
          Add Component
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
            },
          }}
        >
          {componentTypes.map(({ type, label, icon }, index) => (
            <Tab
              key={type}
              label={label}
              icon={icon}
              iconPosition="start"
              data-testid={`${type}-tab`}
            />
          ))}
        </Tabs>

        {componentTypes.map(({ type }, index) => (
          <TabPanel key={type} value={activeTab} index={index}>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.common.white, 0.05)
                              : alpha(theme.palette.common.black, 0.04),
                        }}
                      >
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Code</strong></TableCell>
                        <TableCell><strong>Calculation</strong></TableCell>
                        <TableCell><strong>Value</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {components.map((component) => (
                        <TableRow key={component.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {component.componentName}
                              </Typography>
                              {component.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {component.description}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={component.componentCode}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {component.calculationType.replace(/_/g, ' ')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {component.calculationType === CalculationType.FORMULA
                                ? component.calculationFormula
                                : component.calculationValue
                              }
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1} flexWrap="wrap">
                              {component.isTaxable && (
                                <Chip 
                                  label="Taxable" 
                                  size="small" 
                                  sx={{
                                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                                    color: 'success.main',
                                    border: '1px solid',
                                    borderColor: 'success.main',
                                  }}
                                />
                              )}
                              {component.isStatutory && (
                                <Chip 
                                  label="Statutory" 
                                  size="small" 
                                  sx={{
                                    bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                                    color: 'warning.main',
                                    border: '1px solid',
                                    borderColor: 'warning.main',
                                  }}
                                />
                              )}
                              {component.isMandatory && (
                                <Chip 
                                  label="Mandatory" 
                                  size="small" 
                                  sx={{
                                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                                    color: 'error.main',
                                    border: '1px solid',
                                    borderColor: 'error.main',
                                  }}
                                />
                              )}
                              {!component.isActive && (
                                <Chip 
                                  label="Inactive" 
                                  size="small" 
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEdit(component)}
                                  data-testid={`edit-${component.id}`}
                                  sx={{
                                    color: (theme) => 
                                      theme.palette.mode === 'dark' 
                                        ? alpha(theme.palette.common.white, 0.9)
                                        : 'action.active',
                                    '&:hover': {
                                      backgroundColor: 'action.hover',
                                      color: 'primary.main',
                                    },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(component.id)}
                                  data-testid={`delete-${component.id}`}
                                  sx={{
                                    color: (theme) => 
                                      theme.palette.mode === 'dark' 
                                        ? alpha(theme.palette.common.white, 0.9)
                                        : 'action.active',
                                    '&:hover': {
                                      backgroundColor: 'action.hover',
                                      color: 'error.main',
                                    },
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {totalPages > 1 && (
                  <Box display="flex" justifyContent="center" mt={3} sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      data-testid="pagination"
                    />
                  </Box>
                )}
              </>
            )}
          </TabPanel>
        ))}
      </Card>

      <SalaryComponentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        component={editingComponent}
        componentType={componentTypes[activeTab]?.type || SalaryComponentType.EARNINGS}
      />
    </Box>
  );
};

export default SalaryComponentsConfig;
