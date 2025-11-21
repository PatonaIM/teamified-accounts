# Components

## Overview

Our component library provides reusable, accessible UI elements that maintain consistency across all teamified digital products. Each component is designed with our design principles in mind: bold simplicity, intuitive navigation, and content-first layouts.

## Buttons

### Primary Button
The main call-to-action button used for primary actions.

```html
<button class="btn btn-primary">
  Get Started
</button>
```

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-primary {
  background-color: var(--color-brand-purple);
  color: white;
  padding: 12px 24px;
  font-size: var(--font-size-button-medium);
  line-height: var(--line-height-button-medium);
}

.btn-primary:hover {
  background-color: var(--color-deep-purple);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(161, 106, 232, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(161, 106, 232, 0.3);
}
```

### Secondary Button
Used for secondary actions and less prominent CTAs.

```html
<button class="btn btn-secondary">
  Learn More
</button>
```

```css
.btn-secondary {
  background-color: transparent;
  color: var(--color-brand-purple);
  border: 2px solid var(--color-brand-purple);
  padding: 10px 22px;
  font-size: var(--font-size-button-medium);
  line-height: var(--line-height-button-medium);
}

.btn-secondary:hover {
  background-color: var(--color-brand-purple);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(161, 106, 232, 0.3);
}
```

### Button Sizes
- **Large**: `btn-lg` - 16px font, 16px 32px padding
- **Medium**: `btn-md` - 14px font, 12px 24px padding (default)
- **Small**: `btn-sm` - 12px font, 8px 16px padding

### Button States
- **Disabled**: `btn:disabled` - Reduced opacity, no hover effects
- **Loading**: `btn--loading` - Shows spinner, disables interaction

## Forms

### Text Input
Standard text input field with consistent styling.

```html
<div class="form-group">
  <label for="email" class="form-label">Email Address</label>
  <input type="email" id="email" class="form-input" placeholder="Enter your email">
  <div class="form-help">We'll never share your email with anyone else.</div>
</div>
```

```css
.form-group {
  margin-bottom: var(--spacing-4);
}

.form-label {
  display: block;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-medium);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--color-neutral-gray);
  border-radius: 8px;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-medium);
  line-height: var(--line-height-body-medium);
  color: var(--color-text-primary);
  background-color: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-brand-purple);
  box-shadow: 0 0 0 3px rgba(161, 106, 232, 0.1);
}

.form-input::placeholder {
  color: var(--color-text-tertiary);
}

.form-help {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-small);
  line-height: var(--line-height-body-small);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-2);
}

.form-input--error {
  border-color: var(--color-error);
}

.form-input--error:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-error {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-small);
  line-height: var(--line-height-body-small);
  color: var(--color-error);
  margin-top: var(--spacing-2);
}
```

### Select Dropdown
Styled select element for dropdown options.

```html
<div class="form-group">
  <label for="service" class="form-label">Service Type</label>
  <select id="service" class="form-select">
    <option value="">Select a service</option>
    <option value="development">Software Development</option>
    <option value="design">UI/UX Design</option>
    <option value="marketing">Digital Marketing</option>
  </select>
</div>
```

```css
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--color-neutral-gray);
  border-radius: 8px;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-medium);
  line-height: var(--line-height-body-medium);
  color: var(--color-text-primary);
  background-color: white;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  appearance: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-select:focus {
  outline: none;
  border-color: var(--color-brand-purple);
  box-shadow: 0 0 0 3px rgba(161, 106, 232, 0.1);
}
```

### Checkbox
Styled checkbox input with custom design.

```html
<div class="form-group">
  <label class="checkbox">
    <input type="checkbox" class="checkbox-input">
    <span class="checkbox-mark"></span>
    <span class="checkbox-label">I agree to the terms and conditions</span>
  </label>
</div>
```

```css
.checkbox {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-mark {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-neutral-gray);
  border-radius: 4px;
  margin-right: var(--spacing-3);
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-input:checked + .checkbox-mark {
  background-color: var(--color-brand-purple);
  border-color: var(--color-brand-purple);
}

.checkbox-input:checked + .checkbox-mark::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-medium);
  line-height: var(--line-height-body-medium);
  color: var(--color-text-primary);
  padding-top: 2px;
}
```

## Cards

### Basic Card
Container for grouping related content.

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Service Package</h3>
  </div>
  <div class="card-body">
    <p class="card-text">Comprehensive outsourcing solution tailored to your business needs.</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Get Started</button>
  </div>
</div>
```

