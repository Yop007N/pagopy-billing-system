# Shared Components Library

Global reusable UI components for the PagoPy web application.

## Components Overview

1. **LoadingSpinner** - Loading indicators with size variants
2. **EmptyState** - Empty state placeholders with customizable content
3. **StatusBadge** - Status indicators with predefined color schemes
4. **ActionButton** - Flexible button component with variants
5. **ConfirmDialog** - Confirmation dialogs using Material Dialog
6. **PageHeader** - Page headers with breadcrumbs and actions

---

## LoadingSpinner Component

A flexible loading spinner component with multiple size options and overlay support.

### Import

```typescript
import { LoadingSpinnerComponent } from '@app/shared/components';
```

### Usage

```html
<!-- Basic spinner -->
<app-loading-spinner></app-loading-spinner>

<!-- Small spinner with message -->
<app-loading-spinner
  size="small"
  message="Cargando datos...">
</app-loading-spinner>

<!-- Full-screen overlay -->
<app-loading-spinner
  size="large"
  message="Procesando..."
  [overlay]="true">
</app-loading-spinner>
```

### API

| Input     | Type                           | Default  | Description                    |
|-----------|--------------------------------|----------|--------------------------------|
| size      | 'small' \| 'medium' \| 'large' | 'medium' | Spinner size                   |
| message   | string                         | -        | Optional loading message       |
| overlay   | boolean                        | false    | Show as full-screen overlay    |

### Examples

```typescript
export class MyComponent {
  loading = true;

  loadData() {
    this.loading = true;
    this.service.getData().subscribe({
      next: () => this.loading = false,
      error: () => this.loading = false
    });
  }
}
```

```html
<app-loading-spinner
  *ngIf="loading"
  size="medium"
  message="Cargando ventas...">
</app-loading-spinner>
```

---

## EmptyState Component

Display empty state messages with icons and optional action buttons.

### Import

```typescript
import { EmptyStateComponent } from '@app/shared/components';
```

### Usage

```html
<!-- Basic empty state -->
<app-empty-state
  title="No hay productos"
  message="Comienza agregando tu primer producto">
</app-empty-state>

<!-- With custom icon and action -->
<app-empty-state
  icon="shopping_cart"
  title="Tu carrito está vacío"
  message="Agrega productos para comenzar una venta"
  actionLabel="Ver Productos"
  (action)="navigateToProducts()">
</app-empty-state>

<!-- Custom icon color -->
<app-empty-state
  icon="receipt"
  iconColor="#1976d2"
  title="No hay facturas"
  message="Las facturas generadas aparecerán aquí">
</app-empty-state>
```

### API

| Input/Output | Type            | Default                      | Description                    |
|--------------|-----------------|------------------------------|--------------------------------|
| @Input icon  | string          | 'inbox'                      | Material icon name             |
| @Input title | string          | 'No hay datos disponibles'   | Main title text                |
| @Input message | string        | -                            | Optional description text      |
| @Input actionLabel | string    | -                            | Action button label            |
| @Input iconColor | string      | 'rgba(0, 0, 0, 0.26)'        | Icon color (CSS color value)   |
| @Output action | EventEmitter  | -                            | Emits when action button clicked |

### Examples

```typescript
export class SalesListComponent {
  sales: Sale[] = [];

  navigateToNewSale() {
    this.router.navigate(['/sales/new']);
  }
}
```

```html
<div *ngIf="sales.length === 0; else salesList">
  <app-empty-state
    icon="point_of_sale"
    title="No hay ventas registradas"
    message="Comienza registrando tu primera venta"
    actionLabel="Nueva Venta"
    (action)="navigateToNewSale()">
  </app-empty-state>
</div>

<ng-template #salesList>
  <!-- Sales list content -->
</ng-template>
```

---

## StatusBadge Component

Display status indicators with predefined color schemes.

### Import

```typescript
import { StatusBadgeComponent, BadgeStatus } from '@app/shared/components';
```

### Usage

```html
<!-- Basic status badges -->
<app-status-badge status="success"></app-status-badge>
<app-status-badge status="warning"></app-status-badge>
<app-status-badge status="error"></app-status-badge>
<app-status-badge status="info"></app-status-badge>
<app-status-badge status="pending"></app-status-badge>

<!-- Custom label -->
<app-status-badge
  status="success"
  label="Pagado">
</app-status-badge>

<!-- Small size and square shape -->
<app-status-badge
  status="error"
  label="Rechazado"
  size="small"
  [rounded]="false">
</app-status-badge>
```

### API

| Input   | Type                                                | Default     | Description                    |
|---------|-----------------------------------------------------|-------------|--------------------------------|
| status  | 'success' \| 'warning' \| 'error' \| 'info' \| 'pending' \| 'default' | 'default' | Badge status type |
| label   | string                                              | Auto        | Custom badge label             |
| size    | 'small' \| 'medium'                                 | 'medium'    | Badge size                     |
| rounded | boolean                                             | true        | Use rounded corners            |

