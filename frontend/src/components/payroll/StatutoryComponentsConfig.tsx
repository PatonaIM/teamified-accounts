/**
 * Statutory Components Configuration Component
 * Manages statutory components (EPF, ESI, PT, TDS, SSS, PhilHealth, Pag-IBIG, etc.)
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  AccountBalance as EpfIcon,
  HealthAndSafety as EsiIcon,
  Receipt as PtIcon,
  Calculate as TdsIcon,
  Security as SssIcon,
  LocalHospital as PhilHealthIcon,
  Home as PagIbigIcon,
  SupervisedUserCircle as SuperIcon,
} from '@mui/icons-material';
import { useCountry } from '../../contexts/CountryContext';
import {
  getStatutoryComponents,
  createStatutoryComponent,
  updateStatutoryComponent,
  deleteStatutoryComponent,
} from '../../services/payroll/payrollService';
import type {
  StatutoryComponent,
  CreateStatutoryComponentDto,
  UpdateStatutoryComponentDto,
} from '../../types/payroll/payroll.types';
import {
  StatutoryComponentType,
  ContributionType,
  CalculationBasis,
} from '../../types/payroll/payroll.types';
import { getStatutoryComponentsForCountry } from '../../config/countryComponentMapping';

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

interface StatutoryComponentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStatutoryComponentDto | UpdateStatutoryComponentDto) => void;
  component?: StatutoryComponent;
  componentType: StatutoryComponentType;
}

const StatutoryComponentForm: React.FC<StatutoryComponentFormProps> = ({
  open,
  onClose,
  onSubmit,
  component,
  componentType,
}) => {
  const [formData, setFormData] = useState<CreateStatutoryComponentDto>({
    countryId: '',
    componentName: '',
    componentCode: '',
    componentType: componentType,
    contributionType: ContributionType.BOTH,
    calculationBasis: CalculationBasis.BASIC_SALARY,
    employeePercentage: 0,
    employerPercentage: 0,
    minimumAmount: 0,
    maximumAmount: 0,
    wageCeiling: 0,
    wageFloor: 0,
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    isMandatory: true,
    displayOrder: 0,
    description: '',
    regulatoryReference: '',
    isActive: true,
  });

  useEffect(() => {
    if (component) {
      setFormData({
        countryId: component.countryId,
        componentName: component.componentName,
        componentCode: component.componentCode,
        componentType: component.componentType,
        contributionType: component.contributionType,
        calculationBasis: component.calculationBasis,
        employeePercentage: component.employeePercentage || 0,
        employerPercentage: component.employerPercentage || 0,
        minimumAmount: component.minimumAmount || 0,
        maximumAmount: component.maximumAmount || 0,
        wageCeiling: component.wageCeiling || 0,
        wageFloor: component.wageFloor || 0,
        effectiveFrom: component.effectiveFrom,
        effectiveTo: component.effectiveTo || '',
        isMandatory: component.isMandatory,
        displayOrder: component.displayOrder,
        description: component.description || '',
        regulatoryReference: component.regulatoryReference || '',
        isActive: component.isActive,
      });
    } else {
      setFormData({
        countryId: '',
        componentName: '',
        componentCode: '',
        componentType: componentType,
        contributionType: ContributionType.BOTH,
        calculationBasis: CalculationBasis.BASIC_SALARY,
        employeePercentage: 0,
        employerPercentage: 0,
        minimumAmount: 0,
        maximumAmount: 0,
        wageCeiling: 0,
        wageFloor: 0,
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: '',
        isMandatory: true,
        displayOrder: 0,
        description: '',
        regulatoryReference: '',
        isActive: true,
      });
    }
  }, [component, componentType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof CreateStatutoryComponentDto) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: any } }
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSwitchChange = (field: keyof CreateStatutoryComponentDto) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };

  const textFieldSx = {
    '& .MuiInputBase-root': {
      bgcolor: (theme: any) =>
        theme.palette.mode === 'dark'
          ? alpha(theme.palette.common.white, 0.09)
          : 'background.paper',
    },
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {component ? 'Edit Statutory Component' : 'Create Statutory Component'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                  border: '1px solid',
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} color="primary.main" gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Component Name"
                      value={formData.componentName}
                      onChange={handleChange('componentName')}
                      required
                      data-testid="component-name"
                      sx={textFieldSx}
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
                      sx={textFieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Contribution Type</InputLabel>
                      <Select
                        value={formData.contributionType}
                        onChange={handleChange('contributionType')}
                        label="Contribution Type"
                        data-testid="contribution-type"
                        sx={{
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.common.white, 0.09)
                              : 'background.paper',
                        }}
                      >
                        <MenuItem value={ContributionType.EMPLOYEE}>Employee Only</MenuItem>
                        <MenuItem value={ContributionType.EMPLOYER}>Employer Only</MenuItem>
                        <MenuItem value={ContributionType.BOTH}>Both</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Calculation Basis</InputLabel>
                      <Select
                        value={formData.calculationBasis}
                        onChange={handleChange('calculationBasis')}
                        label="Calculation Basis"
                        data-testid="calculation-basis"
                        sx={{
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.common.white, 0.09)
                              : 'background.paper',
                        }}
                      >
                        <MenuItem value={CalculationBasis.GROSS_SALARY}>Gross Salary</MenuItem>
                        <MenuItem value={CalculationBasis.BASIC_SALARY}>Basic Salary</MenuItem>
                        <MenuItem value={CalculationBasis.CAPPED_AMOUNT}>Capped Amount</MenuItem>
                        <MenuItem value={CalculationBasis.FIXED_AMOUNT}>Fixed Amount</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Contribution Percentages Section */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.05),
                  border: '1px solid',
                  borderColor: (theme) => alpha(theme.palette.success.main, 0.2),
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} color="success.main" gutterBottom>
                  Contribution Percentages
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Employee Percentage"
                      type="number"
                      value={formData.employeePercentage}
                      onChange={handleChange('employeePercentage')}
                      disabled={formData.contributionType === ContributionType.EMPLOYER}
                      data-testid="employee-percentage"
                      sx={textFieldSx}
                      helperText={formData.contributionType === ContributionType.EMPLOYER ? 'Disabled (Employer only)' : ''}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Employer Percentage"
                      type="number"
                      value={formData.employerPercentage}
                      onChange={handleChange('employerPercentage')}
                      disabled={formData.contributionType === ContributionType.EMPLOYEE}
                      data-testid="employer-percentage"
                      sx={textFieldSx}
                      helperText={formData.contributionType === ContributionType.EMPLOYEE ? 'Disabled (Employee only)' : ''}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Amount Limits Section */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.05),
                  border: '1px solid',
                  borderColor: (theme) => alpha(theme.palette.warning.main, 0.2),
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} color="warning.main" gutterBottom>
                  Amount Limits & Wage Constraints
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Minimum Amount"
                      type="number"
                      value={formData.minimumAmount}
                      onChange={handleChange('minimumAmount')}
                      data-testid="minimum-amount"
                      sx={textFieldSx}
                      helperText="Minimum contribution amount"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Maximum Amount"
                      type="number"
                      value={formData.maximumAmount}
                      onChange={handleChange('maximumAmount')}
                      data-testid="maximum-amount"
                      sx={textFieldSx}
                      helperText="Maximum contribution amount"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Wage Ceiling"
                      type="number"
                      value={formData.wageCeiling}
                      onChange={handleChange('wageCeiling')}
                      data-testid="wage-ceiling"
                      sx={textFieldSx}
                      helperText="Maximum wage for calculation"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Wage Floor"
                      type="number"
                      value={formData.wageFloor}
                      onChange={handleChange('wageFloor')}
                      data-testid="wage-floor"
                      sx={textFieldSx}
                      helperText="Minimum wage for calculation"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Effective Period & Settings Section */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.05),
                  border: '1px solid',
                  borderColor: (theme) => alpha(theme.palette.info.main, 0.2),
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} color="info.main" gutterBottom>
                  Effective Period & Additional Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Effective From"
                      type="date"
                      value={formData.effectiveFrom}
                      onChange={handleChange('effectiveFrom')}
                      InputLabelProps={{ shrink: true }}
                      required
                      data-testid="effective-from"
                      sx={textFieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Effective To"
                      type="date"
                      value={formData.effectiveTo}
                      onChange={handleChange('effectiveTo')}
                      InputLabelProps={{ shrink: true }}
                      data-testid="effective-to"
                      sx={textFieldSx}
                      helperText="Leave empty for indefinite"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Display Order"
                      type="number"
                      value={formData.displayOrder}
                      onChange={handleChange('displayOrder')}
                      data-testid="display-order"
                      sx={textFieldSx}
                      helperText="Sort order in lists"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Regulatory Reference"
                      value={formData.regulatoryReference}
                      onChange={handleChange('regulatoryReference')}
                      data-testid="regulatory-reference"
                      sx={textFieldSx}
                      helperText="Legal reference or act"
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
                      sx={textFieldSx}
                      helperText="Internal notes and details"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box 
                      display="flex" 
                      gap={3} 
                      flexWrap="wrap"
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isMandatory}
                            onChange={handleSwitchChange('isMandatory')}
                            data-testid="is-mandatory"
                            color="error"
                          />
                        }
                        label="Mandatory Component"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isActive}
                            onChange={handleSwitchChange('isActive')}
                            data-testid="is-active"
                            color="success"
                          />
                        }
                        label="Active"
                      />
                    </Box>
                  </Grid>
                </Grid>
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

