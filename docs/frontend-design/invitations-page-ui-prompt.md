# Invitations Page UI Generation Prompt

## For AI UI Generation Tools (v0, Lovable, etc.)

**Create a modern, professional invitations management page for the Teamified EOR Portal that follows these specifications:**

### **Design System & Branding**
- **Color Palette**: Use the Teamified brand colors - primary purple (#A16AE8), brand blue (#8096FD), with neutral grays (#D9D9D9) and status colors (success: #10B981, warning: #F59E0B, error: #EF4444)
- **Typography**: Plus Jakarta Sans font family with clear hierarchy (h1: 32px, h2: 28px, h3: 24px, body: 16px)
- **Spacing**: Consistent 8px grid system with proper breathing room between elements

### **Layout Structure**
- **Sidebar Navigation**: Fixed left sidebar (280px width) with navigation menu including Dashboard, Profile, Invitations (active), CV Management, Timesheets, Leave, Documents
- **Main Content Area**: Clean, card-based layout with proper white space
- **Responsive Design**: Mobile-first approach with collapsible sidebar for mobile devices

### **Page Header Section**
- **Title**: "Invitation Management" (h1, 32px, brand purple)
- **Description**: "Create and manage invitations for new EORs and Admins" (body-medium, secondary text)
- **Action Button**: Prominent "New Invitation" button with plus icon, positioned top-right
- **Visual Hierarchy**: Clear separation between header and content areas

### **Invitation Form (When Active)**
- **Form Layout**: Two-column grid for name fields, single column for email, two-column for country/role, single column for client
- **Form Styling**: Clean input fields with proper labels, validation states, and error messages
- **Required Fields**: First Name, Last Name, Email, Country, Role, Client
- **Country Options**: India, Sri Lanka, Philippines
- **Role Options**: EOR, Admin
- **Form Actions**: Cancel button (secondary) and Create Invitation button (primary)
- **Loading States**: Proper loading indicators and disabled states during submission

### **Invitation List Table**
- **Table Design**: Clean, modern table with subtle borders and proper spacing
- **Columns**: Name, Email, Country, Role, Client, Status, Created, Expires, Actions
- **Status Badges**: Color-coded status indicators (Pending: blue, Accepted: green, Expired: red)
- **Search & Filter**: 
  - Search box with placeholder "Search invitations..."
  - Status filter dropdown (All Status, Pending, Accepted, Expired)
- **Empty State**: Friendly "No invitations found" message with illustration
- **Pagination**: Clean pagination controls at bottom

### **Interactive Elements**
- **Buttons**: Primary (purple), Secondary (gray), Danger (red) with proper hover states
- **Hover Effects**: Subtle transitions and hover states for interactive elements
- **Loading States**: Spinners and disabled states for async operations
- **Action Buttons**: Resend (for pending), Delete (for all) with confirmation dialogs

### **User Experience Features**
- **Accessibility**: Proper ARIA labels, keyboard navigation, screen reader support
- **Error Handling**: Clear error messages with helpful suggestions
- **Success Feedback**: Toast notifications or inline success messages
- **Responsive Behavior**: Table scrolls horizontally on mobile, form stacks vertically

### **Visual Polish**
- **Shadows**: Subtle drop shadows for cards and elevated elements
- **Borders**: Light gray borders (#D9D9D9) for separation
- **Icons**: Consistent iconography using Lucide or similar icon set
- **Micro-interactions**: Smooth transitions for form states, button interactions

### **Technical Requirements**
- **Component Structure**: Modular React components (InvitationForm, InvitationList, InvitationTable)
- **State Management**: Proper loading states, error handling, and form validation
- **Data Flow**: Clean separation between presentation and business logic
- **Performance**: Efficient rendering for large invitation lists with pagination

### **Mobile Considerations**
- **Touch Targets**: Minimum 44px touch targets for mobile devices
- **Mobile Menu**: Collapsible sidebar with hamburger menu
- **Table Responsiveness**: Horizontal scroll or card-based layout on small screens
- **Form Layout**: Stacked single-column layout on mobile

---

**Create a design that embodies the Teamified brand values of bold simplicity, intuitive navigation, and accessibility-driven design while providing a professional and efficient invitation management experience.**

## Usage Notes

This prompt is designed for AI UI generation tools like:
- **v0.dev** - Vercel's AI-powered UI generator
- **Lovable** - AI-powered design tool
- **Other AI UI generators** that accept detailed design specifications

## Current Implementation Status

The invitations page currently has:
- ✅ Basic React components structure
- ✅ Form validation and error handling
- ✅ Table layout with search and filtering
- ✅ Basic styling using Teamified design system
- 🔄 Needs UI/UX improvements for better visual hierarchy
- 🔄 Could benefit from enhanced mobile responsiveness
- 🔄 Status badges and visual feedback could be improved

## Design System Reference

The prompt follows the established Teamified design system documented in:
- `docs/style-guide/archive/example.html` - Legacy design system showcase (archived)
- `frontend/src/assets/teamified-design-system.css` - CSS variables and components
