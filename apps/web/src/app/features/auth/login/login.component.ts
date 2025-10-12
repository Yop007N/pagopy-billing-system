import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <div class="login-background"></div>

      <div class="login-content">
        <mat-card class="login-card" [@fadeInUp]>
          <!-- Logo and Brand Section -->
          <div class="brand-section">
            <div class="logo-container">
              <mat-icon class="brand-logo">receipt_long</mat-icon>
            </div>
            <h1 class="brand-title">PagoPy</h1>
            <p class="brand-subtitle">Sistema de Facturación Electrónica</p>
          </div>

          <!-- Login Form -->
          <mat-card-content class="form-content">
            <h2 class="form-title">Iniciar Sesión</h2>

            <form
              [formGroup]="loginForm"
              (ngSubmit)="onSubmit()"
              role="form"
              aria-label="Formulario de inicio de sesión">

              <!-- Email Field -->
              <mat-form-field appearance="outline" class="w-full custom-field">
                <mat-label>Correo electrónico</mat-label>
                <input
                  matInput
                  type="email"
                  formControlName="email"
                  placeholder="correo@ejemplo.com"
                  autocomplete="email"
                  aria-required="true"
                  aria-describedby="email-error">
                <mat-icon matPrefix class="field-icon">email</mat-icon>
                @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                  <mat-error id="email-error" role="alert">El correo es requerido</mat-error>
                }
                @if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
                  <mat-error id="email-error" role="alert">Correo inválido</mat-error>
                }
              </mat-form-field>

              <!-- Password Field -->
              <mat-form-field appearance="outline" class="w-full custom-field">
                <mat-label>Contraseña</mat-label>
                <input
                  matInput
                  [type]="hidePassword() ? 'password' : 'text'"
                  formControlName="password"
                  autocomplete="current-password"
                  aria-required="true"
                  aria-describedby="password-error">
                <mat-icon matPrefix class="field-icon">lock</mat-icon>
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="togglePasswordVisibility()"
                  [attr.aria-label]="hidePassword() ? 'Mostrar contraseña' : 'Ocultar contraseña'"
                  class="visibility-toggle">
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                  <mat-error id="password-error" role="alert">La contraseña es requerida</mat-error>
                }
                @if (loginForm.get('password')?.hasError('minlength') && loginForm.get('password')?.touched) {
                  <mat-error id="password-error" role="alert">La contraseña debe tener al menos 8 caracteres</mat-error>
                }
              </mat-form-field>

              <!-- Error Message Alert -->
              @if (errorMessage()) {
                <div
                  class="error-alert"
                  role="alert"
                  aria-live="assertive"
                  [@slideDown]>
                  <mat-icon class="error-icon">error_outline</mat-icon>
                  <span class="error-text">{{ errorMessage() }}</span>
                </div>
              }

              <!-- Submit Button -->
              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="submit-button"
                [disabled]="loginForm.invalid || isLoading()"
                [attr.aria-busy]="isLoading()">
                @if (isLoading()) {
                  <span class="button-content">
                    <mat-spinner diameter="24" class="button-spinner"></mat-spinner>
                    <span class="button-text">Iniciando sesión...</span>
                  </span>
                } @else {
                  <span class="button-content">
                    <mat-icon class="button-icon">login</mat-icon>
                    <span class="button-text">Iniciar Sesión</span>
                  </span>
                }
              </button>
            </form>

            <!-- Forgot Password Link -->
            <div class="forgot-password">
              <a href="#" class="link-text">¿Olvidaste tu contraseña?</a>
            </div>

            <!-- Divider -->
            <div class="divider">
              <span class="divider-text">o</span>
            </div>

            <!-- Register Link -->
            <div class="register-section">
              <p class="register-text">
                ¿No tienes cuenta?
                <a routerLink="/auth/register" class="register-link">
                  Regístrate aquí
                </a>
              </p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Footer -->
        <div class="login-footer">
          <p>© 2025 PagoPy. Sistema de Facturación Electrónica para Paraguay</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Container & Layout ===== */
    .login-container {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .login-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      opacity: 0.95;
      z-index: 0;
    }

    .login-background::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: backgroundMove 20s linear infinite;
    }

    @keyframes backgroundMove {
      0% { transform: translate(0, 0); }
      100% { transform: translate(50px, 50px); }
    }

    .login-content {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 480px;
      padding: 1.5rem;
    }

    /* ===== Card Styling ===== */
    .login-card {
      background: white;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 0;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .login-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
    }

    /* ===== Brand Section ===== */
    .brand-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 3rem 2rem 2.5rem;
      text-align: center;
      color: white;
    }

    .logo-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      margin-bottom: 1rem;
      backdrop-filter: blur(10px);
      animation: logoFloat 3s ease-in-out infinite;
    }

    @keyframes logoFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .brand-logo {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: white;
    }

    .brand-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      letter-spacing: 1px;
    }

    .brand-subtitle {
      font-size: 0.95rem;
      opacity: 0.95;
      margin: 0;
      font-weight: 300;
    }

    /* ===== Form Content ===== */
    .form-content {
      padding: 2.5rem 2rem 2rem !important;
    }

    .form-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 1.5rem 0;
      text-align: center;
    }

    /* ===== Form Fields ===== */
    .custom-field {
      margin-bottom: 1.5rem;
    }

    .custom-field ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: #f8fafc;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .custom-field ::ng-deep .mat-mdc-form-field-focus-overlay {
      background-color: rgba(102, 126, 234, 0.05);
    }

    .custom-field ::ng-deep .mdc-text-field--focused .mat-mdc-text-field-wrapper {
      background-color: white;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .field-icon {
      color: #667eea;
      margin-right: 0.5rem;
    }

    .visibility-toggle {
      transition: transform 0.2s ease;
    }

    .visibility-toggle:hover {
      transform: scale(1.1);
    }

    /* ===== Error Alert ===== */
    .error-alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      border-left: 4px solid #ef4444;
      color: #991b1b;
      padding: 1rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      animation: slideDown 0.3s ease-out;
    }

    .error-icon {
      color: #dc2626;
      font-size: 24px;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .error-text {
      flex: 1;
      line-height: 1.5;
    }

    /* ===== Submit Button ===== */
    .submit-button {
      width: 100%;
      height: 56px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 12px;
      margin-top: 0.5rem;
      text-transform: none;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
    }

    .submit-button:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }

    .submit-button:not(:disabled):active {
      transform: translateY(0);
    }

    .submit-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .button-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .button-spinner {
      display: inline-block;
    }

    .button-spinner ::ng-deep circle {
      stroke: white !important;
    }

    .button-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .button-text {
      line-height: 1;
    }

    /* ===== Forgot Password Link ===== */
    .forgot-password {
      text-align: center;
      margin-top: 1.25rem;
    }

    .link-text {
      color: #667eea;
      font-size: 0.9rem;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .link-text:hover {
      color: #764ba2;
      text-decoration: underline;
    }

    /* ===== Divider ===== */
    .divider {
      position: relative;
      text-align: center;
      margin: 2rem 0 1.5rem;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(to right, transparent, #e2e8f0, transparent);
    }

    .divider-text {
      position: relative;
      display: inline-block;
      padding: 0 1rem;
      background: white;
      color: #94a3b8;
      font-size: 0.85rem;
      font-weight: 500;
    }

    /* ===== Register Section ===== */
    .register-section {
      text-align: center;
      margin-top: 1rem;
    }

    .register-text {
      color: #64748b;
      font-size: 0.95rem;
      margin: 0;
    }

    .register-link {
      color: #667eea;
      font-weight: 600;
      text-decoration: none;
      margin-left: 0.25rem;
      transition: all 0.2s ease;
    }

    .register-link:hover {
      color: #764ba2;
      text-decoration: underline;
    }

    /* ===== Footer ===== */
    .login-footer {
      text-align: center;
      margin-top: 1.5rem;
      color: white;
      font-size: 0.85rem;
      opacity: 0.9;
    }

    .login-footer p {
      margin: 0;
    }

    /* ===== Responsive Design ===== */
    @media (max-width: 640px) {
      .login-content {
        padding: 1rem;
      }

      .brand-section {
        padding: 2rem 1.5rem 1.5rem;
      }

      .logo-container {
        width: 64px;
        height: 64px;
      }

      .brand-logo {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }

      .brand-title {
        font-size: 1.75rem;
      }

      .brand-subtitle {
        font-size: 0.85rem;
      }

      .form-content {
        padding: 2rem 1.5rem 1.5rem !important;
      }

      .form-title {
        font-size: 1.25rem;
      }

      .submit-button {
        height: 52px;
      }
    }

    @media (max-width: 400px) {
      .login-content {
        padding: 0.5rem;
      }

      .login-card {
        border-radius: 16px;
      }

      .form-content {
        padding: 1.5rem 1rem !important;
      }

      .custom-field {
        margin-bottom: 1rem;
      }

      .submit-button {
        height: 48px;
        font-size: 0.95rem;
      }
    }

    /* ===== Accessibility ===== */
    .submit-button:focus-visible,
    .link-text:focus-visible,
    .register-link:focus-visible {
      outline: 3px solid #667eea;
      outline-offset: 2px;
      border-radius: 4px;
    }

    .custom-field ::ng-deep .mat-mdc-input-element:focus {
      outline: none;
    }

    /* ===== Animations ===== */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
        max-height: 0;
      }
      to {
        opacity: 1;
        transform: translateY(0);
        max-height: 100px;
      }
    }

    /* Apply entrance animation */
    .login-card {
      animation: fadeInUp 0.6s ease-out;
    }
  `],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)', maxHeight: 0 }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)', maxHeight: '100px' }))
      ]),
      transition(':leave', [
        animate('0.2s ease-in', style({ opacity: 0, transform: 'translateY(-10px)', maxHeight: 0 }))
      ])
    ])
  ]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loginForm: FormGroup;
  hidePassword = signal(true);
  isLoading = signal(false);
  errorMessage = signal<string>('');

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.snackBar.open('Inicio de sesión exitoso', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading.set(false);
          const errorMsg = error.message || 'Error al iniciar sesión. Intenta nuevamente.';
          this.errorMessage.set(errorMsg);
          this.snackBar.open(errorMsg, 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}
