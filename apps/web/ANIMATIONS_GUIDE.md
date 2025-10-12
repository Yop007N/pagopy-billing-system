# PagoPy Animation System Guide

## Overview

This guide covers the comprehensive animation system implemented for the PagoPy web application. The system provides smooth, performant, and accessible animations throughout the application.

## Files Created

### Animation Utilities
- `/apps/web/src/app/shared/animations/core-animations.ts` - Angular animation triggers
- `/apps/web/src/app/shared/animations/route-animations.ts` - Route transition animations
- `/apps/web/src/app/shared/animations/animation.config.ts` - Configuration and utilities
- `/apps/web/src/app/shared/animations/index.ts` - Barrel export file

### Global Styles
- `/apps/web/src/styles.scss` - Enhanced with CSS animation utilities

## Quick Start

### 1. Using Angular Animations in Components

```typescript
import { Component } from '@angular/core';
import { fadeIn, slideInLeft, listStagger } from '@app/shared/animations';

@Component({
  selector: 'app-example',
  standalone: true,
  animations: [fadeIn, slideInLeft, listStagger],
  template: `
    <div [@fadeIn]>
      <h1 [@slideInLeft]>Welcome to PagoPy</h1>
      <ul [@listStagger]>
        <li *ngFor="let item of items">{{ item }}</li>
      </ul>
    </div>
  `
})
export class ExampleComponent {
  items = ['Item 1', 'Item 2', 'Item 3'];
}
```

### 2. Using CSS Classes

```html
<!-- Hover effects -->
<mat-card class="card-interactive hover-lift">
  Card with lift effect on hover
</mat-card>

<!-- Transitions -->
<button class="transition-all hover-scale">
  Button with scale effect
</button>

<!-- Loading animations -->
<div class="animate-spin">Loading...</div>

<!-- Skeleton loader -->
<div class="skeleton" style="height: 20px; width: 200px;"></div>

<!-- Stagger animation -->
<div *ngFor="let item of items; let i = index"
     class="stagger-item">
  {{ item }}
</div>
```

### 3. Route Transitions

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { routeSlideAndFade } from '@app/shared/animations';

@Component({
  selector: 'app-root',
  animations: [routeSlideAndFade],
  template: `
    <div [@routeSlideAndFade]="prepareRoute(outlet)">
      <router-outlet #outlet="outlet"></router-outlet>
    </div>
  `
})
export class AppComponent {
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}

// app.routes.ts
export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    data: { animation: 'DashboardPage' }
  },
  {
    path: 'sales',
    component: SalesComponent,
    data: { animation: 'SalesPage' }
  }
];
```

## Available Angular Animations

### Fade Animations
- `fadeIn` - Fade in on enter
- `fadeOut` - Fade out on leave
- `fade` - Fade in/out on enter/leave

### Slide Animations
- `slideInLeft` - Slide in from left
- `slideInRight` - Slide in from right
- `slideInTop` - Slide in from top
- `slideInBottom` - Slide in from bottom
- `slideOutLeft` - Slide out to left
- `slideOutRight` - Slide out to right

### Scale Animations
- `scaleUp` - Scale up on enter
- `scaleDown` - Scale down on leave
- `scale` - Scale in/out on enter/leave

### Combined Animations
- `slideAndFadeLeft` - Slide + fade from left
- `slideAndFadeRight` - Slide + fade from right
- `slideAndFadeBottom` - Slide + fade from bottom

### List Animations
- `listStagger` - Stagger children on enter
- `listItem` - Individual list item animation
- `staggerFade` - Stagger fade for lists

### Interactive Animations
- `expandCollapse` - Expand/collapse with height animation
- `heightAnimation` - Smooth height changes
- `rotate` - Rotate 180 degrees
- `rotate90` - Rotate 90 degrees

### Feedback Animations
- `shake` - Shake for errors
- `pulse` - Pulse for emphasis
- `bounce` - Bounce effect
- `flip` - 3D flip effect

## Route Animations

### Available Route Transitions
- `routeSlide` - Slide left/right
- `routeFade` - Simple crossfade
- `routeScale` - Scale up/down
- `routeSlideUp` - Slide up from bottom
- `routeSlideAndFade` - Slide + fade (recommended)
- `routeZoom` - Zoom in/out
- `routeFlip` - 3D flip
- `routeMinimal` - Subtle fade (performance-focused)

## CSS Animation Utilities

### Transition Classes
- `.transition-all` - Transition all properties
- `.transition-fast` - Fast transition (200ms)
- `.transition-normal` - Normal transition (300ms)
- `.transition-slow` - Slow transition (400ms)
- `.transition-colors` - Transition colors only
- `.transition-opacity` - Transition opacity only
- `.transition-transform` - Transition transform only
- `.transition-shadow` - Transition shadow only

### Hover Effects
- `.hover-lift` - Lifts element up with shadow
- `.hover-scale` - Scales element to 1.05
- `.hover-brightness` - Increases brightness
- `.hover-opacity` - Reduces opacity to 0.8

### Component-Specific Classes
- `.btn-ripple` - Button with ripple and scale effect
- `.card-interactive` - Card with lift and shadow
- `.input-focus-effect` - Input with focus animation
- `.focus-ring` - Animated focus ring

### Loading Animations
- `.animate-spin` - Spinning animation
- `.animate-pulse` - Pulsing opacity
- `.animate-bounce` - Bouncing animation
- `.animate-shimmer` - Shimmer effect
- `.skeleton` - Skeleton loading screen

### Entry Animations
- `.fade-enter` - Fade in
- `.fade-exit` - Fade out
- `.slide-in-left` - Slide from left
- `.slide-in-right` - Slide from right
- `.slide-in-up` - Slide from bottom
- `.slide-in-down` - Slide from top
- `.scale-in` - Scale up

### Feedback Animations
- `.success-pulse` - Green pulse for success
- `.error-shake` - Shake for errors

### Stagger Items
- `.stagger-item` - Auto-stagger with nth-child delays

## Animation Configuration

### Check User Preferences

```typescript
import { AnimationConfig, prefersReducedMotion } from '@app/shared/animations';

