import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Alert,
  Container,
  IconButton,
  Tooltip,
  Drawer,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add,
  Edit,
  Delete,
  Close,
  Business,
} from '@mui/icons-material';
import LayoutMUI from '../components/LayoutMUI';
import { clientService } from '../services/clientService';
import type { Client, CreateClientDto, UpdateClientDto } from '../types/client';
import type { ClientStatistics as ClientStats } from '../services/clientService';
import ClientStatistics from '../components/clients/ClientStatistics';
import ClientFilters from '../components/clients/ClientFilters';
import ClientTable from '../components/clients/ClientTable';

const ClientManagement: React.FC = () => {
  const theme = useTheme();
  
  // Data state
  const [clients, setClients] = useState<Client[]>([]);
  const [statistics, setStatistics] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [currentClient, setCurrentClient] = useState<Client | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Form data with structured contact fields
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    status: 'active' | 'inactive';
  }>({
    name: '',
    description: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    status: 'active',
  });

  const [formErrors, setFormErrors] = useState<{
    name?: string;
  }>({});

  // Load clients with filters
  const loadClients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = {
        page: currentPage + 1, // API uses 1-based page numbering
        limit: rowsPerPage,
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? (statusFilter as 'active' | 'inactive') : undefined,
      };

      const response = await clientService.getClients(queryParams);
      setClients(response.clients || []);
      setStatistics(response.statistics);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalClients(response.pagination?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  // Load clients when filters or pagination change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadClients();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [currentPage, rowsPerPage, searchQuery, statusFilter]);

  // Filter handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0); // Reset to first page
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(0); // Reset to first page
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(0); // Reset to first page when changing rows per page
  };

  // Drawer handlers
  const handleOpenCreateDrawer = () => {
    setDrawerMode('create');
    setCurrentClient(null);
    setFormData({
      name: '',
      description: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      status: 'active',
    });
    setFormErrors({});
    setDrawerOpen(true);
  };

  const handleOpenEditDrawer = (client: Client) => {
    setDrawerMode('edit');
    setCurrentClient(client);
    
    // Deserialize contactInfo JSON to populate individual fields
    let email = '';
    let phone = '';
    let street = '';
    let city = '';
    let state = '';
    let postalCode = '';
    let country = '';

    if (client.contactInfo) {
      email = client.contactInfo.email || '';
      phone = client.contactInfo.phone || '';
      if (client.contactInfo.address) {
        street = client.contactInfo.address.street || '';
        city = client.contactInfo.address.city || '';
        state = client.contactInfo.address.state || '';
        postalCode = client.contactInfo.address.postalCode || '';
        country = client.contactInfo.address.country || '';
      }
    }

    setFormData({
      name: client.name,
      description: client.description || '',
      email,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      status: client.status,
    });
    setFormErrors({});
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setCurrentClient(null);
    setFormData({
      name: '',
      description: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      status: 'active',
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: { name?: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Serialize to JSON
      const contactInfo: any = {};
      
      if (formData.email || formData.phone) {
        if (formData.email) contactInfo.email = formData.email.trim();
        if (formData.phone) contactInfo.phone = formData.phone.trim();
      }

      if (formData.street || formData.city || formData.state || formData.postalCode || formData.country) {
        contactInfo.address = {};
        if (formData.street) contactInfo.address.street = formData.street.trim();
        if (formData.city) contactInfo.address.city = formData.city.trim();
        if (formData.state) contactInfo.address.state = formData.state.trim();
        if (formData.postalCode) contactInfo.address.postalCode = formData.postalCode.trim();
        if (formData.country) contactInfo.address.country = formData.country.trim();
      }

      const dto: CreateClientDto | UpdateClientDto = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        contactInfo: Object.keys(contactInfo).length > 0 ? contactInfo : undefined,
        status: formData.status,
      };

      if (drawerMode === 'create') {
        await clientService.createClient(dto as CreateClientDto);
        setSuccessMessage('Client created successfully!');
      } else if (currentClient) {
        await clientService.updateClient(currentClient.id, dto as UpdateClientDto);
        setSuccessMessage('Client updated successfully!');
      }

      handleCloseDrawer();
      loadClients();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Delete handlers
  const handleOpenDeleteDialog = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    setLoading(true);
    setError(null);

    try {
      await clientService.deleteClient(clientToDelete.id);
      setSuccessMessage('Client deleted successfully!');
      handleCloseDeleteDialog();
      loadClients();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client');
      handleCloseDeleteDialog();
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutMUI>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Statistics */}
        <Box sx={{ mb: 4 }}>
          <ClientStatistics statistics={statistics} loading={loading} />
        </Box>

        {/* Success Message */}
        {successMessage && (
          <Alert
            severity="success"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setSuccessMessage(null)}
          >
            {successMessage}
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Search & Filter Section */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: theme.palette.divider }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Search & Filter
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenCreateDrawer}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Add Client
            </Button>
          </Box>
          <ClientFilters
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onSearchChange={handleSearch}
            onStatusChange={handleStatusFilter}
            onClearFilters={handleClearFilters}
          />
        </Paper>

        {/* Main Content */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: theme.palette.divider }}>
          {/* Header */}
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: theme.palette.divider }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={600}>Clients</Typography>
            </Box>
          </Box>

          {/* Client Table */}
          <Box sx={{ p: 0 }}>
            <ClientTable
              clients={clients}
              loading={loading}
              totalCount={totalClients}
              page={currentPage}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onEditClient={handleOpenEditDrawer}
              onDeleteClient={handleOpenDeleteDialog}
            />
          </Box>
        </Paper>

        {/* Create/Edit Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={handleCloseDrawer}
          PaperProps={{
            sx: {
              width: { xs: '100%', sm: 500 },
              p: 3,
            },
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {drawerMode === 'create' ? 'Add New Client' : 'Edit Client'}
            </Typography>
            <IconButton onClick={handleCloseDrawer} size="small">
              <Close />
            </IconButton>
          </Box>

          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Information */}
            <TextField
              label="Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!formErrors.name}
              helperText={formErrors.name}
              variant="outlined"
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              variant="outlined"
              placeholder="Enter client description..."
            />

            {/* Contact Information */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                Contact Information
              </Typography>
              
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  fullWidth
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  variant="outlined"
                  placeholder="client@example.com"
                />

                <TextField
                  label="Phone"
                  fullWidth
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  variant="outlined"
                  placeholder="+1 (555) 123-4567"
                />

                <TextField
                  label="Street Address"
                  fullWidth
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  variant="outlined"
                  placeholder="Street address"
                />

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="City"
                    fullWidth
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    variant="outlined"
                    placeholder="City"
                  />

                  <TextField
                    label="State"
                    fullWidth
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    variant="outlined"
                    placeholder="State/Province"
                  />
                </Stack>

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Postal Code"
                    fullWidth
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    variant="outlined"
                    placeholder="Postal code"
                  />

                  <TextField
                    label="Country"
                    fullWidth
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    variant="outlined"
                    placeholder="Country"
                  />
                </Stack>
              </Stack>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleCloseDrawer}
                sx={{ textTransform: 'none', py: 1.5 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                disabled={loading}
                sx={{ textTransform: 'none', py: 1.5 }}
              >
                {loading ? 'Saving...' : drawerMode === 'create' ? 'Create Client' : 'Update Client'}
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          PaperProps={{
            sx: { borderRadius: 2 },
          }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the client "{clientToDelete?.name}"? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button
              onClick={handleCloseDeleteDialog}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              color="error"
              disabled={loading}
              sx={{ textTransform: 'none' }}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LayoutMUI>
  );
};

export default ClientManagement;
