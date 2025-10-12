# Ejemplos de Uso - Componentes Compartidos

## 1. EmptyStateComponent - Ejemplos

### Ejemplo Básico
```html
<app-empty-state
  title="Sin ventas"
  message="No has registrado ninguna venta hoy"
/>
```

### Con Icono y Color Personalizado
```html
<app-empty-state
  icon="cart-outline"
  iconColor="primary"
  title="Carrito vacío"
  message="Agrega productos para comenzar una venta"
/>
```

### Con Botón de Acción
```typescript
// En el componente
createSaleButton = {
  label: 'Nueva Venta',
  icon: 'add-circle-outline',
  color: 'primary',
  action: () => this.router.navigate(['/sales/new'])
};
```

```html
<app-empty-state
  icon="receipt-outline"
  title="Sin ventas registradas"
  message="Comienza a registrar tus ventas diarias"
  [actionButton]="createSaleButton"
/>
```

### Con Contenido Personalizado
```html
<app-empty-state
  icon="cube-outline"
  title="Sin productos"
  message="Necesitas agregar productos a tu inventario"
>
  <ion-button expand="block" (click)="navigateToAddProduct()">
    Agregar Producto
  </ion-button>
  <ion-button expand="block" fill="outline" (click)="importProducts()">
    Importar desde Excel
  </ion-button>
</app-empty-state>
```

---

## 2. LoadingComponent - Ejemplos

### Lista Simple
```html
<app-loading variant="list" [count]="5" />
```

### Tarjetas
```html
<app-loading variant="card" [count]="3" />
```

### Vista de Detalle
```html
<app-loading variant="detail" />
```

### Grid de Productos
```html
<app-loading variant="grid" [count]="8" />
```

### Sin Animación
```html
<app-loading variant="list" [animated]="false" />
```

### Uso con Signals
```typescript
@Component({
  template: `
    @if (loading()) {
      <app-loading variant="list" [count]="10" />
    } @else {
      <ion-list>
        @for (item of items(); track item.id) {
          <ion-item>{{ item.name }}</ion-item>
        }
      </ion-list>
    }
  `
})
export class MyComponent {
  loading = signal(true);
  items = signal<any[]>([]);

  async ngOnInit() {
    const data = await this.loadData();
    this.items.set(data);
    this.loading.set(false);
  }
}
```

---

## 3. ErrorComponent - Ejemplos

### Error Simple
```html
<app-error
  error="No se pudo cargar los datos"
  [retryCallback]="loadData.bind(this)"
/>
```

### Error desde Exception
```typescript
@Component({
  template: `
    @if (error()) {
      <app-error
        [error]="error()"
        [retryCallback]="retry.bind(this)"
      />
    }
  `
})
export class MyComponent {
  error = signal<Error | null>(null);

  async loadData() {
    try {
      const data = await this.api.fetchData();
    } catch (err) {
      this.error.set(err as Error);
    }
  }

  async retry() {
    this.error.set(null);
    await this.loadData();
  }
}
```

### Error Detallado
```typescript
const error: ErrorDetails = {
  title: 'Error de Sincronización',
  message: 'No se pudieron sincronizar las ventas con el servidor',
  code: 'SYNC_FAILED',
  statusCode: 503,
  timestamp: new Date()
};
```

```html
<app-error
  [error]="error"
  [retryCallback]="retrySync.bind(this)"
  retryButtonText="Reintentar Sincronización"
  errorIcon="cloud-offline-outline"
/>
```

### Con Acción Secundaria
```html
<app-error
  error="No se encontró el producto"
  [retryCallback]="searchAgain.bind(this)"
  [secondaryAction]="{
    label: 'Crear Producto',
    icon: 'add-outline',
    color: 'success',
    callback: createProduct.bind(this)
  }"
/>
```

### Error de Red Sin Retry
```html
<app-error
  error="Sin conexión a Internet"
  errorIcon="wifi-outline"
  iconColor="warning"
  [showRetry]="false"
  [secondaryAction]="{
    label: 'Ver Configuración',
    icon: 'settings-outline',
    callback: openSettings.bind(this)
  }"
/>
```

---

## 4. SearchBarComponent - Ejemplos

### Búsqueda Simple
```html
<app-search-bar
  placeholder="Buscar productos..."
  (search)="onSearch($event)"
/>
```

### Con Filtros
```typescript
filters: SearchFilter[] = [
  { key: 'all', label: 'Todos', icon: 'apps', active: true },
  { key: 'active', label: 'Activos', icon: 'checkmark-circle', active: false },
  { key: 'low-stock', label: 'Stock Bajo', icon: 'warning', active: false }
];
```

