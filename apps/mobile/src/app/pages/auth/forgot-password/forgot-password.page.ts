/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner,
  IonNote,
  IonBackButton,
  IonButtons,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  arrowBackOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  sendOutline
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { NetworkService } from '../../../core/services/network.service';

/**
 * Forgot Password Page
 *
 * Handles password recovery flow:
 * 1. User enters email
 * 2. Validates email format
 * 3. Sends reset request to backend
 * 4. Displays success message with instructions
 * 5. Handles offline scenarios gracefully
 */
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonSpinner,
    IonNote,
    IonBackButton,
    IonButtons
  ]
})
export class ForgotPasswordPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private networkService = inject(NetworkService);

  forgotPasswordForm: FormGroup;
  loading = signal(false);
  emailSent = signal(false);
  errorMessage = signal('');
  isOnline = signal(true);

  constructor() {
    addIcons({
      mailOutline,
      arrowBackOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      sendOutline
    });

    // Initialize form with validation
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Monitor network status
    this.checkNetworkStatus();
  }

  /**
   * Check network connectivity
   */
  private async checkNetworkStatus() {
    this.isOnline.set(await this.networkService.isOnline());
  }

  /**
   * Get form control for template access
   */
  get emailControl() {
    return this.forgotPasswordForm.get('email');
  }

  /**
   * Handle form submission
   */
  async onSubmit() {
    // Check network connectivity first
    if (!this.isOnline()) {
      await this.showOfflineAlert();
      return;
    }

    // Validate form
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const email = this.emailControl?.value;

    this.authService.forgotPassword(email).subscribe({
      next: async () => {
        this.loading.set(false);
        this.emailSent.set(true);

        // Show success toast
        const toast = await this.toastController.create({
          message: 'Se ha enviado un correo con instrucciones para restablecer su contraseña',
          duration: 4000,
          position: 'top',
          color: 'success',
          icon: 'checkmark-circle-outline'
        });
        await toast.present();

        // Reset form
        this.forgotPasswordForm.reset();
      },
      error: async (error) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.message || 'Error al enviar el correo. Por favor, intente nuevamente.'
        );

        // Show error toast
        const toast = await this.toastController.create({
          message: this.errorMessage(),
          duration: 4000,
          position: 'top',
          color: 'danger',
          icon: 'alert-circle-outline'
        });
        await toast.present();
      }
    });
  }

  /**
   * Navigate back to login
   */
  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Try again (reset form and success state)
   */
  tryAgain() {
    this.emailSent.set(false);
    this.errorMessage.set('');
    this.forgotPasswordForm.reset();
  }

  /**
   * Show offline alert
   */
  private async showOfflineAlert() {
    const alert = await this.alertController.create({
      header: 'Sin Conexión',
      message: 'Esta función requiere conexión a internet. Por favor, verifique su conexión y vuelva a intentar.',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        },
        {
          text: 'Reintentar',
          handler: async () => {
            await this.checkNetworkStatus();
            if (this.isOnline()) {
              await this.onSubmit();
            } else {
              await this.showOfflineAlert();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Get validation error message for email field
   */
  getEmailError(): string {
    const control = this.emailControl;

    if (!control || !control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'El correo electrónico es requerido';
    }

    if (control.hasError('email')) {
      return 'Ingrese un correo electrónico válido';
    }

    return '';
  }
}
