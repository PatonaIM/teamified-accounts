# Style Guide Archive

## Overview

This directory contains archived style guide documents that were part of the legacy design system. These documents have been moved to the `archive/` subdirectory as part of the design system consistency migration (Story 2.5).

## Archived Documents

The following documents have been archived:

- `accessibility.md` - Legacy accessibility guidelines
- `brownfield-architecture.md` - Legacy architecture documentation
- `colors.md` - Legacy color system documentation
- `components.md` - Legacy component library documentation
- `example.html` - Legacy design system showcase
- `icons.md` - Legacy icon system documentation
- `spacing.md` - Legacy spacing system documentation
- `typography.md` - Legacy typography system documentation

## Current Design System

The project now uses **Material-UI 3 Expressive Design** as the primary design system, with:

- **Complete Style Guide**: `material-ui-3-expressive-design.md` - Comprehensive design system documentation
- **Quick Reference**: `quick-reference.md` - Developer quick reference guide
- **Theme Configuration**: `frontend/src/theme/muiTheme.ts`
- **Layout Components**: `frontend/src/components/LayoutMUI.tsx` and `SidebarMUI.tsx`
- **Brand Colors**: Primary Purple (#A16AE8), Brand Blue (#8096FD)
- **Typography**: Plus Jakarta Sans font family
- **Spacing**: 8px base unit with generous spacing
- **Border Radius**: 16px+ for expressive design

## Migration Status

- ✅ **Completed**: Login, Profile, Dashboard, User Management, Employment Records, CV Management, Timesheets, Leave Management, Documents pages
- ✅ **Story 2.5**: Design System Consistency Migration - **COMPLETED**
- ✅ **All Pages**: Successfully migrated to Material-UI 3 Expressive Design

## Established Design Patterns

### **Page Layout Patterns**
- **Header Sections**: Rounded Paper containers with gradient backgrounds
- **Form Sections**: Always-visible forms with clean Paper containers
- **Content Sections**: Consistent spacing and typography hierarchy
- **Button Styling**: Gradient backgrounds for primary actions, outlined for secondary

### **Typography Hierarchy**
- **Page Headers**: `h3` with `fontWeight: 700`
- **Section Headers**: `h6` with `fontWeight: 600` and `mb: 2`
- **Descriptions**: `body2` with `color: 'text.secondary'` and `mb: 3`
- **Content Headers**: `h6` with `fontWeight: 600`
- **Body Text**: `body2` with appropriate color schemes

### **Form Patterns**
- **Always Visible**: Forms are immediately accessible without toggle buttons
- **Clean Containers**: Simple Paper containers with consistent borders
- **Reset Functionality**: Cancel buttons reset form fields to default values
- **Consistent Spacing**: Uniform padding and margins throughout

### **Button Patterns**
- **Primary Actions**: Gradient backgrounds with hover effects
- **Secondary Actions**: Outlined style with custom border colors
- **Text Links**: Clean text buttons with hover effects
- **Consistent Styling**: All buttons follow the same design language

## Archive Date

**Archived on**: January 4, 2025  
**Reason**: Design system consistency migration to Material-UI 3 Expressive Design  
**Story**: 2.5 - Design System Consistency Migration

## Notes

These archived documents are preserved for reference and historical context. They should not be used for new development work. All new UI components and pages should follow the Material-UI 3 Expressive Design system as defined in the current theme configuration.

## How to Reference These Guides When Building

### 📚 Quick Access Methods

#### **1. Bookmark the Quick Reference**
The `quick-reference.md` is your daily go-to guide:
```
docs/style-guide/quick-reference.md
```
- **Perfect for**: Copy-paste code snippets, color codes, spacing values
- **Use when**: Building components, checking syntax, getting quick examples

#### **2. Keep the Full Guide Open**
The `material-ui-3-expressive-design.md` is your comprehensive reference:
```
docs/style-guide/material-ui-3-expressive-design.md
```
- **Perfect for**: Understanding design principles, detailed specifications
- **Use when**: Planning layouts, understanding the design system philosophy

### 🛠️ Practical Workflow

#### **When Starting a New Page:**
1. **Copy the Quick Start Template** from `quick-reference.md`:
```typescript
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '../theme/muiTheme';
import LayoutMUI from '../components/LayoutMUI';

const MyPage = () => {
  return (
    <ThemeProvider theme={muiTheme}>
      <LayoutMUI>
        {/* Your content here */}
      </LayoutMUI>
    </ThemeProvider>
  );
};
```

#### **When Building Components:**
1. **Check the Component Specifications** section in the full guide
2. **Use the Quick Reference** for copy-paste examples
3. **Reference the Theme Config** directly: `frontend/src/theme/muiTheme.ts`

### 🎯 Common Reference Patterns

#### **For Colors:**
```typescript
// Quick Reference shows:
color="primary"     // Brand purple
color="secondary"   // Brand blue
color="success"     // Green
color="warning"     // Orange
color="error"       // Red
```

#### **For Typography:**
```typescript
// Quick Reference shows:
<Typography variant="h1">Main Title (56px)</Typography>
<Typography variant="h2">Section Title (44px)</Typography>
<Typography variant="body1">Regular text (16px)</Typography>
```

#### **For Spacing:**
```typescript
// Quick Reference shows:
sx={{ p: 3 }}  // 24px padding
sx={{ mb: 2 }} // 16px margin bottom
sx={{ mt: 4 }} // 32px margin top
```

### 🔧 IDE Integration Tips

#### **1. Keep Files Open in Split View:**
- Left panel: Your code
- Right panel: `quick-reference.md`

#### **2. Use IDE Bookmarks:**
- Bookmark the "Quick Start Template" section
- Bookmark the "Component Usage" section
- Bookmark the "Color Palette" section

#### **3. Copy-Paste Workflow:**
1. Find the component example in quick-reference
2. Copy the code snippet
3. Paste into your component
4. Modify as needed

### 📖 Reference Hierarchy

#### **Daily Development:**
1. **Start with**: `quick-reference.md` (90% of your needs)
2. **Fall back to**: `material-ui-3-expressive-design.md` (detailed specs)
3. **Check source**: `frontend/src/theme/muiTheme.ts` (actual implementation)

#### **When You Need More Detail:**
- **Layout questions** → Full guide "Layout System" section
- **Accessibility requirements** → Full guide "Accessibility Standards" section
- **Animation details** → Full guide "Animation & Transitions" section
- **Migration help** → Full guide "Migration from Legacy Design" section

### 🎨 Pro Tips

#### **1. Create Your Own Cheat Sheet:**
Copy the most-used patterns from quick-reference into a personal notes file.

#### **2. Use the Theme Directly:**
```typescript
// Instead of hardcoding colors:
sx={{ color: '#A16AE8' }}

// Use theme colors:
sx={{ color: 'primary.main' }}
```

#### **3. Reference Existing Pages:**
- Look at `ProfilePage.tsx` for form patterns
- Check `DashboardPageMUI.tsx` for layout patterns
- Review `EmploymentRecordsPage.tsx` for table patterns

#### **4. Keep the Migration Checklist Handy:**
When converting legacy pages, use the checklist from the full guide to ensure nothing is missed.

### 📱 Mobile-First Approach

The guides emphasize mobile-first design:
```typescript
// Always start with mobile, then add desktop:
sx={{
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  gap: 2
}}
```

### 🎨 Design System Consistency

Remember the core principle: **Always use the theme system** rather than hardcoded values. The guides show you exactly how to do this!

## How to Reference These Guides in Prompts

### 🎯 Prompt Reference Patterns

#### **1. For AI UI Generation Tools (v0, Lovable, etc.)**

##### **Basic Reference:**
```
Follow the Material-UI 3 Expressive Design system documented in:
- docs/style-guide/material-ui-3-expressive-design.md
- docs/style-guide/quick-reference.md
```

##### **Detailed Reference:**
```
Use the Teamified Material-UI 3 Expressive Design system with:
- Brand colors: Primary Purple (#A16AE8), Brand Blue (#8096FD)
- Typography: Plus Jakarta Sans with expressive sizing
- Spacing: 8px base unit system
- Border radius: 16px+ for modern appearance
- Layout: LayoutMUI wrapper with SidebarMUI navigation
- Theme: frontend/src/theme/muiTheme.ts

Reference: docs/style-guide/material-ui-3-expressive-design.md
```

#### **2. For Code Generation Prompts**

##### **Component-Specific:**
```
Create a [ComponentName] using the Material-UI 3 Expressive Design system:
- Follow component specifications from docs/style-guide/material-ui-3-expressive-design.md
- Use color palette and typography from docs/style-guide/quick-reference.md
- Implement accessibility standards (WCAG 2.1 AA)
- Use theme configuration from frontend/src/theme/muiTheme.ts
```

##### **Page-Specific:**
```
Build a [PageName] page following the Material-UI 3 Expressive Design system:
- Use LayoutMUI wrapper with SidebarMUI navigation
- Follow spacing system (8px base unit)
- Implement responsive design (mobile-first)
- Reference: docs/style-guide/material-ui-3-expressive-design.md
```

### 📝 Prompt Templates

#### **Template 1: Complete Page Generation**
```
Create a [PageName] page for the Teamified EOR Portal using Material-UI 3 Expressive Design:

**Design System Reference:**
- Complete guide: docs/style-guide/material-ui-3-expressive-design.md
- Quick reference: docs/style-guide/quick-reference.md
- Theme config: frontend/src/theme/muiTheme.ts

**Requirements:**
- Use LayoutMUI wrapper with SidebarMUI navigation
- Follow brand colors: Primary Purple (#A16AE8), Brand Blue (#8096FD)
- Implement Plus Jakarta Sans typography with expressive sizing
- Use 8px base unit spacing system
- Apply 16px+ border radius for modern appearance
- Ensure WCAG 2.1 AA accessibility compliance
- Mobile-first responsive design

**Layout Structure:**
- Fixed sidebar navigation (280px width)
- Main content area with proper padding
- Card-based layout with generous spacing
- Responsive breakpoints: xs: 0px, sm: 600px, md: 900px, lg: 1200px

**Component Usage:**
- Buttons: Use theme variants (contained, outlined, text)
- Forms: TextField with outlined variant and proper validation
- Cards: 20px border radius with hover effects
- Typography: Semantic heading hierarchy (h1-h6)
```

#### **Template 2: Component Generation**
```
Create a [ComponentName] component using Material-UI 3 Expressive Design:

**Reference:**
- Component specifications: docs/style-guide/material-ui-3-expressive-design.md
- Usage examples: docs/style-guide/quick-reference.md

**Design Requirements:**
- Brand colors: Primary Purple (#A16AE8), Brand Blue (#8096FD)
- Typography: Plus Jakarta Sans font family
- Spacing: 8px base unit system
- Border radius: 16px+ for components
- Hover effects: Smooth transitions with transform effects
- Accessibility: ARIA labels, keyboard navigation, focus management

**Technical Implementation:**
- Use ThemeProvider with muiTheme
- Follow component styling from theme configuration
- Implement responsive design patterns
- Include proper TypeScript types
```

#### **Template 3: Migration Prompt**
```
Migrate [LegacyComponent/Page] to Material-UI 3 Expressive Design:

**Reference:**
- Migration guide: docs/style-guide/material-ui-3-expressive-design.md
- Legacy components: docs/style-guide/archive/
- New system: docs/style-guide/quick-reference.md

**Migration Requirements:**
- Replace custom CSS with Material-UI components
- Use LayoutMUI instead of custom layout
- Apply theme colors instead of hardcoded values
- Implement proper spacing using theme.spacing()
- Add accessibility features (ARIA labels, keyboard support)
- Ensure responsive behavior across breakpoints
- Follow WCAG 2.1 AA compliance standards

**Before/After:**
- Before: Custom CSS components with hardcoded values
- After: Material-UI components with theme integration
```

### 🎨 Specific Reference Examples

#### **For v0.dev:**
```
Use the Teamified Material-UI 3 Expressive Design system:
- Reference: docs/style-guide/material-ui-3-expressive-design.md
- Colors: Primary Purple (#A16AE8), Brand Blue (#8096FD)
- Typography: Plus Jakarta Sans with expressive sizing
- Layout: LayoutMUI with SidebarMUI navigation
- Spacing: 8px base unit system
- Border radius: 16px+ for modern appearance
```

#### **For Lovable:**
```
Follow the Material-UI 3 Expressive Design system documented in:
- docs/style-guide/material-ui-3-expressive-design.md (complete guide)
- docs/style-guide/quick-reference.md (developer reference)

Key specifications:
- Brand colors: Primary Purple (#A16AE8), Brand Blue (#8096FD)
- Typography: Plus Jakarta Sans font family
- Spacing: 8px base unit with generous spacing
- Components: 16px+ border radius, smooth hover effects
- Layout: LayoutMUI wrapper with responsive sidebar
- Accessibility: WCAG 2.1 AA compliance
```

### ✅ Checklist for Prompts

#### **Always Include:**
- [ ] Reference to the style guide documents
- [ ] Brand color specifications
- [ ] Typography requirements
- [ ] Spacing system (8px base unit)
- [ ] Layout structure (LayoutMUI + SidebarMUI)
- [ ] Accessibility requirements
- [ ] Responsive design approach

#### **Optional Additions:**
- [ ] Specific component examples
- [ ] Animation requirements
- [ ] Form validation patterns
- [ ] Error handling approaches
- [ ] Loading states
- [ ] Success feedback

### 🎨 Quick Copy-Paste References

#### **Minimal Reference:**
```
Reference: docs/style-guide/material-ui-3-expressive-design.md
```

#### **Standard Reference:**
```
Follow Material-UI 3 Expressive Design system:
- Guide: docs/style-guide/material-ui-3-expressive-design.md
- Quick ref: docs/style-guide/quick-reference.md
- Colors: Primary Purple (#A16AE8), Brand Blue (#8096FD)
- Layout: LayoutMUI with SidebarMUI navigation
```

#### **Complete Reference:**
```
Use Teamified Material-UI 3 Expressive Design system:
- Complete guide: docs/style-guide/material-ui-3-expressive-design.md
- Developer reference: docs/style-guide/quick-reference.md
- Theme config: frontend/src/theme/muiTheme.ts
- Brand colors: Primary Purple (#A16AE8), Brand Blue (#8096FD)
- Typography: Plus Jakarta Sans with expressive sizing
- Spacing: 8px base unit system
- Border radius: 16px+ for modern appearance
- Layout: LayoutMUI wrapper with SidebarMUI navigation
- Accessibility: WCAG 2.1 AA compliance
- Responsive: Mobile-first design approach
```

### 💡 Pro Tips

1. **Start with the minimal reference** and add more detail as needed
2. **Always include the file paths** so the AI can reference the actual documents
3. **Specify the key design elements** (colors, typography, spacing) in every prompt
4. **Include accessibility requirements** to ensure compliance
5. **Reference the theme configuration** for technical implementation details

This approach ensures that AI tools have clear, specific guidance while referencing your comprehensive design system documentation! 🚀
