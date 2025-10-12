import { Injectable } from '@angular/core';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { BehaviorSubject } from 'rxjs';

export interface NotificationSettings {
  enabled: boolean;
  offlineSales: boolean;
  syncCompleted: boolean;
  criticalErrors: boolean;
  sound: boolean;
  vibration: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private settings$ = new BehaviorSubject<NotificationSettings>({
    enabled: true,
    offlineSales: true,
    syncCompleted: true,
    criticalErrors: true,
    sound: true,
    vibration: true
  });

  private notificationId = 1;
  private isPermissionGranted = false;

  constructor() {
    this.initializeNotifications();
    this.loadSettings();
  }

  /**
   * Initialize notification permissions and listeners
   */
  private async initializeNotifications(): Promise<void> {
    try {
      // Check and request permissions
      const permissionStatus = await LocalNotifications.checkPermissions();

      if (permissionStatus.display === 'prompt') {
        const requestResult = await LocalNotifications.requestPermissions();
        this.isPermissionGranted = requestResult.display === 'granted';
      } else {
        this.isPermissionGranted = permissionStatus.display === 'granted';
      }

      // Register notification action types
      if (this.isPermissionGranted) {
        await LocalNotifications.registerActionTypes({
          types: [
            {
              id: 'OPEN_APP',
              actions: [
                {
                  id: 'view',
                  title: 'Ver',
                  foreground: true
                },
                {
                  id: 'dismiss',
                  title: 'Descartar',
                  destructive: true
                }
              ]
            }
          ]
        });

        // Listen for notification actions
        await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
          console.log('Notification action performed:', notification);
        });
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  /**
   * Load notification settings from storage
   */
  private loadSettings(): void {
    const stored = localStorage.getItem('notificationSettings');
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        this.settings$.next(settings);
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
  }

  /**
   * Get notification settings as observable
   */
  getSettings() {
    return this.settings$.asObservable();
  }

  /**
   * Update notification settings
   */
  updateSettings(settings: Partial<NotificationSettings>): void {
    const current = this.settings$.value;
    const updated = { ...current, ...settings };
    this.settings$.next(updated);
    localStorage.setItem('notificationSettings', JSON.stringify(updated));
  }

  /**
   * Notify about offline sale saved
   */
  async notifyOfflineSale(saleNumber: string, total: number): Promise<void> {
    const settings = this.settings$.value;
    if (!settings.enabled || !settings.offlineSales || !this.isPermissionGranted) {
      return;
    }

    try {
      await this.scheduleNotification({
        title: 'Venta Guardada Offline',
        body: `Venta #${saleNumber} por Gs. ${total.toLocaleString('es-PY')} guardada localmente`,
        id: this.getNextNotificationId(),
        actionTypeId: 'OPEN_APP',
        smallIcon: 'ic_stat_sale',
        sound: settings.sound ? undefined : null,
        vibrate: settings.vibration
      });
    } catch (error) {
      console.error('Error showing offline sale notification:', error);
    }
  }

  /**
   * Notify about synchronization completed
   */
  async notifySyncCompleted(salesSynced: number, success = true): Promise<void> {
    const settings = this.settings$.value;
    if (!settings.enabled || !settings.syncCompleted || !this.isPermissionGranted) {
      return;
    }

    try {
      await this.scheduleNotification({
        title: success ? 'Sincronización Completada' : 'Error en Sincronización',
        body: success
          ? `${salesSynced} venta(s) sincronizada(s) con éxito`
          : `No se pudieron sincronizar ${salesSynced} venta(s). Reintente más tarde.`,
        id: this.getNextNotificationId(),
        actionTypeId: 'OPEN_APP',
        smallIcon: success ? 'ic_stat_sync' : 'ic_stat_error',
        sound: settings.sound ? undefined : null,
        vibrate: settings.vibration
      });
    } catch (error) {
      console.error('Error showing sync notification:', error);
    }
  }

  /**
   * Notify about critical errors
   */
  async notifyCriticalError(message: string, details?: string): Promise<void> {
    const settings = this.settings$.value;
    if (!settings.enabled || !settings.criticalErrors || !this.isPermissionGranted) {
      return;
    }

    try {
      await this.scheduleNotification({
        title: 'Error Crítico',
        body: message,
        id: this.getNextNotificationId(),
        actionTypeId: 'OPEN_APP',
        smallIcon: 'ic_stat_error',
        sound: settings.sound ? undefined : null,
        vibrate: settings.vibration,
        extra: { details }
      });
    } catch (error) {
      console.error('Error showing critical error notification:', error);
    }
  }

  /**
   * Notify about payment received
   */
  async notifyPaymentReceived(amount: number, method: string): Promise<void> {
    const settings = this.settings$.value;
    if (!settings.enabled || !this.isPermissionGranted) {
      return;
    }

    try {
      await this.scheduleNotification({
        title: 'Pago Recibido',
        body: `Gs. ${amount.toLocaleString('es-PY')} recibido por ${method}`,
        id: this.getNextNotificationId(),
        actionTypeId: 'OPEN_APP',
        smallIcon: 'ic_stat_payment',
        sound: settings.sound ? undefined : null,
        vibrate: settings.vibration
      });
    } catch (error) {
      console.error('Error showing payment notification:', error);
    }
  }

  /**
   * Notify about low stock
   */
  async notifyLowStock(productName: string, stock: number): Promise<void> {
    const settings = this.settings$.value;
    if (!settings.enabled || !this.isPermissionGranted) {
      return;
    }

    try {
      await this.scheduleNotification({
        title: 'Stock Bajo',
        body: `${productName} tiene solo ${stock} unidades disponibles`,
        id: this.getNextNotificationId(),
        actionTypeId: 'OPEN_APP',
        smallIcon: 'ic_stat_warning',
        sound: settings.sound ? undefined : null,
        vibrate: settings.vibration
      });
    } catch (error) {
      console.error('Error showing low stock notification:', error);
    }
  }

  /**
   * Schedule a notification
   */
  private async scheduleNotification(options: ScheduleOptions): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [options]
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  /**
   * Get next notification ID
   */
  private getNextNotificationId(): number {
    return this.notificationId++;
  }

  /**
   * Check if notifications are enabled
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const permissionStatus = await LocalNotifications.checkPermissions();
      return permissionStatus.display === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const permissionResult = await LocalNotifications.requestPermissions();
      this.isPermissionGranted = permissionResult.display === 'granted';
      return this.isPermissionGranted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }
}
