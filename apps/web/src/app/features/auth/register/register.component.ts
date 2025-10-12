import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { CreateUserDto } from '@pago-py/shared-models';

/**
 * Custom validator to ensure passwords match
 */
function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  };
}

/**
 * Custom validator to ensure date is in the future
 */
function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate > today ? null : { futureDate: true };
  };
}

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
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  registerForm: FormGroup;
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  isLoading = signal(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  constructor() {
    this.registerForm = this.fb.group({
      // Credentials
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],

      // Fiscal data
      ruc: ['', [Validators.required, Validators.pattern(/^\d{6,8}-\d$/)]],
      razonSocial: ['', [Validators.required, Validators.minLength(3)]],

      // Timbrado
      timbrado: ['', [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(8)]],
      timbradoVence: ['', [Validators.required, futureDateValidator()]]
    }, { validators: passwordMatchValidator() });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update(value => !value);
  }

  /**
   * Check if a specific field is valid
   */
  isFieldValid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.valid && field.touched);
  }

  /**
   * Check if a form step (section) is valid
   */
  isStepValid(step: 'credentials' | 'fiscal' | 'timbrado'): boolean {
    switch (step) {
      case 'credentials':
        return !!(
          this.registerForm.get('firstName')?.valid &&
          this.registerForm.get('lastName')?.valid &&
          this.registerForm.get('email')?.valid &&
          this.registerForm.get('password')?.valid &&
          this.registerForm.get('confirmPassword')?.valid &&
          !this.registerForm.hasError('passwordMismatch')
        );
      case 'fiscal':
        return !!(
          this.registerForm.get('ruc')?.valid &&
          this.registerForm.get('razonSocial')?.valid
        );
      case 'timbrado':
        return !!(
          this.registerForm.get('timbrado')?.valid &&
          this.registerForm.get('timbradoVence')?.valid
        );
      default:
        return false;
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const formValue = this.registerForm.value;

      const userData: CreateUserDto = {
        email: formValue.email,
        password: formValue.password,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        ruc: formValue.ruc,
        razonSocial: formValue.razonSocial,
        timbrado: formValue.timbrado,
        timbradoVence: formValue.timbradoVence
      };

      this.authService.register(userData).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('Registro exitoso. Redirigiendo...');
          this.snackBar.open('Registro exitoso. Bienvenido!', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading.set(false);
          const errorMsg = error.message || 'Error al registrarse. Intenta nuevamente.';
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
