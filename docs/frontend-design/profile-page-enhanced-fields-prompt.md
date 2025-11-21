Create a comprehensive, tabbed profile management page for the Teamified EOR Portal using React and TypeScript. The page should replace the current card-based layout with an extensive tabbed interface that implements all the profile fields specified in Story 2.2, organizing numerous profile sections into logical, user-friendly tabs.

**Current Implementation to Replace:**
The existing ProfilePage.tsx uses a simple 2-card layout (Personal Information + Professional Details) and needs to be completely enhanced with a comprehensive tabbed interface containing all the fields from Story 2.2.

**Required Tab Structure (Based on Story 2.2):**

1. **Core Employee Information Tab**
   - Employee ID, First Name, Last Name, Father's Name, Nick Name, Email Address
   - Client Assignment, Department, Location, Title, Employment Type, Status
   - Primary Reporting Manager, Secondary Reporting Manager
   - Joining Date, Confirmation Date, Experience Tracking

2. **Personal Information Tab**
   - Date of Birth, Age (calculated), Gender, Marital Status
   - Personal Description, Citizenship, Blood Group, Expertise
   - LinkedIn URL, Professional Networking Information
   - Work Phone, Extension, Seating Location, Personal Mobile, Personal Email

3. **Address Information Tab**
   - Present Address (Current Residence): Address Line 1, Address Line 2, City, State/Province, Postal Code, Country
   - Address validation and formatting

4. **Government Identification Tab**
   - PAN (Indian tax ID), Aadhaar (Indian national ID)
   - PF Number, UAN (Universal Account Number)
   - Country-specific IDs: NIC (Sri Lanka), SSS/PHILHEALTH/PAGIBIG/TIN (Philippines)
   - Encrypted storage indicators for sensitive government IDs

5. **Emergency Contact Management Tab**
   - Multiple emergency contacts per employee
   - Contact Name, Relationship, Phone Number, Address
   - Primary contact designation checkbox
   - Add/Remove emergency contact functionality

6. **Banking Information Tab**
   - Bank Account Number, IFSC Code, Payment Mode
   - Bank Name, Account Type, Bank Holder Name
   - Encrypted storage indicators for banking information

7. **Document Management Tab**
   - CV upload and management
   - ID proof, Address proof, Bank statement storage
   - File type validation and size limits (PDF, DOC, DOCX, JPG, PNG up to 10MB)

8. **Preferences & Settings Tab**
   - Language Preference, Communication Preferences, Notification Settings
   - Profile completion percentage display
   - Required vs optional field indicators

**Design Requirements:**
- Use Teamified brand colors: primary purple (#A16AE8), brand blue (#8096FD), neutral grays (#D9D9D9)
- Maintain Plus Jakarta Sans typography with clear hierarchy
- Use existing CSS classes: .dashboard-container, .dashboard-hero, .dashboard-title, .form-group, .form-label, .form-input, .btn, .btn-primary
- Implement responsive design with mobile-first approach
- Include comprehensive form validation and real-time feedback
- Add loading states and success/error messaging
- Ensure WCAG AA accessibility compliance
- Show profile completion percentage prominently

**Technical Requirements:**
- Replace the entire ProfilePage.tsx component
- Use existing Layout wrapper and component imports
- Add Tabs component if not available (create ui/Tabs.tsx)
- Maintain existing form styling and button patterns
- Include proper TypeScript types for all form fields
- Implement form state management with React hooks
- Add proper error handling and validation
- Implement conditional validation based on citizenship/country
- Add profile completion tracking with progress indicators

**Form Behavior:**
- Each tab should have its own form with independent save functionality
- Show success toast messages on save with audit labels
- Implement inline validation with helpful error messages
- Auto-save functionality for better user experience
- Remember form state and user input across tab switches
- Conditional field display based on country selection
- Profile completion percentage updates in real-time

**Special Features:**
- Profile completion progress indicator at the top of the page
- Required vs optional field visual indicators
- Country-specific field validation and display
- Emergency contact add/remove functionality
- Document upload with drag-and-drop support
- Encrypted field indicators for sensitive information

**Mobile Considerations:**
- Tabs should stack vertically on mobile devices
- Touch targets should be minimum 44px
- Form fields should be optimized for mobile input
- Responsive typography and spacing
- Collapsible tab sections for better mobile UX

**Accessibility Features:**
- Proper ARIA labels for all form elements
- Keyboard navigation support for tabs
- Screen reader announcements for validation errors
- Clear focus indicators and logical tab order
- Semantic HTML structure
- Profile completion announcements for screen readers

**Integration Notes:**
- Keep existing Layout component wrapper
- Maintain current CSS class structure
- Use existing icon system (Lucide React)
- Preserve current authentication and routing patterns
- Prepare for backend API integration with comprehensive profile endpoints

**Expected Output:**
A fully functional, comprehensive tabbed profile page component that replaces the current ProfilePage.tsx while maintaining the existing design system and implementing all the profile fields specified in Story 2.2. The interface should provide an intuitive, organized way for EOR team members to manage their complete profile information across all required categories.