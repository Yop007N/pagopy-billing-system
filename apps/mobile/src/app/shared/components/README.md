# Componentes Compartidos - PagoPy Mobile

Este directorio contiene componentes standalone reutilizables para la aplicación móvil de PagoPy.

## Componentes Disponibles

### 1. EmptyStateComponent

Componente para mostrar estados vacíos cuando no hay datos disponibles.

**Ubicación:** `apps/mobile/src/app/shared/components/empty-state/`

**Uso:**
```typescript
import { EmptyStateComponent, EmptyStateButton } from '@app/shared/components';

// En tu componente
const button: EmptyStateButton = {
  label: 'Agregar producto',
  icon: 'add-circle-outline',
  color: 'primary',
  action: () => this.navigateToAddProduct()
};
```

```html
<app-empty-state
  icon="cart-outline"
  iconColor="primary"
  title="No hay productos"
  message="Comienza agregando tu primer producto al inventario"
  [actionButton]="button"
/>
```

**Props:**
- `icon` (string): Nombre del icono de Ionicons (default: 'file-tray-outline')
- `iconColor` (string): Color del icono (default: 'medium')
- `title` (string): Título principal (default: 'No hay datos')
- `message` (string): Mensaje descriptivo
- `actionButton` (EmptyStateButton): Botón de acción opcional

**Features:**
- Standalone component
- Animación fade-in
- Slot para contenido personalizado
- Totalmente personalizable

---

### 2. LoadingComponent

Componente de skeleton loaders para diferentes tipos de contenido.

**Ubicación:** `apps/mobile/src/app/shared/components/loading/`

**Uso:**
```typescript
import { LoadingComponent } from '@app/shared/components';
```

```html
<!-- Lista -->
<app-loading variant="list" [count]="5" />

<!-- Tarjetas -->
<app-loading variant="card" [count]="3" />

<!-- Detalle -->
<app-loading variant="detail" />

<!-- Grid -->
<app-loading variant="grid" [count]="6" />
```

**Props:**
- `variant` ('list' | 'card' | 'detail' | 'grid'): Tipo de skeleton (default: 'list')
- `count` (number): Número de elementos a mostrar (default: 5)
- `animated` (boolean): Si las animaciones están activas (default: true)

**Variantes:**
- **list**: Lista vertical con thumbnail y múltiples líneas de texto
- **card**: Tarjetas con header y contenido
- **detail**: Vista detallada con filas de información e items
- **grid**: Grid responsivo de cards con imágenes

---

### 3. ErrorComponent

Componente para mostrar errores con opción de reintentar.

**Ubicación:** `apps/mobile/src/app/shared/components/error/`

**Uso:**
```typescript
import { ErrorComponent, ErrorDetails } from '@app/shared/components';

// Simple
```

```html
<app-error
  error="No se pudo cargar los datos"
  [retryCallback]="loadData.bind(this)"
/>
```

```typescript
// Avanzado
const errorDetails: ErrorDetails = {
  title: 'Error de red',
  message: 'No se pudo conectar con el servidor',
  code: 'ERR_NETWORK',
  statusCode: 500,
  timestamp: new Date()
};
```

```html
<app-error
  [error]="errorDetails"
  [retryCallback]="loadData.bind(this)"
  retryButtonText="Volver a intentar"
  [secondaryAction]="{
    label: 'Ir al inicio',
    icon: 'home-outline',
    callback: navigateHome.bind(this)
  }"
/>
```

**Props:**
- `error` (string | Error | ErrorDetails): Error a mostrar
- `retryCallback` (() => void | Promise<void>): Función a ejecutar al reintentar
- `showRetry` (boolean): Mostrar botón de reintentar (default: true)
- `retryButtonText` (string): Texto del botón (default: 'Reintentar')
- `retryButtonColor` (string): Color del botón (default: 'primary')
- `cardColor` (string): Color de la tarjeta (default: 'light')
- `iconColor` (string): Color del icono (default: 'danger')
- `errorIcon` (string): Icono a mostrar (default: 'alert-circle-outline')
- `defaultTitle` (string): Título por defecto
- `secondaryAction` (object): Acción secundaria opcional

**Events:**
- `retry`: Emitido cuando se hace clic en reintentar

**Features:**
- Soporta múltiples formatos de error
- Detalles colapsables (código, status, timestamp)
- Animación shake
- Botón de acción secundaria
- Estado de loading durante retry

---

