/**
 * Product model for mobile app
 * Matches backend Prisma schema with offline-specific fields
 */

/**
 * Product interface matching backend Prisma schema
 * Represents a product in the catalog with tax information
 */
export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number; // Decimal in DB, number in TypeScript
  cost?: number; // Decimal in DB, number in TypeScript
  stock: number;
  taxRate: number; // Default: 10 (IVA 10%), can be 0, 5, or 10
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Foreign keys
  userId: string;

  // Mobile-specific optional fields
  imageUrl?: string;
  category?: string;
  categoryId?: string;

  // Offline sync fields
  _synced?: boolean;
  _localId?: string;
  _lastSyncedAt?: Date | string;
}

/**
 * Data Transfer Object for creating a new product
 */
export interface CreateProductDto {
  code: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock?: number;
  taxRate: number; // 0, 5, or 10
  imageUrl?: string;
  categoryId?: string;
}

/**
 * Data Transfer Object for updating product information
 */
export interface UpdateProductDto {
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  stock?: number;
  taxRate?: number;
  isActive?: boolean;
  imageUrl?: string;
  categoryId?: string;
}

/**
 * Search parameters for product queries
 */
export interface ProductSearchParams {
  query?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  taxRate?: number;
  categoryId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'price' | 'stock' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Offline product for local storage with sync metadata
 */
export interface OfflineProduct extends Product {
  _localId: string;
  _syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  _syncAttempts: number;
  _lastSyncAttempt?: Date | string;
  _errorMessage?: string;
  _serverId?: string; // ID from server after successful sync
}

/**
 * Product cache metadata for offline storage
 */
export interface ProductCacheMetadata {
  lastUpdate: Date | string;
  totalProducts: number;
  version: number;
  checksum?: string;
}

/**
 * Product list response with pagination
 */
export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
