/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
  IonCheckbox,
  IonNote,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logInOutline,
  personOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  fingerPrintOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { BiometricService } from '../../../core/services/biometric.service';
import { LoginCredentials } from '../../../models/user.model';
import { StorageService } from '../../../services/storage.service';

interface ExtendedLoginCredentials extends LoginCredentials {
  rememberMe?: boolean;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
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
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonSpinner,
    IonCheckbox,
    IonNote
  ]
})
export class LoginPage implements OnInit {
  private authService = inject(AuthService);
  private biometricService = inject(BiometricService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private storageService = inject(StorageService);

  credentials: ExtendedLoginCredentials = {
    email: '',
    password: '',
    rememberMe: false
  };

  loading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  rememberMe = signal(false);
  biometricAvailable = signal(false);
  fieldErrors = signal<{ email?: string; password?: string }>({});

  private readonly REMEMBER_ME_KEY = 'remember_me_email';
  private readonly BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

  constructor() {
    addIcons({
      logInOutline,
      personOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      fingerPrintOutline,
      alertCircleOutline
    });
  }

  async ngOnInit() {
    // Load remembered email
    await this.loadRememberedEmail();

    // Check for biometric availability
    await this.checkBiometricAvailability();

    // Auto-login with biometrics if enabled
    await this.attemptBiometricLogin();
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate login form
   */
  private validateForm(): boolean {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    // Clear previous errors
    this.errorMessage.set('');
    this.fieldErrors.set({});

    // Validate email
    if (!this.credentials.email) {
      errors.email = 'El correo electrónico es requerido';
      isValid = false;
    } else if (!this.validateEmail(this.credentials.email)) {
      errors.email = 'Ingrese un correo electrónico válido';
      isValid = false;
    }

    // Validate password
    if (!this.credentials.password) {
      errors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (this.credentials.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    this.fieldErrors.set(errors);
    return isValid;
  }

  /**
   * Handle login submission
   */
  async onLogin() {
    // Validate form
    if (!this.validateForm()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.credentials).subscribe({
      next: async (response) => {
        this.loading.set(false);

        // Save email if remember me is checked
        if (this.rememberMe()) {
          await this.storageService.set(this.REMEMBER_ME_KEY, this.credentials.email);
        } else {
          await this.storageService.remove(this.REMEMBER_ME_KEY);
        }

        // Check if biometric is available and prompt user to enable it
        await this.promptBiometricEnrollment();

        // Show success message
        const toast = await this.toastController.create({
          message: `Bienvenido ${response.user.firstName}!`,
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();

        // Get return URL from query params or default to home
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/tabs/home';
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message || 'Error al iniciar sesión. Verifique sus credenciales.');

        // Show error toast
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
   * Toggle remember me
   */
  toggleRememberMe() {
    this.rememberMe.set(!this.rememberMe());
    this.credentials.rememberMe = this.rememberMe();
  }

  /**
   * Load remembered email from storage
   */
  private async loadRememberedEmail() {
    try {
      const savedEmail = await this.storageService.get<string>(this.REMEMBER_ME_KEY);
      if (savedEmail) {
        this.credentials.email = savedEmail;
        this.rememberMe.set(true);
        this.credentials.rememberMe = true;
      }
    } catch (error) {
      console.error('Error loading remembered email:', error);
    }
  }

  /**
   * Check if biometric authentication is available
   */
  private async checkBiometricAvailability() {
    try {
      const capability = await this.biometricService.checkBiometricCapability();
      const isEnabled = await this.biometricService.isBiometricEnabled();

      // Show biometric button only if available AND user has enabled it
      this.biometricAvailable.set(capability.isAvailable && isEnabled);

      if (capability.isAvailable) {
        console.log(`Biometric available: ${this.biometricService.getBiometryTypeName()}`);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      this.biometricAvailable.set(false);
    }
  }

  /**
   * Attempt biometric login if enabled
   */
  private async attemptBiometricLogin() {
    try {
      const biometricEnabled = await this.biometricService.isBiometricEnabled();

      if (biometricEnabled && this.biometricAvailable()) {
        // Auto-trigger biometric authentication on page load (optional)
        // Uncomment the line below to enable auto-authentication
        // await this.onBiometricLogin();
        console.log('Biometric authentication available and enabled');
      }
    } catch (error) {
      console.error('Error attempting biometric login:', error);
    }
  }

  /**
   * Handle biometric login button click
   */
  async onBiometricLogin() {
    try {
      this.loading.set(true);
      this.errorMessage.set('');

      // Get stored biometric credentials
      const credentials = await this.biometricService.getBiometricCredentials();

      if (!credentials) {
        throw new Error('No se encontraron credenciales almacenadas');
      }

      // Login with stored credentials
      this.authService.login({
        email: credentials.email,
        password: credentials.password
      }).subscribe({
        next: async (response) => {
          this.loading.set(false);

          // Show success message
          const toast = await this.toastController.create({
            message: `Bienvenido ${response.user.firstName}!`,
            duration: 2000,
            position: 'top',
            color: 'success'
          });
          await toast.present();

          // Navigate to home
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/tabs/home';
          this.router.navigate([returnUrl]);
        },
        error: async (error) => {
          this.loading.set(false);
          console.error('Biometric login error:', error);

          // If login fails, disable biometric authentication
          await this.biometricService.disableBiometric();
          this.biometricAvailable.set(false);

          const alert = await this.alertController.create({
            header: 'Error de Autenticación',
            message: 'Las credenciales almacenadas no son válidas. Por favor, inicie sesión manualmente y habilite la autenticación biométrica nuevamente.',
            buttons: ['OK']
          });
          await alert.present();
        }
      });
    } catch (error: any) {
      this.loading.set(false);
      console.error('Biometric authentication error:', error);

      // Show error message
      this.errorMessage.set(error.message || 'Error al autenticar con biometría');
    }
  }

  /**
   * Prompt user to enable biometric authentication after successful login
   */
  private async promptBiometricEnrollment() {
    try {
      // Check if biometric is already enabled
      const isEnabled = await this.biometricService.isBiometricEnabled();
      if (isEnabled) {
        return; // Already enabled, no need to prompt
      }

      // Check if biometric is available
      const capability = await this.biometricService.checkBiometricCapability();
      if (!capability.isAvailable) {
        return; // Not available, don't prompt
      }

      // Get biometry type name for the prompt
      const biometryName = this.biometricService.getBiometryTypeName(capability.biometryType);

      // Prompt user to enable biometric authentication
      const alert = await this.alertController.create({
        header: 'Habilitar Autenticación Biométrica',
        message: `¿Desea habilitar el inicio de sesión con ${biometryName}? Esto permitirá un acceso más rápido y seguro.`,
        buttons: [
          {
            text: 'Ahora no',
            role: 'cancel',
            handler: () => {
              console.log('User declined biometric enrollment');
            }
          },
          {
            text: 'Habilitar',
            handler: async () => {
              try {
                await this.biometricService.enableBiometric(
                  this.credentials.email,
                  this.credentials.password
                );

                // Update availability signal
                this.biometricAvailable.set(true);

                // Show success toast
                const toast = await this.toastController.create({
                  message: `${biometryName} habilitada correctamente`,
                  duration: 2000,
                  position: 'top',
                  color: 'success'
                });
                await toast.present();

                console.log('Biometric authentication enabled successfully');
              } catch (error) {
                console.error('Error enabling biometric:', error);

                // Show error toast
                const toast = await this.toastController.create({
                  message: 'No se pudo habilitar la autenticación biométrica',
                  duration: 3000,
                  position: 'top',
                  color: 'warning'
                });
                await toast.present();
              }
            }
          }
        ]
      });

      await alert.present();
    } catch (error) {
      console.error('Error prompting biometric enrollment:', error);
    }
  }

  /**
   * Navigate to forgot password page
   */
  onForgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }

  /**
   * Navigate to register page
   */
  goToRegister() {
    this.router.navigate(['/auth/register']);
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
