/**
 * Enhanced sync models with conflict resolution
 */

export interface SyncQueueItem {
  id: string;
  type: 'sale' | 'invoice' | 'customer' | 'product';
  operation: 'create' | 'update' | 'delete';
  entityId: string;
  data: any;
  priority: number;
  createdAt: Date;
  scheduledAt?: Date;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
  lastError?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
}

export interface SyncConflict {
  id: string;
  entityType: 'sale' | 'product' | 'customer' | 'invoice';
  entityId: string;
  localVersion: any;
  serverVersion: any;
  conflictType: 'version' | 'deleted' | 'modified';
  detectedAt: Date;
  resolvedAt?: Date;
  resolution?: 'local' | 'server' | 'merge' | 'manual';
  resolvedBy?: string;
}

export interface SyncProgress {
  totalItems: number;
  processedItems: number;
  successItems: number;
  failedItems: number;
  currentItem?: string;
  currentOperation?: string;
  percentage: number;
  startedAt: Date;
  estimatedCompletion?: Date;
}

export interface SyncResult {
  success: boolean;
  itemsSynced: number;
  itemsFailed: number;
  conflicts: SyncConflict[];
  errors: SyncError[];
  duration: number;
  timestamp: Date;
}

export interface SyncError {
  id: string;
  entityType: string;
  entityId: string;
  operation: string;
  errorCode?: string;
  errorMessage: string;
  isRetryable: boolean;
  timestamp: Date;
}

export interface SyncStrategy {
  bidirectional: boolean;
  conflictResolution: 'local-wins' | 'server-wins' | 'manual' | 'merge';
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
  syncOnConnection: boolean;
  syncInterval?: number;
  priorityOrder: string[];
}

export interface SyncMetadata {
  lastFullSync?: Date;
  lastPartialSync?: Date;
  lastSuccessfulSync?: Date;
  pendingUploads: number;
  pendingDownloads: number;
  totalSynced: number;
  totalConflicts: number;
  autoSyncEnabled: boolean;
  currentStrategy: SyncStrategy;
}