```css
.card {
  background-color: white;
  border: 1px solid var(--color-neutral-gray);
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-neutral-gray);
}

.card-title {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-h4);
  color: var(--color-text-primary);
  margin: 0;
}

.card-body {
  padding: var(--spacing-4);
}

.card-text {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-medium);
  line-height: var(--line-height-body-medium);
  color: var(--color-text-secondary);
  margin: 0;
}

.card-footer {
  padding: var(--spacing-4);
  border-top: 1px solid var(--color-neutral-gray);
  background-color: var(--color-bg-secondary);
}
```

### Feature Card
Highlighted card for showcasing features or services.

```html
<div class="card card--feature">
  <div class="card-icon">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
    </svg>
  </div>
  <div class="card-body">
    <h3 class="card-title">World-Class Talent</h3>
    <p class="card-text">Access to skilled professionals from around the globe.</p>
  </div>
</div>
```

```css
.card--feature {
  text-align: center;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.card--feature:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.card-icon {
  width: 48px;
  height: 48px;
  background-color: var(--color-brand-purple);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-4);
  color: white;
}
```

## Navigation

### Primary Navigation
Main navigation component for site-wide navigation.

```html
<nav class="nav">
  <div class="nav-container">
    <div class="nav-brand">
      <img src="teamified-logo-all-purple.png" alt="Teamified" class="nav-logo">
    </div>
    <ul class="nav-menu">
      <li class="nav-item">
        <a href="#" class="nav-link">Services</a>
      </li>
      <li class="nav-item">
        <a href="#" class="nav-link">About</a>
      </li>
      <li class="nav-item">
        <a href="#" class="nav-link">Contact</a>
      </li>
      <li class="nav-item">
        <button class="btn btn-primary">Get Started</button>
      </li>
    </ul>
  </div>
</nav>
```

```css
.nav {
  background-color: white;
  border-bottom: 1px solid var(--color-neutral-gray);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--spacing-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
}

.nav-brand {
  flex-shrink: 0;
}

.nav-logo {
  height: 32px;
  width: auto;
}

.nav-brand .logo {
  font-family: var(--font-family-primary);
  font-size: 32px;
  font-weight: var(--font-weight-bold);
  color: var(--color-brand-purple);
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.nav-menu {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--spacing-6);
}

.nav-item {
  margin: 0;
}

.nav-link {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-medium);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-body-medium);
  color: var(--color-text-primary);
  text-decoration: none;
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: 8px;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.nav-link:hover {
  color: var(--color-brand-purple);
  background-color: var(--color-bg-secondary);
}

@media (max-width: 767px) {
  .nav-menu {
    display: none;
  }
}
```

### Sidebar Navigation
Sidebar navigation component for application layouts and documentation sites.

```html
<aside class="sidebar" role="complementary" aria-label="Navigation menu">
  <div class="sidebar-header">
    <a href="#" class="logo">
      <span>teamified</span>
    </a>
  </div>
  
  <nav class="sidebar-nav" role="navigation">
    <div class="sidebar-nav-section">
      <div class="sidebar-nav-title">Getting Started</div>
      <ul class="sidebar-nav-item">
        <li><a href="#overview" class="sidebar-nav-link active">
          <svg class="sidebar-nav-icon" viewBox="0 0 24 24" fill="none">
            <!-- Icon SVG path -->
          </svg>
          Overview
        </a></li>
      </ul>
    </div>
  </nav>
</aside>
```

```css
.sidebar {
  width: 280px;
  background-color: var(--color-bg-primary);
  border-right: 1px solid var(--color-neutral-gray);
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  z-index: 100;
}

.sidebar-header {
  padding: var(--spacing-6) var(--spacing-4);
  border-bottom: 1px solid var(--color-neutral-gray);
}

.logo {
  font-family: var(--font-family-primary);
  font-size: 32px;
  font-weight: var(--font-weight-bold);
  color: var(--color-brand-purple);
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
}

.sidebar-nav {
  padding: var(--spacing-4) 0;
}

.sidebar-nav-section {
  margin-bottom: var(--spacing-6);
}

.sidebar-nav-title {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-small);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0 var(--spacing-4) var(--spacing-2);
  margin-bottom: var(--spacing-2);
}

.sidebar-nav-item {
  list-style: none;
  margin: 0;
}

.sidebar-nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  padding-left: var(--spacing-2);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-medium);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  text-decoration: none;
  border-radius: 0;
  transition: all var(--transition-normal);
  border-left: 3px solid transparent;
}

.sidebar-nav-link:hover,
.sidebar-nav-link.active {
  background-color: var(--color-bg-secondary);
  color: var(--color-brand-purple);
  border-left-color: var(--color-brand-purple);
}

.sidebar-nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.sidebar-nav-link:hover .sidebar-nav-icon,
.sidebar-nav-link.active .sidebar-nav-icon {
  color: var(--color-brand-purple);
}

@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform var(--transition-normal);
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
}
```

