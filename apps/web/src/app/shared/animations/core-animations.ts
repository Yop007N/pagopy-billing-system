/**
 * Core Animation Utilities
 * Provides reusable Angular animations for the PagoPy application
 *
 * Usage:
 * Import animations in component decorator:
 * @Component({
 *   animations: [fadeIn, slideInLeft, scaleUp]
 * })
 *
 * Use in template:
 * <div [@fadeIn]="state">Content</div>
 */

import {
  trigger,
  state,
  style,
  transition,
  animate,
  AnimationTriggerMetadata,
  query,
  stagger,
  keyframes,
  group,
} from '@angular/animations';

/**
 * Animation timing constants
 * Based on Material Design motion guidelines
 */
export const AnimationDurations = {
  fast: '200ms',
  normal: '300ms',
  slow: '400ms',
  slower: '600ms',
} as const;

export const AnimationEasings = {
  easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
} as const;

// ============================================================================
// FADE ANIMATIONS
// ============================================================================

/**
 * Fade In Animation
 * Usage: [@fadeIn]
 */
export const fadeIn: AnimationTriggerMetadata = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate(
      `${AnimationDurations.normal} ${AnimationEasings.easeOut}`,
      style({ opacity: 1 })
    ),
  ]),
]);

/**
 * Fade Out Animation
 * Usage: [@fadeOut]
 */
export const fadeOut: AnimationTriggerMetadata = trigger('fadeOut', [
  transition(':leave', [
    animate(
      `${AnimationDurations.fast} ${AnimationEasings.easeIn}`,
      style({ opacity: 0 })
    ),
  ]),
]);

/**
 * Fade In/Out Animation
 * Usage: [@fade]
 */
export const fade: AnimationTriggerMetadata = trigger('fade', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate(
      `${AnimationDurations.normal} ${AnimationEasings.easeOut}`,
      style({ opacity: 1 })
    ),
  ]),
  transition(':leave', [
    animate(
      `${AnimationDurations.fast} ${AnimationEasings.easeIn}`,
      style({ opacity: 0 })
    ),
  ]),
]);

// ============================================================================
// SLIDE ANIMATIONS
// ============================================================================

/**
 * Slide In from Left
 * Usage: [@slideInLeft]
 */
export const slideInLeft: AnimationTriggerMetadata = trigger('slideInLeft', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)', opacity: 0 }),
    animate(
      `${AnimationDurations.normal} ${AnimationEasings.easeOut}`,
      style({ transform: 'translateX(0)', opacity: 1 })
    ),
  ]),
]);

/**
 * Slide In from Right
 * Usage: [@slideInRight]
 */
export const slideInRight: AnimationTriggerMetadata = trigger('slideInRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate(
      `${AnimationDurations.normal} ${AnimationEasings.easeOut}`,
      style({ transform: 'translateX(0)', opacity: 1 })
    ),
  ]),
]);

/**
 * Slide In from Top
 * Usage: [@slideInTop]
 */
export const slideInTop: AnimationTriggerMetadata = trigger('slideInTop', [
  transition(':enter', [
    style({ transform: 'translateY(-100%)', opacity: 0 }),
    animate(
      `${AnimationDurations.normal} ${AnimationEasings.easeOut}`,
      style({ transform: 'translateY(0)', opacity: 1 })
    ),
  ]),
]);

/**
 * Slide In from Bottom
 * Usage: [@slideInBottom]
 */
export const slideInBottom: AnimationTriggerMetadata = trigger(
  'slideInBottom',
  [
    transition(':enter', [
      style({ transform: 'translateY(100%)', opacity: 0 }),
      animate(
        `${AnimationDurations.normal} ${AnimationEasings.easeOut}`,
        style({ transform: 'translateY(0)', opacity: 1 })
      ),
    ]),
  ]
);

/**
 * Slide Out to Right
 * Usage: [@slideOutRight]
 */
export const slideOutRight: AnimationTriggerMetadata = trigger(
  'slideOutRight',
  [
    transition(':leave', [
      animate(
        `${AnimationDurations.fast} ${AnimationEasings.easeIn}`,
        style({ transform: 'translateX(100%)', opacity: 0 })
      ),
    ]),
  ]
);

/**
 * Slide Out to Left
 * Usage: [@slideOutLeft]
 */
export const slideOutLeft: AnimationTriggerMetadata = trigger('slideOutLeft', [
  transition(':leave', [
    animate(
      `${AnimationDurations.fast} ${AnimationEasings.easeIn}`,
      style({ transform: 'translateX(-100%)', opacity: 0 })
    ),
  ]),
]);

// ============================================================================
// SCALE ANIMATIONS
// ============================================================================

/**
 * Scale Up Animation
 * Usage: [@scaleUp]
 */
export const scaleUp: AnimationTriggerMetadata = trigger('scaleUp', [
  transition(':enter', [
    style({ transform: 'scale(0.8)', opacity: 0 }),
    animate(
      `${AnimationDurations.normal} ${AnimationEasings.easeOut}`,
      style({ transform: 'scale(1)', opacity: 1 })
    ),
  ]),
]);

