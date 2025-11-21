# TMFNUI Styling Transformation Guide - Phase 2B

**Date**: 2025-10-30
**Task**: Transform hiring modules to use Portal theme and dark mode
**Prerequisites**: Phase 2A complete (functionality working, basic styling in place)

---

## 📋 Overview

After Phase 2A, the hiring modules are functional but use basic styling. This phase transforms them to:
- ✅ Use portal's theme system
- ✅ Support dark mode automatically
- ✅ Match portal's design language
- ✅ Remove TMFNUI-specific styling
- ✅ Ensure consistent user experience

---

## 🎨 Portal Theme Overview

The portal uses **MUI v7 theming** with custom theme configuration and dark mode support.

### Portal Theme Files (Reference)

**Location**: `frontend/src/theme/`

Key theme properties:
- **Primary Color**: Purple (#A16AE8)
- **Secondary Color**: Blue (#8096FD)
- **Font**: Plus Jakarta Sans
- **Dark Mode**: Automatically managed by ThemeProvider
- **Spacing**: MUI's 8px base unit

### How to Access Theme in Components

```typescript
import { useTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        padding: theme.spacing(2),
      }}
    >
      Content
    </Box>
  );
}
```

---

## 🔧 Step 1: Replace Hardcoded Colors with Theme

### 1.1 Background Colors

**BEFORE (Basic styling from Phase 2A)**:
```typescript
<Box
  sx={{
    backgroundColor: '#f5f5f5',  // Hardcoded
    padding: 2,
  }}
>
```

**AFTER (Portal theme)**:
```typescript
<Box
  sx={{
    backgroundColor: 'background.paper',  // Theme-aware, dark mode compatible
    padding: 2,
  }}
>
```

### 1.2 Text Colors

**BEFORE**:
```typescript
<Typography
  sx={{
    color: '#000',  // Hardcoded black
  }}
>
```

**AFTER**:
```typescript
<Typography
  sx={{
    color: 'text.primary',  // Theme-aware, changes in dark mode
  }}
>
```

### 1.3 Border Colors

**BEFORE**:
```typescript
<Box
  sx={{
    border: '1px solid #ddd',  // Hardcoded
  }}
>
```

**AFTER**:
```typescript
<Box
  sx={{
    border: 1,
    borderColor: 'divider',  // Theme-aware
  }}
>
```

### 1.4 Common Color Mappings

| Hardcoded Value | Portal Theme Property | Dark Mode Behavior |
|----------------|----------------------|-------------------|
| `#ffffff` (white) | `background.paper` | Becomes dark gray |
| `#f5f5f5` (light gray) | `background.default` | Becomes darker gray |
| `#000000` (black) | `text.primary` | Becomes white |
| `#666666` (gray) | `text.secondary` | Becomes light gray |
| `#ddd` (border) | `divider` | Becomes gray |
| `#A16AE8` (purple) | `primary.main` | Same in both modes |
| `#8096FD` (blue) | `secondary.main` | Same in both modes |
| `#4caf50` (green) | `success.main` | Same in both modes |
| `#f44336` (red) | `error.main` | Same in both modes |
| `#ff9800` (orange) | `warning.main` | Same in both modes |
| `#2196f3` (info blue) | `info.main` | Same in both modes |

---

## 🌙 Step 2: Remove SCSS Imports and Inline Styles

### 2.1 Find All SCSS Imports

Search for lines like:
```typescript
// TODO: Phase 2B - Replace with portal theme styling
// import './index.scss';
```

**Action**: Delete these commented lines after converting styles to `sx` prop.

### 2.2 Convert SCSS Styles to sx Prop

**Example SCSS File** (`HiringLayout/index.scss`):
```scss
.hiring-layout {
  background-color: #f5f5f5;
  padding: 20px;
  min-height: 100vh;

  .header {
    background-color: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 16px;
  }

  .content {
    margin-top: 20px;
  }
}
```

**Converted to MUI sx Prop**:
```typescript
<Box
  sx={{
    backgroundColor: 'background.default',
    padding: 2.5,
    minHeight: '100vh',
  }}
>
  <Box
    sx={{
      backgroundColor: 'background.paper',
      boxShadow: 1,
      padding: 2,
    }}
  >
    {/* Header content */}
  </Box>

  <Box sx={{ marginTop: 2.5 }}>
    {/* Content */}
  </Box>
</Box>
```

### 2.3 Convert Inline Styles

**BEFORE**:
```typescript
<div style={{ backgroundColor: '#fff', padding: '16px' }}>
```

**AFTER**:
```typescript
<Box sx={{ backgroundColor: 'background.paper', padding: 2 }}>
```

---

## 🎯 Step 3: Apply Portal Design Patterns

### 3.1 Card Styling

**Portal Pattern** (from existing portal pages):
```typescript
<Card
  sx={{
    backgroundColor: 'background.paper',
    boxShadow: 1,
    borderRadius: 2,
    '&:hover': {
      boxShadow: 3,
    },
  }}
>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### 3.2 Button Styling

**Portal Pattern**:
```typescript
<Button
  variant="contained"
  color="primary"
  sx={{
    textTransform: 'none',  // Portal uses normal case
    fontWeight: 600,
    borderRadius: 2,
  }}
>
  Action
</Button>
```

### 3.3 Typography Styling

**Portal Pattern**:
```typescript
<Typography
  variant="h5"
  sx={{
    fontWeight: 700,
    color: 'text.primary',
    mb: 2,
  }}
>
  Title
</Typography>

<Typography
  variant="body2"
  sx={{
    color: 'text.secondary',
  }}
>
  Description
</Typography>
```

### 3.4 Form Input Styling

**Portal Pattern**:
```typescript
<TextField
  fullWidth
  variant="outlined"
  sx={{
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'background.paper',
      '&:hover': {
        borderColor: 'primary.main',
      },
      '&.Mui-focused': {
        borderColor: 'primary.main',
      },
    },
  }}
/>
```

---

## 🌓 Step 4: Dark Mode Considerations

### 4.1 Colors That Auto-Adjust

These theme properties automatically adjust for dark mode (no extra code needed):
- `background.paper`
- `background.default`
- `text.primary`
- `text.secondary`
- `divider`

### 4.2 Colors That Stay Consistent

These remain the same in both modes:
- `primary.main`
- `secondary.main`
- `error.main`
- `warning.main`
- `success.main`
- `info.main`

### 4.3 Conditional Dark Mode Styling (If Needed)

**Only use when absolutely necessary**:
```typescript
import { useTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        backgroundColor: isDarkMode
          ? 'rgba(255, 255, 255, 0.05)'  // Dark mode only
          : 'rgba(0, 0, 0, 0.02)',       // Light mode only
      }}
    >
      Content
    </Box>
  );
}
```

### 4.4 Images and Icons

**For icons that need color adjustment**:
```typescript
<Icon
  sx={{
    color: 'text.primary',  // Auto-adjusts
  }}
