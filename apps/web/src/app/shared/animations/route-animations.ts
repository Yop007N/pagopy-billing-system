/**
 * Route Transition Animations
 * Provides smooth page transitions for Angular Router
 *
 * Usage:
 * 1. Add to app.component.ts animations array
 * 2. Add [@routeAnimations]="prepareRoute(outlet)" to <router-outlet>
 * 3. Implement prepareRoute method to return route data animation state
 *
 * Example:
 * // app.component.ts
 * @Component({
 *   animations: [routeSlide, routeFade]
 * })
 * export class AppComponent {
 *   prepareRoute(outlet: RouterOutlet) {
 *     return outlet?.activatedRouteData?.['animation'];
 *   }
 * }
 *
 * // app.routes.ts
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   data: { animation: 'DashboardPage' }
 * }
 */

import {
  trigger,
  transition,
  style,
  query,
  group,
  animate,
  AnimationTriggerMetadata,
} from '@angular/animations';
import { AnimationDurations, AnimationEasings } from './core-animations';

/**
 * Slide Route Transition (left/right)
 * Pages slide in from right and slide out to left
 * Usage: [@routeSlide]="prepareRoute(outlet)"
 */
export const routeSlide: AnimationTriggerMetadata = trigger('routeSlide', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }),
      ],
      { optional: true }
    ),
    query(':enter', [style({ transform: 'translateX(100%)' })], {
      optional: true,
    }),
    group([
      query(
        ':leave',
        [
          animate(
            `${AnimationDurations.normal} ${AnimationEasings.easeInOut}`,
            style({ transform: 'translateX(-100%)' })
          ),
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [
          animate(
            `${AnimationDurations.normal} ${AnimationEasings.easeInOut}`,
            style({ transform: 'translateX(0)' })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);

/**
 * Fade Route Transition
 * Simple crossfade between pages
 * Usage: [@routeFade]="prepareRoute(outlet)"
 */
export const routeFade: AnimationTriggerMetadata = trigger('routeFade', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          opacity: 1,
        }),
      ],
      { optional: true }
    ),
    query(':enter', [style({ opacity: 0 })], { optional: true }),
    group([
      query(
        ':leave',
        [
          animate(
            `${AnimationDurations.fast} ${AnimationEasings.easeOut}`,
            style({ opacity: 0 })
          ),
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [
          animate(
            `${AnimationDurations.normal} ${AnimationEasings.easeIn}`,
            style({ opacity: 1 })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);

/**
 * Scale Route Transition
 * New page scales up while old page scales down
 * Usage: [@routeScale]="prepareRoute(outlet)"
 */
export const routeScale: AnimationTriggerMetadata = trigger('routeScale', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }),
      ],
      { optional: true }
    ),
    query(':enter', [style({ transform: 'scale(0.8)', opacity: 0 })], {
      optional: true,
    }),
    group([
      query(
        ':leave',
        [
          animate(
            `${AnimationDurations.normal} ${AnimationEasings.easeInOut}`,
            style({ transform: 'scale(1.1)', opacity: 0 })
          ),
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [
          animate(
            `${AnimationDurations.normal} ${AnimationEasings.easeInOut}`,
            style({ transform: 'scale(1)', opacity: 1 })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);

/**
 * Slide Up Route Transition
 * New page slides up from bottom
 * Usage: [@routeSlideUp]="prepareRoute(outlet)"
 */
export const routeSlideUp: AnimationTriggerMetadata = trigger('routeSlideUp', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }),
      ],
      { optional: true }
    ),
    query(':enter', [style({ transform: 'translateY(100%)' })], {
      optional: true,
    }),
    group([
      query(
        ':leave',
        [
          animate(
            `${AnimationDurations.normal} ${AnimationEasings.easeInOut}`,
            style({ transform: 'translateY(-100%)', opacity: 0 })
          ),
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [
          animate(
            `${AnimationDurations.normal} ${AnimationEasings.easeInOut}`,
            style({ transform: 'translateY(0)' })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);

/**
 * Slide and Fade Route Transition
 * Combines slide and fade for smooth transitions
 * Usage: [@routeSlideAndFade]="prepareRoute(outlet)"
 */
export const routeSlideAndFade: AnimationTriggerMetadata = trigger(
  'routeSlideAndFade',
  [
    transition('* <=> *', [
      style({ position: 'relative' }),
      query(
        ':enter, :leave',
        [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
          }),
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [style({ transform: 'translateX(30px)', opacity: 0 })],
        { optional: true }
      ),
      group([
        query(
          ':leave',
          [
            animate(
              `${AnimationDurations.fast} ${AnimationEasings.easeIn}`,
              style({ transform: 'translateX(-30px)', opacity: 0 })
            ),
          ],
          { optional: true }
        ),
        query(
          ':enter',
          [
            animate(
              `${AnimationDurations.normal} ${AnimationEasings.easeOut}`,
              style({ transform: 'translateX(0)', opacity: 1 })
            ),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ]
);

/**
 * Zoom Route Transition
 * Old page zooms out, new page zooms in
 * Usage: [@routeZoom]="prepareRoute(outlet)"
 */
export const routeZoom: AnimationTriggerMetadata = trigger('routeZoom', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }),
      ],
      { optional: true }
    ),
    query(':enter', [style({ transform: 'scale(0)', opacity: 0 })], {
      optional: true,
    }),
    group([
      query(
        ':leave',
        [
          animate(
            `${AnimationDurations.normal} ${AnimationEasings.easeInOut}`,
            style({ transform: 'scale(2)', opacity: 0 })
          ),
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [
          animate(
            `${AnimationDurations.normal} ${AnimationEasings.easeInOut}`,
            style({ transform: 'scale(1)', opacity: 1 })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);

/**
 * Flip Route Transition
 * 3D flip effect between pages
 * Usage: [@routeFlip]="prepareRoute(outlet)"
 */
export const routeFlip: AnimationTriggerMetadata = trigger('routeFlip', [
  transition('* <=> *', [
    style({ position: 'relative', perspective: '1000px' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          backfaceVisibility: 'hidden',
        }),
      ],
      { optional: true }
    ),
    query(':enter', [style({ transform: 'rotateY(90deg)', opacity: 0 })], {
      optional: true,
    }),
    group([
      query(
        ':leave',
        [
          animate(
            `${AnimationDurations.normal} ${AnimationEasings.easeInOut}`,
            style({ transform: 'rotateY(-90deg)', opacity: 0 })
          ),
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [
          animate(
            `${AnimationDurations.normal} ${AnimationEasings.easeInOut}`,
            style({ transform: 'rotateY(0)', opacity: 1 })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);

/**
 * Minimal Route Transition
 * Subtle fade for quick navigation
 * Best for performance-critical applications
 * Usage: [@routeMinimal]="prepareRoute(outlet)"
 */
export const routeMinimal: AnimationTriggerMetadata = trigger('routeMinimal', [
  transition('* <=> *', [
    query(
      ':enter',
      [
        style({ opacity: 0 }),
        animate(
          `${AnimationDurations.fast} ${AnimationEasings.easeOut}`,
          style({ opacity: 1 })
        ),
      ],
      { optional: true }
    ),
  ]),
]);

/**
 * Default Recommended Route Animation
 * Export this for easy default usage
 */
export const routeAnimation = routeSlideAndFade;