/**
 * Scale Down Animation
 * Usage: [@scaleDown]
 */
export const scaleDown: AnimationTriggerMetadata = trigger('scaleDown', [
  transition(':leave', [
    animate(
      `${AnimationDurations.fast} ${AnimationEasings.easeIn}`,
      style({ transform: 'scale(0.8)', opacity: 0 })
    ),
  ]),
]);

/**
 * Scale In/Out Animation
 * Usage: [@scale]
 */
export const scale: AnimationTriggerMetadata = trigger('scale', [
  transition(':enter', [
    style({ transform: 'scale(0.8)', opacity: 0 }),
    animate(
      `${AnimationDurations.normal} ${AnimationEasings.easeOut}`,
      style({ transform: 'scale(1)', opacity: 1 })
    ),
  ]),
  transition(':leave', [
    animate(
      `${AnimationDurations.fast} ${AnimationEasings.easeIn}`,
      style({ transform: 'scale(0.8)', opacity: 0 })
    ),
  ]),
]);

/**
 * Pulse Animation (for emphasis)
 * Usage: [@pulse]="pulseTrigger"
 */
export const pulse: AnimationTriggerMetadata = trigger('pulse', [
  state('idle', style({ transform: 'scale(1)' })),
  state('pulsing', style({ transform: 'scale(1)' })),
  transition('idle => pulsing', [
    animate(
      `${AnimationDurations.fast} ${AnimationEasings.easeOut}`,
      keyframes([
        style({ transform: 'scale(1)', offset: 0 }),
        style({ transform: 'scale(1.05)', offset: 0.5 }),
        style({ transform: 'scale(1)', offset: 1 }),
      ])
    ),
  ]),
]);

// ============================================================================
// LIST ANIMATIONS
// ============================================================================

/**
 * Stagger Animation for List Items
 * Usage: [@listStagger] on container
 * Requires child elements with [@listItem]
 */
export const listStagger: AnimationTriggerMetadata = trigger('listStagger', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger(50, [
          animate(
            `${AnimationDurations.normal} ${AnimationEasings.easeOut}`,
            style({ opacity: 1, transform: 'translateY(0)' })
          ),
        ]),
      ],
      { optional: true }
    ),
  ]),
]);

/**
 * List Item Animation (use with listStagger)
 * Usage: [@listItem]
 */
export const listItem: AnimationTriggerMetadata = trigger('listItem', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate(
      `${AnimationDurations.normal} ${AnimationEasings.easeOut}`,
      style({ opacity: 1, transform: 'translateY(0)' })
    ),
  ]),
  transition(':leave', [
    animate(
      `${AnimationDurations.fast} ${AnimationEasings.easeIn}`,
      style({ opacity: 0, transform: 'translateY(-20px)' })
    ),
  ]),
]);

/**
 * Stagger Fade In for List
 * Usage: [@staggerFade]
 */
export const staggerFade: AnimationTriggerMetadata = trigger('staggerFade', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0 }),
        stagger(50, [
          animate(
            `${AnimationDurations.normal} ${AnimationEasings.easeOut}`,
            style({ opacity: 1 })
          ),
        ]),
      ],
      { optional: true }
    ),
  ]),
]);

// ============================================================================
// EXPAND/COLLAPSE ANIMATIONS
// ============================================================================

/**
 * Expand/Collapse Animation (for accordions, etc.)
 * Usage: [@expandCollapse]="isExpanded ? 'expanded' : 'collapsed'"
 */
export const expandCollapse: AnimationTriggerMetadata = trigger(
  'expandCollapse',
  [
    state(
      'collapsed',
      style({
        height: '0',
        overflow: 'hidden',
        opacity: 0,
      })
    ),
    state(
      'expanded',
      style({
        height: '*',
        overflow: 'visible',
        opacity: 1,
      })
    ),
    transition('collapsed <=> expanded', [
      animate(`${AnimationDurations.normal} ${AnimationEasings.easeInOut}`),
    ]),
  ]
);

/**
 * Height Animation (smooth height changes)
 * Usage: [@heightAnimation]
 */
export const heightAnimation: AnimationTriggerMetadata = trigger(
  'heightAnimation',
  [
    transition('* => *', [
      style({ height: '*', overflow: 'hidden' }),
      animate(`${AnimationDurations.normal} ${AnimationEasings.easeInOut}`),
    ]),
  ]
);

// ============================================================================
// ROTATION ANIMATIONS
// ============================================================================

/**
 * Rotate 180 degrees
 * Usage: [@rotate]="isRotated ? 'rotated' : 'default'"
 */
export const rotate: AnimationTriggerMetadata = trigger('rotate', [
  state('default', style({ transform: 'rotate(0deg)' })),
  state('rotated', style({ transform: 'rotate(180deg)' })),
  transition('default <=> rotated', [
    animate(`${AnimationDurations.normal} ${AnimationEasings.easeInOut}`),
  ]),
]);

/**
 * Rotate 90 degrees
 * Usage: [@rotate90]="isRotated ? 'rotated' : 'default'"
 */