### Hero Section
Hero section component for main page introductions and key messaging.

```html
<section class="hero">
  <div class="container">
    <h1 class="display-large">Teamified Design System</h1>
    <p class="body-large">Leading outsourcing company connecting businesses to world-class offshore talent</p>
    <div class="inline mt-6">
      <button class="btn btn-primary">Explore Components</button>
      <button class="btn btn-secondary">View Documentation</button>
    </div>
  </div>
</section>
```

```css
.hero {
  background: white;
  color: var(--color-text-primary);
  padding: var(--spacing-9) 0;
  text-align: center;
}

.hero h1,
.hero p {
  color: var(--color-text-primary);
}

.hero .btn {
  margin: 0 var(--spacing-2);
}
```

### Breadcrumbs
Navigation component for showing page hierarchy.

```html
<nav class="breadcrumb" aria-label="Breadcrumb">
  <ol class="breadcrumb-list">
    <li class="breadcrumb-item">
      <a href="#" class="breadcrumb-link">Home</a>
    </li>
    <li class="breadcrumb-item">
      <a href="#" class="breadcrumb-link">Services</a>
    </li>
    <li class="breadcrumb-item" aria-current="page">
      <span class="breadcrumb-current">Software Development</span>
    </li>
  </ol>
</nav>
```

```css
.breadcrumb {
  margin-bottom: var(--spacing-6);
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--spacing-2);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-item:not(:last-child)::after {
  content: '/';
  margin-left: var(--spacing-2);
  color: var(--color-text-tertiary);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-small);
}

.breadcrumb-link {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-small);
  line-height: var(--line-height-body-small);
  color: var(--color-brand-blue);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--color-deep-blue);
  text-decoration: underline;
}

.breadcrumb-current {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-small);
  line-height: var(--line-height-body-small);
  color: var(--color-text-secondary);
}
```

## Alerts

### Success Alert
Used to display success messages and confirmations.

```html
<div class="alert alert--success">
  <div class="alert-icon">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor"/>
    </svg>
  </div>
  <div class="alert-content">
    <h4 class="alert-title">Success!</h4>
    <p class="alert-message">Your request has been submitted successfully.</p>
  </div>
</div>
```

```css
.alert {
  display: flex;
  align-items: flex-start;
  padding: var(--spacing-4);
  border-radius: 8px;
  border: 1px solid;
  margin-bottom: var(--spacing-4);
}

.alert-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-right: var(--spacing-3);
  margin-top: 2px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-h5);
  margin: 0 0 var(--spacing-2) 0;
}

.alert-message {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-medium);
  line-height: var(--line-height-body-medium);
  margin: 0;
}

.alert--success {
  background-color: #f0fdf4;
  border-color: #bbf7d0;
  color: #166534;
}

.alert--error {
  background-color: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.alert--warning {
  background-color: #fffbeb;
  border-color: #fed7aa;
  color: #92400e;
}

.alert--info {
  background-color: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
}
```

## Modals

### Basic Modal
Overlay dialog for important actions or information.

```html
<div class="modal" id="example-modal">
  <div class="modal-overlay"></div>
  <div class="modal-container">
    <div class="modal-header">
      <h2 class="modal-title">Confirm Action</h2>
      <button class="modal-close" aria-label="Close modal">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <div class="modal-body">
      <p>Are you sure you want to proceed with this action?</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

```css
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: none;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
}

.modal.is-open {
  display: flex;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-container {
  position: relative;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-neutral-gray);
}

.modal-title {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-h3);
  color: var(--color-text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  padding: var(--spacing-2);
  border-radius: 8px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.modal-close:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.modal-body {
  padding: var(--spacing-4);
}

.modal-body p {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-medium);
  line-height: var(--line-height-body-medium);
  color: var(--color-text-secondary);
  margin: 0;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  border-top: 1px solid var(--color-neutral-gray);
  background-color: var(--color-bg-secondary);
}
```

## Best Practices

### Accessibility
- All interactive elements are keyboard accessible
- Proper ARIA labels and roles are used
- Color is never the only way to convey information
- Focus states are clearly visible

### Responsive Design
- Components adapt to different screen sizes
- Touch targets are at least 44px on mobile
- Text remains readable on all devices

### Performance
- CSS transitions are hardware-accelerated
- Components use efficient CSS selectors
- Minimal JavaScript dependencies

### Consistency
- All components follow the same design patterns
- Spacing and typography are consistent
- Color usage follows the brand guidelines
