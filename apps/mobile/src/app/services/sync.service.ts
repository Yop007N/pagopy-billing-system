import { Injectable, signal, effect } from '@angular/core';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { NetworkService } from './network.service';
import { OfflineSale, SyncStatus } from '../models/offline-sale.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  // Sync configuration
  private readonly MAX_RETRY_ATTEMPTS = 5;
  private readonly BASE_RETRY_DELAY = 2000; // 2 seconds
  private readonly MAX_RETRY_DELAY = 60000; // 1 minute
  private readonly BATCH_SIZE = 5;

  // Angular signals for reactive state
  private syncStatusSignal = signal<SyncStatus>({
    isSyncing: false,
    lastSyncDate: null,
    pendingItems: 0,
    syncedItems: 0,
    failedItems: 0,
    errors: []
  });

  // Public readonly signal
  readonly syncStatus = this.syncStatusSignal.asReadonly();

  private syncInProgress = false;
  private autoSyncEnabled = true;

  constructor(
    private api: ApiService,
    private storage: StorageService,
    private network: NetworkService
  ) {
    this.initializeSync();
  }

  private async initializeSync(): Promise<void> {
    // Load initial sync status
    await this.refreshSyncStatus();

    // Monitor network changes and trigger sync when online
    effect(() => {
      const isOnline = this.network.isOnline();
      if (isOnline && this.autoSyncEnabled && !this.syncInProgress) {
        console.log('Network restored - triggering auto-sync');
        this.syncPendingData();
      }
    });

    // Cleanup old synced sales on initialization
    this.storage.cleanOldSyncedSales(30).then(count => {
      if (count > 0) {
        console.log(`Cleaned ${count} old synced sales`);
      }
    });
  }

  /**
   * Main sync function - syncs all pending offline sales
   */
  async syncPendingData(): Promise<void> {
    if (!this.network.getCurrentStatus()) {
      console.log('Cannot sync: Device is offline');
      this.updateSyncStatusPartial({
        errors: ['No hay conexión a internet']
      });
      return;
    }

    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return;
    }

    this.syncInProgress = true;
    this.updateSyncStatusPartial({
      isSyncing: true,
      errors: []
    });

    try {
      const pendingSales = await this.storage.getPendingOfflineSales();

      if (pendingSales.length === 0) {
        this.updateSyncStatusPartial({
          isSyncing: false,
          lastSyncDate: new Date(),
          pendingItems: 0
        });
        await this.storage.setLastSyncDate(new Date());
        this.syncInProgress = false;
        return;
      }

      console.log(`Starting sync of ${pendingSales.length} pending sales`);

      const errors: string[] = [];
      let successCount = 0;
      let failedCount = 0;

      // Process sales in batches
      for (let i = 0; i < pendingSales.length; i += this.BATCH_SIZE) {
        const batch = pendingSales.slice(i, i + this.BATCH_SIZE);

        for (const sale of batch) {
          try {
            const success = await this.syncSingleSale(sale);
            if (success) {
              successCount++;
            } else {
              failedCount++;
            }
          } catch (error) {
            failedCount++;
            const errorMsg = `Error syncing sale ${sale.localId}: ${error}`;
            console.error(errorMsg);
            errors.push(errorMsg);
          }
        }

        // Small delay between batches to avoid overwhelming the server
        if (i + this.BATCH_SIZE < pendingSales.length) {
          await this.delay(500);
        }
      }

      // Update final sync status
      const remainingPending = await this.storage.getPendingSalesCount();

      this.updateSyncStatusPartial({
        isSyncing: false,
        lastSyncDate: new Date(),
        pendingItems: remainingPending,
        syncedItems: successCount,
        failedItems: failedCount,
        errors: errors.slice(0, 5) // Keep only last 5 errors
      });

      await this.storage.setLastSyncDate(new Date());

      console.log(`Sync completed: ${successCount} synced, ${failedCount} failed, ${remainingPending} pending`);

    } catch (error) {
      console.error('Sync process failed:', error);
      this.updateSyncStatusPartial({
        isSyncing: false,
        errors: [`Sync failed: ${error}`]
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync a single sale with retry logic and exponential backoff
   */
  private async syncSingleSale(sale: OfflineSale): Promise<boolean> {
    // Check if max retries exceeded
    if (sale.syncAttempts >= this.MAX_RETRY_ATTEMPTS) {
      console.log(`Max retries exceeded for sale ${sale.localId}`);
      await this.storage.updateOfflineSaleStatus(
        sale.localId,
        'error',
        'Máximo de intentos excedido'
      );
      return false;
    }

    // Mark as syncing
    await this.storage.updateOfflineSaleStatus(sale.localId, 'syncing');

    try {
      // Send sale to backend
      const response = await firstValueFrom(
        this.api.post<any>('/sales', sale.saleData)
      );

      // Mark as synced with server ID
      await this.storage.updateOfflineSaleStatus(
        sale.localId,
        'synced',
        undefined,
        response.id || response._id
      );

      console.log(`Successfully synced sale ${sale.localId}`);
      return true;

    } catch (error: any) {
      const errorMessage = this.extractErrorMessage(error);

      // Determine if we should retry
      const shouldRetry = this.shouldRetryError(error);

      if (shouldRetry && sale.syncAttempts < this.MAX_RETRY_ATTEMPTS - 1) {
        // Calculate exponential backoff delay
        const delay = this.calculateBackoffDelay(sale.syncAttempts);

        console.log(`Sync failed for ${sale.localId}, will retry in ${delay}ms. Attempt ${sale.syncAttempts + 1}`);

        // Mark as pending for retry
        await this.storage.updateOfflineSaleStatus(
          sale.localId,
          'pending',
          `Reintentando... (${sale.syncAttempts + 1}/${this.MAX_RETRY_ATTEMPTS})`
        );

        // Schedule retry
        await this.delay(delay);
        return this.syncSingleSale(sale);
      } else {
        // Mark as error - no more retries
        await this.storage.updateOfflineSaleStatus(
          sale.localId,
          'error',
          errorMessage
        );

        console.error(`Failed to sync sale ${sale.localId}:`, errorMessage);
        return false;
      }
    }
  }

  /**
   * Add a new sale to offline storage
   */
  async addOfflineSale(saleData: OfflineSale['saleData']): Promise<string> {
    const offlineSale: OfflineSale = {
      localId: this.generateLocalId(),
      saleData,
      createdAt: new Date(),
      syncStatus: 'pending',
      syncAttempts: 0
    };

    await this.storage.saveOfflineSale(offlineSale);
    await this.refreshSyncStatus();

    // Try to sync immediately if online
    if (this.network.getCurrentStatus() && this.autoSyncEnabled) {
      setTimeout(() => this.syncPendingData(), 1000);
    }

    return offlineSale.localId;
  }

  /**
   * Manual sync trigger
   */
  async manualSync(): Promise<void> {
    if (!this.network.getCurrentStatus()) {
      throw new Error('No hay conexión a internet');
    }

    await this.syncPendingData();
  }

  /**
   * Refresh sync status from storage
   */
  async refreshSyncStatus(): Promise<void> {
    const pendingSales = await this.storage.getPendingOfflineSales();
    const allSales = await this.storage.getOfflineSales();
    const lastSyncDate = await this.storage.getLastSyncDate();

    const syncedSales = allSales.filter(s => s.syncStatus === 'synced');
    const errorSales = allSales.filter(s => s.syncStatus === 'error');

    this.updateSyncStatusPartial({
      pendingItems: pendingSales.length,
      syncedItems: syncedSales.length,
      failedItems: errorSales.length,
      lastSyncDate
    });
  }

  /**
   * Get all offline sales
   */
  async getOfflineSales(): Promise<OfflineSale[]> {
    return this.storage.getOfflineSales();
  }

  /**
   * Get pending sales count
   */
  async getPendingItemsCount(): Promise<number> {
    return this.storage.getPendingSalesCount();
  }

  /**
   * Delete a specific offline sale
   */
  async deleteOfflineSale(localId: string): Promise<void> {
    await this.storage.deleteOfflineSale(localId);
    await this.refreshSyncStatus();
  }

  /**
   * Retry a failed sale
   */
  async retryFailedSale(localId: string): Promise<void> {
    await this.storage.updateOfflineSaleStatus(localId, 'pending');

    if (this.network.getCurrentStatus()) {
      await this.syncPendingData();
    }
  }

  /**
   * Enable/disable auto-sync
   */
  setAutoSync(enabled: boolean): void {
    this.autoSyncEnabled = enabled;
  }

  /**
   * Check if auto-sync is enabled
   */
  isAutoSyncEnabled(): boolean {
    return this.autoSyncEnabled;
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private generateLocalId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateBackoffDelay(attempt: number): number {
    const delay = Math.min(
      this.BASE_RETRY_DELAY * Math.pow(2, attempt),
      this.MAX_RETRY_DELAY
    );
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }

  private shouldRetryError(error: any): boolean {
    // Don't retry on client errors (4xx) except 408, 429
    if (error?.status >= 400 && error?.status < 500) {
      return error.status === 408 || error.status === 429;
    }

    // Retry on server errors (5xx) and network errors
    return true;
  }

  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.message) {
      return error.message;
    }

    if (error?.status === 0) {
      return 'Error de conexión';
    }

    return 'Error desconocido';
  }

  private updateSyncStatusPartial(updates: Partial<SyncStatus>): void {
    this.syncStatusSignal.update(current => ({
      ...current,
      ...updates
    }));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get network status
   */
  getNetworkStatus(): boolean {
    return this.network.getCurrentStatus();
  }
}
