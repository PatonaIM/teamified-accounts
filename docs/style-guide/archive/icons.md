# Icons & Illustrations

## Overview

Our icon and illustration system supports our brand identity through meaningful visual elements that guide users and add depth to our stories. Icons create intuitive journeys while illustrations add heart and personality to our content.

## Icon System

### Icon Guidelines
- **Style**: Clean, minimal, and professional
- **Weight**: Consistent stroke width (2px for 24px icons)
- **Corner Radius**: Subtle rounded corners for friendly feel
- **Grid**: 24x24px base grid for consistency
- **Format**: SVG for scalability and performance

### Platform vs Service Icons

#### Platform Icons
Used for platform-related features, navigation, and core functionality.

**Color Scheme**: Purple (`#A16AE8`) + Black
- **Primary**: Purple for main platform elements
- **Secondary**: Black for contrast and readability
- **Usage**: Navigation, settings, user interface elements

```html
<!-- Platform Icon Example -->
<svg class="icon icon--platform" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#A16AE8" stroke-width="2"/>
  <path d="M2 17L12 22L22 17" stroke="#A16AE8" stroke-width="2"/>
  <path d="M2 12L12 17L22 12" stroke="#A16AE8" stroke-width="2"/>
</svg>
```

#### Service Icons
Used for service-related content, features, and offerings.

**Color Scheme**: Blue (`#8096FD`) + Black
- **Primary**: Blue for service elements
- **Secondary**: Black for contrast and readability
- **Usage**: Service pages, feature highlights, service categories

```html
<!-- Service Icon Example -->
<svg class="icon icon--service" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#8096FD" stroke-width="2"/>
  <path d="M2 17L12 22L22 17" stroke="#8096FD" stroke-width="2"/>
  <path d="M2 12L12 17L22 12" stroke="#8096FD" stroke-width="2"/>
</svg>
```

### Icon Sizes

| Size | Usage | Stroke Width |
|------|-------|--------------|
| 16px | Small UI elements, inline icons | 1.5px |
| 20px | Form elements, alerts | 2px |
| 24px | Navigation, buttons, cards | 2px |
| 32px | Feature highlights | 2.5px |
| 48px | Hero sections, large CTAs | 3px |

### Icon Categories

#### Navigation Icons
- Home, Menu, Search, User, Settings
- Used in navigation bars and menus
- Platform color scheme (Purple + Black)

#### Action Icons
- Add, Edit, Delete, Save, Cancel
- Used in buttons and interactive elements
- Contextual colors based on action type

#### Status Icons
- Success, Error, Warning, Info
- Used in alerts and notifications
- Semantic colors (Green, Red, Amber, Blue)

#### Feature Icons
- Services, Tools, Benefits
- Used in feature cards and service pages
- Service color scheme (Blue + Black)

## CSS Implementation

### Icon Base Styles
```css
.icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}

.icon--platform {
  color: var(--color-brand-purple);
}

.icon--service {
  color: var(--color-brand-blue);
}

.icon--success {
  color: var(--color-success);
}

.icon--error {
  color: var(--color-error);
}

.icon--warning {
  color: var(--color-warning);
}

.icon--info {
  color: var(--color-info);
}
```

### Icon Sizing Classes
```css
.icon-16 {
  width: 16px;
  height: 16px;
}

.icon-20 {
  width: 20px;
  height: 20px;
}

.icon-24 {
  width: 24px;
  height: 24px;
}

.icon-32 {
  width: 32px;
  height: 32px;
}

.icon-48 {
  width: 48px;
  height: 48px;
}
```

### Icon with Text
```css
.icon-text {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
}

.icon-text .icon {
  flex-shrink: 0;
}
```

## Common Icons

### Navigation Icons
```html
<!-- Home -->
<svg class="icon icon-24" viewBox="0 0 24 24" fill="none">
  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Menu -->
<svg class="icon icon-24" viewBox="0 0 24 24" fill="none">
  <path d="M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Search -->
<svg class="icon icon-24" viewBox="0 0 24 24" fill="none">
  <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
  <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

### Action Icons
```html
<!-- Add -->
<svg class="icon icon-24" viewBox="0 0 24 24" fill="none">
  <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Edit -->
