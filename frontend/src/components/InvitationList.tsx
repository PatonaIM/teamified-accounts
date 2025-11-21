import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Refresh as RefreshCwIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface InvitationListProps {
  onRefresh: () => void;
  filters?: {
    search: string;
    status: string;
    role: string;
  };
}

// Mock data
const mockInvitations = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    country: 'India',
    role: 'EOR',
    client: 'TechCorp Inc.',
    status: 'pending',
    created: '2024-01-15',
    expires: '2024-02-15',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    country: 'Philippines',
    role: 'Admin',
    client: 'StartupXYZ',
    status: 'accepted',
    created: '2024-01-10',
    expires: '2024-02-10',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    country: 'Sri Lanka',
    role: 'EOR',
    client: 'GlobalTech',
    status: 'expired',
    created: '2023-12-20',
    expires: '2024-01-20',
  },
];

const InvitationList: React.FC<InvitationListProps> = ({ onRefresh, filters }) => {
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Chip
            label="Pending"
            size="small"
            sx={{ 
              fontWeight: 600,
              bgcolor: (theme) => 
                theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.warning.main, 0.2) 
                  : alpha(theme.palette.warning.main, 0.1),
              color: 'warning.main',
              border: '1px solid',
              borderColor: 'warning.main',
            }}
          />
        );
      case 'accepted':
        return (
          <Chip
            label="Accepted"
            size="small"
            sx={{ 
              fontWeight: 600,
              bgcolor: (theme) => 
                theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.success.main, 0.2) 
                  : alpha(theme.palette.success.main, 0.1),
              color: 'success.main',
              border: '1px solid',
              borderColor: 'success.main',
            }}
          />
        );
      case 'expired':
        return (
          <Chip
            label="Expired"
            size="small"
            sx={{ 
              fontWeight: 600,
              bgcolor: (theme) => 
                theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.error.main, 0.2) 
                  : alpha(theme.palette.error.main, 0.1),
              color: 'error.main',
              border: '1px solid',
              borderColor: 'error.main',
            }}
          />
        );
      default:
        return (
          <Chip
            label={status}
            size="small"
            sx={{ 
              fontWeight: 600,
              bgcolor: (theme) => 
                theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.grey[500], 0.2) 
                  : alpha(theme.palette.grey[500], 0.1),
              color: 'text.secondary',
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
        );
    }
  };

  const filteredInvitations = mockInvitations.filter((invitation) => {
    const matchesSearch = !filters?.search ||
      invitation.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      invitation.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      invitation.client?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = !filters?.status || filters.status === 'all' || invitation.status === filters.status;
    const matchesRole = !filters?.role || filters.role === 'all' || invitation.role === filters.role;

    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <Box sx={{ p: 0 }}>
        {filteredInvitations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
              📋
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
              No invitations found
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {filters?.search || (filters?.status && filters.status !== 'all') || (filters?.role && filters.role !== 'all')
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first invitation to get started'}
            </Typography>
          </Box>
        ) : (
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
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
                    Country
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
                    Role
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
                    Client
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
                    Created
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
                    Expires
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvitations.map((invitation) => (
                  <TableRow 
                    key={invitation.id} 
                    sx={{ 
                      '&:hover': { bgcolor: 'action.hover' },
                      '&:last-child td': { borderBottom: 0 }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                        {invitation.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {invitation.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {invitation.country}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {invitation.role}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {invitation.client}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(invitation.status)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {invitation.created}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {invitation.expires}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {invitation.status === 'pending' && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<RefreshCwIcon />}
                            sx={{
                              borderRadius: 2,
                              px: 2,
                              py: 0.5,
                              fontWeight: 600,
                              textTransform: 'none',
                              fontSize: '0.75rem',
                            }}
                          >
                            Resend
                          </Button>
                        )}
                        <IconButton
                          size="small"
                          sx={{
                            color: 'error.main',
                            '&:hover': {
                              bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
    </Box>
  );
};

export default InvitationList;
