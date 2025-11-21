/**
 * Bulk Salary Operations Component
 * Interface for managing multiple users' salary data
 */

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
  Checkbox,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import userService from '../../services/userService';
import type { User } from '../../services/userService';
import { salaryHistoryService } from '../../services/salaryHistoryService';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(161, 106, 232, 0.1)',
  border: '1px solid rgba(161, 106, 232, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(161, 106, 232, 0.15)',
  },
}));

interface BulkOperation {
  id: string;
  type: 'salary_increase' | 'salary_decrease' | 'salary_adjustment';
  amount: number;
  currency: string;
  effectiveDate: string;
  reason: string;
  userIds: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface BulkSalaryOperationsProps {
  onClose: () => void;
}

export const BulkSalaryOperations: React.FC<BulkSalaryOperationsProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOperation, setNewOperation] = useState<Partial<BulkOperation>>({
    type: 'salary_increase',
    amount: 0,
    currency: 'USD',
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: '',
    userIds: [],
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUsers({ limit: 100, status: 'active' });
      setUsers(response.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleCreateOperation = () => {
    if (!newOperation.type || !newOperation.amount || !newOperation.effectiveDate || !newOperation.reason) {
      setError('Please fill in all required fields');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    const operation: BulkOperation = {
      id: `op_${Date.now()}`,
      type: newOperation.type as any,
      amount: newOperation.amount!,
      currency: newOperation.currency!,
      effectiveDate: newOperation.effectiveDate!,
      reason: newOperation.reason!,
      userIds: selectedUsers,
      status: 'pending',
    };

    setOperations(prev => [...prev, operation]);
    setNewOperation({
      type: 'salary_increase',
      amount: 0,
      currency: 'USD',
      effectiveDate: new Date().toISOString().split('T')[0],
      reason: '',
      userIds: [],
    });
    setSelectedUsers([]);
    setShowCreateDialog(false);
    setError(null);
  };

  const handleExecuteOperation = async (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;

    try {
      setLoading(true);
      setError(null);

      // Update operation status to processing
      setOperations(prev => prev.map(op => 
        op.id === operationId ? { ...op, status: 'processing' } : op
      ));

      // Execute salary changes for each user
      const results = [];
      for (const userId of operation.userIds) {
        try {
          // This would call a bulk salary update API endpoint
          // For now, we'll simulate the operation
          await new Promise(resolve => setTimeout(resolve, 1000));
          results.push({ userId, success: true });
        } catch (err) {
          results.push({ userId, success: false, error: err instanceof Error ? err.message : 'Unknown error' });
        }
      }

      // Update operation status based on results
      const allSuccessful = results.every(r => r.success);
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, status: allSuccessful ? 'completed' : 'failed' }
          : op
      ));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute operation');
      setOperations(prev => prev.map(op => 
        op.id === operationId ? { ...op, status: 'failed' } : op
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOperation = (operationId: string) => {
    setOperations(prev => prev.filter(op => op.id !== operationId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'processing':
        return 'primary';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getOperationTypeLabel = (type: string) => {
    switch (type) {
      case 'salary_increase':
        return 'Salary Increase';
      case 'salary_decrease':
        return 'Salary Decrease';
      case 'salary_adjustment':
        return 'Salary Adjustment';
      default:
        return type;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return 'Unknown User';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600} color="#A16AE8">
          Bulk Salary Operations
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #A16AE8 0%, #8096FD 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #8B5AE8 0%, #6B86FD 100%)',
            },
          }}
        >
          Create Operation
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Operations List */}
      {operations.length > 0 ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
                <TableCell>Operation Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Effective Date</TableCell>
                <TableCell>Users</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {operations.map((operation) => (
                <TableRow key={operation.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <TrendingUpIcon sx={{ mr: 1, color: '#A16AE8' }} />
                      <Typography variant="body1" fontWeight={500}>
                        {getOperationTypeLabel(operation.type)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {operation.reason}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight={500}>
                      {formatCurrency(operation.amount, operation.currency)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">
                      {new Date(operation.effectiveDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {operation.userIds.slice(0, 3).map(userId => (
                        <Chip
                          key={userId}
                          label={getUserName(userId)}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {operation.userIds.length > 3 && (
                        <Chip
                          label={`+${operation.userIds.length - 3} more`}
                          size="small"
                          variant="outlined"
                          color="default"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={operation.status}
                      size="small"
                      color={getStatusColor(operation.status) as any}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={1}>
                      {operation.status === 'pending' && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={() => handleExecuteOperation(operation.id)}
                          disabled={loading}
                        >
                          Execute
                        </Button>
                      )}
                      {operation.status === 'completed' && (
                        <CheckIcon color="success" />
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteOperation(operation.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <StyledCard>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <TrendingUpIcon sx={{ fontSize: 64, color: '#E5E7EB', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Bulk Operations Created
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first bulk salary operation to manage multiple users at once.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #A16AE8 0%, #8096FD 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8B5AE8 0%, #6B86FD 100%)',
                },
              }}
            >
              Create Operation
            </Button>
          </CardContent>
        </StyledCard>
      )}

      {/* Create Operation Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Bulk Salary Operation</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Operation Type */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Operation Type</InputLabel>
              <Select
                value={newOperation.type}
                onChange={(e) => setNewOperation(prev => ({ ...prev, type: e.target.value as any }))}
                label="Operation Type"
              >
                <MenuItem value="salary_increase">Salary Increase</MenuItem>
                <MenuItem value="salary_decrease">Salary Decrease</MenuItem>
                <MenuItem value="salary_adjustment">Salary Adjustment</MenuItem>
              </Select>
            </FormControl>

            {/* Amount and Currency */}
            <Box display="flex" gap={2} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={newOperation.amount || ''}
                onChange={(e) => setNewOperation(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={newOperation.currency}
                  onChange={(e) => setNewOperation(prev => ({ ...prev, currency: e.target.value }))}
                  label="Currency"
                >
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="GBP">GBP</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Effective Date */}
            <TextField
              fullWidth
              label="Effective Date"
              type="date"
              value={newOperation.effectiveDate}
              onChange={(e) => setNewOperation(prev => ({ ...prev, effectiveDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
            />

            {/* Reason */}
            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={3}
              value={newOperation.reason}
              onChange={(e) => setNewOperation(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Enter reason for this salary change..."
              sx={{ mb: 3 }}
            />

            {/* User Selection */}
            <Typography variant="h6" gutterBottom>
              Select Users ({selectedUsers.length} selected)
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUsers.length === users.length && users.length > 0}
                        indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedUsers?.includes(user.id) || false}
                          onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.email}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          size="small"
                          color={user.status === 'active' ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateOperation}
            disabled={!newOperation.type || !newOperation.amount || !newOperation.effectiveDate || !newOperation.reason || selectedUsers.length === 0}
            sx={{
              background: 'linear-gradient(135deg, #A16AE8 0%, #8096FD 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8B5AE8 0%, #6B86FD 100%)',
              },
            }}
          >
            Create Operation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BulkSalaryOperations;