### 4. SearchBarComponent

Barra de búsqueda con debounce y filtros opcionales.

**Ubicación:** `apps/mobile/src/app/shared/components/search-bar/`

**Uso:**
```typescript
import { SearchBarComponent, SearchFilter } from '@app/shared/components';

filters: SearchFilter[] = [
  { key: 'active', label: 'Activos', icon: 'checkmark-circle', active: true },
  { key: 'pending', label: 'Pendientes', icon: 'time-outline', active: false },
  { key: 'completed', label: 'Completados', icon: 'checkmark-done', active: false }
];

onSearch(term: string): void {
  console.log('Searching:', term);
  // Implementar lógica de búsqueda
}

onFilterChange(filters: SearchFilter[]): void {
  console.log('Active filters:', filters.filter(f => f.active));
  // Implementar lógica de filtrado
}
```

```html
<app-search-bar
  placeholder="Buscar productos..."
  [debounceTime]="300"
  [filters]="filters"
  [showResultsCount]="true"
  [resultsCount]="searchResults.length"
  (search)="onSearch($event)"
  (filterChange)="onFilterChange($event)"
  (clear)="onClear()"
/>
```

**Props:**
- `placeholder` (string): Texto del placeholder (default: 'Buscar...')
- `debounceTime` (number): Tiempo de debounce en ms (default: 300)
- `showClearButton` (string): Mostrar botón limpiar (default: 'focus')
- `animated` (boolean): Animación (default: true)
- `filters` (SearchFilter[]): Array de filtros opcionales
- `showActiveFiltersSummary` (boolean): Mostrar resumen de filtros activos (default: true)
- `showResultsCount` (boolean): Mostrar contador de resultados (default: false)
- `resultsCount` (number): Número de resultados encontrados

**Events:**
- `search` (string): Emitido cuando cambia el término de búsqueda
- `filterChange` (SearchFilter[]): Emitido cuando cambian los filtros
- `clear`: Emitido cuando se limpia la búsqueda

**Métodos Públicos:**
- `setSearchTerm(term: string)`: Establecer término programáticamente
- `getSearchTerm(): string`: Obtener término actual
- `getActiveFilters(): SearchFilter[]`: Obtener filtros activos

**Features:**
- Debounce configurable
- Filtros con chips interactivos
- Resumen de filtros activos
- Contador de resultados opcional
- Señales para estado reactivo

---

### 5. StatCardComponent

Tarjeta para mostrar estadísticas con icono, valor y tendencia.

**Ubicación:** `apps/mobile/src/app/shared/components/stat-card/`

**Uso:**
```typescript
import { StatCardComponent, StatTrend } from '@app/shared/components';

trend: StatTrend = {
  value: 15.3,
  direction: 'up',
  label: 'vs mes anterior'
};
```

```html
<!-- Simple -->
<app-stat-card
  title="Ventas Totales"
  [value]="125000"
  prefix="₲"
  icon="cash-outline"
  iconColor="success"
/>

<!-- Con tendencia -->
<app-stat-card
  title="Productos Vendidos"
  [value]="342"
  subtitle="Este mes"
  icon="cart-outline"
  iconColor="primary"
  [trend]="trend"
  footerText="Actualizado hace 5 minutos"
/>

<!-- Clickable -->
<app-stat-card
  title="Facturas Pendientes"
  [value]="12"
  icon="document-text-outline"
  iconColor="warning"
  [clickable]="true"
  (cardClick)="navigateToPendingInvoices()"
/>
```

**Props:**
- `title` (string): Título de la estadística
- `value` (string | number): Valor a mostrar
- `subtitle` (string): Subtítulo opcional
- `icon` (string): Icono de Ionicons (default: 'stats-chart-outline')
- `iconColor` (string): Color del icono (default: 'primary')
- `iconBackgroundColor` (string): Color de fondo del icono
- `cardColor` (string): Color de la tarjeta
- `valueColor` (string): Color del valor
- `prefix` (string): Prefijo del valor (ej: ₲, $)
- `suffix` (string): Sufijo del valor (ej: %, unidades)
- `trend` (StatTrend): Objeto de tendencia opcional
- `footerText` (string): Texto del pie de card
- `clickable` (boolean): Si la card es clickeable (default: false)
- `formatValue` (boolean): Formatear número con separadores (default: true)

**Events:**
- `cardClick`: Emitido cuando se hace clic (si clickable es true)

