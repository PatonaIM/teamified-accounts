# Accessibility

## Overview

Our accessibility standards ensure that all teamified digital products are usable by people with diverse abilities. We follow WCAG 2.1 AA guidelines and implement universal design principles to create inclusive experiences for everyone.

## WCAG 2.1 AA Compliance

### Perceivable
Information and user interface components must be presentable to users in ways they can perceive.

#### Text Alternatives
- **Images**: All images have meaningful alt text
- **Icons**: Icons have descriptive labels or aria-labels
- **Decorative elements**: Marked with `alt=""` or `aria-hidden="true"`

```html
<!-- Meaningful image with alt text -->
<img src="team-collaboration.jpg" alt="Diverse team members collaborating on a project" class="hero-image">

<!-- Decorative image -->
<img src="decorative-pattern.svg" alt="" aria-hidden="true" class="bg-pattern">

<!-- Icon with aria-label -->
<button aria-label="Close modal" class="modal-close">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
  </svg>
</button>
```

#### Color and Contrast
- **Text contrast**: Minimum 4.5:1 ratio for normal text
- **Large text**: Minimum 3:1 ratio for text 18px+ or 14px+ bold
- **UI components**: Minimum 3:1 ratio for interactive elements
- **Color independence**: Information not conveyed by color alone

```css
/* High contrast text colors */
.text-primary {
  color: var(--color-text-primary); /* #1A1A1A on white = 15.6:1 */
}

.text-secondary {
  color: var(--color-text-secondary); /* #6B7280 on white = 4.6:1 */
}

/* Focus states with high contrast */
.btn:focus {
  outline: 2px solid var(--color-brand-purple);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(161, 106, 232, 0.2);
}
```

#### Typography and Spacing
- **Font size**: Minimum 16px for body text
- **Line height**: Minimum 1.5 for readability
- **Spacing**: Adequate spacing between text lines and paragraphs
- **Font choice**: Sans-serif fonts for better readability

### Operable

#### Keyboard Navigation
- **Tab order**: Logical tab sequence through all interactive elements
- **Skip links**: Skip to main content links for keyboard users
- **Focus indicators**: Visible focus states for all interactive elements
- **Keyboard shortcuts**: Avoid conflicts with assistive technologies

```html
<!-- Skip link for keyboard navigation -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Logical tab order -->
<nav class="nav">
  <a href="/" class="nav-link">Home</a>
  <a href="/services" class="nav-link">Services</a>
  <a href="/about" class="nav-link">About</a>
  <button class="btn btn-primary">Get Started</button>
</nav>

<main id="main-content">
  <!-- Main content -->
</main>
```

```css
/* Skip link styling */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-brand-purple);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1001;
}

.skip-link:focus {
  top: 6px;
}

/* Focus indicators */
.btn:focus,
.nav-link:focus,
.form-input:focus {
  outline: 2px solid var(--color-brand-purple);
  outline-offset: 2px;
}
```

#### Timing and Motion
- **Time limits**: Provide options to extend or disable time limits
- **Motion sensitivity**: Respect `prefers-reduced-motion` preference
- **Auto-updating content**: Allow users to pause, stop, or hide content

```css
/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Reduced motion animations */
.btn {
  transition: all 0.2s ease;
}

@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: none;
  }
}
```

### Understandable

#### Readable Content
- **Language**: Specify page language and language changes
- **Reading level**: Use clear, simple language
- **Abbreviations**: Define abbreviations and acronyms
- **Pronunciation**: Provide pronunciation for unusual words

```html
<!-- Page language specification -->
<html lang="en">
<head>
  <title>Teamified - Leading Outsourcing Company</title>
</head>
<body>
  <!-- Language change example -->
  <p>Our team speaks <span lang="es">español</span> and <span lang="fr">français</span>.</p>
</body>
</html>
```

#### Predictable Navigation
- **Consistent navigation**: Same navigation structure across pages
- **Consistent identification**: Same labels for same functionality
- **Context changes**: Warn users about context changes
- **Error prevention**: Help users avoid and correct mistakes

```html
<!-- Consistent navigation structure -->
<nav class="nav" role="navigation" aria-label="Main navigation">
  <ul class="nav-menu">
    <li class="nav-item">
      <a href="/" class="nav-link" aria-current="page">Home</a>
    </li>
    <li class="nav-item">
      <a href="/services" class="nav-link">Services</a>
    </li>
  </ul>
</nav>

<!-- Form with error prevention -->
<form class="form" novalidate>
  <div class="form-group">
    <label for="email" class="form-label">Email Address *</label>
    <input type="email" id="email" class="form-input" required aria-describedby="email-help email-error">
    <div id="email-help" class="form-help">We'll never share your email with anyone else.</div>
    <div id="email-error" class="form-error" role="alert" aria-live="polite"></div>
  </div>
</form>
```

### Robust

#### Compatible
- **Valid HTML**: Use valid, semantic HTML markup
- **ARIA support**: Use ARIA attributes when needed
- **Assistive technology**: Test with screen readers and other AT
- **Browser support**: Ensure compatibility across browsers

