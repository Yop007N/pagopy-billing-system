import {
  trigger,
  state,
  style,
  transition,
  animate,
  query,
  group,
  animateChild
} from '@angular/animations';

/**
 * Fade In animation
 */
export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 }))
  ])
]);

/**
 * Fade In Up animation
 */
export const fadeInUp = trigger('fadeInUp', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'translateY(20px)'
    }),
    animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({
      opacity: 1,
      transform: 'translateY(0)'
    }))
  ])
]);

/**
 * Slide In Left animation
 */
export const slideInLeft = trigger('slideInLeft', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'translateX(-100%)'
    }),
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({
      opacity: 1,
      transform: 'translateX(0)'
    }))
  ]),
  transition(':leave', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({
      opacity: 0,
      transform: 'translateX(-100%)'
    }))
  ])
]);

/**
 * Slide In Right animation
 */
export const slideInRight = trigger('slideInRight', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'translateX(100%)'
    }),
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({
      opacity: 1,
      transform: 'translateX(0)'
    }))
  ]),
  transition(':leave', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({
      opacity: 0,
      transform: 'translateX(100%)'
    }))
  ])
]);

/**
 * Expand/Collapse animation
 */
export const expandCollapse = trigger('expandCollapse', [
  state('collapsed', style({
    height: '0',
    overflow: 'hidden',
    opacity: '0'
  })),
  state('expanded', style({
    height: '*',
    overflow: 'visible',
    opacity: '1'
  })),
  transition('collapsed <=> expanded', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
  ])
]);

/**
 * Scale In animation
 */
export const scaleIn = trigger('scaleIn', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'scale(0.8)'
    }),
    animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({
      opacity: 1,
      transform: 'scale(1)'
    }))
  ])
]);

/**
 * List stagger animation
 */
export const listStagger = trigger('listStagger', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(15px)' }),
      animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({
        opacity: 1,
        transform: 'translateY(0)'
      }))
    ], { optional: true })
  ])
]);

/**
 * Route transition animation
 */
export const routeTransition = trigger('routeTransition', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        width: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateX(100%)'
      })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          opacity: 0,
          transform: 'translateX(-100%)'
        }))
      ], { optional: true }),
      query(':enter', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          opacity: 1,
          transform: 'translateX(0)'
        }))
      ], { optional: true })
    ])
  ])
]);

/**
 * Dialog animation
 */
export const dialogAnimation = trigger('dialogAnimation', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'scale(0.9) translateY(-20px)'
    }),
    animate('250ms cubic-bezier(0.4, 0, 0.2, 1)', style({
      opacity: 1,
      transform: 'scale(1) translateY(0)'
    }))
  ]),
  transition(':leave', [
    animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({
      opacity: 0,
      transform: 'scale(0.9) translateY(-20px)'
    }))
  ])
]);

/**
 * Backdrop fade animation
 */
export const backdropFade = trigger('backdropFade', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms ease-in', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-out', style({ opacity: 0 }))
  ])
]);