// Check if user prefers reduced motion
if (prefersReducedMotion()) {
  console.log('User prefers reduced motion');
}

// Disable animations globally
AnimationConfig.setEnabled(false);

// Get adjusted duration
const duration = AnimationConfig.getDuration(300); // Returns 1ms if reduced motion
```

### Performance Utilities

```typescript
import { AnimationPerformance } from '@app/shared/animations';

// Request animation frame
const frameId = AnimationPerformance.requestFrame(() => {
  // Animation code
});

// Cancel frame
AnimationPerformance.cancelFrame(frameId);

// Debounce animations on scroll
const debouncedScroll = AnimationPerformance.debounce(() => {
  // Animation on scroll
}, 100);

window.addEventListener('scroll', debouncedScroll);

// Throttle animations
const throttledResize = AnimationPerformance.throttle(() => {
  // Animation on resize
}, 100);

window.addEventListener('resize', throttledResize);

// Force GPU acceleration (use sparingly)
const element = document.querySelector('.heavy-animation');
AnimationPerformance.forceGPUAcceleration(element);
```

### Stagger Helpers

```typescript
import { StaggerHelper } from '@app/shared/animations';

// Get delay for item at index 5
const delay = StaggerHelper.getDelay(5); // 250ms (5 * 50ms)

// Get delay as CSS string
const delayString = StaggerHelper.getDelayString(3); // "150ms"

// Generate delays for 10 items
const delays = StaggerHelper.generateDelays(10);
// [0, 50, 100, 150, 200, 250, 300, 350, 400, 450]
```

### Animation State Manager

```typescript
import { AnimationStateManager } from '@app/shared/animations';

export class MyComponent {
  stateManager = new AnimationStateManager();

  togglePanel() {
    const newState = this.stateManager.toggleState(
      'panel',
      'collapsed',
      'expanded'
    );
    console.log('Panel is now:', newState);
  }

  getPanelState() {
    return this.stateManager.getState('panel') || 'collapsed';
  }
}
```

## Animation Presets

### Using Pre-configured Sets

```typescript
import { AnimationSets } from '@app/shared/animations';

@Component({
  animations: AnimationSets.page, // Includes fadeIn, slideAndFadeBottom, scaleUp
})
export class PageComponent {}

@Component({
  animations: AnimationSets.list, // Includes listStagger, listItem, staggerFade
})
export class ListComponent {}

@Component({
  animations: AnimationSets.card, // Includes scale, slideAndFadeLeft, slideAndFadeRight
})
export class CardComponent {}
```

Available sets:
- `AnimationSets.basic` - Common animations
- `AnimationSets.list` - List animations
- `AnimationSets.page` - Page entry animations
- `AnimationSets.card` - Card animations
- `AnimationSets.form` - Form animations
- `AnimationSets.feedback` - User feedback animations
- `AnimationSets.navigation` - Route transitions
- `AnimationSets.all` - All animations

## Accessibility

### Prefers Reduced Motion Support

The animation system automatically respects the user's `prefers-reduced-motion` setting:

1. **CSS Animations**: Automatically disabled via global media query
2. **Angular Animations**: Check with `AnimationConfig.enabled`
3. **JavaScript Animations**: Use `prefersReducedMotion()` function

Example:

```typescript
import { prefersReducedMotion, AnimationConfig } from '@app/shared/animations';

export class MyComponent implements OnInit {
  animationDuration = 300;

