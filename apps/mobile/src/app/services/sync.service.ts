import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { Network } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncDate: Date | null;
  pendingItems: number;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private syncStatus = new BehaviorSubject<SyncStatus>({
    isSyncing: false,
    lastSyncDate: null,
    pendingItems: 0,
    errors: []
  });

  syncStatus$: Observable<SyncStatus> = this.syncStatus.asObservable();
  private isOnline = true;

  constructor(
    private api: ApiService,
    private storage: StorageService
  ) {
    this.initNetworkListener();
  }

  private async initNetworkListener() {
    const status = await Network.getStatus();
    this.isOnline = status.connected;

    Network.addListener('networkStatusChange', (status) => {
      this.isOnline = status.connected;
      if (this.isOnline) {
        this.syncPendingData();
      }
    });
  }

  async syncPendingData(): Promise<void> {
    if (!this.isOnline) {
      console.log('Cannot sync: Device is offline');
      return;
    }

    if (this.syncStatus.value.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    this.updateSyncStatus({ isSyncing: true, errors: [] });

    try {
      const pendingSales = await this.storage.getPendingSales();

      if (pendingSales.length === 0) {
        this.updateSyncStatus({
          isSyncing: false,
          lastSyncDate: new Date(),
          pendingItems: 0
        });
        return;
      }

      const errors: string[] = [];
      let successCount = 0;

      for (const sale of pendingSales) {
        try {
          await this.api.post('/sales', sale).toPromise();
          successCount++;
        } catch (error) {
          errors.push(`Error syncing sale ${sale.id}: ${error}`);
        }
      }

      // Remove synced sales
      if (successCount > 0) {
        const remainingSales = pendingSales.slice(successCount);
        await this.storage.setPendingSales(remainingSales);
      }

      this.updateSyncStatus({
        isSyncing: false,
        lastSyncDate: new Date(),
        pendingItems: pendingSales.length - successCount,
        errors
      });

    } catch (error) {
      this.updateSyncStatus({
        isSyncing: false,
        errors: [`Sync failed: ${error}`]
      });
    }
  }

  async addPendingSale(sale: any): Promise<void> {
    const pendingSales = await this.storage.getPendingSales();
    pendingSales.push({
      ...sale,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      synced: false
    });
    await this.storage.setPendingSales(pendingSales);

    this.updateSyncStatus({
      pendingItems: pendingSales.length
    });

    // Try to sync immediately if online
    if (this.isOnline) {
      await this.syncPendingData();
    }
  }

  private updateSyncStatus(updates: Partial<SyncStatus>) {
    this.syncStatus.next({
      ...this.syncStatus.value,
      ...updates
    });
  }

  async getPendingItemsCount(): Promise<number> {
    const pendingSales = await this.storage.getPendingSales();
    return pendingSales.length;
  }

  getNetworkStatus(): boolean {
    return this.isOnline;
  }
}
