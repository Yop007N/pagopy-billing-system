import { Component, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SyncService } from '../../services/sync.service';
import { NetworkService } from '../../core/services/network.service';

@Component({
  selector: 'app-sync-status',
  standalone: true,
  imports: [CommonModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>
          <ion-icon [name]="statusIcon()" [color]="statusColor()" />
          Estado de Sincronización
        </ion-card-title>
      </ion-card-header>

      <ion-card-content>
        <!-- Network Status -->
        <ion-item lines="none">
          <ion-icon
            [name]="isOnline() ? 'wifi' : 'wifi-outline'"
            [color]="isOnline() ? 'success' : 'danger'"
            slot="start"
          />
          <ion-label>
            <h3>Conexión</h3>
            <p>{{ networkStatusText() }}</p>
          </ion-label>
        </ion-item>

        <!-- Sync Statistics -->
        <ion-item lines="none">
          <ion-icon name="stats-chart" color="primary" slot="start" />
          <ion-label>
            <h3>Estadísticas</h3>
            <p>
              Pendientes: {{ pendingItems() }} |
              Sincronizados: {{ syncedItems() }} |
              Errores: {{ failedItems() }}
            </p>
          </ion-label>
        </ion-item>

        <!-- Last Sync Time -->
        @if (lastSyncDate()) {
          <ion-item lines="none">
            <ion-icon name="time-outline" color="medium" slot="start" />
            <ion-label>
              <h3>Última sincronización</h3>
              <p>{{ lastSyncText() }}</p>
            </ion-label>
          </ion-item>
        }

        <!-- Syncing Progress -->
        @if (isSyncing()) {
          <ion-item lines="none">
            <ion-spinner name="crescent" slot="start" />
            <ion-label>
              <h3>Sincronizando datos...</h3>
              <ion-progress-bar type="indeterminate" color="primary" />
            </ion-label>
          </ion-item>
        }

        <!-- Error Messages -->
        @if (errors().length > 0) {
          <ion-item lines="none" color="danger">
            <ion-icon name="alert-circle" slot="start" />
            <ion-label class="ion-text-wrap">
              <h3>Errores</h3>
              @for (error of errors(); track error) {
                <p>{{ error }}</p>
              }
            </ion-label>
          </ion-item>
        }

        <!-- Action Buttons -->
        <div class="action-buttons">
          <ion-button
            expand="block"
            [disabled]="!isOnline() || isSyncing() || pendingItems() === 0"
            (click)="manualSync()"
          >
            <ion-icon name="sync-outline" slot="start" />
            Sincronizar ahora
          </ion-button>

          @if (failedItems() > 0) {
            <ion-button
              expand="block"
              color="warning"
              [disabled]="!isOnline() || isSyncing()"
              (click)="retryFailedSync()"
            >
              <ion-icon name="refresh-outline" slot="start" />
              Reintentar errores
            </ion-button>
          }
        </div>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    ion-card {
      margin: 16px;
    }

    ion-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
    }

    ion-item {
      --padding-start: 0;
      --inner-padding-end: 0;
    }

    .action-buttons {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    ion-progress-bar {
      margin-top: 8px;
    }
  `]
})
export class SyncStatusComponent {
  // Signals from services
  isOnline = this.network.isOnline;
  networkStatus = this.network.networkStatus;
  syncStatus = this.sync.syncStatus;

  // Computed properties
  isSyncing = computed(() => this.syncStatus().isSyncing);
  pendingItems = computed(() => this.syncStatus().pendingItems);
  syncedItems = computed(() => this.syncStatus().syncedItems);
  failedItems = computed(() => this.syncStatus().failedItems);
  lastSyncDate = computed(() => this.syncStatus().lastSyncDate);
  errors = computed(() => this.syncStatus().errors);

  statusIcon = computed(() => {
    if (this.isSyncing()) return 'sync-circle';
    if (this.failedItems() > 0) return 'alert-circle';
    if (this.pendingItems() > 0) return 'cloud-upload';
    return 'checkmark-circle';
  });

  statusColor = computed(() => {
    if (this.isSyncing()) return 'primary';
    if (this.failedItems() > 0) return 'danger';
    if (this.pendingItems() > 0) return 'warning';
    return 'success';
  });

  networkStatusText = computed(() => {
    const status = this.networkStatus();
    if (!this.isOnline()) {
      return 'Sin conexión a internet';
    }

    switch (status.connectionType) {
      case 'wifi':
        return 'Conectado via WiFi';
      case 'cellular':
        return 'Conectado via datos móviles';
      default:
        return 'Conectado a internet';
    }
  });

  lastSyncText = computed(() => {
    const lastSync = this.lastSyncDate();
    if (!lastSync) return 'Nunca';

    try {
      const now = new Date();
      const syncDate = new Date(lastSync);
      const diffMs = now.getTime() - syncDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Hace un momento';
      if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
      if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } catch {
      return 'Hace un momento';
    }
  });

  constructor(
    private network: NetworkService,
    private sync: SyncService
  ) {}

  async manualSync(): Promise<void> {
    try {
      await this.sync.manualSync();
    } catch (error: any) {
      console.error('Manual sync failed:', error);
      // You can replace this with a toast notification
      alert(error.message || 'Error al sincronizar');
    }
  }

  async retryFailedSync(): Promise<void> {
    try {
      // Get all offline sales with error status
      const offlineSales = await this.sync.getOfflineSales();
      const failedSales = offlineSales.filter(s => s.syncStatus === 'error');

      // Reset them to pending
      for (const sale of failedSales) {
        await this.sync.retryFailedSale(sale.localId);
      }

      // Trigger sync
      await this.sync.manualSync();
    } catch (error: any) {
      console.error('Retry failed:', error);
      // You can replace this with a toast notification
      alert(error.message || 'Error al reintentar');
    }
  }
}
