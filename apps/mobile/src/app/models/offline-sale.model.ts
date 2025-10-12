/**
 * Offline Sale Models
 * For managing sales created while offline
 */

import { PaymentMethod } from './sale.model';

/**
 * Sale item for offline creation
 */
export interface OfflineSaleItem {
  productId?: string;
  productCode?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * Data Transfer Object for creating offline sale
 */
export interface CreateOfflineSaleDto {
  customerId?: string;
  customerName?: string;
  customerDocumentType?: string;
  customerDocument?: string;
  items: OfflineSaleItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  saleDate?: Date | string;
}

/**
 * Offline sale with sync metadata
 */
export interface OfflineSale {
  localId: string;
  saleData: CreateOfflineSaleDto;
  createdAt: Date | string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  syncAttempts: number;
  lastSyncAttempt?: Date | string;
  errorMessage?: string;
  serverId?: string; // ID from server after successful sync
  priority?: number; // Higher number = higher priority
}

/**
 * Sync queue item for offline operations
 */
export interface SyncQueueItem {
  id: string;
  type: 'sale' | 'invoice' | 'customer' | 'product' | 'payment';
  operation: 'create' | 'update' | 'delete';
  data: any;
  createdAt: Date | string;
  priority: number; // 1-10, higher = more important
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date | string;
  lastError?: string;
  metadata?: Record<string, any>;
}

/**
 * Network connection status
 */
export interface NetworkStatus {
  connected: boolean;
  connectionType: 'wifi' | 'cellular' | 'none' | 'unknown';
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  downlink?: number; // Mbps
  rtt?: number; // Round-trip time in ms
}

/**
 * Overall sync status
 */
export interface SyncStatus {
  isSyncing: boolean;
  lastSyncDate?: Date | string;
  lastSuccessfulSync?: Date | string;
  pendingItems: number;
  syncedItems: number;
  failedItems: number;
  totalItems: number;
  errors: SyncError[];
  progress?: number; // 0-100
}

/**
 * Sync error details
 */
export interface SyncError {
  id: string;
  itemId: string;
  itemType: string;
  error: string;
  timestamp: Date | string;
  canRetry: boolean;
}

/**
 * Sync configuration
 */
export interface SyncConfig {
  autoSync: boolean;
  syncInterval: number; // Minutes
  syncOnWifiOnly: boolean;
  maxRetries: number;
  retryDelayMs: number;
  batchSize: number;
}

/**
 * Sync result for a single operation
 */
export interface SyncResult {
  success: boolean;
  localId: string;
  serverId?: string;
  error?: string;
  itemType: string;
  operation: 'create' | 'update' | 'delete';
  timestamp: Date | string;
}
