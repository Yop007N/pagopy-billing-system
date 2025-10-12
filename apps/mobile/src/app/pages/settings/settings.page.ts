/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonNote,
  IonButtons,
  IonBackButton,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOutline,
  printOutline,
  syncOutline,
  colorPaletteOutline,
  languageOutline,
  trashOutline,
  informationCircleOutline,
  bluetoothOutline
} from 'ionicons/icons';
import { NotificationsService, NotificationSettings } from '../../core/services/notifications.service';
import { StorageService } from '../../services/storage.service';
import { SyncService } from '../../services/sync.service';

interface AppSettings {
  notifications: NotificationSettings;
  printer: {
    enabled: boolean;
    deviceName: string;
    deviceAddress: string;
    paperWidth: number;
  };
  sync: {
    autoSync: boolean;
    syncInterval: number; // minutes
    syncOnWifiOnly: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: 'es' | 'en' | 'gn';
  };
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonNote,
    IonButtons,
    IonBackButton
  ],
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage implements OnInit {
  settings = signal<AppSettings>({
    notifications: {
      enabled: true,
      offlineSales: true,
      syncCompleted: true,
      criticalErrors: true,
      sound: true,
      vibration: true
    },
    printer: {
      enabled: false,
      deviceName: '',
      deviceAddress: '',
      paperWidth: 58
    },
    sync: {
      autoSync: true,
      syncInterval: 30,
      syncOnWifiOnly: true
    },
    appearance: {
      theme: 'system',
      language: 'es'
    }
  });

  appVersion = '1.0.0';
  cacheSize = signal<string>('0 KB');

  constructor(
    private notificationsService: NotificationsService,
    private storageService: StorageService,
    private syncService: SyncService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      notificationsOutline,
      printOutline,
      syncOutline,
      colorPaletteOutline,
      languageOutline,
      trashOutline,
      informationCircleOutline,
      bluetoothOutline
    });
  }

  async ngOnInit() {
    await this.loadSettings();
    await this.calculateCacheSize();
  }

  /**
   * Load settings from storage
   */
  private async loadSettings(): Promise<void> {
    try {
      const stored = await this.storageService.get('appSettings');
      if (stored) {
        this.settings.set(stored);
      }

      // Load notification settings
      this.notificationsService.getSettings().subscribe(notifSettings => {
        this.settings.update(current => ({
          ...current,
          notifications: notifSettings
        }));
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  /**
   * Save settings to storage
   */
  private async saveSettings(): Promise<void> {
    try {
      await this.storageService.set('appSettings', this.settings());
      await this.showToast('Configuración guardada');
    } catch (error) {
      console.error('Error saving settings:', error);
      await this.showToast('Error al guardar configuración', 'danger');
    }
  }

  /**
   * Handle notification toggle change
   */
  async onNotificationToggleChange(setting: keyof NotificationSettings): Promise<void> {
    const currentSettings = this.settings();
    const newValue = !currentSettings.notifications[setting];

    // Check permissions if enabling
    if (setting === 'enabled' && newValue) {
      const hasPermission = await this.notificationsService.checkPermissions();
      if (!hasPermission) {
        const granted = await this.notificationsService.requestPermissions();
        if (!granted) {
          await this.showToast('Permisos de notificación denegados', 'warning');
          return;
        }
      }
    }

    this.settings.update(current => ({
      ...current,
      notifications: {
        ...current.notifications,
        [setting]: newValue
      }
    }));

    this.notificationsService.updateSettings({ [setting]: newValue });
    await this.saveSettings();
  }

  /**
   * Configure Bluetooth printer
   */
  async configurePrinter(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Configurar Impresora',
      message: 'Escanear impresoras Bluetooth disponibles?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Escanear',
          handler: () => {
            this.scanBluetoothDevices();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Scan for Bluetooth devices
   */
  private async scanBluetoothDevices(): Promise<void> {
    await this.showToast('Funcionalidad de escaneo en desarrollo', 'warning');
    // Implementation will be in PrinterService
  }

  /**
   * Toggle printer enabled
   */
  async onPrinterToggle(): Promise<void> {
    this.settings.update(current => ({
      ...current,
      printer: {
        ...current.printer,
        enabled: !current.printer.enabled
      }
    }));
    await this.saveSettings();
  }

  /**
   * Change printer paper width
   */
  async onPaperWidthChange(event: any): Promise<void> {
    const width = parseInt(event.detail.value, 10);
    this.settings.update(current => ({
      ...current,
      printer: {
        ...current.printer,
        paperWidth: width
      }
    }));
    await this.saveSettings();
  }

  /**
   * Toggle auto sync
   */
  async onAutoSyncToggle(): Promise<void> {
    this.settings.update(current => ({
      ...current,
      sync: {
        ...current.sync,
        autoSync: !current.sync.autoSync
      }
    }));
    await this.saveSettings();
  }

  /**
   * Change sync interval
   */
  async onSyncIntervalChange(event: any): Promise<void> {
    const interval = parseInt(event.detail.value, 10);
    this.settings.update(current => ({
      ...current,
      sync: {
        ...current.sync,
        syncInterval: interval
      }
    }));
    await this.saveSettings();
  }

  /**
   * Toggle WiFi only sync
   */
  async onWifiOnlyToggle(): Promise<void> {
    this.settings.update(current => ({
      ...current,
      sync: {
        ...current.sync,
        syncOnWifiOnly: !current.sync.syncOnWifiOnly
      }
    }));
    await this.saveSettings();
  }

  /**
   * Trigger manual sync
   */
  async syncNow(): Promise<void> {
    const loading = await this.showToast('Sincronizando...', 'primary', 0);

    try {
      await this.syncService.syncAll();
      loading?.dismiss();
      await this.showToast('Sincronización completada', 'success');
    } catch (error) {
      loading?.dismiss();
      console.error('Sync error:', error);
      await this.showToast('Error en sincronización', 'danger');
    }
  }

  /**
   * Change theme
   */
  async onThemeChange(event: any): Promise<void> {
    const theme = event.detail.value;
    this.settings.update(current => ({
      ...current,
      appearance: {
        ...current.appearance,
        theme
      }
    }));

    // Apply theme
    this.applyTheme(theme);
    await this.saveSettings();
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: 'light' | 'dark' | 'system'): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    if (theme === 'system') {
      document.body.classList.toggle('dark', prefersDark.matches);
    } else {
      document.body.classList.toggle('dark', theme === 'dark');
    }
  }

  /**
   * Change language
   */
  async onLanguageChange(event: any): Promise<void> {
    const language = event.detail.value;
    this.settings.update(current => ({
      ...current,
      appearance: {
        ...current.appearance,
        language
      }
    }));
    await this.saveSettings();
    await this.showToast('Idioma actualizado. Reinicie la app para aplicar cambios.', 'warning');
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Limpiar Caché',
      message: 'Esto eliminará datos temporales pero conservará las ventas offline. Continuar?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Limpiar',
          role: 'destructive',
          handler: async () => {
            try {
              // Clear cache but keep offline sales
              await this.storageService.clear();
              this.cacheSize.set('0 KB');
              await this.showToast('Caché limpiado', 'success');
            } catch (error) {
              console.error('Error clearing cache:', error);
              await this.showToast('Error al limpiar caché', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Calculate cache size
   */
  private async calculateCacheSize(): Promise<void> {
    try {
      // Estimate storage usage
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        this.cacheSize.set(this.formatBytes(usage));
      }
    } catch (error) {
      console.error('Error calculating cache size:', error);
    }
  }

  /**
   * Format bytes to human readable
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 KB';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Show app information
   */
  async showAppInfo(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'PagoPy Mobile',
      message: `
        <strong>Versión:</strong> ${this.appVersion}<br>
        <strong>Sistema:</strong> Sistema de Facturación<br>
        <strong>Desarrollado por:</strong> PagoPy Team<br>
        <br>
        <em>Sistema de Gestión de Pagos y Facturación Electrónica para Paraguay</em>
      `,
      buttons: ['OK']
    });

    await alert.present();
  }

  /**
   * Show toast message
   */
  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'primary' = 'success',
    duration = 2000
  ): Promise<HTMLIonToastElement | null> {
    const toast = await this.toastController.create({
      message,
      duration,
      color,
      position: 'bottom'
    });

    await toast.present();
    return duration === 0 ? toast : null;
  }
}