export const StatutoryComponentsConfig: React.FC = () => {
  const { selectedCountry } = useCountry();
  const [activeTab, setActiveTab] = useState(0);
  const [components, setComponents] = useState<StatutoryComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<StatutoryComponent | undefined>();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // All possible component types with their display configuration
  const allComponentTypes: { type: StatutoryComponentType; label: string; icon: React.ReactNode }[] = [
    { type: StatutoryComponentType.EPF, label: 'EPF', icon: <EpfIcon /> },
    { type: StatutoryComponentType.ESI, label: 'ESI', icon: <EsiIcon /> },
    { type: StatutoryComponentType.PT, label: 'PT', icon: <PtIcon /> },
    { type: StatutoryComponentType.TDS, label: 'TDS', icon: <TdsIcon /> },
    { type: StatutoryComponentType.SSS, label: 'SSS', icon: <SssIcon /> },
    { type: StatutoryComponentType.PHILHEALTH, label: 'PhilHealth', icon: <PhilHealthIcon /> },
    { type: StatutoryComponentType.PAGIBIG, label: 'Pag-IBIG', icon: <PagIbigIcon /> },
    { type: StatutoryComponentType.SUPERANNUATION, label: 'Superannuation', icon: <SuperIcon /> },
    { type: StatutoryComponentType.EPF_MY, label: 'EPF (Malaysia)', icon: <EpfIcon /> },
    { type: StatutoryComponentType.SOCSO, label: 'SOCSO', icon: <EsiIcon /> },
    { type: StatutoryComponentType.EIS, label: 'EIS', icon: <PtIcon /> },
    { type: StatutoryComponentType.CPF, label: 'CPF', icon: <TdsIcon /> },
  ];

  // Filter component types based on selected country
  const componentTypes = React.useMemo(() => {
    if (!selectedCountry) return [];
    
    const applicableTypes = getStatutoryComponentsForCountry(selectedCountry.code);
    return allComponentTypes.filter(ct => applicableTypes.includes(ct.type));
  }, [selectedCountry]);

  const loadComponents = async (componentType?: StatutoryComponentType) => {
    if (!selectedCountry) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getStatutoryComponents(
        selectedCountry.id,
        page,
        10,
        componentType,
        true
      );
      setComponents(response.components);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (err) {
      console.error('Error loading statutory components:', err);
      setError('Failed to load statutory components');
    } finally {
      setLoading(false);
    }
  };

  // Reset active tab when country changes if current tab is not available
  useEffect(() => {
    if (selectedCountry && componentTypes.length > 0) {
      if (activeTab >= componentTypes.length) {
        setActiveTab(0);
      }
      loadComponents();
    }
  }, [selectedCountry, page, componentTypes.length]);

  useEffect(() => {
    if (selectedCountry && componentTypes.length > 0) {
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

  const handleEdit = (component: StatutoryComponent) => {
    setEditingComponent(component);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateStatutoryComponentDto | UpdateStatutoryComponentDto) => {
    if (!selectedCountry) return;

    try {
      if (editingComponent) {
        await updateStatutoryComponent(selectedCountry.id, editingComponent.id, data as UpdateStatutoryComponentDto);
      } else {
        await createStatutoryComponent(selectedCountry.id, { ...data, countryId: selectedCountry.id } as CreateStatutoryComponentDto);
      }
      setFormOpen(false);
      loadComponents(componentTypes[activeTab]?.type);
    } catch (err) {
      console.error('Error saving statutory component:', err);
      setError('Failed to save statutory component');
    }
  };

  const handleDelete = async (id: string) => {
    if (!selectedCountry) return;

    if (window.confirm('Are you sure you want to delete this component?')) {
      try {
        await deleteStatutoryComponent(selectedCountry.id, id);
        loadComponents(componentTypes[activeTab]?.type);
      } catch (err) {
        console.error('Error deleting statutory component:', err);
        setError('Failed to delete statutory component');
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
          Please select a country to configure statutory components
        </Typography>
      </Card>
    );
  }

  if (componentTypes.length === 0) {
    return (
      <Card elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" color="text.secondary">
          No statutory components are configured for {selectedCountry.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          This country may not require statutory component configuration.
        </Typography>
      </Card>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Statutory Components Configuration
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={componentTypes.length === 0}
          data-testid="create-statutory-component-button"
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
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minWidth: 120,
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
                        <TableCell><strong>Contribution</strong></TableCell>
                        <TableCell><strong>Percentages</strong></TableCell>
                        <TableCell><strong>Amounts</strong></TableCell>
                        <TableCell><strong>Effective Period</strong></TableCell>
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
                              {component.contributionType}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              {component.employeePercentage && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Employee: {component.employeePercentage}%
                                </Typography>
                              )}
                              {component.employerPercentage && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Employer: {component.employerPercentage}%
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              {component.minimumAmount && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Min: {component.minimumAmount}
                                </Typography>
                              )}
                              {component.maximumAmount && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Max: {component.maximumAmount}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" display="block" color="text.secondary">
                              From: {new Date(component.effectiveFrom).toLocaleDateString()}
                            </Typography>
                            {component.effectiveTo && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                To: {new Date(component.effectiveTo).toLocaleDateString()}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1} flexWrap="wrap">
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

      <StatutoryComponentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        component={editingComponent}
        componentType={componentTypes[activeTab]?.type || StatutoryComponentType.EPF}
      />
    </Box>
  );
};

export default StatutoryComponentsConfig;
