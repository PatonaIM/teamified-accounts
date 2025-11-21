# Documents Page UI Generation Prompt

## For AI UI Generation Tools (v0, Lovable, etc.)

**Create a modern, professional document management page for the Teamified EOR Portal that follows these specifications:**

### **Design System & Branding**
- **Color Palette**: Use the Teamified brand colors - primary purple (#A16AE8), brand blue (#8096FD), with neutral grays (#D9D9D9) and status colors (success: #10B981, warning: #F59E0B, error: #EF4444)
- **Typography**: Plus Jakarta Sans font family with clear hierarchy (h1: 32px, h2: 28px, h3: 24px, body: 16px)
- **Spacing**: Consistent 8px grid system with proper breathing room between elements

### **Layout Structure**
- **Sidebar Navigation**: Fixed left sidebar (280px width) with navigation menu including Dashboard, Profile, Invitations, CV Management, Timesheets, Leave, Documents (active)
- **Main Content Area**: Clean, card-based layout with proper white space
- **Responsive Design**: Mobile-first approach with collapsible sidebar for mobile devices

### **Page Header Section**
- **Hero Section**: Large title with descriptive subtitle
- **Title**: "Document Center" (h1, 32px, brand purple)
- **Description**: "Access and manage all your employment documents, including contracts, policies, payslips, and forms. Keep your important documents organized and easily accessible." (body-large, secondary text)
- **Action Button**: Prominent "Upload Document" button with Upload icon, positioned top-right
- **Visual Hierarchy**: Clear separation between header and content areas

### **Document Upload Form (When Active)**
- **Form Layout**: Clean, organized form with proper spacing
- **Form Fields**:
  - Document Name input (text, required, placeholder: "Enter document name")
  - Document Type select dropdown (required)
    - Options: Payslip, Contract, Policy, Form, Other
  - Category select dropdown (required)
    - Options: Human Resources, Finance, Legal, Training
  - Description textarea (optional, 3-4 rows, placeholder: "Brief description of this document")
- **File Upload**: Drag-and-drop file upload area with file type validation
- **Form Actions**: Cancel button (secondary) and Upload Document button (primary)
- **Form Styling**: Modern form inputs with proper labels and validation states

### **Document Management Controls**
- **Search & Filter Section**: 
  - Search box with placeholder "Search documents..."
  - Category filter dropdown (All Categories, HR, Finance, Legal, Training)
  - Document type filter (All Types, Payslip, Contract, Policy, Form, Other)
- **Sort Options**: Sort by name, date, type, or size
- **View Toggle**: Grid view and list view options

### **Document List Section**
- **Section Header**: "Your Documents" (h2, 28px) with descriptive subtitle
- **List Layout**: Card-based layout for document items (responsive grid)
- **Card Design**: Clean, modern cards with document information and actions

### **Document Card Components**
- **Card Header**: Document name (h3, 24px) and type indicator
- **Card Content**:
  - **Document Info**: Type, category, and status
  - **Upload Date**: Formatted date (e.g., "Aug 31, 2025")
  - **File Size**: Human-readable file size (e.g., "245 KB")
  - **Status Badge**: Color-coded status indicators
    - Active: Green badge (#10B981)
    - Archived: Gray badge (#6B7280)
    - Expired: Red badge (#EF4444)
  - **Description**: Optional document description text
- **Card Actions**: 
  - Download button (primary, with Download icon)
  - View button (secondary, with Eye icon)
  - Delete button (danger, with Trash2 icon)
  - Archive button (if active, secondary style)

### **Document Categories & Types**
- **Human Resources (HR)**:
  - Employment contracts
  - Employee handbooks
  - Policy documents
  - Training materials
- **Finance**:
  - Payslips
  - Tax documents
  - Expense reports
  - Financial policies
- **Legal**:
  - Legal agreements
  - Compliance documents
  - Terms and conditions
- **Training**:
  - Training materials
  - Certifications
  - Learning resources

### **Status Badge System**
- **Active Status**: Green background with white text, "Active" label
- **Archived Status**: Gray background with white text, "Archived" label
- **Expired Status**: Red background with white text, "Expired" label
- **Badge Styling**: Rounded corners, proper padding, and consistent sizing

### **Interactive Elements**
- **Upload Button**: Primary button with Upload icon and hover effects
- **Search & Filter**: Interactive search box and filter dropdowns
- **Action Buttons**: Download, View, Delete, and Archive buttons with proper styling
- **Hover Effects**: Subtle hover states for cards and buttons
- **Loading States**: Spinners and disabled states during operations

### **Visual Design Elements**
- **Card Shadows**: Subtle drop shadows for depth and elevation
- **Icon Styling**: Consistent icon sizes (24px) with proper color coding
- **Color Coding**: Status-based color coding for badges and type indicators
- **File Type Icons**: Visual indicators for different document types
- **Hover States**: Smooth transitions and visual feedback on interaction
- **Borders**: Light gray borders (#D9D9D9) for subtle separation

### **User Experience Features**
- **Drag & Drop**: Intuitive file upload with visual feedback
- **Search Functionality**: Real-time search across document names and descriptions
- **Filtering**: Easy filtering by category and document type
- **Bulk Operations**: Select multiple documents for bulk actions
- **Document Preview**: Quick preview of document contents
- **Download Management**: Efficient download handling for various file types

### **File Management Features**
- **File Validation**: Support for common document formats (PDF, DOC, DOCX, XLS, XLSX, TXT)
- **File Size Limits**: Clear indication of file size restrictions
- **Duplicate Prevention**: Warning for duplicate document names
- **Version Control**: Track document versions and updates
- **Access Control**: Role-based access to sensitive documents

### **Mobile Considerations**
- **Touch Targets**: Minimum 44px touch targets for mobile devices
- **Mobile Menu**: Collapsible sidebar with hamburger menu
- **Card Layout**: Single column layout on mobile with proper spacing
- **File Upload**: Mobile-optimized file picker and upload flow
- **Touch Interactions**: Optimized for touch input and mobile gestures

### **Technical Requirements**
- **Component Structure**: Modular React components (DocumentsPage, DocumentCard, DocumentUploadForm, DocumentList, Layout)
- **File Handling**: Proper file upload, validation, and management
- **Search & Filter**: Efficient search and filtering functionality
- **State Management**: Document list state, upload form state, and loading states
- **API Integration**: Backend integration for document operations
- **Performance**: Efficient rendering for large document lists

### **Accessibility Features**
- **Semantic HTML**: Proper structure and semantic elements
- **ARIA Labels**: Descriptive labels for screen readers
- **Keyboard Navigation**: Full keyboard accessibility for all elements
- **Color Contrast**: WCAG AA compliant color combinations
- **Focus Management**: Clear focus indicators and logical tab order
- **File Upload**: Accessible file upload with proper labeling

---

**Create a design that embodies the Teamified brand values of bold simplicity, intuitive navigation, and accessibility-driven design while providing a comprehensive and user-friendly document management experience.**

## Usage Notes

This prompt is designed for AI UI generation tools like:
- **v0.dev** - Vercel's AI-powered UI generator
- **Lovable** - AI-powered design tool
- **Other AI UI generators** that accept detailed design specifications

## Current Implementation Status

The documents page currently has:
- ✅ Basic React components structure
- ✅ Document list with sample data
- ✅ Upload form functionality
- ✅ Search and filter capabilities
- ✅ Status badge system
- ✅ Basic styling using Teamified design system
- 🔄 Could benefit from enhanced visual hierarchy
- 🔄 File upload UX could be improved
- 🔄 Mobile responsiveness could be enhanced

## Design System Reference

The prompt follows the established Teamified design system documented in:
- `docs/style-guide/archive/example.html` - Legacy design system showcase (archived)
- `frontend/src/assets/teamified-design-system.css` - CSS variables and components
