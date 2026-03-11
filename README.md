# 🎨 Mercadinho Connect Design System v1.0.0

Professional, production-ready design system for Mercadinho ecommerce platform.

## Installation

```bash
npm install @mercadinho/design-system
```

## Quick Start

### 1. Import CSS Variables
```tsx
import '@mercadinho/design-system/src/styles/design-system.css';
```

### 2. Use Components
```tsx
import { Button, Card, Input, Badge } from '@mercadinho/design-system';

export default function App() {
  return (
    <Card>
      <h2>Welcome</h2>
      <Input label="Email" type="email" required />
      <Button variant="primary">Submit</Button>
      <Badge variant="success">Active</Badge>
    </Card>
  );
}
```

## Features

✅ **Colors** - Professional palette (iOS Blue primary, iOS Green secondary)  
✅ **Typography** - 6-step font scale with 3 weights  
✅ **Spacing** - 4px base unit system  
✅ **Components** - 8 core components with full variants  
✅ **Dark Mode** - Full color override support  
✅ **Accessibility** - WCAG AA compliant (4.5:1 contrast)  
✅ **TypeScript** - Strict types, zero `any`  
✅ **Responsive** - Mobile-first design  

## Components

- **Button** - Primary, secondary, tertiary, outline, ghost, danger (sizes: sm, md, lg)
- **Card** - Composable with Header, Content, Footer
- **Input** - Text input with label, error, helper text
- **Badge** - Status indicators (5 variants)
- **Skeleton** - Loading placeholder
- **Spinner** - Loading animation
- **Modal** - Dialog with 3 sizes
- **BottomNavigation** - Mobile navigation template

## CSS Variables

All components use CSS custom properties for theming:

```css
:root {
  --color-primary: #007aff;
  --color-secondary: #34c759;
  --font-size-base: 1rem;
  --space-4: 1rem;
  /* 80+ more variables */
}
```

## Dark Mode

Enable by adding `data-theme="dark"` to `<html>`:

```tsx
<html data-theme="dark">
  <body>{/* Your app */}</body>
</html>
```

## Storybook

View all components interactively:

```bash
npm run storybook
```

## Design Principles

1. **Mobile First** - Design for smallest screen, scale up
2. **Performance** - GPU-accelerated animations
3. **Accessibility** - WCAG AA minimum
4. **Simplicity** - CSS variables for easy theming
5. **Consistency** - All tokens derived from base system

## Documentation

See `DESIGN_SYSTEM.md` for complete design token reference.

## License

MIT

---

**Built for Mercadinho Connect** 🚀  
Created: 2026-03-10  
Version: 1.0.0
