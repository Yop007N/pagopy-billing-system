# Guía de Desarrollo - PagoPy Mobile

Documentación técnica completa para desarrolladores.

## Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Servicios Core](#servicios-core)
- [Modo Offline](#modo-offline)
- [Autenticación](#autenticación)
- [Sincronización](#sincronización)
- [Patrones](#patrones)

---

## Arquitectura

### Estructura de Capas

```
┌─────────────────────────────────┐
│   UI Layer (Components)         │
│   Angular Signals               │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│   Service Layer (Facade)        │
│   Business Logic                │
└────────┬──────────┬─────────────┘
         │          │
┌────────▼──────┐ ┌▼────────────┐
│ NetworkService│ │ SyncService │
└────────┬──────┘ └┬────────────┘
         │          │
┌────────▼──────────▼─────────────┐
│   Data Layer                    │
│   Storage + Database            │
└─────────────────────────────────┘
```

### Estructura del Proyecto

```
apps/mobile/src/app/
├── core/
│   ├── services/           # Servicios singleton
│   │   ├── auth.service.ts
│   │   ├── customers.service.ts
│   │   ├── database.service.ts
│   │   ├── camera.service.ts
│   │   ├── printer.service.ts
│   │   └── notifications.service.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── interceptors/
│       └── auth.interceptor.ts
│
├── pages/                  # Páginas de la app
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── tabs/
│   │   ├── home/
│   │   ├── sales/
│   │   └── profile/
│   ├── sales/
│   │   ├── new-sale/
│   │   └── sale-detail/
│   ├── customers/
│   ├── products/
│   ├── invoices/
│   └── settings/
│
├── services/               # Servicios generales
│   ├── storage.service.ts
│   ├── network.service.ts
│   ├── sync.service.enhanced.ts
│   ├── sales.service.ts
│   └── api.service.ts
│
├── models/                 # Modelos TypeScript
│   ├── user.model.ts
│   ├── sale.model.ts
│   ├── product.model.ts
│   ├── customer.model.ts
│   └── database.model.ts
│
└── shared/                 # Componentes compartidos
    ├── components/
    │   ├── qr-scanner/
    │   └── customer-form/
    └── pipes/
```

---

## Servicios Core

### 1. AuthService

**Ubicación**: `core/services/auth.service.ts`

**Responsabilidades**:
- Autenticación JWT (access + refresh tokens)
- Gestión de sesión
- Estado de usuario con signals

**API Pública**:
```typescript
class AuthService {
  // Signals reactivos
  isAuthenticated = signal(false);
  currentUser = signal<User | null>(null);
  isLoading = signal(false);

  // Métodos
  login(credentials: LoginCredentials): Observable<AuthResponse>
  register(data: RegisterData): Observable<AuthResponse>
  logout(): Promise<void>
  refreshToken(): Promise<boolean>
  getAccessToken(): Promise<string | null>
  getCurrentUser(): Observable<User>
}
```

**Uso**:
```typescript
constructor(private authService = inject(AuthService)) {}

async login() {
  this.authService.login(this.form.value).subscribe({
    next: (response) => {
      console.log('Logged in:', response.user);
      this.router.navigate(['/tabs/home']);
    },
    error: (error) => {
      this.showError(error.message);
    }
  });
}

// Verificar estado
if (this.authService.isAuthenticated()) {
  // Usuario logueado
}
```

### 2. DatabaseService

**Ubicación**: `core/services/database.service.ts`

**Responsabilidades**:
- SQLite en plataformas nativas
- Schema con tablas y índices
- Operaciones CRUD
- Migraciones

**Schema**:
```sql
CREATE TABLE sales (
  id TEXT PRIMARY KEY,
  localId TEXT UNIQUE,
  customerName TEXT,
  total REAL,
  syncStatus TEXT,
  syncAttempts INTEGER DEFAULT 0,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE INDEX idx_sales_sync_status ON sales(syncStatus);
CREATE INDEX idx_sales_created ON sales(createdAt);
```

**API**:
```typescript
class DatabaseService {
  initialize(): Promise<void>
  
  // Ventas
  saveSale(sale: LocalSale): Promise<void>
  getSales(limit?: number): Promise<LocalSale[]>
  getSalesBySyncStatus(status: SyncStatus): Promise<LocalSale[]>
  updateSaleSyncStatus(id: string, status: SyncStatus): Promise<void>
  
  // Productos
  saveProduct(product: LocalProduct): Promise<void>
  getProducts(): Promise<LocalProduct[]>
  
  // Logs de sincronización
  addSyncLog(log: SyncLog): Promise<void>
  getSyncLogs(limit: number): Promise<SyncLog[]>
}
```

### 3. NetworkService

**Ubicación**: `services/network.service.ts`

**Responsabilidades**:
- Monitoreo de conectividad en tiempo real
- Verificación de alcanzabilidad del backend
- Calidad de conexión
- Health checks periódicos

**Signals**:
```typescript
class NetworkService {
  isOnline = signal(true);
  backendReachable = signal(false);
  connectionQuality = signal<ConnectionQuality>('excellent');
  lastCheck = signal<Date>(new Date());
}
```

**Uso**:
```typescript
// Reactividad automática
effect(() => {
  if (this.network.isOnline()) {
    console.log('Online - iniciar sync');
  } else {
    console.log('Offline - modo local');
  }
});

// Verificar antes de operación
if (await this.network.checkBackendConnectivity()) {
  // Enviar al servidor
} else {
  // Guardar localmente
}
```

### 4. SyncServiceEnhanced

**Ubicación**: `services/sync.service.enhanced.ts`

**Responsabilidades**:
- Sincronización bidireccional
- Gestión de cola de retry
- Resolución de conflictos
- Progress tracking

**Estrategias de Sincronización**:
```typescript
interface SyncStrategy {
  name: string;
  batchSize: number;        // Items por lote
  retryDelay: number;       // ms entre reintentos
  maxRetries: number;       // Intentos máximos
  conflictResolution: 'server' | 'local' | 'manual';
}
```

**Flujo de Sincronización**:
```
1. Pre-sync validation
2. Upload pending changes (local → server)
3. Download server updates (server → local)
4. Process retry queue
5. Resolve conflicts
6. Post-sync cleanup
```

**API**:
```typescript
class SyncServiceEnhanced {
  syncStatus = signal<SyncStatus>({...});
  syncProgress = signal<SyncProgress>({...});

  manualSync(): Promise<SyncResult>
  syncAll(): Promise<SyncResult>
  getSyncLogs(limit: number): Promise<SyncLog[]>
  resolveConflict(id: string, resolution: ConflictResolution): Promise<void>
}
```

---

## Modo Offline

### Arquitectura Offline-First

**Principios**:
1. **Local First**: Todas las operaciones se guardan primero localmente
2. **Sync Later**: Sincronización en segundo plano cuando hay conexión
3. **Conflict Resolution**: Estrategias para resolver conflictos
4. **Progress Tracking**: Usuario siempre sabe el estado de sync

### Flujo de Venta Offline

```typescript
async createSale(sale: CreateSaleDto) {
  // 1. Crear venta local con ID temporal
  const localSale: LocalSale = {
    id: generateId(),
    localId: `offline_${Date.now()}_${randomId()}`,
    ...sale,
    syncStatus: 'pending',
    syncAttempts: 0,
    createdAt: new Date().toISOString()
  };

  // 2. Guardar en base de datos local
  await this.database.saveSale(localSale);

  // 3. Notificar usuario
  this.notifications.notifyOfflineSale(localSale.id, localSale.total);

  // 4. Si hay conexión, intentar sync inmediato
  if (this.network.isBackendReachable()) {
    this.sync.manualSync();
  }

  return localSale;
}
```

### Sincronización Automática

```typescript
// En AppComponent
constructor() {
  // Monitorear cambios de red
  effect(() => {
    const online = this.network.isOnline();
    const backend = this.network.backendReachable();

    if (online && backend) {
      // Conexión restaurada - sincronizar
      this.sync.syncAll();
    }
  });

  // Sync periódico (cada 5 minutos)
  setInterval(() => {
    if (this.network.isBackendReachable()) {
      this.sync.syncAll();
    }
  }, 5 * 60 * 1000);
}
```

---

## Autenticación

### JWT Strategy

**Tokens**:
- **Access Token**: Short-lived (1 hora), en headers HTTP
- **Refresh Token**: Long-lived (30 días), en storage seguro

**Storage**:
```typescript
// Capacitor Preferences (seguro en nativo)
await storage.set('access_token', token);
await storage.set('refresh_token', refreshToken);
await storage.set('current_user', JSON.stringify(user));
```

### HTTP Interceptor

```typescript
// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Excluir endpoints de auth
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  // Agregar token
  const token = await authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Token expirado - refresh
        return authService.refreshToken().then(() => {
          // Reintentar request
          return next(req);
        });
      }
      return throwError(() => error);
    })
  );
};
```

### Guards

```typescript
// auth.guard.ts
export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = await authService.checkAuthStatus();

  if (!isAuth) {
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
};
```

---

## Sincronización

### Resolución de Conflictos

**Estrategia por Defecto: Server Wins**
```typescript
private async resolveConflictWithServer(conflict: SyncConflict) {
  // Usar datos del servidor
  const serverData = conflict.serverData;
  
  // Actualizar local
  await this.database.saveSale({
    ...serverData,
    syncStatus: 'synced',
    serverId: serverData.id
  });

  // Log
  await this.database.addSyncLog({
    operation: 'conflict_resolution',
    resolution: 'server',
    timestamp: new Date().toISOString()
  });
}
```

**Estrategia Alternativa: Local Wins**
```typescript
private async resolveConflictWithLocal(conflict: SyncConflict) {
  // Mantener datos locales
  await this.database.updateSaleSyncStatus(
    conflict.localData.id,
    'pending'
  );

  // Re-encolar para upload
  await this.addToSyncQueue({
    type: 'sale',
    operation: 'update',
    data: conflict.localData,
    priority: 10  // Alta prioridad
  });
}
```

### Retry Logic

**Exponential Backoff**:
```typescript
private calculateBackoffDelay(attempt: number): number {
  // 2^attempt * baseDelay
  const delay = Math.min(
    this.retryDelay * Math.pow(2, attempt),
    60000  // Max 60 segundos
  );
  
  // Jitter (0-1 segundo)
  return delay + Math.random() * 1000;
}
```

**Schedule**:
- Intento 1: 2 segundos
- Intento 2: 4 segundos
- Intento 3: 8 segundos
- Intento 4: 16 segundos
- Intento 5: 32 segundos
- Intento 6+: 60 segundos

---

## Patrones

### 1. Signal-Based State

```typescript
export class MyComponent {
  // Estado reactivo
  loading = signal(false);
  data = signal<Item[]>([]);
  error = signal<string | null>(null);

  // Computed
  isEmpty = computed(() => this.data().length === 0);

  // Effects
  constructor() {
    effect(() => {
      if (this.data().length > 0) {
        console.log('Data cargada');
      }
    });
  }
}
```

### 2. Service with Facade Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class CustomersService {
  private database = inject(DatabaseService);
  private network = inject(NetworkService);
  private api = inject(ApiService);

  customers = signal<Customer[]>([]);
  loading = signal(false);

  async getCustomers() {
    this.loading.set(true);

    try {
      if (this.network.isBackendReachable()) {
        // Online: fetch from API
        const customers = await this.api.get('/customers');
        this.customers.set(customers);
        
        // Cache locally
        await this.database.saveCustomers(customers);
      } else {
        // Offline: load from cache
        const cached = await this.database.getCustomers();
        this.customers.set(cached);
      }
    } finally {
      this.loading.set(false);
    }
  }
}
```

### 3. Form Validation

```typescript
export class CustomerFormComponent {
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.email]],
    documentType: ['CI', Validators.required],
    documentId: ['', Validators.required],
    ruc: ['', this.rucValidator()]
  });

  private rucValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) return null;

      const rucRegex = /^\d{6,8}-\d$/;
      return rucRegex.test(value) ? null : { invalidRuc: true };
    };
  }
}
```

---

## Best Practices

1. **Always use signals** para estado reactivo
2. **Inject dependencies** con `inject()` en lugar de constructor
3. **Standalone components** - no NgModules
4. **Check network** antes de operaciones online
5. **Save locally first** - sync después
6. **Handle errors** con try/catch y observables
7. **Provide feedback** - loading states y toasts
8. **Type everything** - TypeScript strict mode

---

**Versión**: 1.0.0
**Última actualización**: 2025-10-12
