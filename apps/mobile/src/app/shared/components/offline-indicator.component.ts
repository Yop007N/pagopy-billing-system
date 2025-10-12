import { Component, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NetworkService } from '../../core/services/network.service';
import { SyncService } from '../../services/sync.service';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="offline-indicator-container">
      <!-- Network Status Badge -->
      <ion-chip
        [color]="networkColor()"
        [class.offline]="!isOnline()"
        [class.syncing]="isSyncing()"
      >
        <ion-icon [name]="networkIcon()" />
        <ion-label>{{ networkLabel() }}</ion-label>
      </ion-chip>

      <!-- Sync Status Badge (shown when there are pending items) -->
      @if (pendingItems() > 0) {
        <ion-chip color="warning" (click)="triggerManualSync()">
          <ion-icon name="sync-outline" />
          <ion-label>{{ pendingItems() }} pendiente{{ pendingItems() > 1 ? 's' : '' }}</ion-label>
        </ion-chip>
      }

      <!-- Syncing Indicator -->
      @if (isSyncing()) {
        <ion-chip color="primary">
          <ion-spinner name="crescent" />
          <ion-label>Sincronizando...</ion-label>
        </ion-chip>
      }

      <!-- Error Badge -->
      @if (failedItems() > 0) {
        <ion-chip color="danger" (click)="showSyncErrors()">
          <ion-icon name="alert-circle-outline" />
          <ion-label>{{ failedItems() }} error{{ failedItems() > 1 ? 'es' : '' }}</ion-label>
        </ion-chip>
      }
    </div>
  `,
  styles: [`
    .offline-indicator-container {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 4px 8px;
      flex-wrap: wrap;
    }

    ion-chip {
      margin: 0;
      height: 28px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    ion-chip.offline {
      animation: pulse 2s infinite;
    }

    ion-chip.syncing {
      animation: pulse 1s infinite;
    }

    ion-chip ion-icon {
      font-size: 16px;
    }

    ion-chip ion-spinner {
      width: 16px;
      height: 16px;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
  `]
})
export class OfflineIndicatorComponent {
  // Network status signals
  isOnline = this.network.isOnline;
  networkStatus = this.network.networkStatus;

  // Sync status signals
  syncStatus = this.sync.syncStatus;
  isSyncing = computed(() => this.syncStatus().isSyncing);
  pendingItems = computed(() => this.syncStatus().pendingItems);
  failedItems = computed(() => this.syncStatus().failedItems);

  // Computed UI properties
  networkColor = computed(() => {
    if (!this.isOnline()) return 'danger';
    if (this.isSyncing()) return 'primary';
    if (this.pendingItems() > 0) return 'warning';
    return 'success';
  });

  networkIcon = computed(() => {
    if (!this.isOnline()) return 'cloud-offline-outline';
    if (this.isSyncing()) return 'sync-outline';
    if (this.pendingItems() > 0) return 'cloud-upload-outline';
    return 'cloud-done-outline';
  });

  networkLabel = computed(() => {
    const status = this.networkStatus();

    if (!this.isOnline()) {
      return 'Sin conexión';
    }

    if (this.isSyncing()) {
      return 'Sincronizando';
    }

    if (this.pendingItems() > 0) {
      return 'Pendiente';
    }

    if (status.connectionType === 'wifi') {
      return 'WiFi';
    }

    if (status.connectionType === 'cellular') {
      return 'Datos móviles';
    }

    return 'En línea';
  });

  constructor(
    private network: NetworkService,
    private sync: SyncService
  ) {
    // Auto-refresh sync status periodically
    effect(() => {
      if (this.isOnline()) {
        this.sync.refreshSyncStatus();
      }
    });
  }

  async triggerManualSync(): Promise<void> {
    if (!this.isOnline()) {
      console.log('Cannot sync: Device is offline');
      return;
    }

    try {
      await this.sync.manualSync();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  }

  showSyncErrors(): void {
    const errors = this.syncStatus().errors;
    if (errors.length > 0) {
      console.error('Sync errors:', errors);
      // You can replace this with a modal or toast notification
      alert('Errores de sincronización:\n' + errors.join('\n'));
    }
  }
}
