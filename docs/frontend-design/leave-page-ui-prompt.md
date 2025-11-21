# Leave Management Page UI Generation Prompt

## For AI UI Generation Tools (v0, Lovable, etc.)

**Create a modern, professional leave management page for the Teamified EOR Portal that follows these specifications:**

### **Design System & Branding**
- **Color Palette**: Use the Teamified brand colors - primary purple (#A16AE8), brand blue (#8096FD), with neutral grays (#D9D9D9) and status colors (success: #10B981, warning: #F59E0B, error: #EF4444)
- **Typography**: Plus Jakarta Sans font family with clear hierarchy (h1: 32px, h2: 28px, h3: 24px, body: 16px)
- **Spacing**: Consistent 8px grid system with proper breathing room between elements

### **Layout Structure**
- **Sidebar Navigation**: Fixed left sidebar (280px width) with navigation menu including Dashboard, Profile, Invitations, CV Management, Timesheets, Leave (active), Documents
- **Main Content Area**: Clean, card-based layout with proper white space
- **Responsive Design**: Mobile-first approach with collapsible sidebar for mobile devices

### **Page Header Section**
- **Hero Section**: Large title with descriptive subtitle
- **Title**: "Leave Management" (h1, 32px, brand purple)
- **Description**: "Request and manage your time off, including vacation, sick leave, and other leave types. Track your leave balances and view request history." (body-large, secondary text)
- **Action Button**: Prominent "New Leave Request" button with Plus icon, positioned top-right
- **Visual Hierarchy**: Clear separation between header and content areas

### **Leave Balance Overview Section**
- **Section Header**: "Leave Balances" (h2, 28px) with descriptive subtitle
- **Balance Cards**: Grid layout of leave type balance cards
- **Card Design**: Clean, modern cards with leave type information

### **Leave Balance Cards**
- **Annual Leave Card**:
  - Icon: Calendar icon with purple theme
  - Title: "Annual Leave"
  - Balance: "17 of 25 days remaining"
  - Visual: Progress bar showing used vs. remaining days
  - Color: Purple theme (#A16AE8)

- **Sick Leave Card**:
  - Icon: Medical icon with blue theme
  - Title: "Sick Leave"
  - Balance: "7 of 10 days remaining"
  - Visual: Progress bar showing used vs. remaining days
  - Color: Blue theme (#8096FD)

- **Personal Leave Card**:
  - Icon: User icon with green theme
  - Title: "Personal Leave"
  - Balance: "4 of 5 days remaining"
  - Visual: Progress bar showing used vs. remaining days
  - Color: Green theme (#10B981)

- **Other Leave Types**: Maternity, Paternity, Bereavement with similar card structure

### **New Leave Request Form (When Active)**
- **Form Layout**: Clean, organized form with proper spacing
- **Form Fields**:
  - Leave Type select dropdown (required)
    - Options: Annual, Sick, Personal, Maternity, Paternity, Bereavement
  - Start Date input (date picker, required)
  - End Date input (date picker, required)
  - Reason textarea (required, 3-4 rows, placeholder: "Please provide a reason for your leave request")
- **Form Actions**: Cancel button (secondary) and Submit Request button (primary)
- **Form Styling**: Modern form inputs with proper labels and validation states

### **Leave Request History Section**
- **Section Header**: "Leave Requests" (h2, 28px) with descriptive subtitle
- **List Layout**: Card-based layout for leave request items
- **Card Design**: Clean, modern cards with request information and actions

### **Leave Request Cards**
- **Card Header**: Leave type and status with color coding
- **Card Content**:
  - **Request Details**: Start date, end date, duration in days
  - **Reason**: Leave request reason text
  - **Status Badge**: Color-coded status indicators
    - Pending: Yellow badge (#F59E0B)
    - Approved: Green badge (#10B981)
    - Rejected: Red badge (#EF4444)
  - **Submission Date**: When the request was submitted
- **Card Actions**: 
  - View Details button (primary)
  - Cancel Request button (if pending, danger style)
  - Edit Request button (if draft, secondary style)

### **Status Badge System**
- **Pending Status**: Yellow background with dark text, "Pending" label
- **Approved Status**: Green background with white text, "Approved" label
- **Rejected Status**: Red background with white text, "Rejected" label
- **Badge Styling**: Rounded corners, proper padding, and consistent sizing

### **Interactive Elements**
- **New Request Button**: Primary button with Plus icon and hover effects
- **Form Interactions**: Smooth focus transitions and hover effects
- **Action Buttons**: View, Cancel, and Edit buttons with proper styling
- **Hover Effects**: Subtle hover states for cards and buttons
- **Loading States**: Spinners and disabled states during operations

### **Visual Design Elements**
- **Card Shadows**: Subtle drop shadows for depth and elevation
- **Icon Styling**: Consistent icon sizes (24px) with proper color coding
- **Color Coding**: Status-based color coding for badges and progress bars
- **Progress Bars**: Visual representation of leave balances with brand colors
- **Hover States**: Smooth transitions and visual feedback on interaction
- **Borders**: Light gray borders (#D9D9D9) for subtle separation

### **User Experience Features**
- **Intuitive Forms**: Easy-to-use date pickers and form inputs
- **Visual Feedback**: Clear indication of form state and validation
- **Balance Tracking**: Visual progress bars for leave balances
- **Request History**: Comprehensive view of all leave requests
- **Status Updates**: Real-time status updates and notifications

### **Form Validation & Feedback**
- **Real-time Validation**: Immediate feedback on form inputs
- **Error Messages**: Clear validation messages for invalid inputs
- **Success Feedback**: Confirmation messages for successful submissions
- **Date Validation**: Automatic calculation of leave duration
- **Balance Validation**: Warning if request exceeds available balance

### **Mobile Considerations**
- **Touch Targets**: Minimum 44px touch targets for mobile devices
- **Mobile Menu**: Collapsible sidebar with hamburger menu
- **Card Layout**: Single column layout on mobile with proper spacing
- **Form Layout**: Stacked form fields optimized for mobile input
- **Touch Interactions**: Optimized for touch input and mobile gestures

### **Technical Requirements**
- **Component Structure**: Modular React components (LeavePage, LeaveBalanceCard, LeaveRequestForm, LeaveRequestCard, Layout)
- **Form Management**: Proper form state management and validation
- **Date Handling**: Proper date calculations and validation
- **API Integration**: Backend integration for leave operations
- **Performance**: Efficient rendering for large request lists

### **Accessibility Features**
- **Semantic HTML**: Proper structure and semantic elements
- **ARIA Labels**: Descriptive labels for screen readers
- **Keyboard Navigation**: Full keyboard accessibility for all elements
- **Color Contrast**: WCAG AA compliant color combinations
- **Focus Management**: Clear focus indicators and logical tab order
- **Form Validation**: Accessible error messages and validation feedback

---

**Create a design that embodies the Teamified brand values of bold simplicity, intuitive navigation, and accessibility-driven design while providing a comprehensive and user-friendly leave management experience.**

## Usage Notes

This prompt is designed for AI UI generation tools like:
- **v0.dev** - Vercel's AI-powered UI generator
- **Lovable** - AI-powered design tool
- **Other AI UI generators** that accept detailed design specifications

## Current Implementation Status

The leave management page currently has:
- ✅ Basic React components structure
- ✅ Leave balance tracking system
- ✅ Leave request form functionality
- ✅ Request history with status badges
- ✅ Basic styling using Teamified design system
- 🔄 Could benefit from enhanced visual hierarchy
- 🔄 Form validation UX could be improved
- 🔄 Mobile responsiveness could be enhanced

## Design System Reference

The prompt follows the established Teamified design system documented in:
- `docs/style-guide/archive/example.html` - Legacy design system showcase (archived)
- `frontend/src/assets/teamified-design-system.css` - CSS variables and components
