import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  CircularProgress,
  Tooltip,
  Checkbox,
  Container,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { employmentRecordsService } from '../../services/employmentRecordsService';
import type { EmploymentRecord, EmploymentRecordFilters, EmploymentStatus } from '../../types/employmentRecords';
import EmploymentRecordForm from './EmploymentRecordForm';
import EmploymentRecordFiltersComponent from './EmploymentRecordFilters';
import EmploymentTerminationDialog from './EmploymentTerminationDialog';

interface EmploymentRecordsAdminProps {
  onError?: (error: string) => void;
}

const EmploymentRecordsAdmin: React.FC<EmploymentRecordsAdminProps> = ({ onError }) => {
  const [employmentRecords, setEmploymentRecords] = useState<EmploymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EmploymentRecord | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showTerminationDialog, setShowTerminationDialog] = useState(false);
  const [terminatingRecord, setTerminatingRecord] = useState<EmploymentRecord | null>(null);
  const [filters, setFilters] = useState<EmploymentRecordFilters>({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    clientId: '',
    userId: '',
    sort: 'createdAt',
    order: 'desc',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Load employment records
  const loadEmploymentRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await employmentRecordsService.getEmploymentRecords(filters);
      setEmploymentRecords(response.employmentRecords);
      
      // Ensure pagination object has all required properties
      const paginationData = response.pagination || {};
      setPagination({
        total: paginationData.total || 0,
        page: paginationData.page || 1,
        limit: paginationData.limit || 10,
        totalPages: paginationData.totalPages || 0,
        hasNext: paginationData.hasNext || false,
        hasPrev: paginationData.hasPrev || false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load employment records';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmploymentRecords();
  }, [filters]);

  // Handle record selection
  const handleSelectRecord = (recordId: string) => {
    setSelectedRecords(prev =>
      (prev || []).includes(recordId)
        ? (prev || []).filter(id => id !== recordId)
        : [...(prev || []), recordId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === employmentRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(employmentRecords.map(record => record.id));
    }
  };

  // Handle record creation
  const handleCreateRecord = async (recordData: Partial<EmploymentRecord>) => {
    try {
      await employmentRecordsService.createEmploymentRecord(recordData);
      setShowCreateForm(false);
      await loadEmploymentRecords();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create employment record';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  // Handle record editing
  const handleEditRecord = (record: EmploymentRecord) => {
    setEditingRecord(record);
  };

  const handleUpdateRecord = async (recordData: Partial<EmploymentRecord>) => {
    if (!editingRecord) return;
    
    try {
      await employmentRecordsService.updateEmploymentRecord(editingRecord.id, recordData);
      setEditingRecord(null);
      await loadEmploymentRecords();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update employment record';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  // Handle record termination
  const handleTerminateRecord = (record: EmploymentRecord) => {
    setTerminatingRecord(record);
    setShowTerminationDialog(true);
  };

  const handleConfirmTermination = async (terminationData: { endDate: string; reason?: string }) => {
    if (!terminatingRecord) return;
    
    try {
      await employmentRecordsService.terminateEmploymentRecord(terminatingRecord.id, terminationData);
      setShowTerminationDialog(false);
      setTerminatingRecord(null);
      await loadEmploymentRecords();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to terminate employment record';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  // Handle filters
  const handleFiltersChange = (newFilters: EmploymentRecordFilters) => {
    setFilters(newFilters);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Format date
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Filters with Action Buttons */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: showFilters ? 2 : 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Search & Filter
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              disabled={employmentRecords.length === 0}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateForm(true)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Add Employment Record
            </Button>
          </Box>
        </Box>
        {showFilters && (
          <Box sx={{ mt: 2 }}>
            <EmploymentRecordFiltersComponent
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClose={() => setShowFilters(false)}
            />
          </Box>
        )}
      </Paper>

      {/* Bulk Actions */}
      {selectedRecords.length > 0 && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 2, 
            mb: 3, 
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'primary.main',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {selectedRecords.length} record(s) selected
            </Typography>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => setSelectedRecords([])}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Clear Selection
            </Button>
          </Box>
        </Paper>
      )}

      {/* Data Table */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 12 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
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
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRecords.length === employmentRecords.length && employmentRecords.length > 0}
                        indeterminate={selectedRecords.length > 0 && selectedRecords.length < employmentRecords.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employmentRecords.map((record) => (
                    <TableRow 
                      key={record.id}
                      hover
                      sx={{
                        '&:hover': {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                        },
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedRecords?.includes(record.id) || false}
                          onChange={() => handleSelectRecord(record.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'primary.main',
                            }}
                          >
                            <PersonIcon fontSize="small" />
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {record.user?.firstName} {record.user?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {record.user?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'success.main',
                            }}
                          >
                            <BusinessIcon fontSize="small" />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {record.client?.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={record.role} 
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {formatDate(record.startDate)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {record.endDate ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {formatDate(record.endDate)}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Ongoing
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            bgcolor: (theme) => {
                              const statusColor = 
                                record.status === 'active' ? theme.palette.success.main :
                                record.status === 'terminated' ? theme.palette.error.main :
                                theme.palette.warning.main;
                              return alpha(statusColor, 0.1);
                            },
                            color: 
                              record.status === 'active' ? 'success.main' :
                              record.status === 'terminated' ? 'error.main' :
                              'warning.main',
                            border: '1px solid',
                            borderColor: 
                              record.status === 'active' ? 'success.main' :
                              record.status === 'terminated' ? 'error.main' :
                              'warning.main',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(record.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEditRecord(record)}
                              sx={{
                                color: 'primary.main',
                                '&:hover': {
                                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {record.status === 'active' && (
                            <Tooltip title="Terminate">
                              <IconButton
                                size="small"
                                onClick={() => handleTerminateRecord(record)}
                                sx={{
                                  color: 'error.main',
                                  '&:hover': {
                                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  p: 3, 
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} records
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    variant="outlined"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Previous
                  </Button>
                  <Button
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    variant="outlined"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Create/Edit Form Dialog */}
      <Dialog
        open={showCreateForm || !!editingRecord}
        onClose={() => {
          setShowCreateForm(false);
          setEditingRecord(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editingRecord ? 'Edit Employment Record' : 'Create Employment Record'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <EmploymentRecordForm
            record={editingRecord}
            onSubmit={editingRecord ? handleUpdateRecord : handleCreateRecord}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingRecord(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Termination Dialog */}
      <EmploymentTerminationDialog
        open={showTerminationDialog}
        record={terminatingRecord}
        onConfirm={handleConfirmTermination}
        onCancel={() => {
          setShowTerminationDialog(false);
          setTerminatingRecord(null);
        }}
      />
    </Container>
  );
};

export default EmploymentRecordsAdmin;
