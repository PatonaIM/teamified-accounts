# Typography

## Overview

Our typography system uses Plus Jakarta Sans to create clear information hierarchy through weight variance and proportional scaling. The font family supports our content-first approach with excellent readability and professional appearance.

## Font Family

### Plus Jakarta Sans
- **Primary Font**: Plus Jakarta Sans
- **Weights**: Light (300), Medium (500), Regular (400), SemiBold (600), Bold (700)
- **Fallback**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

### Font Loading
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

## Type Scale

### Display Headings
- **Display Large**: `48px / 56px` - Plus Jakarta Sans Medium
- **Display Medium**: `40px / 48px` - Plus Jakarta Sans Medium
- **Display Small**: `32px / 40px` - Plus Jakarta Sans Medium

### Page Headings
- **H1**: `32px / 40px` - Plus Jakarta Sans Medium
- **H2**: `28px / 36px` - Plus Jakarta Sans Medium
- **H3**: `24px / 32px` - Plus Jakarta Sans Medium
- **H4**: `20px / 28px` - Plus Jakarta Sans Medium
- **H5**: `18px / 24px` - Plus Jakarta Sans Medium
- **H6**: `16px / 20px` - Plus Jakarta Sans Medium

### Body Text
- **Body Large**: `18px / 28px` - Plus Jakarta Sans Light
- **Body Medium**: `16px / 24px` - Plus Jakarta Sans Light
- **Body Small**: `14px / 20px` - Plus Jakarta Sans Light

### UI Elements
- **Button Large**: `16px / 24px` - Plus Jakarta Sans Medium
- **Button Medium**: `14px / 20px` - Plus Jakarta Sans Medium
- **Button Small**: `12px / 16px` - Plus Jakarta Sans Medium
- **Caption**: `12px / 16px` - Plus Jakarta Sans Light
- **Overline**: `10px / 16px` - Plus Jakarta Sans Medium (uppercase)

## Usage Guidelines

### Headings
- **H1**: Main page titles, hero sections
- **H2**: Section headers, major content divisions
- **H3**: Subsection headers, card titles
- **H4**: Form section headers, smaller content groups
- **H5**: List headers, minor divisions
- **H6**: Table headers, smallest content divisions

### Body Text
- **Body Large**: Important content, lead paragraphs
- **Body Medium**: Standard content, main text
- **Body Small**: Supporting text, metadata

### Interactive Elements
- **Button Text**: Always use Medium weight for better visibility
- **Links**: Inherit body text size with brand color
- **Form Labels**: Use Medium weight for clarity

## CSS Implementation

### CSS Variables
```css
:root {
  /* Font Family */
  --font-family-primary: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Font Sizes */
  --font-size-display-large: 48px;
  --font-size-display-medium: 40px;
  --font-size-display-small: 32px;
  --font-size-h1: 32px;
  --font-size-h2: 28px;
  --font-size-h3: 24px;
  --font-size-h4: 20px;
  --font-size-h5: 18px;
  --font-size-h6: 16px;
  --font-size-body-large: 18px;
  --font-size-body-medium: 16px;
  --font-size-body-small: 14px;
  --font-size-button-large: 16px;
  --font-size-button-medium: 14px;
  --font-size-button-small: 12px;
  --font-size-caption: 12px;
  --font-size-overline: 10px;
  
  /* Line Heights */
  --line-height-display-large: 56px;
  --line-height-display-medium: 48px;
  --line-height-display-small: 40px;
  --line-height-h1: 40px;
  --line-height-h2: 36px;
  --line-height-h3: 32px;
  --line-height-h4: 28px;
  --line-height-h5: 24px;
  --line-height-h6: 20px;
  --line-height-body-large: 28px;
  --line-height-body-medium: 24px;
  --line-height-body-small: 20px;
  --line-height-button-large: 24px;
  --line-height-button-medium: 20px;
  --line-height-button-small: 16px;
  --line-height-caption: 16px;
  --line-height-overline: 16px;
}
```

### Typography Classes
```css
/* Display Styles */
.display-large {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-display-large);
  line-height: var(--line-height-display-large);
  font-weight: var(--font-weight-medium);
}

.display-medium {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-display-medium);
  line-height: var(--line-height-display-medium);
  font-weight: var(--font-weight-medium);
}

.display-small {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-display-small);
  line-height: var(--line-height-display-small);
  font-weight: var(--font-weight-medium);
}

/* Heading Styles */
.h1 {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-h1);
  line-height: var(--line-height-h1);
  font-weight: var(--font-weight-medium);
}

.h2 {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-h2);
  line-height: var(--line-height-h2);
  font-weight: var(--font-weight-medium);
}

.h3 {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-h3);
  line-height: var(--line-height-h3);
  font-weight: var(--font-weight-medium);
}

.h4 {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-h4);
  line-height: var(--line-height-h4);
  font-weight: var(--font-weight-medium);
}

.h5 {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-h5);
  line-height: var(--line-height-h5);
  font-weight: var(--font-weight-medium);
}

.h6 {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-h6);
  line-height: var(--line-height-h6);
  font-weight: var(--font-weight-medium);
}

/* Body Styles */
.body-large {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-large);
  line-height: var(--line-height-body-large);
  font-weight: var(--font-weight-light);
}

.body-medium {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-medium);
  line-height: var(--line-height-body-medium);
  font-weight: var(--font-weight-light);
}

.body-small {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-small);
  line-height: var(--line-height-body-small);
  font-weight: var(--font-weight-light);
}

/* Button Styles */
.button-large {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-button-large);
  line-height: var(--line-height-button-large);
  font-weight: var(--font-weight-medium);
}

.button-medium {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-button-medium);
  line-height: var(--line-height-button-medium);
  font-weight: var(--font-weight-medium);
}

.button-small {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-button-small);
  line-height: var(--line-height-button-small);
  font-weight: var(--font-weight-medium);
}

/* Utility Styles */
.caption {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-caption);
  line-height: var(--line-height-caption);
  font-weight: var(--font-weight-light);
}

.overline {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-overline);
  line-height: var(--line-height-overline);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

## Best Practices

### Readability
- Maintain minimum 4.5:1 contrast ratio for body text
- Use appropriate line heights for comfortable reading
- Limit line length to 65-75 characters for optimal readability

### Hierarchy
- Use consistent heading levels (don't skip levels)
- Maintain clear visual hierarchy through size and weight
- Use color sparingly to enhance hierarchy, not replace it

### Responsive Typography
- Scale font sizes appropriately for different screen sizes
- Maintain readability on mobile devices
- Consider touch targets for interactive elements

### Performance
- Preload critical fonts to prevent layout shifts
- Use font-display: swap for better loading experience
- Consider subsetting fonts for faster loading

## Accessibility

### Screen Readers
- Use semantic HTML elements (h1-h6, p, etc.)
- Ensure proper heading hierarchy
- Provide alternative text for decorative typography

### Color Contrast
- All text meets WCAG AA contrast requirements
- Test color combinations with accessibility tools
- Don't rely solely on color to convey information