```html
<app-search-bar
  placeholder="Buscar productos..."
  [filters]="filters"
  (search)="onSearch($event)"
  (filterChange)="onFilterChange($event)"
/>
```

### Con Contador de Resultados
```typescript
searchResults = signal<Product[]>([]);

onSearch(term: string) {
  this.searchResults.set(
    this.products().filter(p =>
      p.name.toLowerCase().includes(term.toLowerCase())
    )
  );
}
```

```html
<app-search-bar
  [showResultsCount]="true"
  [resultsCount]="searchResults().length"
  (search)="onSearch($event)"
/>
```

### Búsqueda Completa con Todo
```typescript
@Component({
  selector: 'app-products',
  template: `
    <app-search-bar
      placeholder="Buscar productos por nombre o código..."
      [debounceTime]="500"
      [filters]="filters"
      [showResultsCount]="true"
      [resultsCount]="filteredProducts().length"
      (search)="handleSearch($event)"
      (filterChange)="handleFilterChange($event)"
      (clear)="handleClear()"
    />

    @if (loading()) {
      <app-loading variant="list" />
    } @else if (filteredProducts().length === 0) {
      <app-empty-state
        icon="search-outline"
        title="Sin resultados"
        message="No se encontraron productos que coincidan con tu búsqueda"
      />
    } @else {
      <ion-list>
        @for (product of filteredProducts(); track product.id) {
          <ion-item>
            <ion-label>{{ product.name }}</ion-label>
          </ion-item>
        }
      </ion-list>
    }
  `
})
export class ProductsComponent {
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  loading = signal(true);

  filters: SearchFilter[] = [
    { key: 'all', label: 'Todos', icon: 'apps', active: true },
    { key: 'available', label: 'Disponibles', icon: 'checkmark-circle', active: false },
    { key: 'out-of-stock', label: 'Sin Stock', icon: 'alert-circle', active: false }
  ];

  handleSearch(term: string) {
    let results = this.products();

    // Apply search
    if (term) {
      results = results.filter(p =>
        p.name.toLowerCase().includes(term.toLowerCase()) ||
        p.code.includes(term)
      );
    }

    // Apply filters
    const activeFilters = this.filters.filter(f => f.active);
    if (activeFilters.some(f => f.key === 'available')) {
      results = results.filter(p => p.stock > 0);
    }
    if (activeFilters.some(f => f.key === 'out-of-stock')) {
      results = results.filter(p => p.stock === 0);
    }

    this.filteredProducts.set(results);
  }

  handleFilterChange(filters: SearchFilter[]) {
    this.filters = filters;
    // Re-apply current search with new filters
    this.handleSearch(this.getSearchTerm());
  }

  handleClear() {
    this.filteredProducts.set(this.products());
  }
}
```

---

## 5. StatCardComponent - Ejemplos

### Card Simple
```html
<app-stat-card
  title="Ventas Totales"
  [value]="125000"
  prefix="₲"
  icon="cash-outline"
  iconColor="success"
/>
```

### Con Tendencia Positiva
```typescript
salesTrend: StatTrend = {
  value: 15.3,
  direction: 'up',
  label: 'vs mes anterior'
};
```

```html
<app-stat-card
  title="Ingresos"
  [value]="totalSales"
  prefix="₲"
  subtitle="Este mes"
  icon="trending-up"
  iconColor="success"
  [trend]="salesTrend"
  footerText="Actualizado hace 5 min"
/>
```

### Con Tendencia Negativa
```typescript
stockTrend: StatTrend = {
  value: -8.2,
  direction: 'down',
  label: 'vs semana anterior'
};
```

```html
<app-stat-card
  title="Stock Disponible"
  [value]="availableStock"
  suffix=" unidades"
  icon="cube-outline"
  iconColor="warning"
  [trend]="stockTrend"
/>
```

### Card Clickeable
```html
<app-stat-card
  title="Facturas Pendientes"
  [value]="12"
  icon="document-text-outline"
  iconColor="danger"
  [clickable]="true"
  (cardClick)="viewPendingInvoices()"
/>
```

