import { Injectable, signal } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { OfflineSale } from '../models/offline-sale.model';
import { SyncQueueItem } from '../models/sync.model';
import { DatabaseService } from '../core/services/database.service';
import * as CryptoJS from 'crypto-js';

interface StorageConfig {
  name: string;
  driverOrder: string[];
  encryption: boolean;
  encryptionKey?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly OFFLINE_SALES_KEY = 'offline_sales';
  private readonly SYNC_QUEUE_KEY = 'sync_queue';
  private readonly SYNC_METADATA_KEY = 'sync_metadata';
  private readonly ENCRYPTION_KEY = 'pagopy_encryption_key_v1';
  private readonly STORAGE_VERSION = 1;

  private storage: Storage | null = null;
  private platform: string;
  private encryptionEnabled = false;
  private encryptionKey?: string;

  // Signal to track initialization status
  private initializedSignal = signal<boolean>(false);
  readonly isInitialized = this.initializedSignal.asReadonly();

  constructor(
    private ionicStorage: Storage,
    private databaseService: DatabaseService
  ) {
    this.platform = Capacitor.getPlatform();
  }

  /**
   * Initialize storage with robust configuration
   */
  async initialize(config?: Partial<StorageConfig>): Promise<void> {
    if (this.initializedSignal()) {
      console.log('Storage already initialized');
      return;
    }

    try {
      console.log('Initializing storage on platform:', this.platform);

      // Configure Ionic Storage
      const defaultConfig: StorageConfig = {
        name: 'pagopy_storage',
        driverOrder: ['sqlite', 'indexeddb', 'localstorage'],
        encryption: false,
        encryptionKey: undefined
      };

      const finalConfig = { ...defaultConfig, ...config };

      // Initialize Ionic Storage
      this.storage = await this.ionicStorage.create();
      console.log('Ionic Storage driver:', await this.storage.driver);

      // Set up encryption if enabled
      if (finalConfig.encryption && finalConfig.encryptionKey) {
        this.encryptionEnabled = true;
        this.encryptionKey = finalConfig.encryptionKey;
        console.log('Encryption enabled for sensitive data');
      }

      // Initialize SQLite database for native platforms
      if (this.platform !== 'web') {
        await this.databaseService.initialize();
        console.log('SQLite database initialized');
      }

      // Run migrations
      await this.runMigrations();

      this.initializedSignal.set(true);
      console.log('Storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw error;
    }
  }

  /**
   * Run storage migrations
   */
  private async runMigrations(): Promise<void> {
    try {
      const currentVersion = await this.get<number>('storage_version') || 0;

      if (currentVersion < this.STORAGE_VERSION) {
        console.log(`Migrating storage from version ${currentVersion} to ${this.STORAGE_VERSION}`);

        // Migration logic here
        if (currentVersion < 1) {
          // Migration 1: Convert old Preferences data to Ionic Storage
          await this.migrateFromPreferences();
        }

        await this.set('storage_version', this.STORAGE_VERSION);
        console.log('Storage migration completed');
      }
    } catch (error) {
      console.error('Storage migration failed:', error);
      // Don't throw - allow app to continue with current version
    }
  }

  /**
   * Migrate data from Capacitor Preferences to Ionic Storage
   */
  private async migrateFromPreferences(): Promise<void> {
    try {
      // Get all keys from Preferences
      const { keys } = await Preferences.keys();

      for (const key of keys) {
        const { value } = await Preferences.get({ key });
        if (value && this.storage) {
          await this.storage.set(key, JSON.parse(value));
          console.log(`Migrated key: ${key}`);
        }
      }

      console.log(`Migrated ${keys.length} items from Preferences to Ionic Storage`);
    } catch (error) {
      console.error('Failed to migrate from Preferences:', error);
    }
  }

  /**
   * Ensure storage is initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initializedSignal()) {
      await this.initialize();
    }
  }

  /**
   * Generic set method with optional encryption
   */
  async set<T>(key: string, value: T, encrypted = false): Promise<void> {
    await this.ensureInitialized();

    try {
      if (!this.storage) {
        throw new Error('Storage not initialized');
      }

      let finalValue: any = value;

      // Encrypt if requested and encryption is enabled
      if (encrypted && this.encryptionEnabled && this.encryptionKey) {
        const jsonString = JSON.stringify(value);
        finalValue = this.encrypt(jsonString);
      }

      await this.storage.set(key, finalValue);
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  }

  /**
   * Generic get method with optional decryption
   */
  async get<T>(key: string, encrypted = false): Promise<T | null> {
    await this.ensureInitialized();

    try {
      if (!this.storage) {
        throw new Error('Storage not initialized');
      }

      const value = await this.storage.get(key);

      if (value === null || value === undefined) {
        return null;
      }

      // Decrypt if requested and encryption is enabled
      if (encrypted && this.encryptionEnabled && this.encryptionKey) {
        const decrypted = this.decrypt(value);
        return decrypted ? JSON.parse(decrypted) : null;
      }

      return value;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  }

  /**
   * Remove a key from storage
   */
  async remove(key: string): Promise<void> {
    await this.ensureInitialized();

    try {
      if (!this.storage) {
        throw new Error('Storage not initialized');
      }

      await this.storage.remove(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
      throw error;
    }
  }

  /**
   * Clear all data from storage
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();

    try {
      if (!this.storage) {
        throw new Error('Storage not initialized');
      }

      await this.storage.clear();

      // Also clear SQLite database if on native platform
      if (this.platform !== 'web') {
        await this.databaseService.clearAllData();
      }

      console.log('Storage cleared successfully');
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Get all keys from storage
   */
  async keys(): Promise<string[]> {
    await this.ensureInitialized();

    try {
      if (!this.storage) {
        throw new Error('Storage not initialized');
      }

      return await this.storage.keys();
    } catch (error) {
      console.error('Error getting keys from storage:', error);
      return [];
    }
  }

  /**
   * Get storage size estimate (in bytes)
   */
  async getStorageSize(): Promise<number> {
    try {
      const allKeys = await this.keys();
      let totalSize = 0;

      for (const key of allKeys) {
        const value = await this.get(key);
        if (value) {
          totalSize += JSON.stringify(value).length;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }

  /**
   * Export all data as JSON
   */
  async exportData(): Promise<string> {
    await this.ensureInitialized();

    try {
      const allKeys = await this.keys();
      const data: Record<string, any> = {};

      for (const key of allKeys) {
        data[key] = await this.get(key);
      }

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Import data from JSON
   */
  async importData(jsonData: string, overwrite = false): Promise<number> {
    await this.ensureInitialized();

    try {
      const data = JSON.parse(jsonData);
      let importedCount = 0;

      for (const [key, value] of Object.entries(data)) {
        if (overwrite || (await this.get(key)) === null) {
          await this.set(key, value);
          importedCount++;
        }
      }

      console.log(`Imported ${importedCount} items`);
      return importedCount;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  /**
   * Encrypt data using AES
   */
  private encrypt(data: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }

    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }

  /**
   * Decrypt data using AES
   */
  private decrypt(encryptedData: string): string | null {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  // Specific methods for common operations
  async setAuthToken(token: string): Promise<void> {
    await this.set('auth_token', token);
  }

  async getAuthToken(): Promise<string | null> {
    return await this.get<string>('auth_token');
  }

  async removeAuthToken(): Promise<void> {
    await this.remove('auth_token');
  }

  async setPendingSales(sales: any[]): Promise<void> {
    await this.set('pending_sales', sales);
  }

  async getPendingSales(): Promise<any[]> {
    const sales = await this.get<any[]>('pending_sales');
    return sales || [];
  }

  // ============================================
  // OFFLINE SALES MANAGEMENT
  // ============================================

  /**
   * Save a single offline sale
   */
  async saveOfflineSale(sale: OfflineSale): Promise<void> {
    const sales = await this.getOfflineSales();
    const existingIndex = sales.findIndex(s => s.localId === sale.localId);

    if (existingIndex >= 0) {
      sales[existingIndex] = sale;
    } else {
      sales.push(sale);
    }

    await this.set(this.OFFLINE_SALES_KEY, sales);
  }

  /**
   * Get all offline sales
   */
  async getOfflineSales(): Promise<OfflineSale[]> {
    const sales = await this.get<OfflineSale[]>(this.OFFLINE_SALES_KEY);
    return sales || [];
  }

  /**
   * Get offline sales by status
   */
  async getOfflineSalesByStatus(status: OfflineSale['syncStatus']): Promise<OfflineSale[]> {
    const sales = await this.getOfflineSales();
    return sales.filter(sale => sale.syncStatus === status);
  }

  /**
   * Get pending offline sales (not synced)
   */
  async getPendingOfflineSales(): Promise<OfflineSale[]> {
    return this.getOfflineSalesByStatus('pending');
  }

  /**
   * Update offline sale status
   */
  async updateOfflineSaleStatus(
    localId: string,
    status: OfflineSale['syncStatus'],
    errorMessage?: string,
    serverId?: string
  ): Promise<void> {
    const sales = await this.getOfflineSales();
    const saleIndex = sales.findIndex(s => s.localId === localId);

    if (saleIndex >= 0) {
      sales[saleIndex].syncStatus = status;
      sales[saleIndex].lastSyncAttempt = new Date();

      if (status === 'syncing' || status === 'error') {
        sales[saleIndex].syncAttempts += 1;
      }

      if (errorMessage) {
        sales[saleIndex].errorMessage = errorMessage;
      }

      if (serverId) {
        sales[saleIndex].serverId = serverId;
      }

      await this.set(this.OFFLINE_SALES_KEY, sales);
    }
  }

  /**
   * Delete offline sale
   */
  async deleteOfflineSale(localId: string): Promise<void> {
    const sales = await this.getOfflineSales();
    const filteredSales = sales.filter(s => s.localId !== localId);
    await this.set(this.OFFLINE_SALES_KEY, filteredSales);
  }

  /**
   * Delete all synced offline sales
   */
  async deleteSyncedOfflineSales(): Promise<number> {
    const sales = await this.getOfflineSales();
    const syncedSales = sales.filter(s => s.syncStatus === 'synced');
    const remainingSales = sales.filter(s => s.syncStatus !== 'synced');

    await this.set(this.OFFLINE_SALES_KEY, remainingSales);
    return syncedSales.length;
  }

  /**
   * Get count of pending sales
   */
  async getPendingSalesCount(): Promise<number> {
    const sales = await this.getPendingOfflineSales();
    return sales.length;
  }

  // ============================================
  // SYNC QUEUE MANAGEMENT
  // ============================================

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    const queue = await this.getSyncQueue();
    queue.push(item);
    await this.set(this.SYNC_QUEUE_KEY, queue);
  }

  /**
   * Get all sync queue items
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const queue = await this.get<SyncQueueItem[]>(this.SYNC_QUEUE_KEY);
    return queue || [];
  }

  /**
   * Remove item from sync queue
   */
  async removeFromSyncQueue(id: string): Promise<void> {
    const queue = await this.getSyncQueue();
    const filteredQueue = queue.filter(item => item.id !== id);
    await this.set(this.SYNC_QUEUE_KEY, filteredQueue);
  }

  /**
   * Update sync queue item
   */
  async updateSyncQueueItem(item: SyncQueueItem): Promise<void> {
    const queue = await this.getSyncQueue();
    const index = queue.findIndex(i => i.id === item.id);

    if (index >= 0) {
      queue[index] = item;
      await this.set(this.SYNC_QUEUE_KEY, queue);
    }
  }

  /**
   * Clear sync queue
   */
  async clearSyncQueue(): Promise<void> {
    await this.remove(this.SYNC_QUEUE_KEY);
  }

  // ============================================
  // SYNC METADATA
  // ============================================

  /**
   * Save last sync timestamp
   */
  async setLastSyncDate(date: Date): Promise<void> {
    await this.set(this.SYNC_METADATA_KEY, {
      lastSyncDate: date.toISOString()
    });
  }

  /**
   * Get last sync timestamp
   */
  async getLastSyncDate(): Promise<Date | null> {
    const metadata = await this.get<{ lastSyncDate: string }>(this.SYNC_METADATA_KEY);
    return metadata?.lastSyncDate ? new Date(metadata.lastSyncDate) : null;
  }

  // ============================================
  // CLEANUP OPERATIONS
  // ============================================

  /**
   * Clean old synced sales (older than 30 days)
   */
  async cleanOldSyncedSales(daysToKeep = 30): Promise<number> {
    const sales = await this.getOfflineSales();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const salesToKeep = sales.filter(sale => {
      if (sale.syncStatus !== 'synced') {
        return true; // Keep all non-synced sales
      }

      const saleDate = new Date(sale.createdAt);
      return saleDate > cutoffDate;
    });

    const removedCount = sales.length - salesToKeep.length;
    await this.set(this.OFFLINE_SALES_KEY, salesToKeep);

    return removedCount;
  }
}
