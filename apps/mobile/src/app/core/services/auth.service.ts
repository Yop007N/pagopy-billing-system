import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, from } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import {
  User,
  AuthResponse,
  RefreshTokenResponse,
  LoginCredentials,
  RegisterData
} from '../../models/user.model';
import { StorageService } from '../../services/storage.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storageService = inject(StorageService);

  private readonly API_URL = environment.apiUrl;
  private readonly ACCESS_TOKEN_KEY = environment.storageKeys.accessToken;
  private readonly REFRESH_TOKEN_KEY = environment.storageKeys.refreshToken;
  private readonly USER_KEY = environment.storageKeys.currentUser;

  // Signals for reactive state
  isAuthenticated = signal<boolean>(false);
  currentUser = signal<User | null>(null);
  isLoading = signal<boolean>(false);

  // BehaviorSubject for additional stream-based needs
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from storage
   */
  private async initializeAuth(): Promise<void> {
    try {
      const [token, user] = await Promise.all([
        this.storageService.get<string>(this.ACCESS_TOKEN_KEY),
        this.storageService.get<User>(this.USER_KEY)
      ]);

      if (token && user) {
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        this.isAuthenticatedSubject.next(true);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      await this.clearAuthData();
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.isLoading.set(true);

    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      switchMap(response => from(this.handleAuthResponse(response))),
      tap(() => this.isLoading.set(false)),
      catchError(error => {
        this.isLoading.set(false);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Register new user
   */
  register(data: RegisterData): Observable<AuthResponse> {
    this.isLoading.set(true);

    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, data).pipe(
      switchMap(response => from(this.handleAuthResponse(response))),
      tap(() => this.isLoading.set(false)),
      catchError(error => {
        this.isLoading.set(false);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = await this.storageService.get<string>(this.REFRESH_TOKEN_KEY);

      if (refreshToken) {
        // Call backend logout endpoint (optional, depending on backend implementation)
        this.http.post(`${this.API_URL}/auth/logout`, { refreshToken }).subscribe({
          error: (err) => console.error('Logout endpoint error:', err)
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      await this.clearAuthData();
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    return from(this.storageService.get<string>(this.REFRESH_TOKEN_KEY)).pipe(
      switchMap(refreshToken => {
        if (!refreshToken) {
          return throwError(() => new Error('No refresh token available'));
        }

        return this.http.post<RefreshTokenResponse>(
          `${this.API_URL}/auth/refresh`,
          { refreshToken }
        );
      }),
      switchMap(response => from(this.handleRefreshResponse(response))),
      catchError(error => {
        // If refresh fails, logout user
        this.logout();
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get current user from API
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/auth/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.storageService.set(this.USER_KEY, user);
      }),
      catchError(error => {
        console.error('Error getting current user:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get access token from storage
   */
  async getAccessToken(): Promise<string | null> {
    return await this.storageService.get<string>(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from storage
   */
  async getRefreshToken(): Promise<string | null> {
    return await this.storageService.get<string>(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  async checkAuthStatus(): Promise<boolean> {
    const token = await this.getAccessToken();
    const user = await this.storageService.get<User>(this.USER_KEY);

    const isAuth = !!(token && user);
    this.isAuthenticated.set(isAuth);
    this.isAuthenticatedSubject.next(isAuth);

    if (isAuth && user) {
      this.currentUser.set(user);
    }

    return isAuth;
  }

  /**
   * Update user data in storage and signal
   */
  async updateUser(user: User): Promise<void> {
    this.currentUser.set(user);
    await this.storageService.set(this.USER_KEY, user);
  }

  /**
   * Request password reset email
   */
  forgotPassword(email: string): Observable<{ message: string }> {
    this.isLoading.set(true);

    return this.http.post<{ message: string }>(
      `${this.API_URL}/auth/forgot-password`,
      { email }
    ).pipe(
      tap(() => this.isLoading.set(false)),
      catchError(error => {
        this.isLoading.set(false);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    this.isLoading.set(true);

    return this.http.post<{ message: string }>(
      `${this.API_URL}/auth/reset-password`,
      { token, newPassword }
    ).pipe(
      tap(() => this.isLoading.set(false)),
      catchError(error => {
        this.isLoading.set(false);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Handle successful authentication response
   */
  private async handleAuthResponse(response: AuthResponse): Promise<AuthResponse> {
    await Promise.all([
      this.storageService.set(this.ACCESS_TOKEN_KEY, response.accessToken),
      this.storageService.set(this.REFRESH_TOKEN_KEY, response.refreshToken),
      this.storageService.set(this.USER_KEY, response.user)
    ]);

    this.currentUser.set(response.user);
    this.isAuthenticated.set(true);
    this.isAuthenticatedSubject.next(true);

    return response;
  }

  /**
   * Handle refresh token response
   */
  private async handleRefreshResponse(
    response: RefreshTokenResponse
  ): Promise<RefreshTokenResponse> {
    await Promise.all([
      this.storageService.set(this.ACCESS_TOKEN_KEY, response.accessToken),
      this.storageService.set(this.REFRESH_TOKEN_KEY, response.refreshToken)
    ]);

    return response;
  }

  /**
   * Clear all authentication data
   */
  private async clearAuthData(): Promise<void> {
    await Promise.all([
      this.storageService.remove(this.ACCESS_TOKEN_KEY),
      this.storageService.remove(this.REFRESH_TOKEN_KEY),
      this.storageService.remove(this.USER_KEY)
    ]);

    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Error {
    let errorMessage = 'Ocurrió un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Credenciales inválidas';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Datos inválidos';
      } else if (error.status === 409) {
        errorMessage = error.error?.message || 'El usuario ya existe';
      } else if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión.';
      } else {
        errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
    }

    console.error('Auth error:', error);
    return new Error(errorMessage);
  }
}
