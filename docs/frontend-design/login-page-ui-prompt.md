# Login Page UI Generation Prompt

## For AI UI Generation Tools (v0, Lovable, etc.)

**Create a modern, professional login page for the Teamified EOR Portal that follows these specifications:**

### **Design System & Branding**
- **Color Palette**: Use the Teamified brand colors - primary purple (#A16AE8), brand blue (#8096FD), with neutral grays (#D9D9D9) and white backgrounds
- **Typography**: Plus Jakarta Sans font family with clear hierarchy (h1: 32px, h2: 28px, body: 16px)
- **Spacing**: Consistent 8px grid system with proper breathing room between elements

### **Layout Structure**
- **Split Layout**: Two-panel design with left branding panel and right login form panel
- **Left Panel (60%)**: Brand showcase with hero content and visual elements
- **Right Panel (40%)**: Login form and authentication interface
- **Responsive Design**: Stack vertically on mobile devices

### **Left Panel - Branding & Visual**
- **Logo Section**: Large "teamified" logo (h1, 32px, brand purple) with "Team Member Portal" subtitle
- **Hero Image**: Professional hero image (hero-image.avif) with proper alt text
- **Hero Content**: Descriptive text about the platform's purpose
- **Decorative Elements**: Subtle geometric SVG patterns using brand colors
- **Background**: Clean white background with subtle brand color accents

### **Right Panel - Login Form**
- **Form Container**: Centered form with proper padding and spacing
- **Form Header**: 
  - "Sign in to your account" (h2, 28px, primary text)
  - "Enter your credentials to access your portal" (body-medium, secondary text)
- **Form Fields**:
  - Email Address input (required, with validation)
  - Password input with show/hide toggle
  - Remember me checkbox
  - Forgot password link
- **Submit Button**: Primary button with "Sign In" text
- **Footer**: Help text with administrator contact information

### **Form Styling & Interactions**
- **Input Fields**: Clean, modern inputs with proper labels and placeholders
- **Validation States**: Clear error messages and visual feedback
- **Button States**: Loading states, hover effects, and disabled states
- **Form Validation**: Real-time validation with helpful error messages
- **Accessibility**: Proper ARIA labels, keyboard navigation, and screen reader support

### **Visual Elements**
- **Icons**: Consistent iconography using Lucide or similar icon set
- **Shadows**: Subtle drop shadows for form container and buttons
- **Borders**: Light gray borders (#D9D9D9) for form separation
- **Hover Effects**: Smooth transitions for interactive elements
- **Focus States**: Clear focus indicators for accessibility

### **User Experience Features**
- **Error Handling**: Clear error messages with helpful suggestions
- **Loading States**: Proper loading indicators during authentication
- **Success Feedback**: Smooth transitions after successful login
- **Form Persistence**: Remember form state and user preferences
- **Security Indicators**: Visual cues for secure authentication

### **Mobile Responsiveness**
- **Stacked Layout**: Left and right panels stack vertically on mobile
- **Touch Targets**: Minimum 44px touch targets for mobile devices
- **Mobile Navigation**: Optimized for mobile keyboard and touch input
- **Responsive Typography**: Scalable text sizes for different screen sizes

### **Technical Requirements**
- **Component Structure**: Modular React components (LoginForm, LoginLayout)
- **State Management**: Form validation, error handling, and loading states
- **Authentication Flow**: Proper handling of login attempts and rate limiting
- **Security**: CSRF protection, secure password handling, and session management

### **Accessibility Features**
- **Keyboard Navigation**: Full keyboard accessibility for all form elements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: WCAG AA compliant color combinations
- **Focus Management**: Clear focus indicators and logical tab order
- **Error Announcements**: Screen reader announcements for validation errors

---

**Create a design that embodies the Teamified brand values of bold simplicity, intuitive navigation, and accessibility-driven design while providing a secure and welcoming login experience.**

## Usage Notes

This prompt is designed for AI UI generation tools like:
- **v0.dev** - Vercel's AI-powered UI generator
- **Lovable** - AI-powered design tool
- **Other AI UI generators** that accept detailed design specifications

## Current Implementation Status

The login page currently has:
- ✅ Split layout with branding and form panels
- ✅ Basic form structure with email and password fields
- ✅ Hero image and branding elements
- ✅ Responsive design considerations
- 🔄 Could benefit from enhanced visual hierarchy
- 🔄 Form validation and error handling could be improved
- 🔄 Loading states and success feedback could be enhanced

## Design System Reference

The prompt follows the established Teamified design system documented in:
- `docs/style-guide/archive/example.html` - Legacy design system showcase (archived)
- `frontend/src/assets/teamified-design-system.css` - CSS variables and components
