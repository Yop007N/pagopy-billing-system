import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { catchError, throwError, timeout, retry, timer } from 'rxjs';
import { ErrorHandlerService, ErrorType, ErrorSeverity } from '../services/error-handler.service';
import { NetworkService } from '../services/network.service';
import { environment } from '../../../environments/environment';

/**
 * Error Interceptor - Comprehensive HTTP error handling
 *
 * Features:
 * - Timeout handling
 * - Retry logic for transient errors
 * - Network error detection
 * - Structured error classification
 * - User-friendly error messages
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);
  const networkService = inject(NetworkService);

  // Check network status before making request
  if (!networkService.getCurrentStatus() && !isOfflineAllowedEndpoint(req)) {
    const networkError = errorHandler.createError(
      ErrorType.NETWORK,
      ErrorSeverity.HIGH,
      'No network connection',
      'No hay conexión a internet. Verifica tu conexión.',
      { url: req.url }
    );

    errorHandler.handleError(networkError);
    return throwError(() => networkError);
  }

  // Apply timeout to request
  const timeoutValue = getTimeoutForRequest(req);

  return next(req).pipe(
    timeout(timeoutValue),
    retry({
      count: getRetryCountForRequest(req),
      delay: (error, retryCount) => {
        // Only retry on specific errors
        if (shouldRetryRequest(req, error, retryCount)) {
          const delay = calculateRetryDelay(retryCount);
          console.log(`Retrying request (attempt ${retryCount}/${getRetryCountForRequest(req)}) after ${delay}ms:`, req.url);
          return timer(delay);
        }
        // Don't retry - throw error immediately
        throw error;
      }
    }),
    catchError((error: any) => {
      // Handle different error types
      const structuredError = handleHttpError(error, req, errorHandler);

      // Log the error through error handler (won't show toast if already handled)
      if (!isErrorAlreadyHandled(error)) {
        errorHandler.handleError(structuredError);
      }

      return throwError(() => structuredError);
    })
  );
};

/**
 * Handle HTTP errors and convert to structured errors
 */
function handleHttpError(
  error: any,
  req: HttpRequest<any>,
  errorHandler: ErrorHandlerService
): any {
  // Timeout error
  if (error.name === 'TimeoutError') {
    return errorHandler.createError(
      ErrorType.TIMEOUT,
      ErrorSeverity.MEDIUM,
      `Request timeout after ${getTimeoutForRequest(req)}ms`,
      'La solicitud tardó demasiado. Por favor intenta nuevamente.',
      { url: req.url, timeout: getTimeoutForRequest(req) }
    );
  }

  // HTTP Error Response
  if (error instanceof HttpErrorResponse) {
    return handleHttpErrorResponse(error, req, errorHandler);
  }

  // Network/Connection Error
  if (error instanceof Error && (error.message.includes('network') || error.message.includes('connection'))) {
    return errorHandler.createError(
      ErrorType.NETWORK,
      ErrorSeverity.HIGH,
      error.message,
      'Error de conexión. Verifica tu conexión a internet.',
      { url: req.url }
    );
  }

  // Generic error - pass through to error handler for classification
  return error;
}

/**
 * Handle HTTP Error Response
 */
function handleHttpErrorResponse(
  error: HttpErrorResponse,
  req: HttpRequest<any>,
  errorHandler: ErrorHandlerService
): any {
  const statusCode = error.status;

  // Network Error (status 0)
  if (statusCode === 0) {
    return errorHandler.createError(
      ErrorType.NETWORK,
      ErrorSeverity.HIGH,
      'Network connection failed',
      'Error de conexión. Verifica tu conexión a internet.',
      { url: req.url, requestUrl: error.url }
    );
  }

  // Authentication Error (401) - Don't show toast, auth interceptor handles it
  if (statusCode === 401) {
    return errorHandler.createError(
      ErrorType.AUTH,
      ErrorSeverity.HIGH,
      error.error?.message || 'Authentication failed',
      'Sesión expirada. Por favor inicia sesión nuevamente.',
      { url: req.url, statusCode }
    );
  }

  // Permission Error (403)
  if (statusCode === 403) {
    return errorHandler.createError(
      ErrorType.PERMISSION,
      ErrorSeverity.MEDIUM,
      error.error?.message || 'Permission denied',
      'No tienes permisos para realizar esta acción.',
      { url: req.url, statusCode }
    );
  }

  // Not Found Error (404)
  if (statusCode === 404) {
    return errorHandler.createError(
      ErrorType.NOT_FOUND,
      ErrorSeverity.LOW,
      error.error?.message || 'Resource not found',
      'Recurso no encontrado.',
      { url: req.url, statusCode }
    );
  }

  // Validation Error (400, 422)
  if (statusCode === 400 || statusCode === 422) {
    const validationErrors = error.error?.errors || error.error?.details;
    return errorHandler.createError(
      ErrorType.VALIDATION,
      ErrorSeverity.LOW,
      error.error?.message || 'Validation failed',
      formatValidationMessage(error.error),
      { url: req.url, statusCode, validationErrors }
    );
  }

  // Request Timeout (408)
  if (statusCode === 408) {
    return errorHandler.createError(
      ErrorType.TIMEOUT,
      ErrorSeverity.MEDIUM,
      'Request timeout',
      'La solicitud tardó demasiado. Por favor intenta nuevamente.',
      { url: req.url, statusCode }
    );
  }

  // Too Many Requests (429)
  if (statusCode === 429) {
    const retryAfter = error.headers.get('Retry-After');
    return errorHandler.createError(
      ErrorType.BUSINESS,
      ErrorSeverity.MEDIUM,
      'Too many requests',
      'Demasiadas solicitudes. Por favor espera un momento.',
      { url: req.url, statusCode, retryAfter }
    );
  }

  // Server Error (5xx)
  if (statusCode >= 500) {
    return errorHandler.createError(
      ErrorType.SERVER,
      ErrorSeverity.CRITICAL,
      error.error?.message || `Server error: ${statusCode}`,
      'Error del servidor. Por favor intenta nuevamente más tarde.',
      { url: req.url, statusCode }
    );
  }

  // Other Client Errors (4xx)
  if (statusCode >= 400 && statusCode < 500) {
    return errorHandler.createError(
      ErrorType.BUSINESS,
      ErrorSeverity.MEDIUM,
      error.error?.message || `Client error: ${statusCode}`,
      error.error?.message || 'Ocurrió un error. Por favor intenta nuevamente.',
      { url: req.url, statusCode }
    );
  }

  // Fallback for other HTTP errors
  return error;
}