  ngOnInit() {
    // Adjust duration based on user preference
    if (prefersReducedMotion()) {
      this.animationDuration = 1;
    }

    // Or use helper
    this.animationDuration = AnimationConfig.getDuration(300);
  }
}
```

### Best Practices

1. **Always respect `prefers-reduced-motion`**
   - Use `AnimationConfig` for conditional animations
   - Test with reduced motion enabled

2. **Keep animations subtle**
   - Don't use excessive motion
   - Avoid jarring transitions

3. **Use appropriate durations**
   - Fast: 200ms for micro-interactions
   - Normal: 300ms for most transitions
   - Slow: 400-600ms for complex animations

4. **Test performance**
   - Use `AnimationPerformance` utilities
   - Monitor FPS during animations
   - Optimize heavy animations with GPU acceleration

## Performance Considerations

### Best Practices

1. **Use transform and opacity for smooth animations**
   - These properties are GPU-accelerated
   - Avoid animating width, height, or left/top

2. **Limit concurrent animations**
   - Don't animate too many elements at once
   - Use stagger for lists instead of all at once

3. **Use will-change sparingly**
   - Only for elements that will definitely animate
   - Remove after animation completes

4. **Debounce/throttle scroll/resize animations**
   - Use `AnimationPerformance.debounce()` or `throttle()`

5. **Test on low-end devices**
   - Mobile devices have less power
   - Consider disabling complex animations on mobile

## Examples

### Example 1: Animated Dashboard Cards

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fadeIn, scaleUp } from '@app/shared/animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  animations: [fadeIn, scaleUp],
  template: `
    <div class="grid gap-4" [@fadeIn]>
      <mat-card
        *ngFor="let card of cards"
        [@scaleUp]
        class="card-interactive">
        <mat-card-content>
          {{ card.title }}
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class DashboardComponent {
  cards = [
    { title: 'Total Sales' },
    { title: 'Active Orders' },
    { title: 'Revenue' }
  ];
}
```

### Example 2: Animated List with Stagger

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { listStagger } from '@app/shared/animations';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  animations: [listStagger],
  template: `
    <div [@listStagger]>
      <div
        *ngFor="let product of products"
        class="product-item card-interactive">
        {{ product.name }}
      </div>
    </div>
  `
})
export class ProductListComponent {
  products = [
    { name: 'Product 1' },
    { name: 'Product 2' },
    { name: 'Product 3' }
  ];
}
```

### Example 3: Form with Error Animation

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { shake } from '@app/shared/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  animations: [shake],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field
        class="input-focus-effect"
        [@shake]="errorState">
        <input matInput formControlName="email" placeholder="Email">
      </mat-form-field>
      <button type="submit" class="btn-ripple">Login</button>
    </form>
  `
})
export class LoginComponent {
  form: FormGroup;
  errorState = 'idle';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.errorState = 'shaking';
      setTimeout(() => this.errorState = 'idle', 600);
    }
  }
}
```

### Example 4: Expandable Panel

```typescript
import { Component } from '@angular/core';
import { expandCollapse } from '@app/shared/animations';

@Component({
  selector: 'app-accordion',
  animations: [expandCollapse],
  template: `
    <div class="accordion">
      <button (click)="isExpanded = !isExpanded" class="transition-all">
        {{ isExpanded ? 'Hide' : 'Show' }} Details
      </button>
      <div [@expandCollapse]="isExpanded ? 'expanded' : 'collapsed'">
        <p>Panel content goes here...</p>
      </div>
    </div>
  `
})
export class AccordionComponent {
  isExpanded = false;
}
```

## CSS Variables Reference

### Animation Durations
```css
--animation-duration-fast: 200ms
--animation-duration-normal: 300ms
--animation-duration-slow: 400ms
--animation-duration-slower: 600ms
```

### Animation Easings
```css
--animation-easing-standard: cubic-bezier(0.4, 0.0, 0.2, 1)
--animation-easing-ease-in: cubic-bezier(0.4, 0.0, 1, 1)
--animation-easing-ease-out: cubic-bezier(0.0, 0.0, 0.2, 1)
--animation-easing-ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1)
--animation-easing-sharp: cubic-bezier(0.4, 0.0, 0.6, 1)
```

## Troubleshooting

### Animations Not Working

1. **Check imports**: Ensure animations are imported in component
2. **Check BrowserAnimationsModule**: Ensure it's imported in app config
3. **Check reduced motion**: User might have animations disabled
4. **Check syntax**: Ensure [@animationName] syntax is correct

### Performance Issues

1. **Reduce concurrent animations**
2. **Use simpler transitions**
3. **Enable GPU acceleration for heavy animations**
4. **Test on actual devices, not just desktop**

### Accessibility Warnings

1. **Always test with prefers-reduced-motion enabled**
2. **Ensure animations don't convey critical information**
3. **Provide alternative feedback mechanisms**

## Resources

- [Angular Animations Documentation](https://angular.dev/guide/animations)
- [Material Design Motion Guidelines](https://m3.material.io/styles/motion)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [CSS Animations on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)

## Summary

The PagoPy animation system provides:

- 30+ Angular animation triggers
- 8 route transition options
- 40+ CSS utility classes
- Performance optimization tools
- Accessibility support
- TypeScript helpers and configuration

All animations respect user preferences and are optimized for performance. Use the pre-configured animation sets for quick implementation, or mix and match individual animations for custom behavior.