/>
```

**For images with transparent backgrounds** (no action needed)
**For images with white/black backgrounds** (may need dark mode variants):
```typescript
<img
  src={isDarkMode ? darkLogo : lightLogo}
  alt="Logo"
/>
```

---

## 📦 Step 5: Component-Specific Transformations

### 5.1 HiringLayout Component

**File**: `frontend/src/components/hiring/HiringLayout/index.tsx`

**Current** (with SCSS):
```typescript
import './index.scss';

export default function HiringLayout({ children }) {
  return (
    <div className="hiring-layout">
      <div className="header">Header</div>
      <div className="content">{children}</div>
    </div>
  );
}
```

**Transform to**:
```typescript
import { Box } from '@mui/material';

export default function HiringLayout({ children }) {
  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        minHeight: '100vh',
        padding: 3,
      }}
    >
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
          padding: 2,
          mb: 3,
        }}
      >
        Header
      </Box>

      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
          padding: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
```

### 5.2 HiringHeader Component

**File**: `frontend/src/components/hiring/HiringHeader/Header.tsx`

**Transform to use theme colors**:
```typescript
import { Box, Typography, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function Header({ title, actions }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 2,
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
        }}
      >
        {title}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1 }}>
        {actions}
      </Box>
    </Box>
  );
}
```

### 5.3 Job Request Card

**File**: `frontend/src/pages/hiring/JobRequest/JobCard/*`

**Transform cards to use portal theme**:
```typescript
<Card
  sx={{
    backgroundColor: 'background.paper',
    borderRadius: 2,
    boxShadow: 1,
    mb: 2,
    transition: 'box-shadow 0.2s',
    '&:hover': {
      boxShadow: 3,
    },
  }}
>
  <CardHeader
    title={
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: 'text.primary',
        }}
      >
        {jobTitle}
      </Typography>
    }
    subheader={
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
        }}
      >
        {location}
      </Typography>
    }
  />

  <CardContent>
    {/* Content with theme colors */}
  </CardContent>
