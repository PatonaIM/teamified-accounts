import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Alert,
  Container,
  Tabs,
  Tab,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Add, Group, Mail } from '@mui/icons-material';
import LayoutMUI from '../components/LayoutMUI';
import userService from '../services/userService';
import type { User, UserQueryParams } from '../services/userService';
import UserList from '../components/UserList';
import BulkOperations from '../components/BulkOperations';
import RoleManagementDialog from '../components/RoleManagementDialog';
import UserProfileModal from '../components/UserProfileModal';
import UserStatistics from '../components/users/UserStatistics';
import UserFilters from '../components/users/UserFilters';
import InvitationFormModal from '../components/invitations/InvitationFormModal';
import InvitationStatistics from '../components/invitations/InvitationStatistics';
import InvitationFilters, { type InvitationFilterState } from '../components/invitations/InvitationFilters';
import InvitationList from '../components/InvitationList';
import { useClient } from '../contexts/ClientContext';

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 48,
  textTransform: 'none',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
  '& .MuiSvgIcon-root': {
    color: 'inherit',
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-mgmt-tabpanel-${index}`}
      aria-labelledby={`user-mgmt-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const UserManagement: React.FC = () => {
  const { selectedClient } = useClient();
  const [activeTab, setActiveTab] = useState(0);
  
  // Users tab state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [roleManagementUser, setRoleManagementUser] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [profileModalMode, setProfileModalMode] = useState<'create' | 'edit'>('edit');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Invitations tab state
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [invitationRefreshKey, setInvitationRefreshKey] = useState(0);
  const [invitationFilters, setInvitationFilters] = useState<InvitationFilterState>({
    search: '',
    status: 'all',
    role: 'all',
  });
  const [invitationStatistics] = useState({
    totalInvitations: 45,
    pendingInvitations: 12,
    acceptedInvitations: 28,
    expiredInvitations: 5,
  });

  const loadUsers = async (params: UserQueryParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = {
        page: currentPage,
        limit: 20,
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        clientId: selectedClient?.id,
        ...params,
      };

      const response = await userService.getUsers(queryParams);
      setUsers(response.users || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalUsers(response.pagination?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClient]);

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchQuery, statusFilter, selectedClient]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleUserSelect = (userId: string, selected: boolean) => {
    if (selected) {
      setSelectedUsers(prev => [...(prev || []), userId]);
    } else {
      setSelectedUsers(prev => (prev || []).filter(id => id !== userId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleCreateUser = () => {
    setProfileUser(null);
    setProfileModalMode('create');
    setShowProfileModal(true);
  };

  const handleEditUser = (user: User) => {
    setProfileUser(user);
    setProfileModalMode('edit');
    setShowProfileModal(true);
  };

  const handleManageRoles = (user: User) => {
    setRoleManagementUser(user);
    setShowRoleDialog(true);
  };

  const handleRoleManagementSaved = () => {
    setShowRoleDialog(false);
    setRoleManagementUser(null);
    // Optionally reload users if needed
  };

  const handleBulkOperation = async (operation: string, data: any) => {
    try {
      let response;
      
      switch (operation) {
        case 'status':
          response = await userService.bulkUpdateStatus({
            userIds: selectedUsers,
            status: data.status,
          });
          break;
        case 'role':
          response = await userService.bulkAssignRole({
            userIds: selectedUsers,
            role: data.role,
            scope: data.scope,
            scopeId: data.scopeId,
          });
          break;
        default:
          throw new Error('Unknown bulk operation');
      }

      // Handle response and show results
      console.log('Bulk operation completed:', response);
      
      // Clear selection and reload users
      setSelectedUsers([]);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk operation failed');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Invitation handlers
  const handleCreateInvitationSuccess = () => {
    setShowInvitationModal(false);
    setSuccessMessage('Invitation created successfully!');
    setInvitationRefreshKey(prev => prev + 1);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleInvitationFiltersChange = (newFilters: InvitationFilterState) => {
    setInvitationFilters(newFilters);
  };

  const handleInvitationRefresh = () => {
    setInvitationRefreshKey(prev => prev + 1);
  };

  return (
    <LayoutMUI>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="user management tabs"
            TabIndicatorProps={{
              sx: { backgroundColor: 'primary.main', height: 3 }
            }}
          >
            <StyledTab
              icon={<Group />}
              iconPosition="start"
              label="Users"
              id="user-mgmt-tab-0"
              aria-controls="user-mgmt-tabpanel-0"
            />
            <StyledTab
              icon={<Mail />}
              iconPosition="start"
              label="Invitations"
              id="user-mgmt-tab-1"
              aria-controls="user-mgmt-tabpanel-1"
            />
          </Tabs>
        </Box>

        {/* Users Tab */}
        <TabPanel value={activeTab} index={0}>
          {/* Statistics */}
          <Box sx={{ mb: 4 }}>
            <UserStatistics users={users} loading={loading} />
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Filters with Add User Button */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Search & Filter
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateUser}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Add User
              </Button>
            </Box>
            <UserFilters
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              onSearchChange={handleSearch}
              onStatusChange={handleStatusFilter}
              onClearFilters={() => handleStatusFilter('all')}
            />
          </Paper>

          {/* Main Content */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Users
                  </Typography>
                  <Chip
                    label={`${totalUsers} total`}
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                {(selectedUsers || []).length > 0 && (
                  <BulkOperations
                    selectedCount={(selectedUsers || []).length}
                    onOperation={handleBulkOperation}
                  />
                )}
              </Box>
            </Box>

            <Box sx={{ p: 0 }}>
              <UserList
                users={users}
                loading={loading}
                selectedUsers={selectedUsers}
                onUserSelect={handleUserSelect}
                onSelectAll={handleSelectAll}
                onEditUser={handleEditUser}
                onManageRoles={handleManageRoles}
                onPageChange={handlePageChange}
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </Box>
          </Paper>
        </TabPanel>

        {/* Invitations Tab */}
        <TabPanel value={activeTab} index={1}>
          {/* Statistics */}
          <Box sx={{ mb: 4 }}>
            <InvitationStatistics
              totalInvitations={invitationStatistics.totalInvitations}
              pendingInvitations={invitationStatistics.pendingInvitations}
              acceptedInvitations={invitationStatistics.acceptedInvitations}
              expiredInvitations={invitationStatistics.expiredInvitations}
            />
          </Box>

          {/* Success Message */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          {/* Filters with Create Button */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Search & Filter
              </Typography>
              <Button
                onClick={() => setShowInvitationModal(true)}
                variant="contained"
                startIcon={<Add />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Create Invitation
              </Button>
            </Box>
            <InvitationFilters
              filters={invitationFilters}
              onFiltersChange={handleInvitationFiltersChange}
              onSearchChange={(search) => setInvitationFilters({ ...invitationFilters, search })}
            />
          </Paper>

          {/* Data Table */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Invitation List
              </Typography>
            </Box>

            <Box sx={{ p: 0 }}>
              <InvitationList
                key={invitationRefreshKey}
                onRefresh={handleInvitationRefresh}
                filters={invitationFilters}
              />
            </Box>
          </Paper>
        </TabPanel>

        {/* Role Management Dialog */}
        <RoleManagementDialog
          user={roleManagementUser}
          open={showRoleDialog}
          onClose={() => {
            setShowRoleDialog(false);
            setRoleManagementUser(null);
          }}
          onSave={handleRoleManagementSaved}
        />

        {/* User Profile Modal (for both create and edit) */}
        <UserProfileModal
          user={profileUser}
          open={showProfileModal}
          mode={profileModalMode}
          onClose={() => {
            setShowProfileModal(false);
            setProfileUser(null);
          }}
          onProfileUpdated={() => {
            // Refresh the user list
            loadUsers();
          }}
        />

        {/* Create Invitation Form Modal */}
        <InvitationFormModal
          open={showInvitationModal}
          onClose={() => setShowInvitationModal(false)}
          onSuccess={handleCreateInvitationSuccess}
        />
      </Container>
    </LayoutMUI>
  );
};

export default UserManagement;
