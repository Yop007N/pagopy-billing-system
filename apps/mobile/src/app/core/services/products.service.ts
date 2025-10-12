import { Injectable, inject, signal } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { StorageService } from '../../services/storage.service';
import { NetworkService } from './network.service';
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductSearchParams,
  OfflineProduct,
  ProductCacheMetadata
} from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private api = inject(ApiService);
  private storage = inject(StorageService);
  private network = inject(NetworkService);

  // Storage keys
  private readonly PRODUCTS_CACHE_KEY = 'products_cache';
  private readonly PRODUCTS_METADATA_KEY = 'products_metadata';
  private readonly OFFLINE_PRODUCTS_KEY = 'offline_products';
  private readonly PENDING_PRODUCT_OPERATIONS_KEY = 'pending_product_operations';

  // Reactive state
  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  lastSync = signal<Date | null>(null);

  constructor() {
    this.loadCachedProducts();
  }

  // ============================================
  // PUBLIC API METHODS
  // ============================================

  /**
   * Get all products with offline support
   */
  getProducts(forceRefresh = false): Observable<Product[]> {
    this.loading.set(true);
    this.error.set(null);

    // If offline, return cached products
    if (!this.network.isOnline() && !forceRefresh) {
      return from(this.getCachedProducts()).pipe(
        tap(products => {
          this.products.set(products);
          this.loading.set(false);
        }),
        catchError(err => {
          this.error.set('Error al cargar productos locales');
          this.loading.set(false);
          return throwError(() => err);
        })
      );
    }

    // If online, fetch from API
    return this.api.get<Product[]>('/products').pipe(
      tap(async (products) => {
        // Cache products
        await this.cacheProducts(products);
        this.products.set(products);
        this.lastSync.set(new Date());
        this.loading.set(false);
      }),
      catchError(async (_err) => {
        // Fallback to cache on error
        const cached = await this.getCachedProducts();
        this.products.set(cached);
        this.error.set('Error al sincronizar. Mostrando datos locales.');
        this.loading.set(false);
        return of(cached);
      })
    );
  }

  /**
   * Search products locally or remotely
   */
  searchProducts(params: ProductSearchParams): Observable<Product[]> {
    if (!this.network.isOnline()) {
      // Offline search in cache
      return from(this.searchProductsLocally(params));
    }

    // Online search via API
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    if (params.minPrice) queryParams.append('minPrice', String(params.minPrice));
    if (params.maxPrice) queryParams.append('maxPrice', String(params.maxPrice));
    if (params.minStock) queryParams.append('minStock', String(params.minStock));
    if (params.taxRate) queryParams.append('taxRate', String(params.taxRate));
    if (params.limit) queryParams.append('limit', String(params.limit));
    if (params.offset) queryParams.append('offset', String(params.offset));

    const query = queryParams.toString();
    return this.api.get<Product[]>(`/products/search?${query}`);
  }

  /**
   * Get product by ID
   */
  getProductById(id: string): Observable<Product> {
    if (!this.network.isOnline()) {
      return from(this.getProductFromCache(id));
    }

    return this.api.get<Product>(`/products/${id}`).pipe(
      catchError(async () => {
        // Fallback to cache
        return await this.getProductFromCache(id);
      })
    );
  }

  /**
   * Get product by code
   */
  getProductByCode(code: string): Observable<Product | null> {
    if (!this.network.isOnline()) {
      return from(this.getProductByCodeFromCache(code));
    }

    return this.api.get<Product>(`/products/code/${code}`).pipe(
      catchError(async () => {
        // Fallback to cache
        return await this.getProductByCodeFromCache(code);
      })
    );
  }

  /**
   * Create new product with offline support
   */
  createProduct(data: CreateProductDto): Observable<Product> {
    if (!this.network.isOnline()) {
      return from(this.createProductOffline(data));
    }

    return this.api.post<Product>('/products', data).pipe(
      tap(async (product) => {
        // Update cache
        const cached = await this.getCachedProducts();
        cached.push(product);
        await this.cacheProducts(cached);
        this.products.set(cached);
      }),
      catchError((_err) => {
        // If online but request fails, create offline
        return from(this.createProductOffline(data));
      })
    );
  }

  /**
   * Update product with offline support
   */
  updateProduct(id: string, data: UpdateProductDto): Observable<Product> {
    if (!this.network.isOnline()) {
      return from(this.updateProductOffline(id, data));
    }

    return this.api.put<Product>(`/products/${id}`, data).pipe(
      tap(async (product) => {
        // Update cache
        await this.updateProductInCache(product);
        const cached = await this.getCachedProducts();
        this.products.set(cached);
      }),
      catchError(() => {
        // If online but request fails, update offline
        return from(this.updateProductOffline(id, data));
      })
    );
  }

  /**
   * Delete product with offline support
   */
  deleteProduct(id: string): Observable<void> {
    if (!this.network.isOnline()) {
      return from(this.deleteProductOffline(id));
    }

    return this.api.delete<void>(`/products/${id}`).pipe(
      tap(async () => {
        // Remove from cache
        await this.removeProductFromCache(id);
        const cached = await this.getCachedProducts();
        this.products.set(cached);
      }),
      catchError(() => {
        // If online but request fails, delete offline
        return from(this.deleteProductOffline(id));
      })
    );
  }

  /**
   * Update product stock
   */
  updateStock(id: string, quantity: number, operation: 'add' | 'subtract' | 'set'): Observable<Product> {
    if (!this.network.isOnline()) {
      return from(this.updateStockOffline(id, quantity, operation));
    }

    return this.api.put<Product>(`/products/${id}/stock`, { quantity, operation }).pipe(
      tap(async (product) => {
        await this.updateProductInCache(product);
        const cached = await this.getCachedProducts();
        this.products.set(cached);
      }),
      catchError(() => {
        return from(this.updateStockOffline(id, quantity, operation));
      })
    );
  }

  /**
   * Get active products only
   */
  getActiveProducts(): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => products.filter(p => p.isActive))
    );
  }

  /**
   * Get low stock products (stock < 10)
   */
  getLowStockProducts(threshold = 10): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => products.filter(p => p.stock < threshold && p.isActive))
    );
  }

  /**
   * Get pending sync count
   */
  getPendingSyncCount(): Observable<number> {
    return from(this.storage.get<OfflineProduct[]>(this.OFFLINE_PRODUCTS_KEY)).pipe(
      map(products => products?.filter(p => p.syncStatus === 'pending').length || 0)
    );
  }

  /**
   * Sync pending products
   */
  syncPendingProducts(): Observable<{ success: number; failed: number }> {
    return from(this.syncOfflineProducts());
  }

  /**
   * Clear products cache
   */
  async clearCache(): Promise<void> {
    await this.storage.remove(this.PRODUCTS_CACHE_KEY);
    await this.storage.remove(this.PRODUCTS_METADATA_KEY);
    this.products.set([]);
    this.lastSync.set(null);
  }

  // ============================================
  // PRIVATE CACHE METHODS
  // ============================================

  private async loadCachedProducts(): Promise<void> {
    try {
      const cached = await this.getCachedProducts();
      this.products.set(cached);

      const metadata = await this.storage.get<ProductCacheMetadata>(this.PRODUCTS_METADATA_KEY);
      if (metadata?.lastUpdate) {
        this.lastSync.set(new Date(metadata.lastUpdate));
      }
    } catch (error) {
      console.error('Error loading cached products:', error);
    }
  }

  private async getCachedProducts(): Promise<Product[]> {
    const cached = await this.storage.get<Product[]>(this.PRODUCTS_CACHE_KEY);
    return cached || [];
  }

  private async cacheProducts(products: Product[]): Promise<void> {
    await this.storage.set(this.PRODUCTS_CACHE_KEY, products);

    const metadata: ProductCacheMetadata = {
      lastUpdate: new Date().toISOString(),
      totalProducts: products.length,
      version: 1
    };
    await this.storage.set(this.PRODUCTS_METADATA_KEY, metadata);
  }

  private async getProductFromCache(id: string): Promise<Product> {
    const products = await this.getCachedProducts();
    const product = products.find(p => p.id === id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    return product;
  }

  private async getProductByCodeFromCache(code: string): Promise<Product | null> {
    const products = await this.getCachedProducts();
    return products.find(p => p.code === code) || null;
  }

  private async updateProductInCache(product: Product): Promise<void> {
    const products = await this.getCachedProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
      await this.cacheProducts(products);
    }
  }

  private async removeProductFromCache(id: string): Promise<void> {
    const products = await this.getCachedProducts();
    const filtered = products.filter(p => p.id !== id);
    await this.cacheProducts(filtered);
  }

  private async searchProductsLocally(params: ProductSearchParams): Promise<Product[]> {
    let products = await this.getCachedProducts();

    // Apply filters
    if (params.query) {
      const query = params.query.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    if (params.isActive !== undefined) {
      products = products.filter(p => p.isActive === params.isActive);
    }

    if (params.minPrice) {
      products = products.filter(p => p.price >= params.minPrice!);
    }

    if (params.maxPrice) {
      products = products.filter(p => p.price <= params.maxPrice!);
    }

    if (params.minStock !== undefined) {
      products = products.filter(p => p.stock >= params.minStock!);
    }

    if (params.taxRate !== undefined) {
      products = products.filter(p => p.taxRate === params.taxRate);
    }

    // Apply pagination
    if (params.offset) {
      products = products.slice(params.offset);
    }

    if (params.limit) {
      products = products.slice(0, params.limit);
    }

    return products;
  }

  // ============================================
  // PRIVATE OFFLINE METHODS
  // ============================================

  private async createProductOffline(data: CreateProductDto): Promise<Product> {
    const localId = `offline_product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const offlineProduct: OfflineProduct = {
      id: localId,
      localId,
      userId: '', // Will be set on sync
      ...data,
      stock: data.stock || 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      synced: false,
      syncStatus: 'pending',
      syncAttempts: 0
    };

    // Save to offline storage
    const offlineProducts = await this.storage.get<OfflineProduct[]>(this.OFFLINE_PRODUCTS_KEY) || [];
    offlineProducts.push(offlineProduct);
    await this.storage.set(this.OFFLINE_PRODUCTS_KEY, offlineProducts);

    // Add to cache
    const cached = await this.getCachedProducts();
    cached.push(offlineProduct);
    await this.cacheProducts(cached);
    this.products.set(cached);

    return offlineProduct;
  }

  private async updateProductOffline(id: string, data: UpdateProductDto): Promise<Product> {
    // Get product from cache
    const product = await this.getProductFromCache(id);
    const updated: Product = {
      ...product,
      ...data,
      updatedAt: new Date().toISOString()
    };

    // Update in cache
    await this.updateProductInCache(updated);

    // Queue for sync
    const operation = {
      id: `update_${id}_${Date.now()}`,
      type: 'update',
      productId: id,
      data,
      timestamp: new Date().toISOString()
    };
    await this.addPendingOperation(operation);

    return updated;
  }

  private async deleteProductOffline(id: string): Promise<void> {
    // Remove from cache
    await this.removeProductFromCache(id);

    // Queue for sync
    const operation = {
      id: `delete_${id}_${Date.now()}`,
      type: 'delete',
      productId: id,
      timestamp: new Date().toISOString()
    };
    await this.addPendingOperation(operation);
  }

  private async updateStockOffline(
    id: string,
    quantity: number,
    operation: 'add' | 'subtract' | 'set'
  ): Promise<Product> {
    const product = await this.getProductFromCache(id);

    let newStock = product.stock;
    if (operation === 'add') {
      newStock += quantity;
    } else if (operation === 'subtract') {
      newStock -= quantity;
    } else {
      newStock = quantity;
    }

    const updated: Product = {
      ...product,
      stock: Math.max(0, newStock), // Prevent negative stock
      updatedAt: new Date().toISOString()
    };

    await this.updateProductInCache(updated);

    // Queue for sync
    const syncOperation = {
      id: `stock_${id}_${Date.now()}`,
      type: 'updateStock',
      productId: id,
      data: { quantity, operation },
      timestamp: new Date().toISOString()
    };
    await this.addPendingOperation(syncOperation);

    return updated;
  }

  private async addPendingOperation(operation: any): Promise<void> {
    const operations = await this.storage.get<any[]>(this.PENDING_PRODUCT_OPERATIONS_KEY) || [];
    operations.push(operation);
    await this.storage.set(this.PENDING_PRODUCT_OPERATIONS_KEY, operations);
  }

  // ============================================
  // SYNC METHODS
  // ============================================

  private async syncOfflineProducts(): Promise<{ success: number; failed: number }> {
    if (!this.network.isOnline()) {
      throw new Error('No hay conexión a internet');
    }

    let success = 0;
    let failed = 0;

    // Sync offline created products
    const offlineProducts = await this.storage.get<OfflineProduct[]>(this.OFFLINE_PRODUCTS_KEY) || [];
    const pendingProducts = offlineProducts.filter(p => p.syncStatus === 'pending');

    for (const product of pendingProducts) {
      try {
        const { localId: _localId, syncStatus: _syncStatus, syncAttempts: _syncAttempts, lastSyncAttempt: _lastSyncAttempt, errorMessage: _errorMessage, serverId: _serverId, synced: _synced, ...productData } = product;

        const created = await this.api.post<Product>('/products', productData).toPromise();

        if (created) {
          // Update offline product with server ID
          product.syncStatus = 'synced';
          product.serverId = created.id;
          product.synced = true;
          product.lastSyncedAt = new Date().toISOString();
          success++;

          // Update in cache
          await this.removeProductFromCache(product.id);
          await this.updateProductInCache(created);
        }
      } catch (error) {
        product.syncStatus = 'error';
        product.syncAttempts++;
        product.lastSyncAttempt = new Date().toISOString();
        product.errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        failed++;
      }
    }

    // Save updated offline products
    await this.storage.set(this.OFFLINE_PRODUCTS_KEY, offlineProducts);

    // Sync pending operations
    const operations = await this.storage.get<any[]>(this.PENDING_PRODUCT_OPERATIONS_KEY) || [];
    const remainingOperations = [];

    for (const op of operations) {
      try {
        if (op.type === 'update') {
          await this.api.put(`/products/${op.productId}`, op.data).toPromise();
          success++;
        } else if (op.type === 'delete') {
          await this.api.delete(`/products/${op.productId}`).toPromise();
          success++;
        } else if (op.type === 'updateStock') {
          await this.api.put(`/products/${op.productId}/stock`, op.data).toPromise();
          success++;
        }
      } catch (error) {
        remainingOperations.push(op);
        failed++;
      }
    }

    await this.storage.set(this.PENDING_PRODUCT_OPERATIONS_KEY, remainingOperations);

    // Refresh products from server
    await this.getProducts(true).toPromise();

    return { success, failed };
  }
}
