import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Typography,
  TablePagination,
  Alert,
  CircularProgress,
  Skeleton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  AssignmentTurnedIn as CompleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { EmploymentRecord, EmploymentRecordFilters, PaginatedResponse } from '../../types/employmentRecords';
import { employmentRecordsService } from '../../services/employmentRecordsService';
import EmploymentStatusBadge from './EmploymentStatusBadge';
import EmploymentRecordForm from './EmploymentRecordForm';

interface EmploymentRecordsTableProps {
  filters: EmploymentRecordFilters;
  onFiltersChange: (filters: EmploymentRecordFilters) => void;
  onRefresh: () => void;
}

const EmploymentRecordsTable: React.FC<EmploymentRecordsTableProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
}) => {
  const [records, setRecords] = useState<EmploymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRecord, setSelectedRecord] = useState<EmploymentRecord | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  // Load records
  const loadRecords = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response: PaginatedResponse<EmploymentRecord> = await employmentRecordsService.getEmploymentRecords(filters);
      setRecords(response.employmentRecords);
      setTotalCount(response.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employment records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [filters]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRecords(records.map(record => record.id));
    } else {
      setSelectedRecords([]);
    }
  };

  const handleSelectRecord = (recordId: string) => {
    setSelectedRecords(prev => 
      (prev || []).includes(recordId) 
        ? (prev || []).filter(id => id !== recordId)
        : [...(prev || []), recordId]
    );
  };

  const handleSort = (property: string) => {
    const isAsc = filters.sort === property && filters.order === 'asc';
    onFiltersChange({
      ...filters,
      sort: property,
      order: isAsc ? 'desc' : 'asc',
    });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    onFiltersChange({
      ...filters,
      page: newPage + 1,
    });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      page: 1,
      limit: parseInt(event.target.value, 10),
    });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, record: EmploymentRecord) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecord(record);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setShowEditForm(true);
    handleMenuClose();
  };

  const handleView = () => {
    setShowViewDialog(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
    handleMenuClose();
  };

  const handleStatusChange = async (status: string) => {
    if (selectedRecord) {
      try {
        await employmentRecordsService.updateEmploymentRecord(selectedRecord.id, {
          status: status as EmploymentStatus,
        });
        handleMenuClose();
        setSelectedRecord(null);
        await loadRecords();
      } catch (err) {
        console.error('Failed to update status:', err);
        setError(err instanceof Error ? err.message : 'Failed to update status');
        handleMenuClose();
        setSelectedRecord(null);
      }
    } else {
      handleMenuClose();
      setSelectedRecord(null);
    }
  };

  const handleBulkAction = (action: string) => {
    console.log('Bulk action:', action, selectedRecords);
    setSelectedRecords([]);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRecord) {
      try {
        await employmentRecordsService.deleteEmploymentRecord(selectedRecord.id, deleteReason);
        setShowDeleteDialog(false);
        setDeleteReason('');
        setSelectedRecord(null);
        await loadRecords();
      } catch (err) {
        console.error('Failed to delete record:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete record');
      }
    }
  };

  const handleFormSuccess = () => {
    setShowEditForm(false);
    setSelectedRecord(null);
    loadRecords();
  };

  const handleViewClose = () => {
    setShowViewDialog(false);
    setSelectedRecord(null);
  };

  const handleEditClose = () => {
    setShowEditForm(false);
    setSelectedRecord(null);
  };

  const handleDeleteClose = () => {
    setShowDeleteDialog(false);
    setDeleteReason('');
    setSelectedRecord(null);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (records.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          📋
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
          No employment records found
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Try adjusting your search or filter criteria
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Bulk Actions */}
      {selectedRecords.length > 0 && (
        <Box 
          sx={{ 
            p: 3, 
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {selectedRecords.length} record{selectedRecords.length > 1 ? 's' : ''} selected
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleBulkAction('activate')}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 0.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.75rem',
              }}
            >
              Activate
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<BlockIcon />}
              onClick={() => handleBulkAction('terminate')}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 0.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.75rem',
              }}
            >
              Terminate
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => handleBulkAction('export')}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 0.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.75rem',
              }}
            >
              Export
            </Button>
          </Stack>
        </Box>
      )}

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
                  indeterminate={selectedRecords.length > 0 && selectedRecords.length < records.length}
                  checked={records.length > 0 && selectedRecords.length === records.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                Employee
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                Client
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                Position
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                <TableSortLabel
                  active={filters.sort === 'startDate'}
                  direction={filters.sort === 'startDate' ? filters.order : 'asc'}
                  onClick={() => handleSort('startDate')}
                >
                  Start Date
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                <TableSortLabel
                  active={filters.sort === 'endDate'}
                  direction={filters.sort === 'endDate' ? filters.order : 'asc'}
                  onClick={() => handleSort('endDate')}
                >
                  End Date
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow 
                key={record.id} 
                sx={{ 
                  '&:hover': { bgcolor: 'action.hover' },
                  '&:last-child td': { borderBottom: 0 }
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedRecords?.includes(record.id) || false}
                    onChange={() => handleSelectRecord(record.id)}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      {getInitials(record.user?.firstName || '', record.user?.lastName || '')}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                        {record.user?.firstName} {record.user?.lastName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {record.user?.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {record.client?.name || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {record.position || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <EmploymentStatusBadge status={record.status} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {record.startDate ? format(new Date(record.startDate), 'MMM dd, yyyy') : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {record.endDate ? format(new Date(record.endDate), 'MMM dd, yyyy') : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, record)}
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
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalCount}
        page={filters.page - 1}
        onPageChange={handleChangePage}
        rowsPerPage={filters.limit}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          '& .MuiTablePagination-toolbar': {
            paddingLeft: 3,
            paddingRight: 3,
          },
        }}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Record</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('active')}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Active</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('inactive')}>
          <ListItemIcon>
            <BlockIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Inactive</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('terminated')}>
          <ListItemIcon>
            <BlockIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Terminated</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Record</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Form Dialog */}
      {selectedRecord && (
        <EmploymentRecordForm
          open={showEditForm}
          onClose={handleEditClose}
          onSuccess={handleFormSuccess}
          record={selectedRecord}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={showDeleteDialog} 
        onClose={handleDeleteClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle 
          sx={{
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
            borderBottom: '1px solid',
            borderColor: 'divider',
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'error.main',
            py: 2.5,
          }}
        >
          Delete Employment Record
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: 4 }}>
          <Typography variant="body1" sx={{ mb: 3, mt: 2, fontSize: '1.05rem' }}>
            Are you sure you want to delete this employment record? This action cannot be undone.
          </Typography>
          <TextField
            fullWidth
            label="Reason for deletion"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            multiline
            rows={3}
            placeholder="Please provide a reason for this deletion..."
            sx={{
              '& .MuiInputBase-root': {
                bgcolor: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.common.white, 0.09)
                    : 'background.paper',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleDeleteClose}
            variant="outlined"
            sx={{
              borderRadius: 1.5,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 1.5,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            Delete Record
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      {selectedRecord && (
        <Dialog 
          open={showViewDialog} 
          onClose={handleViewClose}
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
              fontSize: '1.75rem',
              fontWeight: 600,
              py: 2.5,
            }}
          >
            Employment Record Details
          </DialogTitle>
          <DialogContent sx={{ p: 4, pt: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              {/* Employee Info Row */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="caption" sx={{ 
                    textTransform: 'uppercase', 
                    fontWeight: 600,
                    color: 'text.secondary',
                    letterSpacing: '0.5px',
                    fontSize: '0.7rem',
                  }}>
                    Employee
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 600 }}>
                    {selectedRecord.user?.firstName} {selectedRecord.user?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRecord.user?.email}
                  </Typography>
                </Box>

                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="caption" sx={{ 
                    textTransform: 'uppercase', 
                    fontWeight: 600,
                    color: 'text.secondary',
                    letterSpacing: '0.5px',
                    fontSize: '0.7rem',
                  }}>
                    Client
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 600 }}>
                    {selectedRecord.client?.name || 'N/A'}
                  </Typography>
                </Box>
              </Box>

              {/* Role and Status Row */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="caption" sx={{ 
                    textTransform: 'uppercase', 
                    fontWeight: 600,
                    color: 'text.secondary',
                    letterSpacing: '0.5px',
                    fontSize: '0.7rem',
                  }}>
                    Role / Position
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 600 }}>
                    {selectedRecord.role}
                  </Typography>
                </Box>

                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="caption" sx={{ 
                    textTransform: 'uppercase', 
                    fontWeight: 600,
                    color: 'text.secondary',
                    letterSpacing: '0.5px',
                    fontSize: '0.7rem',
                  }}>
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <EmploymentStatusBadge status={selectedRecord.status} />
                  </Box>
                </Box>
              </Box>

              {/* Dates Row */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="caption" sx={{ 
                    textTransform: 'uppercase', 
                    fontWeight: 600,
                    color: 'text.secondary',
                    letterSpacing: '0.5px',
                    fontSize: '0.7rem',
                  }}>
                    Start Date
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 600 }}>
                    {selectedRecord.startDate ? format(new Date(selectedRecord.startDate), 'dd MMM yyyy') : 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="caption" sx={{ 
                    textTransform: 'uppercase', 
                    fontWeight: 600,
                    color: 'text.secondary',
                    letterSpacing: '0.5px',
                    fontSize: '0.7rem',
                  }}>
                    End Date
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 600 }}>
                    {selectedRecord.endDate ? format(new Date(selectedRecord.endDate), 'dd MMM yyyy') : 'Current'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={handleViewClose}
              variant="outlined"
              sx={{
                borderRadius: 1.5,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowViewDialog(false);
                setShowEditForm(true);
              }}
              variant="contained"
              sx={{
                borderRadius: 1.5,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Edit Record
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default EmploymentRecordsTable;