/**
 * Format validation error message
 */
function formatValidationMessage(errorResponse: any): string {
  if (!errorResponse) {
    return 'Error de validación. Verifica los datos ingresados.';
  }

  // If there's a custom message, use it
  if (errorResponse.message && typeof errorResponse.message === 'string') {
    return errorResponse.message;
  }

  // Format validation errors array
  if (errorResponse.errors && Array.isArray(errorResponse.errors)) {
    const messages = errorResponse.errors.map((err: any) => {
      if (typeof err === 'string') return err;
      if (err.message) return err.message;
      return JSON.stringify(err);
    });

    if (messages.length > 0) {
      return messages.join('; ');
    }
  }

  // Format validation errors object
  if (errorResponse.errors && typeof errorResponse.errors === 'object') {
    const messages = Object.entries(errorResponse.errors).map(([field, errors]) => {
      if (Array.isArray(errors)) {
        return `${field}: ${errors.join(', ')}`;
      }
      return `${field}: ${errors}`;
    });

    if (messages.length > 0) {
      return messages.join('; ');
    }
  }

  return 'Error de validación. Verifica los datos ingresados.';
}

/**
 * Get timeout value for request
 */
function getTimeoutForRequest(req: HttpRequest<any>): number {
  // Longer timeout for file uploads
  if (req.headers.has('Content-Type') && req.headers.get('Content-Type')?.includes('multipart/form-data')) {
    return 60000; // 60 seconds
  }

  // Longer timeout for specific endpoints
  if (req.url.includes('/sync') || req.url.includes('/upload')) {
    return 45000; // 45 seconds
  }

  // Default timeout from environment
  return environment.apiTimeout || 30000;
}

/**
 * Get retry count for request
 */
function getRetryCountForRequest(req: HttpRequest<any>): number {
  // Don't retry mutations (POST, PUT, DELETE, PATCH)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method.toUpperCase())) {
    return 0;
  }

  // Don't retry auth requests
  if (req.url.includes('/auth/')) {
    return 0;
  }

  // Retry GET requests
  return environment.network?.retryAttempts || 2;
}

/**
 * Determine if request should be retried
 */
function shouldRetryRequest(req: HttpRequest<any>, error: any, retryCount: number): boolean {
  // Don't retry if max attempts reached
  if (retryCount >= getRetryCountForRequest(req)) {
    return false;
  }

  // Don't retry mutations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method.toUpperCase())) {
    return false;
  }

  // Don't retry timeout errors
  if (error.name === 'TimeoutError') {
    return false;
  }

  // Only retry on network errors or server errors
  if (error instanceof HttpErrorResponse) {
    const statusCode = error.status;

    // Retry on network error (0)
    if (statusCode === 0) {
      return true;
    }

    // Retry on server errors (5xx)
    if (statusCode >= 500) {
      return true;
    }

    // Retry on rate limit (429) with exponential backoff
    if (statusCode === 429) {
      return true;
    }

    // Retry on request timeout (408)
    if (statusCode === 408) {
      return true;
    }

    // Don't retry client errors (4xx)
    return false;
  }

  // Retry on network errors
  if (error instanceof Error && (error.message.includes('network') || error.message.includes('connection'))) {
    return true;
  }

  return false;
}

/**
 * Calculate retry delay with exponential backoff
 */
function calculateRetryDelay(retryCount: number): number {
  const baseDelay = environment.network?.retryDelay || 1000;
  const maxDelay = 10000; // 10 seconds max

  // Exponential backoff: 1s, 2s, 4s, 8s, 10s (capped)
  const delay = Math.min(baseDelay * Math.pow(2, retryCount - 1), maxDelay);

  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 500;

  return delay + jitter;
}

/**
 * Check if endpoint allows offline operation
 */
function isOfflineAllowedEndpoint(req: HttpRequest<any>): boolean {
  // Health check can be made without connection (will fail gracefully)
  if (req.url.includes('/health')) {
    return true;
  }

  // Auth refresh might be attempted
  if (req.url.includes('/auth/refresh')) {
    return true;
  }

  return false;
}

/**
 * Check if error was already handled (to avoid duplicate toasts)
 */
function isErrorAlreadyHandled(error: any): boolean {
  // Auth errors are handled by auth interceptor
  if (error instanceof HttpErrorResponse && error.status === 401) {
    return true;
  }

  // Custom errors with handled flag
  if (error && typeof error === 'object' && error.handled === true) {
    return true;
  }

  return false;
}
