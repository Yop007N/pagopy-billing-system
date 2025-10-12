import { Injectable, ErrorHandler, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { APP_CONSTANTS } from '../../shared/constants/app.constants';

/**
 * Error Types Classification
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  BUSINESS = 'BUSINESS',
  TIMEOUT = 'TIMEOUT',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  PERMISSION = 'PERMISSION',
  STORAGE = 'STORAGE',
  SYNC = 'SYNC',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Error Severity Levels
 */
export enum ErrorSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO'
}

/**
 * Structured Error Information
 */
export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  code?: string;
  statusCode?: number;
  originalError?: any;
  stack?: string;
  context?: any;
  timestamp: Date;
  url?: string;
  recoverable: boolean;
}

/**
 * Error Log Entry
 */
export interface ErrorLog {
  timestamp: Date;
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  context?: any;
  level: 'error' | 'warning' | 'info';
  errorType?: ErrorType;
  severity?: ErrorSeverity;
  statusCode?: number;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService implements ErrorHandler {
  private toastController = inject(ToastController);
  private router = inject(Router);

  private errorLogs: ErrorLog[] = [];
  private readonly MAX_LOGS = environment.logging.maxLogSize || 100;
  private sentryInitialized = false;

  constructor() {
    // Initialize Sentry if enabled
    this.initializeSentry();
  }

  /**
   * Initialize Sentry SDK
   */
  private async initializeSentry(): Promise<void> {
    if (!environment.services.sentry?.enabled || !environment.services.sentry?.dsn || this.sentryInitialized) {
      return;
    }

    try {
      const Sentry = await import('@sentry/capacitor');
      const { init } = Sentry;

      init({
        dsn: environment.services.sentry.dsn,
        environment: environment.services.sentry.environment,
        tracesSampleRate: environment.services.sentry.tracesSampleRate,
        release: `${environment.capacitor.appName}@${environment.appVersion}`,
        dist: environment.buildNumber,
        integrations: [
          // Add any specific integrations here
        ],
        beforeSend: (event) => {
          // Filter or modify events before sending
          // Don't send errors in development unless explicitly enabled
          if (!environment.production && !environment.features.enableCrashReporting) {
            return null;
          }
          return event;
        }
      });

      this.sentryInitialized = true;
      console.log('Sentry initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  handleError(error: any): void {
    // Classify and structure the error
    const appError = this.classifyError(error);

    // Log the structured error
    this.logError(appError);

    // Show user-friendly message (unless it's low severity)
    if (appError.severity !== ErrorSeverity.LOW && appError.severity !== ErrorSeverity.INFO) {
      this.showErrorToUser(appError);
    }

    // Report to remote service if enabled and critical
    if (environment.logging.enableRemote && environment.production) {
      if (appError.severity === ErrorSeverity.CRITICAL || appError.severity === ErrorSeverity.HIGH) {
        this.reportToRemoteService(appError);
      }
    }

    // In development, also log to console
    if (!environment.production) {
      console.error('ErrorHandler caught:', {
        type: appError.type,
        severity: appError.severity,
        message: appError.message,
        originalError: error
      });
    }

    // Handle specific error types
    this.handleSpecificError(appError);
  }

  /**
   * Classify error into structured AppError
   */
  classifyError(error: any): AppError {
    const timestamp = new Date();
    const url = this.router.url;

    // HTTP Error Response
    if (error instanceof HttpErrorResponse) {
      return this.classifyHttpError(error, timestamp, url);
    }

    // Custom AppError
    if (error && typeof error === 'object' && 'type' in error && 'severity' in error) {
      return error as AppError;
    }

    // TimeoutError
    if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT,
        severity: ErrorSeverity.MEDIUM,
        message: error.message || 'Request timeout',
        userMessage: APP_CONSTANTS.ERRORS.TIMEOUT_ERROR,
        originalError: error,
        stack: error?.stack,
        timestamp,
        url,
        recoverable: true
      };
    }

    // Promise Rejection
    if (error?.rejection) {
      return this.classifyError(error.rejection);
    }

    // String error
    if (typeof error === 'string') {
      return {
        type: ErrorType.UNKNOWN,
        severity: ErrorSeverity.MEDIUM,
        message: error,
        userMessage: error,
        timestamp,
        url,
        recoverable: true
      };
    }

    // Generic JavaScript Error
    if (error instanceof Error) {
      return {
        type: ErrorType.UNKNOWN,
        severity: ErrorSeverity.HIGH,
        message: error.message,
        userMessage: APP_CONSTANTS.ERRORS.UNKNOWN_ERROR,
        originalError: error,
        stack: error.stack,
        timestamp,
        url,
        recoverable: false
      };
    }

    // Fallback
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      message: 'Unknown error occurred',
      userMessage: APP_CONSTANTS.ERRORS.UNKNOWN_ERROR,
      originalError: error,
      timestamp,
      url,
      recoverable: false
    };
  }

