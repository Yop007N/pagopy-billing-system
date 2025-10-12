/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonAvatar,
  IonChip,
  IonBadge,
  IonToggle,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircleOutline,
  settingsOutline,
  helpCircleOutline,
  logOutOutline,
  syncOutline,
  cloudDoneOutline,
  cloudOfflineOutline,
  statsChartOutline,
  cashOutline,
  receiptOutline,
  informationCircleOutline,
  notificationsOutline,
  moonOutline,
  languageOutline,
  trashOutline
} from 'ionicons/icons';
import { StorageService } from '../../../services/storage.service';
import { NetworkService } from '../../../core/services/network.service';
import { SyncService } from '../../../services/sync.service';
import { SalesService } from '../../../services/sales.service';

interface UserInfo {
  name: string;
  email: string;
  businessName: string;
  role: string;
}

interface UserStats {
  totalSales: number;
  totalAmount: number;
  pendingSync: number;
  lastSyncDate: Date | null;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
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
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonAvatar,
    IonChip,
    IonBadge,
    IonToggle,
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner
  ]
})
export class ProfilePage implements OnInit {
  // Signals for reactive state
  userInfo = signal<UserInfo>({
    name: 'Usuario',
    email: 'usuario@pagopy.py',
    businessName: 'Mi Negocio',
    role: 'Vendedor'
  });

  userStats = signal<UserStats>({
    totalSales: 0,
    totalAmount: 0,
    pendingSync: 0,
    lastSyncDate: null
  });

  loading = signal<boolean>(false);
  autoSyncEnabled = signal<boolean>(true);

  // Network and sync status from services
  isOnline = this.network.isOnline;
  syncStatus = this.sync.syncStatus;

  // Computed values
  networkStatusText = computed(() => {
    return this.isOnline() ? 'En línea' : 'Sin conexión';
  });

  networkStatusColor = computed(() => {
    return this.isOnline() ? 'success' : 'danger';
  });

  appVersion = '1.0.0';

  constructor(
    private router: Router,
    private storage: StorageService,
    private network: NetworkService,
    private sync: SyncService,
    private salesService: SalesService,
    private alertController: AlertController
  ) {
    addIcons({
      personCircleOutline,
      settingsOutline,
      helpCircleOutline,
      logOutOutline,
      syncOutline,
      cloudDoneOutline,
      cloudOfflineOutline,
      statsChartOutline,
      cashOutline,
      receiptOutline,
      informationCircleOutline,
      notificationsOutline,
      moonOutline,
      languageOutline,
      trashOutline
    });
  }

  async ngOnInit() {
    await this.loadUserData();
    await this.loadUserStats();
    this.autoSyncEnabled.set(this.sync.isAutoSyncEnabled());
  }

  async loadUserData() {
    try {
      // Try to load user data from storage
      const storedUser = await this.storage.get<UserInfo>('user_info');
      if (storedUser) {
        this.userInfo.set(storedUser);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  async loadUserStats() {
    this.loading.set(true);

    try {
      const sales = this.salesService.getSales();
      const totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0);
      const pendingCount = await this.salesService.getPendingSalesCount();
      const lastSync = this.syncStatus().lastSyncDate;

      this.userStats.set({
        totalSales: sales.length,
        totalAmount,
        pendingSync: pendingCount,
        lastSyncDate: lastSync
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async triggerSync() {
    if (!this.isOnline()) {
      await this.showAlert('Sin conexión', 'No hay conexión a internet para sincronizar');
      return;
    }

    try {
      await this.sync.manualSync();
      await this.loadUserStats();
      await this.showAlert('Éxito', 'Sincronización completada correctamente');
    } catch (error: any) {
      await this.showAlert('Error', error.message || 'Error al sincronizar');
    }
  }

  onAutoSyncToggle(event: any) {
    const enabled = event.detail.checked;
    this.autoSyncEnabled.set(enabled);
    this.sync.setAutoSync(enabled);
  }

  async clearLocalData() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que quieres borrar todos los datos locales? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Borrar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.storage.clear();
              await this.showAlert('Éxito', 'Datos locales borrados correctamente');
              await this.loadUserStats();
            } catch (error) {
              await this.showAlert('Error', 'No se pudo borrar los datos locales');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar sesión',
          role: 'destructive',
          handler: async () => {
            try {
              await this.storage.removeAuthToken();
              await this.storage.remove('user_info');
              this.router.navigate(['/auth/login'], { replaceUrl: true });
            } catch (error) {
              await this.showAlert('Error', 'No se pudo cerrar la sesión');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async showAbout() {
    const alert = await this.alertController.create({
      header: 'PagoPy',
      message: `Versión ${this.appVersion}\n\nSistema de gestión de pagos y facturación electrónica para PyMEs paraguayas.`,
      buttons: ['OK']
    });

    await alert.present();
  }

  async showHelp() {
    const alert = await this.alertController.create({
      header: 'Ayuda y Soporte',
      message: 'Para ayuda y soporte, contacta a:\n\nEmail: soporte@pagopy.py\nTeléfono: +595 21 123 4567',
      buttons: ['OK']
    });

    await alert.present();
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }
}
