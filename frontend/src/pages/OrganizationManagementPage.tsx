import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Button,
  Chip,
  Tabs,
  Tab,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Menu,
} from '@mui/material';
import { Search, Add, Business, ArrowBack, Edit, Warning, CameraAlt, MoreVert, PersonRemove, PersonOff } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import organizationsService, { type Organization, type OrganizationMember, type GlobalSearchResponse } from '../services/organizationsService';
import userService from '../services/userService';
import OrganizationInvitationModal from '../components/invitations/OrganizationInvitationModal';

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
      id={`organization-tabpanel-${index}`}
      aria-labelledby={`organization-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const OrganizationManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Organizations state
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination state (Load More strategy)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrgs, setTotalOrgs] = useState(0);
  const [hasMoreOrgs, setHasMoreOrgs] = useState(true);
  
  // Global search state
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchResponse | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Members state
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  
  // Members pagination state (Load More strategy)
  const [displayedMembersCount, setDisplayedMembersCount] = useState(10);
  const membersPerPage = 10;

  // Tab state (0: Users, 1: Company Profile, 2: Billing Details, 3: Delete Organization)
  const [activeTab, setActiveTab] = useState(0);

  // Dialog state
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false);
  const [createOrgLoading, setCreateOrgLoading] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgSlug, setNewOrgSlug] = useState('');
  const [slugError, setSlugError] = useState<string | null>(null);
  
  // Edit state (now inline in Company Profile tab)
  const [editOrgData, setEditOrgData] = useState<Organization | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Delete state (for Delete Organization tab)
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Invitation state
  const [showInvitationModal, setShowInvitationModal] = useState(false);

  // Logo upload state
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // User management menu state
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  
  // Confirmation dialogs state
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showNLWFConfirm, setShowNLWFConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Prevent duplicate API calls by tracking if we're already loading
  const loadingRef = React.useRef(false);

  // Load organizations on mount
  useEffect(() => {
    const loadData = async () => {
      if (loadingRef.current) return;
      
      loadingRef.current = true;
      try {
        await loadOrganizations();
      } finally {
        loadingRef.current = false;
      }
    };
    
    loadData();
  }, []);

  // Auto-reload when search changes, reset pagination
  useEffect(() => {
    const loadData = async () => {
      // Skip if already loading to prevent duplicate calls
      if (loadingRef.current) return;
      
      loadingRef.current = true;
      try {
        setCurrentPage(1);
        await loadOrganizations(false);
      } finally {
        loadingRef.current = false;
      }
    };
    
    loadData();
  }, [searchQuery]);

  useEffect(() => {
    if (selectedOrg) {
      loadMembers();
    }
  }, [selectedOrg]);

  // Reset edit data and members page when selectedOrg changes
  useEffect(() => {
    if (selectedOrg) {
      setEditOrgData(selectedOrg);
      setIsEditingProfile(false);
      setDeleteConfirmSlug('');
      setDisplayedMembersCount(10);
      setMemberSearchQuery(''); // Clear member search when switching organizations
    }
  }, [selectedOrg]);

  // Handle navigation state to restore selected organization OR select first org on fresh load
  useEffect(() => {
    if (organizations.length === 0) return;

    // Get sorted organizations to select the first in display order
    const sorted = [...organizations].sort((a, b) => {
      const tierDiff = getSubscriptionPriority(b.subscriptionTier) - getSubscriptionPriority(a.subscriptionTier);
      if (tierDiff !== 0) return tierDiff;
      return (b.memberCount || 0) - (a.memberCount || 0);
    });

    const navigationState = location.state as { selectedOrganizationId?: string } | null;
    
    if (navigationState?.selectedOrganizationId) {
      // Coming back from user profile - restore the selected organization
      const orgToSelect = organizations.find(org => org.id === navigationState.selectedOrganizationId);
      if (orgToSelect) {
        setSelectedOrg(orgToSelect);
      } else if (!selectedOrg) {
        // If org not found and nothing selected, select first one from sorted list
        setSelectedOrg(sorted[0]);
      }
      // Clear the state to avoid re-selecting on subsequent navigation
      window.history.replaceState({}, document.title);
    } else if (!selectedOrg) {
      // Fresh page load with no navigation state - select the first organization from sorted list
      setSelectedOrg(sorted[0]);
    }
  }, [organizations]);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const validateSlugUniqueness = (slug: string): boolean => {
    const exists = organizations.some(org => org.slug.toLowerCase() === slug.toLowerCase());
    if (exists) {
      setSlugError('This slug is already taken. Please choose a different one.');
      return false;
    }
    setSlugError(null);
    return true;
  };

  const loadOrganizations = async (append = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizationsService.getAll({
        page: append ? currentPage : 1,
        limit: 20,
        search: searchQuery || undefined,
      });
      
      if (append) {
        setOrganizations(prev => [...prev, ...response.organizations]);
      } else {
        setOrganizations(response.organizations);
        // Selection is now handled by the useEffect that watches organizations
      }
      
      setTotalOrgs(response.pagination.total);
      setHasMoreOrgs(response.pagination.page < response.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    if (!selectedOrg) return;
    
    setMembersLoading(true);
    try {
      const orgMembers = await organizationsService.getMembers(selectedOrg.id);
      setMembers(orgMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setMembersLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName || !newOrgSlug) return;

    if (!validateSlugUniqueness(newOrgSlug)) {
      return;
    }

    setCreateOrgLoading(true);
    try {
      const newOrg = await organizationsService.create({
        name: newOrgName,
        slug: newOrgSlug,
      });
      setOrganizations([...organizations, newOrg]);
      setShowCreateOrgDialog(false);
      setNewOrgName('');
      setNewOrgSlug('');
      setSlugError(null);
      setSuccess('Organization created successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create organization';
      if (errorMessage.includes('slug') && errorMessage.includes('already exists')) {
        setSlugError('This slug is already taken. Please choose a different one.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setCreateOrgLoading(false);
    }
  };

  const handleOrgNameChange = (name: string) => {
    setNewOrgName(name);
    const generatedSlug = generateSlug(name);
    setNewOrgSlug(generatedSlug);
    if (generatedSlug) {
      validateSlugUniqueness(generatedSlug);
    } else {
      setSlugError(null);
    }
  };

  const handleSlugChange = (slug: string) => {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setNewOrgSlug(cleanSlug);
    if (cleanSlug) {
      validateSlugUniqueness(cleanSlug);
    } else {
      setSlugError(null);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedOrg) return;

    setUploadingLogo(true);
    try {
      const logoUrl = await organizationsService.uploadLogo(selectedOrg.id, file);
      setSuccess('Logo uploaded successfully!');
      
      // Refresh organizations list to show updated logo
      const response = await organizationsService.getAll({
        page: currentPage,
        limit: 20,
        search: searchQuery || undefined,
      });
      setOrganizations(response.organizations);
      
      const updatedOrg = response.organizations.find(o => o.id === selectedOrg.id);
      if (updatedOrg) {
        setSelectedOrg(updatedOrg);
        setEditOrgData(updatedOrg);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      // Reset the input so the same file can be selected again
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfileChanges = async () => {
    if (!editOrgData) return;
    const orgIdToReselect = editOrgData.id;
    try {
      await organizationsService.update(editOrgData.id, {
        name: editOrgData.name,
        slug: editOrgData.slug,
        industry: editOrgData.industry,
        companySize: editOrgData.companySize,
        website: editOrgData.website,
      });
      setIsEditingProfile(false);
      setSuccess('Organization updated successfully!');
      
      const response = await organizationsService.getAll({
        page: currentPage,
        limit: 20,
        search: searchQuery || undefined,
      });
      setOrganizations(response.organizations);
      setTotalOrgs(response.pagination.total);
      setHasMoreOrgs(response.pagination.page < response.pagination.totalPages);
      
      const reselect = response.organizations.find(o => o.id === orgIdToReselect);
      if (reselect) {
        setSelectedOrg(reselect);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update organization');
    }
  };

  const handleDeleteOrganization = async () => {
    if (!selectedOrg || deleteConfirmSlug !== selectedOrg.slug) return;
    
    setDeleteLoading(true);
    try {
      await organizationsService.delete(selectedOrg.id);
      setSelectedOrg(null);
      setDeleteConfirmSlug('');
      setSuccess('Organization deleted successfully!');
      
      // Calculate which page to load after deletion
      const newTotal = totalOrgs - 1;
      const newTotalPages = Math.ceil(newTotal / 20);
      const adjustedPage = currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;
      
      // Always reload the organization list
      const response = await organizationsService.getAll({
        page: adjustedPage,
        limit: 20,
        search: searchQuery || undefined,
      });
      
      setOrganizations(response.organizations);
      setTotalOrgs(response.pagination.total);
      setHasMoreOrgs(response.pagination.page < response.pagination.totalPages);
      setCurrentPage(adjustedPage);
      
      // Select first organization in the refreshed list
      if (response.organizations.length > 0) {
        setSelectedOrg(response.organizations[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete organization');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleGlobalSearch = async (query: string) => {
    setGlobalSearchQuery(query);
    
    if (!query.trim()) {
      setShowSearchResults(false);
      setSearchResults(null);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await organizationsService.globalSearch(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search');
    } finally {
      setSearchLoading(false);
    }
  };

  const clearGlobalSearch = () => {
    setGlobalSearchQuery('');
    setSearchResults(null);
    setShowSearchResults(false);
  };

  const handleInvitationSuccess = () => {
    setShowInvitationModal(false);
    setSuccess('Invitation sent successfully!');
    loadMembers(); // Reload members to show invited users
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>, member: OrganizationMember) => {
    event.stopPropagation();
    setUserMenuAnchor(event.currentTarget);
    setSelectedMember(member);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const handleRemoveFromOrg = async () => {
    if (!selectedOrg || !selectedMember) return;
    
    setActionLoading(true);
    try {
      await organizationsService.removeMember(selectedOrg.id, selectedMember.userId);
      setSuccess('User removed from organization successfully!');
      setShowRemoveConfirm(false);
      handleCloseUserMenu();
      loadMembers(); // Reload members list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove user from organization');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkNLWF = async () => {
    if (!selectedMember) return;
    
    setActionLoading(true);
    try {
      await userService.updateUserStatus(selectedMember.userId, 'inactive');
      setSuccess('User marked as NLWF (inactive) successfully!');
      setShowNLWFConfirm(false);
      handleCloseUserMenu();
      loadMembers(); // Reload members list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark user as NLWF');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleColor = (roleType: string): 'error' | 'secondary' | 'warning' | 'info' | 'primary' => {
    switch (roleType) {
      case 'client_admin':
        return 'error';
      case 'client_hr':
        return 'secondary';
      case 'client_finance':
        return 'warning';
      case 'client_recruiter':
        return 'info';
      case 'client_employee':
      default:
        return 'primary';
    }
  };

  const getRoleOrder = (roleType: string): number => {
    switch (roleType) {
      case 'client_admin':
        return 1;
      case 'client_hr':
        return 2;
      case 'client_finance':
        return 3;
      case 'client_recruiter':
        return 4;
      case 'client_employee':
        return 5;
      default:
        return 999;
    }
  };

  // Filter members based on search query
  const filteredMembers = members.filter((member) => {
    if (!memberSearchQuery.trim()) return true;
    
    const query = memberSearchQuery.toLowerCase();
    const name = (member.userName || '').toLowerCase();
    const email = (member.userEmail || '').toLowerCase();
    const role = (member.roleType || '').toLowerCase().replace('client_', '');
    
    return name.includes(query) || email.includes(query) || role.includes(query);
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    return getRoleOrder(a.roleType) - getRoleOrder(b.roleType);
  });

  // Calculate displayed members (Load More strategy)
  const paginatedMembers = sortedMembers.slice(0, displayedMembersCount);
  const hasMoreMembers = displayedMembersCount < sortedMembers.length;

  // Helper function to get subscription tier priority for sorting
  const getSubscriptionPriority = (tier: string | null | undefined): number => {
    switch (tier?.toLowerCase()) {
      case 'enterprise':
        return 4;
      case 'professional':
        return 3;
      case 'basic':
        return 2;
      case 'free':
        return 1;
      default:
        return 0;
    }
  };

  // Helper function to get subscription tier color
  const getSubscriptionColor = (tier: string | null | undefined): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (tier?.toLowerCase()) {
      case 'enterprise':
        return 'warning'; // Gold
      case 'professional':
        return 'primary'; // Purple (brand color)
      case 'basic':
        return 'info'; // Blue
      case 'free':
        return 'success'; // Green
      default:
        return 'default';
    }
  };

  // Sort organizations by subscription tier (descending) then by member count (descending)
  const sortedOrganizations = React.useMemo(() => {
    return [...organizations].sort((a, b) => {
      const tierDiff = getSubscriptionPriority(b.subscriptionTier) - getSubscriptionPriority(a.subscriptionTier);
      if (tierDiff !== 0) return tierDiff;
      return (b.memberCount || 0) - (a.memberCount || 0);
    });
  }, [organizations]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/admin/tools')}
          sx={{ 
            mr: 2,
            color: 'primary.main',
            '&:hover': { 
              bgcolor: 'rgba(161, 106, 232, 0.08)' 
            }
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Organization Management
        </Typography>
      </Box>

      {/* Global Search Bar */}
      <Paper elevation={0} sx={{ mb: 3, p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search organizations or users by name, email, or industry..."
            value={globalSearchQuery}
            onChange={(e) => handleGlobalSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {searchLoading ? <CircularProgress size={20} /> : <Search />}
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowCreateOrgDialog(true)}
            sx={{
              bgcolor: '#4CAF50',
              '&:hover': { bgcolor: '#45a049' },
              whiteSpace: 'nowrap',
              px: 3,
            }}
          >
            Create Organization
          </Button>
        </Box>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults && (
          <Box sx={{ mt: 2, maxHeight: 400, overflow: 'auto', borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
            {searchResults.totalOrganizations > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                  Organizations ({searchResults.totalOrganizations})
                </Typography>
                {searchResults.organizations.map((org) => (
                  <Paper
                    key={org.id}
                    onClick={() => {
                      setSelectedOrg(org);
                      clearGlobalSearch();
                    }}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {org.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {org.slug} • {org.memberCount || 0} users
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}

            {searchResults.totalUsers > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                  Users ({searchResults.totalUsers})
                </Typography>
                {searchResults.users.map((user) => (
                  <Paper
                    key={user.id}
                    onClick={() => {
                      navigate(`/users/${user.id}`);
                      clearGlobalSearch();
                    }}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={user.profilePicture || undefined} sx={{ width: 32, height: 32 }}>
                        {user.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email} • {user.organization?.name || 'No organization'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}

            {searchResults.totalOrganizations === 0 && searchResults.totalUsers === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No results found for "{globalSearchQuery}"
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 2, minHeight: 'calc(100vh - 300px)' }}>
        {/* Left Panel - Organizations List */}
        <Paper elevation={0} sx={{ width: 350, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List sx={{ py: 0 }}>
                {sortedOrganizations.map((org) => (
                  <ListItemButton
                    key={org.id}
                    selected={selectedOrg?.id === org.id}
                    onClick={() => setSelectedOrg(org)}
                    sx={{
                      borderLeft: selectedOrg?.id === org.id ? '3px solid' : '3px solid transparent',
                      borderLeftColor: 'primary.main',
                      py: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Avatar
                      src={org.logoUrl || undefined}
                      sx={{
                        width: 40,
                        height: 40,
                        mr: 2,
                        bgcolor: 'primary.main',
                      }}
                    >
                      <Business sx={{ fontSize: 20 }} />
                    </Avatar>
                    <ListItemText
                      primary={org.name}
                      secondary={`${org.memberCount || 0} users`}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    {org.subscriptionTier && (
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        {org.subscriptionTier?.toLowerCase() === 'enterprise' && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -4,
                              right: -4,
                              fontSize: '12px',
                              animation: 'sparkle 1.5s ease-in-out infinite',
                              '@keyframes sparkle': {
                                '0%, 100%': { opacity: 0, transform: 'scale(0.5)' },
                                '50%': { opacity: 1, transform: 'scale(1)' },
                              },
                            }}
                          >
                            ✨
                          </Box>
                        )}
                        <Chip
                          label={org.subscriptionTier}
                          size="small"
                          color={org.subscriptionTier?.toLowerCase() === 'professional' ? undefined : getSubscriptionColor(org.subscriptionTier)}
                          sx={{ 
                            ml: 1,
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            ...(org.subscriptionTier?.toLowerCase() === 'professional' && {
                              bgcolor: '#A16AE8',
                              color: 'white',
                            }),
                          }}
                        />
                      </Box>
                    )}
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack direction="column" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Showing {sortedOrganizations.length} of {totalOrgs} orgs
              </Typography>
              {hasMoreOrgs && (
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => {
                    setCurrentPage(p => p + 1);
                    loadOrganizations(true);
                  }} 
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              )}
            </Stack>
          </Box>
        </Paper>

        {/* Right Panel - Organization Details with Tabs */}
        {selectedOrg ? (
          <Paper elevation={0} sx={{ flex: 1, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            {/* Organization Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar
                      src={selectedOrg.logoUrl || undefined}
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: 'primary.main',
                      }}
                    >
                      <Business sx={{ fontSize: 32 }} />
                    </Avatar>
                    <IconButton
                      onClick={() => logoFileInputRef.current?.click()}
                      disabled={uploadingLogo}
                      sx={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        bgcolor: 'primary.main',
                        color: 'white',
                        width: 28,
                        height: 28,
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                        '&:disabled': {
                          bgcolor: 'action.disabledBackground',
                        },
                      }}
                    >
                      {uploadingLogo ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <CameraAlt sx={{ fontSize: 16 }} />
                      )}
                    </IconButton>
                    <input
                      ref={logoFileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {selectedOrg.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={selectedOrg.slug} size="small" />
                      <Chip label={`${selectedOrg.memberCount || 0} users`} size="small" variant="outlined" />
                      {selectedOrg.subscriptionTier && (
                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                          {selectedOrg.subscriptionTier?.toLowerCase() === 'enterprise' && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: -4,
                                right: -4,
                                fontSize: '12px',
                                animation: 'sparkle 1.5s ease-in-out infinite',
                                '@keyframes sparkle': {
                                  '0%, 100%': { opacity: 0, transform: 'scale(0.5)' },
                                  '50%': { opacity: 1, transform: 'scale(1)' },
                                },
                              }}
                            >
                              ✨
                            </Box>
                          )}
                          <Chip 
                            label={selectedOrg.subscriptionTier} 
                            size="small" 
                            color={selectedOrg.subscriptionTier?.toLowerCase() === 'professional' ? undefined : getSubscriptionColor(selectedOrg.subscriptionTier)}
                            sx={{
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              ...(selectedOrg.subscriptionTier?.toLowerCase() === 'professional' && {
                                bgcolor: '#A16AE8',
                                color: 'white',
                              }),
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
            >
              <Tab label="Users" />
              <Tab label="Company Profile" />
              <Tab label="Billing Details" />
              <Tab label="Delete Organization" />
            </Tabs>

            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {/* Users Tab */}
              <TabPanel value={activeTab} index={0}>
                <Box sx={{ px: 3 }}>
                  {membersLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      {/* User Search Bar and Invite Button */}
                      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Search users by name, email, or role..."
                          value={memberSearchQuery}
                          onChange={(e) => {
                            setMemberSearchQuery(e.target.value);
                            setDisplayedMembersCount(10); // Reset when searching
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          size="small"
                          onClick={() => setShowInvitationModal(true)}
                          sx={{
                            bgcolor: '#4CAF50',
                            '&:hover': { bgcolor: '#45a049' },
                            whiteSpace: 'nowrap',
                            px: 3,
                          }}
                        >
                          Invite User
                        </Button>
                      </Box>

                      <Box>
                        {paginatedMembers.map((member) => (
                          <Paper
                            key={member.id}
                            onClick={() => navigate(`/admin/users/${member.userId}`, {
                              state: {
                                organizationId: selectedOrg?.id,
                                organizationName: selectedOrg?.name
                              }
                            })}
                            sx={{
                              p: 2,
                              mb: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'action.hover',
                                transform: 'translateY(-2px)',
                                boxShadow: 2,
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  src={member.profilePicture || undefined}
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    bgcolor: 'primary.main',
                                  }}
                                >
                                  {member.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {member.userName}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {member.userEmail}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                {member.status === 'invited' && (
                                  <Chip
                                    label="Invited"
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                  />
                                )}
                                <Chip
                                  label={member.roleType || 'No role'}
                                  size="small"
                                  color={getRoleColor(member.roleType)}
                                  variant="outlined"
                                />
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleOpenUserMenu(e, member)}
                                  sx={{ ml: 1 }}
                                >
                                  <MoreVert />
                                </IconButton>
                              </Box>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                      
                      {/* Members Pagination */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3, gap: 1 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Showing {paginatedMembers.length} of {sortedMembers.length} users
                          {memberSearchQuery && ` (filtered from ${members.length})`}
                        </Typography>
                        {hasMoreMembers && (
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => setDisplayedMembersCount(prev => prev + membersPerPage)}
                          >
                            Load More
                          </Button>
                        )}
                      </Box>
                    </>
                  )}
                </Box>
              </TabPanel>

              {/* Company Profile Tab */}
              <TabPanel value={activeTab} index={1}>
                <Box sx={{ px: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Company Profile
                    </Typography>
                    {!isEditingProfile ? (
                      <IconButton
                        size="small"
                        onClick={() => setIsEditingProfile(true)}
                        sx={{ color: 'primary.main' }}
                      >
                        <Edit />
                      </IconButton>
                    ) : (
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setEditOrgData(selectedOrg);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={handleSaveProfileChanges}
                        >
                          Save Changes
                        </Button>
                      </Stack>
                    )}
                  </Box>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Organization Name"
                      value={editOrgData?.name || ''}
                      onChange={(e) => setEditOrgData(prev => prev ? { ...prev, name: e.target.value } : null)}
                      disabled={!isEditingProfile}
                    />
                    <TextField
                      fullWidth
                      label="Slug"
                      value={editOrgData?.slug || ''}
                      onChange={(e) => setEditOrgData(prev => prev ? { ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') } : null)}
                      disabled={!isEditingProfile}
                      helperText="Only lowercase letters, numbers, and hyphens"
                    />
                    <TextField
                      fullWidth
                      label="Industry"
                      value={editOrgData?.industry || ''}
                      onChange={(e) => setEditOrgData(prev => prev ? { ...prev, industry: e.target.value } : null)}
                      disabled={!isEditingProfile}
                    />
                    <TextField
                      fullWidth
                      label="Company Size"
                      value={editOrgData?.companySize || ''}
                      onChange={(e) => setEditOrgData(prev => prev ? { ...prev, companySize: e.target.value } : null)}
                      disabled={!isEditingProfile}
                    />
                    <TextField
                      fullWidth
                      label="Website"
                      value={editOrgData?.website || ''}
                      onChange={(e) => setEditOrgData(prev => prev ? { ...prev, website: e.target.value } : null)}
                      disabled={!isEditingProfile}
                    />
                  </Stack>
                </Box>
              </TabPanel>

              {/* Billing Details Tab */}
              <TabPanel value={activeTab} index={2}>
                <Box sx={{ px: 3, py: 6, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Billing Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Coming soon...
                  </Typography>
                </Box>
              </TabPanel>

              {/* Delete Organization Tab */}
              <TabPanel value={activeTab} index={3}>
                <Box sx={{ px: 3 }}>
                  <Alert severity="error" icon={<Warning />} sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      Delete Organization
                    </Typography>
                    <Typography variant="body2">
                      This action will permanently delete the organization and all associated data. This cannot be undone.
                    </Typography>
                  </Alert>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    To confirm deletion, please type the organization's slug: <strong>{selectedOrg.slug}</strong>
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Type organization slug to confirm"
                    value={deleteConfirmSlug}
                    onChange={(e) => setDeleteConfirmSlug(e.target.value)}
                    placeholder={selectedOrg.slug}
                    sx={{ mb: 3 }}
                    error={deleteConfirmSlug !== '' && deleteConfirmSlug !== selectedOrg.slug}
                    helperText={
                      deleteConfirmSlug !== '' && deleteConfirmSlug !== selectedOrg.slug
                        ? 'Slug does not match'
                        : ''
                    }
                  />
                  
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    onClick={handleDeleteOrganization}
                    disabled={deleteConfirmSlug !== selectedOrg.slug || deleteLoading}
                    startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete Organization'}
                  </Button>
                </Box>
              </TabPanel>
            </Box>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Business sx={{ fontSize: 80, color: 'text.disabled' }} />
            <Typography variant="h6" color="text.secondary">
              Select an organization to view details
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Create Organization Dialog */}
      <Dialog 
        open={showCreateOrgDialog} 
        onClose={() => {
          setShowCreateOrgDialog(false);
          setNewOrgName('');
          setNewOrgSlug('');
          setSlugError(null);
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Create New Organization</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Organization Name"
            value={newOrgName}
            onChange={(e) => handleOrgNameChange(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
            placeholder="e.g., Acme Corporation"
          />
          <TextField
            fullWidth
            label="Slug (URL-friendly identifier)"
            value={newOrgSlug}
            onChange={(e) => handleSlugChange(e.target.value)}
            error={!!slugError}
            helperText={slugError || "Auto-generated from name. Only lowercase letters, numbers, and hyphens."}
            placeholder="e.g., acme-corporation"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowCreateOrgDialog(false);
              setNewOrgName('');
              setNewOrgSlug('');
              setSlugError(null);
            }}
            disabled={createOrgLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateOrganization}
            disabled={!newOrgName || !newOrgSlug || !!slugError || createOrgLoading}
            startIcon={createOrgLoading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              bgcolor: '#4CAF50',
              '&:hover': { bgcolor: '#45a049' },
            }}
          >
            {createOrgLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Organization Invitation Modal */}
      {selectedOrg && (
        <OrganizationInvitationModal
          open={showInvitationModal}
          onClose={() => setShowInvitationModal(false)}
          onSuccess={handleInvitationSuccess}
          organizationId={selectedOrg.id}
          organizationName={selectedOrg.name}
        />
      )}

      {/* User Management Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleCloseUserMenu}
      >
        <MenuItem 
          onClick={() => {
            setShowNLWFConfirm(true);
            handleCloseUserMenu();
          }}
        >
          <PersonOff sx={{ mr: 1, fontSize: 20 }} />
          Mark as NLWF (Inactive)
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setShowRemoveConfirm(true);
            handleCloseUserMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <PersonRemove sx={{ mr: 1, fontSize: 20 }} />
          Remove from Organization
        </MenuItem>
      </Menu>

      {/* Remove from Organization Confirmation Dialog */}
      <Dialog open={showRemoveConfirm} onClose={() => setShowRemoveConfirm(false)}>
        <DialogTitle>Remove User from Organization</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{selectedMember?.userName}</strong> from this organization?
            This action will remove their access to the organization.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRemoveConfirm(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRemoveFromOrg}
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {actionLoading ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark as NLWF Confirmation Dialog */}
      <Dialog open={showNLWFConfirm} onClose={() => setShowNLWFConfirm(false)}>
        <DialogTitle>Mark User as NLWF</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark <strong>{selectedMember?.userName}</strong> as NLWF (No Longer With Firm)?
            This will set the user status to inactive.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNLWFConfirm(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleMarkNLWF}
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {actionLoading ? 'Updating...' : 'Mark as NLWF'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError(null)} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={5000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrganizationManagementPage;