### Default Labels

- `success`: "Completado"
- `warning`: "Advertencia"
- `error`: "Error"
- `info`: "Información"
- `pending`: "Pendiente"
- `default`: "Estado"

### Examples

```typescript
export class PaymentListComponent {
  getPaymentStatus(payment: Payment): BadgeStatus {
    switch (payment.status) {
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'pending';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  }

  getPaymentLabel(payment: Payment): string {
    const labels = {
      'COMPLETED': 'Pagado',
      'PENDING': 'Pendiente',
      'FAILED': 'Fallido'
    };
    return labels[payment.status] || payment.status;
  }
}
```

```html
<app-status-badge
  [status]="getPaymentStatus(payment)"
  [label]="getPaymentLabel(payment)">
</app-status-badge>
```

---

## ActionButton Component

A flexible button component with multiple variants, sizes, and states.

### Import

```typescript
import { ActionButtonComponent, ButtonVariant, ButtonSize } from '@app/shared/components';
```

### Usage

```html
<!-- Basic buttons -->
<app-action-button
  label="Guardar"
  variant="primary">
</app-action-button>

<app-action-button
  label="Cancelar"
  variant="secondary">
</app-action-button>

<app-action-button
  label="Eliminar"
  variant="danger">
</app-action-button>

<!-- With icons -->
<app-action-button
  label="Nueva Venta"
  variant="success"
  icon="add"
  (clicked)="createNewSale()">
</app-action-button>

<app-action-button
  label="Exportar"
  variant="secondary"
  icon="download"
  iconPosition="right">
</app-action-button>

<!-- Loading state -->
<app-action-button
  label="Guardando..."
  variant="primary"
  [loading]="isSaving"
  [disabled]="!form.valid">
</app-action-button>

<!-- Sizes -->
<app-action-button label="Pequeño" size="small"></app-action-button>
<app-action-button label="Mediano" size="medium"></app-action-button>
<app-action-button label="Grande" size="large"></app-action-button>

<!-- Full width -->
<app-action-button
  label="Iniciar Sesión"
  variant="primary"
  [fullWidth]="true"
  type="submit">
</app-action-button>
```

### API

| Input/Output    | Type                                           | Default   | Description                    |
|-----------------|------------------------------------------------|-----------|--------------------------------|
| @Input variant  | 'primary' \| 'secondary' \| 'danger' \| 'success' \| 'text' | 'primary' | Button style variant |
| @Input size     | 'small' \| 'medium' \| 'large'                 | 'medium'  | Button size                    |
| @Input label    | string                                         | Required  | Button label text              |
| @Input icon     | string                                         | -         | Material icon name             |
| @Input iconPosition | 'left' \| 'right'                          | 'left'    | Icon position                  |
| @Input loading  | boolean                                        | false     | Show loading spinner           |
| @Input disabled | boolean                                        | false     | Disable button                 |
| @Input fullWidth | boolean                                       | false     | Full width button              |
| @Input type     | 'button' \| 'submit' \| 'reset'                | 'button'  | Button type attribute          |
| @Output clicked | EventEmitter<MouseEvent>                       | -         | Click event emitter            |

### Examples

```typescript
export class ProductFormComponent {
  saving = false;
  form: FormGroup;

  async saveProduct() {
    if (this.form.invalid) return;

    this.saving = true;
    try {
      await this.productService.save(this.form.value);
      this.router.navigate(['/products']);
    } finally {
      this.saving = false;
    }
  }
}
```

```html
<form [formGroup]="form" (ngSubmit)="saveProduct()">
  <!-- Form fields -->

  <div class="form-actions">
    <app-action-button
      label="Cancelar"
      variant="text"
      (clicked)="goBack()">
    </app-action-button>

    <app-action-button
      label="Guardar Producto"
      variant="primary"
      icon="save"
      type="submit"
      [loading]="saving"
      [disabled]="form.invalid">
    </app-action-button>
  </div>
</form>
```

---

## ConfirmDialog Component

A Material Dialog-based confirmation dialog with customizable content and types.

### Import

```typescript
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '@app/shared/components';
```

### Setup

The component uses `MatDialog`, so ensure your component has access to it:

```typescript
import { MatDialog } from '@angular/material/dialog';

export class MyComponent {
  constructor(private dialog: MatDialog) {}
}
```

### Usage

