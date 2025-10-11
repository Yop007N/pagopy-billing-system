# @pago-py/shared-models

Librería compartida de modelos TypeScript para el sistema PagoPy.

## Descripción

Esta librería contiene interfaces, tipos y DTOs compartidos entre:
- Backend (NestJS)
- Frontend Web (Angular)
- Frontend Mobile (Ionic)

## Modelos Incluidos

### Enums
- `PaymentMethod`: CASH, TRANSFER, CARD
- `PaymentStatus`: PENDING, COMPLETED, FAILED
- `CustomerType`: CONSUMER, BUSINESS
- `UserRole`: ADMIN, VENDEDOR, CONTADOR
- `InvoiceStatus`: DRAFT, SENT, APPROVED, REJECTED, CANCELLED
- `SaleStatus`: PENDING, COMPLETED, CANCELLED

### Modelos
- **User**: Usuario del sistema con datos fiscales
- **Sale**: Venta con items, totales e información de facturación
- **Product**: Producto del catálogo
- **Customer**: Cliente (consumidor o empresa)
- **Invoice**: Factura electrónica (SET e-Kuatia)
- **Payment**: Pago asociado a una venta

## Uso

### En Backend (NestJS)
```typescript
import { Sale, CreateSaleDto, PaymentMethod } from '@pago-py/shared-models';

@Injectable()
export class SalesService {
  async create(dto: CreateSaleDto): Promise<Sale> {
    // Implementation
  }
}
```

### En Frontend (Angular/Ionic)
```typescript
import { Sale, User, PaymentStatus } from '@pago-py/shared-models';

export class SalesListComponent {
  sales: Sale[] = [];

  filterByStatus(status: PaymentStatus) {
    // Implementation
  }
}
```

## Beneficios

- ✅ Type safety completo entre apps
- ✅ Sin duplicación de código
- ✅ Refactoring seguro (cambios en un lugar)
- ✅ IntelliSense en todos los proyectos
- ✅ Validación en tiempo de compilación

## Actualización

Cuando modifiques un modelo, todos los proyectos que lo usen serán notificados por el compilador TypeScript.
