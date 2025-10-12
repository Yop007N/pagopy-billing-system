import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, LoginDto, CreateUserDto } from '@pago-py/shared-models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Private signals for tokens and user
  private accessTokenSignal = signal<string | null>(null);
  private refreshTokenSignal = signal<string | null>(null);
  private currentUserSignal = signal<User | null>(null);

  // Public readonly signals
  currentUser = this.currentUserSignal.asReadonly();

  // Computed signal for authentication status
  isAuthenticated = computed(() => !!this.currentUserSignal() && !!this.accessTokenSignal());

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const accessToken = this.getAccessToken();
    if (accessToken) {
      this.accessTokenSignal.set(accessToken);
      // Load user data from API
      this.getCurrentUser().subscribe({
        error: () => {
          // If token is invalid, clear everything
          this.clearAuth();
        }
      });
    }
  }

  /**
   * Login user with email and password
   */
  login(email: string, password: string): Observable<AuthResponse> {
    const loginData: LoginDto = { email, password };

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, loginData).pipe(
      tap(response => {
        this.setTokens(response.accessToken, response.refreshToken);
        this.currentUserSignal.set(response.user);
      }),
      catchError(error => {
        console.error('Login error:', error);
        const errorMessage = error.error?.message || 'Credenciales inválidas';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Register new user with complete data
   */
  register(userData: CreateUserDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData).pipe(
      tap(response => {
        // Auto-login after successful registration
        this.setTokens(response.accessToken, response.refreshToken);
        this.currentUserSignal.set(response.user);
      }),
      catchError(error => {
        console.error('Registration error:', error);
        const errorMessage = error.error?.message || 'Error al registrar usuario';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Logout user and clear all auth data
   */
  logout(): void {
    this.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Get current user from API
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`).pipe(
      tap(user => {
        this.currentUserSignal.set(user);
      }),
      catchError(error => {
        console.error('Get current user error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get access token (used by interceptor)
   */
  getAccessToken(): string | null {
    if (this.accessTokenSignal()) {
      return this.accessTokenSignal();
    }
    // Fallback to localStorage for page refresh
    return localStorage.getItem('access_token');
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    if (this.refreshTokenSignal()) {
      return this.refreshTokenSignal();
    }
    return localStorage.getItem('refresh_token');
  }

  /**
   * Set authentication tokens
   */
  private setTokens(accessToken: string, refreshToken?: string): void {
    this.accessTokenSignal.set(accessToken);
    localStorage.setItem('access_token', accessToken);

    if (refreshToken) {
      this.refreshTokenSignal.set(refreshToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  /**
   * Clear all authentication data
   */
  private clearAuth(): void {
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.currentUserSignal.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}
