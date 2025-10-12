/**
 * Animation Configuration
 * Global settings and utilities for animation behavior
 *
 * Features:
 * - Accessibility support for prefers-reduced-motion
 * - Animation state management
 * - Performance optimization helpers
 */

/**
 * Check if user prefers reduced motion (accessibility)
 * Returns true if animations should be disabled or minimized
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation duration based on user preferences
 * Returns minimal duration if user prefers reduced motion
 *
 * @param defaultDuration - The default duration in milliseconds
 * @returns Duration in milliseconds
 */
export function getAnimationDuration(defaultDuration: number): number {
  return prefersReducedMotion() ? 1 : defaultDuration;
}

/**
 * Animation Configuration Object
 * Use this to conditionally enable/disable animations
 */
export class AnimationConfig {
  private static _enabled = true;
  private static _respectsReducedMotion = true;

  /**
   * Check if animations are globally enabled
   */
  static get enabled(): boolean {
    if (this._respectsReducedMotion && prefersReducedMotion()) {
      return false;
    }
    return this._enabled;
  }

  /**
   * Enable or disable animations globally
   * @param value - true to enable, false to disable
   */
  static setEnabled(value: boolean): void {
    this._enabled = value;
  }

  /**
   * Set whether to respect user's prefers-reduced-motion setting
   * @param value - true to respect (default), false to ignore
   */
  static setRespectsReducedMotion(value: boolean): void {
    this._respectsReducedMotion = value;
  }

  /**
   * Get animation state for Angular animation triggers
   * Returns void if animations disabled, allowing animations to skip
   */
  static getState(state: string): string | void {
    return this.enabled ? state : undefined;
  }

  /**
   * Get duration with accessibility check
   * @param duration - Duration in milliseconds
   * @returns Adjusted duration based on user preferences
   */
  static getDuration(duration: number): number {
    return getAnimationDuration(duration);
  }
}

/**
 * Animation Performance Helper
 * Utilities for optimizing animation performance
 */
export class AnimationPerformance {
  /**
   * Request animation frame wrapper with fallback
   * @param callback - Function to execute on next frame
   * @returns RequestID for cancellation
   */
  static requestFrame(callback: FrameRequestCallback): number {
    if (typeof window === 'undefined') {
      return 0;
    }

    return (
      window.requestAnimationFrame ||
      ((cb: FrameRequestCallback) => window.setTimeout(cb, 16))
    )(callback);
  }

  /**
   * Cancel animation frame with fallback
   * @param id - RequestID from requestFrame
   */
  static cancelFrame(id: number): void {
    if (typeof window === 'undefined') {
      return;
    }

    (window.cancelAnimationFrame || window.clearTimeout)(id);
  }

  /**
   * Debounce animation callback
   * Useful for scroll/resize event animations
   *
   * @param callback - Function to debounce
   * @param delay - Delay in milliseconds (default: 100)
   * @returns Debounced function
   */
  static debounce<T extends (...args: unknown[]) => void>(
    callback: T,
    delay = 100
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(...args), delay);
    };
  }

  /**
   * Throttle animation callback
   * Ensures function executes at most once per interval
   *
   * @param callback - Function to throttle
   * @param interval - Interval in milliseconds (default: 100)
   * @returns Throttled function
   */
  static throttle<T extends (...args: unknown[]) => void>(
    callback: T,
    interval = 100
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;

    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= interval) {
        lastCall = now;
        callback(...args);
      }
    };
  }

  /**
   * Check if browser supports specific CSS property
   * @param property - CSS property to check
   * @returns true if supported
   */
  static supportsProperty(property: string): boolean {
    if (typeof window === 'undefined' || !window.CSS) {
      return false;
    }

    return window.CSS.supports(property, 'initial');
  }

  /**
   * Check if GPU acceleration is available
   * @returns true if GPU acceleration is likely available
   */
  static hasGPUAcceleration(): boolean {
    return this.supportsProperty('transform: translateZ(0)');
  }

  /**
   * Force GPU acceleration on element
   * Adds transform: translateZ(0) to trigger GPU rendering
   * Only use when necessary for performance-critical animations
   *
   * @param element - HTMLElement to optimize
   */
  static forceGPUAcceleration(element: HTMLElement): void {
    if (this.hasGPUAcceleration()) {
      element.style.transform = 'translateZ(0)';
      element.style.willChange = 'transform';
    }
  }

  /**
   * Remove GPU acceleration optimization
   * @param element - HTMLElement to restore
   */
  static removeGPUAcceleration(element: HTMLElement): void {
    element.style.transform = '';
    element.style.willChange = '';
  }
}

