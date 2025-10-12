import { Injectable } from '@angular/core';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';
import { Platform } from '@ionic/angular/standalone';

export interface BarcodeScanResult {
  hasContent: boolean;
  content?: string;
  format?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BarcodeScannerService {
  constructor(private platform: Platform) {}

  /**
   * Check if the device supports barcode scanning
   */
  async isSupported(): Promise<boolean> {
    try {
      // Check if we're on a mobile platform
      if (!this.platform.is('capacitor')) {
        return false;
      }

      // Check if camera permission is available
      const status = await BarcodeScanner.checkPermission({ force: false });
      return status.granted || status.neverAsked;
    } catch (error) {
      console.error('Error checking barcode scanner support:', error);
      return false;
    }
  }

  /**
   * Request camera permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });

      if (status.denied) {
        // Permission permanently denied
        return false;
      }

      if (status.neverAsked || status.restricted) {
        // Request permission
        const permissionStatus = await BarcodeScanner.checkPermission({ force: true });
        return permissionStatus.granted;
      }

      return status.granted;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  /**
   * Start scanning for barcodes
   */
  async startScan(): Promise<BarcodeScanResult> {
    try {
      // Check permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error('Camera permission not granted');
      }

      // Prepare scanner (hide background)
      await BarcodeScanner.prepare();

      // Make background transparent
      document.body.classList.add('barcode-scanner-active');

      // Start scanning
      const result = await BarcodeScanner.startScan({
        targetedFormats: [
          SupportedFormat.QR_CODE,
          SupportedFormat.EAN_13,
          SupportedFormat.EAN_8,
          SupportedFormat.CODE_128,
          SupportedFormat.CODE_39,
          SupportedFormat.UPC_A,
          SupportedFormat.UPC_E
        ]
      });

      // Remove transparent background
      document.body.classList.remove('barcode-scanner-active');

      if (result.hasContent) {
        return {
          hasContent: true,
          content: result.content,
          format: result.format
        };
      }

      return { hasContent: false };
    } catch (error: any) {
      // Clean up on error
      document.body.classList.remove('barcode-scanner-active');
      await this.stopScan();
      throw error;
    }
  }

  /**
   * Stop scanning
   */
  async stopScan(): Promise<void> {
    try {
      await BarcodeScanner.stopScan();
      document.body.classList.remove('barcode-scanner-active');
    } catch (error) {
      console.error('Error stopping barcode scanner:', error);
    }
  }

  /**
   * Open device settings to enable camera permission
   */
  async openSettings(): Promise<void> {
    try {
      await BarcodeScanner.openAppSettings();
    } catch (error) {
      console.error('Error opening app settings:', error);
    }
  }

  /**
   * Scan from image file (alternative method)
   */
  async scanFromImage(_imageUrl: string): Promise<BarcodeScanResult> {
    // This would require a different library or API
    // For now, return not supported
    throw new Error('Scanning from image not yet implemented');
  }

  /**
   * Check if torch/flashlight is available
   */
  async isTorchAvailable(): Promise<boolean> {
    try {
      // This depends on device capabilities
      // @capacitor-community/barcode-scanner doesn't provide this directly
      return this.platform.is('android') || this.platform.is('ios');
    } catch (error) {
      return false;
    }
  }

  /**
   * Toggle torch/flashlight
   */
  async toggleTorch(_enabled: boolean): Promise<void> {
    // @capacitor-community/barcode-scanner doesn't provide torch control
    // This would need to be implemented with @capacitor/camera or similar
    console.log('Torch control not available in current implementation');
  }

  /**
   * Validate barcode format
   */
  isValidBarcodeFormat(barcode: string, expectedFormat?: string): boolean {
    if (!barcode) return false;

    // Basic validation
    if (expectedFormat === 'EAN13' || expectedFormat === 'EAN-13') {
      return /^\d{13}$/.test(barcode);
    }

    if (expectedFormat === 'EAN8' || expectedFormat === 'EAN-8') {
      return /^\d{8}$/.test(barcode);
    }

    if (expectedFormat === 'UPC_A' || expectedFormat === 'UPC-A') {
      return /^\d{12}$/.test(barcode);
    }

    // Default: accept any non-empty string
    return barcode.length > 0;
  }
}
