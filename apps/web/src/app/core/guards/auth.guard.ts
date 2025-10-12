import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard - Protects routes requiring authentication
 *
 * Uses computed signal from AuthService to check authentication status
 * Redirects to login page if user is not authenticated
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Use computed signal for authentication check
  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login page with return url
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};
