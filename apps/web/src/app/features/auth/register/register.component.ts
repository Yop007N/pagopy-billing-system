import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="register-container flex items-center justify-center min-h-[80vh]">
      <mat-card class="register-card max-w-md w-full">
        <mat-card-header>
          <mat-card-title class="text-2xl font-bold text-center w-full">
            Registro
          </mat-card-title>
        </mat-card-header>

        <mat-card-content class="mt-4">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="w-full mb-4">
              <mat-label>Nombre completo</mat-label>
              <input matInput type="text" formControlName="name">
              <mat-icon matPrefix>person</mat-icon>
              @if (registerForm.get('name')?.hasError('required') && registerForm.get('name')?.touched) {
                <mat-error>El nombre es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full mb-4">
              <mat-label>Correo electrónico</mat-label>
              <input matInput type="email" formControlName="email" placeholder="correo@ejemplo.com">
              <mat-icon matPrefix>email</mat-icon>
              @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
                <mat-error>El correo es requerido</mat-error>
              }
              @if (registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched) {
                <mat-error>Correo inválido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full mb-4">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="togglePasswordVisibility()">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
                <mat-error>La contraseña es requerida</mat-error>
              }
              @if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
                <mat-error>Mínimo 6 caracteres</mat-error>
              }
            </mat-form-field>

            @if (errorMessage()) {
              <div class="error-message bg-red-100 text-red-700 p-3 rounded mb-4">
                {{ errorMessage() }}
              </div>
            }

            @if (successMessage()) {
              <div class="success-message bg-green-100 text-green-700 p-3 rounded mb-4">
                {{ successMessage() }}
              </div>
            }

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="w-full"
              [disabled]="registerForm.invalid || isLoading()">
              @if (isLoading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Registrarse
              }
            </button>
          </form>

          <div class="mt-4 text-center">
            <p class="text-gray-600">
              ¿Ya tienes cuenta?
              <a routerLink="/auth/login" class="text-primary font-semibold">Inicia sesión</a>
            </p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-card {
      padding: 2rem;
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  hidePassword = signal(true);
  isLoading = signal(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const { name, email, password } = this.registerForm.value;

      this.authService.register(name, email, password).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('Registro exitoso. Redirigiendo...');
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.message || 'Error al registrarse. Intenta nuevamente.');
        }
      });
    }
  }
}
