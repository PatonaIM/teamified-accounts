# Spacing & Layout

## Overview

Our spacing system is built on strategic negative space calibrated for cognitive breathing room and content prioritization. We use a systematic 8px base unit to create consistent, breathable layouts that support our content-first approach.

## Spacing Scale

### Base Unit: 8px
All spacing values are multiples of 8px to ensure consistency and visual harmony.

### Spacing Values
- **4px** (0.5x) - Minimal spacing, tight connections
- **8px** (1x) - Base unit, standard spacing
- **16px** (2x) - Component padding, small gaps
- **24px** (3x) - Section spacing, medium gaps
- **32px** (4x) - Large gaps, content separation
- **40px** (5x) - Major section separation
- **48px** (6x) - Page sections, hero spacing
- **64px** (8x) - Large page sections
- **80px** (10x) - Major page divisions
- **96px** (12x) - Hero sections, large content blocks

## Layout Guidelines

### Container Widths
- **Small**: `640px` - Mobile-first, narrow content
- **Medium**: `768px` - Tablet, standard content
- **Large**: `1024px` - Desktop, wide content
- **Extra Large**: `1280px` - Large screens, maximum content width

### Grid System
- **Base Grid**: 12-column responsive grid
- **Gutter**: 24px between columns
- **Margin**: 16px on mobile, 24px on tablet, 32px on desktop

### Breakpoints
- **Mobile**: `320px - 767px`
- **Tablet**: `768px - 1023px`
- **Desktop**: `1024px - 1439px`
- **Large Desktop**: `1440px+`

## Component Spacing

### Buttons
- **Padding**: 12px 24px (vertical horizontal)
- **Margin**: 8px between buttons
- **Icon Spacing**: 8px between icon and text

### Cards
- **Padding**: 24px
- **Margin**: 16px between cards
- **Border Radius**: 8px

### Forms
- **Field Spacing**: 16px between form fields
- **Label Spacing**: 8px between label and input
- **Group Spacing**: 24px between form groups

### Navigation
- **Item Spacing**: 24px between nav items
- **Dropdown Spacing**: 8px between dropdown items
- **Section Spacing**: 32px between nav sections

## Page Layout Patterns

### Hero Sections
- **Top/Bottom Padding**: 80px
- **Content Spacing**: 32px between elements
- **CTA Spacing**: 24px from content

### Content Sections
- **Section Padding**: 64px top/bottom, 24px left/right
- **Content Spacing**: 24px between elements
- **Subsection Spacing**: 48px between subsections

### Footer
- **Padding**: 48px top/bottom, 24px left/right
- **Column Spacing**: 32px between columns
- **Link Spacing**: 16px between links

## CSS Implementation

### CSS Variables
```css
:root {
  /* Spacing Scale */
  --spacing-0: 0px;
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 16px;
  --spacing-4: 24px;
  --spacing-5: 32px;
  --spacing-6: 40px;
  --spacing-7: 48px;
  --spacing-8: 64px;
  --spacing-9: 80px;
  --spacing-10: 96px;
  
  /* Container Widths */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  
  /* Grid */
  --grid-gutter: 24px;
  --grid-margin-mobile: 16px;
  --grid-margin-tablet: 24px;
  --grid-margin-desktop: 32px;
  
  /* Breakpoints */
  --breakpoint-mobile: 767px;
  --breakpoint-tablet: 1023px;
  --breakpoint-desktop: 1439px;
}
```

