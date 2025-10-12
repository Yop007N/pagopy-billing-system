import { Injectable, inject, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  BiometricAuth,
  CheckBiometryResult,
  BiometryType,
  BiometryErrorType
} from '@aparajita/capacitor-biometric-auth';
import { StorageService } from '../../services/storage.service';

/**
 * Biometric authentication result
 */
export interface BiometricAuthResult {
  success: boolean;
  errorMessage?: string;
  errorType?: BiometryErrorType;
}

/**
 * Stored biometric credentials
 */
export interface BiometricCredentials {
  email: string;
  password: string;
  enabled: boolean;
  enrolledAt: Date;
}

/**
 * Biometric capability information
 */
export interface BiometricCapability {
  isAvailable: boolean;
  biometryType: BiometryType;
  deviceSecure: boolean;
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BiometricService {
  private storageService = inject(StorageService);

  private readonly BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
  private readonly BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

  // Signal to track biometric availability
  private biometricAvailableSignal = signal<boolean>(false);
  readonly biometricAvailable = this.biometricAvailableSignal.asReadonly();

  // Signal to track biometric type
  private biometricTypeSignal = signal<BiometryType | null>(null);
  readonly biometricType = this.biometricTypeSignal.asReadonly();

  constructor() {
    this.checkBiometricCapability();
  }

  /**
   * Check if biometric authentication is available on the device
   */
  async checkBiometricCapability(): Promise<BiometricCapability> {
    try {
      // Biometric authentication is only available on native platforms
      if (!Capacitor.isNativePlatform()) {
        return {
          isAvailable: false,
          biometryType: BiometryType.none,
          deviceSecure: false,
          reason: 'Biometric authentication is not available on web platform'
        };
      }

      const result: CheckBiometryResult = await BiometricAuth.checkBiometry();

      this.biometricAvailableSignal.set(result.isAvailable);
      this.biometricTypeSignal.set(result.biometryType);

      return {
        isAvailable: result.isAvailable,
        biometryType: result.biometryType,
        deviceSecure: result.deviceIsSecure,
        reason: result.reason
      };
    } catch (error) {
      console.error('Error checking biometric capability:', error);
      this.biometricAvailableSignal.set(false);
      this.biometricTypeSignal.set(null);

      return {
        isAvailable: false,
        biometryType: BiometryType.none,
        deviceSecure: false,
        reason: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Authenticate using biometrics
   * @param reason - Optional reason to show to the user
   */
  async authenticate(reason?: string): Promise<BiometricAuthResult> {
    try {
      // Check if biometric is available
      const capability = await this.checkBiometricCapability();

      if (!capability.isAvailable) {
        return {
          success: false,
          errorMessage: capability.reason || 'Biometric authentication is not available'
        };
      }

      // Default reason based on biometry type
      const defaultReason = this.getDefaultAuthenticationReason(capability.biometryType);
      const authReason = reason || defaultReason;

      // Perform authentication
      await BiometricAuth.authenticate({
        reason: authReason,
        cancelTitle: 'Cancelar',
        allowDeviceCredential: true, // Allow PIN/Pattern as fallback
        iosFallbackTitle: 'Usar contraseña',
        androidTitle: 'Autenticación',
        androidSubtitle: 'Verificar identidad',
        androidConfirmationRequired: false
      });

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Biometric authentication error:', error);

      // Handle specific error types
      const errorType = error?.code as BiometryErrorType;
      let errorMessage = 'Error de autenticación biométrica';

      switch (errorType) {
        case BiometryErrorType.userCancel:
          errorMessage = 'Autenticación cancelada por el usuario';
          break;
        case BiometryErrorType.authenticationFailed:
          errorMessage = 'Autenticación fallida. Intente nuevamente';
          break;
        case BiometryErrorType.biometryNotAvailable:
          errorMessage = 'Autenticación biométrica no disponible';
          break;
        case BiometryErrorType.biometryNotEnrolled:
          errorMessage = 'No hay biometría configurada en el dispositivo';
          break;
        case BiometryErrorType.noDeviceCredential:
          errorMessage = 'No hay credenciales de seguridad configuradas';
          break;
        case BiometryErrorType.biometryLockout:
          errorMessage = 'Biometría bloqueada. Demasiados intentos fallidos';
          break;
        default:
          errorMessage = error?.message || 'Error desconocido';
      }

      return {
        success: false,
        errorMessage,
        errorType
      };
    }
  }

  /**
   * Check if biometric authentication is enabled for login
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await this.storageService.get<boolean>(this.BIOMETRIC_ENABLED_KEY);
      return enabled || false;
    } catch (error) {
      console.error('Error checking biometric enabled status:', error);
      return false;
    }
  }

  /**
   * Enable biometric authentication and store credentials securely
   * @param email - User email
   * @param password - User password (will be encrypted)
   */
  async enableBiometric(email: string, password: string): Promise<boolean> {
    try {
      // Verify biometric capability first
      const capability = await this.checkBiometricCapability();
      if (!capability.isAvailable) {
        throw new Error('Biometric authentication is not available');
      }

      // Authenticate user to confirm biometric setup
      const authResult = await this.authenticate('Habilitar autenticación biométrica');
      if (!authResult.success) {
        throw new Error(authResult.errorMessage || 'Authentication failed');
      }

      // Store credentials securely (encrypted)
      const credentials: BiometricCredentials = {
        email,
        password,
        enabled: true,
        enrolledAt: new Date()
      };

      await this.storageService.set(this.BIOMETRIC_CREDENTIALS_KEY, credentials, true);
      await this.storageService.set(this.BIOMETRIC_ENABLED_KEY, true);

      console.log('Biometric authentication enabled successfully');
      return true;
    } catch (error) {
      console.error('Error enabling biometric authentication:', error);
      throw error;
    }
  }

  /**
   * Disable biometric authentication and clear stored credentials
   */
  async disableBiometric(): Promise<void> {
    try {
      await this.storageService.remove(this.BIOMETRIC_CREDENTIALS_KEY);
      await this.storageService.remove(this.BIOMETRIC_ENABLED_KEY);
      console.log('Biometric authentication disabled successfully');
    } catch (error) {
      console.error('Error disabling biometric authentication:', error);
      throw error;
    }
  }

  /**
   * Get stored biometric credentials (encrypted)
   * Requires biometric authentication before retrieving
   */
  async getBiometricCredentials(): Promise<BiometricCredentials | null> {
    try {
      // Check if biometric is enabled
      const enabled = await this.isBiometricEnabled();
      if (!enabled) {
        return null;
      }

      // Authenticate user before retrieving credentials
      const authResult = await this.authenticate('Autenticar para iniciar sesión');
      if (!authResult.success) {
        throw new Error(authResult.errorMessage || 'Authentication failed');
      }

      // Retrieve encrypted credentials
      const credentials = await this.storageService.get<BiometricCredentials>(
        this.BIOMETRIC_CREDENTIALS_KEY,
        true
      );

      return credentials;
    } catch (error) {
      console.error('Error retrieving biometric credentials:', error);
      return null;
    }
  }

  /**
   * Get a user-friendly name for the biometry type
   */
  getBiometryTypeName(biometryType?: BiometryType | null): string {
    const type = biometryType || this.biometricType();

    switch (type) {
      case BiometryType.fingerprintAuthentication:
        return 'Huella Digital';
      case BiometryType.faceAuthentication:
        return 'Reconocimiento Facial';
      case BiometryType.irisAuthentication:
        return 'Reconocimiento de Iris';
      case BiometryType.none:
      default:
        return 'Biométrica';
    }
  }

  /**
   * Get the icon name for the biometry type
   */
  getBiometryIconName(biometryType?: BiometryType | null): string {
    const type = biometryType || this.biometricType();

    switch (type) {
      case BiometryType.fingerprintAuthentication:
        return 'finger-print-outline';
      case BiometryType.faceAuthentication:
        return 'scan-outline';
      case BiometryType.irisAuthentication:
        return 'eye-outline';
      case BiometryType.none:
      default:
        return 'lock-closed-outline';
    }
  }

  /**
   * Get default authentication reason based on biometry type
   */
  private getDefaultAuthenticationReason(biometryType: BiometryType): string {
    switch (biometryType) {
      case BiometryType.fingerprintAuthentication:
        return 'Autenticar con huella digital';
      case BiometryType.faceAuthentication:
        return 'Autenticar con reconocimiento facial';
      case BiometryType.irisAuthentication:
        return 'Autenticar con reconocimiento de iris';
      default:
        return 'Autenticar con biometría';
    }
  }

  /**
   * Check if device has secure screen lock (PIN, Pattern, Password)
   */
  async isDeviceSecure(): Promise<boolean> {
    try {
      const capability = await this.checkBiometricCapability();
      return capability.deviceSecure;
    } catch (error) {
      console.error('Error checking device security:', error);
      return false;
    }
  }
}