```typescript
// Basic confirmation
const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  data: {
    title: '¿Confirmar eliminación?',
    message: 'Esta acción no se puede deshacer.'
  }
});

dialogRef.afterClosed().subscribe(confirmed => {
  if (confirmed) {
    // User clicked confirm
    this.deleteItem();
  }
});

// Danger dialog
this.dialog.open(ConfirmDialogComponent, {
  data: {
    title: '¿Eliminar producto?',
    message: 'Se eliminará el producto permanentemente de tu inventario.',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    type: 'danger'
  }
}).afterClosed().subscribe(confirmed => {
  if (confirmed) {
    this.productService.delete(productId);
  }
});

// Info dialog
this.dialog.open(ConfirmDialogComponent, {
  data: {
    title: 'Información importante',
    message: 'Se enviará un correo de confirmación al cliente.',
    confirmText: 'Entendido',
    cancelText: 'Cerrar',
    type: 'info',
    icon: 'email'
  }
});

// Success confirmation
this.dialog.open(ConfirmDialogComponent, {
  data: {
    title: '¿Marcar como completado?',
    message: 'El pedido será marcado como completado y se notificará al cliente.',
    type: 'success'
  }
});
```

### API (ConfirmDialogData)

| Property    | Type                                    | Default      | Description                    |
|-------------|-----------------------------------------|--------------|--------------------------------|
| title       | string                                  | Required     | Dialog title                   |
| message     | string                                  | Required     | Dialog message/description     |
| confirmText | string                                  | 'Confirmar'  | Confirm button label           |
| cancelText  | string                                  | 'Cancelar'   | Cancel button label            |
| type        | 'warning' \| 'danger' \| 'info' \| 'success' | 'warning' | Dialog type (affects colors and icon) |
| icon        | string                                  | Auto         | Custom Material icon name      |

### Default Icons by Type

- `warning`: warning
- `danger`: error
- `info`: info
- `success`: check_circle

### Examples

```typescript
export class SaleDetailComponent {
  constructor(private dialog: MatDialog) {}

  confirmDelete(saleId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: '¿Eliminar venta?',
        message: 'Esta acción eliminará permanentemente la venta y no podrá recuperarse.',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.salesService.delete(saleId).subscribe({
          next: () => {
            this.snackBar.open('Venta eliminada exitosamente', 'Cerrar', {
              duration: 3000
            });
            this.router.navigate(['/sales']);
          },
          error: (error) => {
            this.snackBar.open('Error al eliminar la venta', 'Cerrar', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  confirmSubmitInvoice() {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: '¿Enviar factura a SET?',
        message: 'La factura será enviada al sistema SET para su aprobación.',
        confirmText: 'Enviar',
        type: 'info',
        icon: 'cloud_upload'
      }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.invoiceService.submitToSET(this.invoiceId);
      }
    });
  }
}
```

---

## PageHeader Component

A comprehensive page header component with breadcrumbs, back button, and action buttons.

### Import

```typescript
import { PageHeaderComponent, Breadcrumb } from '@app/shared/components';
```

### Usage

```html
<!-- Basic header -->
<app-page-header
  title="Lista de Productos">
</app-page-header>

<!-- With subtitle -->
<app-page-header
  title="Dashboard"
  subtitle="Resumen de ventas y estadísticas">
</app-page-header>

<!-- With breadcrumbs -->
<app-page-header
  title="Detalle de Venta"
  [breadcrumbs]="breadcrumbs">
</app-page-header>

<!-- With back button -->
<app-page-header
  title="Editar Producto"
  [showBackButton]="true"
  backRoute="/products">
</app-page-header>

<!-- With actions template -->
<app-page-header
  title="Productos"
  subtitle="Gestiona tu inventario"
  [actionsTemplate]="actions">
</app-page-header>

<ng-template #actions>
  <app-action-button
    label="Exportar"
    variant="secondary"
    icon="download"
    (clicked)="exportProducts()">
  </app-action-button>

  <app-action-button
    label="Nuevo Producto"
    variant="primary"
    icon="add"
    (clicked)="createProduct()">
  </app-action-button>
</ng-template>
```

### API

| Input           | Type            | Default | Description                         |
|-----------------|-----------------|---------|-------------------------------------|
| title           | string          | Required| Page title                          |
| subtitle        | string          | -       | Optional subtitle/description       |
| breadcrumbs     | Breadcrumb[]    | []      | Breadcrumb navigation items         |
| actionsTemplate | TemplateRef     | -       | Template for action buttons         |
| showBackButton  | boolean         | false   | Show back navigation button         |
| backRoute       | string          | -       | Route for back button (optional)    |

### Breadcrumb Interface

```typescript
interface Breadcrumb {
  label: string;    // Breadcrumb text
  route?: string;   // Optional route (if clickable)
  icon?: string;    // Optional Material icon
}
```

### Examples