```html
<!-- Semantic HTML structure -->
<header class="header" role="banner">
  <nav class="nav" role="navigation" aria-label="Main navigation">
    <!-- Navigation content -->
  </nav>
</header>

<main class="main" role="main">
  <section class="hero" aria-labelledby="hero-title">
    <h1 id="hero-title" class="hero-title">Connect with World-Class Talent</h1>
    <p class="hero-description">Leading outsourcing company connecting businesses to offshore talent.</p>
  </section>
</main>

<footer class="footer" role="contentinfo">
  <!-- Footer content -->
</footer>
```

## Implementation Guidelines

### Semantic HTML
Use semantic HTML elements to provide meaning and structure:

```html
<!-- Good: Semantic structure -->
<article class="card">
  <header class="card-header">
    <h2 class="card-title">Service Package</h2>
  </header>
  <div class="card-body">
    <p class="card-text">Comprehensive outsourcing solution.</p>
  </div>
  <footer class="card-footer">
    <button class="btn btn-primary">Get Started</button>
  </footer>
</article>

<!-- Avoid: Non-semantic structure -->
<div class="card">
  <div class="card-header">
    <div class="card-title">Service Package</div>
  </div>
  <div class="card-body">
    <div class="card-text">Comprehensive outsourcing solution.</div>
  </div>
  <div class="card-footer">
    <div class="btn btn-primary">Get Started</div>
  </div>
</div>
```

### ARIA Attributes
Use ARIA attributes to enhance accessibility:

```html
<!-- Button with loading state -->
<button class="btn btn-primary" aria-busy="true" aria-live="polite">
  <span class="spinner" aria-hidden="true"></span>
  <span class="btn-text">Loading...</span>
</button>

<!-- Modal with proper ARIA -->
<div class="modal" role="dialog" aria-labelledby="modal-title" aria-describedby="modal-description">
  <div class="modal-header">
    <h2 id="modal-title" class="modal-title">Confirm Action</h2>
    <button class="modal-close" aria-label="Close modal">×</button>
  </div>
  <div class="modal-body">
    <p id="modal-description">Are you sure you want to proceed?</p>
  </div>
</div>

<!-- Form with proper labeling -->
<form class="form">
  <fieldset>
    <legend class="form-legend">Contact Information</legend>
    <div class="form-group">
      <label for="name" class="form-label">Full Name *</label>
      <input type="text" id="name" class="form-input" required aria-describedby="name-help">
      <div id="name-help" class="form-help">Enter your full legal name</div>
    </div>
  </fieldset>
</form>
```

### Focus Management
Implement proper focus management for dynamic content:

```javascript
// Focus management for modals
class Modal {
  constructor(element) {
    this.element = element;
    this.focusableElements = this.element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    this.firstFocusableElement = this.focusableElements[0];
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
  }

  open() {
    this.element.classList.add('is-open');
    this.element.setAttribute('aria-hidden', 'false');
    
    // Trap focus within modal
    this.element.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Focus first element
    this.firstFocusableElement.focus();
  }

  close() {
    this.element.classList.remove('is-open');
    this.element.setAttribute('aria-hidden', 'true');
    
    // Remove event listener
    this.element.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  handleKeydown(event) {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === this.firstFocusableElement) {
          event.preventDefault();
          this.lastFocusableElement.focus();
        }
      } else {
        if (document.activeElement === this.lastFocusableElement) {
          event.preventDefault();
          this.firstFocusableElement.focus();
        }
      }
    }
    
    if (event.key === 'Escape') {
      this.close();
    }
  }
}
```

## Testing and Validation

### Automated Testing
Use automated tools to check accessibility:

```bash
# Install axe-core for automated testing
npm install axe-core

# Run accessibility tests
npx axe https://teamified.com.au
```

### Manual Testing
Perform manual accessibility testing:

1. **Keyboard navigation**: Navigate using only Tab, Shift+Tab, Enter, and Space
2. **Screen reader testing**: Test with NVDA, JAWS, or VoiceOver
3. **Color contrast**: Use tools like WebAIM's contrast checker
4. **Zoom testing**: Test at 200% zoom level
5. **Mobile accessibility**: Test on mobile devices with accessibility features

### Testing Checklist

#### Visual Design
- [ ] Sufficient color contrast (4.5:1 minimum)
- [ ] Focus indicators visible
- [ ] Text readable at 200% zoom
- [ ] No reliance on color alone

#### Keyboard Navigation
- [ ] All interactive elements keyboard accessible
- [ ] Logical tab order
- [ ] Skip links available
- [ ] Focus trapped in modals

#### Screen Reader Support
- [ ] Semantic HTML structure
- [ ] Proper heading hierarchy
- [ ] Alt text for images
- [ ] ARIA labels where needed
- [ ] Form labels associated with inputs

#### Content
- [ ] Clear, simple language
- [ ] Page language specified
- [ ] Abbreviations defined
- [ ] Error messages clear and helpful

## Resources

### Tools
- **axe-core**: Automated accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Color Contrast Analyzer**: Color contrast checking
- **NVDA**: Free screen reader for testing

### Guidelines
- **WCAG 2.1**: Web Content Accessibility Guidelines
- **WAI-ARIA**: Accessible Rich Internet Applications
- **WebAIM**: Web Accessibility In Mind

### Documentation
- **MDN Web Docs**: Accessibility documentation
- **A11y Project**: Accessibility guidelines and resources
- **Inclusive Components**: Accessible component patterns
