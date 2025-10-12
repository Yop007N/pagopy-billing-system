import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, throwError, from } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Auth Interceptor - Adds JWT token to outgoing requests
 * Handles token refresh on 401 errors
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip auth header for auth endpoints
  if (
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh')
  ) {
    return next(req);
  }

  // Add token to request
  return from(authService.getAccessToken()).pipe(
    switchMap(token => {
      let clonedReq = req;

      if (token) {
        clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      return next(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // If 401 error, try to refresh token
          if (error.status === 401 && !req.url.includes('/auth/refresh')) {
            return authService.refreshToken().pipe(
              switchMap(() => {
                // Retry original request with new token
                return from(authService.getAccessToken()).pipe(
                  switchMap(newToken => {
                    const retryReq = req.clone({
                      setHeaders: {
                        Authorization: `Bearer ${newToken}`
                      }
                    });
                    return next(retryReq);
                  })
                );
              }),
              catchError(refreshError => {
                // If refresh fails, logout user
                authService.logout();
                return throwError(() => refreshError);
              })
            );
          }

          return throwError(() => error);
        })
      );
    })
  );
};
