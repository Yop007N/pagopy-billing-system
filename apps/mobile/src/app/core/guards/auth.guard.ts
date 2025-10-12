import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard - Protects routes that require authentication
 * Usage in routes: canActivate: [authGuard]
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = await authService.checkAuthStatus();

  if (!isAuthenticated) {
    // Store the attempted URL for redirecting after login
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  return true;
};

/**
 * Guest Guard - Redirects authenticated users away from auth pages
 * Usage in routes: canActivate: [guestGuard]
 */
export const guestGuard: CanActivateFn = async (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = await authService.checkAuthStatus();

  if (isAuthenticated) {
    // User is already authenticated, redirect to home
    router.navigate(['/tabs/home']);
    return false;
  }

  return true;
};
