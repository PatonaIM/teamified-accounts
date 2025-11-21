/**
 * Shared styled components for profile forms
 *
 * Material-UI 3 Expressive Design patterns for consistent styling
 * across Profile page and Onboarding wizard.
 */

import { styled } from '@mui/material/styles';
import {
  Card,
  Tab,
  TextField,
  Button,
  Box,
  Paper,
  CardHeader as MuiCardHeader
} from '@mui/material';

/**
 * Styled Card with Material-UI 3 expressive design
 * Features elevation, hover effects, and custom border
 */
export const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
}));

/**
 * Styled Tab with custom selected color and typography
 */
export const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 48,
  textTransform: 'none',
  fontWeight: 500,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
}));

/**
 * Styled TextField with custom focus color and border radius
 */
export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.primary.main,
  },
}));

/**
 * Styled Button with theme colors
 */
export const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1.5, 3),
}));

/**
 * Styled Paper for header sections
 */
export const HeaderPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  elevation: 0,
}));

/**
 * Styled CardHeader with consistent styling
 */
export const PurpleCardHeader = styled(MuiCardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiCardHeader-title': {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
}));

export const BlueCardHeader = styled(MuiCardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiCardHeader-title': {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
}));

/**
 * Field Row Container
 * Responsive flex container for form fields
 */
export const FieldRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  flexWrap: 'wrap',
  '& > *': {
    flex: '1 1 300px',
  },
}));

/**
 * Form Container
 * Consistent spacing for form fields
 */
export const FormContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

/**
 * Action Button Container
 * Right-aligned container for action buttons
 */
export const ActionButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

/**
 * Section Paper
 * Paper container for sub-sections within tabs
 */
export const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  elevation: 1,
  border: `1px solid ${theme.palette.divider}`,
}));

/**
 * Info Alert Box
 * For displaying information messages in forms
 */
export const InfoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  backgroundColor: theme.palette.info.light,
  border: `1px solid ${theme.palette.info.main}`,
  marginBottom: theme.spacing(3),
}));

/**
 * Badge/Chip container for country indicators
 */
export const CountryBadgeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  marginBottom: theme.spacing(2),
}));

/**
 * Loading Box
 * Centered loading spinner container
 */
export const LoadingBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '200px',
  padding: theme.spacing(4),
}));

/**
 * Empty State Box
 * For displaying empty states in tabs
 */
export const EmptyStateBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '200px',
  padding: theme.spacing(4),
  color: theme.palette.text.secondary,
  textAlign: 'center',
}));

/**
 * Tab Container
 * Container for tab content with consistent padding
 */
export const TabContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

/**
 * Tabs Panel Container
 * Main container for tabs navigation
 */
export const TabsPanelContainer = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  elevation: 0,
}));

/**
 * Typography styles for consistent headings
 * Note: These are plain objects, not using theme directly
 * Applied via sx prop where theme is available
 */
export const HeadingTypographyStyle = {
  fontWeight: 700,
};

export const SubheadingTypographyStyle = {
  fontWeight: 400,
  lineHeight: 1.6,
};

/**
 * Tabs indicator style
 * Note: This is a plain object, not using theme directly
 * Applied via sx prop where theme is available
 */
export const TabsIndicatorStyle = (theme: any) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
});
