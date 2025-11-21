# Color System

## Overview

Our color system is built on strategic color theory with subtle gradients and purposeful accent placement. Colors are designed to create visual hierarchy while maintaining accessibility and supporting our brand identity.

## Primary Colors

### Brand Purple
- **Hex**: `#A16AE8`
- **RGB**: `161, 106, 232`
- **Usage**: Primary brand color, main CTAs, key UI elements
- **Accessibility**: Meets WCAG AA contrast requirements on white backgrounds

### Brand Blue
- **Hex**: `#8096FD`
- **RGB**: `128, 150, 253`
- **Usage**: Secondary actions, links, interactive elements
- **Accessibility**: Meets WCAG AA contrast requirements on white backgrounds

### Neutral Gray
- **Hex**: `#D9D9D9`
- **RGB**: `217, 217, 217`
- **Usage**: Borders, dividers, disabled states
- **Accessibility**: Used primarily for decorative elements

## Secondary Colors

### Deep Purple
- **Hex**: `#A020F0`
- **RGB**: `160, 32, 240`
- **Usage**: Hover states, emphasis, premium features
- **Accessibility**: High contrast for important interactions

### Deep Blue
- **Hex**: `#012DFF`
- **RGB**: `1, 45, 255`
- **Usage**: Links, navigation, service-related elements
- **Accessibility**: High contrast for navigation elements

## Color Usage Guidelines

### Background Colors
- **Primary Background**: `#FFFFFF` (White)
- **Secondary Background**: `#F8F9FA` (Light gray for sections)
- **Tertiary Background**: `#F1F3F4` (Subtle contrast)

### Text Colors
- **Primary Text**: `#1A1A1A` (Near black for maximum readability)
- **Secondary Text**: `#6B7280` (Medium gray for supporting text)
- **Tertiary Text**: `#9CA3AF` (Light gray for captions, metadata)

### Status Colors
- **Success**: `#10B981` (Green)
- **Warning**: `#F59E0B` (Amber)
- **Error**: `#EF4444` (Red)
- **Info**: `#3B82F6` (Blue)

## Color Combinations

### Primary Combinations
- Brand Purple + White: Primary CTAs and key interactions
- Brand Blue + White: Secondary actions and links
- Deep Purple + White: Hover states and emphasis

### Service vs Platform
- **Platform Elements**: Purple (`#A16AE8`) + Black icons
- **Service Elements**: Blue (`#8096FD`) + Black icons

## Accessibility

### Contrast Ratios
All color combinations meet WCAG AA standards:
- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio
- UI components: 3:1 minimum contrast ratio

### Color Blindness Considerations
- Never rely solely on color to convey information
- Use patterns, icons, and text labels in addition to color
- Test color combinations with color blindness simulators

## Implementation

### CSS Variables
```css
:root {
  /* Primary Colors */
  --color-brand-purple: #A16AE8;
  --color-brand-blue: #8096FD;
  --color-neutral-gray: #D9D9D9;
  
  /* Secondary Colors */
  --color-deep-purple: #A020F0;
  --color-deep-blue: #012DFF;
  
  /* Background Colors */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F8F9FA;
  --color-bg-tertiary: #F1F3F4;
  
  /* Text Colors */
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #9CA3AF;
}
```

### Usage Examples
```css
/* Primary CTA Button */
.btn-primary {
  background-color: var(--color-brand-purple);
  color: white;
}

/* Secondary Link */
.link-secondary {
  color: var(--color-brand-blue);
}

/* Service Icon */
.icon-service {
  color: var(--color-brand-blue);
}

/* Platform Icon */
.icon-platform {
  color: var(--color-brand-purple);
}
```

## Color Palette

| Color Name | Hex | Usage |
|------------|-----|-------|
| Brand Purple | `#A16AE8` | Primary brand, CTAs |
| Brand Blue | `#8096FD` | Secondary actions, services |
| Neutral Gray | `#D9D9D9` | Borders, dividers |
| Deep Purple | `#A020F0` | Hover states, emphasis |
| Deep Blue | `#012DFF` | Navigation, links |
| White | `#FFFFFF` | Primary backgrounds |
| Light Gray | `#F8F9FA` | Secondary backgrounds |
| Primary Text | `#1A1A1A` | Main text content |
| Secondary Text | `#6B7280` | Supporting text |
| Tertiary Text | `#9CA3AF` | Captions, metadata |
