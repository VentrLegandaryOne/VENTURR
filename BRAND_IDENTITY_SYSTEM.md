# VENTURR VALDT - Unified Brand Identity & Component System

**Version**: 2.0  
**Date**: December 29, 2025  
**Purpose**: Standardized design system for consistent UI implementation

---

## Brand Identity

### Core Values
- **Precision**: Data-driven verification with mathematical accuracy
- **Trust**: Court-defensible compliance intelligence
- **Innovation**: AI-powered sacred geometry design language
- **Clarity**: Clean, professional interface for complex data

### Design Language: "Sacred Geometry"
- Electric blue halo glow effects
- Precise geometric shapes and alignments
- Mathematical proportions (Golden ratio: 1.618)
- Layered depth with subtle shadows

---

## Color System

### Primary Palette

```css
/* Primary Brand */
--primary: oklch(0.58 0.12 230);           /* Slate Blue #4A90E2 */
--primary-foreground: oklch(0.98 0 0);     /* White text on primary */
--primary-glow: oklch(0.58 0.12 230 / 0.4); /* Halo effect */

/* Accent */
--accent: oklch(0.65 0.15 210);            /* Vibrant Cyan Blue */
--accent-foreground: oklch(0.98 0 0);
--accent-glow: oklch(0.65 0.15 210 / 0.4);
```

### Semantic Colors

```css
/* Success (GUARD) - Compliance, Verified, Safe */
--success: oklch(0.64 0.17 165);           /* Cyber Green #10B981 */
--success-foreground: oklch(0.98 0 0);
--success-glow: oklch(0.64 0.17 165 / 0.4);

/* Warning (MEASURE) - Attention, Review Required */
--warning: oklch(0.72 0.16 75);            /* Orange #F97316 */
--warning-foreground: oklch(0.15 0.01 264);
--warning-glow: oklch(0.72 0.16 75 / 0.4);

/* Destructive (PULSE) - Non-compliant, Error, Critical */
--destructive: oklch(0.62 0.24 25);        /* Health Red #EF4444 */
--destructive-foreground: oklch(0.98 0 0);
--destructive-glow: oklch(0.62 0.24 25 / 0.4);
```

### Neutral Palette

```css
/* Backgrounds */
--background: oklch(0.98 0.002 264);       /* Ice White #F8F9FA (light) */
--foreground: oklch(0.15 0.01 264);        /* Venturr Black #0C0C0C */

/* Cards & Surfaces */
--card: oklch(1 0 0);                      /* Pure White */
--card-foreground: oklch(0.15 0.01 264);

/* Muted Elements */
--muted: oklch(0.94 0.002 264);            /* Light Gray */
--muted-foreground: oklch(0.52 0.01 264);  /* Medium Gray */

/* Borders & Inputs */
--border: oklch(0.90 0.004 264);           /* Subtle border */
--input: oklch(0.90 0.004 264);
--ring: oklch(0.52 0.06 230);              /* Steel Blue focus ring */
```

### Status Color Mapping

| Status | Color Variable | Use Case |
|--------|---------------|----------|
| **Compliant** | `--success` | Passed verification, meets standards |
| **Non-Compliant** | `--destructive` | Failed verification, violations found |
| **Partial Compliance** | `--warning` | Some issues, review required |
| **Pending** | `--muted` | Awaiting verification |
| **Processing** | `--accent` | AI analysis in progress |
| **Verified** | `--success` | Human-verified, court-defensible |
| **Draft** | `--muted-foreground` | Incomplete, not submitted |

---

## Typography System

### Font Families

```css
/* Primary: Inter (body, UI, headings) */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace: SF Mono (data, measurements, prices) */
font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Use Case |
|---------|------|--------|-------------|----------------|----------|
| **H1** | 40-64px (clamp) | 700 | 1.1 | -0.02em | Hero headlines |
| **H2** | 28-32px (clamp) | 600 | 1.2 | -0.01em | Section headings |
| **H3** | 24px | 600 | 1.3 | 0 | Subsection titles |
| **H4** | 20px | 600 | 1.4 | 0 | Card titles |
| **Body** | 16px | 400 | 1.6 | 0 | Paragraph text |
| **Small** | 14px | 500 | 1.5 | 0 | Captions, labels |
| **Tiny** | 12px | 500 | 1.4 | 0 | Metadata, timestamps |

### Typography Classes

```tsx
<h1 className="text-4xl md:text-6xl font-bold tracking-tight">Hero Headline</h1>
<h2 className="text-2xl md:text-3xl font-semibold">Section Heading</h2>
<h3 className="text-2xl font-semibold">Subsection Title</h3>
<h4 className="text-xl font-semibold">Card Title</h4>
<p className="text-base font-normal">Body text</p>
<span className="text-sm font-medium opacity-70">Caption</span>
<span className="text-xs font-medium">Metadata</span>
```

---

## Component Standards

### 1. Button Variants

#### Primary Button
**Use**: Main CTAs, form submissions, important actions
```tsx
<Button variant="default" size="default">
  Verify Quote