**Trend:**
```typescript
interface StatTrend {
  value: number;          // Porcentaje de cambio
  direction: 'up' | 'down' | 'neutral';
  label?: string;         // Ej: "vs mes anterior"
}
```

**Features:**
- Formateo automático de números (separadores de miles)
- Indicador de tendencia con iconos y colores
- Estado clickeable con animaciones
- Animaciones de entrada
- Totalmente personalizable

---

### 6. SyncStatusComponent (Mejorado)

Componente completo para mostrar el estado de sincronización.

**Ubicación:** `apps/mobile/src/app/shared/components/sync-status.component.ts`

**Uso:**
```html
<app-sync-status />
```

**Features:**
- Estado de red (online/offline)
- Estadísticas de sincronización (pendientes, sincronizados, errores)
- Última fecha de sincronización
- Progreso de sincronización en tiempo real
- Botones de acción (sincronizar ahora, reintentar errores)
- Iconos dinámicos basados en estado
- Integración completa con NetworkService y SyncService

---

### 7. OfflineIndicatorComponent (Mejorado)

Indicador compacto de estado de red y sincronización.

**Ubicación:** `apps/mobile/src/app/shared/components/offline-indicator.component.ts`

**Uso:**
```html
<!-- En el header o toolbar -->
<ion-toolbar>
  <ion-title>Mi App</ion-title>
  <app-offline-indicator slot="end" />
</ion-toolbar>
```

**Features:**
- Chips compactos con estado de red
- Contador de items pendientes
- Indicador de sincronización activa
- Badge de errores clickeable
- Animaciones de pulsación
- Auto-refresh de estado
- Integración con NetworkService y SyncService

---

## Importación

Puedes importar todos los componentes desde el barrel export:

```typescript
import {
  EmptyStateComponent,
  LoadingComponent,
  ErrorComponent,
  SearchBarComponent,
  StatCardComponent,
  SyncStatusComponent,
  OfflineIndicatorComponent
} from '@app/shared/components';
```

O importar individualmente:

```typescript
import { EmptyStateComponent } from '@app/shared/components/empty-state/empty-state.component';
```

## Características Comunes

Todos los componentes:
- Son **standalone** (no requieren módulos)
- Usan **Ionic components** para consistencia de UI
- Implementan **signals** para estado reactivo
- Incluyen **animaciones** suaves
- Son **totalmente tipados** con TypeScript
- Siguen las **mejores prácticas** de Angular

## Ejemplos de Uso Completo

### Dashboard con Estadísticas
```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatCardComponent, LoadingComponent],
  template: `
    @if (loading()) {
      <app-loading variant="grid" [count]="4" />
    } @else {
      <div class="stats-grid">
        <app-stat-card
          title="Ventas Hoy"
          [value]="stats().todaySales"
          prefix="₲"
          icon="cash-outline"
          iconColor="success"
          [trend]="{ value: 12.5, direction: 'up' }"
        />
        <!-- Más tarjetas... -->
      </div>
    }
  `
})
```

### Lista con Búsqueda y Estado Vacío
```typescript
@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [SearchBarComponent, EmptyStateComponent, LoadingComponent, ErrorComponent],
  template: `
    <app-search-bar
      [filters]="filters"
      (search)="onSearch($event)"
    />

    @if (loading()) {
      <app-loading variant="list" />
    } @else if (error()) {
      <app-error
        [error]="error()"
        [retryCallback]="loadProducts.bind(this)"
      />
    } @else if (products().length === 0) {
      <app-empty-state
        icon="cube-outline"
        title="No hay productos"
        message="No se encontraron productos que coincidan con tu búsqueda"
        [actionButton]="{
          label: 'Limpiar búsqueda',
          action: () => clearSearch()
        }"
      />
    } @else {
      <!-- Lista de productos -->
    }
  `
})
```

## Notas de Desarrollo

- Todos los componentes usan `@Input()` y `@Output()` para comunicación
- Las animaciones se pueden desactivar globalmente en estilos
- Los colores siguen el tema de Ionic (primary, secondary, success, etc.)
- Los iconos son de Ionicons (https://ionic.io/ionicons)
- Diseñados para ser responsivos y accesibles

## Contribuir

Al crear nuevos componentes compartidos:
1. Hazlos standalone
2. Usa signals para estado reactivo
3. Documenta props y events
4. Incluye ejemplos de uso
5. Añade al barrel export (index.ts)
6. Actualiza este README
