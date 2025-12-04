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
  FormControlLabel,
  Switch,
  Tooltip,
} from '@mui/material';
import { Search, Add, Business, ArrowBack, Edit, Warning, CameraAlt, MoreVert, PersonRemove, PersonOff } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import organizationsService, { type Organization, type OrganizationMember, type GlobalSearchResponse } from '../services/organizationsService';
import userService from '../services/userService';
import OrganizationInvitationModal from '../components/invitations/OrganizationInvitationModal';
import { useOrganizationPermissions } from '../hooks/useOrganizationPermissions';
import { getRoleColor, getRolePriority } from '../constants/roleMetadata';

const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001+',
];

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Consulting',
  'Real Estate',
  'Media & Entertainment',
  'Other',
];

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
  const [subscriptionTierFilter, setSubscriptionTierFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  
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
  const [memberStatusFilters, setMemberStatusFilters] = useState<Set<string> | null>(null); // null = not initialized yet
  
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
  const [slugInfo, setSlugInfo] = useState<string | null>(null);
  const [isSoftDeletedSlug, setIsSoftDeletedSlug] = useState(false);
  const [clientAdminEmail, setClientAdminEmail] = useState('');
  const [clientAdminEmailError, setClientAdminEmailError] = useState<string | null>(null);
  
  // Edit state (now inline in Company Profile tab)
  const [editOrgData, setEditOrgData] = useState<Organization | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
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

  // Auth and permissions
  const { user } = useAuth();
  const permissions = useOrganizationPermissions({
    userRoles: user?.roles || [],
    isOwnOrganization: false,
  });

  const {
    canRemoveUsers,
    canChangeRoles,
    canMarkNLWF,
    canSendPasswordReset,
    canSuspendUser,
    canViewUserDetails,
    isSuperAdmin,
  } = permissions;

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
      
      // Reset activeTab if it's invalid for the new organization
      // Internal orgs have 3 tabs (0: Users, 1: Company Profile, 2: Delete)
      // Other orgs have 4 tabs (0: Users, 1: Company Profile, 2: Billing, 3: Delete)
      const maxTabIndex = selectedOrg.subscriptionTier === 'internal' ? 2 : 3;
      if (activeTab > maxTabIndex) {
        setActiveTab(0);
      }
    }
  }, [selectedOrg, activeTab]);

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

  const validateSlugUniqueness = async (slug: string): Promise<boolean> => {
    if (!slug || slug.length < 2) {
      setSlugError(null);
      setSlugInfo(null);
      setIsSoftDeletedSlug(false);
      return true;
    }

    try {
      const response = await organizationsService.checkSlugAvailability(slug);
      
      if (!response.available) {
        setSlugError('This slug is already taken. Please choose a different one.');
        setSlugInfo(null);
        setIsSoftDeletedSlug(false);
        return false;
      }
      
      if (response.isSoftDeleted) {
        setSlugError(null);
        setSlugInfo('This organization was previously archived. Creating it will restore the archived organization.');
        setIsSoftDeletedSlug(true);
        return true;
      }
      
      setSlugError(null);
      setSlugInfo(null);
      setIsSoftDeletedSlug(false);
      return true;
    } catch {
      const exists = organizations.some(org => org.slug.toLowerCase() === slug.toLowerCase());
      if (exists) {
        setSlugError('This slug is already taken. Please choose a different one.');
        setSlugInfo(null);
        setIsSoftDeletedSlug(false);
        return false;
      }
      setSlugError(null);
      setSlugInfo(null);
      setIsSoftDeletedSlug(false);
      return true;
    }
  };

  const loadOrganizations = async (append = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizationsService.getAll({
        page: append ? currentPage : 1,
        limit: 20,
        search: searchQuery.trim() || undefined,
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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName || !newOrgSlug) return;

    const isSlugValid = await validateSlugUniqueness(newOrgSlug);
    if (!isSlugValid) {
      return;
    }

    if (clientAdminEmail && !validateEmail(clientAdminEmail)) {
      setClientAdminEmailError('Please enter a valid email address');
      return;
    }

    setCreateOrgLoading(true);
    setClientAdminEmailError(null);
    try {
      const newOrg = await organizationsService.create({
        name: newOrgName,
        slug: newOrgSlug,
      });
      setOrganizations([...organizations, newOrg]);
      
      const wasRestored = newOrg.wasRestored === true;
      let successMessage = wasRestored 
        ? 'Organization restored successfully!' 
        : 'Organization created successfully!';
      
      if (clientAdminEmail) {
        try {
          const token = localStorage.getItem('teamified_access_token');
          const response = await fetch('/api/v1/invitations/send-email', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: clientAdminEmail,
              organizationId: newOrg.id,
              roleType: 'client_admin',
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
          }
          
          successMessage = wasRestored 
            ? `Organization restored and invitation sent to ${clientAdminEmail}!`
            : `Organization created and invitation sent to ${clientAdminEmail}!`;
        } catch (inviteErr) {
          console.error('Failed to send invitation:', inviteErr);
          setShowCreateOrgDialog(false);
          setNewOrgName('');
          setNewOrgSlug('');
          setSlugError(null);
          setSlugInfo(null);
          setIsSoftDeletedSlug(false);
          setClientAdminEmail('');
          setClientAdminEmailError(null);
          setWarning(wasRestored 
            ? 'Organization restored, but failed to send invitation email. You can invite the admin manually.'
            : 'Organization created, but failed to send invitation email. You can invite the admin manually.');
          return;
        }
      }
      
      setShowCreateOrgDialog(false);
      setNewOrgName('');
      setNewOrgSlug('');
      setSlugError(null);
      setSlugInfo(null);
      setIsSoftDeletedSlug(false);
      setClientAdminEmail('');
      setClientAdminEmailError(null);
      setSuccess(successMessage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create organization';
      if (errorMessage.includes('slug') || errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
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
      setSlugInfo(null);
      setIsSoftDeletedSlug(false);
    }
  };

  const handleSlugChange = (slug: string) => {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setNewOrgSlug(cleanSlug);
    if (cleanSlug) {
      validateSlugUniqueness(cleanSlug);
    } else {
      setSlugError(null);
      setSlugInfo(null);
      setIsSoftDeletedSlug(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedOrg) return;

    setUploadingLogo(true);
    try {
      const logoUrl = await organizationsService.uploadLogo(selectedOrg.id, file);
      setSuccess('Logo uploaded successfully!');
      
      // Update logo locally without reloading the entire list
      const updatedOrg = { ...selectedOrg, logoUrl };
      setSelectedOrg(updatedOrg);
      setEditOrgData(updatedOrg);
      
      // Update the organization in the list as well
      setOrganizations(prev => 
        prev.map(org => org.id === selectedOrg.id ? { ...org, logoUrl } : org)
      );
    } catch (err: any) {
      // Extract error message from axios response or use generic message
      const errorMessage = err?.response?.data?.message 
        || err?.message 
        || 'Failed to upload logo';
      setError(errorMessage);
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
    setSavingProfile(true);
    try {
      // Get the updated organization directly from the update response
      const updatedOrg = await organizationsService.update(editOrgData.id, {
        name: editOrgData.name,
        slug: editOrgData.slug,
        industry: editOrgData.industry,
        companySize: editOrgData.companySize,
        website: editOrgData.website,
      });
      
      setIsEditingProfile(false);
      setSuccess('Organization updated successfully!');
      
      // Update the local states immediately with the response
      setSelectedOrg(updatedOrg);
      setEditOrgData(updatedOrg);
      
      // Update the organization in the list
      setOrganizations(prev => 
        prev.map(org => org.id === orgIdToReselect ? updatedOrg : org)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update organization');
    } finally {
      setSavingProfile(false);
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
        search: searchQuery.trim() || undefined,
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
    loadMembers();
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>, member: OrganizationMember) => {
    if (!canRemoveUsers && !canChangeRoles && !canMarkNLWF) return;
    event.stopPropagation();
    setUserMenuAnchor(event.currentTarget);
    setSelectedMember(member);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const handleUserRowClick = (member: OrganizationMember, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!canViewUserDetails) return;
    navigate(`/admin/users/${member.userId}`, {
      state: {
        organizationId: selectedOrg?.id,
        organizationName: selectedOrg?.name,
        organizationSlug: selectedOrg?.slug,
        fromClientPage: false,
      }
    });
  };

  const handleRemoveFromOrg = async () => {
    if (!selectedOrg || !selectedMember || !canRemoveUsers) return;
    
    setActionLoading(true);
    try {
      await organizationsService.removeMember(selectedOrg.id, selectedMember.userId);
      setSuccess('User removed from organization successfully!');
      setShowRemoveConfirm(false);
      handleCloseUserMenu();
      loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove user from organization');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkNLWF = async () => {
    if (!selectedMember || !canMarkNLWF) return;
    
    setActionLoading(true);
    try {
      await userService.updateUserStatus(selectedMember.userId, 'inactive');
      setSuccess('User marked as NLWF (inactive) successfully!');
      setShowNLWFConfirm(false);
      handleCloseUserMenu();
      loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark user as NLWF');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!selectedOrg || !canChangeRoles) {
      throw new Error('Permission denied');
    }
    await organizationsService.updateMemberRole(selectedOrg.id, userId, { roleType: newRole });
    loadMembers();
  };

  // Count members by status for filter display
  // Status values from backend: 'active', 'invited', 'nlwf'
  const statusCounts = members.reduce((acc, member) => {
    const status = member.status?.toLowerCase() || 'active';
    acc[status] = (acc[status] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Reset filters when organization changes
  useEffect(() => {
    setMemberStatusFilters(null); // Reset to null so it will be re-initialized
  }, [selectedOrg?.id]);

  // Initialize filters when members are loaded - default to 'active' unless no active users exist
  useEffect(() => {
    if (members.length > 0 && memberStatusFilters === null) {
      const activeCount = statusCounts['active'] || 0;
      if (activeCount === 0) {
        // No active users, default to showing active + invited
        setMemberStatusFilters(new Set(['active', 'invited']));
      } else {
        // Has active users, default to showing only active
        setMemberStatusFilters(new Set(['active']));
      }
    }
  }, [members, statusCounts, memberStatusFilters]);

  // Get effective filters (use empty set during initialization)
  const effectiveFilters = memberStatusFilters || new Set<string>();

  // Filter members based on search query and status filter checkboxes
  // Filters are additive - only show members whose status is checked
  const filteredMembers = members.filter((member) => {
    const status = member.status?.toLowerCase() || 'active';
    
    // If no filters selected, show nothing (empty selection = no results)
    if (effectiveFilters.size === 0) {
      return false;
    }
    
    // Only show members whose status is checked
    if (!effectiveFilters.has(status)) {
      return false;
    }
    
    // Then filter by search query
    if (!memberSearchQuery.trim()) return true;
    
    const query = memberSearchQuery.toLowerCase();
    const name = (member.userName || '').toLowerCase();
    const email = (member.userEmail || '').toLowerCase();
    const role = (member.roleType || '').toLowerCase().replace('client_', '').replace('internal_', '');
    
    return name.includes(query) || email.includes(query) || role.includes(query);
  });
  
  // Toggle a status filter checkbox
  const toggleStatusFilter = (status: string) => {
    setMemberStatusFilters(prev => {
      const newSet = new Set(prev || []);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
    setDisplayedMembersCount(10); // Reset pagination when filter changes
  };

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    return getRolePriority(a.roleType) - getRolePriority(b.roleType);
  });

  // Calculate displayed members (Load More strategy)
  const paginatedMembers = sortedMembers.slice(0, displayedMembersCount);
  const hasMoreMembers = displayedMembersCount < sortedMembers.length;

  // Helper function to get subscription tier priority for sorting
  const getSubscriptionPriority = (tier: string | null | undefined): number => {
    switch (tier?.toLowerCase()) {
      case 'internal':
        return 5; // Highest priority
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
      case 'internal':
        return 'error'; // Red for internal/Teamified
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

  // Filter and sort organizations
  const sortedOrganizations = React.useMemo(() => {
    // Separate Teamified from other organizations
    const teamified = organizations.find(org => org.slug === 'teamified-internal');
    const others = organizations.filter(org => org.slug !== 'teamified-internal');
    
    // Apply subscription tier filter
    const filteredOthers = others.filter((org) => {
      if (subscriptionTierFilter === 'all') return true;
      return org.subscriptionTier?.toLowerCase() === subscriptionTierFilter.toLowerCase();
    });
    
    // Sort the filtered others by tier and member count
    const sortedOthers = [...filteredOthers].sort((a, b) => {
      // Sort by subscription tier
      const tierDiff = getSubscriptionPriority(b.subscriptionTier) - getSubscriptionPriority(a.subscriptionTier);
      if (tierDiff !== 0) return tierDiff;
      
      // Then by member count
      return (b.memberCount || 0) - (a.memberCount || 0);
    });
    
    // Handle Teamified based on filter:
    // - 'all': Show Teamified first, then all other orgs
    // - 'internal': Show ONLY Teamified
    // - any other tier: Show only orgs matching that tier (exclude Teamified)
    if (subscriptionTierFilter === 'all') {
      return teamified ? [teamified, ...sortedOthers] : sortedOthers;
    } else if (subscriptionTierFilter === 'internal') {
      return teamified ? [teamified] : [];
    } else {
      // Other tiers (enterprise, professional, basic, free) - exclude Teamified
      return sortedOthers;
    }
  }, [organizations, subscriptionTierFilter]);

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
                      navigate(`/admin/users/${user.id}`);
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
            <Stack spacing={2}>
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
              <FormControl fullWidth size="small">
                <InputLabel>Subscription Tier</InputLabel>
                <Select
                  value={subscriptionTierFilter}
                  label="Subscription Tier"
                  onChange={(e) => setSubscriptionTierFilter(e.target.value)}
                >
                  <MenuItem value="all">All Tiers</MenuItem>
                  <MenuItem value="internal">Internal</MenuItem>
                  <MenuItem value="enterprise">Enterprise</MenuItem>
                  <MenuItem value="professional">Professional</MenuItem>
                  <MenuItem value="basic">Basic</MenuItem>
                  <MenuItem value="free">Free</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : sortedOrganizations.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center' }}>
                <Business sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                  No organizations found
                </Typography>
                {searchQuery.trim() ? (
                  <Typography variant="body2" color="text.secondary">
                    No organizations match "{searchQuery}"
                  </Typography>
                ) : subscriptionTierFilter !== 'all' ? (
                  <Typography variant="body2" color="text.secondary">
                    No {subscriptionTierFilter} tier organizations
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Create your first organization to get started
                  </Typography>
                )}
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
                      key={`org-avatar-${org.id}-${org.logoUrl || 'default'}`}
                      src={org.logoUrl || undefined}
                      imgProps={{ 
                        crossOrigin: 'anonymous',
                        onError: (e: any) => { e.target.style.display = 'none'; }
                      }}
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
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {org.name}
                        </Typography>
                      }
                      secondary={`${org.memberCount || 0} users`}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    {(org.memberCount === 0 || org.memberCount === undefined) ? (
                      <Chip
                        label="No Users"
                        size="small"
                        sx={{
                          ml: 1,
                          fontWeight: 600,
                          bgcolor: 'warning.main',
                          color: 'warning.contrastText',
                        }}
                      />
                    ) : org.subscriptionTier && (
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
                            ...(org.subscriptionTier?.toLowerCase() === 'internal' && {
                              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'white' : 'black',
                              color: (theme) => theme.palette.mode === 'dark' ? 'black' : 'white',
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
                      key={`selected-org-avatar-${selectedOrg.id}-${selectedOrg.logoUrl || 'default'}`}
                      src={selectedOrg.logoUrl || undefined}
                      imgProps={{ 
                        crossOrigin: 'anonymous',
                        onError: (e: any) => { e.target.style.display = 'none'; }
                      }}
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: 'primary.main',
                        opacity: uploadingLogo ? 0.5 : 1,
                        transition: 'opacity 0.2s ease-in-out',
                      }}
                    >
                      <Business sx={{ fontSize: 32 }} />
                    </Avatar>
                    {uploadingLogo && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: 64,
                          height: 64,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                        }}
                      >
                        <CircularProgress size={32} thickness={4} />
                      </Box>
                    )}
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
                      <CameraAlt sx={{ fontSize: 16 }} />
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
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Chip label={selectedOrg.slug} size="small" sx={{ height: 24 }} />
                      <Chip label={`${selectedOrg.memberCount || 0} users`} size="small" variant="outlined" sx={{ height: 24 }} />
                      {selectedOrg.subscriptionTier && (
                        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          {selectedOrg.subscriptionTier?.toLowerCase() === 'enterprise' && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: -4,
                                right: -4,
                                fontSize: '12px',
                                animation: 'sparkle 1.5s ease-in-out infinite',
                                zIndex: 1,
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
                              height: 24,
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              ...(selectedOrg.subscriptionTier?.toLowerCase() === 'professional' && {
                                bgcolor: '#A16AE8',
                                color: 'white',
                              }),
                              ...(selectedOrg.subscriptionTier?.toLowerCase() === 'internal' && {
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'white' : 'black',
                                color: (theme) => theme.palette.mode === 'dark' ? 'black' : 'white',
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
              {selectedOrg?.subscriptionTier !== 'internal' && <Tab label="Billing Details" />}
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
                      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
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
                          onClick={() => setShowInvitationModal(true)}
                          sx={{
                            bgcolor: '#4CAF50',
                            '&:hover': { bgcolor: '#45a049' },
                            whiteSpace: 'nowrap',
                            px: 3,
                            height: 40,
                          }}
                        >
                          Invite User
                        </Button>
                      </Box>

                      {/* Status Filter Checkboxes */}
                      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>
                          Show:
                        </Typography>
                        <Chip
                          label={`Active (${statusCounts['active'] || 0})`}
                          size="small"
                          onClick={() => toggleStatusFilter('active')}
                          color={effectiveFilters.has('active') ? 'primary' : 'default'}
                          variant={effectiveFilters.has('active') ? 'filled' : 'outlined'}
                          sx={{ cursor: 'pointer' }}
                        />
                        <Chip
                          label={`Invited (${statusCounts['invited'] || 0})`}
                          size="small"
                          onClick={() => toggleStatusFilter('invited')}
                          color={effectiveFilters.has('invited') ? 'info' : 'default'}
                          variant={effectiveFilters.has('invited') ? 'filled' : 'outlined'}
                          sx={{ cursor: 'pointer' }}
                        />
                        <Chip
                          label={`NLWF (${statusCounts['nlwf'] || 0})`}
                          size="small"
                          onClick={() => toggleStatusFilter('nlwf')}
                          color={effectiveFilters.has('nlwf') ? 'warning' : 'default'}
                          variant={effectiveFilters.has('nlwf') ? 'filled' : 'outlined'}
                          sx={{ cursor: 'pointer' }}
                        />
                        <Chip
                          label={`Suspended (${statusCounts['suspended'] || 0})`}
                          size="small"
                          onClick={() => toggleStatusFilter('suspended')}
                          color={effectiveFilters.has('suspended') ? 'error' : 'default'}
                          variant={effectiveFilters.has('suspended') ? 'filled' : 'outlined'}
                          sx={{ cursor: 'pointer' }}
                        />
                      </Box>

                      {/* No Users Message - only show if truly no members in organization */}
                      {(statusCounts.total || 0) === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No users in this organization yet.
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Click "Invite User" to add members.
                          </Typography>
                        </Box>
                      )}

                      {/* No results from current filter */}
                      {(statusCounts.total || 0) > 0 && filteredMembers.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No users match the current filter.
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Try selecting different status filters above.
                          </Typography>
                        </Box>
                      )}

                      {/* Member List - only render if there are filtered members */}
                      {filteredMembers.length > 0 && (
                        <>
                      <Box>
                        {paginatedMembers.map((member) => {
                          const isNlwf = member.status === 'nlwf';
                          return (
                            <Paper
                              key={member.id}
                              onClick={(e) => handleUserRowClick(member, e)}
                              sx={{
                                p: 2,
                                mb: 2,
                                border: '1px solid',
                                borderColor: isNlwf ? 'action.disabled' : 'divider',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                bgcolor: isNlwf ? 'action.disabledBackground' : 'background.paper',
                                opacity: isNlwf ? 0.75 : 1,
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  bgcolor: isNlwf ? 'action.hover' : 'action.hover',
                                  transform: 'translateY(-2px)',
                                  boxShadow: 2,
                                  opacity: 1,
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
                                      bgcolor: isNlwf ? 'grey.500' : 'primary.main',
                                      filter: isNlwf ? 'grayscale(100%)' : 'none',
                                    }}
                                  >
                                    {member.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </Avatar>
                                  <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          fontWeight: 600,
                                          color: isNlwf ? 'text.secondary' : 'text.primary',
                                        }}
                                      >
                                        {member.userName}
                                      </Typography>
                                      {member.status === 'invited' && (
                                        <Chip
                                          label="Invited"
                                          size="small"
                                          color="info"
                                          variant="filled"
                                          sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                      )}
                                      {member.status === 'nlwf' && (
                                        <Chip
                                          label="NLWF"
                                          size="small"
                                          color="warning"
                                          variant="filled"
                                          sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                      )}
                                      {member.status === 'suspended' && (
                                        <Chip
                                          label="Suspended"
                                          size="small"
                                          color="error"
                                          variant="filled"
                                          sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                      )}
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                      {member.userEmail}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <Chip
                                    label={member.roleType || 'No role'}
                                    size="small"
                                    color={getRoleColor(member.roleType)}
                                    variant="outlined"
                                    sx={{
                                      opacity: isNlwf ? 0.6 : 1,
                                    }}
                                  />
                                  {(canRemoveUsers || canChangeRoles || canMarkNLWF) && member.userId !== user?.id && (
                                    <IconButton
                                      size="small"
                                      onClick={(e) => handleOpenUserMenu(e, member)}
                                      sx={{ ml: 1 }}
                                    >
                                      <MoreVert />
                                    </IconButton>
                                  )}
                                </Box>
                              </Box>
                            </Paper>
                          );
                        })}
                      </Box>
                      
                      {/* Members Pagination */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3, gap: 1 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Showing {paginatedMembers.length} of {sortedMembers.length} users
                          {(statusCounts.total || 0) > sortedMembers.length && 
                            ` (${(statusCounts.total || 0) - sortedMembers.length} hidden by filter)`}
                          {memberSearchQuery && ` (filtered)`}
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
                    </>
                  )}
                </Box>
              </TabPanel>

              {/* Company Profile Tab */}
              <TabPanel value={activeTab} index={1}>
                <Box sx={{ px: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
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
                          disabled={savingProfile}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={handleSaveProfileChanges}
                          disabled={savingProfile}
                          startIcon={savingProfile ? <CircularProgress size={16} color="inherit" /> : null}
                        >
                          {savingProfile ? 'Saving...' : 'Save Changes'}
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
                    <FormControl fullWidth disabled={!isEditingProfile}>
                      <InputLabel>Industry</InputLabel>
                      <Select
                        value={editOrgData?.industry || ''}
                        onChange={(e) => setEditOrgData(prev => prev ? { ...prev, industry: e.target.value } : null)}
                        label="Industry"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {/* Show existing value if it's not in the predefined list */}
                        {editOrgData?.industry && !INDUSTRIES.includes(editOrgData.industry) && (
                          <MenuItem value={editOrgData.industry}>
                            {editOrgData.industry} (Custom)
                          </MenuItem>
                        )}
                        {INDUSTRIES.map((industry) => (
                          <MenuItem key={industry} value={industry}>
                            {industry}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth disabled={!isEditingProfile}>
                      <InputLabel>Company Size</InputLabel>
                      <Select
                        value={editOrgData?.companySize || ''}
                        onChange={(e) => setEditOrgData(prev => prev ? { ...prev, companySize: e.target.value } : null)}
                        label="Company Size"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {/* Show existing value if it's not in the predefined list */}
                        {editOrgData?.companySize && !COMPANY_SIZES.includes(editOrgData.companySize) && (
                          <MenuItem value={editOrgData.companySize}>
                            {editOrgData.companySize} (Custom)
                          </MenuItem>
                        )}
                        {COMPANY_SIZES.map((size) => (
                          <MenuItem key={size} value={size}>
                            {size}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
              {selectedOrg?.subscriptionTier !== 'internal' && (
                <TabPanel value={activeTab} index={2}>
                  <Box sx={{ px: 3, py: 6, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }} gutterBottom>
                      Billing Details
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Coming soon...
                    </Typography>
                  </Box>
                </TabPanel>
              )}

              {/* Delete Organization Tab */}
              <TabPanel value={activeTab} index={selectedOrg?.subscriptionTier === 'internal' ? 2 : 3}>
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
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.secondary' }}>
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
          setClientAdminEmail('');
          setClientAdminEmailError(null);
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const isFormValid = newOrgName && newOrgSlug && !slugError && !createOrgLoading && !(clientAdminEmail.length > 0 && !validateEmail(clientAdminEmail));
          if (isFormValid) {
            handleCreateOrganization();
          }
        }}>
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
              helperText={slugError || slugInfo || "Auto-generated from name. Only lowercase letters, numbers, and hyphens."}
              placeholder="e.g., acme-corporation"
              sx={{ 
                mb: 2,
                '& .MuiFormHelperText-root': slugInfo && !slugError ? {
                  color: '#1976d2',
                  fontWeight: 500,
                } : {},
              }}
            />
            <TextField
              fullWidth
              label="Client Admin Email (optional)"
              value={clientAdminEmail}
              onChange={(e) => {
                setClientAdminEmail(e.target.value);
                setClientAdminEmailError(null);
              }}
              error={!!clientAdminEmailError || (clientAdminEmail.length > 0 && !validateEmail(clientAdminEmail))}
              helperText={clientAdminEmailError || (clientAdminEmail.length > 0 && !validateEmail(clientAdminEmail) ? 'Please enter a valid email' : 'An invitation email will be sent to this address')}
              placeholder="admin@company.com"
              type="email"
            />
          </DialogContent>
          <DialogActions>
            <Button 
              type="button"
              onClick={() => {
                setShowCreateOrgDialog(false);
                setNewOrgName('');
                setNewOrgSlug('');
                setSlugError(null);
                setClientAdminEmail('');
                setClientAdminEmailError(null);
              }}
              disabled={createOrgLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!newOrgName || !newOrgSlug || !!slugError || createOrgLoading || (clientAdminEmail.length > 0 && !validateEmail(clientAdminEmail))}
              startIcon={createOrgLoading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                bgcolor: '#4CAF50',
                '&:hover': { bgcolor: '#45a049' },
              }}
            >
              {createOrgLoading ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Organization Invitation Modal */}
      {selectedOrg && (
        <OrganizationInvitationModal
          open={showInvitationModal}
          onClose={() => setShowInvitationModal(false)}
          onSuccess={handleInvitationSuccess}
          organizationId={selectedOrg.id}
          organizationName={selectedOrg.name}
          subscriptionTier={selectedOrg.subscriptionTier}
        />
      )}

      {/* User Management Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleCloseUserMenu}
      >
        {canMarkNLWF && selectedMember?.status !== 'nlwf' && (
          <MenuItem 
            onClick={() => {
              setShowNLWFConfirm(true);
              handleCloseUserMenu();
            }}
          >
            <PersonOff sx={{ mr: 1, fontSize: 20 }} />
            Mark as NLWF (Inactive)
          </MenuItem>
        )}
        {canRemoveUsers && (
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
        )}
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

      <Snackbar
        open={!!warning}
        autoHideDuration={6000}
        onClose={() => setWarning(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="warning" onClose={() => setWarning(null)} sx={{ width: '100%' }}>
          {warning}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrganizationManagementPage;
