import React from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import { useClient } from '../contexts/ClientContext';
import { useAuth } from '../hooks/useAuth';
import type { Client } from '../types/client';

const ClientPicker: React.FC = () => {
  const { user } = useAuth();
  const { selectedClient, clients, isLoading, setSelectedClient } = useClient();

  const hasAccess = user && (user.roles.includes('admin') || user.roles.includes('hr'));

  if (!hasAccess) {
    return null;
  }

  const options = [
    { id: null, name: 'All Clients', isAllClients: true } as any,
    ...clients,
  ];

  const handleChange = (_event: any, newValue: Client | null) => {
    if (newValue && (newValue as any).isAllClients) {
      setSelectedClient(null);
    } else {
      setSelectedClient(newValue);
    }
  };

  const currentValue = selectedClient || { id: null, name: 'All Clients', isAllClients: true };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        minWidth: { xs: 150, sm: 200, md: 250 },
        maxWidth: { xs: 200, sm: 300, md: 350 },
      }}
    >
      <Autocomplete
        value={currentValue as any}
        onChange={handleChange}
        options={options}
        getOptionLabel={(option) => option?.name || ''}
        isOptionEqualToValue={(option, value) => option?.id === value?.id}
        loading={isLoading}
        size="small"
        fullWidth
        disableClearable
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Select Client"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <BusinessIcon
                  sx={{
                    color: 'text.secondary',
                    fontSize: 20,
                    mr: 0.5,
                    ml: -0.5,
                  }}
                />
              ),
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <BusinessIcon
              sx={{
                color: (option as any).isAllClients ? 'primary.main' : 'text.secondary',
                fontSize: 18,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontWeight: (option as any).isAllClients ? 600 : 400,
                color: (option as any).isAllClients ? 'primary.main' : 'text.primary',
              }}
            >
              {option.name}
            </Typography>
          </Box>
        )}
        sx={{
          '& .MuiAutocomplete-popupIndicator': {
            color: 'text.secondary',
          },
        }}
      />
    </Box>
  );
};

export default ClientPicker;
