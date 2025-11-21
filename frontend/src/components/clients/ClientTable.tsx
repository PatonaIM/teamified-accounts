import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  TablePagination,
  Stack,
  Chip,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Edit, Delete, Business } from '@mui/icons-material';
import type { Client } from '../../types/client';

interface ClientTableProps {
  clients: Client[];
  loading: boolean;
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
}

const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  loading,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEditClient,
  onDeleteClient,
}) => {
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Chip
            label="Active"
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
      case 'inactive':
        return (
          <Chip
            label="Inactive"
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

  const handleChangePage = (event: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (clients.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          🏢
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
          No clients found
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Try adjusting your search or filter criteria
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
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
                Description
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
                Contact Info
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow
                key={client.id}
                sx={{
                  '&:hover': { bgcolor: 'action.hover' },
                  '&:last-child td': { borderBottom: 0 }
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Business sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      {client.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.875rem', 
                      color: 'text.secondary' 
                    }}
                  >
                    {client.description || '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    {client.contactInfo?.email && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.875rem', 
                          color: 'text.secondary' 
                        }}
                      >
                        {client.contactInfo.email}
                      </Typography>
                    )}
                    {client.contactInfo?.phone && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.875rem', 
                          color: 'text.secondary' 
                        }}
                      >
                        {client.contactInfo.phone}
                      </Typography>
                    )}
                    {!client.contactInfo?.email && !client.contactInfo?.phone && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.875rem', 
                          color: 'text.secondary' 
                        }}
                      >
                        —
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  {getStatusChip(client.status)}
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Edit client">
                      <IconButton
                        size="small"
                        onClick={() => onEditClient(client)}
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete client">
                      <IconButton
                        size="small"
                        onClick={() => onDeleteClient(client)}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                          },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          '& .MuiTablePagination-toolbar': {
            paddingLeft: 3,
            paddingRight: 3,
          },
        }}
      />
    </Box>
  );
};

export default ClientTable;
