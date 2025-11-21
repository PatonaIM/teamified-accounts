/**
 * Salary Timeline Component
 * Visual timeline showing salary changes over time using Material-UI Timeline component
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Card,
  CardContent,
  CardActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
// Timeline components replaced with standard Material-UI components
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  CurrencyExchange as CurrencyIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { salaryHistoryService } from '../../services/salaryHistoryService';
import type {
  SalaryHistory,
  SalaryHistoryFilters,
  EmploymentRecord,
  SalaryTimelineItem,
} from '../../types/salary-history.types';

interface SalaryTimelineProps {
  salaryHistory: SalaryHistory[];
  scheduledChanges: SalaryHistory[];
  selectedEmployment: EmploymentRecord | null;
  onEmploymentSelect: (employment: EmploymentRecord | null) => void;
  filters: SalaryHistoryFilters;
  onFiltersChange: (filters: Partial<SalaryHistoryFilters>) => void;
  isLoading: boolean;
}

export const SalaryTimeline: React.FC<SalaryTimelineProps> = ({
  salaryHistory,
  scheduledChanges,
  selectedEmployment,
  onEmploymentSelect,
  filters,
  onFiltersChange,
  isLoading,
}) => {
  const [timelineData, setTimelineData] = useState<SalaryTimelineItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<SalaryHistory[]>([]);
  
  // Action menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSalary, setSelectedSalary] = useState<SalaryHistory | null>(null);
  
  // Dialog states
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  // Process salary history into timeline items
  useEffect(() => {
    const allHistory = [...salaryHistory, ...scheduledChanges];
    const processed = processTimelineData(allHistory);
    setTimelineData(processed);
    setFilteredHistory(allHistory);
  }, [salaryHistory, scheduledChanges]);

  const processTimelineData = (history: SalaryHistory[]): SalaryTimelineItem[] => {
    const sortedHistory = history.sort((a, b) => 
      new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
    );

    const now = new Date();
    return sortedHistory.map((salary, index) => {
      const previousSalary = sortedHistory[index + 1];
      const isCurrent = new Date(salary.effectiveDate) <= now && 
                       (!previousSalary || new Date(previousSalary.effectiveDate) <= now);
      
      let isIncrease = false;
      let isDecrease = false;
      let changeAmount = 0;
      let changePercentage = 0;

      if (previousSalary && salary.salaryCurrency === previousSalary.salaryCurrency) {
        changeAmount = salary.salaryAmount - previousSalary.salaryAmount;
        changePercentage = salaryHistoryService.calculateChangePercentage(
          salary.salaryAmount,
          previousSalary.salaryAmount
        );
        isIncrease = changeAmount > 0;
        isDecrease = changeAmount < 0;
      }

      return {
        id: salary.id,
        salaryAmount: salary.salaryAmount,
        salaryCurrency: salary.salaryCurrency,
        effectiveDate: new Date(salary.effectiveDate),
        changeReason: salary.changeReason,
        changedByName: salary.changedByName,
        isScheduled: salary.isScheduled,
        isCurrent,
        isIncrease,
        isDecrease,
        changeAmount,
        changePercentage,
      };
    });
  };

  const getTimelineColor = (item: SalaryTimelineItem): string => {
    if (item.isCurrent) return 'primary';
    if (item.isScheduled) return 'warning';
    if (item.isIncrease) return 'success';
    if (item.isDecrease) return 'error';
    return 'grey';
  };

  const getTimelineIcon = (item: SalaryTimelineItem) => {
    if (item.isCurrent) return <CheckCircleIcon />;
    if (item.isScheduled) return <ScheduleIcon />;
    if (item.isIncrease) return <TrendingUpIcon />;
    if (item.isDecrease) return <TrendingDownIcon />;
    return <CurrencyIcon />;
  };

  const formatChangeText = (item: SalaryTimelineItem): string => {
    if (item.isCurrent) return 'Current Salary';
    if (item.isScheduled) return 'Scheduled Change';
    if (item.changeAmount !== 0) {
      const formattedAmount = salaryHistoryService.formatCurrency(
        Math.abs(item.changeAmount),
        item.salaryCurrency
      );
      const direction = item.isIncrease ? '+' : '-';
      return `${direction}${formattedAmount} (${item.changePercentage.toFixed(1)}%)`;
    }
    return 'Salary Record';
  };

  // Action handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, salary: SalaryHistory) => {
    setAnchorEl(event.currentTarget);
    setSelectedSalary(salary);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    setShowViewDialog(true);
    handleMenuClose();
  };

  const handleEdit = () => {
    setShowEditDialog(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSalary) return;
    
    try {
      await salaryHistoryService.deleteSalaryHistory(selectedSalary.id);
      setShowDeleteDialog(false);
      setDeleteReason('');
      setSelectedSalary(null);
      // Reload data by forcing parent to refresh
      window.location.reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete salary record');
    }
  };

  const handleViewClose = () => {
    setShowViewDialog(false);
    setSelectedSalary(null);
  };

  const handleEditClose = () => {
    setShowEditDialog(false);
    setSelectedSalary(null);
  };

  const handleDeleteClose = () => {
    setShowDeleteDialog(false);
    setDeleteReason('');
    setSelectedSalary(null);
  };

  const handleEmploymentFilterChange = (employmentId: string) => {
    if (employmentId === 'all') {
      onEmploymentSelect(null);
      onFiltersChange({ employmentId: null });
    } else {
      // Find employment by ID and select it
      onFiltersChange({ employmentId });
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Timeline Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Employment</InputLabel>
              <Select
                value={filters.employmentId || 'all'}
                onChange={(e) => handleEmploymentFilterChange(e.target.value)}
                label="Employment"
              >
                <MenuItem value="all">All Employments</MenuItem>
                {/* TODO: Add employment options */}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={filters.currency || 'all'}
                onChange={(e) => onFiltersChange({ 
                  currency: e.target.value === 'all' ? null : e.target.value 
                })}
                label="Currency"
              >
                <MenuItem value="all">All Currencies</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="CAD">CAD</MenuItem>
                <MenuItem value="AUD">AUD</MenuItem>
                <MenuItem value="JPY">JPY</MenuItem>
                <MenuItem value="CHF">CHF</MenuItem>
                <MenuItem value="CNY">CNY</MenuItem>
                <MenuItem value="INR">INR</MenuItem>
                <MenuItem value="BRL">BRL</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={filters.showScheduled && filters.showHistorical ? 'all' : 
                       filters.showScheduled ? 'scheduled' : 'historical'}
                onChange={(e) => {
                  const value = e.target.value;
                  onFiltersChange({
                    showScheduled: value === 'all' || value === 'scheduled',
                    showHistorical: value === 'all' || value === 'historical',
                  });
                }}
                label="Date Range"
              >
                <MenuItem value="all">All Changes</MenuItem>
                <MenuItem value="historical">Historical Only</MenuItem>
                <MenuItem value="scheduled">Scheduled Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Timeline */}
      {timelineData.length === 0 ? (
        <Alert severity="info">
          No salary history records found. Create your first salary record to get started.
        </Alert>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Salary Timeline
          </Typography>
          <Box>
            {timelineData.map((item, index) => (
              <Box key={item.id} sx={{ mb: 3, position: 'relative' }}>
                {/* Timeline line */}
                {index < timelineData.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 24,
                      top: 48,
                      bottom: -24,
                      width: 2,
                      bgcolor: 'divider',
                    }}
                  />
                )}
                
                <Box display="flex" alignItems="flex-start" gap={2}>
                  {/* Timeline dot */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: getTimelineColor(item) === 'primary' ? 'primary.main' :
                               getTimelineColor(item) === 'success' ? 'success.main' :
                               getTimelineColor(item) === 'warning' ? 'warning.main' : 'error.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      zIndex: 1,
                      position: 'relative',
                    }}
                  >
                    {getTimelineIcon(item)}
                  </Box>
                  
                  {/* Content */}
                  <Box flex={1}>
                    <Card>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                          <Typography variant="h6">
                            {salaryHistoryService.formatCurrency(item.salaryAmount, item.salaryCurrency)}
                          </Typography>
                          <Box display="flex" gap={1} alignItems="center">
                            <Chip
                              label={formatChangeText(item)}
                              color={item.isCurrent ? 'primary' : 
                                    item.isScheduled ? 'warning' :
                                    item.isIncrease ? 'success' : 'error'}
                              size="small"
                            />
                            {item.isScheduled && (
                              <Chip
                                size="small"
                                label={`${salaryHistoryService.calculateDaysUntilEffective(item.effectiveDate)} days`}
                                color="warning"
                                variant="outlined"
                              />
                            )}
                            {/* Action Menu Button */}
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                const salaryRecord = salaryHistory.find(s => s.id === item.id) || 
                                                     scheduledChanges.find(s => s.id === item.id);
                                if (salaryRecord) {
                                  handleMenuOpen(e, salaryRecord);
                                }
                              }}
                              sx={{ ml: 1 }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {item.changeReason}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            {item.effectiveDate.toLocaleDateString()}
                          </Typography>
                          {item.changedByName && (
                            <Typography variant="caption" color="text.secondary">
                              Changed by: {item.changedByName}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* View Details Dialog */}
      <Dialog
        open={showViewDialog}
        onClose={handleViewClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: '#ffffff',
            backgroundImage: 'linear-gradient(135deg, rgba(161, 106, 232, 0.02) 0%, rgba(128, 150, 253, 0.02) 100%)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #A16AE8 0%, #8096FD 100%)',
            color: 'white',
            borderBottom: '1px solid #E5E7EB',
            fontSize: '1.25rem',
            fontWeight: 600,
            py: 2,
          }}
        >
          Salary History Details
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {selectedSalary && (
              <>
                <Box>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', fontSize: '0.7rem', color: 'text.secondary' }}>
                    Salary Amount
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {salaryHistoryService.formatCurrency(selectedSalary.salaryAmount, selectedSalary.salaryCurrency)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', fontSize: '0.7rem', color: 'text.secondary' }}>
                    Effective Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {new Date(selectedSalary.effectiveDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', fontSize: '0.7rem', color: 'text.secondary' }}>
                    Change Reason
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {selectedSalary.changeReason || 'N/A'}
                  </Typography>
                </Box>
                {selectedSalary.changedByName && (
                  <Box>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', fontSize: '0.7rem', color: 'text.secondary' }}>
                      Changed By
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {selectedSalary.changedByName}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #E5E7EB' }}>
          <Button
            onClick={handleViewClose}
            variant="outlined"
            sx={{
              borderRadius: 1.5,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              borderColor: 'rgba(161, 106, 232, 0.5)',
              color: '#A16AE8',
              '&:hover': {
                borderColor: '#A16AE8',
                backgroundColor: 'rgba(161, 106, 232, 0.04)',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={handleDeleteClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: '#ffffff',
            backgroundImage: 'linear-gradient(135deg, rgba(239, 68, 68, 0.02) 0%, rgba(220, 38, 38, 0.02) 100%)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            borderBottom: '1px solid #E5E7EB',
            fontSize: '1.25rem',
            fontWeight: 600,
            py: 2,
          }}
        >
          Delete Salary Record
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: 4 }}>
          <Typography variant="body1" sx={{ mb: 3, mt: 2 }}>
            Are you sure you want to delete this salary record? This action cannot be undone.
          </Typography>
          {selectedSalary && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(239, 68, 68, 0.05)', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {salaryHistoryService.formatCurrency(selectedSalary.salaryAmount, selectedSalary.salaryCurrency)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Effective: {new Date(selectedSalary.effectiveDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            label="Reason for Deletion (Optional)"
            multiline
            rows={3}
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#ef4444',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#ef4444',
                  borderWidth: 2,
                },
              },
            }}
          />
          {actionError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {actionError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #E5E7EB' }}>
          <Button
            onClick={handleDeleteClose}
            variant="outlined"
            sx={{
              borderRadius: 1.5,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              borderColor: 'rgba(239, 68, 68, 0.5)',
              color: '#ef4444',
              '&:hover': {
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.04)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              borderRadius: 1.5,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
              },
            }}
          >
            Delete Record
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
