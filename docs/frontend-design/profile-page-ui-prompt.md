# Profile Page UI Generation Prompt

## For AI UI Generation Tools (v0, Lovable, etc.)

**Create a modern, professional profile management page for the Teamified EOR Portal that follows these specifications:**

### **Design System & Branding**
- **Color Palette**: Use the Teamified brand colors - primary purple (#A16AE8), brand blue (#8096FD), with neutral grays (#D9D9D9) and status colors (success: #10B981, warning: #F59E0B, error: #EF4444)
- **Typography**: Plus Jakarta Sans font family with clear hierarchy (h1: 32px, h2: 28px, h3: 24px, body: 16px)
- **Spacing**: Consistent 8px grid system with proper breathing room between elements

### **Layout Structure**
- **Sidebar Navigation**: Fixed left sidebar (280px width) with navigation menu including Dashboard, Profile (active), Invitations, CV Management, Timesheets, Leave, Documents
- **Main Content Area**: Clean, card-based layout with proper white space
- **Responsive Design**: Mobile-first approach with collapsible sidebar for mobile devices

### **Page Header Section**
- **Hero Section**: Large title with descriptive subtitle
- **Title**: "Profile Management" (h1, 32px, brand purple)
- **Description**: "Complete your professional profile and manage your employment information. Keep your details up to date for seamless service delivery." (body-large, secondary text)
- **Visual Hierarchy**: Clear separation between header and content areas

### **Profile Content Grid**
- **Grid Layout**: 2-column grid layout for profile cards (responsive: 1 column on mobile)
- **Card Design**: Clean, modern cards with icons, titles, and form content
- **Card Spacing**: Proper spacing between cards for visual breathing room

### **Personal Information Card**
- **Card Header**: 
  - Icon: User icon (24px) with purple background (#A16AE8 with 15% opacity)
  - Title: "Personal Information" (h3, 24px)
- **Form Fields**:
  - First Name input (text, required)
  - Last Name input (text, required)
  - Email Address input (email, required)
  - Phone Number input (tel, optional)
- **Action Button**: "Update Profile" button with Save icon (primary button style)
- **Form Layout**: Stacked form fields with proper spacing

### **Professional Details Card**
- **Card Header**:
  - Icon: Briefcase icon (24px) with blue background (#8096FD with 15% opacity)
  - Title: "Professional Details" (h3, 24px)
- **Form Fields**:
  - Job Title input (text, optional)
  - Years of Experience select dropdown
    - Options: 0-2 years, 3-5 years, 6-10 years, 10+ years
  - Key Skills textarea (4 rows, optional)
- **Action Button**: "Save Details" button with Save icon (primary button style)
- **Form Layout**: Stacked form fields with proper spacing

### **Form Styling & Interactions**
- **Input Fields**: Clean, modern inputs with proper labels and placeholders
- **Form Labels**: Clear, descriptive labels for all form fields
- **Input States**: Focus, hover, and error states with smooth transitions
- **Validation**: Real-time validation with helpful error messages
- **Button States**: Loading states, hover effects, and disabled states

### **Visual Design Elements**
- **Card Shadows**: Subtle drop shadows for depth and elevation
- **Icon Styling**: Consistent icon sizes (24px) with proper color coding
- **Color Coding**: Purple theme for personal information, blue theme for professional details
- **Hover States**: Smooth transitions and visual feedback on interaction
- **Borders**: Light gray borders (#D9D9D9) for subtle separation

### **Interactive Elements**
- **Form Interactions**: Smooth focus transitions and hover effects
- **Button Feedback**: Visual feedback when buttons are clicked
- **Input Validation**: Real-time validation with clear error messages
- **Save Feedback**: Success messages and loading states during form submission

### **User Experience Features**
- **Form Persistence**: Remember form state and user input
- **Auto-save**: Optional auto-save functionality for better UX
- **Validation Feedback**: Clear, helpful validation messages
- **Success States**: Confirmation messages after successful updates
- **Error Handling**: Graceful error handling with user-friendly messages

### **Mobile Considerations**
- **Touch Targets**: Minimum 44px touch targets for mobile devices
- **Mobile Menu**: Collapsible sidebar with hamburger menu
- **Card Layout**: Single column layout on mobile with proper spacing
- **Form Layout**: Optimized for mobile input and touch interactions
- **Responsive Typography**: Scalable text sizes for different screen sizes

### **Footer Section**
- **Privacy Notice**: "Your profile information is secure and only used for employment purposes. Learn more about data privacy" (body-medium)
- **Privacy Link**: Clickable link to privacy information
- **Visual Separation**: Subtle border or background separation from main content

### **Technical Requirements**
- **Component Structure**: Modular React components (ProfilePage, ProfileCard, Layout)
- **Form Management**: Proper form state management and validation
- **API Integration**: Backend integration for profile updates
- **State Persistence**: Form data persistence and recovery
- **Performance**: Efficient form rendering and minimal re-renders

### **Accessibility Features**
- **Semantic HTML**: Proper form structure and semantic elements
- **ARIA Labels**: Descriptive labels for screen readers
- **Keyboard Navigation**: Full keyboard accessibility for all form elements
- **Color Contrast**: WCAG AA compliant color combinations
- **Focus Management**: Clear focus indicators and logical tab order
- **Error Announcements**: Screen reader announcements for validation errors

---

**Create a design that embodies the Teamified brand values of bold simplicity, intuitive navigation, and accessibility-driven design while providing a comprehensive and user-friendly profile management experience.**

## Usage Notes

This prompt is designed for AI UI generation tools like:
- **v0.dev** - Vercel's AI-powered UI generator
- **Lovable** - AI-powered design tool
- **Other AI UI generators** that accept detailed design specifications

## Current Implementation Status

The profile page currently has:
- ✅ Basic React components structure
- ✅ Card-based layout with form sections
- ✅ Icon integration using Lucide icons
- ✅ Basic styling using Teamified design system
- ✅ Form fields for personal and professional information
- 🔄 Could benefit from enhanced form validation
- 🔄 Visual feedback and loading states could be improved
- 🔄 Mobile responsiveness could be enhanced

## Design System Reference

The prompt follows the established Teamified design system documented in:
- `docs/style-guide/material-ui-3-expressive-design.md` - Complete Material-UI 3 design system guide
- `docs/style-guide/quick-reference.md` - Developer quick reference guide
- `frontend/src/theme/muiTheme.ts` - Current Material-UI 3 expressive theme configuration