export const rotate90: AnimationTriggerMetadata = trigger('rotate90', [
  state('default', style({ transform: 'rotate(0deg)' })),
  state('rotated', style({ transform: 'rotate(90deg)' })),
  transition('default <=> rotated', [
    animate(`${AnimationDurations.normal} ${AnimationEasings.easeInOut}`),
  ]),
]);

// ============================================================================
// SHAKE ANIMATION (for errors)
// ============================================================================

/**
 * Shake Animation (for error feedback)
 * Usage: [@shake]="shakeTrigger"
 */
export const shake: AnimationTriggerMetadata = trigger('shake', [
  state('idle', style({ transform: 'translateX(0)' })),
  state('shaking', style({ transform: 'translateX(0)' })),
  transition('idle => shaking', [
    animate(
      `${AnimationDurations.slow} ${AnimationEasings.easeInOut}`,
      keyframes([
        style({ transform: 'translateX(0)', offset: 0 }),
        style({ transform: 'translateX(-10px)', offset: 0.1 }),
        style({ transform: 'translateX(10px)', offset: 0.2 }),
        style({ transform: 'translateX(-10px)', offset: 0.3 }),
        style({ transform: 'translateX(10px)', offset: 0.4 }),
        style({ transform: 'translateX(-10px)', offset: 0.5 }),
        style({ transform: 'translateX(10px)', offset: 0.6 }),
        style({ transform: 'translateX(-10px)', offset: 0.7 }),
        style({ transform: 'translateX(10px)', offset: 0.8 }),
        style({ transform: 'translateX(0)', offset: 1 }),
      ])
    ),
  ]),
]);

// ============================================================================
// BOUNCE ANIMATION
// ============================================================================

/**
 * Bounce Animation (for notifications)
 * Usage: [@bounce]
 */
export const bounce: AnimationTriggerMetadata = trigger('bounce', [
  transition(':enter', [
    animate(
      `${AnimationDurations.slow} ${AnimationEasings.easeOut}`,
      keyframes([
        style({ transform: 'translateY(0)', offset: 0 }),
        style({ transform: 'translateY(-30px)', offset: 0.3 }),
        style({ transform: 'translateY(0)', offset: 0.5 }),
        style({ transform: 'translateY(-15px)', offset: 0.7 }),
        style({ transform: 'translateY(0)', offset: 1 }),
      ])
    ),
  ]),
]);

// ============================================================================
// FLIP ANIMATION
// ============================================================================

/**
 * Flip Animation
 * Usage: [@flip]
 */
export const flip: AnimationTriggerMetadata = trigger('flip', [
  transition(':enter', [
    style({ transform: 'rotateY(90deg)', opacity: 0 }),
    animate(
      `${AnimationDurations.normal} ${AnimationEasings.easeOut}`,
      style({ transform: 'rotateY(0)', opacity: 1 })
    ),
  ]),
]);

// ============================================================================
// SLIDE AND FADE COMBINATION
// ============================================================================

/**
 * Slide and Fade from Left
 * Usage: [@slideAndFadeLeft]
 */
export const slideAndFadeLeft: AnimationTriggerMetadata = trigger(
  'slideAndFadeLeft',
  [
    transition(':enter', [
      style({ transform: 'translateX(-30px)', opacity: 0 }),
      animate(
        `${AnimationDurations.normal} ${AnimationEasings.easeOut}`,
        style({ transform: 'translateX(0)', opacity: 1 })
      ),
    ]),
    transition(':leave', [
      animate(
        `${AnimationDurations.fast} ${AnimationEasings.easeIn}`,
        style({ transform: 'translateX(-30px)', opacity: 0 })
      ),
    ]),
  ]
);

/**
 * Slide and Fade from Right
 * Usage: [@slideAndFadeRight]
 */
export const slideAndFadeRight: AnimationTriggerMetadata = trigger(
  'slideAndFadeRight',
  [
    transition(':enter', [
      style({ transform: 'translateX(30px)', opacity: 0 }),
      animate(
        `${AnimationDurations.normal} ${AnimationEasings.easeOut}`,
        style({ transform: 'translateX(0)', opacity: 1 })
      ),
    ]),
    transition(':leave', [
      animate(
        `${AnimationDurations.fast} ${AnimationEasings.easeIn}`,
        style({ transform: 'translateX(30px)', opacity: 0 })
      ),
    ]),
  ]
);

/**
 * Slide and Fade from Bottom
 * Usage: [@slideAndFadeBottom]
 */
export const slideAndFadeBottom: AnimationTriggerMetadata = trigger(
  'slideAndFadeBottom',
  [
    transition(':enter', [
      style({ transform: 'translateY(30px)', opacity: 0 }),
      animate(
        `${AnimationDurations.normal} ${AnimationEasings.easeOut}`,
        style({ transform: 'translateY(0)', opacity: 1 })
      ),
    ]),
    transition(':leave', [
      animate(
        `${AnimationDurations.fast} ${AnimationEasings.easeIn}`,
        style({ transform: 'translateY(30px)', opacity: 0 })
      ),
    ]),
  ]
);
