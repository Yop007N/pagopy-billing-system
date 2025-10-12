import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerSearchParams,
  CustomerListResponse,
  CustomerWithStats
} from '../../models/customer.model';
import { NetworkService } from './network.service';
import { environment } from '../../../environments/environment';

/**
 * CustomersService - Comprehensive customer management with offline support
 *
 * Features:
 * - CRUD operations with API integration
 * - Local caching with Ionic Storage
 * - Offline-first architecture
 * - Background sync queue
 * - RUC validation for Paraguay
 * - Search and filtering
 */
@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private http = inject(HttpClient);
  private storage = inject(Storage);
  private networkService = inject(NetworkService);

  private readonly API_URL = `${environment.apiUrl}/customers`;
  private readonly CACHE_KEY = environment.storageKeys.customersCache;
  private readonly SYNC_QUEUE_KEY = 'customers_sync_queue';
  private readonly CACHE_TIMESTAMP_KEY = 'customers_cache_timestamp';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Signals for reactive state
  customers = signal<Customer[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  syncPending = signal(false);

  private initialized = false;

  constructor() {
    this.initStorage();
  }

  /**
   * Initialize Ionic Storage
   */
  private async initStorage(): Promise<void> {
    if (!this.initialized) {
      await this.storage.create();
      this.initialized = true;
      this.checkSyncQueue();
    }
  }

  /**
   * Get all customers with optional filters
   */
  getCustomers(params?: CustomerSearchParams): Observable<CustomerListResponse> {
    this.loading.set(true);
    this.error.set(null);

    return from(this.ensureStorageReady()).pipe(
      switchMap(() => this.networkService.isOnline$),
      switchMap(isOnline => {
        if (isOnline) {
          return this.fetchCustomersFromAPI(params);
        } else {
          return this.getCustomersFromCache(params);
        }
      }),
      tap(response => {
        this.customers.set(response.data);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Error al cargar clientes');
        this.loading.set(false);
        console.error('Error fetching customers:', error);
        // Fallback to cache on error
        return from(this.getCustomersFromCache(params));
      })
    );
  }

  /**
   * Get customer by ID
   */
  getCustomerById(id: string): Observable<Customer> {
    return from(this.ensureStorageReady()).pipe(
      switchMap(() => this.networkService.isOnline$),
      switchMap(isOnline => {
        if (isOnline) {
          return this.http.get<Customer>(`${this.API_URL}/${id}`).pipe(
            tap(customer => this.updateCustomerInCache(customer)),
            catchError(error => {
              console.error('Error fetching customer from API:', error);
              return from(this.getCustomerFromCache(id));
            })
          );
        } else {
          return from(this.getCustomerFromCache(id));
        }
      })
    );
  }

  /**
   * Create new customer
   */
  createCustomer(dto: CreateCustomerDto): Observable<Customer> {
    this.loading.set(true);
    this.error.set(null);

    // Validate RUC if provided
    if (dto.taxId && !this.validateRUC(dto.taxId)) {
      this.loading.set(false);
      this.error.set('RUC inválido');
      return throwError(() => new Error('RUC inválido'));
    }

    return from(this.ensureStorageReady()).pipe(
      switchMap(() => this.networkService.isOnline$),
      switchMap(isOnline => {
        if (isOnline) {
          return this.http.post<Customer>(this.API_URL, dto).pipe(
            tap(customer => {
              this.addCustomerToCache(customer);
              this.loading.set(false);
            }),
            catchError(error => {
              this.error.set('Error al crear cliente');
              this.loading.set(false);
              throw error;
            })
          );
        } else {
          // Create customer offline and queue for sync
          return from(this.createCustomerOffline(dto));
        }
      })
    );
  }

  /**
   * Update customer
   */
  updateCustomer(id: string, dto: UpdateCustomerDto): Observable<Customer> {
    this.loading.set(true);
    this.error.set(null);

    // Validate RUC if provided
    if (dto.taxId && !this.validateRUC(dto.taxId)) {
      this.loading.set(false);
      this.error.set('RUC inválido');
      return throwError(() => new Error('RUC inválido'));
    }

    return from(this.ensureStorageReady()).pipe(
      switchMap(() => this.networkService.isOnline$),
      switchMap(isOnline => {
        if (isOnline) {
          return this.http.patch<Customer>(`${this.API_URL}/${id}`, dto).pipe(
            tap(customer => {
              this.updateCustomerInCache(customer);
              this.loading.set(false);
            }),
            catchError(error => {
              this.error.set('Error al actualizar cliente');
              this.loading.set(false);
              throw error;
            })
          );
        } else {
          // Update customer offline and queue for sync
          return from(this.updateCustomerOffline(id, dto));
        }
      })
    );
  }

  /**
   * Delete customer
   */
  deleteCustomer(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return from(this.ensureStorageReady()).pipe(
      switchMap(() => this.networkService.isOnline$),
      switchMap(isOnline => {
        if (isOnline) {
          return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
            tap(() => {
              this.removeCustomerFromCache(id);
              this.loading.set(false);
            }),
            catchError(error => {
              this.error.set('Error al eliminar cliente');
              this.loading.set(false);
              throw error;
            })
          );
        } else {
          // Delete customer offline and queue for sync
          return from(this.deleteCustomerOffline(id));
        }
      })
    );
  }

  /**
   * Search customers by name, document, or RUC
   */
  searchCustomers(query: string): Observable<Customer[]> {
    const normalizedQuery = query.toLowerCase().trim();

    return from(this.ensureStorageReady()).pipe(
      switchMap(() => this.networkService.isOnline$),
      switchMap(isOnline => {
        if (isOnline) {
          const params = new HttpParams().set('search', query);
          return this.http.get<CustomerListResponse>(this.API_URL, { params }).pipe(
            map(response => response.data),
            tap(customers => {
              // Update cache with search results
              customers.forEach(c => this.updateCustomerInCache(c));
            })
          );
        } else {
          // Search in cache
          return from(this.searchCustomersInCache(normalizedQuery));
        }
      })
    );
  }

  /**
   * Get customer statistics
   */
  getCustomerStats(id: string): Observable<CustomerWithStats> {
    return this.http.get<CustomerWithStats>(`${this.API_URL}/${id}/stats`).pipe(
      catchError(error => {
        console.error('Error fetching customer stats:', error);
        // Return customer without stats on error
        return this.getCustomerById(id) as Observable<CustomerWithStats>;
      })
    );
  }

  /**
   * Validate Paraguayan RUC format
   * Format: XXXXXXXX-X (8 digits + dash + check digit)
   */
  validateRUC(ruc: string): boolean {
    if (!ruc) return false;

    // Remove spaces and convert to uppercase
    const cleanRUC = ruc.replace(/\s/g, '').toUpperCase();

    // Check format: 8 digits + dash + 1 digit
    const rucPattern = /^\d{8}-\d$/;
    if (!rucPattern.test(cleanRUC)) {
      return false;
    }

    // Extract base number and check digit
    const [baseNumber, checkDigit] = cleanRUC.split('-');
    const base = parseInt(baseNumber, 10);
    const check = parseInt(checkDigit, 10);

    // Calculate check digit using modulo 11 algorithm
    const calculatedCheck = this.calculateRUCCheckDigit(base);

    return calculatedCheck === check;
  }

  /**
   * Calculate RUC check digit using modulo 11
   */
  private calculateRUCCheckDigit(baseNumber: number): number {
    const digits = baseNumber.toString().split('').map(Number);
    const multipliers = [2, 3, 4, 5, 6, 7, 2, 3];

    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * multipliers[i];
    }

    const remainder = sum % 11;
    const checkDigit = remainder === 0 ? 0 : 11 - remainder;

    return checkDigit;
  }

  /**
   * Format RUC with dash
   */
  formatRUC(ruc: string): string {
    const cleanRUC = ruc.replace(/\D/g, '');
    if (cleanRUC.length === 9) {
      return `${cleanRUC.substring(0, 8)}-${cleanRUC.substring(8)}`;
    }
    return ruc;
  }

  /**
   * Sync pending operations with server
   */
  async syncPendingOperations(): Promise<void> {
    await this.ensureStorageReady();
    const isOnline = await this.networkService.isOnline$.toPromise();

    if (!isOnline) {
      console.log('Cannot sync: device is offline');
      return;
    }

    const queue = await this.storage.get(this.SYNC_QUEUE_KEY) || [];
    if (queue.length === 0) {
      this.syncPending.set(false);
      return;
    }

    this.syncPending.set(true);

    for (const operation of queue) {
      try {
        await this.processSyncOperation(operation);
        // Remove from queue after successful sync
        const updatedQueue = queue.filter((op: any) => op.id !== operation.id);
        await this.storage.set(this.SYNC_QUEUE_KEY, updatedQueue);
      } catch (error) {
        console.error('Error syncing operation:', operation, error);
        // Keep in queue for retry
      }
    }

    this.syncPending.set(false);
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    await this.ensureStorageReady();
    await this.storage.remove(this.CACHE_KEY);
    await this.storage.remove(this.CACHE_TIMESTAMP_KEY);
    this.customers.set([]);
  }

  // ========== PRIVATE METHODS ==========

  private async ensureStorageReady(): Promise<void> {
    if (!this.initialized) {
      await this.initStorage();
    }
  }

  private fetchCustomersFromAPI(params?: CustomerSearchParams): Observable<CustomerListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.customerType) httpParams = httpParams.set('customerType', params.customerType);
      if (params.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive.toString());
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<CustomerListResponse>(this.API_URL, { params: httpParams }).pipe(
      tap(response => {
        // Cache the results
        this.cacheCustomers(response.data);
      })
    );
  }

  private async getCustomersFromCache(params?: CustomerSearchParams): Promise<CustomerListResponse> {
    await this.ensureStorageReady();
    let customers: Customer[] = await this.storage.get(this.CACHE_KEY) || [];

    // Apply filters
    if (params) {
      if (params.search) {
        const query = params.search.toLowerCase();
        customers = customers.filter(c =>
          c.name.toLowerCase().includes(query) ||
          c.documentId.toLowerCase().includes(query) ||
          (c.taxId && c.taxId.toLowerCase().includes(query))
        );
      }
      if (params.customerType) {
        customers = customers.filter(c => c.customerType === params.customerType);
      }
      if (params.isActive !== undefined) {
        customers = customers.filter(c => c.isActive === params.isActive);
      }
    }

    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCustomers = customers.slice(startIndex, endIndex);

    return {
      data: paginatedCustomers,
      total: customers.length,
      page,
      limit,
      totalPages: Math.ceil(customers.length / limit)
    };
  }

  private async cacheCustomers(customers: Customer[]): Promise<void> {
    await this.ensureStorageReady();
    const existingCache: Customer[] = await this.storage.get(this.CACHE_KEY) || [];

    // Merge with existing cache (update or add)
    const mergedCache = [...existingCache];
    customers.forEach(customer => {
      const index = mergedCache.findIndex(c => c.id === customer.id);
      if (index >= 0) {
        mergedCache[index] = { ...customer, _synced: true };
      } else {
        mergedCache.push({ ...customer, _synced: true });
      }
    });

    await this.storage.set(this.CACHE_KEY, mergedCache);
    await this.storage.set(this.CACHE_TIMESTAMP_KEY, Date.now());
  }

  private async getCustomerFromCache(id: string): Promise<Customer> {
    await this.ensureStorageReady();
    const customers: Customer[] = await this.storage.get(this.CACHE_KEY) || [];
    const customer = customers.find(c => c.id === id || c._localId === id);

    if (!customer) {
      throw new Error('Cliente no encontrado en caché');
    }

    return customer;
  }

  private async addCustomerToCache(customer: Customer): Promise<void> {
    await this.ensureStorageReady();
    const customers: Customer[] = await this.storage.get(this.CACHE_KEY) || [];
    customers.push({ ...customer, _synced: true });
    await this.storage.set(this.CACHE_KEY, customers);

    // Update signal
    this.customers.set(customers);
  }

  private async updateCustomerInCache(customer: Customer): Promise<void> {
    await this.ensureStorageReady();
    const customers: Customer[] = await this.storage.get(this.CACHE_KEY) || [];
    const index = customers.findIndex(c => c.id === customer.id || c._localId === customer.id);

    if (index >= 0) {
      customers[index] = { ...customer, _synced: true };
    } else {
      customers.push({ ...customer, _synced: true });
    }

    await this.storage.set(this.CACHE_KEY, customers);

    // Update signal
    this.customers.set(customers);
  }

  private async removeCustomerFromCache(id: string): Promise<void> {
    await this.ensureStorageReady();
    const customers: Customer[] = await this.storage.get(this.CACHE_KEY) || [];
    const filteredCustomers = customers.filter(c => c.id !== id && c._localId !== id);
    await this.storage.set(this.CACHE_KEY, filteredCustomers);

    // Update signal
    this.customers.set(filteredCustomers);
  }

  private async searchCustomersInCache(query: string): Promise<Customer[]> {
    await this.ensureStorageReady();
    const customers: Customer[] = await this.storage.get(this.CACHE_KEY) || [];

    return customers.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.documentId.toLowerCase().includes(query) ||
      (c.taxId && c.taxId.toLowerCase().includes(query)) ||
      (c.email && c.email.toLowerCase().includes(query))
    );
  }

  private async createCustomerOffline(dto: CreateCustomerDto): Promise<Customer> {
    await this.ensureStorageReady();

    // Create temporary customer with local ID
    const localId = `local_${Date.now()}`;
    const customer: Customer = {
      id: '',
      _localId: localId,
      ...dto,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _synced: false,
      _action: 'create'
    };

    // Add to cache
    await this.addCustomerToCache(customer);

    // Add to sync queue
    await this.addToSyncQueue({
      id: localId,
      action: 'create',
      data: dto,
      timestamp: Date.now()
    });

    this.syncPending.set(true);
    this.loading.set(false);

    return customer;
  }

  private async updateCustomerOffline(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    await this.ensureStorageReady();

    // Get current customer from cache
    const customer = await this.getCustomerFromCache(id);

    // Update customer
    const updatedCustomer: Customer = {
      ...customer,
      ...dto,
      updatedAt: new Date().toISOString(),
      _synced: false,
      _action: 'update'
    };

    // Update in cache
    await this.updateCustomerInCache(updatedCustomer);

    // Add to sync queue
    await this.addToSyncQueue({
      id: customer.id || customer._localId!,
      action: 'update',
      data: dto,
      timestamp: Date.now()
    });

    this.syncPending.set(true);
    this.loading.set(false);

    return updatedCustomer;
  }

  private async deleteCustomerOffline(id: string): Promise<void> {
    await this.ensureStorageReady();

    // Remove from cache
    await this.removeCustomerFromCache(id);

    // Add to sync queue
    await this.addToSyncQueue({
      id,
      action: 'delete',
      data: null,
      timestamp: Date.now()
    });

    this.syncPending.set(true);
    this.loading.set(false);
  }

  private async addToSyncQueue(operation: any): Promise<void> {
    await this.ensureStorageReady();
    const queue = await this.storage.get(this.SYNC_QUEUE_KEY) || [];
    queue.push(operation);
    await this.storage.set(this.SYNC_QUEUE_KEY, queue);
  }

  private async processSyncOperation(operation: any): Promise<void> {
    switch (operation.action) {
      case 'create':
        await this.http.post<Customer>(this.API_URL, operation.data).toPromise();
        break;
      case 'update':
        await this.http.patch<Customer>(`${this.API_URL}/${operation.id}`, operation.data).toPromise();
        break;
      case 'delete':
        await this.http.delete<void>(`${this.API_URL}/${operation.id}`).toPromise();
        break;
    }
  }

  private async checkSyncQueue(): Promise<void> {
    await this.ensureStorageReady();
    const queue = await this.storage.get(this.SYNC_QUEUE_KEY) || [];
    this.syncPending.set(queue.length > 0);
  }
}
