/**
 * Animation Utilities Index
 * Central export point for all animation utilities
 *
 * Usage:
 * import { fadeIn, slideInLeft, AnimationConfig } from '@app/shared/animations';
 */

// Core Animations
export * from './core-animations';

// Route Animations
export * from './route-animations';

// Animation Configuration & Utilities
export * from './animation.config';

/**
 * Convenience export for all animations
 * Use when you need access to all animation triggers
 */
import * as CoreAnimations from './core-animations';
import * as RouteAnimations from './route-animations';

export const AllAnimations = {
  ...CoreAnimations,
  ...RouteAnimations,
};

/**
 * Common animation sets for typical use cases
 */

// Basic Animations - Most commonly used
export const BasicAnimations = [
  CoreAnimations.fadeIn,
  CoreAnimations.fadeOut,
  CoreAnimations.fade,
  CoreAnimations.slideInLeft,
  CoreAnimations.slideInRight,
  CoreAnimations.scaleUp,
  CoreAnimations.scaleDown,
];

// List Animations - For dynamic lists
export const ListAnimations = [
  CoreAnimations.listStagger,
  CoreAnimations.listItem,
  CoreAnimations.staggerFade,
];

// Page Animations - For full page components
export const PageAnimations = [
  CoreAnimations.fadeIn,
  CoreAnimations.slideAndFadeBottom,
  CoreAnimations.scaleUp,
];

// Card Animations - For card components
export const CardAnimations = [
  CoreAnimations.scale,
  CoreAnimations.slideAndFadeLeft,
  CoreAnimations.slideAndFadeRight,
];

// Form Animations - For forms and inputs
export const FormAnimations = [
  CoreAnimations.fade,
  CoreAnimations.shake,
  CoreAnimations.expandCollapse,
];

// Feedback Animations - For user feedback
export const FeedbackAnimations = [
  CoreAnimations.shake,
  CoreAnimations.bounce,
  CoreAnimations.pulse,
];

// Navigation Animations - For route transitions
export const NavigationAnimations = [
  RouteAnimations.routeSlide,
  RouteAnimations.routeFade,
  RouteAnimations.routeSlideAndFade,
];

/**
 * Quick Start Animation Sets
 * Pre-configured animation arrays for common scenarios
 */
export const AnimationSets = {
  basic: BasicAnimations,
  list: ListAnimations,
  page: PageAnimations,
  card: CardAnimations,
  form: FormAnimations,
  feedback: FeedbackAnimations,
  navigation: NavigationAnimations,
  all: Object.values(AllAnimations),
};