### Dashboard Completo
```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatCardComponent, IonicModule],
  template: `
    <ion-content>
      <div class="stats-grid">
        <app-stat-card
          title="Ventas Hoy"
          [value]="stats().todaySales"
          prefix="₲"
          icon="cash-outline"
          iconColor="success"
          [trend]="{ value: 12.5, direction: 'up', label: 'vs ayer' }"
        />

        <app-stat-card
          title="Clientes Nuevos"
          [value]="stats().newCustomers"
          icon="people-outline"
          iconColor="primary"
          [trend]="{ value: 5.8, direction: 'up', label: 'esta semana' }"
        />

        <app-stat-card
          title="Productos Vendidos"
          [value]="stats().productsSold"
          suffix=" items"
          icon="cart-outline"
          iconColor="secondary"
        />

        <app-stat-card
          title="Stock Crítico"
          [value]="stats().lowStock"
          icon="alert-circle-outline"
          iconColor="danger"
          [clickable]="true"
          (cardClick)="viewLowStock()"
        />
      </div>
    </ion-content>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 8px;
      padding: 16px;
    }
  `]
})
export class DashboardComponent {
  stats = signal({
    todaySales: 1250000,
    newCustomers: 23,
    productsSold: 145,
    lowStock: 8
  });
}
```

### Con Colores Personalizados
```html
<app-stat-card
  title="Balance"
  [value]="balance"
  prefix="$"
  icon="wallet-outline"
  cardColor="primary"
  iconColor="light"
  valueColor="var(--ion-color-light)"
  [iconBackgroundColor]="'rgba(255, 255, 255, 0.2)'"
/>
```

---

## 6. SyncStatusComponent - Ejemplo

### Uso en Página de Configuración
```html
<ion-content>
  <ion-list>
    <ion-list-header>
      <ion-label>Sincronización</ion-label>
    </ion-list-header>

    <app-sync-status />

    <!-- Otras configuraciones -->
  </ion-list>
</ion-content>
```

---

## 7. OfflineIndicatorComponent - Ejemplos

### En Toolbar
```html
<ion-header>
  <ion-toolbar>
    <ion-title>Ventas</ion-title>
    <app-offline-indicator slot="end" />
  </ion-toolbar>
</ion-header>
```

### En Tab Bar
```html
<ion-tab-bar slot="bottom">
  <ion-tab-button tab="home">
    <ion-icon name="home" />
    <ion-label>Inicio</ion-label>
  </ion-tab-button>

  <ion-tab-button>
    <app-offline-indicator />
  </ion-tab-button>
</ion-tab-bar>
```

---

## Patrones de Uso Comunes

### Patrón: Lista con Estados
```typescript
@Component({
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Productos</ion-title>
        <app-offline-indicator slot="end" />
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <app-search-bar
        [filters]="filters"
        [showResultsCount]="true"
        [resultsCount]="filteredProducts().length"
        (search)="handleSearch($event)"
      />

      @if (loading()) {
        <app-loading variant="list" [count]="10" />
      } @else if (error()) {
        <app-error
          [error]="error()"
          [retryCallback]="loadProducts.bind(this)"
        />
      } @else if (filteredProducts().length === 0) {
        <app-empty-state
          icon="cube-outline"
          title="Sin productos"
          message="No se encontraron productos"
          [actionButton]="{
            label: 'Agregar Producto',
            icon: 'add',
            action: () => addProduct()
          }"
        />
      } @else {
        <ion-list>
          @for (product of filteredProducts(); track product.id) {
            <ion-item>
              <ion-label>{{ product.name }}</ion-label>
            </ion-item>
          }
        </ion-list>
      }
    </ion-content>
  `
})
```

### Patrón: Dashboard con Estadísticas
```typescript
@Component({
  template: `
    <ion-content>
      <div class="stats-section">
        <h2>Resumen de Hoy</h2>
        <div class="stats-grid">
          <app-stat-card
            title="Ventas"
            [value]="stats().sales"
            prefix="₲"
            icon="cash"
            iconColor="success"
            [trend]="salesTrend"
          />
          <!-- Más stats... -->
        </div>
      </div>

      <div class="sync-section">
        <h2>Sincronización</h2>
        <app-sync-status />
      </div>
    </ion-content>
  `
})
```

### Patrón: Detalle con Loading
```typescript
@Component({
  template: `
    @if (loading()) {
      <app-loading variant="detail" />
    } @else if (error()) {
      <app-error
        [error]="error()"
        [retryCallback]="loadDetail.bind(this)"
      />
    } @else {
      <!-- Contenido del detalle -->
    }
  `
})
```

## Tips y Best Practices

1. **Usa signals** para estado reactivo con los componentes
2. **Combina componentes** para crear experiencias completas
3. **Personaliza colores** según tu tema
4. **Usa loading skeletons** que coincidan con tu contenido real
5. **Proporciona callbacks** útiles en errores para mejor UX
6. **Implementa búsqueda con debounce** para mejor rendimiento
7. **Muestra estados vacíos** con acciones útiles para el usuario
8. **Usa stat cards** para métricas importantes y clickeables para navegación
