import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
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
import { 
  Search, 
  Add, 
  Business, 
  Edit, 
  Warning, 
  CameraAlt, 
  MoreVert, 
  PersonRemove, 
  PersonOff,
  KeyboardArrowDown,
  Construction,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import organizationsService, { type Organization, type OrganizationMember } from '../services/organizationsService';
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

const MyOrganizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberStatusFilters, setMemberStatusFilters] = useState<Set<string> | null>(null);
  
  const [displayedMembersCount, setDisplayedMembersCount] = useState(10);
  const membersPerPage = 10;

  const [activeTab, setActiveTab] = useState(0);
  
  const [editOrgData, setEditOrgData] = useState<Organization | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [orphanCount, setOrphanCount] = useState<{ totalMembers: number; willBecomeOrphans: number } | null>(null);

  const [showInvitationModal, setShowInvitationModal] = useState(false);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showNLWFConfirm, setShowNLWFConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [orgSwitcherAnchor, setOrgSwitcherAnchor] = useState<null | HTMLElement>(null);


  const permissions = useOrganizationPermissions({
    userRoles: user?.roles || [],
    isOwnOrganization: true,
  });

  const {
    canInviteUsers,
    canRemoveUsers,
    canChangeRoles,
    canMarkNLWF,
    canSendPasswordReset,
    canSuspendUser,
    canViewUserDetails,
    canViewSensitiveInfo,
  } = permissions;
  
  const canEditProfile = permissions.canEditOrgProfile;
  const canViewBilling = permissions.canViewBilling;
  const canDeleteOrg = permissions.canDeleteOrg;

  useEffect(() => {
    loadOrganizations();
  }, [urlSlug]);

  useEffect(() => {
    if (selectedOrg) {
      loadMembers();
      setEditOrgData(selectedOrg);
      setDeleteConfirmSlug('');
      setDisplayedMembersCount(10);
      setMemberSearchQuery('');
      setMemberStatusFilters(null);
      setActiveTab(0);
      
      if (canDeleteOrg) {
        loadOrphanCount();
      }
    }
  }, [selectedOrg?.id]);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      if (urlSlug) {
        const org = await organizationsService.getBySlug(urlSlug);
        setSelectedOrg(org);
        const orgs = await organizationsService.getMyOrganizations();
        setOrganizations(orgs);
      } else {
        const orgs = await organizationsService.getMyOrganizations();
        setOrganizations(orgs);
        if (orgs.length > 0) {
          navigate(`/organization/${orgs[0].slug}`, { replace: true });
        }
      }
    } catch (err: any) {
      console.error('Failed to load organizations:', err);
      if (err?.response?.status === 403) {
        setError('You do not have access to this organization');
      } else if (err?.response?.status === 404) {
        setError('Organization not found');
      } else {
        setError('Failed to load organization');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    if (!selectedOrg) return;
    setMembersLoading(true);
    try {
      const membersData = await organizationsService.getMembers(selectedOrg.id);
      setMembers(membersData);
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setMembersLoading(false);
    }
  };

  const loadOrphanCount = async () => {
    if (!selectedOrg) return;
    try {
      const count = await organizationsService.getOrphanCount(selectedOrg.id);
      setOrphanCount(count);
    } catch (err) {
      console.error('Failed to load orphan count:', err);
    }
  };

  const handleOrgSwitch = (org: Organization) => {
    setOrgSwitcherAnchor(null);
    navigate(`/organization/${org.slug}`);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedOrg || !canEditProfile) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploadingLogo(true);
    try {
      const logoUrl = await organizationsService.uploadLogo(selectedOrg.id, file);
      const updatedOrg = { ...selectedOrg, logoUrl };
      setSelectedOrg(updatedOrg);
      setEditOrgData(updatedOrg);
      setOrganizations(prev => prev.map(org => org.id === selectedOrg.id ? updatedOrg : org));
      setSuccess('Logo uploaded successfully!');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to upload logo';
      setError(errorMessage);
    } finally {
      setUploadingLogo(false);
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfileChanges = async () => {
    if (!editOrgData || !canEditProfile) return;
    setSavingProfile(true);
    try {
      const updatedOrg = await organizationsService.update(editOrgData.id, {
        name: editOrgData.name,
        slug: editOrgData.slug,
        industry: editOrgData.industry,
        companySize: editOrgData.companySize,
        website: editOrgData.website,
      });
      
      setIsEditingProfile(false);
      setSuccess('Organization updated successfully!');
      setSelectedOrg(updatedOrg);
      setEditOrgData(updatedOrg);
      setOrganizations(prev => prev.map(org => org.id === updatedOrg.id ? updatedOrg : org));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update organization');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (!selectedOrg || deleteConfirmSlug !== selectedOrg.slug || !canDeleteOrg) return;
    
    setDeleteLoading(true);
    try {
      await organizationsService.delete(selectedOrg.id);
      setSuccess('Organization deleted successfully!');
      
      const updatedOrgs = organizations.filter(o => o.id !== selectedOrg.id);
      setOrganizations(updatedOrgs);
      
      if (updatedOrgs.length > 0) {
        setSelectedOrg(updatedOrgs[0]);
        localStorage.setItem('selectedOrganizationId', updatedOrgs[0].id);
      } else {
        setSelectedOrg(null);
        localStorage.removeItem('selectedOrganizationId');
      }
      
      setDeleteConfirmSlug('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete organization');
    } finally {
      setDeleteLoading(false);
    }
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

  const handleUserRowClick = (member: OrganizationMember) => {
    if (!canViewUserDetails) return;
    navigate(`/users/${member.userId}`, {
      state: {
        organizationId: selectedOrg?.id,
        organizationName: selectedOrg?.name,
        organizationSlug: selectedOrg?.slug,
        fromClientPage: true,
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

  const statusCounts = members.reduce((acc, member) => {
    const status = member.status?.toLowerCase() || 'active';
    acc[status] = (acc[status] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    if (members.length > 0 && memberStatusFilters === null) {
      const activeCount = statusCounts['active'] || 0;
      if (activeCount === 0) {
        setMemberStatusFilters(new Set(['active', 'invited']));
      } else {
        setMemberStatusFilters(new Set(['active']));
      }
    }
  }, [members, memberStatusFilters]);

  const effectiveFilters = memberStatusFilters || new Set<string>();

  const filteredMembers = members.filter((member) => {
    const status = member.status?.toLowerCase() || 'active';
    
    if (effectiveFilters.size === 0) return false;
    if (!effectiveFilters.has(status)) return false;
    
    if (!memberSearchQuery.trim()) return true;
    
    const query = memberSearchQuery.toLowerCase();
    const name = (member.userName || '').toLowerCase();
    const email = (member.userEmail || '').toLowerCase();
    const role = (member.roleType || '').toLowerCase().replace('client_', '').replace('internal_', '');
    
    return name.includes(query) || email.includes(query) || role.includes(query);
  });
  
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
    setDisplayedMembersCount(10);
  };

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    return getRolePriority(a.roleType) - getRolePriority(b.roleType);
  });

  const paginatedMembers = sortedMembers.slice(0, displayedMembersCount);
  const hasMoreMembers = displayedMembersCount < sortedMembers.length;

  const getSubscriptionColor = (tier: string | undefined): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (tier?.toLowerCase()) {
      case 'enterprise': return 'warning';
      case 'professional': return 'secondary';
      case 'basic': return 'info';
      case 'free': return 'default';
      case 'internal': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (organizations.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 3, 
            border: '1px solid', 
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Business sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            No Organization Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
            You are not currently a member of any organization. Contact your administrator or wait for an invitation to join an organization.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>

      {selectedOrg && (
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', position: 'relative' }}>
            {organizations.length > 1 && (
              <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                <Button
                  onClick={(e) => setOrgSwitcherAnchor(e.currentTarget)}
                  endIcon={<KeyboardArrowDown />}
                  variant="outlined"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    borderColor: 'divider',
                    color: 'text.secondary',
                    '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' },
                  }}
                >
                  Switch Organization ({organizations.length} available)
                </Button>
                <Menu
                  anchorEl={orgSwitcherAnchor}
                  open={Boolean(orgSwitcherAnchor)}
                  onClose={() => setOrgSwitcherAnchor(null)}
                >
                  {organizations.map((org) => (
                    <MenuItem
                      key={org.id}
                      onClick={() => handleOrgSwitch(org)}
                      selected={org.id === selectedOrg?.id}
                      sx={{ minWidth: 250 }}
                    >
                      <Avatar
                        src={org.logoUrl || undefined}
                        sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}
                      >
                        <Business sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {org.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {org.memberCount || 0} users
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={selectedOrg.logoUrl || undefined}
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
                {canEditProfile && (
                  <>
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
                        '&:hover': { bgcolor: 'primary.dark' },
                        '&:disabled': { bgcolor: 'action.disabledBackground' },
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
                  </>
                )}
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {selectedOrg.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Chip label={selectedOrg.slug} size="small" sx={{ height: 24 }} />
                  <Chip label={`${selectedOrg.memberCount || 0} users`} size="small" variant="outlined" sx={{ height: 24 }} />
                  {selectedOrg.subscriptionTier && (
                    <Chip 
                      label={selectedOrg.subscriptionTier} 
                      size="small" 
                      color={getSubscriptionColor(selectedOrg.subscriptionTier)}
                      sx={{ height: 24, fontWeight: 600, textTransform: 'capitalize' }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
          >
            <Tab label="Users" />
            <Tab label="Company Profile" />
            {canViewBilling && <Tab label="Billing Details" />}
            {canDeleteOrg && <Tab label="Delete Organization" />}
          </Tabs>

          <Box sx={{ minHeight: 400 }}>
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ px: 3 }}>
                {membersLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Search users by name, email, or role..."
                        value={memberSearchQuery}
                        onChange={(e) => {
                          setMemberSearchQuery(e.target.value);
                          setDisplayedMembersCount(10);
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search />
                            </InputAdornment>
                          ),
                        }}
                      />
                      {canInviteUsers && (
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
                      )}
                    </Box>

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

                    {members.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                          No users in this organization
                        </Typography>
                        {canInviteUsers && (
                          <Typography variant="body2" color="text.secondary">
                            Click "Invite User" to add team members
                          </Typography>
                        )}
                      </Box>
                    ) : paginatedMembers.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="body1" color="text.secondary">
                          No users match your filter criteria
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <Stack spacing={1}>
                          {paginatedMembers.map((member) => {
                            const isNlwf = member.status === 'nlwf';
                            return (
                              <Paper
                                key={member.id}
                                onClick={() => handleUserRowClick(member)}
                                sx={{
                                  p: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  borderRadius: 2,
                                  border: '1px solid',
                                  borderColor: isNlwf ? 'action.disabled' : 'divider',
                                  cursor: canViewUserDetails ? 'pointer' : 'default',
                                  bgcolor: isNlwf ? 'action.disabledBackground' : 'background.paper',
                                  opacity: isNlwf ? 0.75 : 1,
                                  transition: 'all 0.2s',
                                  '&:hover': canViewUserDetails ? { 
                                    borderColor: 'primary.main',
                                    transform: 'translateY(-2px)',
                                    boxShadow: 2,
                                    opacity: 1,
                                  } : {},
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar
                                    src={member.profilePicture || undefined}
                                    sx={{ 
                                      width: 48, 
                                      height: 48,
                                      filter: isNlwf ? 'grayscale(100%)' : 'none',
                                    }}
                                  >
                                    {member.userName?.charAt(0) || 'U'}
                                  </Avatar>
                                  <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography 
                                        variant="body1" 
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
                                          sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                      )}
                                      {member.status === 'nlwf' && (
                                        <Chip
                                          label="NLWF"
                                          size="small"
                                          color="warning"
                                          sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                      )}
                                      {member.status === 'suspended' && (
                                        <Chip
                                          label="Suspended"
                                          size="small"
                                          color="error"
                                          sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                      )}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {member.userEmail}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    label={member.roleType?.replace('client_', '').replace('internal_', '')}
                                    size="small"
                                    color={getRoleColor(member.roleType)}
                                    sx={{ textTransform: 'capitalize', opacity: isNlwf ? 0.6 : 1 }}
                                  />
                                  {(canRemoveUsers || canChangeRoles || canMarkNLWF) && member.userId !== user?.id && (
                                    <IconButton
                                      size="small"
                                      onClick={(e) => handleOpenUserMenu(e, member)}
                                    >
                                      <MoreVert />
                                    </IconButton>
                                  )}
                                </Box>
                              </Paper>
                            );
                          })}
                        </Stack>

                        {hasMoreMembers && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Button
                              variant="outlined"
                              onClick={() => setDisplayedMembersCount(prev => prev + membersPerPage)}
                            >
                              Load More ({sortedMembers.length - displayedMembersCount} remaining)
                            </Button>
                          </Box>
                        )}
                      </>
                    )}
                  </>
                )}
              </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Box sx={{ px: 3 }}>
                {canEditProfile && !isEditingProfile && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                      startIcon={<Edit />}
                      onClick={() => setIsEditingProfile(true)}
                    >
                      Edit Profile
                    </Button>
                  </Box>
                )}
                
                <Stack spacing={3}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    <TextField
                      label="Organization Name"
                      value={editOrgData?.name || ''}
                      onChange={(e) => setEditOrgData(prev => prev ? { ...prev, name: e.target.value } : null)}
                      disabled={!isEditingProfile}
                      fullWidth
                    />
                    <TextField
                      label="Slug"
                      value={editOrgData?.slug || ''}
                      onChange={(e) => setEditOrgData(prev => prev ? { ...prev, slug: e.target.value } : null)}
                      disabled={!isEditingProfile}
                      fullWidth
                      helperText="URL-friendly identifier (lowercase, hyphens only)"
                    />
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    <FormControl fullWidth disabled={!isEditingProfile}>
                      <InputLabel>Industry</InputLabel>
                      <Select
                        value={editOrgData?.industry || ''}
                        label="Industry"
                        onChange={(e) => setEditOrgData(prev => prev ? { ...prev, industry: e.target.value } : null)}
                      >
                        {INDUSTRIES.map((industry) => (
                          <MenuItem key={industry} value={industry}>{industry}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth disabled={!isEditingProfile}>
                      <InputLabel>Company Size</InputLabel>
                      <Select
                        value={editOrgData?.companySize || ''}
                        label="Company Size"
                        onChange={(e) => setEditOrgData(prev => prev ? { ...prev, companySize: e.target.value } : null)}
                      >
                        {COMPANY_SIZES.map((size) => (
                          <MenuItem key={size} value={size}>{size}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <TextField
                    label="Website"
                    value={editOrgData?.website || ''}
                    onChange={(e) => setEditOrgData(prev => prev ? { ...prev, website: e.target.value } : null)}
                    disabled={!isEditingProfile}
                    fullWidth
                    placeholder="https://example.com"
                  />
                </Stack>

                {isEditingProfile && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    <Button
                      variant="contained"
                      onClick={handleSaveProfileChanges}
                      disabled={savingProfile}
                    >
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setEditOrgData(selectedOrg);
                      }}
                      disabled={savingProfile}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>
            </TabPanel>

            {canViewBilling && (
              <TabPanel value={activeTab} index={2}>
                <Box sx={{ px: 3, textAlign: 'center', py: 8 }}>
                  <Construction sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                    Coming Soon
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                    Billing management features are currently under development. You'll be able to view and manage your subscription, payment methods, and invoices here.
                  </Typography>
                </Box>
              </TabPanel>
            )}

            {canDeleteOrg && (
              <TabPanel value={activeTab} index={canViewBilling ? 3 : 2}>
                <Box sx={{ px: 3, maxWidth: 600 }}>
                  <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Danger Zone
                    </Typography>
                    <Typography variant="body2">
                      Deleting an organization is permanent and cannot be undone. All members will be removed from this organization.
                    </Typography>
                  </Alert>

                  {orphanCount && orphanCount.willBecomeOrphans > 0 && (
                    <Alert severity="warning" icon={<Warning />} sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Orphan Warning
                      </Typography>
                      <Typography variant="body2">
                        {orphanCount.willBecomeOrphans} of {orphanCount.totalMembers} member(s) will become organizationless after deletion (they only belong to this organization).
                      </Typography>
                    </Alert>
                  )}

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    To confirm deletion, type the organization slug: <strong>{selectedOrg.slug}</strong>
                  </Typography>
                  
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={selectedOrg.slug}
                    value={deleteConfirmSlug}
                    onChange={(e) => setDeleteConfirmSlug(e.target.value)}
                    sx={{ mb: 3 }}
                  />

                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteOrganization}
                    disabled={deleteConfirmSlug !== selectedOrg.slug || deleteLoading}
                    startIcon={deleteLoading ? <CircularProgress size={16} color="inherit" /> : <Warning />}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete Organization'}
                  </Button>
                </Box>
              </TabPanel>
            )}
          </Box>
        </Paper>
      )}

      {selectedOrg && (
        <OrganizationInvitationModal
          open={showInvitationModal}
          onClose={() => setShowInvitationModal(false)}
          organizationId={selectedOrg.id}
          organizationName={selectedOrg.name}
          subscriptionTier={selectedOrg.subscriptionTier}
          onSuccess={handleInvitationSuccess}
        />
      )}

      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleCloseUserMenu}
      >
        {canRemoveUsers && (
          <MenuItem onClick={() => { setShowRemoveConfirm(true); handleCloseUserMenu(); }}>
            <PersonRemove sx={{ mr: 1, fontSize: 20 }} />
            Remove from Organization
          </MenuItem>
        )}
        {canMarkNLWF && selectedMember?.status !== 'nlwf' && (
          <MenuItem onClick={() => { setShowNLWFConfirm(true); handleCloseUserMenu(); }}>
            <PersonOff sx={{ mr: 1, fontSize: 20 }} />
            Mark as NLWF
          </MenuItem>
        )}
      </Menu>

      <Dialog open={showRemoveConfirm} onClose={() => setShowRemoveConfirm(false)}>
        <DialogTitle>Remove User from Organization</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{selectedMember?.userName}</strong> from this organization?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRemoveConfirm(false)}>Cancel</Button>
          <Button 
            onClick={handleRemoveFromOrg} 
            color="error" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showNLWFConfirm} onClose={() => setShowNLWFConfirm(false)}>
        <DialogTitle>Mark User as NLWF</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark <strong>{selectedMember?.userName}</strong> as No Longer With Firm (NLWF)?
            This will set their account status to inactive.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNLWFConfirm(false)}>Cancel</Button>
          <Button 
            onClick={handleMarkNLWF} 
            color="warning" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Mark as NLWF'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default MyOrganizationPage;
