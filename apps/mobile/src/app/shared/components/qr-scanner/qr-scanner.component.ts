import { Component, EventEmitter, Output, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, flashlightOutline, imagesOutline } from 'ionicons/icons';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

export interface ScanResult {
  text: string;
  format: string;
}

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonButtons
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Escanear QR</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="stopScan()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="scanner-content">
      <div class="scanner-ui">
        <div class="scanner-overlay">
          <div class="scanner-frame"></div>
          <p class="scanner-text">Apunte la cámara al código QR</p>
        </div>

        <div class="scanner-actions">
          <ion-button
            fill="clear"
            size="large"
            (click)="toggleFlash()"
            [disabled]="!flashAvailable()"
          >
            <ion-icon
              name="flashlight-outline"
              [class.active]="flashEnabled()"
            ></ion-icon>
          </ion-button>

          <ion-button
            fill="clear"
            size="large"
            (click)="selectFromGallery()"
          >
            <ion-icon name="images-outline"></ion-icon>
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .scanner-content {
      --background: transparent;
    }

    .scanner-ui {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .scanner-overlay {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .scanner-frame {
      width: 250px;
      height: 250px;
      border: 3px solid var(--ion-color-primary);
      border-radius: 1rem;
      position: relative;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    }

    .scanner-frame::before,
    .scanner-frame::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      border: 3px solid var(--ion-color-primary);
    }

    .scanner-frame::before {
      top: -3px;
      left: -3px;
      border-right: none;
      border-bottom: none;
    }

    .scanner-frame::after {
      bottom: -3px;
      right: -3px;
      border-left: none;
      border-top: none;
    }

    .scanner-text {
      margin-top: 2rem;
      color: white;
      font-size: 1rem;
      text-align: center;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    .scanner-actions {
      display: flex;
      justify-content: space-around;
      padding: 2rem;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
    }

    .scanner-actions ion-button {
      --color: white;
    }

    .scanner-actions ion-icon {
      font-size: 2rem;
      transition: color 0.3s ease;
    }

    .scanner-actions ion-icon.active {
      color: var(--ion-color-warning);
    }
  `]
})
export class QrScannerComponent implements OnInit, OnDestroy {
  @Output() scanResult = new EventEmitter<ScanResult>();
  @Output() scanError = new EventEmitter<string>();
  @Output() scanCancelled = new EventEmitter<void>();

  flashEnabled = signal(false);
  flashAvailable = signal(false);
  scanning = signal(false);

  constructor(private modalController: ModalController) {
    addIcons({
      closeOutline,
      flashlightOutline,
      imagesOutline
    });
  }

  async ngOnInit() {
    await this.startScan();
  }

  async ngOnDestroy() {
    await this.cleanup();
  }

  /**
   * Start scanning
   */
  async startScan(): Promise<void> {
    try {
      // Check camera permission
      const status = await BarcodeScanner.checkPermission({ force: true });

      if (status.granted) {
        // Hide background to show camera
        document.body.classList.add('scanner-active');

        // Check if flash is available
        this.flashAvailable.set(await this.checkFlashAvailable());

        // Start scanning
        this.scanning.set(true);

        const result = await BarcodeScanner.startScan();

        if (result.hasContent) {
          this.scanResult.emit({
            text: result.content || '',
            format: result.format || 'QR_CODE'
          });
          await this.stopScan();
        }
      } else if (status.denied) {
        this.scanError.emit('Permisos de cámara denegados. Por favor, habilítelos en configuración.');
        await this.stopScan();
      } else {
        this.scanError.emit('No se pudieron obtener permisos de cámara');
        await this.stopScan();
      }
    } catch (error) {
      console.error('Error starting scan:', error);
      this.scanError.emit('Error al iniciar escaneo: ' + (error as Error).message);
      await this.stopScan();
    }
  }

  /**
   * Stop scanning
   */
  async stopScan(): Promise<void> {
    try {
      this.scanning.set(false);
      await BarcodeScanner.stopScan();
      await this.cleanup();
      this.scanCancelled.emit();
      await this.modalController.dismiss();
    } catch (error) {
      console.error('Error stopping scan:', error);
    }
  }

  /**
   * Toggle flash/torch
   */
  async toggleFlash(): Promise<void> {
    if (!this.flashAvailable()) {
      return;
    }

    try {
      const newState = !this.flashEnabled();
      await BarcodeScanner.toggleTorch();
      this.flashEnabled.set(newState);
    } catch (error) {
      console.error('Error toggling flash:', error);
      this.scanError.emit('No se pudo activar el flash');
    }
  }

  /**
   * Select QR code from gallery
   */
  async selectFromGallery(): Promise<void> {
    try {
      // Stop current scan
      await BarcodeScanner.stopScan();

      // Open image picker and scan
      // Note: This requires additional implementation with Capacitor Camera
      this.scanError.emit('Función de galería en desarrollo');
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      this.scanError.emit('Error al abrir galería');
    }
  }

  /**
   * Check if flash is available
   */
  private async checkFlashAvailable(): Promise<boolean> {
    try {
      // Check if device has flash/torch
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device =>
        device.kind === 'videoinput' &&
        device.label.toLowerCase().includes('back')
      );
    } catch {
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    document.body.classList.remove('scanner-active');

    if (this.flashEnabled()) {
      try {
        await BarcodeScanner.toggleTorch();
        this.flashEnabled.set(false);
      } catch (error) {
        console.error('Error turning off flash:', error);
      }
    }
  }
}
