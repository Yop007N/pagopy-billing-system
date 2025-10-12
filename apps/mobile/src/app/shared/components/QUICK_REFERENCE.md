# Quick Reference - Componentes Compartidos

## Importación Rápida

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

## Cheat Sheet

### EmptyStateComponent
```html
<app-empty-state
  icon="cart-outline"
  title="Sin datos"
  message="No hay elementos"
  [actionButton]="{ label: 'Agregar', action: () => add() }"
/>
```

### LoadingComponent
```html
<app-loading variant="list" [count]="5" />
<!-- Variantes: list, card, detail, grid -->
```

### ErrorComponent
```html
<app-error
  error="Error message"
  [retryCallback]="retry.bind(this)"
/>
```

### SearchBarComponent
```html
<app-search-bar
  placeholder="Buscar..."
  [filters]="filters"
  [showResultsCount]="true"
  [resultsCount]="10"
  (search)="onSearch($event)"
  (filterChange)="onFilterChange($event)"
/>
```

### StatCardComponent
```html
<app-stat-card
  title="Ventas"
  [value]="125000"
  prefix="₲"
  icon="cash-outline"
  iconColor="success"
  [trend]="{ value: 15.3, direction: 'up' }"
/>
```

### SyncStatusComponent
```html
<app-sync-status />
```

### OfflineIndicatorComponent
```html
<app-offline-indicator slot="end" />
```

## Patrones Comunes

### Lista con Estados
```typescript
@if (loading()) {
  <app-loading variant="list" />
} @else if (error()) {
  <app-error [error]="error()" [retryCallback]="retry.bind(this)" />
} @else if (items().length === 0) {
  <app-empty-state title="Sin items" />
} @else {
  <!-- Lista -->
}
```

### Dashboard
```html
<div class="stats-grid">
  <app-stat-card title="Ventas" [value]="stats.sales" />
  <app-stat-card title="Clientes" [value]="stats.customers" />
</div>
```

### Header con Status
```html
<ion-toolbar>
  <ion-title>App</ion-title>
  <app-offline-indicator slot="end" />
</ion-toolbar>
```

## Tipos Comunes

```typescript
// SearchFilter
{ key: 'active', label: 'Activos', icon: 'checkmark', active: true }

// StatTrend
{ value: 15.3, direction: 'up', label: 'vs mes anterior' }

// EmptyStateButton
{ label: 'Agregar', icon: 'add', color: 'primary', action: () => {} }

// ErrorDetails
{ title: 'Error', message: 'Mensaje', code: 'ERR_CODE', statusCode: 500 }
```

## Props Más Usadas

| Component | Props Clave |
|-----------|-------------|
| EmptyState | icon, title, message, actionButton |
| Loading | variant, count, animated |
| Error | error, retryCallback, showRetry |
| SearchBar | placeholder, filters, debounceTime |
| StatCard | title, value, icon, trend, clickable |

## Tips

1. Usa `signals` para estado reactivo
2. `LoadingComponent` tiene 4 variantes
3. `ErrorComponent` acepta string, Error, o ErrorDetails
4. `SearchBarComponent` tiene debounce de 300ms por defecto
5. `StatCardComponent` formatea números automáticamente
6. Todos son **standalone components**
7. Usa `@if` / `@else` para estados condicionales

## Documentación Completa

- **README.md** - Documentación detallada
- **EXAMPLES.md** - Ejemplos prácticos
- **COMPONENT_SUMMARY.md** - Resumen completo
- **QUICK_REFERENCE.md** - Esta guía rápida