<svg class="icon icon-24" viewBox="0 0 24 24" fill="none">
  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

### Status Icons
```html
<!-- Success -->
<svg class="icon icon-24" viewBox="0 0 24 24" fill="none">
  <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4901 2.02168 11.3363C2.16356 9.18255 2.99721 7.10531 4.39828 5.41373C5.79935 3.72215 7.69279 2.51482 9.79619 1.94411C11.8996 1.3734 14.1003 1.46672 16.07 2.21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Error -->
<svg class="icon icon-24" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
  <path d="M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

## Illustrations

### Illustration Style
Our illustrations add heart and meaning to our stories, making them resonate with users. They should:

- **Emotion**: Convey warmth, professionalism, and human connection
- **Style**: Clean, modern, with subtle gradients and soft shadows
- **Color**: Use brand colors (purple, blue) with supporting neutrals
- **Complexity**: Simple enough to be recognizable at small sizes
- **Consistency**: Maintain visual consistency across all illustrations

### Illustration Categories

#### Hero Illustrations
- Large, impactful illustrations for hero sections
- Showcase team collaboration, global talent, business success
- Use brand colors with supporting gradients

#### Feature Illustrations
- Medium-sized illustrations for feature highlights
- Focus on specific services or benefits
- Clean, iconographic style

#### Process Illustrations
- Step-by-step illustrations for workflows
- Show the journey from business need to solution
- Consistent visual language

### Illustration Guidelines

#### Color Usage
- **Primary**: Brand purple (`#A16AE8`) and blue (`#8096FD`)
- **Secondary**: Supporting colors from our palette
- **Background**: White or light neutral backgrounds
- **Accents**: Subtle gradients and shadows for depth

#### Style Elements
- **Shapes**: Rounded rectangles, circles, organic forms
- **Lines**: Clean, consistent stroke weights
- **Shadows**: Soft, subtle shadows for depth
- **Gradients**: Subtle gradients for visual interest

#### Sizing
- **Hero**: 400-600px width
- **Feature**: 200-300px width
- **Process**: 150-250px width
- **Icon**: 64-128px width

### Illustration Examples

#### Team Collaboration
```html
<!-- Hero illustration showing global team collaboration -->
<div class="illustration illustration--hero">
  <svg width="500" height="300" viewBox="0 0 500 300" fill="none">
    <!-- Global map background -->
    <path d="M..." fill="url(#map-gradient)" opacity="0.1"/>
    
    <!-- Team members -->
    <circle cx="150" cy="120" r="25" fill="url(#purple-gradient)"/>
    <circle cx="350" cy="180" r="25" fill="url(#blue-gradient)"/>
    <circle cx="250" cy="80" r="25" fill="url(#purple-gradient)"/>
    
    <!-- Connection lines -->
    <path d="M150 120L350 180" stroke="#A16AE8" stroke-width="2" stroke-dasharray="5,5"/>
    <path d="M150 120L250 80" stroke="#8096FD" stroke-width="2" stroke-dasharray="5,5"/>
    <path d="M250 80L350 180" stroke="#A16AE8" stroke-width="2" stroke-dasharray="5,5"/>
    
    <!-- Gradients -->
    <defs>
      <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#A16AE8"/>
        <stop offset="100%" style="stop-color:#A020F0"/>
      </linearGradient>
      <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#8096FD"/>
        <stop offset="100%" style="stop-color:#012DFF"/>
      </linearGradient>
    </defs>
  </svg>
</div>
```

## Best Practices

### Icon Usage
- Use consistent icon families throughout the interface
- Ensure icons are semantically appropriate for their context
- Provide alternative text for screen readers
- Test icons at different sizes for clarity

### Illustration Usage
- Use illustrations to support content, not replace it
- Ensure illustrations are culturally appropriate and inclusive
- Optimize illustrations for web performance
- Provide fallbacks for users with visual impairments

### Performance
- Use SVG format for scalability and performance
- Optimize SVG files to reduce file size
- Consider using icon fonts for frequently used icons
- Implement lazy loading for large illustrations

### Accessibility
- Provide meaningful alt text for all icons and illustrations
- Ensure sufficient color contrast for icon visibility
- Use semantic HTML for icon containers
- Test with screen readers and assistive technologies