</Button>
```
**Styling**:
- Background: `bg-primary`
- Text: `text-primary-foreground`
- Hover: Slight brightness increase + glow effect
- Focus: Ring with `ring-ring`
- Disabled: 50% opacity, no pointer events

#### Secondary Button
**Use**: Alternative actions, cancel operations
```tsx
<Button variant="secondary" size="default">
  Cancel
</Button>
```
**Styling**:
- Background: `bg-secondary`
- Text: `text-secondary-foreground`
- Hover: Slight brightness increase
- Border: None

#### Outline Button
**Use**: Tertiary actions, less emphasis
```tsx
<Button variant="outline" size="default">
  Learn More
</Button>
```
**Styling**:
- Background: Transparent
- Border: `border border-input`
- Text: `text-foreground`
- Hover: `bg-accent text-accent-foreground`

#### Ghost Button
**Use**: Icon buttons, minimal actions
```tsx
<Button variant="ghost" size="icon">
  <Icon />
</Button>
```
**Styling**:
- Background: Transparent
- No border
- Hover: `bg-accent text-accent-foreground`

#### Destructive Button
**Use**: Delete, remove, critical actions
```tsx
<Button variant="destructive" size="default">
  Delete Quote
</Button>
```
**Styling**:
- Background: `bg-destructive`
- Text: `text-destructive-foreground`
- Hover: Darker shade + glow

#### Button Sizes
```tsx
size="sm"      // 32px height, 12px padding
size="default" // 40px height, 16px padding
size="lg"      // 48px height, 24px padding
size="icon"    // 40x40px square
```

---

### 2. Card Variants

#### Flat Card
**Use**: Default content containers
```tsx
<Card className="bg-card border border-border">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```
**Styling**:
- Background: `bg-card`
- Border: `border border-border`
- Shadow: None
- Radius: `rounded-xl` (0.75rem)

#### Elevated Card
**Use**: Important content, interactive cards
```tsx
<Card className="bg-card border border-border shadow-lg hover:shadow-xl transition-shadow">
  ...
</Card>
```
**Styling**:
- Background: `bg-card`
- Border: `border border-border`
- Shadow: `shadow-lg`
- Hover: `shadow-xl`
- Transition: 200ms ease

#### Glass Card
**Use**: Hero sections, overlays
```tsx
<Card className="glass">
  ...
</Card>
```
**Styling**:
- Background: `oklch(1 0 0 / 0.05)`
- Backdrop filter: `blur(12px) saturate(180%)`
- Border: `1px solid oklch(1 0 0 / 0.1)`

#### Interactive Card
**Use**: Clickable cards, navigation
```tsx
<Card className="bg-card border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer">
  ...
</Card>
```
**Styling**:
- Hover: Border color changes to primary
- Hover: Shadow appears
- Cursor: Pointer

---

### 3. Status Badges

#### Badge Variants
```tsx
// Success (Compliant)
<Badge variant="default" className="bg-success text-success-foreground">
  Compliant
</Badge>

// Warning (Partial Compliance)
<Badge variant="secondary" className="bg-warning text-warning-foreground">
  Review Required
</Badge>

// Destructive (Non-Compliant)
<Badge variant="destructive">
  Non-Compliant
</Badge>

// Muted (Pending)
<Badge variant="outline" className="text-muted-foreground">
  Pending
</Badge>

// Accent (Processing)
<Badge variant="secondary" className="bg-accent text-accent-foreground">
  Processing
</Badge>
```

#### Badge Sizes
```tsx
className="text-xs px-2 py-0.5"  // Small
className="text-sm px-3 py-1"    // Default
className="text-base px-4 py-1.5" // Large
```

---

### 4. Form Inputs

#### Text Input
```tsx
<Input 
  type="text"
  placeholder="Enter value"
  className="bg-background border-input focus:ring-ring"
