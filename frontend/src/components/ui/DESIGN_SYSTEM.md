# Teamified Design System

> **Single Source of Truth** for all UI components and design tokens used across the Teamified platform.

## Quick Start

```tsx
import {
  Button,
  Badge,
  Alert,
  Dialog,
  FloatingLabelInput,
  Checkbox,
  RadioGroup,
  Switch,
  Progress,
  Spinner,
  Avatar,
} from "@/components/ui";
```

## Design Tokens

### Primary Colors (#9333EA Purple)

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| Primary Lighter | #D8B4FE | `bg-primary-lighter` | Backgrounds, highlights |
| Primary Light | #A855F7 | `bg-primary-light` | Hover states |
| Primary | #9333EA | `bg-primary` | Primary buttons, links |
| Primary Dark | #7C3AED | `bg-primary-dark` | Active/pressed states |

### Secondary Brand Colors (#002DFF Blue)

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| Secondary Brand Lighter | #BFDBFE | `bg-secondary-brand-lighter` | Backgrounds |
| Secondary Brand Light | #3B82F6 | `bg-secondary-brand-light` | Hover states |
| Secondary Brand | #002DFF | `bg-secondary-brand` | Secondary CTAs |
| Secondary Brand Dark | #1D4ED8 | `bg-secondary-brand-dark` | Active states |

### Status Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| Success | #10B981 | `bg-success` | Success states, confirmations |
| Warning | #FFA500 | `bg-warning` | Warnings, pending states |
| Destructive | #EF4444 | `bg-destructive` | Errors, destructive actions |
| Info | #3B82F6 | `bg-info` | Informational messages |
| Premium | #D4AF37 | `bg-premium` | Premium features |

### Neutral Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| Background | #F9FAFB | `bg-background` | Page backgrounds |
| Card | #FFFFFF | `bg-card` | Card surfaces |
| Muted | #F3F4F6 | `bg-muted` | Subtle backgrounds |
| Border | #E5E7EB | `border-border` | Dividers, borders |
| Muted Foreground | #6B7280 | `text-muted-foreground` | Secondary text |
| Foreground | #111827 | `text-foreground` | Primary text |

## Typography

**Font Family:** Nunito Sans

```tsx
// Headings
<h1 className="text-4xl font-bold">Heading 1</h1>
<h2 className="text-3xl font-semibold">Heading 2</h2>
<h3 className="text-2xl font-semibold">Heading 3</h3>
<h4 className="text-xl font-semibold">Heading 4</h4>
<h5 className="text-lg font-medium">Heading 5</h5>
<h6 className="text-base font-medium">Heading 6</h6>

// Body text
<p className="text-lg">Large body text</p>
<p className="text-base">Default body text</p>
<p className="text-sm">Small text</p>
<p className="text-xs">Extra small text</p>
```

## Component Usage

### Button

```tsx
import { Button } from "@/components/ui";

// Primary button (default)
<Button>Primary Action</Button>

// Secondary (outline with primary border)
<Button variant="secondary">Secondary</Button>

// Outline
<Button variant="outline">Outline</Button>

// Ghost
<Button variant="ghost">Ghost</Button>

// Destructive
<Button variant="destructive">Delete</Button>

// Premium
<Button variant="premium">Upgrade</Button>

// Loading state
<Button loading>Saving...</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### FloatingLabelInput

```tsx
import { FloatingLabelInput, FloatingLabelTextarea } from "@/components/ui";

// Basic input
<FloatingLabelInput label="Email Address" type="email" />

// With error
<FloatingLabelInput 
  label="Password" 
  type="password" 
  error="Password is required" 
/>

// With success
<FloatingLabelInput label="Username" success={true} />

// Textarea
<FloatingLabelTextarea label="Description" />
```

### Badge

```tsx
import { Badge } from "@/components/ui";

// Status badges
<Badge variant="success">Completed</Badge>
<Badge variant="warning">In Progress</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="info">Pending</Badge>
<Badge variant="premium">Premium</Badge>

// Removable badge
<Badge removable onRemove={() => {}}>Tag</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="default">Default</Badge>
<Badge size="lg">Large</Badge>
```

### Alert

```tsx
import { Alert, AlertTitle, AlertDescription, AlertIcon } from "@/components/ui";

<Alert variant="info">
  <AlertIcon variant="info" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>This is an informational message.</AlertDescription>
</Alert>

<Alert variant="success">
  <AlertIcon variant="success" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Your changes have been saved.</AlertDescription>
</Alert>

<Alert variant="warning">
  <AlertIcon variant="warning" />
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>Please review before proceeding.</AlertDescription>
</Alert>

<Alert variant="destructive" dismissible onDismiss={() => {}}>
  <AlertIcon variant="destructive" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Dialog

```tsx
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose 
} from "@/components/ui";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent size="md">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    <div>Content here</div>
    <DialogFooter>
      <DialogClose><Button variant="outline">Cancel</Button></DialogClose>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Selection Controls

```tsx
import { Checkbox, CheckboxWithLabel, RadioGroup, RadioGroupItem, Switch, SwitchWithLabel } from "@/components/ui";

// Checkbox
<Checkbox id="terms" />
<CheckboxWithLabel label="Accept terms" description="Optional description" />

// Radio Group
<RadioGroup defaultValue="option1" onValueChange={(v) => console.log(v)}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="option1" />
    <label htmlFor="option1">Option 1</label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option2" id="option2" />
    <label htmlFor="option2">Option 2</label>
  </div>
</RadioGroup>

// Switch
<Switch />
<SwitchWithLabel label="Enable notifications" description="Get email alerts" />
```

### Select

```tsx
import { Select, SelectOption, SelectGroup } from "@/components/ui";

<Select label="Department" error="Required">
  <SelectOption value="">Select...</SelectOption>
  <SelectOption value="eng">Engineering</SelectOption>
  <SelectOption value="design">Design</SelectOption>
</Select>
```

### Loading Components

```tsx
import { Spinner, CenteredSpinner, PageLoader, DotsLoader, Skeleton, Progress } from "@/components/ui";

// Spinner
<Spinner size="default" label="Loading..." />

// Centered spinner
<CenteredSpinner size="lg" />

// Page loader (full screen)
<PageLoader label="Loading application..." />

// Dots loader
<DotsLoader />

// Skeleton
<Skeleton className="h-4 w-[200px]" />

// Progress bar
<Progress value={60} max={100} showLabel variant="success" />
```

### Avatar

```tsx
import { Avatar, AvatarImage, AvatarFallback, getInitials } from "@/components/ui";

<Avatar size="lg">
  <AvatarImage src="/photo.jpg" alt="User" />
  <AvatarFallback>{getInitials("John Doe")}</AvatarFallback>
</Avatar>
```

## Guidelines

### Do's
- Always use design system components - no one-off styling
- Use design tokens for colors, spacing, and typography
- Follow the button hierarchy: Primary > Secondary > Ghost
- Use appropriate status colors for feedback

### Don'ts
- Don't use hardcoded hex colors - use CSS variables/Tailwind classes
- Don't create custom button styles - use variants
- Don't skip focus states - all interactive elements need focus rings
- Don't use inline styles for design system concerns