</Card>
```

### 5.4 Interview Calendar

**File**: `frontend/src/pages/hiring/Interview/InterviewCalendar.tsx`

**FullCalendar theme integration**:
```typescript
import FullCalendar from '@fullcalendar/react';
import { useTheme } from '@mui/material/styles';

function InterviewCalendar() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        // FullCalendar wrapper styling
        '& .fc': {
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        },
        '& .fc-button': {
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
          color: '#fff',
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        },
        '& .fc-daygrid-day': {
          backgroundColor: theme.palette.background.default,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        },
        '& .fc-daygrid-day-number': {
          color: theme.palette.text.primary,
        },
      }}
    >
      <FullCalendar
        // ... calendar config
      />
    </Box>
  );
}
```

### 5.5 Talent Pool Search Bar

**File**: `frontend/src/pages/hiring/TalentPool/AISearchBar.tsx`

**Transform search bar**:
```typescript
<TextField
  fullWidth
  placeholder="Search candidates..."
  variant="outlined"
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon sx={{ color: 'text.secondary' }} />
      </InputAdornment>
    ),
  }}
  sx={{
    backgroundColor: 'background.paper',
    borderRadius: 2,
    '& .MuiOutlinedInput-root': {
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
    '& .MuiInputBase-input': {
      color: 'text.primary',
      '&::placeholder': {
        color: 'text.secondary',
        opacity: 1,
      },
    },
  }}
/>
```

---

## 🔍 Step 6: Find and Replace Patterns

Use these search patterns to find styling that needs updating:

### 6.1 Search for Hardcoded Colors

**Search regex**: `#[0-9a-fA-F]{3,6}`

Common hardcoded colors to replace:
- `#ffffff` → `background.paper`
- `#000000` → `text.primary`
- `#f5f5f5` → `background.default`
- `#ddd` → `divider`

### 6.2 Search for Style Props

**Search**: `style={{`

Replace inline styles with `sx` prop.

### 6.3 Search for SCSS Imports

**Search**: `import.*\.scss`

Remove and convert to `sx` prop.

### 6.4 Search for className with Custom Classes

**Search**: `className="`

If using custom CSS classes, convert to `sx` prop.

---

## ✅ Step 7: Testing Dark Mode

### 7.1 Toggle Dark Mode

**Portal has a dark mode toggle** (check existing portal implementation):
- Usually in user settings or header
- Uses `ThemeProvider` with mode toggle

**To test**:
1. Run the portal: `npm run dev`
2. Toggle dark mode in the portal
3. Navigate to hiring pages
4. Verify all colors adjust properly

### 7.2 Dark Mode Checklist

For each hiring page, verify in dark mode:

- [ ] Background colors are dark (not white)
- [ ] Text is light colored (readable)
- [ ] Borders/dividers are visible but not harsh
- [ ] Buttons maintain brand colors
- [ ] Hover states work correctly
- [ ] No white flashes or jarring transitions
- [ ] Cards have subtle elevation/depth
- [ ] Forms are readable and usable
- [ ] Icons are visible

### 7.3 Common Dark Mode Issues

**Issue**: White background in dark mode
**Solution**: Use `background.paper` not hardcoded `#fff`

**Issue**: Black text invisible in dark mode
**Solution**: Use `text.primary` not hardcoded `#000`

**Issue**: Borders too dark/invisible
**Solution**: Use `divider` theme property

**Issue**: Custom shadow not visible
**Solution**: Use MUI's `boxShadow` prop (1-24 scale)

---

## 📊 Progress Tracking

### Job Request Module
- [ ] Container.tsx
- [ ] JobsContainer.tsx
- [ ] JobCard/JobCard.tsx (and all subcomponents)
- [ ] JobRequestFormContainer.tsx
- [ ] JobBreadcrumbs.tsx
- [ ] All other Job Request files

### Interview Module
- [ ] Interview.tsx
- [ ] InterviewBody.tsx
- [ ] InterviewCalendar.tsx (FullCalendar theming)
- [ ] InterviewHeader.tsx
- [ ] All other Interview files

### Talent Pool Module
- [ ] Container.tsx
- [ ] TalentPoolBody.tsx
- [ ] AISearchBar.tsx
- [ ] CandidateCard.tsx (and all subcomponents)
- [ ] FilterPane components
- [ ] All other Talent Pool files

### Shared Components
- [ ] HiringLayout/index.tsx
- [ ] HiringHeader/Header.tsx
- [ ] HiringHeader/FilterView.tsx
- [ ] HiringHeader/ExpandableSearch.tsx
- [ ] HiringHeader/SplitButton.tsx

---

## 🎯 Definition of Done (Phase 2B: Styling)

Styling transformation is complete when:

1. ✅ All hardcoded colors replaced with theme properties
2. ✅ All SCSS imports removed
3. ✅ All inline `style` props converted to `sx`
4. ✅ Dark mode works on all hiring pages
5. ✅ All components match portal design language
6. ✅ No visual inconsistencies between portal and hiring pages
7. ✅ FullCalendar (if used) themed correctly
8. ✅ Hover states work in both light and dark mode
9. ✅ No console warnings about deprecated styles
10. ✅ Designer/stakeholder approval (optional)

---

## 🚨 Common Styling Pitfalls

### Pitfall 1: Using sx with String Values for Colors
❌ **Wrong**:
```typescript
sx={{ color: '#000' }}
```

✅ **Correct**:
```typescript
sx={{ color: 'text.primary' }}
```

### Pitfall 2: Forgetting Dark Mode Testing
Always test in dark mode before marking complete.

### Pitfall 3: Mixing sx and className
Pick one approach and stick with it (prefer `sx`).

### Pitfall 4: Hardcoded Shadows
❌ **Wrong**:
```typescript
sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
```

✅ **Correct**:
```typescript
sx={{ boxShadow: 1 }}  // or 2, 3, etc.
```

### Pitfall 5: Not Using Theme Spacing
❌ **Wrong**:
```typescript
sx={{ padding: '16px' }}
```

✅ **Correct**:
```typescript
sx={{ padding: 2 }}  // 2 * 8px = 16px
```

---

## 📚 Reference

### Portal Theme Files
- Theme config: `frontend/src/theme/`
- Existing styled pages: `frontend/src/pages/` (for pattern reference)

### MUI Documentation
- Theme customization: https://mui.com/material-ui/customization/theming/
- Dark mode: https://mui.com/material-ui/customization/dark-mode/
- sx prop: https://mui.com/system/getting-started/the-sx-prop/

### Portal Design Tokens

```typescript
// Colors (from portal theme)
primary: {
  main: '#A16AE8',      // Purple
  light: '#B37FF0',
  dark: '#8956D4',
}
secondary: {
  main: '#8096FD',      // Blue
  light: '#99A8FE',
  dark: '#6679E8',
}

// Spacing (8px base unit)
theme.spacing(1)  // 8px
theme.spacing(2)  // 16px
theme.spacing(3)  // 24px

// Typography
fontFamily: 'Plus Jakarta Sans, sans-serif'
```

---

## 🎨 Before & After Example

### Before (Phase 2A - Basic Styling)
```typescript
<Box
  sx={{
    backgroundColor: '#f5f5f5',
    color: '#000',
    padding: '16px',
    border: '1px solid #ddd',
  }}
>
  <Typography sx={{ fontSize: '20px', fontWeight: 600 }}>
    Job Title
  </Typography>
  <Typography sx={{ color: '#666' }}>
    Location
  </Typography>
</Box>
```

### After (Phase 2B - Portal Themed + Dark Mode)
```typescript
<Box
  sx={{
    backgroundColor: 'background.paper',
    color: 'text.primary',
    padding: 2,
    border: 1,
    borderColor: 'divider',
    borderRadius: 2,
    boxShadow: 1,
  }}
>
  <Typography
    variant="h6"
    sx={{
      fontWeight: 600,
      color: 'text.primary',
      mb: 1,
    }}
  >
    Job Title
  </Typography>
  <Typography
    variant="body2"
    sx={{
      color: 'text.secondary',
    }}
  >
    Location
  </Typography>
</Box>
```

**Result**: Same visual in light mode, but automatically adjusts for dark mode! 🌙

---

## 🚀 Ready to Transform?

You have:
- ✅ Complete color mapping guide
- ✅ Component-specific examples
- ✅ Dark mode testing checklist
- ✅ Before/after examples
- ✅ Common pitfall warnings

**Order of work**:
1. **Start with**: Shared components (HiringLayout, HiringHeader) - affects all pages
2. **Then**: Job Request module (smallest)
3. **Then**: Interview module
4. **Finally**: Talent Pool module (largest)

Good luck! 🎨✨