### Spacing Utility Classes
```css
/* Margin Utilities */
.m-0 { margin: var(--spacing-0); }
.m-1 { margin: var(--spacing-1); }
.m-2 { margin: var(--spacing-2); }
.m-3 { margin: var(--spacing-3); }
.m-4 { margin: var(--spacing-4); }
.m-5 { margin: var(--spacing-5); }
.m-6 { margin: var(--spacing-6); }
.m-7 { margin: var(--spacing-7); }
.m-8 { margin: var(--spacing-8); }
.m-9 { margin: var(--spacing-9); }
.m-10 { margin: var(--spacing-10); }

/* Margin Top */
.mt-0 { margin-top: var(--spacing-0); }
.mt-1 { margin-top: var(--spacing-1); }
.mt-2 { margin-top: var(--spacing-2); }
.mt-3 { margin-top: var(--spacing-3); }
.mt-4 { margin-top: var(--spacing-4); }
.mt-5 { margin-top: var(--spacing-5); }
.mt-6 { margin-top: var(--spacing-6); }
.mt-7 { margin-top: var(--spacing-7); }
.mt-8 { margin-top: var(--spacing-8); }
.mt-9 { margin-top: var(--spacing-9); }
.mt-10 { margin-top: var(--spacing-10); }

/* Margin Bottom */
.mb-0 { margin-bottom: var(--spacing-0); }
.mb-1 { margin-bottom: var(--spacing-1); }
.mb-2 { margin-bottom: var(--spacing-2); }
.mb-3 { margin-bottom: var(--spacing-3); }
.mb-4 { margin-bottom: var(--spacing-4); }
.mb-5 { margin-bottom: var(--spacing-5); }
.mb-6 { margin-bottom: var(--spacing-6); }
.mb-7 { margin-bottom: var(--spacing-7); }
.mb-8 { margin-bottom: var(--spacing-8); }
.mb-9 { margin-bottom: var(--spacing-9); }
.mb-10 { margin-bottom: var(--spacing-10); }

/* Margin Left */
.ml-0 { margin-left: var(--spacing-0); }
.ml-1 { margin-left: var(--spacing-1); }
.ml-2 { margin-left: var(--spacing-2); }
.ml-3 { margin-left: var(--spacing-3); }
.ml-4 { margin-left: var(--spacing-4); }
.ml-5 { margin-left: var(--spacing-5); }
.ml-6 { margin-left: var(--spacing-6); }
.ml-7 { margin-left: var(--spacing-7); }
.ml-8 { margin-left: var(--spacing-8); }
.ml-9 { margin-left: var(--spacing-9); }
.ml-10 { margin-left: var(--spacing-10); }

/* Margin Right */
.mr-0 { margin-right: var(--spacing-0); }
.mr-1 { margin-right: var(--spacing-1); }
.mr-2 { margin-right: var(--spacing-2); }
.mr-3 { margin-right: var(--spacing-3); }
.mr-4 { margin-right: var(--spacing-4); }
.mr-5 { margin-right: var(--spacing-5); }
.mr-6 { margin-right: var(--spacing-6); }
.mr-7 { margin-right: var(--spacing-7); }
.mr-8 { margin-right: var(--spacing-8); }
.mr-9 { margin-right: var(--spacing-9); }
.mr-10 { margin-right: var(--spacing-10); }

/* Padding Utilities */
.p-0 { padding: var(--spacing-0); }
.p-1 { padding: var(--spacing-1); }
.p-2 { padding: var(--spacing-2); }
.p-3 { padding: var(--spacing-3); }
.p-4 { padding: var(--spacing-4); }
.p-5 { padding: var(--spacing-5); }
.p-6 { padding: var(--spacing-6); }
.p-7 { padding: var(--spacing-7); }
.p-8 { padding: var(--spacing-8); }
.p-9 { padding: var(--spacing-9); }
.p-10 { padding: var(--spacing-10); }

/* Padding Top */
.pt-0 { padding-top: var(--spacing-0); }
.pt-1 { padding-top: var(--spacing-1); }
.pt-2 { padding-top: var(--spacing-2); }
.pt-3 { padding-top: var(--spacing-3); }
.pt-4 { padding-top: var(--spacing-4); }
.pt-5 { padding-top: var(--spacing-5); }
.pt-6 { padding-top: var(--spacing-6); }
.pt-7 { padding-top: var(--spacing-7); }
.pt-8 { padding-top: var(--spacing-8); }
.pt-9 { padding-top: var(--spacing-9); }
.pt-10 { padding-top: var(--spacing-10); }

/* Padding Bottom */
.pb-0 { padding-bottom: var(--spacing-0); }
.pb-1 { padding-bottom: var(--spacing-1); }
.pb-2 { padding-bottom: var(--spacing-2); }
.pb-3 { padding-bottom: var(--spacing-3); }
.pb-4 { padding-bottom: var(--spacing-4); }
.pb-5 { padding-bottom: var(--spacing-5); }
.pb-6 { padding-bottom: var(--spacing-6); }
.pb-7 { padding-bottom: var(--spacing-7); }
.pb-8 { padding-bottom: var(--spacing-8); }
.pb-9 { padding-bottom: var(--spacing-9); }
.pb-10 { padding-bottom: var(--spacing-10); }

/* Padding Left */
.pl-0 { padding-left: var(--spacing-0); }
.pl-1 { padding-left: var(--spacing-1); }
.pl-2 { padding-left: var(--spacing-2); }
.pl-3 { padding-left: var(--spacing-3); }
.pl-4 { padding-left: var(--spacing-4); }
.pl-5 { padding-left: var(--spacing-5); }
.pl-6 { padding-left: var(--spacing-6); }
.pl-7 { padding-left: var(--spacing-7); }
.pl-8 { padding-left: var(--spacing-8); }
.pl-9 { padding-left: var(--spacing-9); }
.pl-10 { padding-left: var(--spacing-10); }

/* Padding Right */
.pr-0 { padding-right: var(--spacing-0); }
.pr-1 { padding-right: var(--spacing-1); }
.pr-2 { padding-right: var(--spacing-2); }
.pr-3 { padding-right: var(--spacing-3); }
.pr-4 { padding-right: var(--spacing-4); }
.pr-5 { padding-right: var(--spacing-5); }
.pr-6 { padding-right: var(--spacing-6); }
.pr-7 { padding-right: var(--spacing-7); }
.pr-8 { padding-right: var(--spacing-8); }
.pr-9 { padding-right: var(--spacing-9); }
.pr-10 { padding-right: var(--spacing-10); }
```