/**
 * Animation State Manager
 * Helper for managing component animation states
 */
export class AnimationStateManager {
  private states: Map<string, string> = new Map();

  /**
   * Set animation state
   * @param key - State identifier
   * @param value - State value
   */
  setState(key: string, value: string): void {
    this.states.set(key, value);
  }

  /**
   * Get animation state
   * @param key - State identifier
   * @returns State value or undefined
   */
  getState(key: string): string | undefined {
    return this.states.get(key);
  }

  /**
   * Toggle between two states
   * @param key - State identifier
   * @param stateA - First state
   * @param stateB - Second state
   * @returns New state value
   */
  toggleState(key: string, stateA: string, stateB: string): string {
    const current = this.getState(key);
    const newState = current === stateA ? stateB : stateA;
    this.setState(key, newState);
    return newState;
  }

  /**
   * Clear all states
   */
  clear(): void {
    this.states.clear();
  }

  /**
   * Remove specific state
   * @param key - State identifier
   */
  remove(key: string): void {
    this.states.delete(key);
  }
}

/**
 * Stagger Animation Helper
 * Calculate stagger delays for list animations
 */
export class StaggerHelper {
  /**
   * Calculate stagger delay for item at index
   * @param index - Item index (0-based)
   * @param baseDelay - Base delay between items in ms (default: 50)
   * @param maxDelay - Maximum total delay in ms (default: 500)
   * @returns Delay in milliseconds
   */
  static getDelay(
    index: number,
    baseDelay = 50,
    maxDelay = 500
  ): number {
    const delay = index * baseDelay;
    return Math.min(delay, maxDelay);
  }

  /**
   * Get delay as string for CSS
   * @param index - Item index (0-based)
   * @param baseDelay - Base delay between items in ms (default: 50)
   * @param maxDelay - Maximum total delay in ms (default: 500)
   * @returns Delay string (e.g., "100ms")
   */
  static getDelayString(
    index: number,
    baseDelay = 50,
    maxDelay = 500
  ): string {
    return `${this.getDelay(index, baseDelay, maxDelay)}ms`;
  }

  /**
   * Generate stagger delays for array of items
   * @param count - Number of items
   * @param baseDelay - Base delay between items in ms (default: 50)
   * @param maxDelay - Maximum total delay in ms (default: 500)
   * @returns Array of delays in milliseconds
   */
  static generateDelays(
    count: number,
    baseDelay = 50,
    maxDelay = 500
  ): number[] {
    return Array.from({ length: count }, (_, i) =>
      this.getDelay(i, baseDelay, maxDelay)
    );
  }
}

/**
 * Animation Easing Presets
 * Standard easing functions for consistent animations
 */
export const AnimationEasings = {
  // Material Design standard easing
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',

  // Deceleration curves (ease-out)
  deceleration: 'cubic-bezier(0.0, 0.0, 0.2, 1)',

  // Acceleration curves (ease-in)
  acceleration: 'cubic-bezier(0.4, 0.0, 1, 1)',

  // Sharp curve for exiting elements
  sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',

  // Smooth curves
  easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',

  // Linear
  linear: 'linear',

  // Bounce effects
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  // Elastic effect
  elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
} as const;

/**
 * Animation Duration Presets
 * Standard durations in milliseconds
 */
export const AnimationDurations = {
  instant: 0,
  fast: 200,
  normal: 300,
  slow: 400,
  slower: 600,
  slowest: 800,
} as const;

/**
 * Export default configuration
 */
export const animationConfig = {
  Config: AnimationConfig,
  Performance: AnimationPerformance,
  StateManager: AnimationStateManager,
  Stagger: StaggerHelper,
  Easings: AnimationEasings,
  Durations: AnimationDurations,
  prefersReducedMotion,
  getAnimationDuration,
};

export default animationConfig;
