# Funcionalidades - PagoPy Mobile

Documentación completa de todas las funcionalidades implementadas en la aplicación móvil PagoPy.

## Tabla de Contenidos

- [Modo Offline y Sincronización](#modo-offline-y-sincronización)
- [Autenticación y Seguridad](#autenticación-y-seguridad)
- [Gestión de Clientes](#gestión-de-clientes)
- [Gestión de Productos](#gestión-de-productos)
- [Gestión de Ventas](#gestión-de-ventas)
- [Facturación Electrónica](#facturación-electrónica)
- [Impresión Térmica](#impresión-térmica)
- [Cámara y Escaneo](#cámara-y-escaneo)
- [Notificaciones](#notificaciones)
- [Monitoreo de Red](#monitoreo-de-red)

---

## Modo Offline y Sincronización

### Arquitectura Offline-First

PagoPy implementa una estrategia **offline-first** que garantiza funcionalidad completa sin conexión a Internet.

**Principios**:
1. **Local First**: Todas las operaciones se guardan primero localmente
2. **Sync Later**: Sincronización automática cuando hay conexión
3. **Conflict Resolution**: Resolución inteligente de conflictos
4. **Progress Tracking**: Usuario siempre informado del estado

### Almacenamiento Local

**Tecnologías**:
- **SQLite**: Base de datos local en Android/iOS
- **Ionic Storage**: Abstracción multiplataforma
- **IndexedDB**: Fallback para web

**Esquema de Base de Datos**:

```sql
-- Ventas locales
CREATE TABLE sales (
  id TEXT PRIMARY KEY,
  localId TEXT UNIQUE NOT NULL,
  serverId TEXT,
  customerName TEXT NOT NULL,
  customerDocumentId TEXT,
  items TEXT NOT NULL,  -- JSON
  subtotal REAL NOT NULL,
  tax REAL NOT NULL,
  discount REAL DEFAULT 0,
  total REAL NOT NULL,
  paymentMethod TEXT NOT NULL,
  syncStatus TEXT DEFAULT 'pending',
  syncAttempts INTEGER DEFAULT 0,
  lastSyncAttempt TEXT,
  errorMessage TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Productos cacheados
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  cost REAL,
  stock INTEGER DEFAULT 0,
  category TEXT,
  imageUrl TEXT,
  taxRate REAL DEFAULT 0.10,
  isActive INTEGER DEFAULT 1,
  syncedAt TEXT,
  updatedAt TEXT
);

-- Clientes cacheados
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  customerType TEXT NOT NULL,
  documentType TEXT NOT NULL,
  documentId TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  taxId TEXT,
  isActive INTEGER DEFAULT 1,
  syncedAt TEXT,
  updatedAt TEXT
);

-- Logs de sincronización
CREATE TABLE sync_logs (
  id TEXT PRIMARY KEY,
  operation TEXT NOT NULL,
  entityType TEXT NOT NULL,
  entityId TEXT,
  status TEXT NOT NULL,
  details TEXT,
  timestamp TEXT NOT NULL
);

-- Índices para performance
CREATE INDEX idx_sales_sync_status ON sales(syncStatus);
CREATE INDEX idx_sales_created ON sales(createdAt DESC);
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_active ON products(isActive);
CREATE INDEX idx_customers_documentid ON customers(documentId);
CREATE INDEX idx_sync_logs_timestamp ON sync_logs(timestamp DESC);
```

### DatabaseService

**Ubicación**: `core/services/database.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

export interface LocalSale {
  id: string;
  localId: string;
  serverId?: string;
  customerName: string;
  customerDocumentId?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  syncAttempts: number;
  lastSyncAttempt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private db: SQLiteDBConnection | null = null;
  private sqlite: SQLiteConnection;

  constructor(private storage: Storage) {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  /**
   * Inicializar base de datos SQLite
   */
  async initialize(): Promise<void> {
    await this.storage.create();

    // Crear o abrir base de datos
    this.db = await this.sqlite.createConnection(
      'pagopy.db',
      false,
      'no-encryption',
      1,
      false
    );

    await this.db.open();
    await this.createTables();
  }

  /**
   * Crear tablas e índices
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const queries = [
      // Tabla de ventas (schema completo arriba)
      `CREATE TABLE IF NOT EXISTS sales (...)`,

      // Tabla de productos
      `CREATE TABLE IF NOT EXISTS products (...)`,

      // Tabla de clientes
      `CREATE TABLE IF NOT EXISTS customers (...)`,

      // Tabla de logs
      `CREATE TABLE IF NOT EXISTS sync_logs (...)`,

      // Índices
      `CREATE INDEX IF NOT EXISTS idx_sales_sync_status ON sales(syncStatus)`,
      `CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(createdAt DESC)`,
      // ... más índices
    ];

    for (const query of queries) {
      await this.db.execute(query);
    }
  }

  /**
   * Guardar venta localmente
   */
  async saveSale(sale: LocalSale): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT OR REPLACE INTO sales
      (id, localId, serverId, customerName, items, subtotal, tax, discount, total,
       paymentMethod, syncStatus, syncAttempts, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(query, [
      sale.id,
      sale.localId,
      sale.serverId || null,
      sale.customerName,
      JSON.stringify(sale.items),
      sale.subtotal,
      sale.tax,
      sale.discount,
      sale.total,
      sale.paymentMethod,
      sale.syncStatus,
      sale.syncAttempts,
      sale.createdAt,
      sale.updatedAt
    ]);
  }

  /**
   * Obtener ventas pendientes de sincronización
   */
  async getPendingSales(): Promise<LocalSale[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query(
      `SELECT * FROM sales WHERE syncStatus = 'pending' ORDER BY createdAt ASC`
    );

    return result.values?.map(this.mapSaleFromDb) || [];
  }

  /**
   * Actualizar estado de sincronización
   */
  async updateSaleSyncStatus(
    localId: string,
    status: LocalSale['syncStatus'],
    serverId?: string,
    errorMessage?: string
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      UPDATE sales
      SET syncStatus = ?,
          serverId = ?,
          errorMessage = ?,
          lastSyncAttempt = datetime('now'),
          syncAttempts = syncAttempts + 1,
          updatedAt = datetime('now')
      WHERE localId = ?
    `;

    await this.db.run(query, [status, serverId, errorMessage, localId]);
  }

  /**
   * Guardar productos (caché)
   */
  async saveProducts(products: Product[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const product of products) {
      const query = `
        INSERT OR REPLACE INTO products
        (id, code, name, description, price, cost, stock, category,
         imageUrl, taxRate, isActive, syncedAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
      `;

      await this.db.run(query, [
        product.id,
        product.code,
        product.name,
        product.description,
        product.price,
        product.cost,
        product.stock,
        product.category,
        product.imageUrl,
        product.taxRate,
        product.isActive ? 1 : 0,
        product.updatedAt
      ]);
    }
  }

  /**
   * Obtener productos cacheados
   */
  async getProducts(): Promise<Product[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query(
      `SELECT * FROM products WHERE isActive = 1 ORDER BY name ASC`
    );

    return result.values?.map(this.mapProductFromDb) || [];
  }

  // Métodos auxiliares de mapeo
  private mapSaleFromDb(row: any): LocalSale {
    return {
      id: row.id,
      localId: row.localId,
      serverId: row.serverId,
      customerName: row.customerName,
      customerDocumentId: row.customerDocumentId,
      items: JSON.parse(row.items),
      subtotal: row.subtotal,
      tax: row.tax,
      discount: row.discount,
      total: row.total,
      paymentMethod: row.paymentMethod,
      syncStatus: row.syncStatus,
      syncAttempts: row.syncAttempts,
      lastSyncAttempt: row.lastSyncAttempt,
      errorMessage: row.errorMessage,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
}
```

### SyncService

**Ubicación**: `services/sync.service.enhanced.ts`

```typescript
import { Injectable, signal } from '@angular/core';
import { DatabaseService } from '../core/services/database.service';
import { ApiService } from './api.service';
import { NetworkService } from './network.service';

export interface SyncStatus {
  isRunning: boolean;
  lastSync: Date | null;
  pendingCount: number;
  errorCount: number;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

@Injectable({ providedIn: 'root' })
export class SyncServiceEnhanced {
  // Estado reactivo
  syncStatus = signal<SyncStatus>({
    isRunning: false,
    lastSync: null,
    pendingCount: 0,
    errorCount: 0
  });

  constructor(
    private database: DatabaseService,
    private api: ApiService,
    private network: NetworkService
  ) {
    this.initializeAutoSync();
  }

  /**
   * Sincronización manual iniciada por usuario
   */
  async manualSync(): Promise<SyncResult> {
    console.log('[SyncService] Manual sync started');

    // Verificar conexión
    if (!this.network.isBackendReachable()) {
      throw new Error('No hay conexión con el servidor');
    }

    return this.performSync();
  }

  /**
   * Sincronización completa (upload + download)
   */
  async syncAll(): Promise<SyncResult> {
    console.log('[SyncService] Full sync started');

    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: []
    };

    // 1. Upload ventas pendientes
    const uploadResult = await this.uploadPendingSales();
    result.synced += uploadResult.synced;
    result.failed += uploadResult.failed;
    result.errors.push(...uploadResult.errors);

    // 2. Download datos del servidor
    const downloadResult = await this.downloadServerData();

    // 3. Actualizar estado
    this.syncStatus.update(status => ({
      ...status,
      lastSync: new Date(),
      pendingCount: result.failed,
      errorCount: result.failed
    }));

    result.success = result.failed === 0;
    return result;
  }

  /**
   * Subir ventas pendientes al servidor
   */
  private async uploadPendingSales(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: []
    };

    // Obtener ventas pendientes
    const pendingSales = await this.database.getPendingSales();

    console.log(`[SyncService] Found ${pendingSales.length} pending sales`);

    // Procesar en lotes
    const batchSize = 10;
    for (let i = 0; i < pendingSales.length; i += batchSize) {
      const batch = pendingSales.slice(i, i + batchSize);

      for (const sale of batch) {
        try {
          // Marcar como sincronizando
          await this.database.updateSaleSyncStatus(sale.localId, 'syncing');

          // Enviar al servidor
          const response = await this.api.post<{ id: string }>('/sales', {
            customerName: sale.customerName,
            customerDocumentId: sale.customerDocumentId,
            items: sale.items,
            subtotal: sale.subtotal,
            tax: sale.tax,
            discount: sale.discount,
            total: sale.total,
            paymentMethod: sale.paymentMethod,
            createdAt: sale.createdAt
          }).toPromise();

          // Actualizar con serverId
          await this.database.updateSaleSyncStatus(
            sale.localId,
            'synced',
            response.id
          );

          result.synced++;
          console.log(`[SyncService] Synced sale ${sale.localId} → ${response.id}`);

        } catch (error: any) {
          // Marcar como error
          await this.database.updateSaleSyncStatus(
            sale.localId,
            'error',
            undefined,
            error.message
          );

          result.failed++;
          result.errors.push(`Venta ${sale.localId}: ${error.message}`);
          console.error(`[SyncService] Failed to sync sale ${sale.localId}:`, error);
        }
      }

      // Pausa entre lotes para no saturar servidor
      if (i + batchSize < pendingSales.length) {
        await this.delay(500);
      }
    }

    return result;
  }

  /**
   * Descargar datos del servidor (productos, clientes)
   */
  private async downloadServerData(): Promise<void> {
    try {
      // Descargar productos
      const products = await this.api.get<Product[]>('/products').toPromise();
      await this.database.saveProducts(products);
      console.log(`[SyncService] Downloaded ${products.length} products`);

      // Descargar clientes
      const customers = await this.api.get<Customer[]>('/customers').toPromise();
      await this.database.saveCustomers(customers);
      console.log(`[SyncService] Downloaded ${customers.length} customers`);

    } catch (error) {
      console.error('[SyncService] Failed to download server data:', error);
      throw error;
    }
  }

  /**
   * Inicializar sincronización automática
   */
  private initializeAutoSync(): void {
    // Sync cada 5 minutos si hay conexión
    setInterval(() => {
      if (this.network.isBackendReachable() && !this.syncStatus().isRunning) {
        this.performSync();
      }
    }, 5 * 60 * 1000);

    // Sync cuando se recupera conexión
    this.network.isOnline.subscribe(online => {
      if (online && this.network.isBackendReachable()) {
        setTimeout(() => this.performSync(), 2000);
      }
    });
  }

  /**
   * Ejecutar sincronización
   */
  private async performSync(): Promise<SyncResult> {
    // Evitar sync concurrentes
    if (this.syncStatus().isRunning) {
      console.log('[SyncService] Sync already running, skipping');
      return { success: false, synced: 0, failed: 0, errors: ['Sync already running'] };
    }

    this.syncStatus.update(s => ({ ...s, isRunning: true }));

    try {
      const result = await this.syncAll();
      return result;
    } finally {
      this.syncStatus.update(s => ({ ...s, isRunning: false }));
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Flujo de Venta Offline

```typescript
// En SalesService
async createSale(saleData: CreateSaleDto): Promise<Sale> {
  // 1. Generar ID local único
  const localId = `offline_${Date.now()}_${this.generateRandomId()}`;

  const localSale: LocalSale = {
    id: localId,
    localId,
    ...saleData,
    syncStatus: 'pending',
    syncAttempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 2. Guardar localmente PRIMERO
  await this.database.saveSale(localSale);

  // 3. Notificar al usuario
  this.notifications.showSuccess(
    'Venta guardada',
    'La venta se sincronizará automáticamente'
  );

  // 4. Intentar sync inmediato si hay conexión
  if (this.network.isBackendReachable()) {
    this.sync.manualSync().catch(err => {
      console.error('Failed to sync immediately:', err);
      // No throw - ya está guardado localmente
    });
  }

  return localSale as Sale;
}
```

---

## Autenticación y Seguridad

### JWT Authentication

**Tokens**:
- **Access Token**: Corta duración (1 hora), para requests HTTP
- **Refresh Token**: Larga duración (30 días), para renovar access token

### AuthService

**Ubicación**: `core/services/auth.service.ts`

```typescript
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Signals reactivos
  isAuthenticated = signal(false);
  currentUser = signal<User | null>(null);
  isLoading = signal(false);

  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  /**
   * Login con credenciales
   */
  login(email: string, password: string): Observable<AuthResponse> {
    this.isLoading.set(true);

    return this.http.post<AuthResponse>('/auth/login', { email, password })
      .pipe(
        tap(async (response) => {
          await this.storeAuthData(response);
          this.isAuthenticated.set(true);
          this.currentUser.set(response.user);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Registro de nuevo usuario
   */
  register(data: RegisterDto): Observable<AuthResponse> {
    this.isLoading.set(true);

    return this.http.post<AuthResponse>('/auth/register', data)
      .pipe(
        tap(async (response) => {
          await this.storeAuthData(response);
          this.isAuthenticated.set(true);
          this.currentUser.set(response.user);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    // Limpiar tokens
    await Preferences.remove({ key: this.ACCESS_TOKEN_KEY });
    await Preferences.remove({ key: this.REFRESH_TOKEN_KEY });
    await Preferences.remove({ key: this.USER_KEY });

    // Actualizar estado
    this.isAuthenticated.set(false);
    this.currentUser.set(null);

    // Navegar a login
    this.router.navigate(['/auth/login']);
  }

  /**
   * Obtener access token actual
   */
  async getAccessToken(): Promise<string | null> {
    const result = await Preferences.get({ key: this.ACCESS_TOKEN_KEY });
    return result.value;
  }

  /**
   * Renovar access token usando refresh token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) return false;

      const response = await this.http.post<AuthResponse>('/auth/refresh', {
        refreshToken
      }).toPromise();

      if (response) {
        await this.storeAuthData(response);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await this.logout();
      return false;
    }
  }

  /**
   * Verificar estado de autenticación
   */
  async checkAuthStatus(): Promise<boolean> {
    const token = await this.getAccessToken();
    const userJson = await Preferences.get({ key: this.USER_KEY });

    if (token && userJson.value) {
      this.isAuthenticated.set(true);
      this.currentUser.set(JSON.parse(userJson.value));
      return true;
    }

    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    return false;
  }

  /**
   * Almacenar datos de autenticación
   */
  private async storeAuthData(response: AuthResponse): Promise<void> {
    await Preferences.set({
      key: this.ACCESS_TOKEN_KEY,
      value: response.accessToken
    });

    await Preferences.set({
      key: this.REFRESH_TOKEN_KEY,
      value: response.refreshToken
    });

    await Preferences.set({
      key: this.USER_KEY,
      value: JSON.stringify(response.user)
    });
  }

  private async getRefreshToken(): Promise<string | null> {
    const result = await Preferences.get({ key: this.REFRESH_TOKEN_KEY });
    return result.value;
  }
}
```

### HTTP Interceptor

```typescript
// core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Excluir endpoints de autenticación
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // Agregar token
  return from(authService.getAccessToken()).pipe(
    switchMap(token => {
      if (token) {
        req = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
      }

      return next(req).pipe(
        catchError(error => {
          // Si es 401, intentar refresh
          if (error.status === 401) {
            return from(authService.refreshToken()).pipe(
              switchMap(success => {
                if (success) {
                  // Reintentar request con nuevo token
                  return from(authService.getAccessToken()).pipe(
                    switchMap(newToken => {
                      req = req.clone({
                        setHeaders: { Authorization: `Bearer ${newToken}` }
                      });
                      return next(req);
                    })
                  );
                } else {
                  return throwError(() => error);
                }
              })
            );
          }

          return throwError(() => error);
        })
      );
    })
  );
};
```

### Auth Guard

```typescript
// core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = await authService.checkAuthStatus();

  if (!isAuth) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  return true;
};
```

### Autenticación Biométrica (Opcional)

```typescript
import { NativeBiometric } from 'capacitor-native-biometric';

async enableBiometric(): Promise<void> {
  // Verificar disponibilidad
  const available = await NativeBiometric.isAvailable();

  if (!available.isAvailable) {
    throw new Error('Biometric authentication not available');
  }

  // Guardar credenciales
  await NativeBiometric.setCredentials({
    username: this.currentUser()!.email,
    password: 'encrypted_token',  // Guardar token encrypted
    server: 'pagopy.app'
  });
}

async loginWithBiometric(): Promise<void> {
  // Verificar biometría
  const verified = await NativeBiometric.verifyIdentity({
    reason: 'Autenticarse en PagoPy',
    title: 'Autenticación Biométrica',
    subtitle: 'Usa tu huella o Face ID',
    description: 'Verifica tu identidad para acceder'
  });

  if (verified) {
    // Obtener credenciales guardadas
    const credentials = await NativeBiometric.getCredentials({
      server: 'pagopy.app'
    });

    // Auto-login con token guardado
    // ...
  }
}
```

---

## Gestión de Clientes

### CustomersService

**Ubicación**: `core/services/customers.service.ts`

**Funcionalidades**:
- CRUD de clientes
- Validación de RUC paraguayo
- Formateo de documentos
- Caché offline
- Escaneo de documentos (OCR)

```typescript
@Injectable({ providedIn: 'root' })
export class CustomersService {
  customers = signal<Customer[]>([]);
  loading = signal(false);

  /**
   * Validar RUC paraguayo con dígito verificador
   */
  validateRUC(ruc: string): boolean {
    // Formato: 12345678-9 (8 dígitos + dígito verificador)
    const cleanRuc = ruc.replace(/[^0-9]/g, '');

    if (cleanRuc.length !== 9) return false;

    const base = cleanRuc.substring(0, 8);
    const checkDigit = parseInt(cleanRuc.charAt(8));

    // Algoritmo Módulo 11
    let sum = 0;
    const factors = [2, 3, 4, 5, 6, 7, 2, 3];

    for (let i = 0; i < 8; i++) {
      sum += parseInt(base.charAt(7 - i)) * factors[i];
    }

    const remainder = sum % 11;
    const calculated = remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder;

    return calculated === checkDigit;
  }

  /**
   * Formatear RUC con guión
   */
  formatRUC(ruc: string): string {
    const clean = ruc.replace(/[^0-9]/g, '');
    if (clean.length === 9) {
      return `${clean.substring(0, 8)}-${clean.charAt(8)}`;
    }
    return clean;
  }

  /**
   * Crear cliente
   */
  async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    this.loading.set(true);

    try {
      if (this.network.isBackendReachable()) {
        // Online: crear en servidor
        const customer = await this.api.post<Customer>('/customers', data).toPromise();

        // Cachear localmente
        await this.database.saveCustomer(customer);

        // Actualizar lista
        this.customers.update(list => [customer, ...list]);

        return customer;
      } else {
        // Offline: guardar localmente
        const localCustomer: Customer = {
          id: `local_${Date.now()}`,
          ...data,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await this.database.saveCustomer(localCustomer);
        this.customers.update(list => [localCustomer, ...list]);

        return localCustomer;
      }
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Buscar clientes por documento
   */
  async searchByDocument(documentId: string): Promise<Customer[]> {
    const allCustomers = this.customers();
    return allCustomers.filter(c =>
      c.documentId.includes(documentId)
    );
  }
}
```

### Formulario de Cliente

Ver `shared/components/customer-form/` para implementación completa con:
- Validación de formularios reactivos
- Validación de RUC
- Escaneo de documentos con OCR
- Manejo de errores

---

## Gestión de Productos

### ProductsService

**Funcionalidades**:
- CRUD de productos
- Búsqueda por código de barras
- Caché de imágenes
- Stock tracking

```typescript
@Injectable({ providedIn: 'root' })
export class ProductsService {
  products = signal<Product[]>([]);
  loading = signal(false);

  /**
   * Buscar producto por código de barras
   */
  async findByBarcode(barcode: string): Promise<Product | null> {
    const products = this.products();
    return products.find(p => p.code === barcode) || null;
  }

  /**
   * Tomar foto de producto
   */
  async captureProductPhoto(): Promise<string> {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      width: 800,
      height: 800
    });

    return `data:image/jpeg;base64,${image.base64String}`;
  }
}
```

---

## Gestión de Ventas

### SalesService

**Funcionalidades**:
- Crear ventas (online/offline)
- Carrito de compras
- Cálculo de impuestos (IVA 10%)
- Múltiples métodos de pago
- Historial de ventas

```typescript
@Injectable({ providedIn: 'root' })
export class SalesService {
  /**
   * Calcular totales de venta
   */
  calculateTotals(items: SaleItem[]): {
    subtotal: number;
    tax: number;
    total: number;
  } {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);

    const tax = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price;
      return sum + (itemTotal * item.taxRate);
    }, 0);

    const total = subtotal + tax;

    return {
      subtotal: this.roundToTwo(subtotal),
      tax: this.roundToTwo(tax),
      total: this.roundToTwo(total)
    };
  }

  private roundToTwo(num: number): number {
    return Math.round(num * 100) / 100;
  }
}
```

---

## Facturación Electrónica

### InvoiceService

**Integración con SET (e-Kuatia)**:
- Generación de XML para SET
- Firma digital de facturas
- Obtención de CDC (Código de Control)
- Generación de KUDE y QR
- PDF de factura

```typescript
@Injectable({ providedIn: 'root' })
export class InvoiceService {
  /**
   * Generar factura electrónica para venta
   */
  async generateInvoice(saleId: string): Promise<Invoice> {
    const response = await this.api.post<Invoice>(`/invoices/generate`, {
      saleId
    }).toPromise();

    return response;
  }

  /**
   * Descargar PDF de factura
   */
  async downloadInvoicePDF(invoiceId: string): Promise<string> {
    const response = await this.api.get<{ pdfUrl: string }>(
      `/invoices/${invoiceId}/pdf`
    ).toPromise();

    return response.pdfUrl;
  }
}
```

---

## Impresión Térmica

### PrinterService

**Bluetooth ESC/POS**:
- Descubrimiento de impresoras
- Conexión Bluetooth LE
- Formato ESC/POS
- Impresión de tickets

```typescript
import { BleClient, BleDevice } from '@capacitor-community/bluetooth-le';

@Injectable({ providedIn: 'root' })
export class PrinterService {
  private connectedDevice: BleDevice | null = null;
  private readonly SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb';
  private readonly CHAR_UUID = '00002af1-0000-1000-8000-00805f9b34fb';

  /**
   * Escanear impresoras Bluetooth
   */
  async scanPrinters(): Promise<BleDevice[]> {
    await BleClient.initialize();

    const devices: BleDevice[] = [];

    await BleClient.requestLEScan(
      { services: [this.SERVICE_UUID] },
      (result) => {
        devices.push(result.device);
      }
    );

    // Escanear por 5 segundos
    await this.delay(5000);
    await BleClient.stopLEScan();

    return devices;
  }

  /**
   * Conectar a impresora
   */
  async connect(device: BleDevice): Promise<void> {
    await BleClient.connect(device.deviceId);
    this.connectedDevice = device;
  }

  /**
   * Imprimir ticket de venta
   */
  async printSaleTicket(sale: Sale): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No printer connected');
    }

    const commands = this.buildTicketCommands(sale);
    const data = new Uint8Array(commands);

    await BleClient.write(
      this.connectedDevice.deviceId,
      this.SERVICE_UUID,
      this.CHAR_UUID,
      data.buffer
    );
  }

  /**
   * Construir comandos ESC/POS
   */
  private buildTicketCommands(sale: Sale): number[] {
    const ESC = 0x1B;
    const GS = 0x1D;

    const commands: number[] = [];

    // Inicializar
    commands.push(ESC, 0x40);

    // Alinear centro
    commands.push(ESC, 0x61, 0x01);

    // Texto grande
    commands.push(ESC, 0x21, 0x30);
    this.addText(commands, 'PAGOPY\n');

    // Texto normal
    commands.push(ESC, 0x21, 0x00);
    this.addText(commands, 'Sistema de Facturación\n');
    this.addText(commands, '----------------------------\n');

    // Alinear izquierda
    commands.push(ESC, 0x61, 0x00);

    // Datos de venta
    this.addText(commands, `Cliente: ${sale.customerName}\n`);
    this.addText(commands, `Fecha: ${new Date(sale.createdAt).toLocaleString()}\n`);
    this.addText(commands, '----------------------------\n');

    // Items
    for (const item of sale.items) {
      this.addText(commands, `${item.productName}\n`);
      this.addText(commands, `  ${item.quantity} x Gs ${item.price.toLocaleString()}\n`);
      this.addText(commands, `  Gs ${(item.quantity * item.price).toLocaleString()}\n`);
    }

    this.addText(commands, '----------------------------\n');
    this.addText(commands, `Subtotal: Gs ${sale.subtotal.toLocaleString()}\n`);
    this.addText(commands, `IVA 10%:  Gs ${sale.tax.toLocaleString()}\n`);

    // Total en negrita
    commands.push(ESC, 0x45, 0x01);
    this.addText(commands, `TOTAL:    Gs ${sale.total.toLocaleString()}\n`);
    commands.push(ESC, 0x45, 0x00);

    // Líneas en blanco y cortar
    this.addText(commands, '\n\n\n');
    commands.push(GS, 0x56, 0x00);

    return commands;
  }

  private addText(commands: number[], text: string): void {
    for (let i = 0; i < text.length; i++) {
      commands.push(text.charCodeAt(i));
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## Cámara y Escaneo

### Escaneo de Códigos QR y Barras

```typescript
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

async scanBarcode(): Promise<string> {
  // Pedir permisos
  const permission = await BarcodeScanner.checkPermission({ force: true });

  if (!permission.granted) {
    throw new Error('Camera permission denied');
  }

  // Preparar scanner (ocultar fondo web)
  await BarcodeScanner.hideBackground();
  document.body.classList.add('scanner-active');

  // Escanear
  const result = await BarcodeScanner.startScan();

  // Limpiar
  document.body.classList.remove('scanner-active');
  await BarcodeScanner.showBackground();

  if (result.hasContent) {
    return result.content;
  }

  throw new Error('No barcode found');
}
```

### Captura de Fotos

```typescript
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

async takePicture(): Promise<string> {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Base64,
    source: CameraSource.Camera,
    width: 1024,
    height: 1024
  });

  return `data:image/jpeg;base64,${image.base64String}`;
}
```

---

## Notificaciones

### LocalNotifications

```typescript
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  async requestPermissions(): Promise<void> {
    await LocalNotifications.requestPermissions();
  }

  async notifyOfflineSale(saleId: string, total: number): Promise<void> {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Venta guardada offline',
          body: `Total: Gs ${total.toLocaleString()}. Se sincronizará automáticamente.`,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'beep.wav',
          attachments: undefined,
          actionTypeId: '',
          extra: { saleId }
        }
      ]
    });
  }

  async notifySyncComplete(synced: number, failed: number): Promise<void> {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Sincronización completa',
          body: `${synced} ventas sincronizadas, ${failed} fallidas`,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'beep.wav'
        }
      ]
    });
  }
}
```

---

## Monitoreo de Red

### NetworkService

```typescript
import { Injectable, signal } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({ providedIn: 'root' })
export class NetworkService {
  isOnline = signal(true);
  backendReachable = signal(false);
  connectionQuality = signal<'excellent' | 'good' | 'poor'>('excellent');

  constructor() {
    this.initNetworkMonitoring();
  }

  private async initNetworkMonitoring(): void {
    // Estado inicial
    const status = await Network.getStatus();
    this.isOnline.set(status.connected);

    // Escuchar cambios
    Network.addListener('networkStatusChange', (status) => {
      this.isOnline.set(status.connected);

      if (status.connected) {
        this.checkBackendConnectivity();
      } else {
        this.backendReachable.set(false);
      }
    });

    // Health check periódico
    setInterval(() => {
      if (this.isOnline()) {
        this.checkBackendConnectivity();
      }
    }, 30000);
  }

  async checkBackendConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(`${environment.apiUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const reachable = response.ok;
      this.backendReachable.set(reachable);
      return reachable;
    } catch {
      this.backendReachable.set(false);
      return false;
    }
  }
}
```

---

**Versión**: 1.0.0
**Última actualización**: 2025-10-12
**Autor**: Equipo PagoPy