### Container Classes
```css
/* Container */
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--grid-margin-mobile);
  padding-right: var(--grid-margin-mobile);
}

.container-sm {
  max-width: var(--container-sm);
}

.container-md {
  max-width: var(--container-md);
}

.container-lg {
  max-width: var(--container-lg);
}

.container-xl {
  max-width: var(--container-xl);
}

/* Responsive margins */
@media (min-width: 768px) {
  .container {
    padding-left: var(--grid-margin-tablet);
    padding-right: var(--grid-margin-tablet);
  }
}

@media (min-width: 1024px) {
  .container {
    padding-left: var(--grid-margin-desktop);
    padding-right: var(--grid-margin-desktop);
  }
}
```

## Layout Patterns

### Stack Layout
```css
.stack {
  display: flex;
  flex-direction: column;
}

.stack > * + * {
  margin-top: var(--spacing-3);
}

.stack-sm > * + * {
  margin-top: var(--spacing-2);
}

.stack-lg > * + * {
  margin-top: var(--spacing-4);
}
```

### Inline Layout
```css
.inline {
  display: flex;
  align-items: center;
}

.inline > * + * {
  margin-left: var(--spacing-3);
}

.inline-sm > * + * {
  margin-left: var(--spacing-2);
}

.inline-lg > * + * {
  margin-left: var(--spacing-4);
}
```

### Grid Layout
```css
.grid {
  display: grid;
  gap: var(--grid-gutter);
}

.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 767px) {
  .grid-2,
  .grid-3,
  .grid-4 {
    grid-template-columns: 1fr;
  }
}
```

## Best Practices

### Content Density
- Use appropriate spacing to create visual breathing room
- Avoid overcrowding elements
- Maintain consistent spacing patterns throughout the interface

### Responsive Spacing
- Scale spacing appropriately for different screen sizes
- Use smaller spacing on mobile devices
- Maintain readability and touch targets

### Visual Hierarchy
- Use spacing to create clear content hierarchy
- Group related elements with consistent spacing
- Separate different content sections with larger spacing

### Accessibility
- Ensure sufficient spacing for touch targets (minimum 44px)
- Maintain clear visual separation between interactive elements
- Consider users with motor impairments when setting spacing values