  /**
   * Classify HTTP errors
   */
  private classifyHttpError(error: HttpErrorResponse, timestamp: Date, url: string): AppError {
    const statusCode = error.status;

    // Network Error (status 0)
    if (statusCode === 0) {
      return {
        type: ErrorType.NETWORK,
        severity: ErrorSeverity.HIGH,
        message: 'Network connection failed',
        userMessage: APP_CONSTANTS.ERRORS.NETWORK_ERROR,
        statusCode,
        originalError: error,
        timestamp,
        url,
        recoverable: true
      };
    }

    // Authentication Error (401)
    if (statusCode === 401) {
      return {
        type: ErrorType.AUTH,
        severity: ErrorSeverity.HIGH,
        message: error.error?.message || 'Authentication failed',
        userMessage: APP_CONSTANTS.ERRORS.UNAUTHORIZED,
        statusCode,
        originalError: error,
        timestamp,
        url,
        recoverable: true
      };
    }

    // Permission Error (403)
    if (statusCode === 403) {
      return {
        type: ErrorType.PERMISSION,
        severity: ErrorSeverity.MEDIUM,
        message: error.error?.message || 'Permission denied',
        userMessage: APP_CONSTANTS.ERRORS.FORBIDDEN,
        statusCode,
        originalError: error,
        timestamp,
        url,
        recoverable: false
      };
    }

    // Not Found Error (404)
    if (statusCode === 404) {
      return {
        type: ErrorType.NOT_FOUND,
        severity: ErrorSeverity.LOW,
        message: error.error?.message || 'Resource not found',
        userMessage: APP_CONSTANTS.ERRORS.NOT_FOUND,
        statusCode,
        originalError: error,
        timestamp,
        url,
        recoverable: true
      };
    }

    // Timeout Error (408)
    if (statusCode === 408) {
      return {
        type: ErrorType.TIMEOUT,
        severity: ErrorSeverity.MEDIUM,
        message: 'Request timeout',
        userMessage: APP_CONSTANTS.ERRORS.TIMEOUT_ERROR,
        statusCode,
        originalError: error,
        timestamp,
        url,
        recoverable: true
      };
    }

    // Validation Error (400, 422)
    if (statusCode === 400 || statusCode === 422) {
      return {
        type: ErrorType.VALIDATION,
        severity: ErrorSeverity.LOW,
        message: error.error?.message || 'Validation failed',
        userMessage: error.error?.message || APP_CONSTANTS.ERRORS.VALIDATION_ERROR,
        statusCode,
        originalError: error,
        context: error.error?.errors || error.error?.details,
        timestamp,
        url,
        recoverable: true
      };
    }

    // Server Error (5xx)
    if (statusCode >= 500) {
      return {
        type: ErrorType.SERVER,
        severity: ErrorSeverity.CRITICAL,
        message: error.error?.message || `Server error: ${statusCode}`,
        userMessage: APP_CONSTANTS.ERRORS.SERVER_ERROR,
        statusCode,
        originalError: error,
        timestamp,
        url,
        recoverable: true
      };
    }

    // Other Client Errors (4xx)
    if (statusCode >= 400 && statusCode < 500) {
      return {
        type: ErrorType.BUSINESS,
        severity: ErrorSeverity.MEDIUM,
        message: error.error?.message || `Client error: ${statusCode}`,
        userMessage: error.error?.message || APP_CONSTANTS.ERRORS.UNKNOWN_ERROR,
        statusCode,
        originalError: error,
        timestamp,
        url,
        recoverable: true
      };
    }

    // Fallback
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      message: `HTTP Error: ${statusCode}`,
      userMessage: APP_CONSTANTS.ERRORS.UNKNOWN_ERROR,
      statusCode,
      originalError: error,
      timestamp,
      url,
      recoverable: false
    };
  }

  /**
   * Handle specific error types with appropriate actions
   */
  private handleSpecificError(error: AppError): void {
    switch (error.type) {
      case ErrorType.AUTH:
        // Auth errors might require logout (handled by auth interceptor)
        console.log('Authentication error detected');
        break;

      case ErrorType.NETWORK:
        // Network errors - maybe show offline indicator
        console.log('Network error detected');
        break;

      case ErrorType.STORAGE:
        // Storage errors - might need to clear cache
        console.log('Storage error detected');
        break;

      case ErrorType.SYNC:
        // Sync errors - update sync status
        console.log('Sync error detected');
        break;

      default:
        // No specific handling
        break;
    }
  }

  /**
   * Log error to local storage
   */
  private logError(error: AppError): void {
    const errorLog: ErrorLog = {
      timestamp: error.timestamp,
      message: error.message,
      stack: error.stack,
      url: error.url,
      userAgent: navigator.userAgent,
      context: error.context,
      level: 'error',
      errorType: error.type,
      severity: error.severity,
      statusCode: error.statusCode
    };

    // Add to in-memory log
    this.errorLogs.push(errorLog);

    // Keep only the last N logs
    if (this.errorLogs.length > this.MAX_LOGS) {
      this.errorLogs = this.errorLogs.slice(-this.MAX_LOGS);
    }

    // Save to local storage (async, don't await)
    this.saveLogsToStorage().catch(err => {
      console.error('Failed to save error logs:', err);
    });

    // Log to console if enabled
    if (environment.logging.enableConsole) {
      console.error(`[${errorLog.timestamp.toISOString()}]`, errorLog.message);
      if (errorLog.stack && environment.features.enableDebugLogs) {
        console.error(errorLog.stack);
      }
    }
  }

  /**
   * Show user-friendly error message
   */
  private async showErrorToUser(error: AppError): Promise<void> {
    const message = error.userMessage;
    const color = this.getSeverityColor(error.severity);

    try {
      const toast = await this.toastController.create({
        message,
        duration: APP_CONSTANTS.TOAST_LONG_DURATION,
        color,
        position: 'top',
        buttons: [
          {
            text: 'Cerrar',
            role: 'cancel'
          }
        ]
      });

      await toast.present();
    } catch (toastError) {
      // Fallback to alert if toast fails
      console.error('Failed to show error toast:', toastError);
    }
  }

  /**
   * Extract error message from various error types
   */
  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error?.rejection?.message) {
      return error.rejection.message;
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.message) {
      return error.message;
    }

    if (error?.status === 0) {
      return APP_CONSTANTS.ERRORS.NETWORK_ERROR;
    }

    return APP_CONSTANTS.ERRORS.UNKNOWN_ERROR;
  }

  /**
   * Extract additional context from error
   */
  private extractErrorContext(error: any): any {
    const context: any = {};

    if (error?.status) {
      context.status = error.status;
    }

    if (error?.statusText) {
      context.statusText = error.statusText;
    }

    if (error?.url) {
      context.url = error.url;
    }

    if (error?.name) {
      context.name = error.name;
    }

    return Object.keys(context).length > 0 ? context : undefined;
  }

  /**
   * Get user-friendly message based on error type
   */
  private getUserFriendlyMessage(error: any): string {
    // Network errors
    if (error?.status === 0 || error?.message?.includes('Network')) {
      return APP_CONSTANTS.ERRORS.NETWORK_ERROR;
    }

    // Authentication errors
    if (error?.status === 401) {
      return APP_CONSTANTS.ERRORS.UNAUTHORIZED;
    }

    // Authorization errors
    if (error?.status === 403) {
      return APP_CONSTANTS.ERRORS.FORBIDDEN;
    }

    // Not found errors
    if (error?.status === 404) {
      return APP_CONSTANTS.ERRORS.NOT_FOUND;
    }

    // Validation errors
    if (error?.status === 422 || error?.status === 400) {
      return error?.error?.message || APP_CONSTANTS.ERRORS.VALIDATION_ERROR;
    }

    // Timeout errors
    if (error?.name === 'TimeoutError' || error?.status === 408) {
      return APP_CONSTANTS.ERRORS.TIMEOUT_ERROR;
    }

    // Server errors
    if (error?.status >= 500) {
      return APP_CONSTANTS.ERRORS.SERVER_ERROR;
    }

    // Extract custom message if available
    const customMessage = this.extractErrorMessage(error);
    if (customMessage && customMessage !== APP_CONSTANTS.ERRORS.UNKNOWN_ERROR) {
      return customMessage;
    }

    return APP_CONSTANTS.ERRORS.UNKNOWN_ERROR;
  }

  /**
   * Get severity color for toast
   */
  private getSeverityColor(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'danger';
      case ErrorSeverity.HIGH:
        return 'danger';
      case ErrorSeverity.MEDIUM:
        return 'warning';
      case ErrorSeverity.LOW:
        return 'warning';
      case ErrorSeverity.INFO:
        return 'primary';
      default:
        return 'danger';
    }
  }

  /**
   * Report error to remote service (Sentry, etc.)
   */
  private async reportToRemoteService(error: AppError): Promise<void> {
    if (!environment.services.sentry?.enabled || !environment.services.sentry?.dsn) {
      return;
    }

    try {
      // Dynamically import Sentry only if enabled
      const Sentry = await import('@sentry/capacitor');

      // Set error context
      const errorContext: any = {
        errorType: error.type,
        severity: error.severity,
        url: error.url,
        userAgent: navigator.userAgent,
        timestamp: error.timestamp.toISOString(),
        recoverable: error.recoverable
      };

      if (error.statusCode) {
        errorContext.httpStatus = error.statusCode;
      }

      if (error.context) {
        errorContext.additionalContext = error.context;
      }

      // Set context
      Sentry.setContext('error_details', errorContext);

      // Add tags for better filtering
      Sentry.setTag('error_type', error.type);
      Sentry.setTag('severity', error.severity);

      if (error.statusCode) {
        Sentry.setTag('http_status', error.statusCode.toString());
      }

      // Set level based on severity
      const sentryLevel = this.mapSeverityToSentryLevel(error.severity);

      // Capture the exception
      if (error.originalError) {
        Sentry.captureException(error.originalError, {
          level: sentryLevel,
          contexts: {
            app_error: errorContext
          }
        });
      } else {
        Sentry.captureMessage(error.message, sentryLevel);
      }

      console.log('Error reported to Sentry');
    } catch (sentryError) {
      // Fail silently - don't let Sentry errors break the app
      console.error('Failed to report error to Sentry:', sentryError);
    }
  }

  /**
   * Map error severity to Sentry level
   */
  private mapSeverityToSentryLevel(severity: ErrorSeverity): 'fatal' | 'error' | 'warning' | 'info' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'fatal';
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warning';
      case ErrorSeverity.LOW:
      case ErrorSeverity.INFO:
        return 'info';
      default:
        return 'error';
    }
  }

  /**
   * Save logs to local storage
   */
  private async saveLogsToStorage(): Promise<void> {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({
        key: 'error_logs',
        value: JSON.stringify(this.errorLogs)
      });
    } catch (error) {
      // Fail silently to avoid recursive error logging
      console.error('Failed to save error logs to storage:', error);
    }
  }

  /**
   * Get all error logs
   */
  async getErrorLogs(): Promise<ErrorLog[]> {
    return [...this.errorLogs];
  }

  /**
   * Clear all error logs
   */
  async clearErrorLogs(): Promise<void> {
    this.errorLogs = [];
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key: 'error_logs' });
    } catch (error) {
      console.error('Failed to clear error logs from storage:', error);
    }
  }

  /**
   * Load logs from storage (call on app init)
   */
  async loadLogsFromStorage(): Promise<void> {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key: 'error_logs' });
      if (value) {
        this.errorLogs = JSON.parse(value);
      }
    } catch (error) {
      console.error('Failed to load error logs from storage:', error);
    }
  }

  /**
   * Log a custom error
   */
  logCustomError(message: string, context?: any, level: 'error' | 'warning' | 'info' = 'error'): void {
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      message,
      url: this.router.url,
      userAgent: navigator.userAgent,
      context,
      level
    };

    this.errorLogs.push(errorLog);

    if (this.errorLogs.length > this.MAX_LOGS) {
      this.errorLogs = this.errorLogs.slice(-this.MAX_LOGS);
    }

    this.saveLogsToStorage().catch(err => {
      console.error('Failed to save error logs:', err);
    });

    if (environment.logging.enableConsole) {
      const logFn = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
      logFn(`[${errorLog.timestamp.toISOString()}] ${message}`, context);
    }
  }

  /**
   * Export logs for debugging
   */
  async exportLogs(): Promise<string> {
    return JSON.stringify(this.errorLogs, null, 2);
  }

  /**
   * Set user context for error reporting
   */
  async setUserContext(user: { id: string; email?: string; username?: string }): Promise<void> {
    if (!this.sentryInitialized) {
      return;
    }

    try {
      const Sentry = await import('@sentry/capacitor');
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username
      });
    } catch (error) {
      console.error('Failed to set Sentry user context:', error);
    }
  }

  /**
   * Clear user context on logout
   */
  async clearUserContext(): Promise<void> {
    if (!this.sentryInitialized) {
      return;
    }

    try {
      const Sentry = await import('@sentry/capacitor');
      Sentry.setUser(null);
    } catch (error) {
      console.error('Failed to clear Sentry user context:', error);
    }
  }

  /**
   * Create a custom error
   */
  createError(
    type: ErrorType,
    severity: ErrorSeverity,
    message: string,
    userMessage?: string,
    context?: any
  ): AppError {
    return {
      type,
      severity,
      message,
      userMessage: userMessage || message,
      context,
      timestamp: new Date(),
      url: this.router.url,
      recoverable: type !== ErrorType.UNKNOWN && severity !== ErrorSeverity.CRITICAL
    };
  }

  /**
   * Handle error manually (for use in try-catch blocks)
   */
  handleCustomError(
    type: ErrorType,
    severity: ErrorSeverity,
    message: string,
    userMessage?: string,
    context?: any
  ): void {
    const error = this.createError(type, severity, message, userMessage, context);
    this.handleError(error);
  }

  /**
   * Log a non-error message (info or warning)
   */
  logInfo(message: string, context?: any): void {
    this.logCustomError(message, context, 'info');
  }

  logWarning(message: string, context?: any): void {
    this.logCustomError(message, context, 'warning');
  }

  /**
   * Check if an error is recoverable
   */
  isRecoverableError(error: any): boolean {
    const appError = this.classifyError(error);
    return appError.recoverable;
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): {
    total: number;
    byType: Record<ErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
  } {
    const stats = {
      total: this.errorLogs.length,
      byType: {} as Record<ErrorType, number>,
      bySeverity: {} as Record<ErrorSeverity, number>
    };

    // Initialize counters
    Object.values(ErrorType).forEach(type => {
      stats.byType[type as ErrorType] = 0;
    });

    Object.values(ErrorSeverity).forEach(severity => {
      stats.bySeverity[severity as ErrorSeverity] = 0;
    });

    // Count errors
    this.errorLogs.forEach(log => {
      if (log.errorType) {
        stats.byType[log.errorType]++;
      }
      if (log.severity) {
        stats.bySeverity[log.severity]++;
      }
    });

    return stats;
  }
}
