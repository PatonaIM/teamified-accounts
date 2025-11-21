# Dashboard Page UI Generation Prompt

## For AI UI Generation Tools (v0, Lovable, etc.)

**Create a modern, professional dashboard page for the Teamified EOR Portal that follows these specifications:**

### **Design System & Branding**
- **Color Palette**: Use the Teamified brand colors - primary purple (#A16AE8), brand blue (#8096FD), with neutral grays (#D9D9D9) and status colors (success: #10B981, warning: #F59E0B, error: #EF4444)
- **Typography**: Plus Jakarta Sans font family with clear hierarchy (h1: 32px, h2: 28px, h3: 24px, body: 16px)
- **Spacing**: Consistent 8px grid system with proper breathing room between elements

### **Layout Structure**
- **Sidebar Navigation**: Fixed left sidebar (280px width) with navigation menu including Dashboard (active), Profile, Invitations, CV Management, Timesheets, Leave, Documents
- **Main Content Area**: Clean, card-based layout with proper white space
- **Responsive Design**: Mobile-first approach with collapsible sidebar for mobile devices

### **Page Header Section**
- **Hero Section**: Large welcome message with descriptive subtitle
- **Title**: "Welcome to Your Team Member Portal" (h1, 32px, brand purple)
- **Description**: "Manage your employment journey with our comprehensive EOR platform. Access all the tools you need to stay connected and productive." (body-large, secondary text)
- **Visual Hierarchy**: Clear separation between header and content areas

### **Quick Actions Grid**
- **Grid Layout**: 3-column grid layout for action cards (responsive: 2 columns on tablet, 1 column on mobile)
- **Card Design**: Clean, modern cards with icons, titles, and descriptions
- **Action Categories**: 
  - **Platform Actions** (purple theme): Complete Profile, Submit Timesheet, Request Leave
  - **Service Actions** (blue theme): Upload CV, View Documents, Get Help

### **Action Card Components**
- **Icon Container**: Circular background with brand colors (purple for platform, blue for services)
- **Card Title**: Clear, action-oriented titles (h3, 24px)
- **Description**: Helpful descriptions explaining each action (body-medium)
- **Hover Effects**: Subtle hover states with smooth transitions
- **Navigation**: Each card links to the respective page

### **Card Content Structure**
1. **Complete Profile Card**:
   - Icon: User icon
   - Title: "Complete Profile"
   - Description: "Update your personal information and employment details"
   - Link: /profile

2. **Submit Timesheet Card**:
   - Icon: Clock icon
   - Title: "Submit Timesheet"
   - Description: "Log your working hours for accurate payroll processing"
   - Link: /timesheets

3. **Request Leave Card**:
   - Icon: Calendar icon
   - Title: "Request Leave"
   - Description: "Submit vacation, sick leave, or other time-off requests"
   - Link: /leave

4. **Upload CV Card**:
   - Icon: Upload icon
   - Title: "Upload CV"
   - Description: "Keep your resume current for internal opportunities"
   - Link: /cv

5. **View Documents Card**:
   - Icon: FileText icon
   - Title: "View Documents"
   - Description: "Access contracts, policies, and important documents"
   - Link: /documents

6. **Get Help Card**:
   - Icon: HelpCircle icon
   - Title: "Get Help"
   - Description: "Contact support or browse our knowledge base"
   - Link: /help

### **Visual Design Elements**
- **Card Shadows**: Subtle drop shadows for depth and elevation
- **Icon Styling**: Consistent icon sizes (24px) with proper color coding
- **Color Coding**: Purple theme for platform actions, blue theme for service actions
- **Hover States**: Smooth transitions and visual feedback on interaction
- **Borders**: Light gray borders (#D9D9D9) for subtle separation

### **Interactive Elements**
- **Hover Effects**: Subtle background color changes and shadow enhancements
- **Focus States**: Clear focus indicators for keyboard navigation
- **Click Feedback**: Visual feedback when cards are clicked
- **Smooth Transitions**: CSS transitions for all interactive elements

### **User Experience Features**
- **Clear Navigation**: Intuitive card-based navigation to all major sections
- **Visual Hierarchy**: Clear distinction between different types of actions
- **Accessibility**: Proper ARIA labels and keyboard navigation support
- **Responsive Behavior**: Cards stack appropriately on different screen sizes

### **Mobile Considerations**
- **Touch Targets**: Minimum 44px touch targets for mobile devices
- **Mobile Menu**: Collapsible sidebar with hamburger menu
- **Card Layout**: Single column layout on mobile with proper spacing
- **Touch Interactions**: Optimized for touch input and mobile gestures

### **Technical Requirements**
- **Component Structure**: Modular React components (Dashboard, DashboardCard, Layout)
- **Routing**: Proper React Router integration for navigation
- **State Management**: Clean component state and props management
- **Performance**: Efficient rendering and minimal re-renders

### **Accessibility Features**
- **Semantic HTML**: Proper heading hierarchy and semantic structure
- **ARIA Labels**: Descriptive labels for screen readers
- **Keyboard Navigation**: Full keyboard accessibility for all interactive elements
- **Color Contrast**: WCAG AA compliant color combinations
- **Focus Management**: Clear focus indicators and logical tab order

---

**Create a design that embodies the Teamified brand values of bold simplicity, intuitive navigation, and accessibility-driven design while providing a welcoming and efficient dashboard experience.**

## Usage Notes

This prompt is designed for AI UI generation tools like:
- **v0.dev** - Vercel's AI-powered UI generator
- **Lovable** - AI-powered design tool
- **Other AI UI generators** that accept detailed design specifications

## Current Implementation Status

The dashboard page currently has:
- ✅ Basic React components structure
- ✅ Card-based layout with action items
- ✅ Icon integration using Lucide icons
- ✅ Basic styling using Teamified design system
- 🔄 Could benefit from enhanced visual hierarchy
- 🔄 Card interactions and hover states could be improved
- 🔄 Mobile responsiveness could be enhanced

## Design System Reference

The prompt follows the established Teamified design system documented in:
- `docs/style-guide/archive/example.html` - Legacy design system showcase (archived)
- `frontend/src/assets/teamified-design-system.css` - CSS variables and components