```typescript
export class ProductDetailComponent {
  breadcrumbs: Breadcrumb[] = [
    { label: 'Inicio', route: '/dashboard', icon: 'home' },
    { label: 'Productos', route: '/products' },
    { label: 'Detalle' }
  ];

  product$ = this.route.params.pipe(
    switchMap(params => this.productService.getById(params['id']))
  );
}
```

```html
<app-page-header
  [title]="(product$ | async)?.name || 'Cargando...'"
  subtitle="Información detallada del producto"
  [breadcrumbs]="breadcrumbs"
  [showBackButton]="true"
  backRoute="/products"
  [actionsTemplate]="actions">
</app-page-header>

<ng-template #actions>
  <app-action-button
    label="Editar"
    variant="secondary"
    icon="edit"
    (clicked)="editProduct()">
  </app-action-button>

  <app-action-button
    label="Eliminar"
    variant="danger"
    icon="delete"
    (clicked)="deleteProduct()">
  </app-action-button>
</ng-template>
```

```typescript
export class SalesListComponent {
  breadcrumbs: Breadcrumb[] = [
    { label: 'Inicio', route: '/dashboard' },
    { label: 'Ventas' }
  ];

  exportSales() {
    this.salesService.export().subscribe(blob => {
      // Handle export
    });
  }

  createNewSale() {
    this.router.navigate(['/sales/new']);
  }
}
```

```html
<app-page-header
  title="Ventas"
  subtitle="Registro de todas las ventas realizadas"
  [breadcrumbs]="breadcrumbs"
  [actionsTemplate]="headerActions">
</app-page-header>

<ng-template #headerActions>
  <app-action-button
    label="Exportar"
    variant="text"
    icon="download"
    (clicked)="exportSales()">
  </app-action-button>

  <app-action-button
    label="Nueva Venta"
    variant="primary"
    icon="add"
    (clicked)="createNewSale()">
  </app-action-button>
</ng-template>
```

---

## Best Practices

### General

1. **Import from barrel file**: Always import from `@app/shared/components` index file
2. **Standalone components**: All components are standalone and can be imported directly
3. **Consistency**: Use these components consistently across the application
4. **Customization**: Leverage @Input properties for customization instead of creating variants

### LoadingSpinner

- Use `overlay` mode for full-screen operations
- Provide meaningful loading messages
- Consider using small spinners for inline loading states

### EmptyState

- Always provide helpful messages
- Include action buttons when users can add content
- Use appropriate icons that match the context

### StatusBadge

- Define a consistent status mapping for your domain models
- Use default labels or provide custom ones in Spanish
- Consider using small size in tables/lists

### ActionButton

- Use semantic variants (primary for main actions, danger for destructive actions)
- Always show loading state during async operations
- Disable buttons when forms are invalid
- Use icons to enhance button meaning

### ConfirmDialog

- Always use for destructive actions (delete, cancel, etc.)
- Choose appropriate dialog type (danger for destructive, warning for important, info for informational)
- Provide clear, concise messages
- Use custom button labels in Spanish

### PageHeader

- Include breadcrumbs for deep navigation
- Use back button for detail/edit pages
- Place primary actions in the header actions area
- Keep subtitles concise and informative

---

## File Structure

```
apps/web/src/app/shared/components/
├── action-button/
│   ├── action-button.component.ts
│   ├── action-button.component.html
│   └── action-button.component.scss
├── confirm-dialog/
│   ├── confirm-dialog.component.ts
│   ├── confirm-dialog.component.html
│   └── confirm-dialog.component.scss
├── empty-state/
│   ├── empty-state.component.ts
│   ├── empty-state.component.html
│   └── empty-state.component.scss
├── loading-spinner/
│   ├── loading-spinner.component.ts
│   ├── loading-spinner.component.html
│   └── loading-spinner.component.scss
├── page-header/
│   ├── page-header.component.ts
│   ├── page-header.component.html
│   └── page-header.component.scss
├── status-badge/
│   ├── status-badge.component.ts
│   ├── status-badge.component.html
│   └── status-badge.component.scss
├── index.ts
└── README.md
```

---

## TypeScript Path Mapping

To use the `@app` alias, ensure your `tsconfig.base.json` includes:

```json
{
  "compilerOptions": {
    "paths": {
      "@app/*": ["apps/web/src/app/*"]
    }
  }
}
```

Then import like this:

```typescript
import { LoadingSpinnerComponent, EmptyStateComponent } from '@app/shared/components';
```

Or with relative imports:

```typescript
import { LoadingSpinnerComponent } from '../../shared/components';
```

---

## Material Dependencies

These components require Angular Material modules. Ensure they are available in your application:

- `MatProgressSpinnerModule`
- `MatButtonModule`
- `MatIconModule`
- `MatDialogModule`

Install Angular Material if not already installed:

```bash
pnpm add @angular/material @angular/cdk
```

---

## Support

For issues or feature requests, contact the development team or create an issue in the project repository.
