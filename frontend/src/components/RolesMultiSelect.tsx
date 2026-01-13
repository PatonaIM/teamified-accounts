import React from 'react';
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface RoleOption {
  label: string;
  category: string;
}

const ROLES_BY_CATEGORY: Record<string, string[]> = {
  'Technology': [
    'Software Developer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Data Engineer',
    'Data Scientist',
    'QA Engineer',
    'UI/UX Designer',
    'Product Manager',
    'Technical Lead',
    'IT Support',
  ],
  'Business & Operations': [
    'Project Manager',
    'Business Analyst',
    'Operations Manager',
    'Executive Assistant',
    'Office Manager',
    'Procurement Specialist',
  ],
  'Finance & Accounting': [
    'Accountant',
    'Financial Analyst',
    'Bookkeeper',
    'Payroll Specialist',
    'Tax Specialist',
    'CFO',
  ],
  'Sales & Marketing': [
    'Sales Representative',
    'Account Executive',
    'Marketing Manager',
    'Digital Marketing Specialist',
    'Content Writer',
    'SEO Specialist',
    'Social Media Manager',
    'Growth Hacker',
  ],
  'Customer Service': [
    'Customer Support Representative',
    'Customer Success Manager',
    'Technical Support',
    'Help Desk Specialist',
  ],
  'Human Resources': [
    'HR Manager',
    'Recruiter',
    'Talent Acquisition Specialist',
    'HR Coordinator',
    'Training Specialist',
  ],
  'Other': [
    'Legal Counsel',
    'Graphic Designer',
    'Video Editor',
    'Virtual Assistant',
    'Other',
  ],
};

const allRoleOptions: RoleOption[] = Object.entries(ROLES_BY_CATEGORY).flatMap(
  ([category, roles]) => roles.map((role) => ({ label: role, category }))
);

interface RolesMultiSelectProps {
  selectedRoles: string[];
  onChange: (roles: string[]) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

export default function RolesMultiSelect({
  selectedRoles,
  onChange,
  disabled = false,
  error = false,
  helperText,
}: RolesMultiSelectProps) {
  const selectedOptions = allRoleOptions.filter((opt) =>
    selectedRoles.includes(opt.label)
  );

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: RoleOption[]
  ) => {
    onChange(newValue.map((opt) => opt.label));
  };

  const handleRemoveRole = (roleToRemove: string) => {
    onChange(selectedRoles.filter((role) => role !== roleToRemove));
  };

  return (
    <Autocomplete
      multiple
      options={allRoleOptions}
      value={selectedOptions}
      onChange={handleChange}
      groupBy={(option) => option.category}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      disabled={disabled}
      disableCloseOnSelect
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={selectedRoles.length === 0 ? 'Select roles...' : ''}
          error={error}
          helperText={helperText}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white',
              borderRadius: 2,
              minHeight: 56,
              '& fieldset': { borderColor: '#E5E7EB' },
              '&:hover fieldset': { borderColor: '#9333EA' },
              '&.Mui-focused fieldset': { borderColor: '#9333EA', borderWidth: 2 },
            },
          }}
        />
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          const tagProps = getTagProps({ index });
          return (
            <Chip
              {...tagProps}
              key={option.label}
              label={option.label}
              size="small"
              deleteIcon={<Close sx={{ fontSize: '16px !important' }} />}
              onDelete={() => handleRemoveRole(option.label)}
              sx={{
                bgcolor: 'rgba(147, 51, 234, 0.1)',
                color: '#9333EA',
                fontWeight: 500,
                '& .MuiChip-deleteIcon': {
                  color: '#9333EA',
                  '&:hover': {
                    color: '#7E22CE',
                  },
                },
              }}
            />
          );
        })
      }
      renderOption={(props, option) => {
        const { key, ...otherProps } = props as React.HTMLAttributes<HTMLLIElement> & { key: string };
        return (
          <Box
            component="li"
            key={key}
            {...otherProps}
            sx={{
              py: 1,
              px: 2,
              '&:hover': {
                bgcolor: 'rgba(147, 51, 234, 0.04)',
              },
              '&[aria-selected="true"]': {
                bgcolor: 'rgba(147, 51, 234, 0.1) !important',
              },
            }}
          >
            <Typography sx={{ fontSize: '0.875rem', color: '#1a1a1a' }}>
              {option.label}
            </Typography>
          </Box>
        );
      }}
      renderGroup={(params) => (
        <Box key={params.key}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              px: 2,
              py: 1,
              bgcolor: '#F9FAFB',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}
          >
            {params.group}
          </Typography>
          {params.children}
        </Box>
      )}
      ListboxProps={{
        sx: {
          maxHeight: 300,
          '& .MuiAutocomplete-groupUl': {
            padding: 0,
          },
        },
      }}
      sx={{
        '& .MuiAutocomplete-popupIndicator': {
          color: '#9333EA',
        },
        '& .MuiAutocomplete-clearIndicator': {
          color: '#9333EA',
        },
      }}
    />
  );
}
