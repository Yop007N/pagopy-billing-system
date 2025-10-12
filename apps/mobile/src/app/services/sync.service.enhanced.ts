import { Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { NetworkService } from './network.service';
import { DatabaseService } from '../core/services/database.service';
import {
  SyncQueueItem,
  SyncConflict,
  SyncProgress,
  SyncResult,
  SyncError,
  SyncStrategy,
  SyncMetadata
} from '../models/sync.model';
import { LocalSale } from '../models/database.model';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SyncServiceEnhanced {
  private readonly API_BASE_URL = environment.apiUrl;

  // Sync configuration
  private readonly DEFAULT_STRATEGY: SyncStrategy = {
    bidirectional: true,
    conflictResolution: 'server-wins',
    batchSize: 5,
    maxRetries: 5,
    retryDelay: 2000,
    syncOnConnection: true,
    priorityOrder: ['sales', 'invoices', 'customers', 'products']
  };

  private currentStrategy: SyncStrategy = { ...this.DEFAULT_STRATEGY };

  // Angular signals for reactive state
  private syncStatusSignal = signal<SyncStatus>({
    isSyncing: false,
    lastSyncDate: null,
    pendingItems: 0,
    syncedItems: 0,
    failedItems: 0,
    errors: []
  });

  private syncProgressSignal = signal<SyncProgress>({
    totalItems: 0,
    processedItems: 0,
    successItems: 0,
    failedItems: 0,
    percentage: 0,
    startedAt: new Date()
  });

  private syncMetadataSignal = signal<SyncMetadata>({
    lastFullSync: undefined,
    lastPartialSync: undefined,
    lastSuccessfulSync: undefined,
    pendingUploads: 0,
    pendingDownloads: 0,
    totalSynced: 0,
    totalConflicts: 0,
    autoSyncEnabled: true,
    currentStrategy: this.DEFAULT_STRATEGY
  });

  private conflictsSignal = signal<SyncConflict[]>([]);

  // Public readonly signals
  readonly syncStatus = this.syncStatusSignal.asReadonly();
  readonly syncProgress = this.syncProgressSignal.asReadonly();
  readonly syncMetadata = this.syncMetadataSignal.asReadonly();
  readonly conflicts = this.conflictsSignal.asReadonly();

  private syncInProgress = false;
  private syncQueue: SyncQueueItem[] = [];

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private network: NetworkService,
    private database: DatabaseService
  ) {
    this.initializeSync();
  }

  private async initializeSync(): Promise<void> {
    try {
      // Load sync metadata
      await this.loadSyncMetadata();

      // Load sync queue
      await this.loadSyncQueue();

      // Load initial sync status
      await this.refreshSyncStatus();

      // Monitor network changes and trigger sync when online
      effect(() => {
        const isOnline = this.network.isOnline();
        const backendReachable = this.network.backendReachable();
        const autoSyncEnabled = this.syncMetadataSignal().autoSyncEnabled;

        if (isOnline && backendReachable && autoSyncEnabled && !this.syncInProgress) {
          console.log('Network restored and backend reachable - triggering auto-sync');
          setTimeout(() => this.syncAll(), 2000); // Delay to ensure backend is ready
        }
      });

      // Cleanup old data on initialization
      this.storage.cleanOldSyncedSales(30).then(count => {
        if (count > 0) {
          console.log(`Cleaned ${count} old synced sales`);
        }
      });

      await this.database.clearOldSyncLogs(30);

      console.log('Enhanced sync service initialized');
    } catch (error) {
      console.error('Failed to initialize sync service:', error);
    }
  }

  /**
   * Main sync function - syncs all pending data bidirectionally
   */
  async syncAll(fullSync = false): Promise<SyncResult> {
    if (!this.network.isBackendReachable()) {
      console.log('Cannot sync: Backend not reachable');
      throw new Error('No hay conexión con el servidor');
    }

    if (this.syncInProgress) {
      console.log('Sync already in progress');
      throw new Error('Sincronización ya en progreso');
    }

    this.syncInProgress = true;
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      itemsSynced: 0,
      itemsFailed: 0,
      conflicts: [],
      errors: [],
      duration: 0,
      timestamp: new Date()
    };

    this.updateSyncStatusPartial({
      isSyncing: true,
      errors: []
    });

    try {
      console.log(`Starting ${fullSync ? 'full' : 'partial'} sync...`);

      // Phase 1: Upload pending local changes
      console.log('Phase 1: Uploading local changes...');
      const uploadResult = await this.uploadPendingChanges();
      result.itemsSynced += uploadResult.successCount;
      result.itemsFailed += uploadResult.failedCount;
      result.errors.push(...uploadResult.errors);

      // Phase 2: Download server changes (if bidirectional)
      if (this.currentStrategy.bidirectional) {
        console.log('Phase 2: Downloading server changes...');
        const downloadResult = await this.downloadServerChanges(fullSync);
        result.itemsSynced += downloadResult.successCount;
        result.itemsFailed += downloadResult.failedCount;
        result.conflicts.push(...downloadResult.conflicts);
      }

      // Phase 3: Process sync queue
      console.log('Phase 3: Processing sync queue...');
      await this.processSyncQueue();

      // Update metadata
      const now = new Date();
      this.syncMetadataSignal.update(meta => ({
        ...meta,
        lastPartialSync: now,
        lastFullSync: fullSync ? now : meta.lastFullSync,
        lastSuccessfulSync: result.itemsFailed === 0 ? now : meta.lastSuccessfulSync,
        totalSynced: meta.totalSynced + result.itemsSynced,
        totalConflicts: meta.totalConflicts + result.conflicts.length
      }));

      await this.saveSyncMetadata();

      result.success = true;
      result.duration = Date.now() - startTime;

      console.log(`Sync completed: ${result.itemsSynced} synced, ${result.itemsFailed} failed, ${result.conflicts.length} conflicts`);

      this.updateSyncStatusPartial({
        isSyncing: false,
        lastSyncDate: now,
        syncedItems: result.itemsSynced,
        failedItems: result.itemsFailed,
        errors: result.errors.map(e => e.errorMessage).slice(0, 5)
      });

      // Add sync log
      await this.database.addSyncLog({
        entityType: 'sale',
        entityId: 'all',
        operation: 'sync',
        status: result.success ? 'success' : 'error',
        direction: 'upload',
        duration: result.duration,
        syncedAt: now.toISOString()
      });

      return result;
    } catch (error: any) {
      console.error('Sync failed:', error);
      result.success = false;
      result.duration = Date.now() - startTime;
      result.errors.push({
        id: this.generateId(),
        entityType: 'sync',
        entityId: 'all',
        operation: 'sync',
        errorMessage: error.message || 'Unknown error',
        isRetryable: true,
        timestamp: new Date()
      });

      this.updateSyncStatusPartial({
        isSyncing: false,
        errors: [`Error de sincronización: ${error.message}`]
      });

      throw error;
    } finally {
      this.syncInProgress = false;
      await this.refreshSyncStatus();
    }
  }

  /**
   * Upload pending local changes to server
   */
  private async uploadPendingChanges(): Promise<{
    successCount: number;
    failedCount: number;
    errors: SyncError[];
  }> {
    const result = {
      successCount: 0,
      failedCount: 0,
      errors: [] as SyncError[]
    };

    try {
      // Get pending sales from database
      const pendingSales = await this.database.getSalesBySyncStatus('pending');

      if (pendingSales.length === 0) {
        console.log('No pending sales to upload');
        return result;
      }

      console.log(`Uploading ${pendingSales.length} pending sales...`);

      // Initialize progress
      this.syncProgressSignal.set({
        totalItems: pendingSales.length,
        processedItems: 0,
        successItems: 0,
        failedItems: 0,
        percentage: 0,
        startedAt: new Date()
      });

      // Process in batches
      for (let i = 0; i < pendingSales.length; i += this.currentStrategy.batchSize) {
        const batch = pendingSales.slice(i, i + this.currentStrategy.batchSize);

        for (const sale of batch) {
          try {
            const success = await this.uploadSale(sale);

            if (success) {
              result.successCount++;
              this.updateProgress(result.successCount, result.failedCount, pendingSales.length);
            } else {
              result.failedCount++;
              this.updateProgress(result.successCount, result.failedCount, pendingSales.length);
            }
          } catch (error: any) {
            result.failedCount++;
            result.errors.push({
              id: this.generateId(),
              entityType: 'sale',
              entityId: sale.id,
              operation: 'create',
              errorMessage: error.message || 'Unknown error',
              isRetryable: this.isRetryableError(error),
              timestamp: new Date()
            });

            this.updateProgress(result.successCount, result.failedCount, pendingSales.length);
          }
        }

        // Small delay between batches
        if (i + this.currentStrategy.batchSize < pendingSales.length) {
          await this.delay(500);
        }
      }

      return result;
    } catch (error: any) {
      console.error('Failed to upload pending changes:', error);
      return result;
    }
  }

  /**
   * Upload a single sale to server
   */
  private async uploadSale(sale: LocalSale): Promise<boolean> {
    // Check if max retries exceeded
    if (sale.syncAttempts >= this.currentStrategy.maxRetries) {
      console.log(`Max retries exceeded for sale ${sale.localId}`);
      await this.database.updateSaleSyncStatus(
        sale.id,
        'error',
        'Máximo de intentos excedido'
      );
      return false;
    }

    // Mark as syncing
    await this.database.updateSaleSyncStatus(sale.id, 'syncing');

    try {
      // Prepare sale data for API
      const saleData = {
        customerId: sale.customerId,
        customerName: sale.customerName,
        customerDocument: sale.customerDocument,
        items: sale.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          total: item.total
        })),
        subtotal: sale.subtotal,
        tax: sale.tax,
        discount: sale.discount,
        total: sale.total,
        paymentMethod: sale.paymentMethod,
        notes: sale.notes
      };

      // Send to server
      const response = await firstValueFrom(
        this.http.post<any>(`${this.API_BASE_URL}/sales`, saleData)
      );

      // Mark as synced with server ID
      await this.database.updateSaleSyncStatus(
        sale.id,
        'synced',
        undefined,
        response.id || response._id
      );

      // Log successful sync
      await this.database.addSyncLog({
        entityType: 'sale',
        entityId: sale.id,
        operation: 'create',
        status: 'success',
        direction: 'upload',
        responseData: JSON.stringify(response),
        syncedAt: new Date().toISOString()
      });

      console.log(`Successfully synced sale ${sale.localId}`);
      return true;
    } catch (error: any) {
      const errorMessage = this.extractErrorMessage(error);

      // Determine if we should retry
      const shouldRetry = this.isRetryableError(error);

      if (shouldRetry && sale.syncAttempts < this.currentStrategy.maxRetries - 1) {
        // Mark as pending for retry
        await this.database.updateSaleSyncStatus(
          sale.id,
          'pending',
          `Reintentando... (${sale.syncAttempts + 1}/${this.currentStrategy.maxRetries})`
        );

        // Add to sync queue for later retry
        await this.addToSyncQueue({
          id: this.generateId(),
          type: 'sale',
          operation: 'create',
          entityId: sale.id,
          data: sale,
          priority: 1,
          createdAt: new Date(),
          retryCount: sale.syncAttempts,
          maxRetries: this.currentStrategy.maxRetries,
          status: 'pending'
        });
      } else {
        // Mark as error - no more retries
        await this.database.updateSaleSyncStatus(
          sale.id,
          'error',
          errorMessage
        );
      }

      // Log failed sync
      await this.database.addSyncLog({
        entityType: 'sale',
        entityId: sale.id,
        operation: 'create',
        status: 'error',
        direction: 'upload',
        errorMessage,
        requestData: JSON.stringify(sale)
      });

      console.error(`Failed to sync sale ${sale.localId}:`, errorMessage);
      return false;
    }
  }

  /**
   * Download server changes and apply locally
   */
  private async downloadServerChanges(fullSync = false): Promise<{
    successCount: number;
    failedCount: number;
    conflicts: SyncConflict[];
  }> {
    const result = {
      successCount: 0,
      failedCount: 0,
      conflicts: [] as SyncConflict[]
    };

    try {
      const lastSync = fullSync
        ? undefined
        : this.syncMetadataSignal().lastSuccessfulSync;

      // Download products
      const productsResult = await this.downloadProducts(lastSync);
      result.successCount += productsResult.successCount;
      result.failedCount += productsResult.failedCount;
      result.conflicts.push(...productsResult.conflicts);

      // Download customers
      const customersResult = await this.downloadCustomers(lastSync);
      result.successCount += customersResult.successCount;
      result.failedCount += customersResult.failedCount;
      result.conflicts.push(...customersResult.conflicts);

      return result;
    } catch (error: any) {
      console.error('Failed to download server changes:', error);
      return result;
    }
  }

  /**
   * Download products from server
   */
  private async downloadProducts(lastSync?: Date): Promise<{
    successCount: number;
    failedCount: number;
    conflicts: SyncConflict[];
  }> {
    const result = {
      successCount: 0,
      failedCount: 0,
      conflicts: [] as SyncConflict[]
    };

    try {
      const url = lastSync
        ? `${this.API_BASE_URL}/products?updatedAfter=${lastSync.toISOString()}`
        : `${this.API_BASE_URL}/products`;

      const products = await firstValueFrom(
        this.http.get<any[]>(url)
      );

      console.log(`Downloaded ${products.length} products`);

      // Save products to local database
      for (const product of products) {
        try {
          const localProduct = {
            id: product.id,
            code: product.code,
            name: product.name,
            description: product.description,
            price: product.price,
            cost: product.cost,
            stock: product.stock,
            taxRate: product.taxRate,
            category: product.category,
            barcode: product.barcode,
            imageUrl: product.imageUrl,
            isActive: product.isActive,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            lastSyncedAt: new Date().toISOString()
          };

          await this.database.saveProduct(localProduct);
          result.successCount++;
        } catch (error) {
          result.failedCount++;
          console.error(`Failed to save product ${product.id}:`, error);
        }
      }

      return result;
    } catch (error: any) {
      console.error('Failed to download products:', error);
      return result;
    }
  }

  /**
   * Download customers from server
   */
  private async downloadCustomers(lastSync?: Date): Promise<{
    successCount: number;
    failedCount: number;
    conflicts: SyncConflict[];
  }> {
    const result = {
      successCount: 0,
      failedCount: 0,
      conflicts: [] as SyncConflict[]
    };

    try {
      const url = lastSync
        ? `${this.API_BASE_URL}/customers?updatedAfter=${lastSync.toISOString()}`
        : `${this.API_BASE_URL}/customers`;

      const customers = await firstValueFrom(
        this.http.get<any[]>(url)
      );

      console.log(`Downloaded ${customers.length} customers`);

      // Save customers to local database
      for (const customer of customers) {
        try {
          const localCustomer = {
            id: customer.id,
            name: customer.name,
            documentType: customer.documentType,
            documentNumber: customer.documentNumber,
            customerType: customer.customerType,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            country: customer.country,
            isActive: customer.isActive,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
            lastSyncedAt: new Date().toISOString()
          };

          await this.database.saveCustomer(localCustomer);
          result.successCount++;
        } catch (error) {
          result.failedCount++;
          console.error(`Failed to save customer ${customer.id}:`, error);
        }
      }

      return result;
    } catch (error: any) {
      console.error('Failed to download customers:', error);
      return result;
    }
  }

  /**
   * Process sync queue
   */
  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.length === 0) {
      return;
    }

    console.log(`Processing ${this.syncQueue.length} queued items...`);

    const queue = [...this.syncQueue].sort((a, b) => b.priority - a.priority);

    for (const item of queue) {
      if (item.status !== 'pending') {
        continue;
      }

      try {
        item.status = 'processing';
        await this.saveSyncQueue();

        // Process based on type
        let success = false;
        if (item.type === 'sale' && item.operation === 'create') {
          success = await this.uploadSale(item.data);
        }

        if (success) {
          item.status = 'completed';
          await this.removeFromSyncQueue(item.id);
        } else {
          item.retryCount++;

          if (item.retryCount >= item.maxRetries) {
            item.status = 'failed';
            await this.removeFromSyncQueue(item.id);
          } else {
            item.status = 'pending';
            item.nextRetryAt = new Date(
              Date.now() + this.calculateBackoffDelay(item.retryCount)
            );
            await this.saveSyncQueue();
          }
        }
      } catch (error: any) {
        console.error(`Failed to process queue item ${item.id}:`, error);
        item.lastError = error.message;
        item.retryCount++;

        if (item.retryCount >= item.maxRetries) {
          item.status = 'failed';
          await this.removeFromSyncQueue(item.id);
        } else {
          item.status = 'pending';
          await this.saveSyncQueue();
        }
      }
    }
  }

  /**
   * Add item to sync queue
   */
  private async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    this.syncQueue.push(item);
    await this.saveSyncQueue();
  }

  /**
   * Remove item from sync queue
   */
  private async removeFromSyncQueue(id: string): Promise<void> {
    this.syncQueue = this.syncQueue.filter(item => item.id !== id);
    await this.saveSyncQueue();
  }

  /**
   * Save sync queue to storage
   */
  private async saveSyncQueue(): Promise<void> {
    await this.storage.set('sync_queue', this.syncQueue);
  }

  /**
   * Load sync queue from storage
   */
  private async loadSyncQueue(): Promise<void> {
    const queue = await this.storage.get<SyncQueueItem[]>('sync_queue');
    this.syncQueue = queue || [];
  }

  /**
   * Save sync metadata to storage
   */
  private async saveSyncMetadata(): Promise<void> {
    await this.storage.set('sync_metadata', this.syncMetadataSignal());
  }

  /**
   * Load sync metadata from storage
   */
  private async loadSyncMetadata(): Promise<void> {
    const metadata = await this.storage.get<SyncMetadata>('sync_metadata');
    if (metadata) {
      this.syncMetadataSignal.set(metadata);
    }
  }

  /**
   * Refresh sync status from database
   */
  async refreshSyncStatus(): Promise<void> {
    const _dbInfo = await this.database.getDatabaseInfo();

    const pendingSales = await this.database.getSalesBySyncStatus('pending');
    const syncedSales = await this.database.getSalesBySyncStatus('synced');
    const errorSales = await this.database.getSalesBySyncStatus('error');

    this.updateSyncStatusPartial({
      pendingItems: pendingSales.length,
      syncedItems: syncedSales.length,
      failedItems: errorSales.length
    });

    this.syncMetadataSignal.update(meta => ({
      ...meta,
      pendingUploads: pendingSales.length
    }));
  }

  /**
   * Update sync progress
   */
  private updateProgress(successCount: number, failedCount: number, total: number): void {
    const processed = successCount + failedCount;
    const percentage = Math.round((processed / total) * 100);

    this.syncProgressSignal.update(progress => ({
      ...progress,
      processedItems: processed,
      successItems: successCount,
      failedItems: failedCount,
      percentage
    }));
  }

  /**
   * Update sync status partially
   */
  private updateSyncStatusPartial(updates: Partial<SyncStatus>): void {
    this.syncStatusSignal.update(current => ({
      ...current,
      ...updates
    }));
  }

  /**
   * Utility methods
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateBackoffDelay(attempt: number): number {
    const delay = Math.min(
      this.currentStrategy.retryDelay * Math.pow(2, attempt),
      60000
    );
    return delay + Math.random() * 1000;
  }

  private isRetryableError(error: any): boolean {
    if (error?.status >= 400 && error?.status < 500) {
      return error.status === 408 || error.status === 429;
    }
    return true;
  }

  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.error?.message) return error.error.message;
    if (error?.message) return error.message;
    if (error?.status === 0) return 'Error de conexión';
    return 'Error desconocido';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Public API methods
   */
  async manualSync(): Promise<SyncResult> {
    return this.syncAll(false);
  }

  async fullSync(): Promise<SyncResult> {
    return this.syncAll(true);
  }

  getConflicts(): SyncConflict[] {
    return this.conflictsSignal();
  }

  async resolveConflict(conflictId: string, resolution: 'local' | 'server' | 'merge'): Promise<void> {
    const conflicts = this.conflictsSignal();
    const conflict = conflicts.find(c => c.id === conflictId);

    if (!conflict) {
      console.warn(`Conflict ${conflictId} not found`);
      return;
    }

    console.log(`Resolving conflict ${conflictId} with ${resolution} strategy`);

    try {
      switch (resolution) {
        case 'local':
          await this.resolveConflictWithLocal(conflict);
          break;
        case 'server':
          await this.resolveConflictWithServer(conflict);
          break;
        case 'merge':
          await this.resolveConflictWithMerge(conflict);
          break;
      }

      // Remove resolved conflict from the list
      this.conflictsSignal.update(current =>
        current.filter(c => c.id !== conflictId)
      );

      // Update metadata
      this.syncMetadataSignal.update(meta => ({
        ...meta,
        totalConflicts: Math.max(0, meta.totalConflicts - 1)
      }));

      await this.saveSyncMetadata();

      console.log(`Conflict ${conflictId} resolved successfully`);
    } catch (error: any) {
      console.error(`Failed to resolve conflict ${conflictId}:`, error);
      throw error;
    }
  }

  /**
   * Resolve conflict by keeping local data
   */
  private async resolveConflictWithLocal(conflict: SyncConflict): Promise<void> {
    console.log(`Using local version for ${conflict.entityType} ${conflict.entityId}`);

    // Mark the local entity as pending for upload
    if (conflict.entityType === 'sale' && conflict.localData) {
      await this.database.updateSaleSyncStatus(
        conflict.localData.id,
        'pending',
        'Reintentando sincronización (conflicto resuelto - versión local)'
      );

      // Add to sync queue with high priority
      await this.addToSyncQueue({
        id: this.generateId(),
        type: 'sale',
        operation: 'update',
        entityId: conflict.entityId,
        data: conflict.localData,
        priority: 10, // High priority for resolved conflicts
        createdAt: new Date(),
        retryCount: 0,
        maxRetries: this.currentStrategy.maxRetries,
        status: 'pending'
      });
    }

    // Add audit log
    await this.database.addSyncLog({
      entityType: conflict.entityType,
      entityId: conflict.entityId,
      operation: 'conflict_resolution',
      status: 'success',
      direction: 'upload',
      syncedAt: new Date().toISOString(),
      responseData: JSON.stringify({
        resolution: 'local',
        reason: conflict.reason
      })
    });
  }

  /**
   * Resolve conflict by accepting server data
   */
  private async resolveConflictWithServer(conflict: SyncConflict): Promise<void> {
    console.log(`Using server version for ${conflict.entityType} ${conflict.entityId}`);

    // Apply server data to local database
    if (conflict.entityType === 'sale' && conflict.serverData) {
      const serverSale = conflict.serverData;

      // Update local sale with server data
      const localSale = {
        id: serverSale.id,
        localId: conflict.localData?.localId || `server_${serverSale.id}`,
        customerId: serverSale.customerId,
        customerName: serverSale.customerName || '',
        customerDocument: serverSale.customerDocument || '',
        items: serverSale.items || [],
        subtotal: serverSale.subtotal,
        tax: serverSale.tax,
        discount: serverSale.discount,
        total: serverSale.total,
        paymentMethod: serverSale.paymentMethod,
        notes: serverSale.notes || '',
        saleDate: serverSale.saleDate || new Date().toISOString(),
        createdAt: serverSale.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced' as const,
        syncedAt: new Date().toISOString(),
        serverId: serverSale.id,
        syncAttempts: 0
      };

      await this.database.saveSale(localSale);
    }

    // Add audit log
    await this.database.addSyncLog({
      entityType: conflict.entityType,
      entityId: conflict.entityId,
      operation: 'conflict_resolution',
      status: 'success',
      direction: 'download',
      syncedAt: new Date().toISOString(),
      responseData: JSON.stringify({
        resolution: 'server',
        reason: conflict.reason
      })
    });
  }

  /**
   * Resolve conflict by merging local and server data
   */
  private async resolveConflictWithMerge(conflict: SyncConflict): Promise<void> {
    console.log(`Merging data for ${conflict.entityType} ${conflict.entityId}`);

    if (conflict.entityType === 'sale' && conflict.localData && conflict.serverData) {
      // Intelligent merge strategy:
      // 1. Keep the most recent timestamp
      // 2. Prefer non-empty values
      // 3. For items, merge arrays intelligently

      const localSale = conflict.localData;
      const serverSale = conflict.serverData;

      const mergedSale = {
        id: serverSale.id || localSale.id,
        localId: localSale.localId,

        // Use server IDs for foreign keys if available
        customerId: serverSale.customerId || localSale.customerId,
        customerName: serverSale.customerName || localSale.customerName,
        customerDocument: serverSale.customerDocument || localSale.customerDocument,

        // Merge items - prefer local items if they exist
        items: localSale.items.length > 0 ? localSale.items : serverSale.items || [],

        // Financial data - use server data as it's more authoritative
        subtotal: serverSale.subtotal ?? localSale.subtotal,
        tax: serverSale.tax ?? localSale.tax,
        discount: serverSale.discount ?? localSale.discount,
        total: serverSale.total ?? localSale.total,

        // Payment method - prefer local if set
        paymentMethod: localSale.paymentMethod || serverSale.paymentMethod,

        // Notes - merge both if different
        notes: this.mergeNotes(localSale.notes, serverSale.notes),

        // Timestamps - keep the most recent
        saleDate: this.getMostRecentDate(localSale.saleDate, serverSale.saleDate),
        createdAt: serverSale.createdAt || localSale.createdAt,
        updatedAt: new Date().toISOString(),

        // Sync metadata
        syncStatus: 'synced' as const,
        syncedAt: new Date().toISOString(),
        serverId: serverSale.id,
        syncAttempts: 0
      };

      await this.database.saveSale(mergedSale);

      // Upload merged version to server
      await this.uploadSale(mergedSale);
    }

    // Add audit log
    await this.database.addSyncLog({
      entityType: conflict.entityType,
      entityId: conflict.entityId,
      operation: 'conflict_resolution',
      status: 'success',
      direction: 'both',
      syncedAt: new Date().toISOString(),
      responseData: JSON.stringify({
        resolution: 'merge',
        reason: conflict.reason
      })
    });
  }

  /**
   * Merge notes from two sources
   */
  private mergeNotes(localNotes?: string, serverNotes?: string): string {
    if (!localNotes && !serverNotes) return '';
    if (!localNotes) return serverNotes || '';
    if (!serverNotes) return localNotes;
    if (localNotes === serverNotes) return localNotes;

    return `${serverNotes}\n[Local]: ${localNotes}`;
  }

  /**
   * Get the most recent date from two dates
   */
  private getMostRecentDate(date1?: string, date2?: string): string {
    if (!date1 && !date2) return new Date().toISOString();
    if (!date1) return date2!;
    if (!date2) return date1;

    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return d1 > d2 ? date1 : date2;
  }

  /**
   * Auto-resolve conflicts based on strategy
   */
  async autoResolveConflicts(): Promise<void> {
    const conflicts = this.conflictsSignal();

    if (conflicts.length === 0) {
      return;
    }

    console.log(`Auto-resolving ${conflicts.length} conflicts using ${this.currentStrategy.conflictResolution} strategy`);

    for (const conflict of conflicts) {
      try {
        await this.resolveConflict(conflict.id, this.currentStrategy.conflictResolution);
      } catch (error) {
        console.error(`Failed to auto-resolve conflict ${conflict.id}:`, error);
      }
    }
  }

  setStrategy(strategy: Partial<SyncStrategy>): void {
    this.currentStrategy = { ...this.currentStrategy, ...strategy };
    this.syncMetadataSignal.update(meta => ({
      ...meta,
      currentStrategy: this.currentStrategy
    }));
  }

  setAutoSync(enabled: boolean): void {
    this.syncMetadataSignal.update(meta => ({
      ...meta,
      autoSyncEnabled: enabled
    }));
    this.saveSyncMetadata();
  }

  getSyncLogs(limit = 100): Promise<any[]> {
    return this.database.getSyncLogs(limit);
  }
}
