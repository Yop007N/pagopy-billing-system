import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Auth Interceptor - Handles authentication headers and 401 responses
 *
 * - Adds Bearer token to all requests except auth endpoints
 * - Intercepts 401 responses and triggers automatic logout
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Routes that don't need authentication token
  const excludedRoutes = ['/auth/login', '/auth/register'];
  const isExcluded = excludedRoutes.some(route => req.url.includes(route));

  // Add Authorization header if token exists and route is not excluded
  if (!isExcluded) {
    // Access token directly from localStorage to avoid circular dependency
    const token = localStorage.getItem('access_token');
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  // Handle response and catch 401 errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isExcluded) {
        // Unauthorized - token is invalid or expired
        console.warn('401 Unauthorized - Clearing session and redirecting to login');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};
