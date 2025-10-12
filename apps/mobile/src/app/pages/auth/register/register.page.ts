/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonBackButton,
  IonButtons,
  IonText,
  IonSpinner,
  IonCheckbox,
  IonLabel,
  IonNote,
  IonProgressBar,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personAddOutline,
  mailOutline,
  lockClosedOutline,
  personOutline,
  businessOutline,
  documentTextOutline,
  calendarOutline,
  eyeOutline,
  eyeOffOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterData } from '../../../models/user.model';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
}

interface FormFieldError {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  ruc?: string;
  razonSocial?: string;
  timbrado?: string;
  timbradoVence?: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonBackButton,
    IonButtons,
    IonText,
    IonSpinner,
    IonCheckbox,
    IonLabel,
    IonNote,
    IonProgressBar
  ]
})
export class RegisterPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastController = inject(ToastController);

  userData: RegisterData & { confirmPassword: string; acceptTerms: boolean } = {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    ruc: '',
    razonSocial: '',
    timbrado: '',
    timbradoVence: '',
    acceptTerms: false
  };

  loading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  fieldErrors = signal<FormFieldError>({});
  acceptTerms = signal(false);

  // Password strength computed signal
  passwordStrength = computed(() => this.calculatePasswordStrength(this.userData.password));

  constructor() {
    addIcons({
      personAddOutline,
      mailOutline,
      lockClosedOutline,
      personOutline,
      businessOutline,
      documentTextOutline,
      calendarOutline,
      eyeOutline,
      eyeOffOutline,
      alertCircleOutline,
      checkmarkCircleOutline,
      shieldCheckmarkOutline
    });
  }

  /**
   * Calculate password strength
   */
  private calculatePasswordStrength(password: string): PasswordStrength {
    if (!password) {
      return {
        score: 0,
        label: '',
        color: 'medium',
        suggestions: []
      };
    }

    let score = 0;
    const suggestions: string[] = [];

    // Length check
    if (password.length >= 8) score += 25;
    else suggestions.push('Al menos 8 caracteres');

    if (password.length >= 12) score += 10;

    // Has lowercase
    if (/[a-z]/.test(password)) score += 15;
    else suggestions.push('Letras minúsculas');

    // Has uppercase
    if (/[A-Z]/.test(password)) score += 15;
    else suggestions.push('Letras mayúsculas');

    // Has numbers
    if (/\d/.test(password)) score += 15;
    else suggestions.push('Números');

    // Has special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;
    else suggestions.push('Caracteres especiales (!@#$%...)');

    let label = '';
    let color = 'medium';

    if (score >= 80) {
      label = 'Muy Fuerte';
      color = 'success';
    } else if (score >= 60) {
      label = 'Fuerte';
      color = 'success';
    } else if (score >= 40) {
      label = 'Media';
      color = 'warning';
    } else if (score > 0) {
      label = 'Débil';
      color = 'danger';
    }

    return { score, label, color, suggestions };
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate RUC format (Paraguay format: 6-8 digits + hyphen + 1 digit)
   */
  private validateRUC(ruc: string): boolean {
    const rucRegex = /^\d{6,8}-\d$/;
    return rucRegex.test(ruc);
  }

  /**
   * Validate form with detailed field-level errors
   */
  private validateForm(): boolean {
    const errors: FormFieldError = {};
    let isValid = true;

    // Clear previous errors
    this.errorMessage.set('');
    this.fieldErrors.set({});

    // Validate firstName
    if (!this.userData.firstName || this.userData.firstName.trim().length === 0) {
      errors.firstName = 'El nombre es requerido';
      isValid = false;
    } else if (this.userData.firstName.trim().length < 2) {
      errors.firstName = 'El nombre debe tener al menos 2 caracteres';
      isValid = false;
    }

    // Validate lastName
    if (!this.userData.lastName || this.userData.lastName.trim().length === 0) {
      errors.lastName = 'El apellido es requerido';
      isValid = false;
    } else if (this.userData.lastName.trim().length < 2) {
      errors.lastName = 'El apellido debe tener al menos 2 caracteres';
      isValid = false;
    }

    // Validate email
    if (!this.userData.email) {
      errors.email = 'El correo electrónico es requerido';
      isValid = false;
    } else if (!this.validateEmail(this.userData.email)) {
      errors.email = 'Ingrese un correo electrónico válido';
      isValid = false;
    }

    // Validate password
    if (!this.userData.password) {
      errors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (this.userData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
      isValid = false;
    } else if (this.passwordStrength().score < 40) {
      errors.password = 'La contraseña es muy débil. Mejore su seguridad.';
      isValid = false;
    }

    // Validate confirmPassword
    if (!this.userData.confirmPassword) {
      errors.confirmPassword = 'Debe confirmar la contraseña';
      isValid = false;
    } else if (this.userData.password !== this.userData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    // Validate RUC
    if (!this.userData.ruc) {
      errors.ruc = 'El RUC es requerido';
      isValid = false;
    } else if (!this.validateRUC(this.userData.ruc)) {
      errors.ruc = 'RUC inválido. Formato: ######-# o ########-#';
      isValid = false;
    }

    // Validate razonSocial
    if (!this.userData.razonSocial || this.userData.razonSocial.trim().length === 0) {
      errors.razonSocial = 'La razón social es requerida';
      isValid = false;
    } else if (this.userData.razonSocial.trim().length < 3) {
      errors.razonSocial = 'La razón social debe tener al menos 3 caracteres';
      isValid = false;
    }

    // Validate timbrado
    if (!this.userData.timbrado) {
      errors.timbrado = 'El número de timbrado es requerido';
      isValid = false;
    } else if (this.userData.timbrado.length < 8) {
      errors.timbrado = 'El timbrado debe tener al menos 8 caracteres';
      isValid = false;
    }

    // Validate timbradoVence
    if (!this.userData.timbradoVence) {
      errors.timbradoVence = 'La fecha de vencimiento es requerida';
      isValid = false;
    } else {
      const venceDate = new Date(this.userData.timbradoVence);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (venceDate < today) {
        errors.timbradoVence = 'La fecha debe ser futura';
        isValid = false;
      }
    }

    // Validate terms acceptance
    if (!this.acceptTerms()) {
      this.errorMessage.set('Debe aceptar los términos y condiciones');
      isValid = false;
    }

    this.fieldErrors.set(errors);
    return isValid;
  }

  /**
   * Handle registration submission
   */
  async onRegister() {
    // Validate form
    if (!this.validateForm()) {
      this.showErrorToast('Por favor corrija los errores en el formulario');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    // Remove confirmPassword and acceptTerms before sending
    const { confirmPassword: _confirmPassword, acceptTerms: _acceptTerms, ...registerData } = this.userData;

    this.authService.register(registerData).subscribe({
      next: async (response) => {
        this.loading.set(false);

        // Show success message
        const toast = await this.toastController.create({
          message: 'Cuenta creada exitosamente! Bienvenido!',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();

        // Navigate to home
        this.router.navigate(['/tabs/home']);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message || 'Error al crear la cuenta');
        this.showErrorToast(this.errorMessage());
      }
    });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Toggle confirm password visibility
   */
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  /**
   * Toggle terms acceptance
   */
  toggleTermsAcceptance() {
    this.acceptTerms.set(!this.acceptTerms());
    this.userData.acceptTerms = this.acceptTerms();
  }

  /**
   * Format RUC input (auto-add hyphen)
   */
  onRucInput(event: any) {
    let value = event.target.value.replace(/[^0-9]/g, '');

    if (value.length > 8) {
      value = value.substring(0, 9);
    }

    if (value.length > 6) {
      value = value.substring(0, value.length - 1) + '-' + value.substring(value.length - 1);
    }

    this.userData.ruc = value;
  }

  /**
   * Navigate to login page
   */
  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Show error toast
   */
  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }

}
