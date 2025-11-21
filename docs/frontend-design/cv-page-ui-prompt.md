# CV Management Page UI Generation Prompt

## For AI UI Generation Tools (v0, Lovable, etc.)

**Create a modern, professional CV management page for the Teamified EOR Portal that follows these specifications:**

### **Design System & Branding**
- **Color Palette**: Use the Teamified brand colors - primary purple (#A16AE8), brand blue (#8096FD), with neutral grays (#D9D9D9) and status colors (success: #10B981, warning: #F59E0B, error: #EF4444)
- **Typography**: Plus Jakarta Sans font family with clear hierarchy (h1: 32px, h2: 28px, h3: 24px, body: 16px)
- **Spacing**: Consistent 8px grid system with proper breathing room between elements

### **Layout Structure**
- **Sidebar Navigation**: Fixed left sidebar (280px width) with navigation menu including Dashboard, Profile, Invitations, CV Management (active), Timesheets, Leave, Documents
- **Main Content Area**: Clean, card-based layout with proper white space
- **Responsive Design**: Mobile-first approach with collapsible sidebar for mobile devices

### **Page Header Section**
- **Hero Section**: Large title with descriptive subtitle
- **Title**: "CV Management" (h1, 32px, brand purple)
- **Description**: "Keep your resume current and manage multiple versions for different opportunities. Upload, organize, and maintain your professional CVs." (body-large, secondary text)
- **Action Button**: Prominent "Upload New CV" button with Plus icon, positioned top-right
- **Visual Hierarchy**: Clear separation between header and content areas

### **CV Upload Form (When Active)**
- **Form Layout**: Clean, centered form with proper spacing
- **Form Fields**:
  - CV Name input (text, required, placeholder: "Enter CV name")
  - Description textarea (optional, 3-4 rows, placeholder: "Brief description of this CV version")
- **Form Actions**: Cancel button (secondary) and Upload CV button (primary)
- **File Upload**: Drag-and-drop file upload area with file type validation
- **Form Styling**: Modern form inputs with proper labels and validation states

### **CV List Section**
- **Section Header**: "Your CVs" (h2, 28px) with descriptive subtitle
- **List Layout**: Card-based layout for CV items (responsive grid)
- **Card Design**: Clean, modern cards with CV information and actions

### **CV Card Components**
- **Card Header**: CV name (h3, 24px) and version number
- **Card Content**:
  - **Version Info**: Version number with status indicator
  - **Upload Date**: Formatted date (e.g., "Aug 15, 2025")
  - **File Size**: Human-readable file size (e.g., "1.8 MB")
  - **Status Badge**: Color-coded status indicators
    - Active: Green badge (#10B981)
    - Archived: Gray badge (#6B7280)
    - Draft: Yellow badge (#F59E0B)
  - **Description**: Optional CV description text
- **Card Actions**: 
  - Download button (primary, with Download icon)
  - Delete button (danger, with Trash2 icon)
  - Archive/Activate toggle (contextual)

### **Status Badge System**
- **Active Status**: Green background with white text, "Active" label
- **Archived Status**: Gray background with white text, "Archived" label
- **Draft Status**: Yellow background with dark text, "Draft" label
- **Badge Styling**: Rounded corners, proper padding, and consistent sizing

### **Interactive Elements**
- **Upload Button**: Primary button with Plus icon and hover effects
- **Action Buttons**: Download, Delete, and Archive buttons with proper styling
- **Hover Effects**: Subtle hover states for cards and buttons
- **Loading States**: Spinners and disabled states during operations
- **Confirmation Dialogs**: Delete confirmation with clear messaging

### **File Management Features**
- **File Validation**: Support for common document formats (PDF, DOC, DOCX)
- **File Size Limits**: Clear indication of file size restrictions
- **Version Control**: Automatic version numbering for new uploads
- **Duplicate Prevention**: Warning for duplicate CV names
- **Bulk Operations**: Select multiple CVs for bulk actions

### **Visual Design Elements**
- **Card Shadows**: Subtle drop shadows for depth and elevation
- **Icon Styling**: Consistent icon sizes (24px) with proper color coding
- **Color Coding**: Status-based color coding for badges and indicators
- **Hover States**: Smooth transitions and visual feedback on interaction
- **Borders**: Light gray borders (#D9D9D9) for subtle separation

### **User Experience Features**
- **Drag & Drop**: Intuitive file upload with visual feedback
- **Progress Indicators**: Upload progress bars and status updates
- **Success Feedback**: Toast notifications for successful operations
- **Error Handling**: Clear error messages with helpful suggestions
- **Empty State**: Friendly message when no CVs exist

### **Mobile Considerations**
- **Touch Targets**: Minimum 44px touch targets for mobile devices
- **Mobile Menu**: Collapsible sidebar with hamburger menu
- **Card Layout**: Single column layout on mobile with proper spacing
- **File Upload**: Mobile-optimized file picker and upload flow
- **Touch Interactions**: Optimized for touch input and mobile gestures

### **Technical Requirements**
- **Component Structure**: Modular React components (CVPage, CVCard, CVUploadForm, Layout)
- **File Handling**: Proper file upload, validation, and management
- **State Management**: CV list state, upload form state, and loading states
- **API Integration**: Backend integration for CV operations
- **Performance**: Efficient rendering for large CV lists

### **Accessibility Features**
- **Semantic HTML**: Proper structure and semantic elements
- **ARIA Labels**: Descriptive labels for screen readers
- **Keyboard Navigation**: Full keyboard accessibility for all elements
- **Color Contrast**: WCAG AA compliant color combinations
- **Focus Management**: Clear focus indicators and logical tab order
- **File Upload**: Accessible file upload with proper labeling

---

**Create a design that embodies the Teamified brand values of bold simplicity, intuitive navigation, and accessibility-driven design while providing a comprehensive and user-friendly CV management experience.**

## Usage Notes

This prompt is designed for AI UI generation tools like:
- **v0.dev** - Vercel's AI-powered UI generator
- **Lovable** - AI-powered design tool
- **Other AI UI generators** that accept detailed design specifications

## Current Implementation Status

The CV management page currently has:
- ✅ Basic React components structure
- ✅ CV list with sample data
- ✅ Upload form functionality
- ✅ Status badge system
- ✅ Basic styling using Teamified design system
- 🔄 Could benefit from enhanced visual hierarchy
- 🔄 File upload UX could be improved
- 🔄 Mobile responsiveness could be enhanced

## Design System Reference

The prompt follows the established Teamified design system documented in:
- `docs/style-guide/archive/example.html` - Legacy design system showcase (archived)
- `frontend/src/assets/teamified-design-system.css` - CSS variables and components
