import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, Platform } from '@ionic/angular/standalone';

/**
 * DocumentScannerService - Handle document scanning using device camera
 *
 * Features:
 * - Camera integration using Capacitor
 * - OCR-ready image capture
 * - RUC/CI document scanning
 * - Image quality optimization
 * - Permission handling
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentScannerService {
  constructor(
    private alertController: AlertController,
    private platform: Platform
  ) {}

  /**
   * Scan a document using the device camera
   */
  async scanDocument(): Promise<string | null> {
    try {
      // Check if running on web
      if (!this.platform.is('capacitor')) {
        await this.showWebWarning();
        return null;
      }

      // Request camera permissions and capture image
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        promptLabelHeader: 'Escanear Documento',
        promptLabelPhoto: 'Seleccionar de Galería',
        promptLabelPicture: 'Tomar Foto',
        promptLabelCancel: 'Cancelar',
        saveToGallery: false
      });

      if (image.base64String) {
        return image.base64String;
      }

      return null;
    } catch (error: any) {
      console.error('Error scanning document:', error);

      // Handle permission denied
      if (error.message && error.message.includes('permission')) {
        await this.showPermissionError();
      }

      return null;
    }
  }

  /**
   * Extract text from scanned image (placeholder for OCR integration)
   * In a production app, this would integrate with:
   * - Google ML Kit Vision API
   * - Tesseract.js
   * - AWS Textract
   * - Azure Computer Vision
   */
  async extractTextFromImage(base64Image: string): Promise<string | null> {
    // This is a placeholder implementation
    // In production, you would send the image to an OCR service

    console.log('OCR extraction would happen here');
    console.log('Image length:', base64Image.length);

    // For now, return null and let user manually enter the data
    await this.showOCRNotImplemented();
    return null;
  }

  /**
   * Parse RUC from extracted text
   */
  parseRUC(text: string): string | null {
    // Pattern to match Paraguayan RUC format: XXXXXXXX-X
    const rucPattern = /\b\d{8}-\d\b/g;
    const matches = text.match(rucPattern);

    if (matches && matches.length > 0) {
      return matches[0];
    }

    // Try to find 8-9 digit sequences that could be RUC
    const digitPattern = /\b\d{8,9}\b/g;
    const digitMatches = text.match(digitPattern);

    if (digitMatches && digitMatches.length > 0) {
      const digits = digitMatches[0].replace(/\D/g, '');
      if (digits.length === 9) {
        return `${digits.substring(0, 8)}-${digits.substring(8)}`;
      }
    }

    return null;
  }

  /**
   * Parse CI (Cédula de Identidad) from extracted text
   */
  parseCI(text: string): string | null {
    // Pattern to match Paraguayan CI format (6-8 digits)
    const ciPattern = /\b\d{6,8}\b/g;
    const matches = text.match(ciPattern);

    if (matches && matches.length > 0) {
      return matches[0];
    }

    return null;
  }

  /**
   * Show warning for web platform
   */
  private async showWebWarning(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Función No Disponible',
      message: 'El escaneo de documentos solo está disponible en dispositivos móviles. Por favor, ingrese los datos manualmente.',
      buttons: ['Entendido']
    });
    await alert.present();
  }

  /**
   * Show permission error
   */
  private async showPermissionError(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Permiso Denegado',
      message: 'Para escanear documentos, necesita otorgar permisos de cámara a la aplicación. Puede activarlos en la configuración de su dispositivo.',
      buttons: ['Entendido']
    });
    await alert.present();
  }

  /**
   * Show OCR not implemented message
   */
  private async showOCRNotImplemented(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Función en Desarrollo',
      message: 'El reconocimiento automático de texto (OCR) estará disponible próximamente. Por ahora, utilice la imagen como referencia e ingrese los datos manualmente.',
      buttons: ['Entendido']
    });
    await alert.present();
  }

  /**
   * Get image from gallery instead of camera
   */
  async selectFromGallery(): Promise<string | null> {
    try {
      if (!this.platform.is('capacitor')) {
        await this.showWebWarning();
        return null;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
        promptLabelHeader: 'Seleccionar Imagen',
        promptLabelCancel: 'Cancelar',
        saveToGallery: false
      });

      if (image.base64String) {
        return image.base64String;
      }

      return null;
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      return null;
    }
  }
}
