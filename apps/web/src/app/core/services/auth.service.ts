import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSignal = signal<User | null>(null);
  private tokenKey = 'auth_token';

  currentUser = this.currentUserSignal.asReadonly();

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    if (token) {
      // TODO: Validate token and load user from API
      // For now, we'll just check if token exists
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        this.setToken(response.token);
        this.currentUserSignal.set(response.user);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Credenciales inválidas'));
      })
    );
  }

  register(name: string, email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/register`, {
      name,
      email,
      password
    }).pipe(
      tap(response => {
        this.setToken(response.token);
        this.currentUserSignal.set(response.user);
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => new Error('Error al registrar usuario'));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }
}
