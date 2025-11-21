# Timesheets Page UI Generation Prompt

## For AI UI Generation Tools (v0, Lovable, etc.)

**Create a modern, professional timesheet management page for the Teamified EOR Portal that follows these specifications:**

### **Design System & Branding**
- **Color Palette**: Use the Teamified brand colors - primary purple (#A16AE8), brand blue (#8096FD), with neutral grays (#D9D9D9) and status colors (success: #10B981, warning: #F59E0B, error: #EF4444)
- **Typography**: Plus Jakarta Sans font family with clear hierarchy (h1: 32px, h2: 28px, h3: 24px, body: 16px)
- **Spacing**: Consistent 8px grid system with proper breathing room between elements

### **Layout Structure**
- **Sidebar Navigation**: Fixed left sidebar (280px width) with navigation menu including Dashboard, Profile, Invitations, CV Management, Timesheets (active), Leave, Documents
- **Main Content Area**: Clean, card-based layout with proper white space
- **Responsive Design**: Mobile-first approach with collapsible sidebar for mobile devices

### **Page Header Section**
- **Hero Section**: Large title with descriptive subtitle
- **Title**: "Timesheets" (h1, 32px, brand purple)
- **Description**: "Track your work hours and submit weekly timesheets for accurate payroll processing. Keep detailed records of your work activities and time allocation." (body-large, secondary text)
- **Visual Hierarchy**: Clear separation between header and content areas

### **Timesheet Content Section**
- **Section Header**: "Weekly Timesheet" (h2, 28px) with descriptive subtitle
- **Content Layout**: Clean, organized layout with proper spacing between elements

### **Weekly Timesheet Grid**
- **Grid Layout**: 7-column grid for days of the week (responsive: stack vertically on mobile)
- **Day Columns**: Monday through Sunday with clear day labels
- **Column Headers**: Day abbreviation (Mon, Tue, Wed, etc.) and date
- **Input Fields**: Hour inputs and notes textareas for each day

### **Timesheet Day Components**
- **Day Header**: 
  - Day abbreviation (e.g., "Mon")
  - Date (e.g., "Aug 25")
- **Hours Input**: 
  - Number input field (0-24 hours, step 0.5)
  - Placeholder: "0"
  - Validation: Minimum 0, maximum 24 hours
- **Notes Field**: 
  - Textarea for work activity notes
  - Placeholder: "Work activities..."
  - Character limit: 500 characters
  - Optional field for detailed work descriptions

### **Timesheet Summary Section**
- **Total Hours Display**: Large, prominent display of weekly total hours
- **Summary Information**: 
  - Weekly total hours
  - Average daily hours
  - Days worked
  - Validation status
- **Visual Styling**: Highlighted summary box with brand colors

### **Action Buttons Section**
- **Save Draft Button**: Secondary button with Save icon and "Save Draft" text
- **Submit Button**: Primary button with Send icon and "Submit Timesheet" text
- **Button States**: Loading states, disabled states, and hover effects
- **Button Layout**: Horizontal layout with proper spacing

### **Form Validation & Feedback**
- **Real-time Validation**: Immediate feedback on hour inputs and notes
- **Error Messages**: Clear validation messages for invalid inputs
- **Success Feedback**: Confirmation messages for successful operations
- **Warning States**: Visual warnings for unusual hour patterns
- **Validation Rules**:
  - Hours must be between 0-24
  - Weekly total cannot exceed 84 hours
  - At least one day must have hours entered

### **Visual Design Elements**
- **Grid Styling**: Clean, organized grid with subtle borders
- **Input Styling**: Modern form inputs with proper focus states
- **Color Coding**: Brand colors for highlights and status indicators
- **Hover Effects**: Smooth transitions and visual feedback on interaction
- **Borders**: Light gray borders (#D9D9D9) for grid separation

### **Interactive Elements**
- **Hour Inputs**: Responsive number inputs with validation
- **Notes Fields**: Expandable textareas for detailed work descriptions
- **Action Buttons**: Interactive buttons with loading and success states
- **Form Validation**: Real-time validation with visual feedback
- **Auto-save**: Optional auto-save functionality for better UX

### **User Experience Features**
- **Intuitive Input**: Easy-to-use hour and notes inputs
- **Visual Feedback**: Clear indication of form state and validation
- **Progress Tracking**: Visual progress indicators for form completion
- **Error Prevention**: Clear validation rules and helpful error messages
- **Success Confirmation**: Clear feedback for successful submissions

### **Mobile Considerations**
- **Touch Targets**: Minimum 44px touch targets for mobile devices
- **Mobile Menu**: Collapsible sidebar with hamburger menu
- **Grid Layout**: Stacked layout on mobile with proper spacing
- **Input Optimization**: Mobile-optimized number inputs and textareas
- **Touch Interactions**: Optimized for touch input and mobile gestures

### **Status Management**
- **Timesheet Status**: 
  - Draft: Incomplete, editable
  - Submitted: Pending approval
  - Approved: Finalized, read-only
  - Rejected: Returned for revision
- **Status Indicators**: Color-coded status badges with clear labels
- **Status Transitions**: Clear workflow for status changes

### **Technical Requirements**
- **Component Structure**: Modular React components (TimesheetsPage, TimesheetGrid, TimesheetDay, Layout)
- **Form Management**: Proper form state management and validation
- **Data Persistence**: Local storage for draft timesheets
- **API Integration**: Backend integration for timesheet operations
- **Performance**: Efficient rendering and minimal re-renders

### **Accessibility Features**
- **Semantic HTML**: Proper table structure and semantic elements
- **ARIA Labels**: Descriptive labels for screen readers
- **Keyboard Navigation**: Full keyboard accessibility for all inputs
- **Color Contrast**: WCAG AA compliant color combinations
- **Focus Management**: Clear focus indicators and logical tab order
- **Form Validation**: Accessible error messages and validation feedback

---

**Create a design that embodies the Teamified brand values of bold simplicity, intuitive navigation, and accessibility-driven design while providing a comprehensive and user-friendly timesheet management experience.**

## Usage Notes

This prompt is designed for AI UI generation tools like:
- **v0.dev** - Vercel's AI-powered UI generator
- **Lovable** - AI-powered design tool
- **Other AI UI generators** that accept detailed design specifications

## Current Implementation Status

The timesheets page currently has:
- ✅ Basic React components structure
- ✅ Weekly timesheet grid layout
- ✅ Hour and notes input fields
- ✅ Basic validation and form handling
- ✅ Basic styling using Teamified design system
- 🔄 Could benefit from enhanced visual hierarchy
- 🔄 Form validation UX could be improved
- 🔄 Mobile responsiveness could be enhanced

## Design System Reference

The prompt follows the established Teamified design system documented in:
- `docs/style-guide/archive/example.html` - Legacy design system showcase (archived)
- `frontend/src/assets/teamified-design-system.css` - CSS variables and components