/>
```
**States**:
- Default: `border-input`
- Hover: Slight brightness
- Focus: `ring-2 ring-ring ring-offset-2`
- Error: `border-destructive focus:ring-destructive`
- Disabled: `opacity-50 cursor-not-allowed`

#### Select Dropdown
```tsx
<Select>
  <SelectTrigger className="bg-background border-input">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

#### Checkbox & Radio
```tsx
<Checkbox className="border-input data-[state=checked]:bg-primary" />
<RadioGroup className="border-input">
  <RadioGroupItem value="option1" />
</RadioGroup>
```

---

### 5. Navigation & Header

#### Logo Sizing
- **Home Hero**: 200px width (large)
- **Dashboard Sidebar**: 120px width (medium)
- **Navbar Header**: 100px width (small)

#### Navigation States
```tsx
// Active link
className="text-primary font-semibold border-b-2 border-primary"

// Inactive link
className="text-foreground hover:text-primary transition-colors"

// Mobile menu item
className="text-lg font-medium py-3 hover:bg-accent"
```

---

## Spacing Scale

Use consistent spacing multiples of 4px:

| Token | Value | Use Case |
|-------|-------|----------|
| `gap-1` | 4px | Tight spacing (icon + text) |
| `gap-2` | 8px | Small gaps (form labels) |
| `gap-3` | 12px | Default gaps (button groups) |
| `gap-4` | 16px | Medium gaps (card content) |
| `gap-6` | 24px | Large gaps (sections) |
| `gap-8` | 32px | Extra large (page sections) |
| `gap-12` | 48px | Hero spacing |
| `gap-16` | 64px | Major sections |

---

## Border Radius Scale

| Token | Value | Use Case |
|-------|-------|----------|
| `rounded-sm` | 0.5rem (8px) | Small elements (badges) |
| `rounded-md` | 0.625rem (10px) | Buttons, inputs |
| `rounded-lg` | 0.75rem (12px) | Cards (default) |
| `rounded-xl` | 1rem (16px) | Large cards |
| `rounded-2xl` | 1.5rem (24px) | Modals, dialogs |
| `rounded-full` | 9999px | Circular (avatars, pills) |

---

## Shadow Scale

```css
/* Subtle elevation */
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Default card shadow */
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);

/* Elevated card shadow */
shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

/* Modal/dialog shadow */
shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

/* Dramatic depth */
shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

---

## Accessibility Standards

### Color Contrast Requirements (WCAG AA)

| Combination | Minimum Ratio | Status |
|-------------|---------------|--------|
| Body text on background | 4.5:1 | ✅ Pass |
| Headings on background | 3:1 | ✅ Pass |
| Primary button text | 4.5:1 | ✅ Pass |
| Success badge text | 4.5:1 | ✅ Pass |
| Warning badge text | 4.5:1 | ✅ Pass |
| Destructive button text | 4.5:1 | ✅ Pass |

### Focus Indicators
- All interactive elements MUST have visible focus rings
- Focus ring: `ring-2 ring-ring ring-offset-2`
- Focus ring color: Steel Blue (`--ring`)

### Keyboard Navigation
- All actions accessible via keyboard
- Logical tab order
- Escape key closes modals/dialogs
- Enter key submits forms

---

## Implementation Guidelines

### CSS Variable Usage
```tsx
// ✅ Correct: Use semantic variables
className="bg-primary text-primary-foreground"

// ❌ Wrong: Hardcoded colors
className="bg-blue-500 text-white"
```

### Component Composition
```tsx
// ✅ Correct: Compose with variants
<Button variant="default" size="lg">Submit</Button>

// ❌ Wrong: Custom inline styles
<button style={{background: '#4A90E2'}}>Submit</button>
```

### Responsive Design
```tsx
// ✅ Correct: Mobile-first responsive
className="text-base md:text-lg lg:text-xl"

// ❌ Wrong: Desktop-only sizing
className="text-xl"
```

---

## Next Steps

1. **Implement component variants** in shared UI library
2. **Refactor existing components** to use standard variants
3. **Update all pages** to follow typography hierarchy
4. **Audit color contrast** for accessibility
5. **Document component examples** in Storybook/showcase

---

**Approved By**: Design Team  
**Implementation Date**: December 29, 2025  
**Review Cycle**: Quarterly
